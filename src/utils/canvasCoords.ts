/**
 * Projects a 3D world position to a 2D canvas pixel coordinate.
 * Assumes the camera looks at the world origin [0,0,0] (R3F default lookAt).
 *
 * Derivation:
 *   Camera axes from lookAt([0,0,0]): z_cam = normalize(camPos), x_cam = normalize(cross([0,1,0], z_cam)), y_cam = cross(z_cam, x_cam)
 *   Camera-space projection → NDC → screen pixel via standard perspective formula.
 */
export function worldToCanvas(
  world: [number, number, number],
  camera: { position: [number, number, number]; fov: number },
  viewport: { width: number; height: number },
): { x: number; y: number } {
  const [cx, cy, cz] = camera.position;
  const [wx, wy, wz] = world;

  // z-axis: normalize(cameraPos − lookAt) = normalize(cameraPos)
  const camDist = Math.sqrt(cx * cx + cy * cy + cz * cz);
  const zx = cx / camDist,
    zy = cy / camDist,
    zz = cz / camDist;

  // x-axis: normalize(cross([0,1,0], zCam)); cross = [zz, 0, −zx]
  const xMag = Math.sqrt(zz * zz + zx * zx);
  const xx = zz / xMag,
    xy = 0,
    xz = -zx / xMag;

  // y-axis: cross(zCam, xCam)
  const yx = zy * xz - zz * xy;
  const yy = zz * xx - zx * xz;
  const yz = zx * xy - zy * xx;

  const dx = wx - cx,
    dy = wy - cy,
    dz = wz - cz;
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
