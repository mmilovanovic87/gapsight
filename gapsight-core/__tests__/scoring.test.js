const { getMetricStatus, getProcessStatus, getHumanOversightStatus, deriveContextFlags, monthsSinceDate } = require('../scoring');

const makeMetric = (overrides = {}) => ({
  id: 'test_metric',
  section: 'accuracy_performance',
  direction: 'higher_better',
  pass_threshold: 0.80,
  review_threshold: 0.65,
  ...overrides,
});

const baseProfile = {
  role: 'provider',
  gpai_flag: false,
  risk_category: 'high-risk',
  deployment_status: 'pre-deployment',
};

describe('getMetricStatus', () => {
  const isRequired = () => true;
  const isNotRequired = () => false;

  test('returns CRITICAL_FAIL when CRITICAL_FAIL flag is set', () => {
    expect(getMetricStatus(0.9, makeMetric(), ['CRITICAL_FAIL'], baseProfile, isRequired)).toBe('CRITICAL_FAIL');
  });

  test('returns FAIL for null value when metric is required', () => {
    expect(getMetricStatus(null, makeMetric(), [], baseProfile, isRequired)).toBe('FAIL');
  });

  test('returns NOT_APPLICABLE for null value when metric is not required', () => {
    expect(getMetricStatus(null, makeMetric(), [], baseProfile, isNotRequired)).toBe('NOT_APPLICABLE');
  });

  test('returns NOT_APPLICABLE for undefined value when not required', () => {
    expect(getMetricStatus(undefined, makeMetric(), [], baseProfile, isNotRequired)).toBe('NOT_APPLICABLE');
  });

  test('returns NOT_APPLICABLE for empty string value when not required', () => {
    expect(getMetricStatus('', makeMetric(), [], baseProfile, isNotRequired)).toBe('NOT_APPLICABLE');
  });

  test('returns NOT_APPLICABLE when value is "not_applicable" string (user-marked)', () => {
    expect(getMetricStatus('not_applicable', makeMetric(), [], baseProfile, isRequired)).toBe('NOT_APPLICABLE');
    expect(getMetricStatus('not_applicable', makeMetric(), [], baseProfile, isNotRequired)).toBe('NOT_APPLICABLE');
  });

  test('returns NOT_APPLICABLE for "not_applicable" even with CRITICAL_FAIL flag', () => {
    expect(getMetricStatus('not_applicable', makeMetric(), ['CRITICAL_FAIL'], baseProfile, isRequired)).toBe('NOT_APPLICABLE');
  });

  test('returns REVIEW for SMALL_TEST_SET flag on accuracy metrics', () => {
    expect(getMetricStatus(0.9, makeMetric(), ['SMALL_TEST_SET'], baseProfile, isRequired)).toBe('REVIEW');
  });

  test('returns REVIEW for UNREPRESENTATIVE_TEST_SET flag on accuracy metrics', () => {
    expect(getMetricStatus(0.9, makeMetric(), ['UNREPRESENTATIVE_TEST_SET'], baseProfile, isRequired)).toBe('REVIEW');
  });

  test('does not apply SMALL_TEST_SET to non-accuracy metrics', () => {
    const metric = makeMetric({ section: 'fairness' });
    expect(getMetricStatus(0.9, metric, ['SMALL_TEST_SET'], baseProfile, isRequired)).toBe('PASS');
  });

  test('returns PROCESS_REQUIRED for NO_PROD_MONITORING on drift metrics', () => {
    const metric = makeMetric({ section: 'robustness_drift', id: 'data_drift_score' });
    expect(getMetricStatus(0.1, metric, ['NO_PROD_MONITORING'], baseProfile, isRequired)).toBe('PROCESS_REQUIRED');
  });

  test('does not apply NO_PROD_MONITORING to non-drift metrics', () => {
    const metric = makeMetric({ section: 'robustness_drift', id: 'adversarial_robustness_score' });
    expect(getMetricStatus(0.9, metric, ['NO_PROD_MONITORING'], baseProfile, isRequired)).toBe('PASS');
  });

  test('returns PROCESS_REQUIRED for concept_drift_score with NO_PROD_MONITORING', () => {
    const metric = makeMetric({ section: 'robustness_drift', id: 'concept_drift_score' });
    expect(getMetricStatus(0.1, metric, ['NO_PROD_MONITORING'], baseProfile, isRequired)).toBe('PROCESS_REQUIRED');
  });

  test('returns PASS for higher_better metric above pass threshold', () => {
    expect(getMetricStatus(0.85, makeMetric(), [], baseProfile, isRequired)).toBe('PASS');
  });

  test('returns REVIEW for higher_better metric between thresholds', () => {
    expect(getMetricStatus(0.70, makeMetric(), [], baseProfile, isRequired)).toBe('REVIEW');
  });

  test('returns FAIL for higher_better metric below review threshold', () => {
    expect(getMetricStatus(0.50, makeMetric(), [], baseProfile, isRequired)).toBe('FAIL');
  });

  test('returns PASS for lower_better metric below pass threshold', () => {
    const metric = makeMetric({ direction: 'lower_better', pass_threshold: 0.10, review_threshold: 0.20 });
    expect(getMetricStatus(0.05, metric, [], baseProfile, isRequired)).toBe('PASS');
  });

  test('returns REVIEW for lower_better metric between thresholds', () => {
    const metric = makeMetric({ direction: 'lower_better', pass_threshold: 0.10, review_threshold: 0.20 });
    expect(getMetricStatus(0.15, metric, [], baseProfile, isRequired)).toBe('REVIEW');
  });

  test('returns FAIL for lower_better metric above review threshold', () => {
    const metric = makeMetric({ direction: 'lower_better', pass_threshold: 0.10, review_threshold: 0.20 });
    expect(getMetricStatus(0.30, metric, [], baseProfile, isRequired)).toBe('FAIL');
  });

  test('uses absolute value for negative numbers', () => {
    expect(getMetricStatus(-0.85, makeMetric(), [], baseProfile, isRequired)).toBe('PASS');
  });
});

describe('getProcessStatus', () => {
  const req = { id: 'test_req' };

  test('returns NOT_APPLICABLE for not_applicable', () => {
    expect(getProcessStatus('not_applicable', req, baseProfile)).toBe('NOT_APPLICABLE');
  });

  test('returns PASS for yes', () => {
    expect(getProcessStatus('yes', req, baseProfile)).toBe('PASS');
  });

  test('returns REVIEW for in_progress', () => {
    expect(getProcessStatus('in_progress', req, baseProfile)).toBe('REVIEW');
  });

  test('returns REVIEW for partial', () => {
    expect(getProcessStatus('partial', req, baseProfile)).toBe('REVIEW');
  });

  test('returns FAIL for no', () => {
    expect(getProcessStatus('no', req, baseProfile)).toBe('FAIL');
  });

  test('returns FAIL for null', () => {
    expect(getProcessStatus(null, req, baseProfile)).toBe('FAIL');
  });

  test('returns FAIL for undefined', () => {
    expect(getProcessStatus(undefined, req, baseProfile)).toBe('FAIL');
  });

  test('returns FAIL for unknown values', () => {
    expect(getProcessStatus('unknown_value', req, baseProfile)).toBe('FAIL');
  });
});

describe('getHumanOversightStatus', () => {
  test('returns CRITICAL_FAIL when q2 is no (override mechanism)', () => {
    const result = getHumanOversightStatus({ q1: 'yes', q2: 'no', q3: 'yes', q4: 'yes', q5: 'yes' });
    expect(result.status).toBe('CRITICAL_FAIL');
    expect(result.score).toBe(0);
    expect(result.message).toContain('Article 14');
  });

  test('returns PASS for all yes answers', () => {
    const result = getHumanOversightStatus({ q1: 'yes', q2: 'yes', q3: 'yes', q4: 'yes', q5: 'yes' });
    expect(result.status).toBe('PASS');
    expect(result.score).toBe(1);
    expect(result.message).toBeNull();
  });

  test('returns FAIL for mixed answers with mostly no', () => {
    const result = getHumanOversightStatus({ q1: 'yes', q2: 'yes', q3: 'partially', q4: 'no', q5: 'no' });
    // Weighted: (1*1 + 3*1 + 2*0.5 + 2*0 + 1*0) / 9 = 5/9 ≈ 0.556 < 0.60
    expect(result.status).toBe('FAIL');
    expect(result.score).toBeGreaterThan(0);
  });

  test('returns FAIL for mostly no answers', () => {
    const result = getHumanOversightStatus({ q1: 'no', q2: 'partially', q3: 'no', q4: 'no', q5: 'no' });
    expect(result.status).toBe('FAIL');
  });

  test('handles partially for q2', () => {
    const result = getHumanOversightStatus({ q1: 'yes', q2: 'partially', q3: 'yes', q4: 'yes', q5: 'yes' });
    // Weighted: (1*1 + 3*0.5 + 2*1 + 2*1 + 1*1) / 9 = 7.5/9 ≈ 0.833 >= 0.80
    expect(result.status).toBe('PASS');
  });
});

describe('deriveContextFlags', () => {
  test('flags SMALL_TEST_SET for test_set_size < 30', () => {
    const flags = deriveContextFlags({ test_set_size: 20 }, baseProfile);
    expect(flags).toContain('SMALL_TEST_SET');
  });

  test('does not flag SMALL_TEST_SET for test_set_size >= 30', () => {
    const flags = deriveContextFlags({ test_set_size: 100 }, baseProfile);
    expect(flags).not.toContain('SMALL_TEST_SET');
  });

  test('does not flag SMALL_TEST_SET for null test_set_size', () => {
    const flags = deriveContextFlags({ test_set_size: null }, baseProfile);
    expect(flags).not.toContain('SMALL_TEST_SET');
  });

  test('flags UNREPRESENTATIVE_TEST_SET for partial', () => {
    const flags = deriveContextFlags({ test_set_representative: 'partial' }, baseProfile);
    expect(flags).toContain('UNREPRESENTATIVE_TEST_SET');
  });

  test('flags UNREPRESENTATIVE_TEST_SET for no', () => {
    const flags = deriveContextFlags({ test_set_representative: 'no' }, baseProfile);
    expect(flags).toContain('UNREPRESENTATIVE_TEST_SET');
  });

  test('flags NO_PROD_MONITORING for post-deployment without monitoring', () => {
    const profile = { ...baseProfile, deployment_status: 'post-deployment' };
    const flags = deriveContextFlags({ drift_monitoring_active: false }, profile);
    expect(flags).toContain('NO_PROD_MONITORING');
  });

  test('flags NO_PROD_MONITORING for pilot without monitoring', () => {
    const profile = { ...baseProfile, deployment_status: 'pilot' };
    const flags = deriveContextFlags({ drift_monitoring_active: false }, profile);
    expect(flags).toContain('NO_PROD_MONITORING');
  });

  test('does not flag NO_PROD_MONITORING for pre-deployment', () => {
    const flags = deriveContextFlags({ drift_monitoring_active: false }, baseProfile);
    expect(flags).not.toContain('NO_PROD_MONITORING');
  });

  test('flags STALE_MODEL_24M for old retrain date', () => {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 3);
    const flags = deriveContextFlags({ last_retrain_date: twoYearsAgo.toISOString() }, baseProfile);
    expect(flags).toContain('STALE_MODEL_24M');
  });

  test('flags STALE_MODEL_12M for moderately old retrain date', () => {
    const eighteenMonthsAgo = new Date();
    eighteenMonthsAgo.setMonth(eighteenMonthsAgo.getMonth() - 18);
    const flags = deriveContextFlags({ last_retrain_date: eighteenMonthsAgo.toISOString() }, baseProfile);
    expect(flags).toContain('STALE_MODEL_12M');
  });

  test('flags NO_EXPLAINABILITY', () => {
    const flags = deriveContextFlags({ explainability_method: 'None' }, baseProfile);
    expect(flags).toContain('NO_EXPLAINABILITY');
  });

  test('flags MISSING_INSTRUCTIONS_HIGH_RISK', () => {
    const flags = deriveContextFlags({ instructions_for_use_documented: false }, baseProfile);
    expect(flags).toContain('MISSING_INSTRUCTIONS_HIGH_RISK');
  });

  test('does not flag MISSING_INSTRUCTIONS for limited risk', () => {
    const profile = { ...baseProfile, risk_category: 'limited' };
    const flags = deriveContextFlags({ instructions_for_use_documented: false }, profile);
    expect(flags).not.toContain('MISSING_INSTRUCTIONS_HIGH_RISK');
  });

  test('returns empty array for clean inputs', () => {
    const flags = deriveContextFlags({}, baseProfile);
    expect(flags).toEqual([]);
  });
});

describe('monthsSinceDate', () => {
  test('returns null for null input', () => {
    expect(monthsSinceDate(null)).toBeNull();
  });

  test('returns 0 for current date', () => {
    expect(monthsSinceDate(new Date().toISOString())).toBe(0);
  });

  test('returns positive number for past date', () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    expect(monthsSinceDate(sixMonthsAgo.toISOString())).toBe(6);
  });
});
