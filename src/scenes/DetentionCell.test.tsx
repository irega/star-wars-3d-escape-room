import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { DetentionCell } from './DetentionCell';
import '../i18n';

vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}));

vi.mock('@react-three/drei', () => ({
  Html: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('DetentionCell', () => {
  it('renders without crashing', () => {
    expect(() => render(<DetentionCell />)).not.toThrow();
  });

  it('accepts an onDialogue callback prop', () => {
    const onDialogue = vi.fn();
    expect(() => render(<DetentionCell onDialogue={onDialogue} />)).not.toThrow();
  });
});
