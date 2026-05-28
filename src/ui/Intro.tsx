import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { startAmbientMusic } from '../audio/ambientMusic';
import { IntroStarfield } from './IntroStarfield';
import styles from './Intro.module.css';

interface IntroProps {
  onStart: (playerName: string) => void;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function Intro({ onStart }: IntroProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [crawlStarted, setCrawlStarted] = useState(false);
  const [crawlDone, setCrawlDone] = useState(prefersReducedMotion);
  const audioUnlocked = useRef(false);

  const trimmedName = name.trim();

  const unlockAudio = () => {
    if (audioUnlocked.current) return;
    audioUnlocked.current = true;
    startAmbientMusic();
  };

  const beginCrawl = () => {
    unlockAudio();
    setCrawlStarted(true);
  };

  const finishCrawl = () => {
    unlockAudio();
    setCrawlDone(true);
  };

  const handleStart = () => {
    startAmbientMusic();
    onStart(trimmedName || 'Rebel');
  };

  return (
    <div className={styles.overlay} data-testid="intro">
      <IntroStarfield />

      {!crawlDone && (
        <div className={styles.crawlStage}>
          {!crawlStarted && <p className={styles.longTimeAgo}>{t('intro.longTimeAgo')}</p>}

          {crawlStarted && (
            <div className={styles.crawlViewport}>
              <div
                className={`${styles.crawl} ${styles.crawlRunning}`}
                onAnimationEnd={() => setCrawlDone(true)}
              >
                <h1 className={styles.crawlTitle}>{t('intro.title')}</h1>
                <div className={styles.crawlBody}>
                  <p>{t('intro.story1')}</p>
                  <p>{t('intro.story2')}</p>
                  <p>{t('intro.story3')}</p>
                </div>
              </div>
            </div>
          )}

          {!crawlStarted ? (
            <div className={styles.preCrawlActions}>
              <button
                type="button"
                className={styles.introBtn}
                onClick={beginCrawl}
                data-testid="begin-crawl"
              >
                {t('intro.beginCrawl')}
              </button>
              <button
                type="button"
                className={styles.introBtn}
                onClick={finishCrawl}
                data-testid="skip-crawl"
              >
                {t('intro.skipCrawl')}
              </button>
            </div>
          ) : (
            <button
              type="button"
              className={`${styles.introBtn} ${styles.skipCrawlSolo}`}
              onClick={finishCrawl}
              data-testid="skip-crawl"
            >
              {t('intro.skipCrawl')}
            </button>
          )}
        </div>
      )}

      <div
        className={crawlDone ? styles.controlsVisible : styles.controlsHidden}
        aria-hidden={!crawlDone}
      >
        <div className={styles.controlsPanel}>
          <input
            className={styles.nameInput}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              unlockAudio();
              if (e.key === 'Enter') handleStart();
            }}
            onPointerDown={unlockAudio}
            onPaste={unlockAudio}
            placeholder={t('intro.namePlaceholder')}
            maxLength={30}
            autoFocus={crawlDone}
            aria-label={t('intro.namePlaceholder')}
          />
          <button type="button" className={styles.startBtn} onClick={handleStart}>
            {t('intro.startButton')}
          </button>
        </div>
      </div>
    </div>
  );
}
