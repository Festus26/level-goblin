import { useState } from 'react';
import { clearLocalGame, hasLocalGame } from './game/localGame.ts';
import { Home } from './screens/Home.tsx';
import { LocalTable } from './screens/LocalTable.tsx';
import { Setup } from './screens/Setup.tsx';

type Screen = 'home' | 'setup' | 'table';

export function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [canResume, setCanResume] = useState(hasLocalGame);

  if (screen === 'setup') {
    return <Setup onBack={() => setScreen('home')} onStart={() => setScreen('table')} />;
  }
  if (screen === 'table') {
    return (
      <LocalTable
        onLeave={() => {
          setCanResume(hasLocalGame());
          setScreen('home');
        }}
        onEnd={() => {
          clearLocalGame();
          setCanResume(false);
          setScreen('home');
        }}
      />
    );
  }
  return (
    <Home
      canResume={canResume}
      onNewGame={() => setScreen('setup')}
      onResume={() => setScreen('table')}
    />
  );
}
