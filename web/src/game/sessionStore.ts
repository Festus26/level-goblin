import type { SeatCredentials } from '@level-goblin/shared';

const STORAGE_KEY = 'level-goblin.sessions.v1';

interface Saved {
  last: string | null;
  seats: Record<string, SeatCredentials>;
}

function read(): Saved {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Saved | null;
    if (saved && typeof saved.seats === 'object') return saved;
  } catch {
    // Unreadable storage is treated as empty.
  }
  return { last: null, seats: {} };
}

function write(saved: Saved): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // Without storage the seat just can't be recovered after a refresh.
  }
}

export const getSeat = (code: string): SeatCredentials | null => read().seats[code] ?? null;

export const lastSessionCode = (): string | null => {
  const { last, seats } = read();
  return last && seats[last] ? last : null;
};

export function saveSeat(code: string, seat: SeatCredentials): void {
  const saved = read();
  write({ last: code, seats: { ...saved.seats, [code]: seat } });
}

export function forgetSeat(code: string): void {
  const { last, seats } = read();
  delete seats[code];
  write({ last: last === code ? null : last, seats });
}
