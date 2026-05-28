import type { ReactNode } from 'react';
import { imperialPalette } from './palette';

export interface TerminalConsoleProps {
  screenColor: string;
  screenEmissive: string;
  screenEmissiveIntensity?: number;
  indicatorColor: string;
  indicatorEmissive: string;
  bodyWidth?: number;
  bodyDepth?: number;
  /** Extra meshes in front of the keyboard row (e.g. hangar slot LEDs). */
  children?: ReactNode;
}

/** Imperial terminal with bezel screen, keyboard row, and status LED. */
export function TerminalConsole({
  screenColor,
  screenEmissive,
  screenEmissiveIntensity = 1.5,
  indicatorColor,
  indicatorEmissive,
  bodyWidth = 1.4,
  bodyDepth = 0.5,
  children,
}: TerminalConsoleProps) {
  const screenW = bodyWidth - 0.3;
  const keyboardW = bodyWidth - 0.4;

  return (
    <group>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[bodyWidth, 1.0, bodyDepth]} />
        <meshStandardMaterial color={imperialPalette.consoleBody} emissive="#000011" />
      </mesh>

      {/* Screen bezel */}
      <mesh position={[0, 0.65, bodyDepth / 2 - 0.01]}>
        <boxGeometry args={[screenW + 0.12, 0.62, 0.04]} />
        <meshStandardMaterial
          color="#050510"
          emissive={imperialPalette.frameEmissive}
          emissiveIntensity={0.12}
        />
      </mesh>

      {/* Screen face */}
      <mesh position={[0, 0.65, bodyDepth / 2 + 0.01]}>
        <boxGeometry args={[screenW, 0.55, 0.02]} />
        <meshStandardMaterial
          color={screenColor}
          emissive={screenEmissive}
          emissiveIntensity={screenEmissiveIntensity}
        />
      </mesh>

      {/* Glass highlight */}
      <mesh position={[0, 0.65, bodyDepth / 2 + 0.03]}>
        <boxGeometry args={[screenW - 0.08, 0.48, 0.005]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.06}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      <mesh position={[0, 0.18, bodyDepth / 2 + 0.01]}>
        <boxGeometry args={[keyboardW, 0.12, 0.02]} />
        <meshStandardMaterial color={imperialPalette.consoleKeyboard} emissive="#001133" />
      </mesh>

      <mesh position={[bodyWidth / 2 - 0.2, 0.18, bodyDepth / 2 + 0.02]}>
        <boxGeometry args={[0.08, 0.08, 0.02]} />
        <meshStandardMaterial
          color={indicatorColor}
          emissive={indicatorEmissive}
          emissiveIntensity={2}
        />
      </mesh>

      {children}
    </group>
  );
}
