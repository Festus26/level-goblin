/** Who may change a player's level and gear. Chosen when a session is created. */
export type EditRights = 'own' | 'ownAndHost' | 'everyone';

export const PLAYER_COLORS = [
  'gold',
  'red',
  'green',
  'blue',
  'purple',
  'orange',
  'teal',
  'pink',
  'brown',
  'slate',
] as const;
export type PlayerColor = (typeof PLAYER_COLORS)[number];

export const LIMITS = {
  maxPlayers: 10,
  maxNameLength: 24,
  minLevel: 1,
  maxLevel: 99,
  minGear: -99,
  maxGear: 999,
  maxDelta: 20,
  minWinLevel: 2,
  maxWinLevel: 99,
  maxCombatValue: 999,
  maxLogEntries: 100,
} as const;

export const DEFAULT_WIN_LEVEL = 10;

export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  level: number;
  gear: number;
}

export interface Combat {
  fighterId: string;
  helperId: string | null;
  monsterLevel: number;
  /** One-shot bonuses. Either can be negative. */
  playerBonus: number;
  monsterBonus: number;
}

export interface DieRoll {
  value: number;
  playerId: string | null;
  at: number;
}

export type LogType =
  | 'join'
  | 'leave'
  | 'rename'
  | 'level'
  | 'gear'
  | 'undo'
  | 'roll'
  | 'turn'
  | 'combatStart'
  | 'combatEnd'
  | 'host'
  | 'rights'
  | 'winLevel'
  | 'win';

/**
 * Log entries hold data, not sentences, so each phone can show them in its own
 * language. Names are copied in so entries still read well after a player leaves.
 */
export interface LogEntry {
  id: number;
  at: number;
  type: LogType;
  /** Null when the shared table device or the server made the change. */
  actorName: string | null;
  playerId: string | null;
  playerName: string | null;
  /** Level or gear change, die result, or new win level, depending on `type`. */
  value: number | null;
  /** Which stat an `undo` entry reverted. */
  stat: 'level' | 'gear' | null;
  undone: boolean;
}

export interface GameState {
  /** Goes up by one on every accepted action. */
  version: number;
  nextLogId: number;
  /** Null in one-phone mode, where the shared device has every right. */
  hostId: string | null;
  editRights: EditRights;
  winLevel: number;
  winnerId: string | null;
  players: Player[];
  turnPlayerId: string | null;
  combat: Combat | null;
  lastRoll: DieRoll | null;
  /** Oldest first, trimmed to LIMITS.maxLogEntries. */
  log: LogEntry[];
}

export type Action =
  | { type: 'addPlayer'; id: string; name: string; color: PlayerColor }
  | { type: 'removePlayer'; playerId: string }
  | { type: 'updatePlayer'; playerId: string; name?: string; color?: PlayerColor }
  | { type: 'changeLevel'; playerId: string; delta: number }
  | { type: 'changeGear'; playerId: string; delta: number }
  | { type: 'undo'; logId: number }
  | { type: 'rollDie' }
  | { type: 'nextTurn' }
  | { type: 'setTurn'; playerId: string }
  | { type: 'startCombat'; fighterId: string; monsterLevel: number }
  | {
      type: 'updateCombat';
      helperId?: string | null;
      monsterLevel?: number;
      playerBonus?: number;
      monsterBonus?: number;
    }
  | { type: 'endCombat' }
  | { type: 'setEditRights'; editRights: EditRights }
  | { type: 'setWinLevel'; winLevel: number }
  | { type: 'transferHost'; playerId: string };

export type ActionError =
  | 'invalidAction'
  | 'forbidden'
  | 'playerNotFound'
  | 'duplicatePlayer'
  | 'tableFull'
  | 'hostCannotLeave'
  | 'noCombat'
  | 'combatInProgress'
  | 'cannotUndo';

export type ActionResult =
  | { ok: true; state: GameState }
  | { ok: false; error: ActionError };

/** Everything `applyAction` needs from outside, which keeps it a pure function. */
export interface ActionContext {
  /** The acting player, or null for the shared table device or the server itself. */
  actorId: string | null;
  now: number;
  /** Returns a whole number from 1 to 6. */
  rollDie: () => number;
}
