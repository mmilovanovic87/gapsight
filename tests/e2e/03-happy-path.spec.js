import { test, expect } from '@playwright/test';
import { clearStorage, acceptTos, skipTemplatePicker, answerFrameworkQuestions, answerRiskTree } from './helpers';

test.describe('Happy path: high-risk provider, EU AI Act', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearStorage(page);
  });

  test('completes full assessment and reaches results', async ({ page }) => {
    // Navigate to assessment
    await page.getByRole('button', { name: /Start Free Assessment/i }).click();
    await expect(page).toHaveURL(/\/assessment/);

    // ToS
    await acceptTos(page);
    await skipTemplatePicker(page);

    // ---- Step 1: Deployment ----
    await page.getByText('Yes, already in production').click();
    await page.getByRole('button', { name: 'Next' }).click();

    // ---- Step 2: Frameworks ----
    // Q1: Yes (EU users), rest No
    await answerFrameworkQuestions(page, { q1: true });

    // Verify EU AI Act is shown as selected/locked
    await expect(page.getByText('EU AI Act').first()).toBeVisible();

    await page.getByRole('button', { name: 'Next' }).click();

    // ---- Step 3: Onboarding ----
    // Role: Provider
    await page.getByText('Provider: builds and places AI system on market').click();

    // GPAI: No
    await page.locator('.space-y-3').filter({ hasText: 'General-Purpose AI' }).getByRole('button', { name: 'No' }).click();

    // Risk tree: p1=Yes, p2=Yes, p4=No => high-risk (Annex III)
    await answerRiskTree(page, { p1: 'Yes', p2: 'Yes', p4: 'No' });

    // Verify high-risk result
    await expect(page.getByText(/High-risk/i)).toBeVisible();

    await page.getByRole('button', { name: 'Next' }).click();

    // ---- Step 4: Form sections ----

    // Section 1: Accuracy
    await page.locator('#overall_accuracy').fill('0.85');
    await page.locator('#f1_score').fill('0.80');
    await page.locator('#auc_roc').fill('0.85');
    await page.locator('#test_set_size').fill('500');
    await page.getByRole('button', { name: 'Next' }).click();

    // Section 2: Fairness
    await page.locator('#demographic_parity_diff').fill('0.03');
    await page.locator('#equalized_odds_diff').fill('0.03');
    await page.locator('#disparate_impact_ratio').fill('0.85');
    await page.getByText('Gender').click();
    // Bias mitigation: No
    await page.locator('input[name="bias_mitigation_applied"]').last().check();
    await page.getByRole('button', { name: 'Next' }).click();

    // Section 3: Robustness
    await page.locator('#data_drift_score').fill('0.05');
    await page.locator('#concept_drift_score').fill('0.05');
    await page.locator('#adversarial_robustness_score').fill('0.75');
    await page.getByRole('button', { name: 'Next' }).click();

    // Section 4: Explainability
    await page.locator('#explanation_coverage').fill('0.95');
    await page.getByRole('button', { name: 'Next' }).click();

    // Section 5: Human Oversight - all Yes
    const oversightBlocks = page.locator('.p-4.border.border-gray-200.rounded-lg');
    const hoCount = await oversightBlocks.count();
    for (let i = 0; i < hoCount; i++) {
      await oversightBlocks.nth(i).getByRole('button', { name: 'Yes' }).click();
    }
    await page.getByRole('button', { name: 'Next' }).click();

    // Section 6: Governance - all "Yes" with evidence
    const govBlocks = page.locator('.p-4.border.border-gray-200.rounded-lg');
    const govCount = await govBlocks.count();
    for (let i = 0; i < govCount; i++) {
      const block = govBlocks.nth(i);
      const yesBtn = block.getByRole('button', { name: 'Yes' });
      if (await yesBtn.isVisible().catch(() => false)) {
        await yesBtn.click();
        await page.waitForTimeout(100);
        const textarea = block.locator('textarea');
        if (await textarea.isVisible().catch(() => false)) {
          await textarea.fill('This is a documented evidence description here');
        }
      }
    }

    // Click Generate Results
    await page.getByRole('button', { name: /Generate Results/i }).click();

    // Handle inline disclaimer modal (first time per session)
    const disclaimerBtn = page.getByRole('button', { name: 'I Understand' });
    if (await disclaimerBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await disclaimerBtn.click();
      // Click Generate again after disclaimer
      await page.getByRole('button', { name: /Generate Results/i }).click();
    }

    // ---- Results page ----
    await expect(page).toHaveURL(/\/results/);
    // Risk level visible (the big text in the summary panel)
    await expect(page.locator('.text-3xl.font-bold')).toBeVisible();
    // Framework summary table has EU AI Act
    await expect(page.getByText('EU AI Act').first()).toBeVisible();
  });
});
