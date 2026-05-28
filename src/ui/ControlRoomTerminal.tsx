import { useTranslation } from 'react-i18next';
import styles from './ControlRoomTerminal.module.css';

export interface ControlRoomTerminalProps {
  inputBuffer: string[];
  inputFeedback: 'none' | 'wrong';
  onClose: () => void;
}

export function ControlRoomTerminal({
  inputBuffer,
  inputFeedback,
  onClose,
}: ControlRoomTerminalProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.overlay} data-testid="control-room-terminal">
      <div className={styles.panel}>
        <div className={styles.header}>{t('puzzle2.terminal.header')}</div>
        <div className={styles.prompt}>{t('puzzle2.terminal.prompt')}</div>
        <div className={`${styles.input} ${inputFeedback === 'wrong' ? styles.inputWrong : ''}`}>
          {'> '}
          {inputBuffer.join('')}
          {inputBuffer.length < 4 && inputFeedback !== 'wrong' && <span>_</span>}
        </div>
        {inputFeedback === 'wrong' && (
          <div className={styles.wrong}>{t('puzzle2.terminal.wrong')}</div>
        )}
        <div className={styles.instructions}>{t('puzzle2.terminal.instructions')}</div>
        <button type="button" className={styles.closeBtn} onClick={onClose}>
          {t('dialogue.close')}
        </button>
      </div>
    </div>
  );
}
