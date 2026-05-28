import type { ReactNode } from 'react';

export interface HologramScreenProps {
  emissive: string;
  emissiveIntensity?: number;
  faceEmissiveIntensity?: number;
  wallGlow?: boolean;
  children?: ReactNode;
}

/** Wall-mounted holographic display with bezel, glow face, and optional wall spill light. */
export function HologramScreen({
  emissive,
  emissiveIntensity = 1.8,
  faceEmissiveIntensity,
  wallGlow = true,
  children,
}: HologramScreenProps) {
  const faceIntensity = faceEmissiveIntensity ?? emissiveIntensity;

  return (
    <group>
      {wallGlow && (
        <pointLight
          position={[0, 0, -0.35]}
          color={emissive}
          intensity={0.45}
          distance={1.2}
          decay={2}
        />
      )}

      <mesh>
        <boxGeometry args={[0.85, 0.85, 0.06]} />
        <meshStandardMaterial
          color="#0a0a1a"
          emissive={emissive}
          emissiveIntensity={emissiveIntensity * 0.9}
        />
      </mesh>

      <mesh position={[0, 0, 0.04]}>
        <boxGeometry args={[0.7, 0.7, 0.01]} />
        <meshStandardMaterial
          color="#0a1420"
          emissive={emissive}
          emissiveIntensity={faceIntensity}
        />
      </mesh>

      <mesh position={[0, 0, 0.045]}>
        <boxGeometry args={[0.72, 0.72, 0.004]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.04} />
      </mesh>

      {children}
    </group>
  );
}
