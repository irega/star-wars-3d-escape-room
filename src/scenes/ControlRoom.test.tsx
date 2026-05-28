import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ControlRoom } from './ControlRoom';
import '../i18n';

vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}));

vi.mock('@react-three/drei', () => ({
  Html: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('ControlRoom', () => {
  it('renders without crashing', () => {
    expect(() => render(<ControlRoom />)).not.toThrow();
  });

  it('accepts an onDialogue callback prop', () => {
    const onDialogue = vi.fn();
    expect(() => render(<ControlRoom onDialogue={onDialogue} />)).not.toThrow();
  });
});
