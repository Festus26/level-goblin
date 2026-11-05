import { canEditPlayer, findPlayer, type LogEntry } from '@level-goblin/shared';
import type { GameHandle } from '../game/handle.ts';
import { useI18n, type MessageKey } from '../i18n/i18n.tsx';
import { Sheet } from './Sheet.tsx';

const signed = (value: number | null) =>
  value !== null && value > 0 ? `+${value}` : String(value ?? '');

function messageKey(entry: LogEntry): MessageKey {
  switch (entry.type) {
    case 'undo':
      return entry.stat === 'gear' ? 'log.undoGear' : 'log.undoLevel';
    case 'roll':
      return entry.playerName === null ? 'log.rollTable' : 'log.roll';
    default:
      return `log.${entry.type}`;
  }
}

export function LogSheet({ game, onClose }: { game: GameHandle; onClose: () => void }) {
  const { t } = useI18n();
  const { state, me, dispatch } = game;
  const entries = [...state.log].reverse();

  const canUndo = (entry: LogEntry) =>
    (entry.type === 'level' || entry.type === 'gear') &&
    entry.playerId !== null &&
    findPlayer(state, entry.playerId) !== undefined &&
    canEditPlayer(state, me, entry.playerId);

  return (
    <Sheet title={t('log.title')} onClose={onClose}>
      {entries.length === 0 && <p>{t('log.empty')}</p>}
      <ol className="log">
        {entries.map((entry) => {
          const showsDelta = entry.type === 'level' || entry.type === 'gear';
          const byOther = entry.actorName !== null && entry.actorName !== entry.playerName;
          return (
            <li key={entry.id} data-undone={entry.undone}>
              <span>
                {t(messageKey(entry), {
                  name: entry.playerName ?? '',
                  value: showsDelta ? signed(entry.value) : (entry.value ?? ''),
                })}
                {byOther && (
                  <small> ({t('log.by', { name: entry.actorName ?? '' })})</small>
                )}
              </span>
              {entry.undone ? (
                <small>{t('log.undone')}</small>
              ) : (
                canUndo(entry) && (
                  <button
                    type="button"
                    className="button small"
                    onClick={() => dispatch({ type: 'undo', logId: entry.id })}
                  >
                    {t('log.undo')}
                  </button>
                )
              )}
            </li>
          );
        })}
      </ol>
    </Sheet>
  );
}
