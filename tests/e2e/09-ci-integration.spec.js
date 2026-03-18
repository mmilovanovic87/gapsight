import { test, expect } from '@playwright/test';
import { seedAndGoToResults } from './helpers';

/** Seed inputs where every KB metric ID has a value (no unentered metrics). */
const ALL_METRICS_FILLED = {
  inputs: {
    accuracy: 0.85,
    overall_accuracy: 0.85,
    f1_score: 0.80,
    auc_roc: 0.85,
    test_set_size: 500,
    demographic_parity_diff: 0.03,
    equalized_odds_diff: 0.03,
    disparate_impact_ratio: 0.85,
    bias_mitigation_applied: false,
    data_drift_score: 0.05,
    concept_drift_score: 0.05,
    adversarial_robustness_score: 0.75,
    explanation_coverage: 0.95,
    human_oversight: { q1: 'yes', q2: 'yes', q3: 'yes', q4: 'yes', q5: 'yes' },
    governance: {
      risk_management_system: { status: 'yes', evidence: 'Documented' },
      ai_policy: { status: 'yes', evidence: 'Documented' },
      technical_documentation: { status: 'yes', evidence: 'Documented' },
      data_governance_policy: { status: 'yes', evidence: 'Documented' },
      automated_logging: { status: 'yes', evidence: 'Documented' },
      quality_management_system: { status: 'yes', evidence: 'Documented' },
    },
  },
};

/**
 * Seed inputs with two numeric metrics explicitly set to null (cleared).
 * The seedAndGoToResults helper merges overrides onto defaults via spread,
 * so we must pass null to override the default values.
 * The KB metric 'accuracy' also has no matching input (form uses 'overall_accuracy'),
 * giving us 3 total not-provided metrics: accuracy, auc_roc, concept_drift_score.
 */
const PARTIAL_METRICS = {
  inputs: {
    overall_accuracy: 0.85,
    f1_score: 0.80,
    auc_roc: null,
    test_set_size: 500,
    demographic_parity_diff: 0.03,
    equalized_odds_diff: 0.03,
    disparate_impact_ratio: 0.85,
    bias_mitigation_applied: false,
    data_drift_score: 0.05,
    concept_drift_score: null,
    adversarial_robustness_score: 0.75,
    explanation_coverage: 0.95,
    human_oversight: { q1: 'yes', q2: 'yes', q3: 'yes', q4: 'yes', q5: 'yes' },
    governance: {
      risk_management_system: { status: 'yes', evidence: 'Documented' },
      ai_policy: { status: 'yes', evidence: 'Documented' },
      technical_documentation: { status: 'yes', evidence: 'Documented' },
      data_governance_policy: { status: 'yes', evidence: 'Documented' },
      automated_logging: { status: 'yes', evidence: 'Documented' },
      quality_management_system: { status: 'yes', evidence: 'Documented' },
    },
  },
};

test.describe('CI integration', () => {
  test('Export for CI triggers download with no warning when all metrics filled', async ({ page }) => {
    await seedAndGoToResults(page, ALL_METRICS_FILLED);

    // No warning should appear — all metrics are filled
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /Export for CI/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('assessment.json');

    // Warning should NOT be visible
    await expect(page.getByTestId('ci-export-warning')).not.toBeVisible();

    // Success message should appear
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

  test('unentered metrics show "Not provided" instead of FAIL styling', async ({ page }) => {
    await seedAndGoToResults(page, PARTIAL_METRICS);

    // Find metric rows marked as not-provided
    const notProvidedRows = page.locator('tr[data-metric-status="not-provided"]');
    // At least 3: accuracy (KB ID mismatch) + auc_roc + concept_drift_score
    await expect(notProvidedRows).toHaveCount(3);

    // Each not-provided row should show "Not provided" badge, not "FAIL"
    for (const row of await notProvidedRows.all()) {
      await expect(row.locator('span')).toContainText('Not provided');
      // Should NOT contain FAIL text
      const badgeText = await row.locator('span.inline-block').textContent();
      expect(badgeText).not.toBe('FAIL');
    }

    // Entered metric rows should NOT show "Not provided"
    const enteredRows = page.locator('tr[data-metric-status="entered"]');
    const count = await enteredRows.count();
    expect(count).toBeGreaterThan(0);
    for (const row of await enteredRows.all()) {
      const badgeText = await row.locator('span.inline-block').textContent();
      expect(badgeText).not.toBe('Not provided');
    }
  });

  test('Export for CI shows warning when metrics incomplete, exports on confirm', async ({ page }) => {
    await seedAndGoToResults(page, PARTIAL_METRICS);

    // Click Export for CI — should show warning, not download
    await page.getByRole('button', { name: /Export for CI/i }).click();
    const warning = page.getByTestId('ci-export-warning');
    await expect(warning).toBeVisible();

    // Warning message should contain the count (3: accuracy + auc_roc + concept_drift_score)
    await expect(warning).toContainText('3 metric(s) were not assessed');
    await expect(warning).toContainText('gapsight-core will treat them as failing');

    // Click "Export anyway" — should trigger download
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('ci-export-anyway').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('assessment.json');

    // Warning should disappear after export
    await expect(warning).not.toBeVisible();
  });
});
