export const SYMBOL_COLOR = '#f4f8ff';

export const SCREENS = [
  {
    x: -2.25,
    label: 'AUREK',
    symbol: 'A',
    tint: '#2d6eb5',
    highlightTint: '#5ca8ff',
  },
  {
    x: -0.75,
    label: 'UNESH',
    symbol: 'U',
    tint: '#1f8f8a',
    highlightTint: '#4fd9d2',
  },
  {
    x: 0.75,
    label: 'RESH',
    symbol: 'R',
    tint: '#7a4cad',
    highlightTint: '#b87aff',
  },
  {
    x: 2.25,
    label: 'ESH',
    symbol: 'E',
    tint: '#2d9458',
    highlightTint: '#5ee088',
  },
] as const;

type Bar = {
  pos: [number, number, number];
  size: [number, number, number];
  rotation?: [number, number, number];
};

export const AUREBESH_SYMBOL_BARS: Record<string, Bar[]> = {
  A: [
    { pos: [-0.125, 0, 0.06], size: [0.05, 0.32, 0.02] },
    { pos: [-0.03, 0, 0.06], size: [0.14, 0.05, 0.02] },
    { pos: [0.085, 0.06, 0.06], size: [0.13, 0.05, 0.02], rotation: [0, 0, 0.93] },
    { pos: [0.085, -0.06, 0.06], size: [0.13, 0.05, 0.02], rotation: [0, 0, -0.93] },
  ],
  U: [
    { pos: [-0.13, 0, 0.06], size: [0.05, 0.32, 0.02] },
    { pos: [0, -0.14, 0.06], size: [0.28, 0.05, 0.02] },
    { pos: [0.13, -0.03, 0.06], size: [0.05, 0.24, 0.02] },
    { pos: [-0.03, 0.14, 0.06], size: [0.18, 0.05, 0.02] },
    { pos: [0, 0, 0.06], size: [0.24, 0.05, 0.02], rotation: [0, 0, 0.62] },
  ],
  R: [
    { pos: [0, 0.15, 0.06], size: [0.28, 0.05, 0.02] },
    { pos: [0.01, -0.01, 0.06], size: [0.38, 0.05, 0.02], rotation: [0, 0, -2.38] },
  ],
  E: [
    { pos: [-0.095, -0.01, 0.06], size: [0.25, 0.05, 0.02], rotation: [0, 0, -1.22] },
    { pos: [-0.02, -0.01, 0.06], size: [0.24, 0.05, 0.02], rotation: [0, 0, 1.33] },
    { pos: [0.11, 0, 0.06], size: [0.05, 0.3, 0.02] },
  ],
};
