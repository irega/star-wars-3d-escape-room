import { useTranslation } from 'react-i18next';
import styles from './Loading.module.css';

interface LoadingProps {
  isVisible?: boolean;
}

export function Loading({ isVisible = true }: LoadingProps) {
  const { t } = useTranslation();

  if (!isVisible) return null;

  return (
    <div className={styles.overlay}>
      <p role="status" className={styles.message}>
        {t('loading.message')}
      </p>
    </div>
  );
}
