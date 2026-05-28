import { imperialPalette } from './palette';

export interface BlastDoorProps {
  unlocked?: boolean;
}

const FRAME_EDGES: { pos: [number, number, number]; args: [number, number, number] }[] = [
  { pos: [-1.0, 0, 0], args: [0.2, 2.8, 0.1] },
  { pos: [1.0, 0, 0], args: [0.2, 2.8, 0.1] },
  { pos: [0, 1.3, 0], args: [2.2, 0.2, 0.1] },
  { pos: [0, -1.3, 0], args: [2.2, 0.2, 0.1] },
];

/** Solid blast door with visible frame, panel, seam, and status LED. */
export function BlastDoor({ unlocked = false }: BlastDoorProps) {
  const panelColor = unlocked ? imperialPalette.doorOpen : imperialPalette.doorLocked;
  const panelEmissive = unlocked
    ? imperialPalette.doorOpenEmissive
    : imperialPalette.doorLockedEmissive;
  const indicatorColor = unlocked ? imperialPalette.indicatorOpen : imperialPalette.indicatorLocked;
  const indicatorEmissive = unlocked
    ? imperialPalette.indicatorOpenEmissive
    : imperialPalette.indicatorLockedEmissive;

  return (
    <group>
      {FRAME_EDGES.map(({ pos, args }, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={args} />
          <meshStandardMaterial
            color={imperialPalette.frame}
            emissive={imperialPalette.frameEmissive}
            emissiveIntensity={0.18}
            metalness={0.35}
            roughness={0.55}
          />
        </mesh>
      ))}

      <mesh>
        <boxGeometry args={[1.6, 2.4, 0.06]} />
        <meshStandardMaterial
          color={panelColor}
          emissive={panelEmissive}
          emissiveIntensity={unlocked ? 0.2 : 0.15}
        />
      </mesh>

      <mesh position={[0, 0, 0.04]}>
        <boxGeometry args={[0.04, 2.4, 0.02]} />
        <meshStandardMaterial color="#334466" emissive="#112233" emissiveIntensity={0.12} />
      </mesh>

      <mesh position={[0.9, -0.9, 0.08]}>
        <boxGeometry args={[0.16, 0.07, 0.04]} />
        <meshStandardMaterial
          color={indicatorColor}
          emissive={indicatorEmissive}
          emissiveIntensity={2.2}
        />
      </mesh>
    </group>
  );
}
