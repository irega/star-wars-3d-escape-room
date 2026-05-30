// Camera config — must match App.tsx <Canvas camera={{ position, fov }}>
export const CAMERA = {
  position: [0, 1.6, 5] as [number, number, number],
  fov: 75,
};

// Playwright Desktop Chrome default viewport
export const VIEWPORT = { width: 1280, height: 720 };

type Vec3 = [number, number, number];

/**
 * Projects a 3D world position to a 2D canvas pixel coordinate.
 * Assumes the camera looks at the world origin [0,0,0] (R3F default lookAt).
 *
 * Derivation:
 *   Camera axes from lookAt([0,0,0]): z_cam = normalize(camPos), x_cam = normalize(cross([0,1,0], z_cam)), y_cam = cross(z_cam, x_cam)
 *   Camera-space projection → NDC → screen pixel via standard perspective formula.
 */
export function worldToCanvas(
  world: Vec3,
  camera: { position: Vec3; fov: number },
  viewport: { width: number; height: number },
): { x: number; y: number } {
  const [cx, cy, cz] = camera.position;
  const [wx, wy, wz] = world;

  // z-axis: normalize(cameraPos − lookAt) = normalize(cameraPos)
  const camDist = Math.sqrt(cx * cx + cy * cy + cz * cz);
  const zx = cx / camDist, zy = cy / camDist, zz = cz / camDist;

  // x-axis: normalize(cross([0,1,0], zCam)); cross = [zz, 0, −zx]
  const xMag = Math.sqrt(zz * zz + zx * zx);
  const xx = zz / xMag, xy = 0, xz = -zx / xMag;

  // y-axis: cross(zCam, xCam)
  const yx = zy * xz - zz * xy;
  const yy = zz * xx - zx * xz;
  const yz = zx * xy - zy * xx;

  const dx = wx - cx, dy = wy - cy, dz = wz - cz;
  const xView = dx * xx + dy * xy + dz * xz;
  const yView = dx * yx + dy * yy + dz * yz;
  const zView = dx * zx + dy * zy + dz * zz;

  const depth = -zView;
  const halfFovY = Math.tan(((camera.fov / 2) * Math.PI) / 180);
  const halfFovX = halfFovY * (viewport.width / viewport.height);

  return {
    x: Math.round(((xView / (depth * halfFovX) + 1) / 2) * viewport.width),
    y: Math.round(((1 - yView / (depth * halfFovY)) / 2) * viewport.height),
  };
}

// Scene 1 — Detention Cell
// World positions mirror DetentionCell.tsx:
//   panel group at [2.82, 1.5, −3.0]
//   door group at [0, 1.4, 3.92], clickable bar at relative x=0.26 with z-offset 0.02 → [0.26, 1.4, 3.94]
const SCENE1_WORLD = {
  panel: [2.82, 1.5, -3.0] as Vec3,
  door: [0.26, 1.4, 3.94] as Vec3,
};

export const SCENE1 = {
  panel: worldToCanvas(SCENE1_WORLD.panel, CAMERA, VIEWPORT),
  door: worldToCanvas(SCENE1_WORLD.door, CAMERA, VIEWPORT),
};
