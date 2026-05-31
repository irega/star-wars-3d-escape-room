import { PropBox } from './PropBox';

export interface CotFrameProps {
  /** Center of the mattress/platform. */
  position?: [number, number, number];
  platformSize?: [number, number, number];
  legPositions?: [number, number, number][];
}

const DEFAULT_LEG_POSITIONS: [number, number, number][] = [
  [-2.3, 0.12, -1.65],
  [-0.7, 0.12, -1.65],
  [-2.3, 0.12, -2.35],
  [-0.7, 0.12, -2.35],
];

/** Imperial detention cot — platform + four leg posts. */
export function CotFrame({
  position = [-1.5, 0.25, -2],
  platformSize = [1.8, 0.1, 0.8],
  legPositions = DEFAULT_LEG_POSITIONS,
}: CotFrameProps) {
  return (
    <>
      <PropBox position={position} size={platformSize} color="#3a3a58" />
      {legPositions.map(([x, y, z]) => (
        <PropBox key={`${x},${z}`} position={[x, y, z]} size={[0.08, 0.24, 0.08]} color="#252542" />
      ))}
    </>
  );
}
