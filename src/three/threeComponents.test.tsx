import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ImperialRoomShell } from './ImperialRoomShell';
import { BlastDoor } from './BlastDoor';
import { BarredCellDoor } from './BarredCellDoor';
import { TerminalConsole } from './TerminalConsole';
import { HologramScreen } from './HologramScreen';
import { ImperialLighting } from './ImperialLighting';

vi.mock('@react-three/drei', () => ({
  Environment: () => null,
  ContactShadows: () => null,
}));

describe('shared three components', () => {
  it('ImperialRoomShell renders without crashing', () => {
    expect(() => render(<ImperialRoomShell />)).not.toThrow();
  });

  it('BlastDoor renders locked and unlocked', () => {
    expect(() => render(<BlastDoor />)).not.toThrow();
    expect(() => render(<BlastDoor unlocked />)).not.toThrow();
  });

  it('BarredCellDoor renders without crashing', () => {
    expect(() => render(<BarredCellDoor />)).not.toThrow();
  });

  it('TerminalConsole renders without crashing', () => {
    expect(() =>
      render(
        <TerminalConsole
          screenColor="#001133"
          screenEmissive="#0044cc"
          indicatorColor="#ff4444"
          indicatorEmissive="#440000"
        />,
      ),
    ).not.toThrow();
  });

  it('HologramScreen renders without crashing', () => {
    expect(() => render(<HologramScreen emissive="#0044cc" />)).not.toThrow();
  });

  it('ImperialLighting renders without crashing', () => {
    expect(() => render(<ImperialLighting />)).not.toThrow();
  });
});
