import { test, expect } from '@playwright/test';
import { seedAndGoToResults } from './helpers';

test.describe('Feedback form', () => {
  test('form is visible on results page with all fields', async ({ page }) => {
    await seedAndGoToResults(page);

    // Feedback section heading is "Report an Issue"
    const feedbackHeading = page.getByRole('heading', { name: /Report an Issue/i });
    await feedbackHeading.scrollIntoViewIfNeeded();
    await expect(feedbackHeading).toBeVisible();

    // Fields present
    await expect(page.locator('#feedback_type')).toBeVisible();
    await expect(page.locator('#feedback_desc')).toBeVisible();
    await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();
  });

  test('submit button disabled until form is valid', async ({ page }) => {
    await seedAndGoToResults(page);

    const submitBtn = page.getByRole('button', { name: /Submit/i });
    await expect(submitBtn).toBeDisabled();

    // Select issue type
    await page.locator('#feedback_type').selectOption({ index: 1 });
    // Still disabled (no description)
    await expect(submitBtn).toBeDisabled();

    // Type short description
    await page.locator('#feedback_desc').fill('Too short');
    await expect(submitBtn).toBeDisabled();

    // Type valid description (20+ chars)
    await page.locator('#feedback_desc').fill('This is a valid feedback description that is long enough.');
    await expect(submitBtn).toBeEnabled();
  });

  test('submit sends request to Formspree and shows success', async ({ page }) => {
    await seedAndGoToResults(page);

    // Mock Formspree endpoint to avoid real network call
    await page.route('https://formspree.io/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ next: 'https://formspree.io/thanks' }),
      });
    });

    // Fill form
    await page.locator('#feedback_type').selectOption({ index: 1 });
    await page.locator('#feedback_desc').fill('This is a valid feedback description that is long enough to submit.');
    await page.getByRole('button', { name: /Submit/i }).click();

    // Should show success message
    await expect(page.getByText(/feedback has been received/i)).toBeVisible({ timeout: 5000 });
  });

  test('shows error on network failure', async ({ page }) => {
    await seedAndGoToResults(page);

    // Mock Formspree to return error
    await page.route('https://formspree.io/**', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' }),
      });
    });

    await page.locator('#feedback_type').selectOption({ index: 1 });
    await page.locator('#feedback_desc').fill('This is a valid feedback description that should trigger an error.');
    await page.getByRole('button', { name: /Submit/i }).click();

    // Should show error (not success)
    await expect(page.getByText(/feedback has been received/i)).not.toBeVisible({ timeout: 3000 });
    // Button should be disabled for 30s
    await expect(page.getByRole('button', { name: /Submit/i })).toBeDisabled();
  });
});
