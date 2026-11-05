import { useState } from 'react';
import { LIMITS, cleanName, nextColor } from '@level-goblin/shared';
import type { GameHandle } from '../game/handle.ts';
import { useI18n } from '../i18n/i18n.tsx';
import { LanguagePicker } from './LanguagePicker.tsx';
import { Sheet } from './Sheet.tsx';
import { Stepper } from './Stepper.tsx';

interface SettingsSheetProps {
  game: GameHandle;
  onClose: () => void;
  onLeave: () => void;
  onEnd: () => void;
}

export function SettingsSheet({ game, onClose, onLeave, onEnd }: SettingsSheetProps) {
  const { t } = useI18n();
  const { state, dispatch } = game;
  const [newName, setNewName] = useState('');
  const isFull = state.players.length >= LIMITS.maxPlayers;

  function addPlayer() {
    const name = cleanName(newName);
    if (name === null) return;
    dispatch({
      type: 'addPlayer',
      id: crypto.randomUUID(),
      name,
      color: nextColor(state),
    });
    setNewName('');
  }

  return (
    <Sheet title={t('settings.title')} onClose={onClose}>
      <div className="field">
        <span>{t('language')}</span>
        <LanguagePicker />
      </div>
      <Stepper
        label={t('setup.winLevel')}
        art="levelBadge"
        value={state.winLevel}
        onChange={(delta) => {
          const winLevel = state.winLevel + delta;
          if (winLevel >= LIMITS.minWinLevel && winLevel <= LIMITS.maxWinLevel) {
            dispatch({ type: 'setWinLevel', winLevel });
          }
        }}
      />

      <h3>{t('settings.players')}</h3>
      <ul className="settings-players">
        {state.players.map((player) => (
          <li key={player.id}>
            <input
              key={player.name}
              aria-label={t('settings.rename', { name: player.name })}
              defaultValue={player.name}
              maxLength={LIMITS.maxNameLength}
              onBlur={(event) => {
                const name = cleanName(event.target.value);
                if (name === null) event.target.value = player.name;
                else if (name !== player.name) {
                  dispatch({ type: 'updatePlayer', playerId: player.id, name });
                }
              }}
            />
            <button
              type="button"
              className="button small danger"
              aria-label={t('settings.removePlayer', { name: player.name })}
              onClick={() => {
                if (window.confirm(t('settings.confirmRemove', { name: player.name }))) {
                  dispatch({ type: 'removePlayer', playerId: player.id });
                }
              }}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      {!isFull && (
        <form
          className="inline-form"
          onSubmit={(event) => {
            event.preventDefault();
            addPlayer();
          }}
        >
          <input
            aria-label={t('settings.addPlayer')}
            placeholder={t('settings.addPlayer')}
            value={newName}
            maxLength={LIMITS.maxNameLength}
            onChange={(event) => setNewName(event.target.value)}
          />
          <button type="submit" className="button small">
            {t('setup.add')}
          </button>
        </form>
      )}

      <button type="button" className="button" onClick={onLeave}>
        {t('settings.leave')}
      </button>
      <button
        type="button"
        className="button danger"
        onClick={() => {
          if (window.confirm(t('settings.confirmEnd'))) onEnd();
        }}
      >
        {t('settings.end')}
      </button>
    </Sheet>
  );
}
