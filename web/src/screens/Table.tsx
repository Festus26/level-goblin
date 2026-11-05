import { useState } from 'react';
import { findPlayer } from '@level-goblin/shared';
import { FightSheet } from '../components/FightSheet.tsx';
import { LogSheet } from '../components/LogSheet.tsx';
import { PlayerCard } from '../components/PlayerCard.tsx';
import { SettingsSheet } from '../components/SettingsSheet.tsx';
import type { GameHandle } from '../game/handle.ts';
import { useI18n } from '../i18n/i18n.tsx';

type OpenSheet = 'fight' | 'log' | 'settings' | null;

interface TableProps {
  game: GameHandle;
  onLeave: () => void;
  onEnd: () => void;
}

export function Table({ game, onLeave, onEnd }: TableProps) {
  const { t } = useI18n();
  const { state, dispatch } = game;
  const [sheet, setSheet] = useState<OpenSheet>(null);
  const turnPlayer = findPlayer(state, state.turnPlayerId);
  const winner = findPlayer(state, state.winnerId);
  const closeSheet = () => setSheet(null);

  return (
    <main className="page table">
      {winner && (
        <p className="winner" role="status">
          {t('table.winner', { name: winner.name })}
        </p>
      )}

      <div className="turn-bar">
        <strong>{turnPlayer && t('table.turn', { name: turnPlayer.name })}</strong>
        <button
          type="button"
          className="button small"
          onClick={() => dispatch({ type: 'nextTurn' })}
        >
          {t('table.nextTurn')}
        </button>
      </div>

      <ul className="players">
        {state.players.map((player) => (
          <PlayerCard key={player.id} game={game} player={player} />
        ))}
      </ul>

      <nav className="action-bar">
        <button
          type="button"
          className="button primary"
          onClick={() => dispatch({ type: 'rollDie' })}
        >
          {state.lastRoll
            ? t('table.rolled', { value: state.lastRoll.value })
            : t('table.roll')}
        </button>
        <button type="button" className="button" onClick={() => setSheet('fight')}>
          {t('table.fight')}
        </button>
        <button type="button" className="button" onClick={() => setSheet('log')}>
          {t('table.log')}
        </button>
        <button type="button" className="button" onClick={() => setSheet('settings')}>
          {t('table.settings')}
        </button>
      </nav>

      {sheet === 'fight' && <FightSheet game={game} onClose={closeSheet} />}
      {sheet === 'log' && <LogSheet game={game} onClose={closeSheet} />}
      {sheet === 'settings' && (
        <SettingsSheet game={game} onClose={closeSheet} onLeave={onLeave} onEnd={onEnd} />
      )}
    </main>
  );
}
