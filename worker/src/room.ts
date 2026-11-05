import { DurableObject } from 'cloudflare:workers';
import {
  LIMITS,
  PING,
  PONG,
  applyAction,
  cleanName,
  createGame,
  findPlayer,
  nextColor,
  parseAction,
  secureDieRoll,
  upgradeGame,
  type Action,
  type ActionContext,
  type ActionError,
  type ClientMessage,
  type CreateSessionRequest,
  type EndReason,
  type GameState,
  type JoinRequest,
  type SeatCredentials,
  type ServerMessage,
  type SessionInfo,
} from '@level-goblin/shared';
import type { Env } from './env.ts';

interface Seat {
  token: string;
  /** Freed by the host, so someone can claim it from the join screen. */
  open: boolean;
}

interface StoredSession {
  game: GameState;
  seats: Record<string, Seat>;
  lastActiveAt: number;
}

const STORAGE_KEY = 'session';
const MAX_MESSAGE_LENGTH = 2048;
const MAX_MESSAGES_PER_SECOND = 40;
const ALARM_REFRESH_MS = 24 * 60 * 60 * 1000;

export type JoinResult = SeatCredentials | { error: ActionError | 'notFound' | 'seatTaken' };

/** One game session. All of its players connect to this single object. */
export class SessionRoom extends DurableObject<Env> {
  private session: StoredSession | null = null;
  private alarmSetAt = 0;
  private windowStart = 0;
  private windowCount = 0;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    // This also runs on each wake from hibernation, so memory is always restored.
    ctx.blockConcurrencyWhile(async () => {
      const stored = await ctx.storage.get<StoredSession>(STORAGE_KEY);
      this.session = stored ? { ...stored, game: upgradeGame(stored.game) } : null;
    });
    // Keeps connections alive without waking the object, so idle games cost nothing.
    ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair(PING, PONG));
  }

  private get ttl(): number {
    return Number(this.env.SESSION_TTL_MS);
  }

  private context(actorId: string | null): ActionContext {
    return { actorId, now: Date.now(), rollDie: secureDieRoll };
  }

  private async save(session: StoredSession): Promise<void> {
    const now = Date.now();
    session.lastActiveAt = now;
    this.session = session;
    await this.ctx.storage.put(STORAGE_KEY, session);
    // Each alarm write costs quota, so it is only refreshed about once a day.
    if (now - this.alarmSetAt > Math.min(ALARM_REFRESH_MS, this.ttl / 2)) {
      this.alarmSetAt = now;
      await this.ctx.storage.setAlarm(now + this.ttl);
    }
  }

  /** Only seated sockets. A refused socket has no tag and must never see the game. */
  private sockets(): WebSocket[] {
    return this.ctx
      .getWebSockets()
      .filter((ws) => ws.readyState === WebSocket.OPEN && this.ctx.getTags(ws).length > 0);
  }

  private socketsOf(playerId: string): WebSocket[] {
    return this.ctx.getWebSockets(playerId);
  }

  private broadcast(ignore?: WebSocket): void {
    const { session } = this;
    if (!session) return;
    const sockets = this.sockets().filter((ws) => ws !== ignore);
    const online = [...new Set(sockets.flatMap((ws) => this.ctx.getTags(ws)))];
    const openSeats = Object.keys(session.seats).filter((id) => session.seats[id]?.open);
    const message: ServerMessage = { t: 'state', state: session.game, online, openSeats };
    const text = JSON.stringify(message);
    for (const ws of sockets) {
      try {
        ws.send(text);
      } catch {
        // The socket died mid-send. Its close handler will tidy up.
      }
    }
  }

  async create(request: CreateSessionRequest): Promise<SeatCredentials | null> {
    if (this.session) return null;
    const playerId = crypto.randomUUID();
    const token = crypto.randomUUID();
    const game = createGame({
      hostId: playerId,
      editRights: request.editRights,
      winLevel: request.winLevel,
    });
    const seated = applyAction(
      game,
      { type: 'addPlayer', id: playerId, name: request.name, color: nextColor(game) },
      this.context(null),
    );
    if (!seated.ok) return null;
    await this.save({
      game: seated.state,
      seats: { [playerId]: { token, open: false } },
      lastActiveAt: Date.now(),
    });
    return { playerId, token };
  }

  info(): SessionInfo | null {
    const { session } = this;
    if (!session) return null;
    const isFull = session.game.players.length >= LIMITS.maxPlayers;
    const freedSeats = session.game.players.filter((player) => session.seats[player.id]?.open);
    // Someone who left needs a free chair to come back to. A freed seat is already one.
    const returning = isFull ? [] : session.game.departed;
    const openSeats = [...freedSeats, ...returning].map(({ id, name }) => ({ id, name }));
    return { isFull: isFull && openSeats.length === 0, openSeats };
  }

  async join(request: JoinRequest): Promise<JoinResult> {
    const { session } = this;
    if (!session) return { error: 'notFound' };
    const token = crypto.randomUUID();

    if ('seatId' in request) {
      const { seatId } = request;
      if (!session.seats[seatId]?.open) {
        const returned = applyAction(
          session.game,
          { type: 'returnPlayer', playerId: seatId },
          this.context(null),
        );
        if (!returned.ok) {
          return { error: returned.error === 'tableFull' ? 'tableFull' : 'seatTaken' };
        }
        session.game = returned.state;
      }
      session.seats[seatId] = { token, open: false };
      await this.save(session);
      this.broadcast();
      return { playerId: seatId, token };
    }

    const name = cleanName(request.name);
    if (name === null) return { error: 'invalidAction' };
    const playerId = crypto.randomUUID();
    const seated = applyAction(
      session.game,
      { type: 'addPlayer', id: playerId, name, color: nextColor(session.game) },
      this.context(null),
    );
    if (!seated.ok) return { error: seated.error };
    session.game = seated.state;
    session.seats[playerId] = { token, open: false };
    await this.save(session);
    this.broadcast();
    return { playerId, token };
  }

  private sendOff(ws: WebSocket, reason: EndReason): void {
    const message: ServerMessage = { t: 'ended', reason };
    try {
      ws.send(JSON.stringify(message));
      ws.close(1000, reason);
    } catch {
      // The socket is already gone, so there is nobody left to tell.
    }
  }

  /**
   * The socket is always accepted, even for a bad token, because a browser can't
   * read the HTTP status of a failed WebSocket. It gets an `ended` message instead.
   */
  override async fetch(request: Request): Promise<Response> {
    const { 0: client, 1: server } = new WebSocketPair();
    const token = new URL(request.url).searchParams.get('token');
    const { session } = this;
    const seatEntry = Object.entries(session?.seats ?? {}).find(
      ([, seat]) => seat.token === token && !seat.open,
    );

    this.ctx.acceptWebSocket(server, seatEntry ? [seatEntry[0]] : []);
    if (seatEntry) this.broadcast();
    else this.sendOff(server, session ? 'seatLost' : 'sessionEnded');

    return new Response(null, { status: 101, webSocket: client });
  }

  private isFlooded(): boolean {
    const now = Date.now();
    if (now - this.windowStart >= 1000) {
      this.windowStart = now;
      this.windowCount = 0;
    }
    this.windowCount += 1;
    return this.windowCount > MAX_MESSAGES_PER_SECOND;
  }

  private reject(ws: WebSocket, error: ActionError): void {
    const message: ServerMessage = { t: 'rejected', error };
    ws.send(JSON.stringify(message));
  }

  override async webSocketMessage(ws: WebSocket, raw: string | ArrayBuffer): Promise<void> {
    const { session } = this;
    const [playerId] = this.ctx.getTags(ws);
    if (!session || !playerId || typeof raw !== 'string') return;
    if (raw.length > MAX_MESSAGE_LENGTH || this.isFlooded()) return;

    let message: ClientMessage;
    try {
      message = JSON.parse(raw) as ClientMessage;
    } catch {
      return this.reject(ws, 'invalidAction');
    }

    switch (message?.t) {
      case 'action': {
        const action = parseAction(message.action);
        if (!action) return this.reject(ws, 'invalidAction');
        return this.runAction(ws, session, action, playerId);
      }
      case 'freeSeat':
        return this.freeSeat(ws, session, playerId, message.playerId);
      case 'claimHost':
        return this.claimHost(ws, session, playerId);
      case 'leave':
        return this.leave(session, playerId);
      case 'endSession':
        return this.endSession(ws, session, playerId);
      default:
        return this.reject(ws, 'invalidAction');
    }
  }

  private async runAction(
    ws: WebSocket,
    session: StoredSession,
    action: Action,
    playerId: string,
  ): Promise<void> {
    const result = applyAction(session.game, action, this.context(playerId));
    if (!result.ok) return this.reject(ws, result.error);
    if (result.state === session.game) return;
    session.game = result.state;

    if (action.type === 'removePlayer') {
      delete session.seats[action.playerId];
      for (const socket of this.socketsOf(action.playerId)) {
        this.sendOff(socket, 'seatLost');
      }
    }
    await this.save(session);
    this.broadcast();
  }

  private async freeSeat(
    ws: WebSocket,
    session: StoredSession,
    actorId: string,
    playerId: unknown,
  ): Promise<void> {
    if (actorId !== session.game.hostId) return this.reject(ws, 'forbidden');
    if (typeof playerId !== 'string' || !session.seats[playerId]) {
      return this.reject(ws, 'playerNotFound');
    }
    if (playerId === session.game.hostId) return this.reject(ws, 'hostCannotLeave');

    // A new token means the old phone can't get back in if it reappears.
    session.seats[playerId] = { token: crypto.randomUUID(), open: true };
    for (const socket of this.socketsOf(playerId)) this.sendOff(socket, 'seatLost');
    await this.save(session);
    this.broadcast();
  }

  /** Lets the table carry on if the host's phone dies. Only works while the host is away. */
  private async claimHost(
    ws: WebSocket,
    session: StoredSession,
    playerId: string,
  ): Promise<void> {
    const { hostId } = session.game;
    if (hostId === null || !findPlayer(session.game, playerId)) {
      return this.reject(ws, 'forbidden');
    }
    if (this.isOnline(hostId)) return this.reject(ws, 'forbidden');

    const result = applyAction(
      session.game,
      { type: 'transferHost', playerId },
      this.context(hostId),
    );
    if (!result.ok) return this.reject(ws, result.error);
    session.game = result.state;
    await this.save(session);
    this.broadcast();
  }

  private isOnline(playerId: string): boolean {
    return this.socketsOf(playerId).some((socket) => socket.readyState === WebSocket.OPEN);
  }

  /** Takes the player off the table. Their stats stay in `departed` for when they return. */
  private async leave(session: StoredSession, playerId: string): Promise<void> {
    const others = session.game.players.filter((player) => player.id !== playerId);
    if (others.length === 0) return this.destroy();

    let { game } = session;
    if (playerId === game.hostId) {
      const successor = others.find((player) => this.isOnline(player.id)) ?? others[0]!;
      const handedOver = applyAction(
        game,
        { type: 'transferHost', playerId: successor.id },
        this.context(playerId),
      );
      if (handedOver.ok) game = handedOver.state;
    }
    const left = applyAction(game, { type: 'removePlayer', playerId }, this.context(null));
    if (!left.ok) return;

    session.game = left.state;
    delete session.seats[playerId];
    for (const socket of this.socketsOf(playerId)) this.sendOff(socket, 'seatLost');
    await this.save(session);
    this.broadcast();
  }

  private async destroy(): Promise<void> {
    for (const socket of this.ctx.getWebSockets()) this.sendOff(socket, 'sessionEnded');
    this.session = null;
    await this.ctx.storage.deleteAlarm();
    await this.ctx.storage.deleteAll();
  }

  private async endSession(
    ws: WebSocket,
    session: StoredSession,
    playerId: string,
  ): Promise<void> {
    if (playerId !== session.game.hostId) return this.reject(ws, 'forbidden');
    await this.destroy();
  }

  override async webSocketClose(ws: WebSocket): Promise<void> {
    this.broadcast(ws);
  }

  override async webSocketError(ws: WebSocket): Promise<void> {
    this.broadcast(ws);
  }

  override async alarm(): Promise<void> {
    const { session } = this;
    if (!session) return;
    const expiresAt = session.lastActiveAt + this.ttl;
    if (Date.now() < expiresAt) {
      await this.ctx.storage.setAlarm(expiresAt);
      return;
    }
    await this.destroy();
  }
}
