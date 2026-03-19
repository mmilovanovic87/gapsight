import { describe, test, expect } from 'vitest';
import { computeResults } from './logic/compute-results';
import kb from './data/knowledge-base.json';

describe('computeResults smoke tests', () => {
  const baseProfile = {
    role: 'provider',
    risk_category: 'high-risk',
    deployment_status: 'pre-deployment',
    gpai_flag: false,
    frameworks_selected: ['eu_ai_act'],
  };

  test('returns valid results structure for minimal inputs', () => {
    const results = computeResults({}, baseProfile);
    expect(results).toBeDefined();
    expect(results.riskLevel).toBeDefined();
    expect(results.riskLevel.level).toMatch(/^(CRITICAL|HIGH|MEDIUM|LOW)$/);
    expect(results.metricResults).toBeInstanceOf(Array);
    expect(results.crossMetricWarnings).toBeInstanceOf(Array);
    expect(results.actionItems).toBeDefined();
    expect(results.generatedAt).toBeDefined();
    expect(results.frameworkSummary).toBeDefined();
    // allResults should include metrics + process requirements
    expect(results.allResults).toBeInstanceOf(Array);
    expect(results.allResults.length).toBeGreaterThan(0);
  });

  test('returns LOW risk for strong metric values', () => {
    const goodInputs = {
      overall_accuracy: 0.95,
      f1_score: 0.93,
      auc_roc: 0.97,
      test_set_size: 5000,
      test_set_representative: 'yes',
      demographic_parity_diff: 0.02,
      equalized_odds_diff: 0.03,
      disparate_impact_ratio: 0.95,
      bias_mitigation_applied: 'yes',
      data_drift_score: 0.02,
      adversarial_robustness_score: 0.92,
      drift_monitoring_active: 'yes',
      failsafe_mechanism_documented: 'yes',
      last_retrain_date: new Date().toISOString().split('T')[0],
      explainability_method: 'SHAP',
      explanation_coverage: 0.85,
      explanations_available_to_users: 'yes',
      model_card_exists: 'yes',
      instructions_for_use_documented: 'yes',
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
    };
    const results = computeResults(goodInputs, baseProfile);
    expect(results.riskLevel.level).toBe('LOW');
  });

  test('returns HIGH or CRITICAL risk for poor metric values', () => {
    const badInputs = {
      overall_accuracy: 0.40,
      f1_score: 0.30,
      auc_roc: 0.45,
      test_set_size: 10,
      demographic_parity_diff: 0.50,
      equalized_odds_diff: 0.40,
      disparate_impact_ratio: 0.30,
      human_oversight: { q1: 'no', q2: 'no', q3: 'no', q4: 'no', q5: 'no' },
    };
    const results = computeResults(badInputs, baseProfile);
    expect(['CRITICAL', 'HIGH']).toContain(results.riskLevel.level);
  });

  test('knowledge base has expected structure', () => {
    expect(kb.metrics).toBeInstanceOf(Array);
    expect(kb.metrics.length).toBeGreaterThan(0);
    expect(kb.process_requirements).toBeInstanceOf(Array);
    kb.metrics.forEach((m) => {
      expect(m).toHaveProperty('id');
      expect(m).toHaveProperty('label');
    });
  });
});
