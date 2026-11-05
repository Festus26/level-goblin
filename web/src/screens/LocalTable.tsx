import { useLocalGame } from '../game/localGame.ts';
import { Table } from './Table.tsx';

interface LocalTableProps {
  onLeave: () => void;
  onEnd: () => void;
}

export function LocalTable({ onLeave, onEnd }: LocalTableProps) {
  const game = useLocalGame();
  return <Table game={game} onLeave={onLeave} onEnd={onEnd} />;
}
