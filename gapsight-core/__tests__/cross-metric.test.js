const { evaluateCrossMetricRules, toNumberOrNull } = require('../cross-metric');

const baseProfile = {
  role: 'provider',
  gpai_flag: false,
  risk_category: 'high-risk',
  deployment_status: 'pre-deployment',
  frameworks_selected: ['eu_ai_act'],
};

describe('toNumberOrNull', () => {
  test('converts valid number strings', () => {
    expect(toNumberOrNull('0.5')).toBe(0.5);
    expect(toNumberOrNull('100')).toBe(100);
  });

  test('returns null for null/undefined/empty', () => {
    expect(toNumberOrNull(null)).toBeNull();
    expect(toNumberOrNull(undefined)).toBeNull();
    expect(toNumberOrNull('')).toBeNull();
  });

  test('returns null for NaN', () => {
    expect(toNumberOrNull('abc')).toBeNull();
  });

  test('passes through numbers', () => {
    expect(toNumberOrNull(0.5)).toBe(0.5);
  });
});

describe('evaluateCrossMetricRules', () => {
  test('Rule 1: accuracy-fairness tradeoff', () => {
    const inputs = { overall_accuracy: 0.95, demographic_parity_diff: 0.20 };
    const warnings = evaluateCrossMetricRules(inputs, baseProfile, null);
    const rule1 = warnings.find(w => w.id === 'accuracy_fairness_tradeoff');
    expect(rule1).toBeDefined();
    expect(rule1.severity).toBe('WARNING');
    expect(rule1.message).toContain('EU AI Act');
  });

  test('Rule 1: no warning when accuracy is low', () => {
    const inputs = { overall_accuracy: 0.80, demographic_parity_diff: 0.20 };
    const warnings = evaluateCrossMetricRules(inputs, baseProfile, null);
    expect(warnings.find(w => w.id === 'accuracy_fairness_tradeoff')).toBeUndefined();
  });

  test('Rule 1: includes NIST reference when selected', () => {
    const profile = { ...baseProfile, frameworks_selected: ['eu_ai_act', 'nist_ai_rmf'] };
    const inputs = { overall_accuracy: 0.95, demographic_parity_diff: 0.20 };
    const warnings = evaluateCrossMetricRules(inputs, profile, null);
    const rule1 = warnings.find(w => w.id === 'accuracy_fairness_tradeoff');
    expect(rule1.message).toContain('NIST');
  });

  test('Rule 1: uses best practices text when no frameworks', () => {
    const profile = { ...baseProfile, frameworks_selected: [] };
    const inputs = { overall_accuracy: 0.95, demographic_parity_diff: 0.20 };
    const warnings = evaluateCrossMetricRules(inputs, profile, null);
    const rule1 = warnings.find(w => w.id === 'accuracy_fairness_tradeoff');
    expect(rule1.message).toContain('Best practices');
  });

  test('Rule 2: robustness without monitoring', () => {
    const inputs = { adversarial_robustness_score: 0.85, drift_monitoring_active: false };
    const warnings = evaluateCrossMetricRules(inputs, baseProfile, null);
    expect(warnings.find(w => w.id === 'robustness_without_monitoring')).toBeDefined();
  });

  test('Rule 2: no warning when monitoring is active', () => {
    const inputs = { adversarial_robustness_score: 0.85, drift_monitoring_active: true };
    const warnings = evaluateCrossMetricRules(inputs, baseProfile, null);
    expect(warnings.find(w => w.id === 'robustness_without_monitoring')).toBeUndefined();
  });

  test('Rule 3: high drift without retraining', () => {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    const inputs = { data_drift_score: 0.25, last_retrain_date: twoYearsAgo.toISOString() };
    const warnings = evaluateCrossMetricRules(inputs, baseProfile, null);
    const rule3 = warnings.find(w => w.id === 'high_drift_without_retraining');
    expect(rule3).toBeDefined();
    expect(rule3.severity).toBe('CRITICAL');
  });

  test('Rule 4: fairness without mitigation (EU AI Act)', () => {
    const inputs = { equalized_odds_diff: 0.15, bias_mitigation_applied: false };
    const warnings = evaluateCrossMetricRules(inputs, baseProfile, null);
    const rule4 = warnings.find(w => w.id === 'fairness_without_mitigation');
    expect(rule4).toBeDefined();
    expect(rule4.severity).toBe('CRITICAL');
    expect(rule4.message).toContain('EU AI Act');
  });

  test('Rule 4: fairness without mitigation (no EU AI Act)', () => {
    const profile = { ...baseProfile, frameworks_selected: ['nist_ai_rmf'] };
    const inputs = { equalized_odds_diff: 0.15, bias_mitigation_applied: false };
    const warnings = evaluateCrossMetricRules(inputs, profile, null);
    const rule4 = warnings.find(w => w.id === 'fairness_without_mitigation');
    expect(rule4.message).toContain('Immediate remediation');
  });

  test('Rule 5: explainability-oversight gap', () => {
    const inputs = { explainability_method: 'None' };
    const warnings = evaluateCrossMetricRules(inputs, baseProfile, 0.50);
    expect(warnings.find(w => w.id === 'explainability_oversight_gap')).toBeDefined();
  });

  test('Rule 5: no warning when oversight score is high', () => {
    const inputs = { explainability_method: 'None' };
    const warnings = evaluateCrossMetricRules(inputs, baseProfile, 0.90);
    expect(warnings.find(w => w.id === 'explainability_oversight_gap')).toBeUndefined();
  });

  test('Rule 6: GPAI systemic risk notification', () => {
    const profile = { ...baseProfile, gpai_flag: true };
    const inputs = { training_flops: 1e26, systemic_risk_notification_sent: 'no' };
    const warnings = evaluateCrossMetricRules(inputs, profile, null);
    expect(warnings.find(w => w.id === 'gpai_systemic_risk_notification')).toBeDefined();
  });

  test('Rule 6: no warning when not GPAI', () => {
    const inputs = { training_flops: 1e26, systemic_risk_notification_sent: 'no' };
    const warnings = evaluateCrossMetricRules(inputs, baseProfile, null);
    expect(warnings.find(w => w.id === 'gpai_systemic_risk_notification')).toBeUndefined();
  });

  test('Rule 7: high-risk post-deployment without logging', () => {
    const profile = { ...baseProfile, deployment_status: 'post-deployment' };
    const inputs = { automated_logging: 'no' };
    const warnings = evaluateCrossMetricRules(inputs, profile, null);
    const rule7 = warnings.find(w => w.id === 'high_risk_post_deploy_no_logging');
    expect(rule7).toBeDefined();
    expect(rule7.severity).toBe('CRITICAL');
  });

  test('Rule 7: no warning for pre-deployment', () => {
    const inputs = { automated_logging: 'no' };
    const warnings = evaluateCrossMetricRules(inputs, baseProfile, null);
    expect(warnings.find(w => w.id === 'high_risk_post_deploy_no_logging')).toBeUndefined();
  });

  test('returns empty array for clean inputs', () => {
    const warnings = evaluateCrossMetricRules({}, baseProfile, null);
    expect(warnings).toEqual([]);
  });

  test('Rule 6: no warning when EU AI Act not selected', () => {
    const profile = { ...baseProfile, gpai_flag: true, frameworks_selected: ['nist_ai_rmf'] };
    const inputs = { training_flops: 1e26, systemic_risk_notification_sent: 'no' };
    const warnings = evaluateCrossMetricRules(inputs, profile, null);
    expect(warnings.find(w => w.id === 'gpai_systemic_risk_notification')).toBeUndefined();
  });

  test('Rule 7: message varies without EU AI Act', () => {
    const profile = { ...baseProfile, deployment_status: 'post-deployment', frameworks_selected: ['nist_ai_rmf'] };
    const inputs = { automated_logging: 'no' };
    const warnings = evaluateCrossMetricRules(inputs, profile, null);
    const rule7 = warnings.find(w => w.id === 'high_risk_post_deploy_no_logging');
    expect(rule7.message).not.toContain('EU AI Act');
  });

  test('defaults frameworks_selected to true when undefined', () => {
    const profile = { ...baseProfile, frameworks_selected: undefined };
    const inputs = { overall_accuracy: 0.95, demographic_parity_diff: 0.20 };
    const warnings = evaluateCrossMetricRules(inputs, profile, null);
    const rule1 = warnings.find(w => w.id === 'accuracy_fairness_tradeoff');
    expect(rule1.message).toContain('EU AI Act');
  });
});
