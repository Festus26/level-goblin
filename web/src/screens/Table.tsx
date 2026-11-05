import { useEffect, useState } from 'react';
import { canMoveTurn, findPlayer, type ActionError } from '@level-goblin/shared';
import { Art, Die } from '../components/Art.tsx';
import { FightSheet } from '../components/FightSheet.tsx';
import { InviteSheet } from '../components/InviteSheet.tsx';
import { LogSheet } from '../components/LogSheet.tsx';
import { PlayerCard } from '../components/PlayerCard.tsx';
import { SettingsSheet } from '../components/SettingsSheet.tsx';
import { WinSheet } from '../components/WinSheet.tsx';
import type { GameHandle } from '../game/handle.ts';
import { useWakeLock } from '../game/useWakeLock.ts';
import { useI18n, type MessageKey } from '../i18n/i18n.tsx';

type OpenSheet = 'fight' | 'log' | 'settings' | 'invite' | null;

const rejectionKey = (error: ActionError): MessageKey =>
  error === 'forbidden' ? 'errors.forbidden' : 'errors.rejected';

interface TableProps {
  game: GameHandle;
  showInvite?: boolean;
  onLeave: () => void;
  onLeft?: () => void;
  onEnd: () => void;
}

export function Table({ game, showInvite = false, onLeave, onLeft, onEnd }: TableProps) {
  useWakeLock();
  const { t } = useI18n();
  const { state, me, dispatch, online } = game;
  const [sheet, setSheet] = useState<OpenSheet>(showInvite ? 'invite' : null);
  // Starts as the current winner so that a refresh doesn't celebrate a second time.
  const [celebrated, setCelebrated] = useState(state.winnerId);
  const turnPlayer = findPlayer(state, state.turnPlayerId);
  const winner = findPlayer(state, state.winnerId);
  const { lastRoll } = state;
  const closeSheet = () => setSheet(null);

  useEffect(() => {
    if (state.winnerId === null) setCelebrated(null);
  }, [state.winnerId]);

  return (
    <main className="page table">
      {online?.status === 'reconnecting' && (
        <p className="connection" role="status">
          {t('online.reconnecting')}
        </p>
      )}
      {online?.rejected && (
        <button type="button" className="notice" onClick={online.dismissRejected}>
          {t(rejectionKey(online.rejected))}
        </button>
      )}
      {online && (
        <div className="session-bar">
          <span>{t('online.session', { code: online.code })}</span>
          <button
            type="button"
            className="button small"
            onClick={() => setSheet('invite')}
          >
            {t('invite.title')}
          </button>
        </div>
      )}
      {winner && (
        <p className="winner">
          <Art name="coinSack" size={32} />
          {t('table.winner', { name: winner.name })}
        </p>
      )}

      <div className="turn-bar">
        <Art name="goblinGrin" size={44} />
        <strong>{turnPlayer && t('table.turn', { name: turnPlayer.name })}</strong>
        <button
          type="button"
          className="button small with-art"
          disabled={!canMoveTurn(state, me)}
          onClick={() => dispatch({ type: 'nextTurn' })}
        >
          <Art name="signpost" />
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
          <span key={lastRoll?.at} className="roll-art">
            <Die value={lastRoll?.value ?? 5} />
          </span>
          {lastRoll ? t('table.rolled', { value: lastRoll.value }) : t('table.roll')}
        </button>
        <button type="button" className="button" onClick={() => setSheet('fight')}>
          <Art name="sword" />
          {t('table.fight')}
        </button>
        <button type="button" className="button" onClick={() => setSheet('log')}>
          <Art name="scroll" />
          {t('table.log')}
        </button>
        <button type="button" className="button" onClick={() => setSheet('settings')}>
          <Art name="cog" />
          {t('table.settings')}
        </button>
      </nav>

      {sheet === 'fight' && <FightSheet game={game} onClose={closeSheet} />}
      {sheet === 'log' && <LogSheet game={game} onClose={closeSheet} />}
      {sheet === 'settings' && (
        <SettingsSheet
          game={game}
          onClose={closeSheet}
          onLeave={onLeave}
          onLeft={() => {
            closeSheet();
            onLeft?.();
          }}
          onEnd={onEnd}
        />
      )}
      {sheet === 'invite' && online && (
        <InviteSheet code={online.code} onClose={closeSheet} />
      )}
      {winner && celebrated !== winner.id && (
        <WinSheet name={winner.name} onClose={() => setCelebrated(winner.id)} />
      )}
    </main>
  );
}
