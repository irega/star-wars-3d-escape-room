import { imperialPalette } from './palette';

export interface ImperialRoomShellProps {
  width?: number;
  depth?: number;
  height?: number;
  ceilingY?: number;
  floorColor?: string;
  ceilingColor?: string;
  wallBackColor?: string;
  wallSideColor?: string;
  trimColor?: string;
  panelColor?: string;
  /** Number of decorative wall panels per side wall (0–4). */
  sidePanelCount?: number;
  showBackWall?: boolean;
}

const DEFAULT_WIDTH = 6;
const DEFAULT_DEPTH = 8;
const DEFAULT_HEIGHT = 3.5;
const DEFAULT_CEILING_Y = 3.5;

export function ImperialRoomShell({
  width = DEFAULT_WIDTH,
  depth = DEFAULT_DEPTH,
  height = DEFAULT_HEIGHT,
  ceilingY = DEFAULT_CEILING_Y,
  floorColor = imperialPalette.deck,
  ceilingColor = imperialPalette.ceiling,
  wallBackColor = imperialPalette.wallBack,
  wallSideColor = imperialPalette.wallSide,
  trimColor = imperialPalette.trim,
  panelColor = imperialPalette.panel,
  sidePanelCount = 2,
  showBackWall = true,
}: ImperialRoomShellProps) {
  const halfW = width / 2;
  const halfD = depth / 2;
  const wallCenterY = height / 2;
  const backZ = -halfD;
  const trimHeight = 0.12;
  const panelW = 0.9;
  const panelH = 1.1;

  const panelCount = Math.min(4, Math.max(0, sidePanelCount));
  const sidePanels = Array.from({ length: panelCount }, (_, i) => {
    const t = panelCount <= 1 ? 0.5 : i / (panelCount - 1);
    return -halfD + 1.2 + t * (depth - 2.4);
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={floorColor} />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ceilingY, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={ceilingColor} />
      </mesh>

      {showBackWall && (
        <mesh position={[0, wallCenterY, backZ]}>
          <planeGeometry args={[width, height]} />
          <meshStandardMaterial color={wallBackColor} />
        </mesh>
      )}

      <mesh rotation={[0, Math.PI / 2, 0]} position={[-halfW, wallCenterY, 0]}>
        <planeGeometry args={[depth, height]} />
        <meshStandardMaterial color={wallSideColor} />
      </mesh>

      <mesh rotation={[0, -Math.PI / 2, 0]} position={[halfW, wallCenterY, 0]}>
        <planeGeometry args={[depth, height]} />
        <meshStandardMaterial color={wallSideColor} />
      </mesh>

      {/* Base trim along side walls */}
      {([-halfW, halfW] as const).map((x) => (
        <mesh key={`trim-${x}`} position={[x, trimHeight / 2, 0]}>
          <boxGeometry args={[0.08, trimHeight, depth - 0.4]} />
          <meshStandardMaterial color={trimColor} emissive={trimColor} emissiveIntensity={0.08} />
        </mesh>
      ))}

      {showBackWall && (
        <mesh position={[0, trimHeight / 2, backZ + 0.04]}>
          <boxGeometry args={[width - 0.4, trimHeight, 0.08]} />
          <meshStandardMaterial color={trimColor} emissive={trimColor} emissiveIntensity={0.08} />
        </mesh>
      )}

      {/* Light greeble panels on side walls */}
      {sidePanels.map((z, i) => (
        <group key={`panel-${i}`}>
          <mesh position={[-halfW + 0.05, 1.6, z]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[panelW, panelH, 0.04]} />
            <meshStandardMaterial
              color={panelColor}
              emissive={panelColor}
              emissiveIntensity={0.06}
            />
          </mesh>
          <mesh position={[halfW - 0.05, 1.6, z]} rotation={[0, -Math.PI / 2, 0]}>
            <boxGeometry args={[panelW, panelH, 0.04]} />
            <meshStandardMaterial
              color={panelColor}
              emissive={panelColor}
              emissiveIntensity={0.06}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
