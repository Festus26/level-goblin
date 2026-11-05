import type { Player } from '@level-goblin/shared';
import { useI18n } from '../i18n/i18n.tsx';
import { Art } from './Art.tsx';
import { Avatar } from './Avatar.tsx';
import { Sheet } from './Sheet.tsx';

export function WinSheet({ winner, onClose }: { winner: Player; onClose: () => void }) {
  const { t } = useI18n();
  return (
    <Sheet title={t('table.winner', { name: winner.name })} onClose={onClose}>
      <div className="win">
        <div className="win-art">
          <Avatar avatar={winner.avatar} mood="win" size={160} />
        </div>
        <Art name="coinSack" size={64} />
      </div>
    </Sheet>
  );
}
