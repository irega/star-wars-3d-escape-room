import { useState, useCallback, useEffect } from 'react';
import { Html } from '@react-three/drei';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../stores/useGameStore';
import { useInventoryStore } from '../stores/useInventoryStore';
import { InteractiveObject } from '../components/InteractiveObject';
import { ImperialRoomShell, TerminalConsole, imperialPalette } from '../three';
import { validateLaunchClearance, PUZZLE_4_ID, LAUNCH_FREQUENCY } from './hangarBayPuzzle';

export interface HangarBayProps {
  onDialogue?: (text: string | null) => void;
}

export function HangarBay({ onDialogue }: HangarBayProps) {
  const { t } = useTranslation();

  const [consoleActive, setConsoleActive] = useState(false);

  const hasKeycard = useInventoryStore((s) => s.hasItem('keycard'));
  const hasOverrideCode = useInventoryStore((s) => s.hasItem('override-code'));
  const hasFrequency = useInventoryStore((s) => s.hasItem('frequency'));

  const solvePuzzle = useGameStore((s) => s.solvePuzzle);
  const win = useGameStore((s) => s.win);
  const solvedPuzzles = useGameStore((s) => s.solvedPuzzles);
  const puzzleSolved = solvedPuzzles.includes(PUZZLE_4_ID);

  const canLaunch = validateLaunchClearance(hasKeycard, hasOverrideCode, hasFrequency);

  const handleConsoleClick = useCallback(() => {
    if (puzzleSolved || consoleActive) return;
    setConsoleActive(true);
  }, [puzzleSolved, consoleActive]);

  const handleLaunch = useCallback(() => {
    if (!canLaunch) return;
    solvePuzzle(PUZZLE_4_ID);
    win();
    setConsoleActive(false);
    onDialogue?.(t('puzzle4.launch.success'));
  }, [canLaunch, solvePuzzle, win, t, onDialogue]);

  const handleShuttleClick = useCallback(() => {
    if (!puzzleSolved) {
      onDialogue?.(t('puzzle4.shuttle.locked'));
    }
  }, [puzzleSolved, t, onDialogue]);

  const handleCloseConsole = useCallback(() => {
    setConsoleActive(false);
  }, []);

  // Close console modal on Escape key
  useEffect(() => {
    if (!consoleActive) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setConsoleActive(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [consoleActive]);

  const forceFieldEmissive = puzzleSolved ? '#000000' : '#0033cc';
  const forceFieldColor = puzzleSolved ? '#000033' : '#0044ff';
  const forceFieldOpacity = puzzleSolved ? 0 : 0.45;

  const consoleIndicatorColor = puzzleSolved
    ? imperialPalette.indicatorOpen
    : canLaunch
      ? '#ffaa00'
      : imperialPalette.indicatorLocked;
  const consoleIndicatorEmissive = puzzleSolved
    ? imperialPalette.indicatorOpenEmissive
    : canLaunch
      ? '#553300'
      : imperialPalette.indicatorLockedEmissive;

  return (
    <group>
      <pointLight position={[0, 3, -4]} intensity={0.75} color="#4466bb" distance={8} decay={2} />
      <pointLight position={[-4, 2.5, 0]} intensity={0.65} color="#aa4444" distance={6} decay={2} />
      <pointLight position={[4, 2.5, 0]} intensity={0.65} color="#aa4444" distance={6} decay={2} />
      <pointLight position={[0, 1.2, 2]} intensity={0.8} color="#7799cc" distance={10} decay={2} />
      <pointLight
        position={[0, 4.5, -2]}
        intensity={0.6}
        color="#aabbdd"
        distance={12}
        decay={1.5}
      />

      <ImperialRoomShell
        width={10}
        depth={12}
        height={6}
        ceilingY={6}
        floorColor={imperialPalette.deck}
        ceilingColor="#0a0a14"
        wallBackColor="#131322"
        wallSideColor="#12121e"
        sidePanelCount={3}
      />

      {/* Deck grid — longitudinal and transverse */}
      {([-4, -2, 0, 2, 4] as number[]).map((x) => (
        <mesh key={`grid-x-${x}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.001, 0]}>
          <planeGeometry args={[0.04, 12]} />
          <meshStandardMaterial color="#3a3a60" emissive="#2a2a48" emissiveIntensity={0.8} />
        </mesh>
      ))}
      {([-5, -3, -1, 1, 3, 5] as number[]).map((z) => (
        <mesh key={`grid-z-${z}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, z]}>
          <planeGeometry args={[10, 0.04]} />
          <meshStandardMaterial color="#3a3a60" emissive="#2a2a48" emissiveIntensity={0.8} />
        </mesh>
      ))}

      {/* Space viewport — back wall */}
      <group position={[0, 3.2, -5.92]}>
        <mesh>
          <boxGeometry args={[4.2, 2.4, 0.08]} />
          <meshStandardMaterial color="#0a0a1a" emissive="#001133" emissiveIntensity={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[3.6, 1.8]} />
          <meshStandardMaterial color="#000822" emissive="#113366" emissiveIntensity={0.55} />
        </mesh>
        {([-1.9, 1.9] as const).map((x) => (
          <mesh key={x} position={[x, 0, 0.04]}>
            <boxGeometry args={[0.12, 2.5, 0.1]} />
            <meshStandardMaterial color="#2a3048" emissive="#151a28" emissiveIntensity={0.15} />
          </mesh>
        ))}
      </group>

      <InteractiveObject onClick={handleShuttleClick}>
        <group position={[-0.5, 0, -4.5]}>
          <mesh position={[0, 1.1, 0]}>
            <boxGeometry args={[1.4, 1.0, 3.2]} />
            <meshStandardMaterial color="#282840" emissive="#0a0a18" emissiveIntensity={0.08} />
          </mesh>
          <mesh position={[0, 1.3, 1.7]}>
            <boxGeometry args={[0.9, 0.7, 0.8]} />
            <meshStandardMaterial color="#1e1e33" emissive="#080812" emissiveIntensity={0.06} />
          </mesh>
          <mesh position={[0, 1.4, 2.08]}>
            <boxGeometry args={[0.6, 0.3, 0.04]} />
            <meshStandardMaterial color="#001133" emissive="#002266" emissiveIntensity={1.2} />
          </mesh>
          <mesh position={[0, 2.5, -0.4]} rotation={[0.15, 0, 0]}>
            <boxGeometry args={[0.14, 2.2, 1.6]} />
            <meshStandardMaterial color="#282840" emissive="#0a0a18" emissiveIntensity={0.06} />
          </mesh>
          <mesh position={[-1.8, 0.5, -0.2]} rotation={[0, 0, 0.18]}>
            <boxGeometry args={[2.2, 0.12, 1.2]} />
            <meshStandardMaterial color="#20202e" emissive="#060610" emissiveIntensity={0.05} />
          </mesh>
          <mesh position={[1.8, 0.5, -0.2]} rotation={[0, 0, -0.18]}>
            <boxGeometry args={[2.2, 0.12, 1.2]} />
            <meshStandardMaterial color="#20202e" emissive="#060610" emissiveIntensity={0.05} />
          </mesh>
          {([-0.5, 0.5] as number[]).map((x) => (
            <mesh key={`strut-${x}`} position={[x, 0.18, 0.6]}>
              <boxGeometry args={[0.1, 0.36, 0.1]} />
              <meshStandardMaterial color="#30303f" />
            </mesh>
          ))}
          <mesh position={[0, 0.9, -1.65]}>
            <boxGeometry args={[0.5, 0.3, 0.08]} />
            <meshStandardMaterial
              color={puzzleSolved ? '#001166' : '#000033'}
              emissive={puzzleSolved ? '#003399' : '#000022'}
              emissiveIntensity={puzzleSolved ? 3.0 : 0.5}
            />
          </mesh>
        </group>
      </InteractiveObject>

      {!puzzleSolved && (
        <mesh position={[0, 2.5, -2.8]}>
          <planeGeometry args={[10, 5]} />
          <meshStandardMaterial
            color={forceFieldColor}
            emissive={forceFieldEmissive}
            emissiveIntensity={1.5}
            transparent
            opacity={forceFieldOpacity}
          />
        </mesh>
      )}
      {!puzzleSolved && (
        <>
          <mesh position={[-5, 2.5, -2.8]}>
            <boxGeometry args={[0.08, 5, 0.08]} />
            <meshStandardMaterial color="#0055ff" emissive="#0033cc" emissiveIntensity={2} />
          </mesh>
          <mesh position={[5, 2.5, -2.8]}>
            <boxGeometry args={[0.08, 5, 0.08]} />
            <meshStandardMaterial color="#0055ff" emissive="#0033cc" emissiveIntensity={2} />
          </mesh>
          <mesh position={[0, 5, -2.8]}>
            <boxGeometry args={[10, 0.08, 0.08]} />
            <meshStandardMaterial color="#0055ff" emissive="#0033cc" emissiveIntensity={2} />
          </mesh>
        </>
      )}

      <InteractiveObject onClick={handleConsoleClick} isDisabled={puzzleSolved || consoleActive}>
        <group position={[0, 0, -0.5]}>
          <TerminalConsole
            bodyWidth={1.6}
            screenColor={puzzleSolved ? '#003300' : '#001133'}
            screenEmissive={consoleIndicatorEmissive}
            indicatorColor={consoleIndicatorColor}
            indicatorEmissive={consoleIndicatorEmissive}
          >
            {(
              [
                [-0.35, 0.62, 0.27],
                [0, 0.62, 0.27],
                [0.35, 0.62, 0.27],
              ] as [number, number, number][]
            ).map((pos, i) => {
              const filled = [hasKeycard, hasOverrideCode, hasFrequency][i];
              return (
                <mesh key={i} position={pos}>
                  <boxGeometry args={[0.12, 0.08, 0.02]} />
                  <meshStandardMaterial
                    color={filled ? '#44ff44' : '#ff4444'}
                    emissive={filled ? '#004400' : '#440000'}
                    emissiveIntensity={1.5}
                  />
                </mesh>
              );
            })}
          </TerminalConsole>
        </group>
      </InteractiveObject>

      {consoleActive && (
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

              <div
                style={{
                  marginBottom: '0.75rem',
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
                    background: hasKeycard ? '#44ff44' : '#ff4444',
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '0.15rem' }}>
                    {t('puzzle4.console.slot1Label')}
                  </div>
                  <div style={{ fontSize: '0.95rem', color: hasKeycard ? '#44ff44' : '#884444' }}>
                    {hasKeycard ? t('puzzle4.console.slot1Filled') : t('puzzle4.console.slotEmpty')}
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginBottom: '0.75rem',
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
                    background: hasOverrideCode ? '#44ff44' : '#ff4444',
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '0.15rem' }}>
                    {t('puzzle4.console.slot2Label')}
                  </div>
                  <div
                    style={{ fontSize: '0.95rem', color: hasOverrideCode ? '#44ff44' : '#884444' }}
                  >
                    {hasOverrideCode
                      ? t('puzzle4.console.slot2Filled')
                      : t('puzzle4.console.slotEmpty')}
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginBottom: '1.5rem',
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
                    background: hasFrequency ? '#44ff44' : '#ff4444',
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '0.15rem' }}>
                    {t('puzzle4.console.slot3Label')}
                  </div>
                  <div style={{ fontSize: '0.95rem', color: hasFrequency ? '#44ff44' : '#884444' }}>
                    {hasFrequency
                      ? t('puzzle4.console.slot3Filled', { freq: LAUNCH_FREQUENCY })
                      : t('puzzle4.console.slotEmpty')}
                  </div>
                </div>
              </div>

              {!canLaunch && (
                <div style={{ color: '#ff6644', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  {t('puzzle4.console.incomplete')}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={handleLaunch}
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
                  onClick={handleCloseConsole}
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
        </Html>
      )}
    </group>
  );
}
