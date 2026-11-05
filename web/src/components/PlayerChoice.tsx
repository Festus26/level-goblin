import { strength, type GameState, type Player } from '@level-goblin/shared';
import { PlayerAvatar } from './Avatar.tsx';

interface PlayerChoiceProps {
  label: string;
  state: GameState;
  players: Player[];
  value: string | null;
  onChange: (playerId: string | null) => void;
  /** Adds a "nobody" option with this text. */
  noneLabel?: string;
}

/** Picks one player. A native select can't show portraits, so these are radio rows. */
export function PlayerChoice({
  label,
  state,
  players,
  value,
  onChange,
  noneLabel,
}: PlayerChoiceProps) {
  return (
    <div className="field">
      <span id={`choice-${label}`}>{label}</span>
      <div className="player-choice" role="radiogroup" aria-labelledby={`choice-${label}`}>
        {noneLabel !== undefined && (
          <button
            type="button"
            role="radio"
            aria-checked={value === null}
            onClick={() => onChange(null)}
          >
            {noneLabel}
          </button>
        )}
        {players.map((player) => (
          <button
            key={player.id}
            type="button"
            role="radio"
            aria-checked={value === player.id}
            onClick={() => onChange(player.id)}
          >
            <PlayerAvatar state={state} player={player} size={40} />
            <span>
              {player.name} ({strength(player)})
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
