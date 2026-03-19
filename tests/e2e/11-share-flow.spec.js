import { test, expect } from '@playwright/test';
import { seedAndGoToResults } from './helpers';

test.describe('Share flow', () => {
  test('Share button opens modal and generates a share URL', async ({ page }) => {
    await seedAndGoToResults(page);

    // Mock the share API to avoid needing Vercel KV locally
    await page.route('**/api/share', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          share_id: 'test-seeded-uuid',
          has_pin: true,
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      });
    });

    // Click Share button
    const shareBtn = page.getByRole('button', { name: /Share/i });
    await shareBtn.scrollIntoViewIfNeeded();
    await shareBtn.click();

    // Modal should open with title "Share Assessment"
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(modal.getByText('Share Assessment')).toBeVisible();

    // PIN toggle should be checked by default
    const pinCheckbox = modal.locator('input[type="checkbox"]');
    await expect(pinCheckbox).toBeChecked();

    // Enter a valid PIN
    await modal.locator('input[inputmode="numeric"]').fill('1234');

    // Click Create Share Link
    await modal.getByRole('button', { name: /Create Share Link/i }).click();

    // Should show success state with a share URL
    await expect(modal.getByText('Share link created.')).toBeVisible({ timeout: 5000 });

    // The share URL should be visible in a readonly input containing the origin
    const urlInput = modal.locator('input[readonly]');
    await expect(urlInput).toBeVisible();
    const urlValue = await urlInput.inputValue();
    expect(urlValue).toContain('/shared/test-seeded-uuid');

    // Copy button should exist
    const copyBtn = modal.getByRole('button', { name: /Copy/i });
    await expect(copyBtn).toBeVisible();

    // PIN reminder should show since PIN was used
    await expect(modal.getByText(/share the PIN separately/i)).toBeVisible();

    // Close modal
    await modal.getByRole('button', { name: /Close/i }).click();
    await expect(modal).not.toBeVisible();
  });

  test('Share modal shows error on API failure', async ({ page }) => {
    await seedAndGoToResults(page);

    // Mock share API to return error
    await page.route('**/api/share', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Server error' }),
      });
    });

    await page.getByRole('button', { name: /Share/i }).scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: /Share/i }).click();

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    // Uncheck PIN for simpler test
    await modal.locator('input[type="checkbox"]').uncheck();

    // Click Create
    await modal.getByRole('button', { name: /Create Share Link/i }).click();

    // Should show error, not success
    await expect(modal.getByText(/Server error|Failed/i)).toBeVisible({ timeout: 5000 });
    await expect(modal.getByText('Share link created.')).not.toBeVisible();
  });

  // NOTE: PIN verification flow is not tested in E2E because it requires
  // a real Vercel KV backend to store and retrieve the hashed PIN.
  // The PIN flow is covered by the API endpoint code review:
  // - api/share/verify-pin/[uuid].js validates PIN format (4-8 digits)
  // - Uses bcrypt.compare against stored hash
  // - Returns 403 on incorrect PIN
  // - Returns full assessment data on correct PIN
});
