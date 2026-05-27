import { useTranslation } from 'react-i18next';
import styles from './HUD.module.css';

interface HUDProps {
  inventory: string[];
  hint?: string;
  announcement?: string;
}

export function HUD({ inventory, hint, announcement }: HUDProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.hud}>
      <div className={styles.inventory}>
        <div className={styles.inventoryLabel}>{t('hud.inventory')}</div>
        <ul className={styles.inventoryList}>
          {inventory.map((item) => (
            <li key={item} className={styles.inventoryItem}>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {hint && (
        <div className={styles.hint}>
          <div className={styles.hintLabel}>{t('hud.hint')}</div>
          <div className={styles.hintText}>{hint}</div>
        </div>
      )}

      <div role="status" aria-live="polite" className={styles.srOnly}>
        {announcement ?? ''}
      </div>
    </div>
  );
}
