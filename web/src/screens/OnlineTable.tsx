import { useEffect } from 'react';
import type { EndReason, SeatCredentials } from '@level-goblin/shared';
import { Art } from '../components/Art.tsx';
import { useOnlineGame } from '../game/onlineGame.ts';
import { useI18n } from '../i18n/i18n.tsx';
import { Table } from './Table.tsx';

interface OnlineTableProps {
  code: string;
  seat: SeatCredentials;
  showInvite: boolean;
  onLeave: () => void;
  onLeft: () => void;
  onEnded: (reason: EndReason) => void;
}

export function OnlineTable({
  code,
  seat,
  showInvite,
  onLeave,
  onLeft,
  onEnded,
}: OnlineTableProps) {
  const { t } = useI18n();
  const game = useOnlineGame(code, seat, onEnded);

  // Keeps a refresh on this session, and gives the address bar a link worth sharing.
  useEffect(() => {
    window.history.replaceState(null, '', `/?join=${code}`);
  }, [code]);

  if (!game) {
    return (
      <main className="page home">
        <div className="home-art">
          <Art name="goblinGrin" size={120} />
        </div>
        <p role="status">{t('online.connecting')}</p>
        <button type="button" className="button" onClick={onLeave}>
          {t('back')}
        </button>
      </main>
    );
  }

  return (
    <Table
      game={game}
      showInvite={showInvite}
      onLeave={onLeave}
      onLeft={onLeft}
      onEnd={() => game.online?.endSession()}
    />
  );
}
