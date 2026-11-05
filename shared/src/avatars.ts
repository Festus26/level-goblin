import { combatResult } from './game.ts';
import type { GameState } from './types.ts';

export const AVATAR_RACES = [
  'human', 'elf', 'dwarf', 'halfling', 'orc', 'gnome',
  'cat', 'lizard', 'ogre', 'boar', 'skeleton', 'bear',
] as const;
export const AVATAR_CLASSES = [
  'warrior', 'wizard', 'thief', 'cleric', 'bard',
  'pirate', 'knight', 'jester', 'alchemist', 'barbarian',
] as const;

const combine = (races: readonly string[], classes: readonly string[]): string[] =>
  races.flatMap((race) => classes.map((cls) => `${race}-${cls}`));

/** Must match the drawings made by web/art/avatars/build.py. */
export const AVATARS: readonly string[] = [
  ...combine(AVATAR_RACES.slice(0, 6), AVATAR_CLASSES.slice(0, 5)),
  ...combine(AVATAR_RACES.slice(6), AVATAR_CLASSES.slice(5)),
];

export type AvatarMood = 'grin' | 'win' | 'lose';

export const isAvatar = (value: unknown): value is string =>
  typeof value === 'string' && AVATARS.includes(value);

export const randomAvatar = (): string => {
  const [value = 0] = crypto.getRandomValues(new Uint32Array(1));
  return AVATARS[value % AVATARS.length]!;
};

/** A stable portrait for players who never picked one, such as in an old save. */
export function avatarFor(id: string): string {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return AVATARS[hash % AVATARS.length]!;
}

/** The face a player should show right now. The end of the game outranks a fight. */
export function avatarMood(state: GameState, playerId: string): AvatarMood {
  if (state.winnerId !== null) return state.winnerId === playerId ? 'win' : 'lose';
  const { combat } = state;
  if (combat && (combat.fighterId === playerId || combat.helperId === playerId)) {
    return combatResult(state)?.playersWin ? 'win' : 'lose';
  }
  return 'grin';
}
