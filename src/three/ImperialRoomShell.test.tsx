import { describe, it, expect } from 'vitest';
import { ImperialRoomShell } from './ImperialRoomShell';
import { renderThree } from '../test/renderThree';

describe('ImperialRoomShell', () => {
  it('renders without crashing', async () => {
    const renderer = await renderThree(<ImperialRoomShell />);
    expect(renderer.scene.children.length).toBeGreaterThan(0);
    await renderer.unmount();
  });
});
