import { Canvas } from '@react-three/fiber';
import { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DetentionCell } from './scenes/DetentionCell';
import { HUD } from './ui/HUD';
import { Dialogue } from './ui/Dialogue';
import { useInventoryStore } from './stores/useInventoryStore';
import { useHintStore } from './stores/useHintStore';

export default function App() {
  const { t } = useTranslation();
  const [dialogue, setDialogue] = useState<string | null>(null);

  const inventory = useInventoryStore((s) => s.items);
  const hintLevel = useHintStore((s) => s.getHintLevel(1));
  const hintText = hintLevel > 0 ? t(`puzzle1.hint.${hintLevel}`) : undefined;

  return (
    <div style={{ width: '100%', height: '100%' }} data-testid="app">
      <HUD inventory={[...inventory]} hint={hintText} />
      <Canvas camera={{ position: [0, 1.6, 5], fov: 75 }}>
        <Suspense fallback={null}>
          <DetentionCell onDialogue={setDialogue} />
        </Suspense>
      </Canvas>
      {dialogue && <Dialogue text={dialogue} isOpen onClose={() => setDialogue(null)} />}
    </div>
  );
}
