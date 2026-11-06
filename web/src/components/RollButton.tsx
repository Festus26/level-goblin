import type { GameHandle } from '../game/handle.ts';
import { useI18n } from '../i18n/i18n.tsx';
import { Die } from './Art.tsx';

interface RollButtonProps {
  game: GameHandle;
  primary?: boolean;
}

/** Everyone shares one die, so a roll here is the same roll the table shows. */
export function RollButton({ game, primary = false }: RollButtonProps) {
  const { t } = useI18n();
  const { lastRoll } = game.state;

  return (
    <button
      type="button"
      className={primary ? 'button primary' : 'button'}
      onClick={() => game.dispatch({ type: 'rollDie' })}
    >
      <span key={lastRoll?.at} className="roll-art">
        <Die value={lastRoll?.value ?? 5} />
      </span>
      {lastRoll ? t('table.rolled', { value: lastRoll.value }) : t('table.roll')}
    </button>
  );
}
