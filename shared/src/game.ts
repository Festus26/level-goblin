import {
  DEFAULT_WIN_LEVEL,
  LIMITS,
  type Action,
  type ActionContext,
  type ActionError,
  type ActionResult,
  type EditRights,
  type GameState,
  type LogEntry,
  type Player,
} from './types.ts';

export interface NewGameOptions {
  hostId?: string | null;
  editRights?: EditRights;
  winLevel?: number;
}

export function createGame(options: NewGameOptions = {}): GameState {
  return {
    version: 0,
    nextLogId: 1,
    hostId: options.hostId ?? null,
    editRights: options.editRights ?? 'ownAndHost',
    winLevel: options.winLevel ?? DEFAULT_WIN_LEVEL,
    winnerId: null,
    players: [],
    turnPlayerId: null,
    combat: null,
    lastRoll: null,
    log: [],
  };
}

export const strength = (player: Player): number => player.level + player.gear;

export const findPlayer = (state: GameState, id: string | null): Player | undefined =>
  state.players.find((player) => player.id === id);

const isHostOrTable = (state: GameState, actorId: string | null): boolean =>
  actorId === null || actorId === state.hostId;

/** Whether the actor may change this player's level and gear. */
export function canEditPlayer(
  state: GameState,
  actorId: string | null,
  playerId: string,
): boolean {
  if (actorId === null) return true;
  if (!findPlayer(state, actorId)) return false;
  switch (state.editRights) {
    case 'everyone':
      return true;
    case 'ownAndHost':
      return actorId === playerId || actorId === state.hostId;
    case 'own':
      return actorId === playerId;
  }
}

export interface CombatResult {
  playerTotal: number;
  monsterTotal: number;
  /** The players must beat the monster outright, so a tie goes to the monster. */
  playersWin: boolean;
}

export function combatResult(state: GameState): CombatResult | null {
  const { combat } = state;
  if (!combat) return null;
  const fighter = findPlayer(state, combat.fighterId);
  const helper = findPlayer(state, combat.helperId);
  const playerTotal =
    (fighter ? strength(fighter) : 0) +
    (helper ? strength(helper) : 0) +
    combat.playerBonus;
  const monsterTotal = combat.monsterLevel + combat.monsterBonus;
  return { playerTotal, monsterTotal, playersWin: playerTotal > monsterTotal };
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const fail = (error: ActionError): ActionResult => ({ ok: false, error });

type LogDetails = Partial<Pick<LogEntry, 'value' | 'stat'>> & {
  player?: Player | undefined;
};

function addLog(
  state: GameState,
  ctx: ActionContext,
  type: LogEntry['type'],
  details: LogDetails = {},
): GameState {
  const entry: LogEntry = {
    id: state.nextLogId,
    at: ctx.now,
    type,
    actorName: findPlayer(state, ctx.actorId)?.name ?? null,
    playerId: details.player?.id ?? null,
    playerName: details.player?.name ?? null,
    value: details.value ?? null,
    stat: details.stat ?? null,
    undone: false,
  };
  return {
    ...state,
    nextLogId: state.nextLogId + 1,
    log: [...state.log, entry].slice(-LIMITS.maxLogEntries),
  };
}

const replacePlayer = (state: GameState, updated: Player): GameState => ({
  ...state,
  players: state.players.map((player) => (player.id === updated.id ? updated : player)),
});

/** Keeps `winnerId` correct after a level or win-level change. */
function refreshWinner(
  state: GameState,
  ctx: ActionContext,
  changedId: string | null,
): GameState {
  const current = findPlayer(state, state.winnerId);
  if (current && current.level >= state.winLevel) return state;

  const reached = state.players.filter((player) => player.level >= state.winLevel);
  const winner = reached.find((player) => player.id === changedId) ?? reached[0];
  if (!winner) return state.winnerId === null ? state : { ...state, winnerId: null };
  return addLog({ ...state, winnerId: winner.id }, ctx, 'win', { player: winner });
}

function applyStatChange(
  state: GameState,
  player: Player,
  stat: 'level' | 'gear',
  delta: number,
): { state: GameState; applied: number } {
  const before = player[stat];
  const after =
    stat === 'level'
      ? clamp(before + delta, LIMITS.minLevel, LIMITS.maxLevel)
      : clamp(before + delta, LIMITS.minGear, LIMITS.maxGear);
  return {
    state: replacePlayer(state, { ...player, [stat]: after }),
    applied: after - before,
  };
}

/** Finds the next player after `currentId`, wrapping around the table. */
function playerAfter(players: Player[], currentId: string | null): string | null {
  if (players.length === 0) return null;
  const index = players.findIndex((player) => player.id === currentId);
  return players[(index + 1) % players.length]?.id ?? null;
}

function reduce(state: GameState, action: Action, ctx: ActionContext): ActionResult {
  const { actorId } = ctx;
  // Every action except adding a seat must come from someone sitting at the table.
  if (actorId !== null && !findPlayer(state, actorId)) return fail('forbidden');

  switch (action.type) {
    case 'addPlayer': {
      // Players join through the server, which seats them itself.
      if (actorId !== null) return fail('forbidden');
      if (state.players.length >= LIMITS.maxPlayers) return fail('tableFull');
      if (findPlayer(state, action.id)) return fail('duplicatePlayer');
      const player: Player = {
        id: action.id,
        name: action.name,
        color: action.color,
        level: LIMITS.minLevel,
        gear: 0,
      };
      const next: GameState = {
        ...state,
        players: [...state.players, player],
        turnPlayerId: state.turnPlayerId ?? player.id,
      };
      return { ok: true, state: addLog(next, ctx, 'join', { player }) };
    }

    case 'removePlayer': {
      if (!isHostOrTable(state, actorId)) return fail('forbidden');
      const player = findPlayer(state, action.playerId);
      if (!player) return fail('playerNotFound');
      if (player.id === state.hostId) return fail('hostCannotLeave');

      const remaining = state.players.filter((other) => other.id !== player.id);
      const turnPlayerId =
        state.turnPlayerId === player.id
          ? playerAfter(state.players, player.id)
          : state.turnPlayerId;

      let combat = state.combat;
      if (combat?.fighterId === player.id) combat = null;
      else if (combat?.helperId === player.id) combat = { ...combat, helperId: null };

      const next: GameState = {
        ...state,
        players: remaining,
        turnPlayerId: turnPlayerId === player.id ? null : turnPlayerId,
        combat,
        winnerId: state.winnerId === player.id ? null : state.winnerId,
      };
      return {
        ok: true,
        state: refreshWinner(addLog(next, ctx, 'leave', { player }), ctx, null),
      };
    }

    case 'updatePlayer': {
      const player = findPlayer(state, action.playerId);
      if (!player) return fail('playerNotFound');
      if (!canEditPlayer(state, actorId, player.id)) return fail('forbidden');
      const updated: Player = {
        ...player,
        name: action.name ?? player.name,
        color: action.color ?? player.color,
      };
      const next = replacePlayer(state, updated);
      return {
        ok: true,
        state:
          updated.name === player.name
            ? next
            : addLog(next, ctx, 'rename', { player: updated }),
      };
    }

    case 'changeLevel':
    case 'changeGear': {
      const player = findPlayer(state, action.playerId);
      if (!player) return fail('playerNotFound');
      if (!canEditPlayer(state, actorId, player.id)) return fail('forbidden');
      const stat = action.type === 'changeLevel' ? 'level' : 'gear';
      const result = applyStatChange(state, player, stat, action.delta);
      // Pressing minus at level 1 changes nothing, so it should not fill the log.
      if (result.applied === 0) return { ok: true, state };
      const logged = addLog(result.state, ctx, stat, { player, value: result.applied });
      return { ok: true, state: refreshWinner(logged, ctx, player.id) };
    }

    case 'undo': {
      const entry = state.log.find((item) => item.id === action.logId);
      if (!entry || entry.undone) return fail('cannotUndo');
      if ((entry.type !== 'level' && entry.type !== 'gear') || entry.value === null) {
        return fail('cannotUndo');
      }
      const player = findPlayer(state, entry.playerId);
      if (!player) return fail('cannotUndo');
      if (!canEditPlayer(state, actorId, player.id)) return fail('forbidden');

      const result = applyStatChange(state, player, entry.type, -entry.value);
      const marked: GameState = {
        ...result.state,
        log: result.state.log.map((item) =>
          item.id === entry.id ? { ...item, undone: true } : item,
        ),
      };
      const logged = addLog(marked, ctx, 'undo', {
        player,
        value: result.applied,
        stat: entry.type,
      });
      return { ok: true, state: refreshWinner(logged, ctx, player.id) };
    }

    case 'rollDie': {
      const value = ctx.rollDie();
      const roller = findPlayer(state, actorId);
      const next: GameState = {
        ...state,
        lastRoll: { value, playerId: actorId, at: ctx.now },
      };
      return { ok: true, state: addLog(next, ctx, 'roll', { player: roller, value }) };
    }

    case 'nextTurn':
    case 'setTurn': {
      const canMoveTurn =
        isHostOrTable(state, actorId) ||
        state.editRights === 'everyone' ||
        actorId === state.turnPlayerId;
      if (!canMoveTurn) return fail('forbidden');

      const targetId =
        action.type === 'setTurn'
          ? action.playerId
          : playerAfter(state.players, state.turnPlayerId);
      const player = findPlayer(state, targetId);
      if (!player) return fail('playerNotFound');
      return {
        ok: true,
        state: addLog({ ...state, turnPlayerId: player.id }, ctx, 'turn', { player }),
      };
    }

    case 'startCombat': {
      if (state.combat) return fail('combatInProgress');
      const fighter = findPlayer(state, action.fighterId);
      if (!fighter) return fail('playerNotFound');
      const next: GameState = {
        ...state,
        combat: {
          fighterId: fighter.id,
          helperId: null,
          monsterLevel: action.monsterLevel,
          playerBonus: 0,
          monsterBonus: 0,
        },
      };
      return {
        ok: true,
        state: addLog(next, ctx, 'combatStart', {
          player: fighter,
          value: action.monsterLevel,
        }),
      };
    }

    // Anyone seated may touch the fight, because meddling is part of the game.
    case 'updateCombat': {
      if (!state.combat) return fail('noCombat');
      const { helperId } = action;
      if (helperId !== undefined && helperId !== null) {
        if (!findPlayer(state, helperId)) return fail('playerNotFound');
        if (helperId === state.combat.fighterId) return fail('invalidAction');
      }
      return {
        ok: true,
        state: {
          ...state,
          combat: {
            ...state.combat,
            helperId: helperId === undefined ? state.combat.helperId : helperId,
            monsterLevel: action.monsterLevel ?? state.combat.monsterLevel,
            playerBonus: action.playerBonus ?? state.combat.playerBonus,
            monsterBonus: action.monsterBonus ?? state.combat.monsterBonus,
          },
        },
      };
    }

    case 'endCombat': {
      if (!state.combat) return fail('noCombat');
      const fighter = findPlayer(state, state.combat.fighterId);
      return {
        ok: true,
        state: addLog({ ...state, combat: null }, ctx, 'combatEnd', { player: fighter }),
      };
    }

    case 'setEditRights': {
      if (!isHostOrTable(state, actorId)) return fail('forbidden');
      if (action.editRights === state.editRights) return { ok: true, state };
      return {
        ok: true,
        state: addLog({ ...state, editRights: action.editRights }, ctx, 'rights'),
      };
    }

    case 'setWinLevel': {
      if (!isHostOrTable(state, actorId)) return fail('forbidden');
      const next = addLog({ ...state, winLevel: action.winLevel }, ctx, 'winLevel', {
        value: action.winLevel,
      });
      return { ok: true, state: refreshWinner(next, ctx, null) };
    }

    case 'transferHost': {
      if (actorId !== state.hostId) return fail('forbidden');
      const player = findPlayer(state, action.playerId);
      if (!player) return fail('playerNotFound');
      return {
        ok: true,
        state: addLog({ ...state, hostId: player.id }, ctx, 'host', { player }),
      };
    }
  }
}

/**
 * The single home of the game rules. The server runs it for online sessions and
 * the browser runs it for one-phone mode. `action` must already be validated.
 */
export function applyAction(
  state: GameState,
  action: Action,
  ctx: ActionContext,
): ActionResult {
  const result = reduce(state, action, ctx);
  if (!result.ok) return result;
  // Actions that changed nothing keep their version, so clients skip a re-render.
  if (result.state === state) return result;
  return { ok: true, state: { ...result.state, version: state.version + 1 } };
}
