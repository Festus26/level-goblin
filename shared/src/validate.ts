import { LIMITS, PLAYER_COLORS, type Action, type EditRights, type PlayerColor } from './types.ts';

type Input = Record<string, unknown>;

const isObject = (value: unknown): value is Input =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isId = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0 && value.length <= 64;

const isIntIn = (value: unknown, min: number, max: number): value is number =>
  Number.isInteger(value) && (value as number) >= min && (value as number) <= max;

const isDelta = (value: unknown): value is number =>
  isIntIn(value, -LIMITS.maxDelta, LIMITS.maxDelta) && value !== 0;

const isCombatValue = (value: unknown): value is number =>
  isIntIn(value, -LIMITS.maxCombatValue, LIMITS.maxCombatValue);

const isColor = (value: unknown): value is PlayerColor =>
  PLAYER_COLORS.includes(value as PlayerColor);

const isEditRights = (value: unknown): value is EditRights =>
  value === 'own' || value === 'ownAndHost' || value === 'everyone';

/** Trims a display name and returns null if it is empty or too long. */
export function cleanName(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const name = value.replace(/\s+/g, ' ').trim();
  if (name.length === 0 || [...name].length > LIMITS.maxNameLength) return null;
  return name;
}

/**
 * Turns untrusted input into a known action, or null if anything about it is wrong.
 * Builds a fresh object, so unexpected extra fields never reach the game rules.
 */
export function parseAction(input: unknown): Action | null {
  if (!isObject(input)) return null;

  switch (input.type) {
    case 'addPlayer': {
      const name = cleanName(input.name);
      if (!isId(input.id) || name === null || !isColor(input.color)) return null;
      return { type: 'addPlayer', id: input.id, name, color: input.color };
    }

    case 'removePlayer':
      return isId(input.playerId)
        ? { type: 'removePlayer', playerId: input.playerId }
        : null;

    case 'updatePlayer': {
      if (!isId(input.playerId)) return null;
      const action: Extract<Action, { type: 'updatePlayer' }> = {
        type: 'updatePlayer',
        playerId: input.playerId,
      };
      if (input.name !== undefined) {
        const name = cleanName(input.name);
        if (name === null) return null;
        action.name = name;
      }
      if (input.color !== undefined) {
        if (!isColor(input.color)) return null;
        action.color = input.color;
      }
      return action;
    }

    case 'changeLevel':
    case 'changeGear':
      return isId(input.playerId) && isDelta(input.delta)
        ? { type: input.type, playerId: input.playerId, delta: input.delta }
        : null;

    case 'undo':
      return isIntIn(input.logId, 1, Number.MAX_SAFE_INTEGER)
        ? { type: 'undo', logId: input.logId }
        : null;

    case 'rollDie':
    case 'nextTurn':
    case 'endCombat':
      return { type: input.type };

    case 'setTurn':
      return isId(input.playerId) ? { type: 'setTurn', playerId: input.playerId } : null;

    case 'startCombat':
      return isId(input.fighterId) && isCombatValue(input.monsterLevel)
        ? {
            type: 'startCombat',
            fighterId: input.fighterId,
            monsterLevel: input.monsterLevel,
          }
        : null;

    case 'updateCombat': {
      const action: Extract<Action, { type: 'updateCombat' }> = { type: 'updateCombat' };
      if (input.helperId !== undefined) {
        if (input.helperId !== null && !isId(input.helperId)) return null;
        action.helperId = input.helperId;
      }
      for (const key of ['monsterLevel', 'playerBonus', 'monsterBonus'] as const) {
        const value = input[key];
        if (value === undefined) continue;
        if (!isCombatValue(value)) return null;
        action[key] = value;
      }
      return action;
    }

    case 'setEditRights':
      return isEditRights(input.editRights)
        ? { type: 'setEditRights', editRights: input.editRights }
        : null;

    case 'setWinLevel':
      return isIntIn(input.winLevel, LIMITS.minWinLevel, LIMITS.maxWinLevel)
        ? { type: 'setWinLevel', winLevel: input.winLevel }
        : null;

    case 'transferHost':
      return isId(input.playerId)
        ? { type: 'transferHost', playerId: input.playerId }
        : null;

    default:
      return null;
  }
}
