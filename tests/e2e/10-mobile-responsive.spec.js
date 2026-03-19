import { test, expect } from '@playwright/test';
import { clearStorage } from './helpers';

test.describe('Mobile responsiveness', () => {
  test.use({ viewport: { width: 375, height: 812 } }); // iPhone-sized viewport

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearStorage(page);
    await page.reload();
  });

  test('landing page renders without horizontal overflow', async ({ page }) => {
    const body = page.locator('body');
    const bodyWidth = await body.evaluate((el) => el.scrollWidth);
    const viewportWidth = 375;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
  });

  test('hero headline is visible on mobile', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /EU AI Act exposure/i })).toBeVisible();
  });

  test('CTA button is visible and tappable on mobile', async ({ page }) => {
    const cta = page.getByRole('button', { name: 'Start Assessment', exact: true }).first();
    await expect(cta).toBeVisible();
    await cta.click();
    await expect(page).toHaveURL(/\/assessment/);
  });

  test('hamburger menu toggles navigation on mobile', async ({ page }) => {
    // Desktop nav should be hidden
    const desktopNav = page.locator('.hidden.md\\:flex');
    await expect(desktopNav).not.toBeVisible();

    // Hamburger button should be visible
    const hamburger = page.getByLabel('Open menu');
    await expect(hamburger).toBeVisible();

    // Open menu
    await hamburger.click();

    // Nav links should now be visible
    await expect(page.locator('nav.md\\:hidden').getByText('About')).toBeVisible();
    await expect(page.locator('nav.md\\:hidden').getByText('KB Changelog')).toBeVisible();

    // Close menu
    await page.getByLabel('Close menu').click();

    // Nav links should be hidden again
    await expect(page.locator('nav.md\\:hidden')).not.toBeVisible();
  });

  test('footer links wrap correctly on mobile', async ({ page }) => {
    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();
    const footerWidth = await footer.evaluate((el) => el.scrollWidth);
    expect(footerWidth).toBeLessThanOrEqual(375);
  });
});
