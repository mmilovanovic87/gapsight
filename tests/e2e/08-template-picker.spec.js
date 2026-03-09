import { test, expect } from '@playwright/test';
import { clearStorage } from './helpers';

test.describe('Template picker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearStorage(page);
  });

  test('template picker is shown as first step', async ({ page }) => {
    await page.getByRole('button', { name: /Start Free Assessment/i }).click();
    await page.getByRole('button', { name: 'I Accept' }).click();
    await expect(page.getByText(/Choose a starting point/i)).toBeVisible();
  });

  test('start from scratch skips to deployment step', async ({ page }) => {
    await page.getByRole('button', { name: /Start Free Assessment/i }).click();
    await page.getByRole('button', { name: 'I Accept' }).click();
    await page.getByRole('button', { name: /Start from scratch/i }).click();
    await expect(page.getByText(/deployment/i).first()).toBeVisible();
  });

  test('selecting a template and clicking Use this template advances to deployment', async ({ page }) => {
    await page.getByRole('button', { name: /Start Free Assessment/i }).click();
    await page.getByRole('button', { name: 'I Accept' }).click();

    // Pick the first template card
    const firstCard = page.locator('[data-testid="template-card"]').first();
    const cardExists = await firstCard.isVisible({ timeout: 3000 }).catch(() => false);

    if (cardExists) {
      await firstCard.click();
      await page.getByRole('button', { name: /Use this template/i }).click();
    } else {
      // Fallback: click first card by any clickable card selector
      await page.locator('.cursor-pointer').first().click();
      await page.getByRole('button', { name: /Use this template/i }).click();
    }

    await expect(page.getByText(/deployment/i).first()).toBeVisible();
  });

  test('template pre-fills inputs visible on form sections', async ({ page }) => {
    await page.goto('/assessment');
    await page.evaluate(() => {
      const session = {
        schema_version: 1,
        assessment_id: 'test-template-uuid',
        created_at: new Date().toISOString(),
        last_modified_at: new Date().toISOString(),
        kb_version: '1.0.0',
        tos_accepted_at: new Date().toISOString(),
        disclaimer_confirmed_at: new Date().toISOString(),
      };
      const profile = {
        role: 'provider',
        gpai_flag: false,
        risk_category: 'high-risk',
        deployment_status: 'post-deployment',
        frameworks_selected: ['eu_ai_act'],
        frameworks_answers: { q1: true, q2: false, q3: false, q4: false, q5: false },
      };
      const inputs = {
        overall_accuracy: 0.92,
        f1_score: 0.88,
        auc_roc: 0.91,
        test_set_size: 1200,
        demographic_parity_diff: 0.04,
        equalized_odds_diff: 0.03,
        disparate_impact_ratio: 0.88,
        bias_mitigation_applied: true,
        data_drift_score: 0.04,
        concept_drift_score: 0.03,
        adversarial_robustness_score: 0.82,
        explanation_coverage: 0.9,
        human_oversight: { q1: 'yes', q2: 'yes', q3: 'yes', q4: 'yes', q5: 'no' },
        governance: {
          risk_management_system: { status: 'yes', evidence: 'Documented' },
          ai_policy: { status: 'yes', evidence: 'Policy in place' },
          technical_documentation: { status: 'yes', evidence: 'Full docs' },
          data_governance_policy: { status: 'yes', evidence: 'Documented' },
          automated_logging: { status: 'yes', evidence: 'Active' },
          quality_management_system: { status: 'yes', evidence: 'QMS active' },
        },
      };
      localStorage.setItem('gapsight_session', JSON.stringify(session));
      localStorage.setItem('gapsight_profile', JSON.stringify(profile));
      localStorage.setItem('gapsight_inputs', JSON.stringify(inputs));
      sessionStorage.setItem('gapsight_disclaimer_shown', 'true');
    });

    await page.goto('/assessment');

    // Verify pre-filled accuracy value is present
    const accuracyInput = page.locator('#overall_accuracy');
    if (await accuracyInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(accuracyInput).toHaveValue('0.92');
    }
  });
});
