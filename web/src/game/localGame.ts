import { useCallback, useState } from 'react';
import {
  PLAYER_COLORS,
  applyAction,
  createGame,
  secureDieRoll,
  type Action,
  type ActionContext,
  type GameState,
} from '@level-goblin/shared';
import type { GameHandle } from './handle.ts';

const STORAGE_KEY = 'level-goblin.local-game.v1';

function load(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw) as GameState;
    return Array.isArray(state.players) && Array.isArray(state.log) ? state : null;
  } catch {
    return null;
  }
}

function save(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private windows can block storage. The game still works until the page closes.
  }
}

export const hasLocalGame = (): boolean => load() !== null;

export function clearLocalGame(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing was stored, so there is nothing to clear.
  }
}

const tableContext = (): ActionContext => ({
  actorId: null,
  now: Date.now(),
  rollDie: secureDieRoll,
});

/** Picks the first color no one at the table is using. */
export function nextColor(state: GameState) {
  const used = new Set(state.players.map((player) => player.color));
  return PLAYER_COLORS.find((color) => !used.has(color)) ?? PLAYER_COLORS[0];
}

export function startLocalGame(names: string[], winLevel: number): void {
  let state = createGame({ winLevel, editRights: 'everyone' });
  for (const name of names) {
    const result = applyAction(
      state,
      {
        type: 'addPlayer',
        id: crypto.randomUUID(),
        name,
        color: nextColor(state),
      },
      tableContext(),
    );
    if (result.ok) state = result.state;
  }
  save(state);
}

export function useLocalGame(): GameHandle {
  const [state, setState] = useState<GameState>(() => load() ?? createGame());

  const dispatch = useCallback(
    (action: Action) => {
      const result = applyAction(state, action, tableContext());
      if (!result.ok) return result.error;
      save(result.state);
      setState(result.state);
      return null;
    },
    [state],
  );

  return { state, me: null, dispatch };
}
