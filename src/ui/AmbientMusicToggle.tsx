import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isAmbientMuted, toggleAmbientMute } from '../audio/ambientMusic';
import styles from './AmbientMusicToggle.module.css';

export function AmbientMusicToggle() {
  const { t } = useTranslation();
  const [muted, setMuted] = useState(isAmbientMuted);

  const handleClick = () => {
    setMuted(toggleAmbientMute());
  };

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={handleClick}
      aria-pressed={muted}
      aria-label={muted ? t('audio.unmute') : t('audio.mute')}
      data-testid="ambient-music-toggle"
    >
      {muted ? t('audio.off') : t('audio.on')}
    </button>
  );
}
