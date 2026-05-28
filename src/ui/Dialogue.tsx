import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Dialogue.module.css';

interface DialogueProps {
  text: string;
  isOpen: boolean;
  onClose?: () => void;
}

export function Dialogue({ text, isOpen, onClose }: DialogueProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.box} onClick={(e) => e.stopPropagation()}>
        <p className={styles.text}>{text}</p>
        <button className={styles.closeBtn} onClick={onClose} aria-label={t('dialogue.close')}>
          {t('dialogue.close')}
        </button>
      </div>
    </div>
  );
}
