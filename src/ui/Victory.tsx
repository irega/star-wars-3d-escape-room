import { useTranslation } from 'react-i18next';
import styles from './Victory.module.css';

interface VictoryProps {
  playerName?: string;
  time?: string;
  onReplay?: () => void;
}

export function Victory({ playerName = 'Rebel', time, onReplay }: VictoryProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.overlay}>
      <p className={styles.message}>{t('victory.message', { name: playerName })}</p>
      {time && <p className={styles.time}>{t('victory.time', { time })}</p>}
      <button className={styles.replayBtn} onClick={onReplay}>
        {t('victory.replay')}
      </button>
    </div>
  );
}
