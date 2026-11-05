import type { Action, ActionError, GameState } from '@level-goblin/shared';

/**
 * What every table screen needs from a game. One-phone mode and online sessions
 * each provide one, so the screens never need to know which they are using.
 */
export interface GameHandle {
  state: GameState;
  /** This phone's player, or null when the device is shared by the whole table. */
  me: string | null;
  dispatch: (action: Action) => ActionError | null;
}
