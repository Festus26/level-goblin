import type { SessionRoom } from './room.ts';

export interface Env {
  SESSIONS: DurableObjectNamespace<SessionRoom>;
  /** Comma-separated list of sites allowed to talk to this Worker. */
  ALLOWED_ORIGINS: string;
  /** How long an idle session lives, in milliseconds. */
  SESSION_TTL_MS: string;
}
