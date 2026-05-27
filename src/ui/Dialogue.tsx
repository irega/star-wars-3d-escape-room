import { useTranslation } from 'react-i18next';
import styles from './Dialogue.module.css';

interface DialogueProps {
  text: string;
  isOpen: boolean;
  onClose?: () => void;
}

export function Dialogue({ text, isOpen, onClose }: DialogueProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.box}>
        <p className={styles.text}>{text}</p>
        <button className={styles.closeBtn} onClick={onClose} aria-label={t('dialogue.close')}>
          {t('dialogue.close')}
        </button>
      </div>
    </div>
  );
}
