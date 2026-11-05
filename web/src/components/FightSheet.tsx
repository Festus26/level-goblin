import { useState } from 'react';
import { combatResult, findPlayer } from '@level-goblin/shared';
import type { GameHandle } from '../game/handle.ts';
import { useI18n } from '../i18n/i18n.tsx';
import { Art } from './Art.tsx';
import { PlayerAvatar } from './Avatar.tsx';
import { PlayerChoice } from './PlayerChoice.tsx';
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
        <PlayerChoice
          label={t('fight.fighter')}
          state={state}
          players={players}
          value={fighterId}
          onChange={(id) => id && setFighterId(id)}
        />
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
  const helper = findPlayer(state, combat.helperId);

  return (
    <Sheet title={t('fight.title')} onClose={onClose}>
      <div className="fight-score" data-players-win={result?.playersWin}>
        <div>
          <span className="fight-side">
            {fighter && <PlayerAvatar state={state} player={fighter} size={44} />}
            {helper && <PlayerAvatar state={state} player={helper} size={44} />}
          </span>
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
        {fighter && <PlayerAvatar state={state} player={fighter} size={40} />}
        <span>
          {t('fight.fighter')}: <strong>{fighter?.name}</strong>
        </span>
      </p>
      <PlayerChoice
        label={t('fight.helper')}
        state={state}
        players={players.filter((player) => player.id !== combat.fighterId)}
        value={combat.helperId}
        noneLabel={t('fight.noHelper')}
        onChange={(helperId) => dispatch({ type: 'updateCombat', helperId })}
      />
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
