import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // three.js min bundle is ~720 kB — vendor split isolates it; app code stays small
    chunkSizeWarningLimit: 750,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-vendor',
              test: /node_modules\/(react|react-dom|scheduler)\//,
            },
            {
              name: 'three',
              test: /node_modules\/three\//,
            },
            {
              name: 'r3f',
              test: /node_modules\/@react-three\//,
            },
            {
              name: 'i18n',
              test: /node_modules\/(i18next|react-i18next|i18next-browser-languagedetector)\//,
            },
          ],
        },
      },
    },
  },
});
