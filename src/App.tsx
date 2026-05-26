import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { DetentionCell } from './scenes/DetentionCell';

export default function App() {
  return (
    <div style={{ width: '100%', height: '100%' }} data-testid="app">
      <Canvas camera={{ position: [0, 1.6, 5], fov: 75 }}>
        <Suspense fallback={null}>
          <DetentionCell />
        </Suspense>
      </Canvas>
    </div>
  );
}
