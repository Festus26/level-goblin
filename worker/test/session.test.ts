import { afterEach, describe, expect, it } from 'vitest';
import {
  type Action,
  type ClientMessage,
  type CreateSessionResponse,
  type EditRights,
  type GameState,
  type SeatCredentials,
  type ServerMessage,
  type SessionInfo,
} from '@level-goblin/shared';
import { EXPIRY_PORT, MAIN_PORT, ORIGIN } from './setup.ts';

const base = (port: number) => `http://localhost:${port}`;
const headers = { Origin: ORIGIN, 'Content-Type': 'application/json' };
const open: Client[] = [];

class Client {
  messages: ServerMessage[] = [];
  private waiters: (() => void)[] = [];
  private socket: WebSocket;

  constructor(code: string, token: string, port = MAIN_PORT) {
    // Node's WebSocket accepts headers, which a browser sets on its own.
    const options = { headers: { Origin: ORIGIN } } as unknown as string[];
    this.socket = new WebSocket(`ws://localhost:${port}/sessions/${code}/ws?token=${token}`, options);
    this.socket.addEventListener('message', (event) => {
      if (event.data !== 'pong') this.messages.push(JSON.parse(String(event.data)));
      this.wake();
    });
    open.push(this);
  }

  private wake() {
    for (const waiter of this.waiters.splice(0)) waiter();
  }

  async until<T>(check: () => T | undefined | null | false, label: string): Promise<T> {
    const deadline = Date.now() + 5000;
    for (;;) {
      const value = check();
      if (value) return value;
      const left = deadline - Date.now();
      if (left <= 0) throw new Error(`Timed out waiting for ${label}`);
      await new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, left);
        this.waiters.push(() => {
          clearTimeout(timer);
          resolve();
        });
      });
    }
  }

  state(): Extract<ServerMessage, { t: 'state' }> | undefined {
    return this.messages.findLast((message) => message.t === 'state');
  }

  /** Waits for a state that passes the check. */
  stateWhere(check: (state: GameState) => boolean, label: string) {
    return this.until(() => {
      const latest = this.state();
      return latest && check(latest.state) ? latest : null;
    }, label);
  }

  rejection() {
    return this.until(
      () => this.messages.find((message) => message.t === 'rejected'),
      'a rejection',
    );
  }

  /** Resolves to why the server sent this phone away. */
  async ended() {
    const message = await this.until(
      () => this.messages.find((item) => item.t === 'ended'),
      'an ended message',
    );
    return message.t === 'ended' ? message.reason : null;
  }

  send(message: ClientMessage) {
    this.socket.send(JSON.stringify(message));
  }

  sendRaw(text: string) {
    this.socket.send(text);
  }

  act(action: Action) {
    this.send({ t: 'action', action });
  }

  close() {
    this.socket.close();
  }
}

async function createSession(editRights: EditRights = 'ownAndHost', port = MAIN_PORT) {
  const response = await fetch(`${base(port)}/sessions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: 'Ada', editRights, winLevel: 10 }),
  });
  expect(response.status).toBe(201);
  return (await response.json()) as CreateSessionResponse;
}

async function join(code: string, body: object) {
  return fetch(`${base(MAIN_PORT)}/sessions/${code}/join`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

async function seat(code: string, name: string) {
  const response = await join(code, { name });
  expect(response.status).toBe(201);
  return (await response.json()) as SeatCredentials;
}

async function table(editRights: EditRights = 'ownAndHost') {
  const host = await createSession(editRights);
  const bo = await seat(host.code, 'Bo');
  const ada = new Client(host.code, host.token);
  const boClient = new Client(host.code, bo.token);
  await ada.until(() => ada.state()?.online.length === 2, 'both players online');
  await boClient.until(() => boClient.state()?.online.length === 2, 'Bo to connect');
  return { host, bo, ada, boClient };
}

afterEach(() => {
  for (const client of open.splice(0)) client.close();
});

describe('creating and joining', () => {
  it('seats the creator as host', async () => {
    const host = await createSession();
    expect(host.code).toMatch(/^[A-HJKMNP-Z2-9]{5}$/);
    const ada = new Client(host.code, host.token);
    const { state } = await ada.until(() => ada.state(), 'first state');
    expect(state.hostId).toBe(host.playerId);
    expect(state.players.map((player) => player.name)).toEqual(['Ada']);
  });

  it('rejects bad create requests', async () => {
    for (const body of [
      { name: '', editRights: 'own' },
      { name: 'Ada', editRights: 'chaos' },
      { name: 'Ada', editRights: 'own', winLevel: 1000 },
      { name: 'x'.repeat(2000), editRights: 'own' },
    ]) {
      const response = await fetch(`${base(MAIN_PORT)}/sessions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      expect(response.status).toBe(400);
    }
  });

  it('gives each player a different color and tells the table', async () => {
    const { ada } = await table();
    const { state } = await ada.stateWhere((game) => game.players.length === 2, 'Bo seated');
    expect(new Set(state.players.map((player) => player.color)).size).toBe(2);
  });

  it('turns away the eleventh player', async () => {
    const host = await createSession();
    for (let i = 0; i < 9; i++) await seat(host.code, `P${i}`);
    const response = await join(host.code, { name: 'Late' });
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: 'tableFull' });
    const info = await fetch(`${base(MAIN_PORT)}/sessions/${host.code}`, { headers });
    expect(((await info.json()) as SessionInfo).isFull).toBe(true);
  });

  it('answers 404 for a session that does not exist', async () => {
    const info = await fetch(`${base(MAIN_PORT)}/sessions/ZZZZZ`, { headers });
    expect(info.status).toBe(404);
    expect((await join('ZZZZZ', { name: 'Bo' })).status).toBe(404);
  });
});

describe('who may connect', () => {
  it('blocks other sites', async () => {
    const response = await fetch(`${base(MAIN_PORT)}/sessions`, {
      method: 'POST',
      headers: { ...headers, Origin: 'https://evil.example' },
      body: '{}',
    });
    expect(response.status).toBe(403);
  });

  it('sends away a wrong token without showing it the game', async () => {
    const { host, bo, boClient } = await table();
    const stranger = new Client(host.code, 'wrong-token');
    expect(await stranger.ended()).toBe('seatLost');

    boClient.act({ type: 'changeLevel', playerId: bo.playerId, delta: 1 });
    await boClient.stateWhere(
      (state) => state.players.some((player) => player.level === 2),
      'a later change',
    );
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(stranger.messages.filter((message) => message.t === 'state')).toEqual([]);
  });

  it('sends away a socket for a session that does not exist', async () => {
    const client = new Client('ZZZZZ', 'any-token');
    expect(await client.ended()).toBe('sessionEnded');
  });
});

describe('playing', () => {
  it('sends every change to every player', async () => {
    const { bo, ada, boClient } = await table();
    boClient.act({ type: 'changeLevel', playerId: bo.playerId, delta: 2 });
    const check = (state: GameState) =>
      state.players.find((player) => player.id === bo.playerId)?.level === 3;
    await ada.stateWhere(check, 'Ada to see the change');
    await boClient.stateWhere(check, 'Bo to see the change');
  });

  it('enforces edit rights on the server', async () => {
    const { host, boClient } = await table('ownAndHost');
    boClient.act({ type: 'changeLevel', playerId: host.playerId, delta: 1 });
    expect(await boClient.rejection()).toEqual({ t: 'rejected', error: 'forbidden' });
  });

  it('lets the host edit others in ownAndHost, but not in own', async () => {
    const shared = await table('ownAndHost');
    shared.ada.act({ type: 'changeGear', playerId: shared.bo.playerId, delta: 1 });
    await shared.ada.stateWhere(
      (state) => state.players.some((player) => player.gear === 1),
      'the host edit',
    );

    const strict = await table('own');
    strict.ada.act({ type: 'changeGear', playerId: strict.bo.playerId, delta: 1 });
    expect(await strict.ada.rejection()).toMatchObject({ error: 'forbidden' });
  });

  it('never lets a player add seats or fake a die roll', async () => {
    const { boClient, ada } = await table('everyone');
    boClient.act({ type: 'addPlayer', id: 'fake', name: 'Fake', color: 'gold' });
    expect(await boClient.rejection()).toMatchObject({ error: 'forbidden' });

    boClient.send({ t: 'action', action: { type: 'rollDie', value: 6 } as Action });
    const { state } = await ada.stateWhere((game) => game.lastRoll !== null, 'a roll');
    expect(state.lastRoll?.value).toBeGreaterThanOrEqual(1);
    expect(state.lastRoll?.value).toBeLessThanOrEqual(6);
  });

  it('survives garbage messages', async () => {
    const { bo, boClient } = await table();
    boClient.sendRaw('not json');
    await boClient.rejection();
    boClient.sendRaw('null');
    boClient.sendRaw('{"t":"action","action":{"type":"changeLevel","delta":"lots"}}');
    boClient.sendRaw('x'.repeat(5000));
    boClient.act({ type: 'changeLevel', playerId: bo.playerId, delta: 1 });
    await boClient.stateWhere(
      (state) => state.players.some((player) => player.level === 2),
      'the game to keep working',
    );
  });

  it('answers ping without touching the game', async () => {
    const { boClient } = await table();
    const before = boClient.state()?.state.version;
    boClient.sendRaw('ping');
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(boClient.state()?.state.version).toBe(before);
  });
});

describe('losing and recovering seats', () => {
  it('rejoins with the same token and keeps stats', async () => {
    const { host, bo, ada, boClient } = await table();
    boClient.act({ type: 'changeLevel', playerId: bo.playerId, delta: 4 });
    await boClient.stateWhere(
      (state) => state.players.some((player) => player.level === 5),
      'the level change',
    );
    boClient.close();
    await ada.until(() => ada.state()?.online.length === 1, 'Bo to go offline');

    const back = new Client(host.code, bo.token);
    const { state } = await back.until(() => back.state(), 'a state after rejoining');
    expect(state.players.find((player) => player.id === bo.playerId)?.level).toBe(5);
    await ada.until(() => ada.state()?.online.length === 2, 'Bo to come back');
  });

  it('lets the host free a seat, and locks out the old phone', async () => {
    const { host, bo, ada, boClient } = await table();
    ada.send({ t: 'freeSeat', playerId: bo.playerId });
    expect(await boClient.ended()).toBe('seatLost');

    const info = await fetch(`${base(MAIN_PORT)}/sessions/${host.code}`, { headers });
    expect(((await info.json()) as SessionInfo).openSeats).toEqual([
      { id: bo.playerId, name: 'Bo' },
    ]);

    const oldPhone = new Client(host.code, bo.token);
    expect(await oldPhone.ended()).toBe('seatLost');

    const claimed = (await (await join(host.code, { seatId: bo.playerId })).json()) as SeatCredentials;
    expect(claimed.playerId).toBe(bo.playerId);
    const newPhone = new Client(host.code, claimed.token);
    await newPhone.until(() => newPhone.state(), 'the claimed seat to connect');

    expect((await join(host.code, { seatId: bo.playerId })).status).toBe(409);
  });

  it('does not let a non-host free seats', async () => {
    const { host, boClient } = await table();
    boClient.send({ t: 'freeSeat', playerId: host.playerId });
    expect(await boClient.rejection()).toMatchObject({ error: 'forbidden' });
  });

  it('disconnects a removed player and forgets their seat', async () => {
    const { host, bo, ada, boClient } = await table();
    ada.act({ type: 'removePlayer', playerId: bo.playerId });
    expect(await boClient.ended()).toBe('seatLost');
    const again = new Client(host.code, bo.token);
    expect(await again.ended()).toBe('seatLost');
  });

  it('lets a player take over only while the host is away', async () => {
    const { bo, ada, boClient } = await table();
    boClient.send({ t: 'claimHost' });
    expect(await boClient.rejection()).toMatchObject({ error: 'forbidden' });

    ada.close();
    await boClient.until(() => boClient.state()?.online.length === 1, 'the host to go');
    boClient.send({ t: 'claimHost' });
    await boClient.stateWhere((state) => state.hostId === bo.playerId, 'the new host');
  });
});

describe('leaving and joining mid-game', () => {
  it('lets someone join an ongoing game without disturbing it', async () => {
    const { host, bo, ada, boClient } = await table();
    boClient.act({ type: 'changeLevel', playerId: bo.playerId, delta: 3 });
    await ada.stateWhere((state) => state.players.some((p) => p.level === 4), 'the change');

    const cy = await seat(host.code, 'Cy');
    const { state } = await ada.stateWhere((game) => game.players.length === 3, 'Cy seated');
    expect(state.players.find((player) => player.id === bo.playerId)?.level).toBe(4);
    expect(state.players.find((player) => player.id === cy.playerId)?.level).toBe(1);
  });

  it('takes a leaver off the table, and they return with their stats', async () => {
    const { host, bo, ada, boClient } = await table();
    boClient.act({ type: 'changeLevel', playerId: bo.playerId, delta: 3 });
    await ada.stateWhere((state) => state.players.some((p) => p.level === 4), 'the change');

    boClient.send({ t: 'leave' });
    expect(await boClient.ended()).toBe('seatLost');
    await ada.stateWhere((state) => state.players.length === 1, 'Bo to leave');

    const info = await fetch(`${base(MAIN_PORT)}/sessions/${host.code}`, { headers });
    expect(((await info.json()) as SessionInfo).openSeats).toEqual([
      { id: bo.playerId, name: 'Bo' },
    ]);

    const returned = await join(host.code, { seatId: bo.playerId });
    expect(returned.status).toBe(201);
    const seatBack = (await returned.json()) as SeatCredentials;
    expect(seatBack.playerId).toBe(bo.playerId);
    const client = new Client(host.code, seatBack.token);
    const { state } = await client.until(() => client.state(), 'Bo to reconnect');
    expect(state.players.find((player) => player.id === bo.playerId)?.level).toBe(4);
  });

  it('locks out the old token after leaving', async () => {
    const { host, bo, boClient } = await table();
    boClient.send({ t: 'leave' });
    await boClient.ended();
    const again = new Client(host.code, bo.token);
    expect(await again.ended()).toBe('seatLost');
  });

  it('cannot take back a seat twice', async () => {
    const { host, bo, boClient } = await table();
    boClient.send({ t: 'leave' });
    await boClient.ended();
    expect((await join(host.code, { seatId: bo.playerId })).status).toBe(201);
    expect((await join(host.code, { seatId: bo.playerId })).status).toBe(409);
  });

  it('passes host to an online player when the host leaves', async () => {
    const { host, ada, boClient } = await table();
    const cy = await seat(host.code, 'Cy');
    const dee = await seat(host.code, 'Dee');
    const deeClient = new Client(host.code, dee.token);
    await deeClient.until(() => deeClient.state(), 'Dee to connect');
    boClient.close();
    await ada.until(() => ada.state()?.online.length === 2, 'Bo to go offline');

    ada.send({ t: 'leave' });
    await deeClient.stateWhere((state) => state.hostId === dee.playerId, 'Dee to become host');
    expect(cy.playerId).not.toBe(dee.playerId);
  });

  it('ends the session when the last player leaves', async () => {
    const host = await createSession();
    const ada = new Client(host.code, host.token);
    await ada.until(() => ada.state(), 'first state');
    ada.send({ t: 'leave' });
    expect(await ada.ended()).toBe('sessionEnded');
    const info = await fetch(`${base(MAIN_PORT)}/sessions/${host.code}`, { headers });
    expect(info.status).toBe(404);
  });

  it('ends a fight when the fighter leaves', async () => {
    const { bo, ada, boClient } = await table();
    boClient.act({ type: 'startCombat', fighterId: bo.playerId, monsterLevel: 3 });
    await ada.stateWhere((state) => state.combat !== null, 'the fight');
    boClient.send({ t: 'leave' });
    await ada.stateWhere((state) => state.combat === null, 'the fight to end');
  });

  it('hides a departed seat while the table is full', async () => {
    const host = await createSession();
    const bo = await seat(host.code, 'Bo');
    const client = new Client(host.code, bo.token);
    await client.until(() => client.state(), 'Bo to connect');
    client.send({ t: 'leave' });
    await client.ended();
    for (let i = 0; i < 9; i++) await seat(host.code, `P${i}`);

    const info = await fetch(`${base(MAIN_PORT)}/sessions/${host.code}`, { headers });
    expect(await info.json()).toEqual({ isFull: true, openSeats: [] });
    const response = await join(host.code, { seatId: bo.playerId });
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: 'tableFull' });
  });
});

describe('ending sessions', () => {
  it('lets only the host end the session, and then it is gone', async () => {
    const { host, ada, boClient } = await table();
    boClient.send({ t: 'endSession' });
    expect(await boClient.rejection()).toMatchObject({ error: 'forbidden' });

    ada.send({ t: 'endSession' });
    expect(await boClient.ended()).toBe('sessionEnded');
    const info = await fetch(`${base(MAIN_PORT)}/sessions/${host.code}`, { headers });
    expect(info.status).toBe(404);
  });

  it('deletes a session after it sits idle', async () => {
    const host = await createSession('own', EXPIRY_PORT);
    const url = `${base(EXPIRY_PORT)}/sessions/${host.code}`;
    expect((await fetch(url, { headers })).status).toBe(200);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    expect((await fetch(url, { headers })).status).toBe(404);
  });
});
