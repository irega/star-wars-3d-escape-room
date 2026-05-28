import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Corridor } from './Corridor';
import '../i18n';

vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}));

vi.mock('@react-three/drei', () => ({
  Html: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('Corridor', () => {
  it('renders without crashing', () => {
    expect(() => render(<Corridor />)).not.toThrow();
  });

  it('accepts an onDialogue callback prop', () => {
    const onDialogue = vi.fn();
    expect(() => render(<Corridor onDialogue={onDialogue} />)).not.toThrow();
  });
});
