import { describe, it, expect, vi } from 'vitest';
import { ControlRoom, AUREBESH_SYMBOL_BARS, SCREENS } from './ControlRoom';
import { renderThree } from '../../test/renderThree';
import '../../i18n';

vi.mock('@react-three/drei', () => ({
  Html: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Environment: () => null,
  ContactShadows: () => null,
}));

describe('ControlRoom', () => {
  it('renders without crashing', async () => {
    const renderer = await renderThree(<ControlRoom />);
    expect(renderer.scene.children.length).toBeGreaterThan(0);
    await renderer.unmount();
  });

  it('accepts an onDialogue callback prop', async () => {
    const onDialogue = vi.fn();
    const renderer = await renderThree(<ControlRoom onDialogue={onDialogue} />);
    expect(renderer.scene.children.length).toBeGreaterThan(0);
    await renderer.unmount();
  });
});

describe('AUREBESH_SYMBOL_BARS', () => {
  it('defines bars for all four sequence symbols', () => {
    expect(AUREBESH_SYMBOL_BARS).toHaveProperty('A');
    expect(AUREBESH_SYMBOL_BARS).toHaveProperty('U');
    expect(AUREBESH_SYMBOL_BARS).toHaveProperty('R');
    expect(AUREBESH_SYMBOL_BARS).toHaveProperty('E');
  });

  it('every screen symbol has a bar definition', () => {
    for (const screen of SCREENS) {
      expect(AUREBESH_SYMBOL_BARS).toHaveProperty(screen.symbol);
    }
  });

  it('each symbol has at least one bar', () => {
    for (const [, bars] of Object.entries(AUREBESH_SYMBOL_BARS)) {
      expect(bars.length).toBeGreaterThan(0);
    }
  });

  it('all four symbols have distinct bar configurations', () => {
    const serialized = Object.values(AUREBESH_SYMBOL_BARS).map((bars) => JSON.stringify(bars));
    const unique = new Set(serialized);
    expect(unique.size).toBe(4);
  });

  it('A symbol does not match U symbol', () => {
    expect(JSON.stringify(AUREBESH_SYMBOL_BARS['A'])).not.toBe(
      JSON.stringify(AUREBESH_SYMBOL_BARS['U']),
    );
  });

  it('A symbol does not match R symbol', () => {
    expect(JSON.stringify(AUREBESH_SYMBOL_BARS['A'])).not.toBe(
      JSON.stringify(AUREBESH_SYMBOL_BARS['R']),
    );
  });

  it('A symbol does not match E symbol', () => {
    expect(JSON.stringify(AUREBESH_SYMBOL_BARS['A'])).not.toBe(
      JSON.stringify(AUREBESH_SYMBOL_BARS['E']),
    );
  });

  it('U symbol does not match R symbol', () => {
    expect(JSON.stringify(AUREBESH_SYMBOL_BARS['U'])).not.toBe(
      JSON.stringify(AUREBESH_SYMBOL_BARS['R']),
    );
  });

  it('U symbol does not match E symbol', () => {
    expect(JSON.stringify(AUREBESH_SYMBOL_BARS['U'])).not.toBe(
      JSON.stringify(AUREBESH_SYMBOL_BARS['E']),
    );
  });

  it('R symbol does not match E symbol', () => {
    expect(JSON.stringify(AUREBESH_SYMBOL_BARS['R'])).not.toBe(
      JSON.stringify(AUREBESH_SYMBOL_BARS['E']),
    );
  });
});
