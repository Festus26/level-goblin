import {
  DEFAULT_WIN_LEVEL,
  LIMITS,
  cleanName,
  generateSessionCode,
  isAvatar,
  normalizeSessionCode,
  type CreateSessionRequest,
  type CreateSessionResponse,
  type EditRights,
  type JoinRequest,
} from '@level-goblin/shared';
import type { Env } from './env.ts';

export { SessionRoom } from './room.ts';

const MAX_BODY_LENGTH = 1024;
const CREATE_ATTEMPTS = 5;

function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}

async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  const text = await request.text();
  if (text.length > MAX_BODY_LENGTH) return null;
  try {
    const body: unknown = JSON.parse(text);
    return typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function parseCreate(body: Record<string, unknown> | null): CreateSessionRequest | null {
  const name = cleanName(body?.name);
  const { editRights, winLevel = DEFAULT_WIN_LEVEL } = body ?? {};
  const rights: EditRights[] = ['own', 'ownAndHost', 'everyone'];
  if (name === null || !rights.includes(editRights as EditRights)) return null;
  if (
    !Number.isInteger(winLevel) ||
    (winLevel as number) < LIMITS.minWinLevel ||
    (winLevel as number) > LIMITS.maxWinLevel
  ) {
    return null;
  }
  return {
    name,
    editRights: editRights as EditRights,
    winLevel: winLevel as number,
    ...(isAvatar(body?.avatar) ? { avatar: body.avatar } : {}),
  };
}

function parseJoin(body: Record<string, unknown> | null): JoinRequest | null {
  if (typeof body?.seatId === 'string' && body.seatId.length <= 64) {
    return { seatId: body.seatId };
  }
  if (typeof body?.name !== 'string') return null;
  return { name: body.name, ...(isAvatar(body.avatar) ? { avatar: body.avatar } : {}) };
}

async function route(request: Request, env: Env, url: URL): Promise<Response> {
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts[0] !== 'sessions') return Response.json({ error: 'notFound' }, { status: 404 });

  if (parts.length === 1 && request.method === 'POST') {
    const create = parseCreate(await readBody(request));
    if (!create) return Response.json({ error: 'invalidAction' }, { status: 400 });
    for (let attempt = 0; attempt < CREATE_ATTEMPTS; attempt++) {
      const code = generateSessionCode();
      const room = env.SESSIONS.get(env.SESSIONS.idFromName(code));
      const seat = await room.create(create);
      if (seat) {
        const response: CreateSessionResponse = { code, ...seat };
        return Response.json(response, { status: 201 });
      }
    }
    return Response.json({ error: 'busy' }, { status: 503 });
  }

  const code = normalizeSessionCode(parts[1]);
  if (!code) return Response.json({ error: 'notFound' }, { status: 404 });
  const room = env.SESSIONS.get(env.SESSIONS.idFromName(code));

  if (parts.length === 2 && request.method === 'GET') {
    const info = await room.info();
    return info
      ? Response.json(info)
      : Response.json({ error: 'notFound' }, { status: 404 });
  }

  if (parts[2] === 'join' && request.method === 'POST') {
    const join = parseJoin(await readBody(request));
    if (!join) return Response.json({ error: 'invalidAction' }, { status: 400 });
    const result = await room.join(join);
    if (!('error' in result)) return Response.json(result, { status: 201 });
    const status = result.error === 'notFound' ? 404 : 409;
    return Response.json(result, { status });
  }

  if (parts[2] === 'ws' && request.headers.get('Upgrade') === 'websocket') {
    return room.fetch(request);
  }

  return Response.json({ error: 'notFound' }, { status: 404 });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin');
    const allowed = env.ALLOWED_ORIGINS.split(',').map((item) => item.trim());
    if (!origin || !allowed.includes(origin)) return new Response(null, { status: 403 });

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    const url = new URL(request.url);
    const response = await route(request, env, url);
    if (response.status === 101) return response;

    const headers = new Headers(response.headers);
    for (const [key, value] of Object.entries(corsHeaders(origin))) headers.set(key, value);
    return new Response(response.body, { status: response.status, headers });
  },
} satisfies ExportedHandler<Env>;
