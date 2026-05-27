import { Canvas } from '@react-three/fiber';
import { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DetentionCell } from './scenes/DetentionCell';
import { ControlRoom } from './scenes/ControlRoom';
import { HUD } from './ui/HUD';
import { Dialogue } from './ui/Dialogue';
import { useGameStore } from './stores/useGameStore';
import { useInventoryStore } from './stores/useInventoryStore';
import { useHintStore } from './stores/useHintStore';
import { PUZZLE_1_ID } from './scenes/detentionCellPuzzle';
import { PUZZLE_2_ID } from './scenes/controlRoomPuzzle';

export default function App() {
  const { t } = useTranslation();
  const [dialogue, setDialogue] = useState<string | null>(null);

  const currentRoom = useGameStore((s) => s.currentRoom);
  const inventory = useInventoryStore((s) => s.items);
  const puzzle1HintLevel = useHintStore((s) => s.getHintLevel(PUZZLE_1_ID));
  const puzzle2HintLevel = useHintStore((s) => s.getHintLevel(PUZZLE_2_ID));

  let hintText: string | undefined;
  if (currentRoom === 'detention-cell' && puzzle1HintLevel > 0) {
    hintText = t(`puzzle1.hint.${puzzle1HintLevel}`);
  } else if (currentRoom === 'control-room' && puzzle2HintLevel > 0) {
    hintText = t(`puzzle2.hint.${puzzle2HintLevel}`);
  }

  return (
    <div style={{ width: '100%', height: '100%' }} data-testid="app" data-room={currentRoom}>
      <HUD inventory={[...inventory]} hint={hintText} />
      <Canvas camera={{ position: [0, 1.6, 5], fov: 75 }}>
        <Suspense fallback={null}>
          {currentRoom === 'detention-cell' && <DetentionCell onDialogue={setDialogue} />}
          {currentRoom === 'control-room' && <ControlRoom onDialogue={setDialogue} />}
        </Suspense>
      </Canvas>
      {dialogue && <Dialogue text={dialogue} isOpen onClose={() => setDialogue(null)} />}
    </div>
  );
}
