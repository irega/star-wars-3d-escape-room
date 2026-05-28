import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { HangarBay } from './HangarBay';
import '../i18n';

vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}));

vi.mock('@react-three/drei', () => ({
  Html: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('HangarBay', () => {
  it('renders without crashing', () => {
    expect(() => render(<HangarBay />)).not.toThrow();
  });

  it('accepts an onDialogue callback prop', () => {
    const onDialogue = vi.fn();
    expect(() => render(<HangarBay onDialogue={onDialogue} />)).not.toThrow();
  });
});
