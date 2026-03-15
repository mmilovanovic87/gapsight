const { runComplianceCheck, constants } = require('../index');
const path = require('path');
const knowledgeBase = require(path.join(__dirname, '..', '..', 'src', 'data', 'knowledge-base.json'));

const baseProfile = {
  role: 'provider',
  gpai_flag: false,
  risk_category: 'high-risk',
  deployment_status: 'pre-deployment',
  frameworks_selected: ['eu_ai_act'],
};

describe('runComplianceCheck', () => {
  test('throws when assessment is null or not an object', () => {
    expect(() => runComplianceCheck(null)).toThrow('non-null assessment object');
    expect(() => runComplianceCheck(undefined)).toThrow('non-null assessment object');
    expect(() => runComplianceCheck('string')).toThrow('non-null assessment object');
  });

  test('throws when knowledgeBase is missing or not an object', () => {
    expect(() => runComplianceCheck({})).toThrow('knowledgeBase must be a non-null object');
    expect(() => runComplianceCheck({ knowledgeBase: null })).toThrow('knowledgeBase must be a non-null object');
    expect(() => runComplianceCheck({ knowledgeBase: 'string' })).toThrow('knowledgeBase must be a non-null object');
  });

  test('throws when knowledgeBase.metrics is not an array', () => {
    expect(() => runComplianceCheck({ knowledgeBase: { metrics: 'not-array', process_requirements: [] } })).toThrow('metrics must be an array');
    expect(() => runComplianceCheck({ knowledgeBase: { process_requirements: [] } })).toThrow('metrics must be an array');
  });

  test('throws when knowledgeBase.process_requirements is not an array', () => {
    expect(() => runComplianceCheck({ knowledgeBase: { metrics: [] } })).toThrow('process_requirements must be an array');
    expect(() => runComplianceCheck({ knowledgeBase: { metrics: [], process_requirements: 'not-array' } })).toThrow('process_requirements must be an array');
  });

  test('throws when profile is missing or not an object', () => {
    expect(() => runComplianceCheck({ knowledgeBase, profile: null, inputs: {} })).toThrow('profile must be a non-null object');
    expect(() => runComplianceCheck({ knowledgeBase, inputs: {} })).toThrow('profile must be a non-null object');
  });

  test('throws when inputs is missing or not an object', () => {
    expect(() => runComplianceCheck({ knowledgeBase, profile: baseProfile })).toThrow('inputs must be a non-null object');
    expect(() => runComplianceCheck({ knowledgeBase, profile: baseProfile, inputs: null })).toThrow('inputs must be a non-null object');
  });

  test('returns a complete report for a passing assessment', () => {
    const report = runComplianceCheck({
      knowledgeBase,
      profile: baseProfile,
      inputs: {
        overall_accuracy: 0.95,
        f1_score: 0.92,
        auc_roc: 0.97,
        test_set_size: 5000,
        demographic_parity_diff: 0.03,
        equalized_odds_diff: 0.02,
        disparate_impact_ratio: 0.95,
        bias_mitigation_applied: true,
        bias_mitigation_method: 'Reweighing applied to training data to equalise selection rates',
        data_drift_score: 0.05,
        concept_drift_score: 0.03,
        adversarial_robustness_score: 0.88,
        explanation_coverage: 0.90,
        explainability_method: 'SHAP',
        explanations_available_to_users: true,
        model_card_exists: true,
        instructions_for_use_documented: true,
        human_oversight: { q1: 'yes', q2: 'yes', q3: 'yes', q4: 'yes', q5: 'yes' },
        governance: {
          risk_management_system: { status: 'yes' },
          ai_policy: { status: 'yes' },
          technical_documentation: { status: 'yes' },
          data_governance_policy: { status: 'yes' },
          automated_logging: { status: 'yes' },
          quality_management_system: { status: 'yes' },
          third_party_vendor_assessment: { status: 'not_applicable' },
        },
      },
    });

    expect(report).toHaveProperty('passed');
    expect(report).toHaveProperty('riskLevel');
    expect(report).toHaveProperty('metricResults');
    expect(report).toHaveProperty('processResults');
    expect(report).toHaveProperty('oversightResult');
    expect(report).toHaveProperty('crossMetricWarnings');
    expect(report).toHaveProperty('frameworkSummary');
    expect(report).toHaveProperty('contextFlags');
    expect(report).toHaveProperty('generatedAt');

    expect(report.riskLevel.level).toBe('LOW');
    expect(report.passed).toBe(true);
    expect(report.metricResults.length).toBeGreaterThan(0);
    expect(report.frameworkSummary.eu_ai_act).toBeDefined();
  });

  test('returns failing report for poor metrics', () => {
    const report = runComplianceCheck({
      knowledgeBase,
      profile: baseProfile,
      inputs: {
        overall_accuracy: 0.50,
        f1_score: 0.40,
        human_oversight: { q1: 'no', q2: 'no', q3: 'no', q4: 'no', q5: 'no' },
      },
    });

    expect(report.passed).toBe(false);
    expect(['CRITICAL', 'HIGH']).toContain(report.riskLevel.level);
  });

  test('includes cross-metric warnings', () => {
    const report = runComplianceCheck({
      knowledgeBase,
      profile: baseProfile,
      inputs: {
        overall_accuracy: 0.95,
        demographic_parity_diff: 0.20,
        equalized_odds_diff: 0.15,
        bias_mitigation_applied: false,
      },
    });

    expect(report.crossMetricWarnings.length).toBeGreaterThan(0);
  });

  test('handles empty inputs gracefully', () => {
    const report = runComplianceCheck({
      knowledgeBase,
      profile: baseProfile,
      inputs: {},
    });

    expect(report).toHaveProperty('riskLevel');
    expect(report.metricResults.length).toBeGreaterThan(0);
  });

  test('filters frameworks correctly', () => {
    const report = runComplianceCheck({
      knowledgeBase,
      profile: { ...baseProfile, frameworks_selected: ['iso_42001'] },
      inputs: { overall_accuracy: 0.90 },
    });

    expect(report.frameworkSummary.iso_42001).toBeDefined();
    expect(report.frameworkSummary.eu_ai_act).toBeUndefined();
  });

  test('includes oversight result when oversight answers provided', () => {
    const report = runComplianceCheck({
      knowledgeBase,
      profile: baseProfile,
      inputs: {
        human_oversight: { q1: 'yes', q2: 'yes', q3: 'yes', q4: 'yes', q5: 'yes' },
      },
    });

    expect(report.oversightResult).not.toBeNull();
    expect(report.oversightResult.status).toBe('PASS');
  });

  test('oversight result is null when no oversight answers', () => {
    const report = runComplianceCheck({
      knowledgeBase,
      profile: baseProfile,
      inputs: {},
    });

    expect(report.oversightResult).toBeNull();
  });

  test('generatedAt is a valid ISO date string', () => {
    const report = runComplianceCheck({
      knowledgeBase,
      profile: baseProfile,
      inputs: {},
    });

    expect(new Date(report.generatedAt).toISOString()).toBe(report.generatedAt);
  });
});

describe('module exports', () => {
  test('exports constants', () => {
    expect(constants).toBeDefined();
    expect(constants.OVERSIGHT_WEIGHTS).toBeDefined();
  });
});
