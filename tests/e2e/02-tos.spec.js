import { test, expect } from '@playwright/test';
import { clearStorage } from './helpers';

test.describe('ToS modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearStorage(page);
  });

  test('appears on first visit to assessment', async ({ page }) => {
    await page.goto('/assessment');
    await expect(page.getByRole('heading', { name: /Terms of Service/i })).toBeVisible();
    await expect(page.getByRole('button', { name: 'I Accept' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Exit' })).toBeVisible();
  });

  test('"I Accept" proceeds to assessment form', async ({ page }) => {
    await page.goto('/assessment');
    await page.getByRole('button', { name: 'I Accept' }).click();
    // Template picker is now shown after ToS
    await page.getByRole('button', { name: /Start from scratch/i }).click();
    // Should see Step 1 (Deployment context)
    await expect(page.getByText(/deployment/i).first()).toBeVisible();
  });

  test('does not reappear after acceptance', async ({ page }) => {
    await page.goto('/assessment');
    await page.getByRole('button', { name: 'I Accept' }).click();
    // Reload and revisit
    await page.goto('/assessment');
    await expect(page.getByRole('heading', { name: /Terms of Service/i })).not.toBeVisible();
  });
});
