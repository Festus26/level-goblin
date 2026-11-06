import { useState } from 'react';
import { LIMITS, combatResult, findPlayer } from '@level-goblin/shared';
import type { GameHandle } from '../game/handle.ts';
import { useI18n } from '../i18n/i18n.tsx';
import { Art } from './Art.tsx';
import { PlayerAvatar } from './Avatar.tsx';
import { PlayerChoice } from './PlayerChoice.tsx';
import { RollButton } from './RollButton.tsx';
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
        <RollButton game={game} />
      </Sheet>
    );
  }

  const result = combatResult(state);
  const fighter = findPlayer(state, combat.fighterId);
  const helper = findPlayer(state, combat.helperId);
  const { monsters } = combat;
  const severalMonsters = monsters.length > 1;
  const monstersWinLabel = severalMonsters ? t('fight.monstersWin') : t('fight.monsterWins');

  return (
    <Sheet title={t('fight.title')} onClose={onClose}>
      <div className="fight-score" data-players-win={result?.playersWin}>
        <div>
          <span className="fight-side">
            {fighter && <PlayerAvatar state={state} player={fighter} size={36} />}
            {helper && <PlayerAvatar state={state} player={helper} size={36} />}
          </span>
          <span>{t('fight.players')}</span>
          <strong>{result?.playerTotal}</strong>
        </div>
        <div>
          <Art name="monster" size={36} />
          <span>
            {severalMonsters
              ? t('fight.monsters', { count: monsters.length })
              : t('fight.monster')}
          </span>
          <strong>{result?.monsterTotal}</strong>
        </div>
        <p role="status">
          <Art name={result?.playersWin ? 'goblinGreedy' : 'goblinGulp'} size={28} />
          {result?.playersWin ? t('fight.playersWin') : monstersWinLabel}
        </p>
      </div>
      <RollButton game={game} primary />
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
        label={t('fight.playerBonus')}
        value={combat.playerBonus}
        signed
        onChange={(delta) =>
          dispatch({ type: 'updateCombat', playerBonus: combat.playerBonus + delta })
        }
      />
      <ul className="fight-monsters">
        {monsters.map((monster, index) => {
          const name = t('fight.monsterName', { number: index + 1 });
          const level = t('fight.level');
          const bonus = t('fight.bonus');
          return (
            <li key={monster.id} className="fight-monster">
              <header>
                <Art name="monster" size={28} />
                <h3>{name}</h3>
                {severalMonsters && (
                  <button
                    type="button"
                    className="button small"
                    aria-label={t('fight.removeMonster', { name })}
                    onClick={() => dispatch({ type: 'removeMonster', monsterId: monster.id })}
                  >
                    ✕
                  </button>
                )}
              </header>
              <Stepper
                label={level}
                value={monster.level}
                increaseLabel={t('player.increase', { stat: level, name })}
                decreaseLabel={t('player.decrease', { stat: level, name })}
                onChange={(delta) =>
                  dispatch({
                    type: 'changeMonster',
                    monsterId: monster.id,
                    stat: 'level',
                    delta,
                  })
                }
              />
              <Stepper
                label={bonus}
                value={monster.bonus}
                signed
                increaseLabel={t('player.increase', { stat: bonus, name })}
                decreaseLabel={t('player.decrease', { stat: bonus, name })}
                onChange={(delta) =>
                  dispatch({
                    type: 'changeMonster',
                    monsterId: monster.id,
                    stat: 'bonus',
                    delta,
                  })
                }
              />
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        className="button"
        disabled={monsters.length >= LIMITS.maxMonsters}
        onClick={() => dispatch({ type: 'addMonster' })}
      >
        <Art name="monster" />
        {t('fight.addMonster')}
      </button>
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
