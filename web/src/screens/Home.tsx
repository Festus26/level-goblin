import { Art } from '../components/Art.tsx';
import { LanguagePicker } from '../components/LanguagePicker.tsx';
import { SITE_NAME } from '../config.ts';
import { useI18n } from '../i18n/i18n.tsx';

interface HomeProps {
  canResume: boolean;
  onNewGame: () => void;
  onResume: () => void;
}

export function Home({ canResume, onNewGame, onResume }: HomeProps) {
  const { t } = useI18n();
  return (
    <main className="page home">
      <div className="home-art">
        <Art name="goblinGrin" size={168} />
      </div>
      <h1>{SITE_NAME}</h1>
      <p>{t('tagline')}</p>
      {canResume && (
        <button type="button" className="button primary" onClick={onResume}>
          {t('home.resume')}
        </button>
      )}
      <button
        type="button"
        className={canResume ? 'button' : 'button primary'}
        onClick={onNewGame}
      >
        {t('home.newGame')}
      </button>
      <LanguagePicker />
      <footer>{t('disclaimer')}</footer>
    </main>
  );
}
