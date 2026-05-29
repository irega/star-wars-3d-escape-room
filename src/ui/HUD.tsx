import { useTranslation } from 'react-i18next';
import type { Room } from '../stores/useGameStore';
import styles from './HUD.module.css';

interface HUDProps {
  inventory: string[];
  currentRoom?: Room;
  hint?: string;
  announcement?: string;
}

export function HUD({ inventory, currentRoom, hint, announcement }: HUDProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.hud}>
      <div className={styles.topBar}>
        <div className={styles.inventory}>
          <div className={styles.panelLabel}>{t('hud.inventory')}</div>
          <ul className={styles.inventoryList}>
            {inventory.map((item) => (
              <li key={item} className={styles.inventoryItem}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {currentRoom && (
          <div className={styles.location}>
            <div className={styles.panelLabel}>{t('hud.location')}</div>
            <div className={styles.locationName}>{t(`hud.rooms.${currentRoom}`)}</div>
          </div>
        )}
      </div>

      {hint && (
        <div className={styles.hint} data-testid="hud-hint">
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
