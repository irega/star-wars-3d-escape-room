import { describe, it, expect } from 'vitest';
import { BarredCellDoor } from './BarredCellDoor';
import { renderThree } from '../test/renderThree';

describe('BarredCellDoor', () => {
  it('renders without crashing', async () => {
    const renderer = await renderThree(<BarredCellDoor />);
    expect(renderer.scene.children.length).toBeGreaterThan(0);
    await renderer.unmount();
  });
});
