import { canEditPlayer, strength, type Player } from '@level-goblin/shared';
import type { GameHandle } from '../game/handle.ts';
import { useI18n } from '../i18n/i18n.tsx';
import { Stepper } from './Stepper.tsx';

export function PlayerCard({ game, player }: { game: GameHandle; player: Player }) {
  const { t } = useI18n();
  const { state, me, dispatch } = game;
  const canEdit = canEditPlayer(state, me, player.id);
  const hasTurn = state.turnPlayerId === player.id;
  const level = t('player.level');
  const gear = t('player.gear');

  return (
    <li className="player-card" data-color={player.color} data-turn={hasTurn}>
      <div className="player-heading">
        <h3>{player.name}</h3>
        {hasTurn && <span className="badge">{t('player.turn')}</span>}
        <div className="strength">
          <span>{t('player.strength')}</span>
          <strong>{strength(player)}</strong>
        </div>
      </div>
      <div className="player-stats">
        <Stepper
          label={level}
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
