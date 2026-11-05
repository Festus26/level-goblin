import { LIMITS, canEditPlayer, cleanName, type Player } from '@level-goblin/shared';
import type { GameHandle } from '../game/handle.ts';
import { useI18n } from '../i18n/i18n.tsx';
import { AvatarButton } from './AvatarPicker.tsx';
import { Avatar } from './Avatar.tsx';

/** One row in Settings: rename a player, plus whatever this phone is allowed to do. */
export function PlayerAdmin({ game, player }: { game: GameHandle; player: Player }) {
  const { t } = useI18n();
  const { state, me, dispatch, online } = game;
  const isHostPhone = !online || me === state.hostId;
  const isHostSeat = player.id === state.hostId;
  const seatIsOpen = online?.openSeatIds.includes(player.id) ?? false;
  const seatIsOffline = online !== undefined && !online.onlineIds.includes(player.id);

  return (
    <li>
      {canEditPlayer(state, me, player.id) ? (
        <AvatarButton
          value={player.avatar}
          size={44}
          label={t('avatar.changeFor', { name: player.name })}
          onPick={(avatar) => dispatch({ type: 'updatePlayer', playerId: player.id, avatar })}
        />
      ) : (
        <Avatar avatar={player.avatar} size={44} />
      )}
      <input
        key={player.name}
        aria-label={t('settings.rename', { name: player.name })}
        defaultValue={player.name}
        maxLength={LIMITS.maxNameLength}
        disabled={!canEditPlayer(state, me, player.id)}
        onBlur={(event) => {
          const name = cleanName(event.target.value);
          if (name === null) event.target.value = player.name;
          else if (name !== player.name) {
            dispatch({ type: 'updatePlayer', playerId: player.id, name });
          }
        }}
      />
      {online && isHostPhone && !isHostSeat && (
        <button
          type="button"
          className="button small"
          aria-label={t('settings.makeHost', { name: player.name })}
          onClick={() => dispatch({ type: 'transferHost', playerId: player.id })}
        >
          {t('settings.host')}
        </button>
      )}
      {online && isHostPhone && !isHostSeat && seatIsOffline && !seatIsOpen && (
        <button
          type="button"
          className="button small"
          aria-label={t('settings.freeSeat', { name: player.name })}
          onClick={() => online.freeSeat(player.id)}
        >
          {t('settings.free')}
        </button>
      )}
      {isHostPhone && !isHostSeat && (
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
      )}
    </li>
  );
}
