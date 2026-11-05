import { useState } from 'react';
import { DEFAULT_WIN_LEVEL, LIMITS, cleanName, randomAvatar } from '@level-goblin/shared';
import { AvatarButton } from '../components/AvatarPicker.tsx';
import { Stepper } from '../components/Stepper.tsx';
import { startLocalGame } from '../game/localGame.ts';
import { useI18n } from '../i18n/i18n.tsx';

interface SetupProps {
  onBack: () => void;
  onStart: () => void;
}

export function Setup({ onBack, onStart }: SetupProps) {
  const { t } = useI18n();
  const [players, setPlayers] = useState<{ name: string; avatar: string }[]>([]);
  const [draft, setDraft] = useState('');
  const [draftAvatar, setDraftAvatar] = useState(randomAvatar);
  const [winLevel, setWinLevel] = useState<number>(DEFAULT_WIN_LEVEL);
  const isFull = players.length >= LIMITS.maxPlayers;

  /** Includes a name still in the box, so nobody has to press Add for the last player. */
  const playersWithDraft = () => {
    const name = cleanName(draft);
    return name !== null && !isFull ? [...players, { name, avatar: draftAvatar }] : players;
  };

  return (
    <main className="page">
      <button type="button" className="button small" onClick={onBack}>
        {t('back')}
      </button>
      <h1>{t('setup.title')}</h1>

      <ul className="setup-names">
        {players.map(({ name, avatar }, index) => (
          <li key={`${name}-${index}`}>
            <AvatarButton
              value={avatar}
              size={44}
              label={t('avatar.changeFor', { name })}
              onPick={(picked) =>
                setPlayers(
                  players.map((player, other) =>
                    other === index ? { ...player, avatar: picked } : player,
                  ),
                )
              }
            />
            <span className="grow">{name}</span>
            <button
              type="button"
              className="button small danger"
              aria-label={t('setup.remove', { name })}
              onClick={() => setPlayers(players.filter((_, other) => other !== index))}
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
            setPlayers(playersWithDraft());
            setDraft('');
            setDraftAvatar(randomAvatar());
          }}
        >
          <AvatarButton
            value={draftAvatar}
            size={44}
            label={t('avatar.change')}
            onPick={setDraftAvatar}
          />
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
        disabled={playersWithDraft().length === 0}
        onClick={() => {
          startLocalGame(playersWithDraft(), winLevel);
          onStart();
        }}
      >
        {t('setup.start')}
      </button>
      {playersWithDraft().length === 0 && <p className="hint">{t('setup.needPlayer')}</p>}
    </main>
  );
}
