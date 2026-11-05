import { Art, type ArtName } from './Art.tsx';

interface StepperProps {
  label: string;
  art?: ArtName;
  value: number;
  onChange: (delta: number) => void;
  increaseLabel?: string;
  decreaseLabel?: string;
  disabled?: boolean;
  /** Show a plus sign on positive numbers, for bonuses. */
  signed?: boolean;
}

export function Stepper({
  label,
  art,
  value,
  onChange,
  increaseLabel = `${label} +1`,
  decreaseLabel = `${label} -1`,
  disabled = false,
  signed = false,
}: StepperProps) {
  return (
    <div className="stepper">
      <span className="stepper-label">
        {art && <Art name={art} size={20} />}
        {label}
      </span>
      <div className="stepper-controls">
        <button
          type="button"
          aria-label={decreaseLabel}
          disabled={disabled}
          onClick={() => onChange(-1)}
        >
          −
        </button>
        <span className="stepper-value">{signed && value > 0 ? `+${value}` : value}</span>
        <button
          type="button"
          aria-label={increaseLabel}
          disabled={disabled}
          onClick={() => onChange(1)}
        >
          +
        </button>
      </div>
    </div>
  );
}
