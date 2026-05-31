import { useTranslation } from 'react-i18next';
import { Html } from '@react-three/drei';

interface DroidSchematicModalProps {
  onClose: () => void;
}

export function DroidSchematicModal({ onClose }: DroidSchematicModalProps) {
  const { t } = useTranslation();

  return (
    <Html fullscreen>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.8)',
          zIndex: 30,
          fontFamily: '"Courier New", Courier, monospace',
        }}
      >
        <div
          style={{
            border: '1px solid #44aaff',
            padding: '2rem',
            background: 'rgba(0,8,24,0.97)',
            minWidth: '400px',
            color: '#44aaff',
          }}
        >
          <div style={{ fontSize: '0.75rem', marginBottom: '0.5rem', opacity: 0.7 }}>
            {t('puzzle3.schematic.header')}
          </div>
          <div style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>
            {t('puzzle3.schematic.prompt')}
          </div>
          <div style={{ fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 2 }}>
            <div>
              <span style={{ color: '#4488ff' }}>■</span> {t('puzzle3.schematic.cell0')}
            </div>
            <div>
              <span style={{ color: '#ff8833' }}>■</span> {t('puzzle3.schematic.cell1')}
            </div>
            <div>
              <span style={{ color: '#44cc66' }}>■</span> {t('puzzle3.schematic.cell2')}
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '1rem' }}>
            {t('puzzle3.schematic.instructions')}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid #44aaff',
              color: '#44aaff',
              padding: '0.4rem 1rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.85rem',
            }}
          >
            {t('dialogue.close')}
          </button>
        </div>
      </div>
    </Html>
  );
}
