import { useState } from 'react';
import {
  DEFAULT_WIN_LEVEL,
  LIMITS,
  cleanName,
  randomAvatar,
  type EditRights,
} from '@level-goblin/shared';
import { AvatarButton } from '../components/AvatarPicker.tsx';
import { EditRightsPicker } from '../components/EditRightsPicker.tsx';
import { Stepper } from '../components/Stepper.tsx';
import { createSession } from '../game/api.ts';
import { saveSeat } from '../game/sessionStore.ts';
import { useI18n } from '../i18n/i18n.tsx';

interface CreateSessionProps {
  onBack: () => void;
  onCreated: (code: string) => void;
}

export function CreateSession({ onBack, onCreated }: CreateSessionProps) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(randomAvatar);
  const [editRights, setEditRights] = useState<EditRights>('ownAndHost');
  const [winLevel, setWinLevel] = useState<number>(DEFAULT_WIN_LEVEL);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const cleaned = cleanName(name);

  async function submit() {
    if (cleaned === null || busy) return;
    setBusy(true);
    setFailed(false);
    const result = await createSession({ name: cleaned, avatar, editRights, winLevel });
    setBusy(false);
    if (!result.ok) {
      setFailed(true);
      return;
    }
    const { code, playerId, token } = result.value;
    saveSeat(code, { playerId, token });
    onCreated(code);
  }

  return (
    <main className="page">
      <button type="button" className="button small" onClick={onBack}>
        {t('back')}
      </button>
      <h1>{t('create.title')}</h1>
      <form
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
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
        <EditRightsPicker value={editRights} onChange={setEditRights} />
        <Stepper
          label={t('setup.winLevel')}
          art="levelBadge"
          value={winLevel}
          onChange={(delta) =>
            setWinLevel((value) =>
              Math.min(LIMITS.maxWinLevel, Math.max(LIMITS.minWinLevel, value + delta)),
            )
          }
        />
        {failed && (
          <p className="alert" role="alert">
            {t('errors.network')}
          </p>
        )}
        <button type="submit" className="button primary" disabled={cleaned === null || busy}>
          {busy ? t('online.connecting') : t('create.submit')}
        </button>
      </form>
    </main>
  );
}
