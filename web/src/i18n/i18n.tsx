import { createContext, use, useEffect, useMemo, useState, type ReactNode } from 'react';
import en from './en.json';
import tr from './tr.json';

export type MessageKey = keyof typeof en;
export type Language = 'en' | 'tr';
type Params = Record<string, string | number>;

// Typing this way makes a key missing from tr.json a compile error.
const dictionaries: Record<Language, Record<MessageKey, string>> = { en, tr };

const STORAGE_KEY = 'level-goblin.language';

function initialLanguage(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'tr') return saved;
  } catch {
    // Storage can be blocked, so fall back to the browser's language.
  }
  return navigator.language.toLowerCase().startsWith('tr') ? 'tr' : 'en';
}

interface I18n {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: MessageKey, params?: Params) => string;
}

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState(initialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // The choice just won't be remembered next visit.
    }
  }, [language]);

  const value = useMemo<I18n>(
    () => ({
      language,
      setLanguage,
      t: (key, params = {}) =>
        dictionaries[language][key].replace(/\{(\w+)\}/g, (match, name: string) =>
          String(params[name] ?? match),
        ),
    }),
    [language],
  );

  return <I18nContext value={value}>{children}</I18nContext>;
}

export function useI18n(): I18n {
  const value = use(I18nContext);
  if (!value) throw new Error('useI18n must be used inside I18nProvider');
  return value;
}
