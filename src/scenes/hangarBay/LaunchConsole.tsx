import { useEffect } from 'react';
import { Html } from '@react-three/drei';
import { useTranslation } from 'react-i18next';
import { InteractiveObject } from '../../components/InteractiveObject';
import { TerminalConsole, imperialPalette } from '../../three';
import { PropBox } from '../../three/primitives';
import { LAUNCH_FREQUENCY } from '../corridor/launchFrequency';

export interface LaunchConsoleProps {
  position: [number, number, number];
  active: boolean;
  disabled: boolean;
  puzzleSolved: boolean;
  canLaunch: boolean;
  slotsFilled: [boolean, boolean, boolean];
  onOpen: () => void;
  onClose: () => void;
  onLaunch: () => void;
  testId?: string;
}

/** Launch clearance terminal — 3D console + fullscreen modal UI. */
export function LaunchConsole({
  position,
  active,
  disabled,
  puzzleSolved,
  canLaunch,
  slotsFilled,
  onOpen,
  onClose,
  onLaunch,
  testId = 'console',
}: LaunchConsoleProps) {
  const { t } = useTranslation();
  const [hasKeycard, hasOverrideCode, hasFrequency] = slotsFilled;

  useEffect(() => {
    if (!active) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter' && canLaunch) onLaunch();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active, onClose, canLaunch, onLaunch]);

  const indicatorColor = puzzleSolved
    ? imperialPalette.indicatorOpen
    : canLaunch
      ? '#ffaa00'
      : imperialPalette.indicatorLocked;
  const indicatorEmissive = puzzleSolved
    ? imperialPalette.indicatorOpenEmissive
    : canLaunch
      ? '#553300'
      : imperialPalette.indicatorLockedEmissive;

  const slotPositions: [number, number, number][] = [
    [-0.35, 0.62, 0.27],
    [0, 0.62, 0.27],
    [0.35, 0.62, 0.27],
  ];

  return (
    <>
      <InteractiveObject testId={testId} onClick={onOpen} isDisabled={disabled}>
        <group position={position}>
          <TerminalConsole
            bodyWidth={1.6}
            screenColor={puzzleSolved ? '#003300' : '#001133'}
            screenEmissive={indicatorEmissive}
            indicatorColor={indicatorColor}
            indicatorEmissive={indicatorEmissive}
          >
            {slotPositions.map((pos, i) => {
              const filled = slotsFilled[i];
              return (
                <PropBox
                  key={i}
                  position={pos}
                  size={[0.12, 0.08, 0.02]}
                  color={filled ? '#44ff44' : '#ff4444'}
                  emissive={filled ? '#004400' : '#440000'}
                  emissiveIntensity={1.5}
                />
              );
            })}
          </TerminalConsole>
        </group>
      </InteractiveObject>

      {active && (
        <Html fullscreen>
          <LaunchConsoleModal
            hasKeycard={hasKeycard}
            hasOverrideCode={hasOverrideCode}
            hasFrequency={hasFrequency}
            canLaunch={canLaunch}
            onLaunch={onLaunch}
            onClose={onClose}
            t={t}
          />
        </Html>
      )}
    </>
  );
}

interface LaunchConsoleModalProps {
  hasKeycard: boolean;
  hasOverrideCode: boolean;
  hasFrequency: boolean;
  canLaunch: boolean;
  onLaunch: () => void;
  onClose: () => void;
  t: (key: string, opts?: Record<string, unknown>) => string;
}

function LaunchConsoleModal({
  hasKeycard,
  hasOverrideCode,
  hasFrequency,
  canLaunch,
  onLaunch,
  onClose,
  t,
}: LaunchConsoleModalProps) {
  return (
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
          border: '1px solid #ffd700',
          padding: '2rem',
          background: 'rgba(0,0,16,0.97)',
          minWidth: '420px',
          color: '#ffd700',
        }}
      >
        <div style={{ fontSize: '0.75rem', marginBottom: '0.5rem', opacity: 0.7 }}>
          {t('puzzle4.console.header')}
        </div>
        <div style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
          {t('puzzle4.console.prompt')}
        </div>

        <ConsoleSlot
          filled={hasKeycard}
          label={t('puzzle4.console.slot1Label')}
          value={hasKeycard ? t('puzzle4.console.slot1Filled') : t('puzzle4.console.slotEmpty')}
        />
        <ConsoleSlot
          filled={hasOverrideCode}
          label={t('puzzle4.console.slot2Label')}
          value={
            hasOverrideCode ? t('puzzle4.console.slot2Filled') : t('puzzle4.console.slotEmpty')
          }
        />
        <ConsoleSlot
          filled={hasFrequency}
          label={t('puzzle4.console.slot3Label')}
          value={
            hasFrequency
              ? t('puzzle4.console.slot3Filled', { freq: LAUNCH_FREQUENCY })
              : t('puzzle4.console.slotEmpty')
          }
          isLast
        />

        {!canLaunch && (
          <div style={{ color: '#ff6644', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {t('puzzle4.console.incomplete')}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onLaunch}
            disabled={!canLaunch}
            style={{
              background: canLaunch ? 'rgba(0,68,0,0.6)' : 'transparent',
              border: `1px solid ${canLaunch ? '#44ff44' : '#444'}`,
              color: canLaunch ? '#44ff44' : '#555',
              padding: '0.5rem 1.25rem',
              cursor: canLaunch ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
              fontSize: '0.9rem',
              letterSpacing: '0.1em',
            }}
          >
            {t('puzzle4.console.launch')}
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid #ffd700',
              color: '#ffd700',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.85rem',
            }}
          >
            {t('dialogue.close')}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConsoleSlot({
  filled,
  label,
  value,
  isLast,
}: {
  filled: boolean;
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <div
      style={{
        marginBottom: isLast ? '1.5rem' : '0.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: '12px',
          height: '12px',
          borderRadius: '2px',
          background: filled ? '#44ff44' : '#ff4444',
          flexShrink: 0,
        }}
      />
      <div>
        <div style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '0.15rem' }}>{label}</div>
        <div style={{ fontSize: '0.95rem', color: filled ? '#44ff44' : '#884444' }}>{value}</div>
      </div>
    </div>
  );
}
