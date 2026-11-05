import { useState } from 'react';
import { AVATARS } from '@level-goblin/shared';
import { useI18n, type MessageKey } from '../i18n/i18n.tsx';
import { Avatar } from './Avatar.tsx';
import { Sheet } from './Sheet.tsx';

interface AvatarPickerProps {
  value: string;
  onPick: (avatar: string) => void;
  onClose: () => void;
}

export function AvatarPicker({ value, onPick, onClose }: AvatarPickerProps) {
  const { t } = useI18n();

  function label(avatar: string): string {
    const [race, cls] = avatar.split('-');
    return `${t(`race.${race}` as MessageKey)} ${t(`class.${cls}` as MessageKey)}`;
  }

  return (
    <Sheet title={t('avatar.title')} onClose={onClose}>
      <div className="avatar-grid">
        {AVATARS.map((avatar) => (
          <button
            key={avatar}
            type="button"
            aria-label={label(avatar)}
            aria-pressed={avatar === value}
            onClick={() => {
              onPick(avatar);
              onClose();
            }}
          >
            <Avatar avatar={avatar} size={56} />
          </button>
        ))}
      </div>
    </Sheet>
  );
}

interface AvatarButtonProps {
  value: string;
  label: string;
  size?: number;
  onPick: (avatar: string) => void;
}

/** Shows a portrait, and opens the picker when tapped. */
export function AvatarButton({ value, label, size = 64, onPick }: AvatarButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="avatar-button"
        aria-label={label}
        onClick={() => setOpen(true)}
      >
        <Avatar avatar={value} size={size} />
      </button>
      {open && (
        <AvatarPicker value={value} onPick={onPick} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
