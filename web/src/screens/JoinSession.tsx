import { useEffect, useState } from 'react';
import {
  LIMITS,
  cleanName,
  randomAvatar,
  type JoinRequest,
  type SessionInfo,
} from '@level-goblin/shared';
import { Avatar } from '../components/Avatar.tsx';
import { AvatarButton } from '../components/AvatarPicker.tsx';
import { getSessionInfo, joinSession, type ApiError } from '../game/api.ts';
import { saveSeat } from '../game/sessionStore.ts';
import { useI18n, type MessageKey } from '../i18n/i18n.tsx';

const ERROR_KEYS: Record<ApiError, MessageKey> = {
  notFound: 'errors.notFound',
  tableFull: 'setup.tableFull',
  seatTaken: 'errors.seatTaken',
  network: 'errors.network',
  unknown: 'errors.network',
};

interface JoinSessionProps {
  code: string;
  onBack: () => void;
  onJoined: () => void;
}

export function JoinSession({ code, onBack, onJoined }: JoinSessionProps) {
  const { t } = useI18n();
  const [info, setInfo] = useState<SessionInfo | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(randomAvatar);
  const [busy, setBusy] = useState(false);
  const cleaned = cleanName(name);

  useEffect(() => {
    let cancelled = false;
    getSessionInfo(code).then((result) => {
      if (cancelled) return;
      if (result.ok) setInfo(result.value);
      else setError(result.error);
    });
    return () => {
      cancelled = true;
    };
  }, [code]);

  async function join(request: JoinRequest) {
    if (busy) return;
    setBusy(true);
    setError(null);
    const result = await joinSession(code, request);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    saveSeat(code, result.value);
    onJoined();
  }

  return (
    <main className="page">
      <button type="button" className="button small" onClick={onBack}>
        {t('back')}
      </button>
      <h1>{t('join.title', { code })}</h1>

      {error && (
        <p className="alert" role="alert">
          {t(ERROR_KEYS[error])}
        </p>
      )}

      {info && info.openSeats.length > 0 && (
        <>
          <h3>{t('join.takeSeat')}</h3>
          {info.openSeats.map((seat) => (
            <button
              key={seat.id}
              type="button"
              className="button"
              disabled={busy}
              onClick={() => join({ seatId: seat.id })}
            >
              <Avatar avatar={seat.avatar} size={36} />
              {seat.name}
            </button>
          ))}
        </>
      )}

      {info && !info.isFull && (
        <form
          className="stack"
          onSubmit={(event) => {
            event.preventDefault();
            if (cleaned !== null) join({ name: cleaned, avatar });
          }}
        >
          <div className="identity">
            <AvatarButton value={avatar} label={t('avatar.change')} onPick={setAvatar} />
            <label className="field">
              <span>{t('join.yourName')}</span>
              <input
                value={name}
                maxLength={LIMITS.maxNameLength}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
          </div>
          <button
            type="submit"
            className="button primary"
            disabled={cleaned === null || busy}
          >
            {busy ? t('online.connecting') : t('join.submit')}
          </button>
        </form>
      )}

      {info?.isFull && <p>{t('setup.tableFull')}</p>}
    </main>
  );
}
