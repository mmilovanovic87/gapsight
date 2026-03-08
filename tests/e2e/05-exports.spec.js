import { test, expect } from '@playwright/test';
import { seedAndGoToResults } from './helpers';

test.describe('Export buttons', () => {
  test('Download JSON triggers a file download', async ({ page }) => {
    await seedAndGoToResults(page);
    await expect(page.getByText(/Download JSON/i)).toBeVisible();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /Download JSON/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.json$/);
  });

  test('Download HTML triggers a file download', async ({ page }) => {
    await seedAndGoToResults(page);

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /Download HTML/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.html$/);
  });
});
