import { useEffect } from 'react';

/** Keeps the screen on while mounted. The browser drops the lock when the tab is hidden. */
export function useWakeLock(): void {
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    let released = false;

    async function acquire() {
      if (released || lock || document.visibilityState !== 'visible') return;
      try {
        const sentinel = await navigator.wakeLock.request('screen');
        if (released) {
          void sentinel.release();
          return;
        }
        lock = sentinel;
        sentinel.addEventListener('release', () => {
          lock = null;
        });
      } catch {
        // Unsupported or refused, for example on low battery. The game works without it.
      }
    }

    void acquire();
    document.addEventListener('visibilitychange', acquire);
    return () => {
      released = true;
      document.removeEventListener('visibilitychange', acquire);
      void lock?.release();
    };
  }, []);
}
