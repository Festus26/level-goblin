import { useState } from 'react';
import { combatResult, findPlayer, strength } from '@level-goblin/shared';
import type { GameHandle } from '../game/handle.ts';
import { useI18n } from '../i18n/i18n.tsx';
import { Art } from './Art.tsx';
import { Sheet } from './Sheet.tsx';
import { Stepper } from './Stepper.tsx';

interface FightSheetProps {
  game: GameHandle;
  onClose: () => void;
}

export function FightSheet({ game, onClose }: FightSheetProps) {
  const { t } = useI18n();
  const { state, dispatch } = game;
  const { combat, players } = state;
  const [fighterId, setFighterId] = useState(
    state.turnPlayerId ?? players[0]?.id ?? '',
  );
  const [monsterLevel, setMonsterLevel] = useState(1);

  if (!combat) {
    return (
      <Sheet title={t('fight.title')} onClose={onClose}>
        <label className="field">
          <span>{t('fight.fighter')}</span>
          <select value={fighterId} onChange={(event) => setFighterId(event.target.value)}>
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name} ({strength(player)})
              </option>
            ))}
          </select>
        </label>
        <Stepper
          label={t('fight.monsterLevel')}
          art="monster"
          value={monsterLevel}
          onChange={(delta) => setMonsterLevel((value) => Math.max(1, value + delta))}
        />
        <button
          type="button"
          className="button primary"
          onClick={() => dispatch({ type: 'startCombat', fighterId, monsterLevel })}
        >
          {t('fight.start')}
        </button>
      </Sheet>
    );
  }

  const result = combatResult(state);
  const fighter = findPlayer(state, combat.fighterId);

  return (
    <Sheet title={t('fight.title')} onClose={onClose}>
      <div className="fight-score" data-players-win={result?.playersWin}>
        <div>
          <Art name="helpers" size={40} />
          <span>{t('fight.players')}</span>
          <strong>{result?.playerTotal}</strong>
        </div>
        <div>
          <Art name="monster" size={40} />
          <span>{t('fight.monster')}</span>
          <strong>{result?.monsterTotal}</strong>
        </div>
        <p role="status">
          <Art name={result?.playersWin ? 'goblinGreedy' : 'goblinGulp'} size={44} />
          {result?.playersWin ? t('fight.playersWin') : t('fight.monsterWins')}
        </p>
      </div>
      <p className="fight-fighter">
        {t('fight.fighter')}: <strong>{fighter?.name}</strong>
      </p>
      <label className="field">
        <span className="with-art">
          <Art name="helpers" size={24} />
          {t('fight.helper')}
        </span>
        <select
          value={combat.helperId ?? ''}
          onChange={(event) =>
            dispatch({ type: 'updateCombat', helperId: event.target.value || null })
          }
        >
          <option value="">{t('fight.noHelper')}</option>
          {players
            .filter((player) => player.id !== combat.fighterId)
            .map((player) => (
              <option key={player.id} value={player.id}>
                {player.name} ({strength(player)})
              </option>
            ))}
        </select>
      </label>
      <Stepper
        label={t('fight.monsterLevel')}
        art="monster"
        value={combat.monsterLevel}
        onChange={(delta) =>
          dispatch({
            type: 'updateCombat',
            monsterLevel: Math.max(1, combat.monsterLevel + delta),
          })
        }
      />
      <Stepper
        label={t('fight.playerBonus')}
        value={combat.playerBonus}
        signed
        onChange={(delta) =>
          dispatch({ type: 'updateCombat', playerBonus: combat.playerBonus + delta })
        }
      />
      <Stepper
        label={t('fight.monsterBonus')}
        value={combat.monsterBonus}
        signed
        onChange={(delta) =>
          dispatch({ type: 'updateCombat', monsterBonus: combat.monsterBonus + delta })
        }
      />
      <button
        type="button"
        className="button"
        onClick={() => dispatch({ type: 'endCombat' })}
      >
        {t('fight.end')}
      </button>
    </Sheet>
  );
}
