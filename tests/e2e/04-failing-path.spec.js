import { test, expect } from '@playwright/test';
import { clearStorage, acceptTos, answerFrameworkQuestions, answerRiskTree } from './helpers';

test.describe('Failing path: bad metrics produce CRITICAL/HIGH risk', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearStorage(page);
  });

  test('failing values show high risk with action items and remediation', async ({ page }) => {
    await page.getByRole('button', { name: /Start Free Assessment/i }).click();
    await acceptTos(page);

    // Step 1: Deployment
    await page.getByText('Yes, already in production').click();
    await page.getByRole('button', { name: 'Next' }).click();

    // Step 2: Frameworks - all No (defaults to NIST)
    await answerFrameworkQuestions(page, { q1: false, q2: false, q3: false, q4: false, q5: false });
    await page.getByRole('button', { name: 'Next' }).click();

    // Step 3: Onboarding - Provider, no GPAI, high-risk
    await page.locator('input[name="role"][value="provider"]').check({ force: true });
    await page.locator('.space-y-3').filter({ hasText: 'General-Purpose AI' }).getByRole('button', { name: 'No' }).click();

    // Risk tree: p1=Yes, p2=Yes, p4=No => high-risk
    await answerRiskTree(page, { p1: 'Yes', p2: 'Yes', p4: 'No' });

    await page.getByRole('button', { name: 'Next' }).click();

    // Step 4: Form with failing values

    // Accuracy: all bad
    await page.locator('#overall_accuracy').fill('0.50');
    await page.locator('#f1_score').fill('0.40');
    await page.locator('#auc_roc').fill('0.45');
    await page.locator('#test_set_size').fill('50');
    await page.getByRole('button', { name: 'Next' }).click();

    // Fairness: bad
    await page.locator('#demographic_parity_diff').fill('0.20');
    await page.locator('#equalized_odds_diff').fill('0.25');
    await page.locator('#disparate_impact_ratio').fill('0.50');
    await page.locator('input[name="bias_mitigation_applied"]').last().check();
    await page.getByRole('button', { name: 'Next' }).click();

    // Robustness: bad
    await page.locator('#data_drift_score').fill('0.80');
    await page.locator('#concept_drift_score').fill('0.75');
    await page.locator('#adversarial_robustness_score').fill('0.20');
    await page.getByRole('button', { name: 'Next' }).click();

    // Explainability: bad
    await page.locator('#explanation_coverage').fill('0.10');
    await page.getByRole('button', { name: 'Next' }).click();

    // Human Oversight: all No
    const oversightBlocks = page.locator('.p-4.border.border-gray-200.rounded-lg');
    const hoCount = await oversightBlocks.count();
    for (let i = 0; i < hoCount; i++) {
      await oversightBlocks.nth(i).getByRole('button', { name: 'No' }).click();
    }
    await page.getByRole('button', { name: 'Next' }).click();

    // Governance: all No
    const govBlocks = page.locator('.p-4.border.border-gray-200.rounded-lg');
    const govCount = await govBlocks.count();
    for (let i = 0; i < govCount; i++) {
      const noBtn = govBlocks.nth(i).getByRole('button', { name: 'No' });
      if (await noBtn.isVisible().catch(() => false)) {
        await noBtn.click();
      }
    }

    // Generate
    await page.getByRole('button', { name: /Generate Results/i }).click();
    const disclaimerBtn = page.getByRole('button', { name: 'I Understand' });
    if (await disclaimerBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await disclaimerBtn.click();
      await page.getByRole('button', { name: /Generate Results/i }).click();
    }

    // Results page
    await expect(page).toHaveURL(/\/results/);

    // Should be CRITICAL or HIGH
    const riskText = page.locator('.text-3xl.font-bold');
    await expect(riskText).toBeVisible();
    const level = await riskText.textContent();
    expect(['CRITICAL', 'HIGH']).toContain(level);

    // Should have action items with "Show details"
    const showDetailsBtn = page.getByRole('button', { name: /Show details/i }).first();
    await expect(showDetailsBtn).toBeVisible();

    // Click and verify remediation content appears
    await showDetailsBtn.click();
    await expect(page.getByRole('button', { name: /Hide details/i }).first()).toBeVisible();
  });
});
