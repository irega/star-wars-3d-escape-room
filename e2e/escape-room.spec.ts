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

const SCENE1 = {
  panel: { x: 813, y: 216 },
  door: { x: 754, y: 302 },
};

const SCENE2 = {
  terminal: { x: 640, y: 310 },
  door: { x: 640, y: 221 },
};

const CORRECT_SEQUENCE = ['A', 'U', 'R', 'E'];

test('happy path: escape from detention cell through control room', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('app')).toBeVisible();
  await page.locator('canvas').waitFor({ state: 'visible' });
  await page.waitForTimeout(1000);

  // ── Scene 1: Detention Cell ───────────────────────────────────────────────

  // Find the hidden keycard behind the loose wall panel
  await page.locator('canvas').click({ position: SCENE1.panel });
  await expect(page.getByText('A hidden maintenance keycard! This must open the cell door.')).toBeVisible();
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

  await expect(page.getByText('Override accepted. Blast door unlocked. Proceed to the corridor.')).toBeVisible();
  await expect(page.getByRole('listitem').filter({ hasText: 'override-code' })).toBeVisible();
  await page.getByRole('button', { name: /close/i }).click();

  // Exit through the blast door
  await page.locator('canvas').click({ position: SCENE2.door });
  await page.waitForTimeout(300);
  await expect(page.getByText('Blast door sealed. Complete the Imperial Override sequence first.')).not.toBeVisible();
});
