import { useEffect, useRef, type ReactNode } from 'react';
import { useI18n } from '../i18n/i18n.tsx';

interface SheetProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** A modal panel. The native dialog handles focus trapping and the Escape key. */
export function Sheet({ title, onClose, children }: SheetProps) {
  const { t } = useI18n();
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (element && !element.open) element.showModal();
  }, []);

  return (
    <dialog
      ref={dialog}
      className="sheet"
      aria-label={title}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialog.current) onClose();
      }}
    >
      <div className="sheet-body">
        <header className="sheet-header">
          <h2>{title}</h2>
          <button type="button" className="button small" onClick={onClose}>
            {t('close')}
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}
