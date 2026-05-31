export interface FloorGridProps {
  width: number;
  depth: number;
  /** Spacing between grid lines along each axis. */
  xLines?: number[];
  zLines?: number[];
  lineColor?: string;
  lineEmissive?: string;
  y?: number;
}

/** Deck grid — longitudinal and transverse floor lines (hangar bays, cargo decks). */
export function FloorGrid({
  width,
  depth,
  xLines,
  zLines,
  lineColor = '#3a3a60',
  lineEmissive = '#2a2a48',
  y = 0.001,
}: FloorGridProps) {
  const xs = xLines ?? [-4, -2, 0, 2, 4].filter((x) => Math.abs(x) <= width / 2);
  const zs = zLines ?? [-5, -3, -1, 1, 3, 5].filter((z) => Math.abs(z) <= depth / 2);

  return (
    <>
      {xs.map((x) => (
        <mesh key={`grid-x-${x}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, y, 0]}>
          <planeGeometry args={[0.04, depth]} />
          <meshStandardMaterial color={lineColor} emissive={lineEmissive} emissiveIntensity={0.8} />
        </mesh>
      ))}
      {zs.map((z) => (
        <mesh key={`grid-z-${z}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, y, z]}>
          <planeGeometry args={[width, 0.04]} />
          <meshStandardMaterial color={lineColor} emissive={lineEmissive} emissiveIntensity={0.8} />
        </mesh>
      ))}
    </>
  );
}
