import { Canvas } from '@react-three/fiber';
import { ACESFilmicToneMapping, Color } from 'three';
import { Suspense, useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DetentionCell } from './scenes/DetentionCell';
import { ControlRoom } from './scenes/ControlRoom';
import { Corridor } from './scenes/Corridor';
import { HangarBay } from './scenes/HangarBay';
import { HUD } from './ui/HUD';
import { Dialogue } from './ui/Dialogue';
import { ControlRoomTerminal } from './ui/ControlRoomTerminal';
import { useControlRoomTerminalStore } from './stores/useControlRoomTerminalStore';
import { Victory } from './ui/Victory';
import { Intro } from './ui/Intro';
import { useGameStore } from './stores/useGameStore';
import { useInventoryStore } from './stores/useInventoryStore';
import { useHintStore } from './stores/useHintStore';
import { ImperialLighting, imperialPalette } from './three';
import { PUZZLE_1_ID } from './scenes/detentionCellPuzzle';
import { PUZZLE_2_ID } from './scenes/controlRoomPuzzle';
import { PUZZLE_3_ID } from './scenes/corridorPuzzle';
import { PUZZLE_4_ID } from './scenes/hangarBayPuzzle';

export default function App() {
  const { t } = useTranslation();
  const [dialogue, setDialogue] = useState<string | null>(null);

  const currentRoom = useGameStore((s) => s.currentRoom);
  const phase = useGameStore((s) => s.phase);
  const playerName = useGameStore((s) => s.playerName);
  const setPlayerName = useGameStore((s) => s.setPlayerName);
  const startGame = useGameStore((s) => s.startGame);
  const resetGame = useGameStore((s) => s.reset);
  const resetInventory = useInventoryStore((s) => s.reset);
  const resetHints = useHintStore((s) => s.reset);
  const inventory = useInventoryStore((s) => s.items);
  const puzzle1HintLevel = useHintStore((s) => s.getHintLevel(PUZZLE_1_ID));
  const puzzle2HintLevel = useHintStore((s) => s.getHintLevel(PUZZLE_2_ID));
  const puzzle3HintLevel = useHintStore((s) => s.getHintLevel(PUZZLE_3_ID));
  const puzzle4HintLevel = useHintStore((s) => s.getHintLevel(PUZZLE_4_ID));
  const controlRoomTerminalActive = useControlRoomTerminalStore((s) => s.active);
  const controlRoomInputBuffer = useControlRoomTerminalStore((s) => s.inputBuffer);
  const controlRoomInputFeedback = useControlRoomTerminalStore((s) => s.inputFeedback);
  const closeControlRoomTerminal = useControlRoomTerminalStore((s) => s.close);
  const resetControlRoomTerminal = useControlRoomTerminalStore((s) => s.reset);

  useEffect(() => {
    if (currentRoom !== 'control-room') {
      resetControlRoomTerminal();
    }
  }, [currentRoom, resetControlRoomTerminal]);

  const handleStart = useCallback(
    (name: string) => {
      setPlayerName(name);
      startGame();
    },
    [setPlayerName, startGame],
  );

  const handleReplay = useCallback(() => {
    resetGame();
    resetInventory();
    resetHints();
    resetControlRoomTerminal();
    setDialogue(null);
  }, [resetGame, resetInventory, resetHints, resetControlRoomTerminal]);

  let hintText: string | undefined;
  if (currentRoom === 'detention-cell' && puzzle1HintLevel > 0) {
    hintText = t(`puzzle1.hint.${puzzle1HintLevel}`);
  } else if (currentRoom === 'control-room' && puzzle2HintLevel > 0) {
    hintText = t(`puzzle2.hint.${puzzle2HintLevel}`);
  } else if (currentRoom === 'corridor' && puzzle3HintLevel > 0) {
    hintText = t(`puzzle3.hint.${puzzle3HintLevel}`);
  } else if (currentRoom === 'hangar-bay' && puzzle4HintLevel > 0) {
    hintText = t(`puzzle4.hint.${puzzle4HintLevel}`);
  }

  return (
    <div style={{ width: '100%', height: '100%' }} data-testid="app" data-room={currentRoom}>
      <HUD
        inventory={[...inventory]}
        currentRoom={phase === 'playing' ? currentRoom : undefined}
        hint={hintText}
      />
      {currentRoom === 'control-room' && controlRoomTerminalActive && (
        <ControlRoomTerminal
          inputBuffer={controlRoomInputBuffer}
          inputFeedback={controlRoomInputFeedback}
          onClose={closeControlRoomTerminal}
        />
      )}
      {phase === 'playing' && (
        <Canvas
          gl={{ antialias: true }}
          camera={{ position: [0, 1.6, 5], fov: 75 }}
          onCreated={({ scene, gl }) => {
            scene.background = new Color(imperialPalette.background);
            gl.toneMapping = ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.5;
          }}
        >
          <ImperialLighting />
          <Suspense fallback={null}>
            {currentRoom === 'detention-cell' && <DetentionCell onDialogue={setDialogue} />}
            {currentRoom === 'control-room' && <ControlRoom onDialogue={setDialogue} />}
            {currentRoom === 'corridor' && <Corridor onDialogue={setDialogue} />}
            {currentRoom === 'hangar-bay' && <HangarBay onDialogue={setDialogue} />}
          </Suspense>
        </Canvas>
      )}
      {dialogue && <Dialogue text={dialogue} isOpen onClose={() => setDialogue(null)} />}
      {phase === 'intro' && <Intro onStart={handleStart} />}
      {phase === 'won' && <Victory playerName={playerName} onReplay={handleReplay} />}
    </div>
  );
}
