import { spawn, type ChildProcess } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export const ORIGIN = 'http://localhost:4173';
export const MAIN_PORT = 8788;
/** A second Worker whose sessions expire almost at once, for testing cleanup. */
export const EXPIRY_PORT = 8789;

function startWorker(port: number, inspectorPort: number, ttl: string): ChildProcess {
  return spawn(
    'npx',
    [
      'wrangler', 'dev',
      '--port', String(port),
      '--inspector-port', String(inspectorPort),
      '--persist-to', mkdtempSync(join(tmpdir(), 'level-goblin-')),
      '--var', `ALLOWED_ORIGINS:${ORIGIN}`,
      '--var', `SESSION_TTL_MS:${ttl}`,
    ],
    { cwd: 'worker', stdio: 'ignore', env: { ...process.env, WRANGLER_SEND_METRICS: 'false' }, detached: true },
  );
}

async function waitFor(port: number): Promise<void> {
  for (let i = 0; i < 150; i++) {
    try {
      await fetch(`http://localhost:${port}/`);
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
  throw new Error(`Worker on port ${port} did not start`);
}

export default async function setup() {
  const workers = [startWorker(MAIN_PORT, 9331, '604800000'), startWorker(EXPIRY_PORT, 9332, '1500')];
  await Promise.all([waitFor(MAIN_PORT), waitFor(EXPIRY_PORT)]);
  return () => {
    for (const worker of workers) {
      if (worker.pid) process.kill(-worker.pid);
    }
  };
}
