import type { ThreeElements } from '@react-three/fiber';

export interface PropBoxProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  size: [number, number, number];
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
  transparent?: boolean;
  opacity?: number;
}

/** Named box prop — replaces raw mesh + boxGeometry + meshStandardMaterial triplets. */
export function PropBox({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  size,
  color,
  emissive,
  emissiveIntensity,
  transparent,
  opacity,
}: PropBoxProps) {
  const materialProps: ThreeElements['meshStandardMaterial'] = {
    color,
    ...(emissive !== undefined && { emissive }),
    ...(emissiveIntensity !== undefined && { emissiveIntensity }),
    ...(transparent !== undefined && { transparent }),
    ...(opacity !== undefined && { opacity }),
  };

  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      <meshStandardMaterial {...materialProps} />
    </mesh>
  );
}
