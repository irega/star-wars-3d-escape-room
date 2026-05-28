import { test, expect } from '@playwright/test';

// Canvas click coordinates for Playwright Desktop Chrome (viewport 1280×720).
// Camera: position [0, 1.6, 5], fov=75, lookAt [0,0,0] (R3F default).
// Camera is tilted ~17.7° downward (rotation.x = -atan(1.6/5) ≈ -0.310 rad).
//
// Transform world → camera space (R = column vectors: right, up, camera-z):
//   x_cam = wx
//   y_cam = (wy−1.6)·0.9524 + (wz−5)·(−0.3048)
//   depth = −[(wy−1.6)·0.3048 + (wz−5)·0.9524]
//   ndcX = x_cam / (depth · halfFovX)   halfFovX = tan(37.5°)·(1280/720) ≈ 1.364
//   ndcY = y_cam / (depth · halfFovY)   halfFovY = tan(37.5°) ≈ 0.767
//   screenX = (ndcX + 1) / 2 · 1280
//   screenY = (1 − ndcY) / 2 · 720
//
// Scene 1 — Detention Cell
//   Loose panel  world [2.82, 1.5, −3.0]  → depth 7.65 → (813, 216)
//   Cell door bar world [0.26, 1.4, 3.94] → depth 1.07 → (754, 302)
// Scene 2 — Control Room
//   Terminal body center world [0, 0.5, -0.5] → depth 5.57 → (640, 310)
//   Blast door center   world [0, 1.4, -3.92] → depth 8.56 → (640, 221)
//   (Blast door is on the back wall so it does not occlude the terminal)
// Scene 3 — Corridor
//   Cell 0  world [0.7,  0.3, 2.0]  → depth 3.25 → (741, 407)
//   Cell 1  world [1.4,  0.3, 1.5]  → depth 3.73 → (816, 382)
//   Cell 2  world [2.0,  0.3, 2.0]  → depth 3.25 → (928, 407)
//   Slot 0  world [-2.85, 2.0, -2.0] → depth 6.55 → (429, 180)
//   Slot 1  world [-2.85, 1.5, -2.0] → depth 6.70 → (433, 217)
//   Slot 2  world [-2.85, 1.0, -2.0] → depth 6.85 → (438, 253)
//   Blast door  world [0, 1.4, -3.92] → depth 8.56 → (640, 221)

const SCENE1 = {
  panel: { x: 813, y: 216 },
  door: { x: 754, y: 302 },
};

const SCENE2 = {
  terminal: { x: 640, y: 310 },
  door: { x: 640, y: 221 },
};

const SCENE3 = {
  cell0: { x: 741, y: 407 },
  cell1: { x: 816, y: 382 },
  cell2: { x: 928, y: 407 },
  slot0: { x: 429, y: 180 },
  slot1: { x: 433, y: 217 },
  slot2: { x: 438, y: 253 },
  door: { x: 640, y: 221 },
};

const CORRECT_SEQUENCE = ['A', 'U', 'R', 'E'];

test('happy path: escape from detention cell through control room to corridor', async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.goto('/');
  await expect(page.getByTestId('app')).toBeVisible();
  await page.locator('canvas').waitFor({ state: 'visible' });
  await page.waitForTimeout(1000);

  // ── Scene 1: Detention Cell ───────────────────────────────────────────────

  // Find the hidden keycard behind the loose wall panel
  await page.locator('canvas').click({ position: SCENE1.panel });
  await expect(
    page.getByText('A hidden maintenance keycard! This must open the cell door.'),
  ).toBeVisible();
  await expect(page.getByRole('listitem').filter({ hasText: 'keycard' })).toBeVisible();
  await page.getByRole('button', { name: /close/i }).click();

  // Exit the detention cell — door now unlocked
  await page.locator('canvas').click({ position: SCENE1.door });

  // ── Scene 2: Control Room ─────────────────────────────────────────────────

  // Wait for scene transition: Zustand update → React re-render → R3F mesh mount + raycasting setup
  await page.locator('[data-testid="app"][data-room="control-room"]').waitFor({ state: 'attached' });
  await page.waitForTimeout(500);

  // Solve the Imperial Override puzzle at the terminal
  await page.locator('canvas').click({ position: SCENE2.terminal });
  await expect(page.getByText('IMPERIAL OVERRIDE SYSTEM v4.2')).toBeVisible();

  for (const letter of CORRECT_SEQUENCE) {
    await page.keyboard.press(letter);
  }
  await page.keyboard.press('Enter');

  await expect(
    page.getByText('Override accepted. Blast door unlocked. Proceed to the corridor.'),
  ).toBeVisible();
  await expect(page.getByRole('listitem').filter({ hasText: 'override-code' })).toBeVisible();
  await page.getByRole('button', { name: /close/i }).click();

  // Exit through the blast door to the corridor
  await page.locator('canvas').click({ position: SCENE2.door });
  await page.waitForTimeout(300);
  await expect(
    page.getByText('Blast door sealed. Complete the Imperial Override sequence first.'),
  ).not.toBeVisible();

  // ── Scene 3: Corridor ─────────────────────────────────────────────────────

  await page.locator('[data-testid="app"][data-room="corridor"]').waitFor({ state: 'attached' });
  await page.waitForTimeout(500);

  // Cell 0 starts at 0° — correct orientation for Slot 0 (no rotation needed)
  await page.locator('canvas').click({ position: SCENE3.cell0 });
  await page.waitForTimeout(200);
  await page.locator('canvas').click({ position: SCENE3.slot0 });
  await page.waitForTimeout(200);

  // Cell 1 starts at 0° — needs 90° for Slot 1 (one rotation)
  await page.locator('canvas').click({ position: SCENE3.cell1 });
  await page.waitForTimeout(200);
  await page.locator('canvas').click({ position: SCENE3.cell1 }); // rotate to 90°
  await page.waitForTimeout(200);
  await page.locator('canvas').click({ position: SCENE3.slot1 });
  await page.waitForTimeout(200);

  // Cell 2 starts at 0° — needs 180° for Slot 2 (two rotations)
  await page.locator('canvas').click({ position: SCENE3.cell2 });
  await page.waitForTimeout(200);
  await page.locator('canvas').click({ position: SCENE3.cell2 }); // rotate to 90°
  await page.waitForTimeout(200);
  await page.locator('canvas').click({ position: SCENE3.cell2 }); // rotate to 180°
  await page.waitForTimeout(200);
  await page.locator('canvas').click({ position: SCENE3.slot2 });
  await page.waitForTimeout(500);

  // All conduits powered — frequency in inventory, dialogue shown
  await expect(
    page.getByText(/All conduits powered! Frequency 47 acquired/),
  ).toBeVisible();
  await expect(page.getByRole('listitem').filter({ hasText: 'frequency' })).toBeVisible();
  await page.getByRole('button', { name: /close/i }).click();

  // Exit through the corridor blast door to the hangar bay
  await page.locator('canvas').click({ position: SCENE3.door });
  await page.waitForTimeout(300);
  await page
    .locator('[data-testid="app"][data-room="hangar-bay"]')
    .waitFor({ state: 'attached', timeout: 5000 });
});

// TODO: Add more detailed hangar bay E2E tests once ready.
// E2E tests must replicate real user behavior. The above test confirms the happy path
// reaches the hangar bay successfully.
