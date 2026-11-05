import { useState } from 'react';
import { normalizeSessionCode } from '@level-goblin/shared';
import { Art } from '../components/Art.tsx';
import { LanguagePicker } from '../components/LanguagePicker.tsx';
import { SITE_NAME } from '../config.ts';
import { useI18n, type MessageKey } from '../i18n/i18n.tsx';

interface HomeProps {
  canResumeLocal: boolean;
  onlineCode: string | null;
  notice: MessageKey | null;
  onCreate: () => void;
  onJoin: (code: string) => void;
  onResumeOnline: (code: string) => void;
  onNewLocal: () => void;
  onResumeLocal: () => void;
}

export function Home({
  canResumeLocal,
  onlineCode,
  notice,
  onCreate,
  onJoin,
  onResumeOnline,
  onNewLocal,
  onResumeLocal,
}: HomeProps) {
  const { t } = useI18n();
  const [code, setCode] = useState('');
  const normalized = normalizeSessionCode(code);

  return (
    <main className="page home">
      <div className="home-art">
        <Art name="goblinGrin" size={140} />
      </div>
      <h1>{SITE_NAME}</h1>
      <p>{t('tagline')}</p>
      {notice && (
        <p className="alert" role="alert">
          {t(notice)}
        </p>
      )}

      {onlineCode && (
        <button
          type="button"
          className="button"
          onClick={() => onResumeOnline(onlineCode)}
        >
          {t('home.resumeOnline', { code: onlineCode })}
        </button>
      )}
      <button type="button" className="button primary" onClick={onCreate}>
        {t('home.create')}
      </button>
      <form
        className="inline-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (normalized) onJoin(normalized);
        }}
      >
        <input
          className="code-input"
          aria-label={t('home.code')}
          placeholder={t('home.code')}
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          value={code}
          onChange={(event) => setCode(event.target.value)}
        />
        <button type="submit" className="button small" disabled={!normalized}>
          {t('home.join')}
        </button>
      </form>

      {canResumeLocal && (
        <button type="button" className="button" onClick={onResumeLocal}>
          {t('home.resume')}
        </button>
      )}
      <button type="button" className="button" onClick={onNewLocal}>
        {t('home.newGame')}
      </button>
      <LanguagePicker />
      <footer>{t('disclaimer')}</footer>
    </main>
  );
}
