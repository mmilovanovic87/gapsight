import { test, expect } from '@playwright/test';
import { clearStorage, acceptTos, skipTemplatePicker } from './helpers';

test.describe('Mobile responsiveness', () => {
  test.use({ viewport: { width: 375, height: 812 } }); // iPhone SE

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearStorage(page);
    await page.reload();
  });

  /** Helper: assert no horizontal scroll on the current page. */
  async function assertNoHorizontalScroll(page) {
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(375);
  }

  test('landing page renders without horizontal overflow', async ({ page }) => {
    await assertNoHorizontalScroll(page);
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

  test('assessment page has no horizontal overflow through wizard steps', async ({ page }) => {
    // Navigate to assessment
    await page.getByRole('button', { name: 'Start Assessment', exact: true }).first().click();
    await expect(page).toHaveURL(/\/assessment/);

    // Step: ToS modal — accept
    await acceptTos(page);
    await assertNoHorizontalScroll(page);

    // Step: Template picker — skip
    await skipTemplatePicker(page);
    await assertNoHorizontalScroll(page);

    // Step: Deployment context — pick an option and advance
    const deployOption = page.getByRole('button', { name: /Not yet/i });
    if (await deployOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await deployOption.click();
      await page.getByRole('button', { name: /Next/i }).click();
      await assertNoHorizontalScroll(page);
    }
  });
});
