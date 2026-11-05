import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  PING,
  PONG,
  type Action,
  type ActionError,
  type ClientMessage,
  type EndReason,
  type GameState,
  type SeatCredentials,
  type ServerMessage,
} from '@level-goblin/shared';
import { API_URL } from '../config.ts';
import type { ConnectionStatus, GameHandle } from './handle.ts';

const PING_EVERY_MS = 20_000;
/** A phone that sleeps can leave a dead socket looking open, so silence counts as lost. */
const PONG_TIMEOUT_MS = 8_000;
const MAX_RETRY_DELAY_MS = 8_000;

interface Snapshot {
  state: GameState;
  online: string[];
  openSeats: string[];
}

/** Connects to a session and keeps reconnecting. Null until the first state arrives. */
export function useOnlineGame(
  code: string,
  seat: SeatCredentials,
  onEnded: (reason: EndReason) => void,
): GameHandle | null {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('reconnecting');
  const [rejected, setRejected] = useState<ActionError | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const endedRef = useRef(onEnded);
  endedRef.current = onEnded;

  useEffect(() => {
    let stopped = false;
    let attempts = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let pingTimer: ReturnType<typeof setInterval> | undefined;
    let pongTimer: ReturnType<typeof setTimeout> | undefined;

    const clearTimers = () => {
      clearTimeout(retryTimer);
      clearInterval(pingTimer);
      clearTimeout(pongTimer);
    };

    function connect() {
      clearTimers();
      const url = `${API_URL.replace(/^http/, 'ws')}/sessions/${code}/ws?token=${seat.token}`;
      const socket = new WebSocket(url);
      socketRef.current = socket;

      const lost = () => {
        if (socketRef.current !== socket) return;
        socketRef.current = null;
        clearTimers();
        if (stopped) return;
        setStatus('reconnecting');
        const delay = Math.min(MAX_RETRY_DELAY_MS, 500 * 2 ** attempts);
        attempts += 1;
        retryTimer = setTimeout(connect, delay);
      };

      socket.addEventListener('open', () => {
        pingTimer = setInterval(() => {
          socket.send(PING);
          pongTimer = setTimeout(() => {
            lost();
            socket.close();
          }, PONG_TIMEOUT_MS);
        }, PING_EVERY_MS);
      });

      socket.addEventListener('message', (event) => {
        if (event.data === PONG) {
          clearTimeout(pongTimer);
          return;
        }
        const message = JSON.parse(String(event.data)) as ServerMessage;
        if (message.t === 'state') {
          attempts = 0;
          setStatus('online');
          setSnapshot({
            state: message.state,
            online: message.online,
            openSeats: message.openSeats,
          });
        } else if (message.t === 'rejected') {
          setRejected(message.error);
        } else {
          stopped = true;
          clearTimers();
          socket.close();
          endedRef.current(message.reason);
        }
      });

      socket.addEventListener('close', lost);
    }

    /** Coming back to the tab or the network shouldn't wait for the retry timer. */
    function wake() {
      if (stopped || document.visibilityState !== 'visible') return;
      if (socketRef.current?.readyState === WebSocket.OPEN) return;
      socketRef.current = null;
      attempts = 0;
      connect();
    }

    connect();
    window.addEventListener('online', wake);
    document.addEventListener('visibilitychange', wake);

    return () => {
      stopped = true;
      clearTimers();
      window.removeEventListener('online', wake);
      document.removeEventListener('visibilitychange', wake);
      const socket = socketRef.current;
      socketRef.current = null;
      socket?.close();
    };
  }, [code, seat.token]);

  const send = useCallback((message: ClientMessage): boolean => {
    const socket = socketRef.current;
    if (socket?.readyState !== WebSocket.OPEN) return false;
    socket.send(JSON.stringify(message));
    return true;
  }, []);

  const dispatch = useCallback(
    (action: Action): ActionError | null =>
      send({ t: 'action', action }) ? null : 'invalidAction',
    [send],
  );

  return useMemo(() => {
    if (!snapshot) return null;
    return {
      state: snapshot.state,
      me: seat.playerId,
      dispatch,
      online: {
        code,
        status,
        onlineIds: snapshot.online,
        openSeatIds: snapshot.openSeats,
        rejected,
        dismissRejected: () => setRejected(null),
        freeSeat: (playerId) => send({ t: 'freeSeat', playerId }),
        claimHost: () => send({ t: 'claimHost' }),
        endSession: () => send({ t: 'endSession' }),
      },
    };
  }, [snapshot, seat.playerId, dispatch, code, status, rejected, send]);
}
