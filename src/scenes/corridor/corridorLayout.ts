export const DROID_GROUP_POSITION: [number, number, number] = [1.5, 0, 1.2];

export const CELL_POSITIONS: [number, number, number][] = [
  [0.5, 0.3, 2.3],
  [2.6, 0.3, 1.3],
  [1.5, 0.3, 2.8],
];

export const SLOT_POSITIONS: [number, number, number][] = [
  [-2.85, 2.0, -2.0],
  [-2.85, 1.5, -2.0],
  [-2.85, 1.0, -2.0],
];

export const SCENE3_WORLD = {
  cell0: CELL_POSITIONS[0],
  cell1: CELL_POSITIONS[1],
  cell2: CELL_POSITIONS[2],
  slot0: SLOT_POSITIONS[0],
  slot1: SLOT_POSITIONS[1],
  slot2: SLOT_POSITIONS[2],
  door: [0, 1.4, -3.92] as [number, number, number],
};

export const CELL_COLORS = ['#4488ff', '#ff8833', '#44cc66'] as const;
export const CELL_LABEL_HEIGHTS = [0.5, 0.35, 0.2] as const;
