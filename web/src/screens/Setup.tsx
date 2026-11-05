import { useState } from 'react';
import { DEFAULT_WIN_LEVEL, LIMITS, cleanName } from '@level-goblin/shared';
import { Stepper } from '../components/Stepper.tsx';
import { startLocalGame } from '../game/localGame.ts';
import { useI18n } from '../i18n/i18n.tsx';

interface SetupProps {
  onBack: () => void;
  onStart: () => void;
}

export function Setup({ onBack, onStart }: SetupProps) {
  const { t } = useI18n();
  const [names, setNames] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [winLevel, setWinLevel] = useState<number>(DEFAULT_WIN_LEVEL);
  const isFull = names.length >= LIMITS.maxPlayers;

  /** Includes a name still in the box, so nobody has to press Add for the last player. */
  const namesWithDraft = () => {
    const name = cleanName(draft);
    return name !== null && !isFull ? [...names, name] : names;
  };

  return (
    <main className="page">
      <button type="button" className="button small" onClick={onBack}>
        {t('back')}
      </button>
      <h1>{t('setup.title')}</h1>

      <ul className="setup-names">
        {names.map((name, index) => (
          <li key={`${name}-${index}`}>
            <span>{name}</span>
            <button
              type="button"
              className="button small danger"
              aria-label={t('setup.remove', { name })}
              onClick={() => setNames(names.filter((_, other) => other !== index))}
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      {isFull ? (
        <p>{t('setup.tableFull')}</p>
      ) : (
        <form
          className="inline-form"
          onSubmit={(event) => {
            event.preventDefault();
            setNames(namesWithDraft());
            setDraft('');
          }}
        >
          <input
            aria-label={t('setup.nameLabel')}
            placeholder={t('setup.nameLabel')}
            value={draft}
            maxLength={LIMITS.maxNameLength}
            onChange={(event) => setDraft(event.target.value)}
          />
          <button type="submit" className="button small">
            {t('setup.add')}
          </button>
        </form>
      )}

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
        disabled={namesWithDraft().length === 0}
        onClick={() => {
          startLocalGame(namesWithDraft(), winLevel);
          onStart();
        }}
      >
        {t('setup.start')}
      </button>
      {namesWithDraft().length === 0 && <p className="hint">{t('setup.needPlayer')}</p>}
    </main>
  );
}
