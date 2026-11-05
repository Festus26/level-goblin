import type {
  CreateSessionRequest,
  CreateSessionResponse,
  JoinRequest,
  SeatCredentials,
  SessionInfo,
} from '@level-goblin/shared';
import { API_URL } from '../config.ts';

export type ApiError = 'notFound' | 'tableFull' | 'seatTaken' | 'network' | 'unknown';

export type ApiResult<T> = { ok: true; value: T } | { ok: false; error: ApiError };

/** A stalled request must end in an error, or the screen would just sit there. */
const TIMEOUT_MS = 10_000;

async function request<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const body = (await response.json()) as T & { error?: string };
    if (response.ok) return { ok: true, value: body };
    const known: ApiError[] = ['notFound', 'tableFull', 'seatTaken'];
    const error = known.find((item) => item === body.error) ?? 'unknown';
    return { ok: false, error };
  } catch {
    return { ok: false, error: 'network' };
  }
}

const postJson = (body: unknown): RequestInit => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const createSession = (body: CreateSessionRequest) =>
  request<CreateSessionResponse>('/sessions', postJson(body));

export const getSessionInfo = (code: string) => request<SessionInfo>(`/sessions/${code}`);

export const joinSession = (code: string, body: JoinRequest) =>
  request<SeatCredentials>(`/sessions/${code}/join`, postJson(body));
