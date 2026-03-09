/**
 * Shared helpers for GapSight e2e tests.
 */

/** Clear all gapsight_ localStorage keys and sessionStorage to start fresh. */
export async function clearStorage(page) {
  await page.evaluate(() => {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('gapsight_'))
      .forEach((k) => localStorage.removeItem(k));
    sessionStorage.clear();
  });
}

/** Accept the ToS modal by clicking the accept button. */
export async function acceptTos(page) {
  await page.getByRole('button', { name: 'I Accept' }).click();
}

/** Skip the template picker by clicking "Start from scratch". */
export async function skipTemplatePicker(page) {
  const skipBtn = page.getByRole('button', { name: /Start from scratch/i });
  if (await skipBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await skipBtn.click();
  }
}

/**
 * Seed localStorage with a completed assessment and navigate to /results.
 * Skips ToS, disclaimer, and the entire form flow.
 */
export async function seedAndGoToResults(page, overrides = {}) {
  await page.goto('/');
  await clearStorage(page);

  await page.evaluate((ov) => {
    const session = {
      schema_version: 1,
      assessment_id: 'test-seeded-uuid',
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
      ...ov.profile,
    };
    const inputs = {
      overall_accuracy: 0.85,
      f1_score: 0.80,
      auc_roc: 0.85,
      test_set_size: 500,
      demographic_parity_diff: 0.03,
      equalized_odds_diff: 0.03,
      disparate_impact_ratio: 0.85,
      protected_attributes_tested: ['Gender'],
      bias_mitigation_applied: false,
      data_drift_score: 0.05,
      concept_drift_score: 0.05,
      adversarial_robustness_score: 0.75,
      explanation_coverage: 0.95,
      human_oversight: { q1: 'yes', q2: 'yes', q3: 'yes', q4: 'yes', q5: 'yes' },
      governance: {
        risk_management_system: { status: 'yes', evidence: 'Documented risk management' },
        ai_policy: { status: 'yes', evidence: 'AI policy in place' },
        technical_documentation: { status: 'yes', evidence: 'Full docs available' },
        data_governance_policy: { status: 'yes', evidence: 'Data governance documented' },
        automated_logging: { status: 'yes', evidence: 'Logging is automated' },
        quality_management_system: { status: 'yes', evidence: 'QMS documented' },
      },
      ...ov.inputs,
    };
    localStorage.setItem('gapsight_session', JSON.stringify(session));
    localStorage.setItem('gapsight_profile', JSON.stringify(profile));
    localStorage.setItem('gapsight_inputs', JSON.stringify(inputs));
    sessionStorage.setItem('gapsight_disclaimer_shown', 'true');
  }, overrides);

  await page.goto('/results');
}

/**
 * Answer framework decision tree questions sequentially.
 * Waits for each question to appear before answering.
 */
export async function answerFrameworkQuestions(page, answers = {}) {
  const defaults = { q1: true, q2: false, q3: false, q4: false, q5: false, ...answers };
  const keys = ['q1', 'q2', 'q3', 'q4', 'q5'];
  const questionTexts = [
    'reside in the EU',
    'based in the US',
    'ISO certification',
    'globally recognized',
    'expand to the EU',
  ];

  for (let i = 0; i < keys.length; i++) {
    const container = page.locator('.p-4.border-gray-200.rounded-lg').filter({ hasText: questionTexts[i] });
    try {
      await container.waitFor({ state: 'visible', timeout: 5000 });
    } catch {
      break; // tree ended early, stop
    }
    const btnName = defaults[keys[i]] ? 'Yes' : 'No';
    await container.getByRole('button', { name: btnName }).click();
    await page.waitForTimeout(200);
  }
}

/**
 * Answer risk category decision tree in OnboardingStep.
 * Each question appears conditionally based on previous answers.
 */
export async function answerRiskTree(page, { p1 = 'Yes', p2, p3, p4 } = {}) {
  const riskQ = async (text, answer) => {
    const container = page.locator('.ml-4').filter({ hasText: text });
    await container.waitFor({ state: 'visible', timeout: 10000 });
    await container.getByRole('button', { name: answer }).click();
  };

  await riskQ('affect natural persons', p1);
  if (p2 !== undefined) await riskQ('employment, education', p2);
  if (p3 !== undefined) await riskQ('mislead them', p3);
  if (p4 !== undefined) await riskQ('safety component', p4);
}
