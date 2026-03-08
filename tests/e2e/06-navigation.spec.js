import { test, expect } from '@playwright/test';
import { clearStorage } from './helpers';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearStorage(page);
  });

  test('"New Assessment" clears form and returns to Step 1', async ({ page }) => {
    // Seed some profile data so there's something to clear
    await page.evaluate(() => {
      localStorage.setItem('gapsight_profile', JSON.stringify({
        role: 'provider',
        gpai_flag: false,
        risk_category: 'high-risk',
        deployment_status: 'post-deployment',
        frameworks_selected: ['eu_ai_act'],
      }));
      localStorage.setItem('gapsight_session', JSON.stringify({
        schema_version: 1,
        assessment_id: 'test-nav',
        created_at: new Date().toISOString(),
        last_modified_at: new Date().toISOString(),
        kb_version: '1.0.0',
        tos_accepted_at: new Date().toISOString(),
      }));
    });
    await page.reload();

    // Click New Assessment in header
    const header = page.getByRole('banner');
    await header.getByRole('button', { name: /New Assessment/i }).click();
    await expect(page).toHaveURL(/\/assessment/);

    // Should see Step 1 content (deployment heading)
    await expect(page.getByRole('heading', { name: 'Deployment Context' })).toBeVisible();

    // Profile should be cleared
    const profile = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('gapsight_profile'))
    );
    expect(profile?.role).toBeNull();
  });

  test('About page loads', async ({ page }) => {
    await page.getByRole('banner').getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL(/\/about/);
    await expect(page.locator('main')).toBeVisible();
  });

  test('Privacy page loads', async ({ page }) => {
    await page.getByRole('banner').getByRole('link', { name: 'Privacy' }).click();
    await expect(page).toHaveURL(/\/privacy/);
    await expect(page.locator('main')).toBeVisible();
  });

  test('Terms page loads', async ({ page }) => {
    await page.getByRole('banner').getByRole('link', { name: 'Terms' }).click();
    await expect(page).toHaveURL(/\/terms/);
    await expect(page.locator('main')).toBeVisible();
  });

  test('KB Changelog page loads', async ({ page }) => {
    await page.getByRole('banner').getByRole('link', { name: /KB Changelog/i }).click();
    await expect(page).toHaveURL(/\/kb-changelog/);
    await expect(page.locator('main')).toBeVisible();
  });
});
