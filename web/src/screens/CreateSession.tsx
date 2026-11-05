import { useState } from 'react';
import {
  DEFAULT_WIN_LEVEL,
  LIMITS,
  cleanName,
  type EditRights,
} from '@level-goblin/shared';
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
  const [editRights, setEditRights] = useState<EditRights>('ownAndHost');
  const [winLevel, setWinLevel] = useState<number>(DEFAULT_WIN_LEVEL);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const cleaned = cleanName(name);

  async function submit() {
    if (cleaned === null || busy) return;
    setBusy(true);
    setFailed(false);
    const result = await createSession({ name: cleaned, editRights, winLevel });
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
      <label className="field">
        <span>{t('join.yourName')}</span>
        <input
          value={name}
          maxLength={LIMITS.maxNameLength}
          onChange={(event) => setName(event.target.value)}
        />
      </label>
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
      <button
        type="button"
        className="button primary"
        disabled={cleaned === null || busy}
        onClick={submit}
      >
        {t('create.submit')}
      </button>
      {failed && <p role="alert">{t('errors.network')}</p>}
    </main>
  );
}
