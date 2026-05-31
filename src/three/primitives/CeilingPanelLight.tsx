import { PropBox } from './PropBox';
import { ScenePointLight } from './ScenePointLight';

export interface CeilingPanelLightProps {
  /** Panel center position. Light sits slightly below panel center. */
  position?: [number, number, number];
  panelSize?: [number, number, number];
  panelColor?: string;
  panelEmissive?: string;
  lightColor?: string;
  lightIntensity?: number;
  lightDistance?: number;
}

/** Diegetic ceiling fill — panel mesh + matching point light (common in cell rooms). */
export function CeilingPanelLight({
  position = [0, 3.35, -3.85],
  panelSize = [1.4, 0.08, 0.12],
  panelColor = '#445577',
  panelEmissive = '#334466',
  lightColor = '#88aaff',
  lightIntensity = 0.65,
  lightDistance = 3,
}: CeilingPanelLightProps) {
  const [x, y, z] = position;

  return (
    <>
      <PropBox
        position={position}
        size={panelSize}
        color={panelColor}
        emissive={panelEmissive}
        emissiveIntensity={0.55}
      />
      <ScenePointLight
        position={[x, y - 0.15, z + 0.35]}
        color={lightColor}
        intensity={lightIntensity}
        distance={lightDistance}
      />
    </>
  );
}
