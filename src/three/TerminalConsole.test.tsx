import { describe, it, expect } from 'vitest';
import { TerminalConsole } from './TerminalConsole';
import { renderThree } from '../test/renderThree';

describe('TerminalConsole', () => {
  it('renders without crashing', async () => {
    const renderer = await renderThree(
      <TerminalConsole
        screenColor="#001133"
        screenEmissive="#0044cc"
        indicatorColor="#ff4444"
        indicatorEmissive="#440000"
      />,
    );
    expect(renderer.scene.children.length).toBeGreaterThan(0);
    await renderer.unmount();
  });
});
