const constants = require('../constants');

describe('constants', () => {
  test('exports all oversight constants', () => {
    expect(constants.OVERSIGHT_WEIGHTS).toEqual([1, 3, 2, 2, 1]);
    expect(constants.OVERSIGHT_PASS_THRESHOLD).toBe(0.80);
    expect(constants.OVERSIGHT_REVIEW_THRESHOLD).toBe(0.60);
  });

  test('exports all context flag thresholds', () => {
    expect(constants.SMALL_TEST_SET_THRESHOLD).toBe(30);
    expect(constants.STALE_MODEL_24M_MONTHS).toBe(24);
    expect(constants.STALE_MODEL_12M_MONTHS).toBe(12);
  });

  test('exports all cross-metric thresholds', () => {
    expect(constants.CROSS_ACCURACY_THRESHOLD).toBe(0.90);
    expect(constants.CROSS_FAIRNESS_GAP_THRESHOLD).toBe(0.15);
    expect(constants.CROSS_ROBUSTNESS_THRESHOLD).toBe(0.80);
    expect(constants.CROSS_DRIFT_THRESHOLD).toBe(0.20);
    expect(constants.CROSS_RETRAIN_MONTHS_THRESHOLD).toBe(12);
    expect(constants.CROSS_FAIRNESS_MITIGATION_THRESHOLD).toBe(0.10);
    expect(constants.CROSS_OVERSIGHT_THRESHOLD).toBe(0.80);
    expect(constants.GPAI_SYSTEMIC_RISK_FLOPS).toBe(1e25);
  });

  test('exports all risk level thresholds', () => {
    expect(constants.RISK_FAIL_RATE_THRESHOLD).toBe(0.30);
    expect(constants.RISK_REVIEW_RATE_THRESHOLD).toBe(0.20);
    expect(constants.RISK_CROSS_CRITICAL_THRESHOLD).toBe(2);
  });

  test('exports framework names', () => {
    expect(constants.FRAMEWORK_NAMES).toEqual({
      eu_ai_act: 'EU AI Act',
      nist_ai_rmf: 'NIST RMF',
      iso_42001: 'ISO 42001',
    });
  });
});
