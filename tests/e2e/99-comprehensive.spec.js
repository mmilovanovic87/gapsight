/**
 * Pre-presentation comprehensive QA test suite for GapSight.
 */
import { test, expect } from '@playwright/test';
import { clearStorage, acceptTos, skipTemplatePicker, seedAndGoToResults, answerFrameworkQuestions, answerRiskTree } from './helpers';

// ═══════════════════════════════════════════
// SECTION 1: LANDING PAGE
// ═══════════════════════════════════════════
test.describe('S1: Landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearStorage(page);
    await page.reload();
  });

  test('1.1 hero headline and CTA', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /EU AI Act exposure/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start Assessment', exact: true }).first()).toBeVisible();
  });

  test('1.1 Start Assessment navigates', async ({ page }) => {
    await page.getByRole('button', { name: 'Start Assessment', exact: true }).first().click();
    await expect(page).toHaveURL(/\/assessment/);
  });

  test('1.1 GitHub link correct', async ({ page }) => {
    const ghLink = page.getByRole('link', { name: /View on GitHub/i }).first();
    await expect(ghLink).toHaveAttribute('href', 'https://github.com/mmilovanovic87/gapsight');
    await expect(ghLink).toHaveAttribute('target', '_blank');
  });

  test('1.1 page loads under 3s', async ({ page }) => {
    const start = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    expect(Date.now() - start).toBeLessThan(3000);
  });

  test('1.2 social proof bar', async ({ page }) => {
    await expect(page.getByText('Free forever').first()).toBeVisible();
    await expect(page.getByText(/NIST AI RMF/).first()).toBeVisible();
    await expect(page.getByText(/Open source/i).first()).toBeVisible();
  });

  test('1.3 how it works', async ({ page }) => {
    await expect(page.getByText('Pick your use case')).toBeVisible();
    await expect(page.getByText('Enter your metrics')).toBeVisible();
    await expect(page.getByText('Get your gap report')).toBeVisible();
  });

  test('1.4 compliance as code', async ({ page }) => {
    const section = page.locator('#compliance-as-code');
    await expect(section).toBeAttached();
    await expect(section.getByText('mmilovanovic87/gapsight')).toBeVisible();
    await expect(section.getByText('@v1')).toBeVisible();
  });

  test('1.5 feature grid', async ({ page }) => {
    await expect(page.getByText('8 use-case templates')).toBeVisible();
    await expect(page.getByText('Metric-to-regulation mapping')).toBeVisible();
    await expect(page.getByText('CI/CD integration')).toBeVisible();
    await expect(page.getByText('Export and share')).toBeVisible();
  });

  test('1.6 framework cards', async ({ page }) => {
    await expect(page.getByText('Regulation (EU) 2024/1689')).toBeVisible();
    await expect(page.getByText('NIST AI 100-1 (2023)')).toBeVisible();
    await expect(page.getByText('ISO/IEC 42001:2023').first()).toBeVisible();
  });

  test('1.7 legal disclaimer', async ({ page }) => {
    await expect(page.getByText(/does not constitute legal advice/i).first()).toBeVisible();
  });

  test('1.8 nav links', async ({ page }) => {
    await page.getByRole('link', { name: /KB Changelog/i }).first().click();
    await expect(page).toHaveURL(/\/kb-changelog/);
  });

  test('1.8 logo home', async ({ page }) => {
    await page.goto('/about');
    await page.getByRole('link', { name: 'GapSight' }).click();
    await expect(page).toHaveURL('/');
  });
});

// ═══════════════════════════════════════════
// SECTION 2: TEMPLATES
// ═══════════════════════════════════════════
test.describe('S2: Template pre-fill', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearStorage(page);
    await page.goto('/assessment');
    await acceptTos(page);
  });

  for (const label of [
    'GPT-4 Customer Support Chatbot', 'CV / Résumé Screening', 'Recommendation Engine',
    'Fraud Detection', 'Credit Scoring', 'Student Assessment',
    'Legal Document Analysis', 'Document Classification',
  ]) {
    test(`"${label}" loads`, async ({ page }) => {
      const card = page.locator('.border.rounded-lg').filter({ hasText: label });
      await expect(card).toBeVisible({ timeout: 5000 });
      await card.click();
      const useBtn = page.getByRole('button', { name: /Use this template/i });
      if (await useBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await useBtn.click();
      }
      await expect(page.getByText(/Deployment Context|already in production/i).first()).toBeVisible({ timeout: 5000 });
    });
  }
});

test.describe('S2: Seeded results', () => {
  test('seeded assessment renders results', async ({ page }) => {
    await seedAndGoToResults(page);
    await expect(page).toHaveURL(/\/results/);
    await expect(page.locator('.text-3xl.font-bold')).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Overall Accuracy' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Download JSON/i })).toBeVisible();
  });
});

// ═══════════════════════════════════════════
// SECTION 3: EDGE CASES
// ═══════════════════════════════════════════
test.describe('S3: Edge cases', () => {
  test('3.2 all metrics = 0', async ({ page }) => {
    await seedAndGoToResults(page, {
      inputs: {
        overall_accuracy: 0, f1_score: 0, auc_roc: 0, test_set_size: 100,
        demographic_parity_diff: 0, equalized_odds_diff: 0, disparate_impact_ratio: 0,
        data_drift_score: 0, concept_drift_score: 0, adversarial_robustness_score: 0,
        explanation_coverage: 0,
      },
    });
    await expect(page).toHaveURL(/\/results/);
    await expect(page.locator('.text-3xl.font-bold')).toBeVisible();
  });

  test('3.2 all metrics = 1', async ({ page }) => {
    await seedAndGoToResults(page, {
      inputs: {
        overall_accuracy: 1, f1_score: 1, auc_roc: 1, test_set_size: 10000,
        demographic_parity_diff: 0, equalized_odds_diff: 0, disparate_impact_ratio: 1,
        data_drift_score: 0, concept_drift_score: 0, adversarial_robustness_score: 1,
        explanation_coverage: 1,
      },
    });
    await expect(page).toHaveURL(/\/results/);
    await expect(page.locator('.text-3xl.font-bold')).toBeVisible();
  });

  test('3.4 empty metrics page loads', async ({ page }) => {
    await seedAndGoToResults(page, {
      inputs: {
        overall_accuracy: null, f1_score: null, auc_roc: null, test_set_size: null,
        demographic_parity_diff: null, equalized_odds_diff: null, disparate_impact_ratio: null,
        data_drift_score: null, concept_drift_score: null, adversarial_robustness_score: null,
        explanation_coverage: null,
      },
    });
    await expect(page).toHaveURL(/\/results/);
    // Page should render without crash and show metric table
    await expect(page.getByText('Metric Results')).toBeVisible();
  });

  test('3.3 not applicable metrics', async ({ page }) => {
    await seedAndGoToResults(page, {
      inputs: {
        overall_accuracy: 0.85,
        f1_score: 'not_applicable',
        auc_roc: 'not_applicable',
        test_set_size: 500,
        demographic_parity_diff: 0.03, equalized_odds_diff: 0.03, disparate_impact_ratio: 0.85,
        data_drift_score: 0.05, concept_drift_score: 0.05, adversarial_robustness_score: 0.75,
        explanation_coverage: 0.95,
      },
    });
    await expect(page).toHaveURL(/\/results/);
    await expect(page.getByText('Metric Results')).toBeVisible();
    // The "Not applicable to my system" checkbox label or "Not applicable" badge
    const naText = page.getByText('Not applicable');
    expect(await naText.count()).toBeGreaterThanOrEqual(1);
  });
});

// ═══════════════════════════════════════════
// SECTION 4: RESULTS PAGE
// ═══════════════════════════════════════════
test.describe('S4: Results page', () => {
  test('4.1 risk disclaimer', async ({ page }) => {
    await seedAndGoToResults(page);
    await expect(page.getByTestId('risk-score-disclaimer')).toContainText('metric-based risk score');
  });

  test('4.2 metric legend', async ({ page }) => {
    await seedAndGoToResults(page);
    const legend = page.getByTestId('metric-legend');
    await expect(legend).toContainText('PASS');
    await expect(legend).toContainText('FAIL');
    await expect(legend).toContainText('Not provided');
  });

  test('4.3 action items expand', async ({ page }) => {
    await seedAndGoToResults(page, {
      inputs: {
        overall_accuracy: 0.3, f1_score: 0.2, auc_roc: 0.3, test_set_size: 50,
        demographic_parity_diff: 0.5, equalized_odds_diff: 0.5, disparate_impact_ratio: 0.3,
        data_drift_score: 0.8, concept_drift_score: 0.8,
        adversarial_robustness_score: 0.1, explanation_coverage: 0.1,
      },
    });
    const showBtn = page.getByText('Show details').first();
    await expect(showBtn).toBeVisible();
    await showBtn.click();
    await expect(page.getByText('How to fix').first()).toBeVisible();
  });

  test('4.7 metadata', async ({ page }) => {
    await seedAndGoToResults(page);
    await expect(page.getByText(/Generated:/i)).toBeVisible();
    await expect(page.getByText(/KB v/i).first()).toBeVisible();
  });

  test('4.8 risk modal', async ({ page }) => {
    await seedAndGoToResults(page);
    await page.getByText('How is this calculated?').click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});

// ═══════════════════════════════════════════
// SECTION 5: EXPORTS
// ═══════════════════════════════════════════
test.describe('S5: Exports', () => {
  test('5.1 JSON valid', async ({ page }) => {
    await seedAndGoToResults(page);
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /Download JSON/i }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.json$/);
    const path = await download.path();
    const fs = require('fs');
    const parsed = JSON.parse(fs.readFileSync(path, 'utf-8'));
    expect(parsed).toHaveProperty('_meta');
  });

  test('5.2 HTML export', async ({ page }) => {
    await seedAndGoToResults(page);
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /Download HTML/i }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.html$/);
  });

  test('5.7 security note', async ({ page }) => {
    await seedAndGoToResults(page);
    await expect(page.getByTestId('ci-security-note')).toBeVisible();
  });

  test('5.8 share modal', async ({ page }) => {
    await seedAndGoToResults(page);
    await page.route('**/api/share', (route) => {
      route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({
          success: true, share_id: 'comp-uuid', has_pin: true,
          expires_at: new Date(Date.now() + 365 * 86400000).toISOString(),
        }),
      });
    });
    await page.getByRole('button', { name: /Share/i }).scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: /Share/i }).click();
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await modal.locator('input[inputmode="numeric"]').fill('1234');
    await modal.getByRole('button', { name: /Create Share Link/i }).click();
    await expect(modal.getByText('Share link created.')).toBeVisible({ timeout: 5000 });
  });
});

// ═══════════════════════════════════════════
// SECTION 6: ROUTING
// ═══════════════════════════════════════════
test.describe('S6: Routing', () => {
  test('6.1 content pages load', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible();

    await page.goto('/terms');
    await expect(page.getByRole('heading', { name: 'Terms of Service' })).toBeVisible();

    await page.goto('/about');
    await expect(page.locator('main')).toContainText('GapSight');

    await page.goto('/kb-changelog');
    await expect(page.getByRole('heading', { name: 'Knowledge Base Changelog' })).toBeVisible();
  });

  test('6.1 /results without data no crash', async ({ page }) => {
    await page.goto('/');
    await clearStorage(page);
    await page.goto('/results');
    await page.waitForTimeout(1000);
    expect((await page.locator('body').innerText()).length).toBeGreaterThan(10);
  });

  test('6.2 browser back no crash', async ({ page }) => {
    await seedAndGoToResults(page);
    await page.goBack();
    await page.waitForTimeout(500);
    expect((await page.locator('body').innerText()).length).toBeGreaterThan(10);
  });

  test('6.4 Back to Assessment', async ({ page }) => {
    await seedAndGoToResults(page);
    await page.getByText('Back to Assessment').click();
    await expect(page).toHaveURL(/\/assessment/);
  });
});

// ═══════════════════════════════════════════
// SECTION 7: CONTENT
// ═══════════════════════════════════════════
test.describe('S7: Content', () => {
  test('7.1 Privacy Policy', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible();
    await expect(page.getByText('Last updated: March 2026')).toBeVisible();
    await expect(page.getByText(/Vercel Analytics/i).first()).toBeVisible();
  });

  test('7.2 Terms', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.getByRole('heading', { name: 'Terms of Service' })).toBeVisible();
    await expect(page.getByText('Last updated: March 2026')).toBeVisible();
    await expect(page.getByText(/MIT License/i).first()).toBeVisible();
  });

  test('7.3 About', async ({ page }) => {
    await page.goto('/about');
    expect((await page.locator('main').innerText()).length).toBeGreaterThan(100);
  });

  test('7.4 KB Changelog', async ({ page }) => {
    await page.goto('/kb-changelog');
    await expect(page.getByText('Version 1.0')).toBeVisible();
    await expect(page.getByText(/NIST/i).first()).toBeVisible();
  });

  test('7.5 feedback validation', async ({ page }) => {
    await seedAndGoToResults(page);
    const submitBtn = page.getByRole('button', { name: /Submit/i });
    await expect(submitBtn).toBeDisabled();
    await page.locator('#feedback_type').selectOption({ index: 1 });
    await page.locator('#feedback_desc').fill('This is a valid description that passes the twenty character minimum.');
    await expect(submitBtn).toBeEnabled();
  });
});

// ═══════════════════════════════════════════
// SECTION 8: MOBILE (375px)
// ═══════════════════════════════════════════
test.describe('S8: Mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  async function noHScroll(page) {
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(sw).toBeLessThanOrEqual(375);
  }

  test('8.1 landing no overflow', async ({ page }) => {
    await page.goto('/');
    await noHScroll(page);
    await expect(page.getByRole('heading', { name: /EU AI Act exposure/i }).first()).toBeVisible();
  });

  test('8.3 results no overflow', async ({ page }) => {
    await seedAndGoToResults(page);
    await noHScroll(page);
  });

  test('8.4 content pages no overflow', async ({ page }) => {
    for (const p of ['/privacy', '/terms', '/about', '/kb-changelog']) {
      await page.goto(p);
      await noHScroll(page);
    }
  });
});

// ═══════════════════════════════════════════
// SECTION 9: RESILIENCE
// ═══════════════════════════════════════════
test.describe('S9: Resilience', () => {
  test('9.2 localStorage cleared', async ({ page }) => {
    await seedAndGoToResults(page);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(1000);
    expect((await page.locator('body').innerText()).length).toBeGreaterThan(10);
  });

  test('9.3 malformed localStorage', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('gapsight_session', '{{{INVALID}}}');
      localStorage.setItem('gapsight_profile', 'null');
      localStorage.setItem('gapsight_inputs', '12345');
    });
    await page.reload();
    await page.waitForTimeout(1000);
    expect((await page.locator('body').innerText()).length).toBeGreaterThan(10);
  });
});

// ═══════════════════════════════════════════
// SECTION 10: ACCESSIBILITY
// ═══════════════════════════════════════════
test.describe('S10: Accessibility', () => {
  test('10.1 modal aria', async ({ page }) => {
    await seedAndGoToResults(page);
    await page.getByText('How is this calculated?').click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  test('10.2 form labels', async ({ page }) => {
    await seedAndGoToResults(page);
    await expect(page.locator('label[for="feedback_type"]')).toBeAttached();
    await expect(page.locator('label[for="feedback_desc"]')).toBeAttached();
  });

  test('10.3 risk badge readable', async ({ page }) => {
    await seedAndGoToResults(page);
    const badge = page.locator('.text-3xl.font-bold');
    await expect(badge).toBeVisible();
    const text = await badge.innerText();
    expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(text);
  });
});
