import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setupTests.ts'],
    exclude: ['node_modules', 'e2e'],
    // @react-three/fiber still uses THREE.Clock; fixed in next R3F major (THREE.Timer).
    onConsoleLog(log) {
      if (log.includes('THREE.Clock: This module has been deprecated')) {
        return false;
      }
    },
  },
});
