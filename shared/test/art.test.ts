import { existsSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { AVATARS } from '../src/index.ts';

const dir = new URL('../../web/src/art/avatars/', import.meta.url);
const moods = ['grin', 'win', 'lose'];

describe('portrait files', () => {
  it('has a drawing for every portrait and mood', () => {
    const missing = AVATARS.flatMap((avatar) =>
      moods.map((mood) => `${avatar}-${mood}.svg`),
    ).filter((file) => !existsSync(new URL(file, dir)));
    expect(missing).toEqual([]);
  });

  it('has no drawings that the game does not know about', () => {
    expect(readdirSync(dir)).toHaveLength(AVATARS.length * moods.length);
  });
});
