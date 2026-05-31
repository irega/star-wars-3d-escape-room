import { HologramScreen } from '../../three';
import { AUREBESH_SYMBOL_BARS, SCREENS, SYMBOL_COLOR } from './aurebeshScreens';

interface AurebeshHologramScreensProps {
  hintLevel: number;
  sequenceHighlight: boolean;
}

export function AurebeshHologramScreens({
  hintLevel,
  sequenceHighlight,
}: AurebeshHologramScreensProps) {
  return (
    <>
      {SCREENS.map((screen, i) => {
        const isFirstScreen = i === 0;
        const hintBoost = isFirstScreen && hintLevel >= 1 && sequenceHighlight;
        const tint = hintBoost ? screen.highlightTint : screen.tint;
        const bezelIntensity = sequenceHighlight ? 1.1 : 0.65;
        const faceIntensity = sequenceHighlight ? (hintBoost ? 1.6 : 1.25) : 0.85;

        return (
          <group key={screen.symbol} position={[screen.x, 2.75, -3.88]}>
            <HologramScreen
              emissive={tint}
              emissiveIntensity={bezelIntensity}
              faceEmissiveIntensity={faceIntensity}
              wallGlow={sequenceHighlight}
            >
              {AUREBESH_SYMBOL_BARS[screen.symbol].map((bar, j) => (
                <mesh key={j} position={bar.pos} rotation={bar.rotation ?? [0, 0, 0]}>
                  <boxGeometry args={bar.size} />
                  <meshStandardMaterial
                    color={SYMBOL_COLOR}
                    emissive={SYMBOL_COLOR}
                    emissiveIntensity={sequenceHighlight ? 2.6 : 1.9}
                  />
                </mesh>
              ))}
            </HologramScreen>
          </group>
        );
      })}
    </>
  );
}
