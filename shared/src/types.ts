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
  maxMonsters: 10,
  maxLogEntries: 100,
  maxDeparted: 20,
} as const;

export const DEFAULT_WIN_LEVEL = 10;

export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  avatar: string;
  level: number;
  gear: number;
}

export interface Monster {
  id: number;
  level: number;
  /** One-shot bonus for this monster. Can be negative. */
  bonus: number;
}

export interface Combat {
  fighterId: string;
  helperId: string | null;
  /** One-shot bonus for the players. Can be negative. */
  playerBonus: number;
  /** Always holds at least one monster. */
  monsters: Monster[];
  nextMonsterId: number;
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
  | 'combatMonsters'
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
  playerAvatar: string | null;
  /** Level or gear change, die result, monster count or win level, depending on `type`. */
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
  /** Players who left, kept so they can come back with their stats. */
  departed: Player[];
  turnPlayerId: string | null;
  combat: Combat | null;
  lastRoll: DieRoll | null;
  /** Oldest first, trimmed to LIMITS.maxLogEntries. */
  log: LogEntry[];
}

export type Action =
  | { type: 'addPlayer'; id: string; name: string; color: PlayerColor; avatar?: string }
  | { type: 'removePlayer'; playerId: string }
  | { type: 'returnPlayer'; playerId: string }
  | { type: 'updatePlayer'; playerId: string; name?: string; color?: PlayerColor; avatar?: string }
  | { type: 'changeLevel'; playerId: string; delta: number }
  | { type: 'changeGear'; playerId: string; delta: number }
  | { type: 'undo'; logId: number }
  | { type: 'rollDie' }
  | { type: 'nextTurn' }
  | { type: 'setTurn'; playerId: string }
  | { type: 'startCombat'; fighterId: string; monsterLevel: number }
  | { type: 'updateCombat'; helperId?: string | null; playerBonus?: number }
  | { type: 'addMonster' }
  | { type: 'removeMonster'; monsterId: number }
  | { type: 'changeMonster'; monsterId: number; stat: 'level' | 'bonus'; delta: number }
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
  | 'monsterNotFound'
  | 'tooManyMonsters'
  | 'lastMonster'
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
