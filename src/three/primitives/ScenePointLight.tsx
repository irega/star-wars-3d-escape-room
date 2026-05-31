export interface ScenePointLightProps {
  position: [number, number, number];
  color?: string;
  intensity?: number;
  distance?: number;
  decay?: number;
}

/** Diegetic point light with sensible defaults for Imperial interiors. */
export function ScenePointLight({
  position,
  color = '#88aaff',
  intensity = 0.65,
  distance = 3,
  decay = 2,
}: ScenePointLightProps) {
  return (
    <pointLight
      position={position}
      color={color}
      intensity={intensity}
      distance={distance}
      decay={decay}
    />
  );
}
