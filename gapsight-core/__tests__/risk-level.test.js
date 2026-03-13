const { getRiskLevel, getFrameworkSummary } = require('../risk-level');

describe('getRiskLevel', () => {
  test('returns LOW when no required results', () => {
    const result = getRiskLevel([], []);
    expect(result.level).toBe('LOW');
    expect(result.criteria.total).toBe(0);
  });

  test('returns CRITICAL when any CRITICAL_FAIL exists', () => {
    const results = [
      { status: 'PASS', required_for_profile: true },
      { status: 'CRITICAL_FAIL', required_for_profile: true },
    ];
    const result = getRiskLevel(results, []);
    expect(result.level).toBe('CRITICAL');
  });

  test('returns HIGH when fail rate >= 30%', () => {
    const results = Array(10).fill(null).map((_, i) => ({
      status: i < 3 ? 'FAIL' : 'PASS',
      required_for_profile: true,
    }));
    const result = getRiskLevel(results, []);
    expect(result.level).toBe('HIGH');
  });

  test('returns HIGH when >= 2 cross-metric CRITICAL warnings', () => {
    const results = [{ status: 'PASS', required_for_profile: true }];
    const warnings = [{ severity: 'CRITICAL' }, { severity: 'CRITICAL' }];
    const result = getRiskLevel(results, warnings);
    expect(result.level).toBe('HIGH');
  });

  test('returns MEDIUM when review rate >= 20%', () => {
    const results = Array(10).fill(null).map((_, i) => ({
      status: i < 2 ? 'REVIEW' : 'PASS',
      required_for_profile: true,
    }));
    const result = getRiskLevel(results, []);
    expect(result.level).toBe('MEDIUM');
  });

  test('returns LOW when everything passes', () => {
    const results = Array(10).fill(null).map(() => ({
      status: 'PASS',
      required_for_profile: true,
    }));
    const result = getRiskLevel(results, []);
    expect(result.level).toBe('LOW');
  });

  test('ignores non-required results', () => {
    const results = [
      { status: 'CRITICAL_FAIL', required_for_profile: false },
      { status: 'PASS', required_for_profile: true },
    ];
    const result = getRiskLevel(results, []);
    expect(result.level).toBe('LOW');
  });

  test('criteria object includes all fields', () => {
    const results = [
      { status: 'PASS', required_for_profile: true },
      { status: 'FAIL', required_for_profile: true },
      { status: 'REVIEW', required_for_profile: true },
    ];
    const result = getRiskLevel(results, [{ severity: 'CRITICAL' }]);
    expect(result.criteria).toEqual({
      total: 3,
      critical: 0,
      failed: 1,
      reviewed: 1,
      crossCritical: 1,
      failRate: 1 / 3,
      reviewRate: 1 / 3,
    });
  });
});

describe('getFrameworkSummary', () => {
  test('counts statuses by framework', () => {
    const results = [
      { status: 'PASS', framework_mappings: [{ framework: 'eu_ai_act' }] },
      { status: 'FAIL', framework_mappings: [{ framework: 'eu_ai_act' }] },
      { status: 'REVIEW', framework_mappings: [{ framework: 'nist_ai_rmf' }] },
      { status: 'CRITICAL_FAIL', framework_mappings: [{ framework: 'eu_ai_act' }] },
      { status: 'PROCESS_REQUIRED', framework_mappings: [{ framework: 'eu_ai_act' }] },
      { status: 'NOT_APPLICABLE', framework_mappings: [{ framework: 'eu_ai_act' }] },
    ];
    const summary = getFrameworkSummary(results, ['eu_ai_act', 'nist_ai_rmf']);
    expect(summary.eu_ai_act.pass).toBe(1);
    expect(summary.eu_ai_act.fail).toBe(1);
    expect(summary.eu_ai_act.critical).toBe(1);
    expect(summary.eu_ai_act.review).toBe(1);
    // NOT_APPLICABLE still increments total (it has a framework mapping)
    expect(summary.eu_ai_act.total).toBe(5);
    expect(summary.nist_ai_rmf.review).toBe(1);
  });

  test('uses all frameworks when none selected', () => {
    const results = [
      { status: 'PASS', framework_mappings: [{ framework: 'iso_42001' }] },
    ];
    const summary = getFrameworkSummary(results, null);
    expect(summary.iso_42001).toBeDefined();
    expect(summary.eu_ai_act).toBeDefined();
  });

  test('skips results without framework_mappings', () => {
    const results = [
      { status: 'PASS' },
      { status: 'PASS', framework_mappings: [{ framework: 'eu_ai_act' }] },
    ];
    const summary = getFrameworkSummary(results, ['eu_ai_act']);
    expect(summary.eu_ai_act.total).toBe(1);
  });

  test('handles empty results', () => {
    const summary = getFrameworkSummary([], ['eu_ai_act']);
    expect(summary.eu_ai_act).toEqual({ pass: 0, review: 0, fail: 0, critical: 0, total: 0 });
  });
});
