import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Intro.module.css';

interface IntroProps {
  onStart: (playerName: string) => void;
}

export function Intro({ onStart }: IntroProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');

  const handleStart = () => {
    onStart(name.trim() || 'Rebel');
  };

  return (
    <div className={styles.overlay} data-testid="intro">
      <h1 className={styles.title}>{t('intro.title')}</h1>
      <p className={styles.story}>{t('intro.story1')}</p>
      <p className={styles.story}>{t('intro.story2')}</p>
      <p className={styles.story}>{t('intro.story3')}</p>
      <input
        className={styles.nameInput}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('intro.namePlaceholder')}
        maxLength={30}
        aria-label={t('intro.namePlaceholder')}
      />
      <button className={styles.startBtn} onClick={handleStart}>
        {t('intro.startButton')}
      </button>
    </div>
  );
}
