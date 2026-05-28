import { test, expect, type Page } from '@playwright/test';

/** Force English so intro button / copy match stable selectors (CI browsers may prefer es). */
async function forceEnglishLocale(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('i18nextLng', 'en');
  });
}

/** Dismiss dialogue or schematic overlays so canvas clicks are not blocked. */
async function dismissOverlays(page: Page) {
  const close = page.getByRole('button', { name: /close/i });
  while (await close.isVisible().catch(() => false)) {
    await close.click();
    await page.waitForTimeout(150);
  }
}

function webglCanvas(page: Page) {
  return page.locator('[data-testid="game-canvas"] canvas');
}

/** Wait until R3F has sized the WebGL canvas (headless CI can mount with 0×0 briefly). */
async function waitForWebGLCanvas(page: Page) {
  const canvas = webglCanvas(page);
  await canvas.waitFor({ state: 'attached', timeout: 30_000 });
  await expect(canvas).toBeVisible({ timeout: 30_000 });
  await page.waitForFunction(
    () => {
      const el = document.querySelector<HTMLCanvasElement>(
        '[data-testid="game-canvas"] canvas',
      );
      return Boolean(el && el.width > 0 && el.height > 0);
    },
    { timeout: 30_000 },
  );
}

/** Canvas mounts only when phase === 'playing' (after intro). */
async function startGameFromIntro(page: Page) {
  await expect(page.getByTestId('intro')).toBeVisible();
  await page.getByTestId('intro-start').click();
  await expect(page.getByTestId('intro')).toBeHidden({ timeout: 15_000 });
  await waitForWebGLCanvas(page);
  await page.waitForTimeout(500);
}

async function clickCanvas(page: Page, position: { x: number; y: number }) {
  const canvas = webglCanvas(page);
  await waitForWebGLCanvas(page);
  await canvas.click({ position, force: true, timeout: 15_000 });
}

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
//   Cell 0  world [0.5,  0.3, 2.3]  → depth 2.97 → (719, 426)
//   Cell 1  world [2.6,  0.3, 1.3]  → depth 3.92 → (951, 373)
//   Cell 2  world [1.5,  0.3, 2.8]  → depth 2.49 → (922, 467)
//   Slot 0  world [-2.85, 2.0, -2.0] → depth 6.55 → (429, 180)
//   Slot 1  world [-2.85, 1.5, -2.0] → depth 6.70 → (433, 217)
//   Slot 2  world [-2.85, 1.0, -2.0] → depth 6.85 → (438, 253)
//   Blast door  world [0, 1.4, -3.92] → depth 8.56 → (640, 221)
// Scene 4 — Hangar Bay
//   Launch console world [0, 0.5, -0.5] → depth 5.57 → (640, 307)

const SCENE1 = {
  panel: { x: 813, y: 216 },
  door: { x: 754, y: 302 },
};

const SCENE2 = {
  terminal: { x: 640, y: 310 },
  door: { x: 640, y: 221 },
};

const SCENE3 = {
  cell0: { x: 719, y: 426 },
  cell1: { x: 951, y: 373 },
  cell2: { x: 922, y: 467 },
  slot0: { x: 429, y: 180 },
  slot1: { x: 433, y: 217 },
  slot2: { x: 438, y: 253 },
  door: { x: 640, y: 221 },
};

const SCENE4 = {
  console: { x: 640, y: 307 },
};

const CORRECT_SEQUENCE = ['A', 'U', 'R', 'E'];

test('happy path: escape from detention cell through control room to corridor', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await forceEnglishLocale(page);
  await page.goto('/');
  await expect(page.getByTestId('app')).toBeVisible();

  // ── Intro Screen ───────────────────────────────────────────────────────────
  await startGameFromIntro(page);

  // ── Scene 1: Detention Cell ───────────────────────────────────────────────

  // Find the hidden keycard behind the loose wall panel
  await clickCanvas(page, SCENE1.panel);
  await expect(
    page.getByText('A hidden maintenance keycard! This must open the cell door.'),
  ).toBeVisible();
  await expect(page.getByRole('listitem').filter({ hasText: 'keycard' })).toBeVisible();
  await page.getByRole('button', { name: /close/i }).click();

  // Exit the detention cell — door now unlocked
  await clickCanvas(page, SCENE1.door);

  // ── Scene 2: Control Room ─────────────────────────────────────────────────

  // Wait for scene transition: Zustand update → React re-render → R3F mesh mount + raycasting setup
  await page.locator('[data-testid="app"][data-room="control-room"]').waitFor({ state: 'attached' });
  await page.waitForTimeout(500);

  // Solve the Imperial Override puzzle at the terminal
  await clickCanvas(page, SCENE2.terminal);
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
  await clickCanvas(page, SCENE2.door);
  await page.waitForTimeout(300);
  await expect(
    page.getByText('Blast door sealed. Complete the Imperial Override sequence first.'),
  ).not.toBeVisible();

  // ── Scene 3: Corridor ─────────────────────────────────────────────────────

  await page.locator('[data-testid="app"][data-room="corridor"]').waitFor({ state: 'attached' });
  await page.waitForTimeout(500);
  await dismissOverlays(page);

  // Cell 0 starts at 0° — correct orientation for Slot 0 (no rotation needed)
  await clickCanvas(page, SCENE3.cell0);
  await page.waitForTimeout(200);
  await clickCanvas(page, SCENE3.slot0);
  await page.waitForTimeout(200);

  // Cell 1 starts at 0° — needs 90° for Slot 1 (one rotation)
  await clickCanvas(page, SCENE3.cell1);
  await page.waitForTimeout(200);
  await clickCanvas(page, SCENE3.cell1); // rotate to 90°
  await page.waitForTimeout(200);
  await clickCanvas(page, SCENE3.slot1);
  await page.waitForTimeout(200);

  // Cell 2 starts at 0° — needs 180° for Slot 2 (two rotations)
  await clickCanvas(page, SCENE3.cell2);
  await page.waitForTimeout(200);
  await clickCanvas(page, SCENE3.cell2); // rotate to 90°
  await page.waitForTimeout(200);
  await clickCanvas(page, SCENE3.cell2); // rotate to 180°
  await page.waitForTimeout(200);
  await clickCanvas(page, SCENE3.slot2);
  await page.waitForTimeout(500);

  // All conduits powered — frequency in inventory, dialogue shown
  await expect(
    page.getByText(/All conduits powered! Frequency 47 acquired/),
  ).toBeVisible();
  await expect(page.getByRole('listitem').filter({ hasText: 'frequency' })).toBeVisible();
  await page.getByRole('button', { name: /close/i }).click();

  // Exit through the corridor blast door to the hangar bay
  await clickCanvas(page, SCENE3.door);
  await page.waitForTimeout(300);
  await page
    .locator('[data-testid="app"][data-room="hangar-bay"]')
    .waitFor({ state: 'attached', timeout: 5000 });

  // ── Scene 4: Hangar Bay ───────────────────────────────────────────────────

  await dismissOverlays(page);
  // Click the launch console to open the credential verification overlay
  await clickCanvas(page, SCENE4.console);
  await expect(page.getByText('IMPERIAL LAUNCH CONTROL v7.1')).toBeVisible();

  // Verify all three credentials are present and slots show "filled" status
  await expect(page.getByText('KEYCARD INSERTED')).toBeVisible();
  await expect(page.getByText('AURE — ACCEPTED')).toBeVisible();
  await expect(page.getByText('FREQ 1138 — LOCKED')).toBeVisible();

  // Launch the shuttle — all credentials are present
  await page.getByRole('button', { name: /INITIATE LAUNCH/i }).click();
  await page.waitForTimeout(500);

  // Verify victory screen appears
  await expect(page.getByText(/escaped Detention Block AA-23/)).toBeVisible();
  await expect(page.getByRole('button', { name: /Play Again/i })).toBeVisible();
});
