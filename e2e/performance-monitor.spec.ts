import { test, expect, type Page, type BrowserContext } from '@playwright/test';

/**
 * E2E tests for PerformanceMonitor quality tier switching.
 *
 * Tests that the PerformanceMonitor responds to FPS drops by:
 * 1. Degrading to low tier (dpr=0.75, no ContactShadows) when FPS drops
 * 2. Recovering to high tier when FPS improves
 *
 * Uses Chrome DevTools Protocol (CDP) to apply CPU throttling and simulate low FPS conditions.
 */

async function applyCpuThrottle(context: BrowserContext, rate: number) {
  const pages = context.pages();
  if (pages.length === 0) throw new Error('No pages available for throttling');

  const client = await context.newCDPSession(pages[0]);
  // CPU throttle: 1 = normal, 6 = 6x slowdown
  await client.send('Emulation.setCPUThrottlingRate', { rate });
}

test.describe('PerformanceMonitor E2E', () => {
  test('auto-degrades to low tier when CPU is throttled', async ({ page, context }) => {
    test.setTimeout(45_000);

    // Navigate to app and wait for it to fully load
    await page.goto('/');
    await expect(page.getByTestId('app')).toBeVisible();

    // Skip the intro crawl to get to the name input screen faster
    const skipCrawlButton = page.getByTestId('skip-crawl').first();
    if (await skipCrawlButton.isVisible()) {
      await skipCrawlButton.click();
    }

    // Wait for the name input to appear
    const nameInput = page.locator('input[type="text"]');
    await expect(nameInput).toBeVisible({ timeout: 5000 });

    // Enter a player name and start the game
    // This transitions from intro phase → playing phase
    // Canvas only renders when phase === 'playing'
    await nameInput.fill('TestPilot');
    const startButton = page.locator('button').filter({ hasText: /start|comenzar/i }).first();
    await startButton.click();

    // Wait for Canvas to render and PerformanceMonitor to initialize
    await page.waitForTimeout(3000);

    // Verify we start in high tier
    const appElement = page.locator('[data-testid="app"]');
    await expect(appElement).toHaveAttribute('data-quality-tier', 'high');

    // Apply CPU throttling (6x slowdown) to trigger FPS decline
    await applyCpuThrottle(context, 6);

    // Wait for PerformanceMonitor to detect the decline and switch to low tier.
    // drei's PerformanceMonitor measures FPS over ~2-3 seconds before triggering onDecline.
    // With 6x CPU throttling, we expect the decline callback within 4-5 seconds.
    await expect(appElement).toHaveAttribute('data-quality-tier', 'low', { timeout: 12000 });

    // Remove throttling
    await applyCpuThrottle(context, 1);

    // Wait for PerformanceMonitor to detect recovery and switch back to high tier.
    // Recovery should take similar time (~2-3 seconds measurement window).
    await expect(appElement).toHaveAttribute('data-quality-tier', 'high', { timeout: 12000 });
  });
});
