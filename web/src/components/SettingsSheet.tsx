import { useState } from 'react';
import { LIMITS, cleanName, nextColor, randomAvatar, strength } from '@level-goblin/shared';
import type { GameHandle } from '../game/handle.ts';
import { useI18n } from '../i18n/i18n.tsx';
import { Avatar } from './Avatar.tsx';
import { EditRightsPicker } from './EditRightsPicker.tsx';
import { LanguagePicker } from './LanguagePicker.tsx';
import { PlayerAdmin } from './PlayerAdmin.tsx';
import { Sheet } from './Sheet.tsx';
import { Stepper } from './Stepper.tsx';

interface SettingsSheetProps {
  game: GameHandle;
  onClose: () => void;
  onLeave: () => void;
  onLeft: () => void;
  onEnd: () => void;
}

export function SettingsSheet({
  game,
  onClose,
  onLeave,
  onLeft,
  onEnd,
}: SettingsSheetProps) {
  const { t } = useI18n();
  const { state, me, dispatch, online } = game;
  const [newName, setNewName] = useState('');
  const isHostPhone = !online || me === state.hostId;
  const isFull = state.players.length >= LIMITS.maxPlayers;
  const hostIsAway =
    online !== undefined &&
    state.hostId !== null &&
    !online.onlineIds.includes(state.hostId);

  function addPlayer() {
    const name = cleanName(newName);
    if (name === null) return;
    dispatch({
      type: 'addPlayer',
      id: crypto.randomUUID(),
      name,
      avatar: randomAvatar(),
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
        disabled={!isHostPhone}
        onChange={(delta) => {
          const winLevel = state.winLevel + delta;
          if (winLevel >= LIMITS.minWinLevel && winLevel <= LIMITS.maxWinLevel) {
            dispatch({ type: 'setWinLevel', winLevel });
          }
        }}
      />
      {online && (
        <EditRightsPicker
          value={state.editRights}
          disabled={!isHostPhone}
          onChange={(editRights) => dispatch({ type: 'setEditRights', editRights })}
        />
      )}
      {hostIsAway && (
        <button type="button" className="button" onClick={online.claimHost}>
          {t('settings.claimHost')}
        </button>
      )}

      <h3>{t('settings.players')}</h3>
      <ul className="settings-players">
        {state.players.map((player) => (
          <PlayerAdmin key={player.id} game={game} player={player} />
        ))}
      </ul>
      {!online && !isFull && (
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

      {!online && state.departed.length > 0 && (
        <>
          <h3>{t('settings.departed')}</h3>
          <ul className="settings-players">
            {state.departed.map((player) => (
              <li key={player.id}>
                <Avatar avatar={player.avatar} size={44} />
                <span className="grow">
                  {player.name} ({strength(player)})
                </span>
                <button
                  type="button"
                  className="button small"
                  aria-label={t('settings.returnPlayer', { name: player.name })}
                  disabled={isFull}
                  onClick={() => dispatch({ type: 'returnPlayer', playerId: player.id })}
                >
                  {t('settings.return')}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <button type="button" className="button" onClick={onLeave}>
        {t('settings.leave')}
      </button>
      {online && (
        <button
          type="button"
          className="button danger"
          onClick={() => {
            const isLast = state.players.length === 1;
            const question = t(isLast ? 'settings.confirmEnd' : 'settings.confirmLeave');
            if (window.confirm(question) && online.leave()) onLeft();
          }}
        >
          {t('settings.leaveGame')}
        </button>
      )}
      {isHostPhone && (
        <button
          type="button"
          className="button danger"
          onClick={() => {
            if (window.confirm(t('settings.confirmEnd'))) onEnd();
          }}
        >
          {t('settings.end')}
        </button>
      )}
    </Sheet>
  );
}
