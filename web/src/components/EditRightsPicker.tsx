import type { EditRights } from '@level-goblin/shared';
import { useI18n, type MessageKey } from '../i18n/i18n.tsx';

const OPTIONS: { value: EditRights; label: MessageKey }[] = [
  { value: 'ownAndHost', label: 'rights.ownAndHost' },
  { value: 'own', label: 'rights.own' },
  { value: 'everyone', label: 'rights.everyone' },
];

interface EditRightsPickerProps {
  value: EditRights;
  onChange: (value: EditRights) => void;
  disabled?: boolean;
}

export function EditRightsPicker({ value, onChange, disabled }: EditRightsPickerProps) {
  const { t } = useI18n();
  return (
    <fieldset className="rights" disabled={disabled}>
      <legend>{t('rights.title')}</legend>
      {OPTIONS.map((option) => (
        <label key={option.value}>
          <input
            type="radio"
            name="edit-rights"
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          <span>{t(option.label)}</span>
        </label>
      ))}
    </fieldset>
  );
}
