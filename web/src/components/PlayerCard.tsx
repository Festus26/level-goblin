import { canEditPlayer, strength, type Player } from '@level-goblin/shared';
import type { GameHandle } from '../game/handle.ts';
import { useI18n } from '../i18n/i18n.tsx';
import { Art } from './Art.tsx';
import { Stepper } from './Stepper.tsx';

export function PlayerCard({ game, player }: { game: GameHandle; player: Player }) {
  const { t } = useI18n();
  const { state, me, dispatch, online } = game;
  const canEdit = canEditPlayer(state, me, player.id);
  const hasTurn = state.turnPlayerId === player.id;
  const level = t('player.level');
  const gear = t('player.gear');

  return (
    <li className="player-card" data-color={player.color} data-turn={hasTurn}>
      <div className="player-heading">
        <span className="player-dot" aria-hidden="true" />
        <div className="player-title">
          <h3>{player.name}</h3>
          {online && player.id === me && <span className="tag">{t('player.you')}</span>}
          {online && player.id === state.hostId && (
            <span className="tag">{t('settings.host')}</span>
          )}
          {online && !online.onlineIds.includes(player.id) && (
            <span className="tag away">{t('player.away')}</span>
          )}
          {hasTurn && <span className="badge">{t('player.turn')}</span>}
        </div>
        <div className="strength">
          <Art name="sword" size={36} />
          <span className="visually-hidden">{t('player.strength')}</span>
          <strong>{strength(player)}</strong>
        </div>
      </div>
      <div className="player-stats">
        <Stepper
          label={level}
          art="levelBadge"
          value={player.level}
          disabled={!canEdit}
          increaseLabel={t('player.increase', { stat: level, name: player.name })}
          decreaseLabel={t('player.decrease', { stat: level, name: player.name })}
          onChange={(delta) =>
            dispatch({ type: 'changeLevel', playerId: player.id, delta })
          }
        />
        <Stepper
          label={gear}
          art="helmet"
          value={player.gear}
          disabled={!canEdit}
          signed
          increaseLabel={t('player.increase', { stat: gear, name: player.name })}
          decreaseLabel={t('player.decrease', { stat: gear, name: player.name })}
          onChange={(delta) =>
            dispatch({ type: 'changeGear', playerId: player.id, delta })
          }
        />
      </div>
    </li>
  );
}
