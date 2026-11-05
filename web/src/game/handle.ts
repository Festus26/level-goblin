import type { Action, ActionError, GameState } from '@level-goblin/shared';

export type ConnectionStatus = 'online' | 'reconnecting';

/** Extras that only exist in an online session. */
export interface OnlineControls {
  code: string;
  status: ConnectionStatus;
  onlineIds: string[];
  openSeatIds: string[];
  /** The last action the server refused, until it is dismissed. */
  rejected: ActionError | null;
  dismissRejected: () => void;
  freeSeat: (playerId: string) => void;
  claimHost: () => void;
  /** Gives up this phone's seat. False if there's no connection to say so. */
  leave: () => boolean;
  endSession: () => void;
}

/**
 * What every table screen needs from a game. One-phone mode and online sessions
 * each provide one, so the screens never need to know which they are using.
 */
export interface GameHandle {
  state: GameState;
  /** This phone's player, or null when the device is shared by the whole table. */
  me: string | null;
  dispatch: (action: Action) => ActionError | null;
  online?: OnlineControls;
}
