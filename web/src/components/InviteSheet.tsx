import { useMemo, useState } from 'react';
import qrcode from 'qrcode-generator';
import { useI18n } from '../i18n/i18n.tsx';
import { Sheet } from './Sheet.tsx';

const QUIET_ZONE = 2;

function QrCode({ text, label }: { text: string; label: string }) {
  const { path, size } = useMemo(() => {
    const qr = qrcode(0, 'M');
    qr.addData(text);
    qr.make();
    const count = qr.getModuleCount();
    let d = '';
    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        if (qr.isDark(row, col)) d += `M${col + QUIET_ZONE} ${row + QUIET_ZONE}h1v1h-1z`;
      }
    }
    return { path: d, size: count + QUIET_ZONE * 2 };
  }, [text]);

  return (
    <svg className="qr" viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label}>
      <path d={path} fill="currentColor" />
    </svg>
  );
}

export const inviteUrl = (code: string): string =>
  `${window.location.origin}/?join=${code}`;

export function InviteSheet({ code, onClose }: { code: string; onClose: () => void }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const url = inviteUrl(code);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Some browsers block the clipboard. The code and QR still work.
    }
  }

  return (
    <Sheet title={t('invite.title')} onClose={onClose}>
      <QrCode text={url} label={t('invite.qr')} />
      <p className="session-code" aria-label={t('invite.code')}>
        {code}
      </p>
      <button type="button" className="button" onClick={copy}>
        {copied ? t('invite.copied') : t('invite.copy')}
      </button>
    </Sheet>
  );
}
