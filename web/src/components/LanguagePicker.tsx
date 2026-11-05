import { useI18n, type Language } from '../i18n/i18n.tsx';

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'tr', label: 'Türkçe' },
];

export function LanguagePicker() {
  const { language, setLanguage, t } = useI18n();
  return (
    <div className="segmented" role="group" aria-label={t('language')}>
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          aria-pressed={language === code}
          onClick={() => setLanguage(code)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
