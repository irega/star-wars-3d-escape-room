import { describe, it, expect, vi } from 'vitest';
import { ImperialRoomShell } from './ImperialRoomShell';
import { BlastDoor } from './BlastDoor';
import { BarredCellDoor } from './BarredCellDoor';
import { TerminalConsole } from './TerminalConsole';
import { HologramScreen } from './HologramScreen';
import { ImperialLighting } from './ImperialLighting';
import { renderThree } from '../test/renderThree';

vi.mock('@react-three/drei', () => ({
  Environment: () => null,
  ContactShadows: () => null,
}));

describe('shared three components', () => {
  it('ImperialRoomShell renders without crashing', async () => {
    const renderer = await renderThree(<ImperialRoomShell />);
    expect(renderer.scene.children.length).toBeGreaterThan(0);
    await renderer.unmount();
  });

  it('BlastDoor renders locked and unlocked', async () => {
    const locked = await renderThree(<BlastDoor />);
    expect(locked.scene.children.length).toBeGreaterThan(0);
    await locked.unmount();

    const unlocked = await renderThree(<BlastDoor unlocked />);
    expect(unlocked.scene.children.length).toBeGreaterThan(0);
    await unlocked.unmount();
  });

  it('BarredCellDoor renders without crashing', async () => {
    const renderer = await renderThree(<BarredCellDoor />);
    expect(renderer.scene.children.length).toBeGreaterThan(0);
    await renderer.unmount();
  });

  it('TerminalConsole renders without crashing', async () => {
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

  it('HologramScreen renders without crashing', async () => {
    const renderer = await renderThree(<HologramScreen emissive="#0044cc" />);
    expect(renderer.scene.children.length).toBeGreaterThan(0);
    await renderer.unmount();
  });

  it('ImperialLighting renders without crashing', async () => {
    const renderer = await renderThree(<ImperialLighting />);
    expect(renderer.scene.children.length).toBeGreaterThan(0);
    await renderer.unmount();
  });

  it('primitives render without crashing', async () => {
    const { PropBox, CeilingPanelLight, CotFrame, FloorGrid } = await import('./primitives');
    const renderer = await renderThree(
      <group>
        <PropBox size={[1, 1, 1]} color="#fff" />
        <CeilingPanelLight />
        <CotFrame />
        <FloorGrid width={8} depth={8} />
      </group>,
    );
    expect(renderer.scene.children.length).toBeGreaterThan(0);
    await renderer.unmount();
  });
});
