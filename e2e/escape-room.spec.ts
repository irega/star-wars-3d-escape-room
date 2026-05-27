import { test, expect, type Page } from '@playwright/test';

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
// Scene 4 — Hangar Bay (state seeded via window.__stores in DEV mode)
//   Launch console body  world [0, 0.5, -0.5]  → depth 5.57 → (640, 307)

const SCENE1 = {
  panel: { x: 813, y: 216 },
  door: { x: 754, y: 302 },
};

const SCENE2 = {
  terminal: { x: 640, y: 310 },
  door: { x: 640, y: 221 },
};

const SCENE4 = {
  console: { x: 640, y: 307 },
};

const CORRECT_SEQUENCE = ['A', 'U', 'R', 'E'];

// Seed inventory and navigate to hangar bay by mutating Zustand stores via window.__stores.
// This bypasses the unimplemented Corridor scene (puzzle 3) so the hangar bay can be
// tested independently without depending on feat/scene-corridor.
async function seedHangarBayState(page: Page) {
  await page.evaluate(() => {
    const stores = (window as Record<string, unknown>).__stores as {
      game: { getState: () => { addItem?: unknown; moveToRoom: (r: string) => void; solvePuzzle: (id: number) => void } };
      inventory: { getState: () => { addItem: (item: string) => void } };
    };
    stores.inventory.getState().addItem('keycard');
    stores.inventory.getState().addItem('override-code');
    stores.inventory.getState().addItem('frequency');
    stores.game.getState().solvePuzzle(1);
    stores.game.getState().solvePuzzle(2);
    stores.game.getState().solvePuzzle(3);
    stores.game.getState().moveToRoom('hangar-bay');
  });
}

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

test('hangar bay: launch console rejects incomplete credentials', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('app')).toBeVisible();
  await page.locator('canvas').waitFor({ state: 'visible' });
  await page.waitForTimeout(1000);

  // Seed state: go to hangar bay with only the keycard (missing override-code and frequency)
  await page.evaluate(() => {
    const stores = (window as Record<string, unknown>).__stores as {
      game: { getState: () => { moveToRoom: (r: string) => void; solvePuzzle: (id: number) => void } };
      inventory: { getState: () => { addItem: (item: string) => void } };
    };
    stores.inventory.getState().addItem('keycard');
    stores.game.getState().moveToRoom('hangar-bay');
  });

  await page.locator('[data-testid="app"][data-room="hangar-bay"]').waitFor({ state: 'attached' });
  await page.waitForTimeout(500);

  // Open the console
  await page.locator('canvas').click({ position: SCENE4.console });
  await expect(page.getByText('IMPERIAL LAUNCH CONTROL v7.1')).toBeVisible();

  // Launch button should be disabled — incomplete credentials message shown
  await expect(page.getByText(/incomplete/i)).toBeVisible();
  const launchBtn = page.getByRole('button', { name: /INITIATE LAUNCH/i });
  await expect(launchBtn).toBeDisabled();

  // Close console
  await page.getByRole('button', { name: /close/i }).click();
  await expect(page.getByText('IMPERIAL LAUNCH CONTROL v7.1')).not.toBeVisible();
});

test('hangar bay: launch succeeds with all credentials and shows victory', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('app')).toBeVisible();
  await page.locator('canvas').waitFor({ state: 'visible' });
  await page.waitForTimeout(1000);

  // Seed state: hangar bay with full inventory
  await seedHangarBayState(page);

  await page.locator('[data-testid="app"][data-room="hangar-bay"]').waitFor({ state: 'attached' });
  await page.waitForTimeout(500);

  // HUD should show all three inventory items
  await expect(page.getByRole('listitem').filter({ hasText: 'keycard' })).toBeVisible();
  await expect(page.getByRole('listitem').filter({ hasText: 'override-code' })).toBeVisible();
  await expect(page.getByRole('listitem').filter({ hasText: 'frequency' })).toBeVisible();

  // Open the launch console
  await page.locator('canvas').click({ position: SCENE4.console });
  await expect(page.getByText('IMPERIAL LAUNCH CONTROL v7.1')).toBeVisible();

  // All slots should be filled
  await expect(page.getByText('KEYCARD INSERTED')).toBeVisible();
  await expect(page.getByText('AURE — ACCEPTED')).toBeVisible();
  await expect(page.getByText(/FREQ 1138/)).toBeVisible();

  // Launch button should be enabled
  const launchBtn = page.getByRole('button', { name: /INITIATE LAUNCH/i });
  await expect(launchBtn).toBeEnabled();
  await launchBtn.click();

  // Victory overlay should appear
  await expect(page.getByText(/escaped/i)).toBeVisible();
});
