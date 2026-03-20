import { test, expect } from '@playwright/test';
import { clearStorage } from './helpers';

test.describe('Landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearStorage(page);
    await page.reload();
  });

  test('loads with headline and CTA button', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /EU AI Act exposure/i })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start Assessment', exact: true }).first()).toBeVisible();
  });

  test('CTA navigates to assessment', async ({ page }) => {
    await page.getByRole('button', { name: 'Start Assessment', exact: true }).first().click();
    await expect(page).toHaveURL(/\/assessment/);
  });

  test('social proof bar is visible', async ({ page }) => {
    await expect(page.getByText('Free and open-source')).toBeVisible();
    await expect(page.getByText('no credit card', { exact: false }).first()).toBeVisible();
  });
});
