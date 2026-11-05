import type { Action, ActionError, EditRights, GameState } from './types.ts';

/** Leaves out I, L, O, 0 and 1, which are easy to misread across a table. */
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 5;

export function generateSessionCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(CODE_LENGTH));
  return Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join('');
}

/** Tidies a typed code, and returns null if it can't be a real one. */
export function normalizeSessionCode(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const code = input.toUpperCase().replace(/[\s-]/g, '');
  if (code.length !== CODE_LENGTH) return null;
  return [...code].every((char) => CODE_ALPHABET.includes(char)) ? code : null;
}

export interface CreateSessionRequest {
  name: string;
  editRights: EditRights;
  winLevel: number;
}

/** Sends `seatId` to take back a freed seat, or `name` to sit down as someone new. */
export type JoinRequest = { name: string } | { seatId: string };

export interface SeatCredentials {
  playerId: string;
  token: string;
}

export interface CreateSessionResponse extends SeatCredentials {
  code: string;
}

export interface SessionInfo {
  isFull: boolean;
  openSeats: { id: string; name: string }[];
}

export type ClientMessage =
  | { t: 'action'; action: Action }
  | { t: 'freeSeat'; playerId: string }
  | { t: 'claimHost' }
  | { t: 'leave' }
  | { t: 'endSession' };

/** Why this phone can't stay connected. Reconnecting won't help in either case. */
export type EndReason = 'seatLost' | 'sessionEnded';

/**
 * `ended` is sent as a message, not as a WebSocket close code, because a close
 * handshake may never finish on a socket refused while connecting.
 */
export type ServerMessage =
  | { t: 'state'; state: GameState; online: string[]; openSeats: string[] }
  | { t: 'rejected'; error: ActionError }
  | { t: 'ended'; reason: EndReason };

/** Sent as plain text. The server answers with PONG without waking from hibernation. */
export const PING = 'ping';
export const PONG = 'pong';
