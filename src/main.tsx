import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n';
import App from './App';
import { useGameStore } from './stores/useGameStore';
import { useInventoryStore } from './stores/useInventoryStore';
import { useHintStore } from './stores/useHintStore';

// Expose stores on window in dev mode so Playwright e2e tests can seed state
if (import.meta.env.DEV) {
  (window as Record<string, unknown>).__stores = {
    game: useGameStore,
    inventory: useInventoryStore,
    hint: useHintStore,
  };
}

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
