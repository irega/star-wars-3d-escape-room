import { describe, it, expect, vi } from 'vitest';
import { DetentionCell } from './DetentionCell';
import { renderThree } from '../test/renderThree';
import '../i18n';

vi.mock('@react-three/drei', () => ({
  Html: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Environment: () => null,
  ContactShadows: () => null,
}));

describe('DetentionCell', () => {
  it('renders without crashing', async () => {
    const renderer = await renderThree(<DetentionCell />);
    expect(renderer.scene.children.length).toBeGreaterThan(0);
    await renderer.unmount();
  });

  it('accepts an onDialogue callback prop', async () => {
    const onDialogue = vi.fn();
    const renderer = await renderThree(<DetentionCell onDialogue={onDialogue} />);
    expect(renderer.scene.children.length).toBeGreaterThan(0);
    await renderer.unmount();
  });
});
