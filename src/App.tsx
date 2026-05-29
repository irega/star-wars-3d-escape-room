import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
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
import type { Room } from './stores/useGameStore';
import { useInventoryStore } from './stores/useInventoryStore';
import { useHintStore } from './stores/useHintStore';
import { ImperialLighting, imperialPalette } from './three';
import { PUZZLE_1_ID } from './scenes/detentionCellPuzzle';
import { PUZZLE_2_ID } from './scenes/controlRoomPuzzle';
import { PUZZLE_3_ID } from './scenes/corridorPuzzle';
import { PUZZLE_4_ID } from './scenes/hangarBayPuzzle';
import { resetAmbientMusic, stopAmbientMusic } from './audio/ambientMusic';
import { AmbientMusicToggle } from './ui/AmbientMusicToggle';
import { RoomHintTriggers } from './components/RoomHintTriggers';

export default function App() {
  const { t } = useTranslation();
  const [dialogueEntry, setDialogueEntry] = useState<{ text: string; room: Room } | null>(null);
  const [qualityTier, setQualityTier] = useState<'high' | 'low'>('high');

  const currentRoom = useGameStore((s) => s.currentRoom);
  const phase = useGameStore((s) => s.phase);
  const playerName = useGameStore((s) => s.playerName);
  const setPlayerName = useGameStore((s) => s.setPlayerName);
  const startGame = useGameStore((s) => s.startGame);
  const resetGame = useGameStore((s) => s.reset);
  const resetInventory = useInventoryStore((s) => s.reset);
  const resetHints = useHintStore((s) => s.reset);
  const inventory = useInventoryStore((s) => s.items);
  const puzzle1HintLevel = useHintStore((s) => s.hintLevels[PUZZLE_1_ID] ?? 0);
  const puzzle2HintLevel = useHintStore((s) => s.hintLevels[PUZZLE_2_ID] ?? 0);
  const puzzle3HintLevel = useHintStore((s) => s.hintLevels[PUZZLE_3_ID] ?? 0);
  const puzzle4HintLevel = useHintStore((s) => s.hintLevels[PUZZLE_4_ID] ?? 0);
  const controlRoomTerminalActive = useControlRoomTerminalStore((s) => s.active);
  const controlRoomInputBuffer = useControlRoomTerminalStore((s) => s.inputBuffer);
  const controlRoomInputFeedback = useControlRoomTerminalStore((s) => s.inputFeedback);
  const closeControlRoomTerminal = useControlRoomTerminalStore((s) => s.close);
  const resetControlRoomTerminal = useControlRoomTerminalStore((s) => s.reset);

  // Dialogue is only active for the room it was opened in; changing rooms hides it.
  const dialogue = dialogueEntry?.room === currentRoom ? dialogueEntry.text : null;

  useEffect(() => {
    if (currentRoom !== 'control-room') {
      resetControlRoomTerminal();
    }
  }, [currentRoom, resetControlRoomTerminal]);

  const showDialogue = useCallback(
    (text: string | null) => {
      if (text === null) {
        setDialogueEntry(null);
      } else {
        setDialogueEntry({ text, room: currentRoom });
      }
    },
    [currentRoom],
  );

  const handleStart = useCallback(
    (name: string) => {
      setPlayerName(name);
      startGame();
    },
    [setPlayerName, startGame],
  );

  const handleReplay = useCallback(() => {
    stopAmbientMusic();
    resetAmbientMusic();
    resetGame();
    resetInventory();
    resetHints();
    resetControlRoomTerminal();
    setDialogueEntry(null);
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

  const showHudHint = !dialogue && !(currentRoom === 'control-room' && controlRoomTerminalActive);

  return (
    <div
      style={{ width: '100%', height: '100%' }}
      data-testid="app"
      data-room={currentRoom}
      data-quality-tier={qualityTier}
    >
      <HUD
        inventory={[...inventory]}
        currentRoom={phase === 'playing' ? currentRoom : undefined}
        hint={showHudHint ? hintText : undefined}
      />
      {phase === 'playing' && <RoomHintTriggers />}
      {currentRoom === 'control-room' && controlRoomTerminalActive && (
        <ControlRoomTerminal
          inputBuffer={controlRoomInputBuffer}
          inputFeedback={controlRoomInputFeedback}
          onClose={closeControlRoomTerminal}
        />
      )}
      {phase === 'playing' && (
        <Canvas
          dpr={qualityTier === 'high' ? Math.min(window.devicePixelRatio, 2) : 0.75}
          gl={{ antialias: true }}
          camera={{ position: [0, 1.6, 5], fov: 75 }}
          onCreated={({ scene, gl }) => {
            scene.background = new Color(imperialPalette.background);
            gl.toneMapping = ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.5;
          }}
        >
          <PerformanceMonitor
            onDecline={() => setQualityTier('low')}
            onIncline={() => setQualityTier('high')}
          />
          <ImperialLighting showContactShadows={qualityTier === 'high'} />
          <Suspense fallback={null}>
            {currentRoom === 'detention-cell' && <DetentionCell onDialogue={showDialogue} />}
            {currentRoom === 'control-room' && <ControlRoom onDialogue={showDialogue} />}
            {currentRoom === 'corridor' && <Corridor onDialogue={showDialogue} />}
            {currentRoom === 'hangar-bay' && <HangarBay onDialogue={showDialogue} />}
          </Suspense>
        </Canvas>
      )}
      {dialogue && <Dialogue text={dialogue} isOpen onClose={() => setDialogueEntry(null)} />}
      {phase === 'intro' && <Intro onStart={handleStart} />}
      <AmbientMusicToggle />
      {phase === 'won' && <Victory playerName={playerName} onReplay={handleReplay} />}
    </div>
  );
}
