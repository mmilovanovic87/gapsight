import { test, expect } from '@playwright/test';
import { clearStorage } from './helpers';

test.describe('Landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearStorage(page);
    await page.reload();
  });

  test('loads with headline and CTA button', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /compliance gaps/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Start Free Assessment/i })).toBeVisible();
  });

  test('CTA navigates to assessment', async ({ page }) => {
    await page.getByRole('button', { name: /Start Free Assessment/i }).click();
    await expect(page).toHaveURL(/\/assessment/);
  });

  test('trust badges are visible', async ({ page }) => {
    await expect(page.getByText('Free, no registration')).toBeVisible();
    await expect(page.getByText('No data stored on our servers')).toBeVisible();
    await expect(page.getByText('PDF, HTML and JSON export')).toBeVisible();
  });
});
