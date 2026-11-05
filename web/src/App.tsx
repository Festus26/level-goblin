import { useState } from 'react';
import { normalizeSessionCode, type EndReason } from '@level-goblin/shared';
import { clearLocalGame, hasLocalGame } from './game/localGame.ts';
import { forgetSeat, getSeat, lastSessionCode } from './game/sessionStore.ts';
import type { MessageKey } from './i18n/i18n.tsx';
import { CreateSession } from './screens/CreateSession.tsx';
import { Home } from './screens/Home.tsx';
import { JoinSession } from './screens/JoinSession.tsx';
import { LocalTable } from './screens/LocalTable.tsx';
import { OnlineTable } from './screens/OnlineTable.tsx';
import { Setup } from './screens/Setup.tsx';

type Screen =
  | { name: 'home' }
  | { name: 'setup' }
  | { name: 'localTable' }
  | { name: 'create' }
  | { name: 'join'; code: string }
  | { name: 'onlineTable'; code: string; showInvite: boolean };

function initialScreen(): Screen {
  const code = normalizeSessionCode(new URLSearchParams(window.location.search).get('join'));
  if (!code) return { name: 'home' };
  return getSeat(code)
    ? { name: 'onlineTable', code, showInvite: false }
    : { name: 'join', code };
}

const END_NOTICES: Record<EndReason, MessageKey> = {
  seatLost: 'errors.seatLost',
  sessionEnded: 'errors.sessionEnded',
};

export function App() {
  const [screen, setScreen] = useState<Screen>(initialScreen);
  const [notice, setNotice] = useState<MessageKey | null>(null);

  function goHome(message: MessageKey | null = null) {
    window.history.replaceState(null, '', '/');
    setNotice(message);
    setScreen({ name: 'home' });
  }

  switch (screen.name) {
    case 'setup':
      return (
        <Setup
          onBack={() => goHome()}
          onStart={() => setScreen({ name: 'localTable' })}
        />
      );
    case 'localTable':
      return (
        <LocalTable
          onLeave={() => goHome()}
          onEnd={() => {
            clearLocalGame();
            goHome();
          }}
        />
      );
    case 'create':
      return (
        <CreateSession
          onBack={() => goHome()}
          onCreated={(code) => setScreen({ name: 'onlineTable', code, showInvite: true })}
        />
      );
    case 'join':
      return (
        <JoinSession
          code={screen.code}
          onBack={() => goHome()}
          onJoined={() =>
            setScreen({ name: 'onlineTable', code: screen.code, showInvite: false })
          }
        />
      );
    case 'onlineTable': {
      const seat = getSeat(screen.code);
      if (!seat) return <JoinSession code={screen.code} onBack={() => goHome()} onJoined={() => setScreen({ ...screen })} />;
      return (
        <OnlineTable
          key={screen.code}
          code={screen.code}
          seat={seat}
          showInvite={screen.showInvite}
          onLeave={() => goHome()}
          onEnded={(reason) => {
            forgetSeat(screen.code);
            goHome(END_NOTICES[reason]);
          }}
        />
      );
    }
    case 'home':
      return (
        <Home
          canResumeLocal={hasLocalGame()}
          onlineCode={lastSessionCode()}
          notice={notice}
          onCreate={() => setScreen({ name: 'create' })}
          onJoin={(code) =>
            setScreen(
              getSeat(code)
                ? { name: 'onlineTable', code, showInvite: false }
                : { name: 'join', code },
            )
          }
          onResumeOnline={(code) =>
            setScreen({ name: 'onlineTable', code, showInvite: false })
          }
          onNewLocal={() => setScreen({ name: 'setup' })}
          onResumeLocal={() => setScreen({ name: 'localTable' })}
        />
      );
  }
}
