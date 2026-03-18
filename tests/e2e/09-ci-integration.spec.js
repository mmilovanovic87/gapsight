import { test, expect } from '@playwright/test';
import { seedAndGoToResults } from './helpers';

test.describe('CI integration', () => {
  test('Export for CI triggers a download with correct filename', async ({ page }) => {
    await seedAndGoToResults(page);

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /Export for CI/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('assessment.json');

    // Verify the inline message appears
    await expect(page.getByTestId('ci-export-message')).toBeVisible();
    await expect(page.getByTestId('ci-export-message')).toContainText('.gapsight/assessment.json');
  });

  test('CI CTA block is visible and contains workflow YAML', async ({ page }) => {
    await seedAndGoToResults(page);

    const ctaBlock = page.getByTestId('ci-cta-block');
    await expect(ctaBlock).toBeVisible();

    // Expand the collapsible section
    await ctaBlock.getByRole('button').click();

    // Verify YAML snippet is visible
    await expect(ctaBlock.locator('pre')).toContainText('compliance-check@v1');
    await expect(ctaBlock.locator('pre')).toContainText('assessment-path');
    await expect(ctaBlock.locator('pre')).toContainText("fail-on: 'HIGH'");

    // Verify documentation link exists
    const docsLink = ctaBlock.getByRole('link', { name: /Full documentation/i });
    await expect(docsLink).toBeVisible();
    await expect(docsLink).toHaveAttribute('href', /compliance-check/);
  });
});
