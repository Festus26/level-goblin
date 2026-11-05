import { useI18n } from '../i18n/i18n.tsx';
import { Art } from './Art.tsx';
import { Sheet } from './Sheet.tsx';

export function WinSheet({ name, onClose }: { name: string; onClose: () => void }) {
  const { t } = useI18n();
  const title = t('table.winner', { name });
  return (
    <Sheet title={title} onClose={onClose}>
      <div className="win">
        <div className="win-art">
          <Art name="goblinGreedy" size={160} />
        </div>
        <Art name="coinSack" size={64} />
      </div>
    </Sheet>
  );
}
