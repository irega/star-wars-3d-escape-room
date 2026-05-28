import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { startAmbientMusic } from '../audio/ambientMusic';
import styles from './Intro.module.css';

interface IntroProps {
  onStart: (playerName: string) => void;
}

export function Intro({ onStart }: IntroProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');

  const trimmedName = name.trim();
  const canStart = trimmedName.length > 0;
  const audioUnlocked = useRef(false);

  const unlockAudio = () => {
    if (audioUnlocked.current) return;
    audioUnlocked.current = true;
    startAmbientMusic();
  };

  const handleStart = () => {
    if (!canStart) return;
    startAmbientMusic();
    onStart(trimmedName);
  };

  return (
    <div className={styles.overlay} data-testid="intro">
      <div className={styles.panel}>
        <h1 className={styles.title}>{t('intro.title')}</h1>
        <p className={styles.story}>{t('intro.story1')}</p>
        <p className={styles.story}>{t('intro.story2')}</p>
        <p className={styles.story}>{t('intro.story3')}</p>
        <input
          className={styles.nameInput}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={unlockAudio}
          onPointerDown={unlockAudio}
          onPaste={unlockAudio}
          placeholder={t('intro.namePlaceholder')}
          maxLength={30}
          required
          autoFocus
          aria-label={t('intro.namePlaceholder')}
          aria-describedby="intro-name-hint"
        />
        <button
          type="button"
          className={styles.startBtn}
          onClick={handleStart}
          disabled={!canStart}
        >
          {t('intro.startButton')}
        </button>
      </div>
    </div>
  );
}
