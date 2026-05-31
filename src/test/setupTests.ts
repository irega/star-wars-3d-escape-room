import '@testing-library/jest-dom';

// Required by @react-three/test-renderer (and React 19 act warnings in vitest).
(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
