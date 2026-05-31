import { InteractiveObject } from '../../components/InteractiveObject';

interface HiddenMaintenancePanelProps {
  position: [number, number, number];
  panelFound: boolean;
  onClick: () => void;
}

export function HiddenMaintenancePanel({
  position,
  panelFound,
  onClick,
}: HiddenMaintenancePanelProps) {
  return (
    <InteractiveObject testId="panel" onClick={onClick} isDisabled={panelFound}>
      <group position={position}>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.7, 0.9, 0.06]} />
          <meshStandardMaterial
            color={panelFound ? '#1a1a2e' : '#2d5080'}
            emissive={panelFound ? '#000000' : '#0a1830'}
            emissiveIntensity={panelFound ? 0 : 0.25}
          />
        </mesh>
        {!panelFound && (
          <mesh position={[0, 0.46, 0]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[0.72, 0.02, 0.1]} />
            <meshStandardMaterial color="#4499cc" emissive="#224466" emissiveIntensity={0.4} />
          </mesh>
        )}
      </group>
    </InteractiveObject>
  );
}
