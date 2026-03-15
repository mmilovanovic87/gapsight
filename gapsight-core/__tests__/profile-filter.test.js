const { isRequiredForProfile, getMetricsForProfile, getProcessRequirementsForProfile, isMetricRequired, warnOnUnknownProfileValues } = require('../profile-filter');

const mockKB = {
  metrics: [
    {
      id: 'overall_accuracy',
      label: 'Overall Accuracy',
      required_for_profiles: {
        roles: ['provider', 'both'],
        risk_categories: ['high-risk', 'limited'],
        deployment_statuses: ['pre-deployment', 'post-deployment', 'pilot'],
      },
    },
    {
      id: 'gpai_metric',
      label: 'GPAI Metric',
      required_for_profiles: {
        roles: ['provider'],
        risk_categories: ['gpai'],
        deployment_statuses: ['pre-deployment'],
      },
    },
    {
      id: 'universal_metric',
      label: 'Universal Metric',
    },
  ],
  process_requirements: [
    {
      id: 'risk_management',
      label: 'Risk Management',
      required_for_profiles: {
        roles: ['provider'],
        risk_categories: ['high-risk'],
        deployment_statuses: ['pre-deployment', 'post-deployment'],
      },
    },
  ],
};

describe('isRequiredForProfile', () => {
  test('returns true when profile matches all criteria', () => {
    const profile = { role: 'provider', risk_category: 'high-risk', deployment_status: 'pre-deployment', gpai_flag: false };
    expect(isRequiredForProfile(mockKB.metrics[0], profile)).toBe(true);
  });

  test('returns true when role matches via both', () => {
    // mockKB.metrics[0] has roles: ['provider', 'both'], so deployer matches via 'both'
    const profile = { role: 'deployer', risk_category: 'high-risk', deployment_status: 'pre-deployment', gpai_flag: false };
    expect(isRequiredForProfile(mockKB.metrics[0], profile)).toBe(true);
  });

  test('returns false when role does not match and no both', () => {
    // mockKB.metrics[1] has roles: ['provider'] only
    const profile = { role: 'deployer', risk_category: 'high-risk', deployment_status: 'pre-deployment', gpai_flag: false };
    expect(isRequiredForProfile(mockKB.metrics[1], profile)).toBe(false);
  });

  test('returns true when role is both', () => {
    const item = { required_for_profiles: { roles: ['both'], risk_categories: ['high-risk'], deployment_statuses: ['pre-deployment'] } };
    const profile = { role: 'deployer', risk_category: 'high-risk', deployment_status: 'pre-deployment', gpai_flag: false };
    expect(isRequiredForProfile(item, profile)).toBe(true);
  });

  test('returns true for GPAI-flagged profile matching gpai risk category', () => {
    const profile = { role: 'provider', risk_category: 'limited', deployment_status: 'pre-deployment', gpai_flag: true };
    expect(isRequiredForProfile(mockKB.metrics[1], profile)).toBe(true);
  });

  test('returns true when no required_for_profiles defined', () => {
    const profile = { role: 'deployer', risk_category: 'limited', deployment_status: 'pilot', gpai_flag: false };
    expect(isRequiredForProfile(mockKB.metrics[2], profile)).toBe(true);
  });

  test('returns false when deployment status does not match', () => {
    const profile = { role: 'provider', risk_category: 'high-risk', deployment_status: 'pilot', gpai_flag: false };
    expect(isRequiredForProfile(mockKB.process_requirements[0], profile)).toBe(false);
  });
});

describe('getMetricsForProfile', () => {
  test('returns filtered metrics for provider high-risk', () => {
    const profile = { role: 'provider', risk_category: 'high-risk', deployment_status: 'pre-deployment', gpai_flag: false };
    const result = getMetricsForProfile(mockKB, profile);
    expect(result.map(m => m.id)).toContain('overall_accuracy');
    expect(result.map(m => m.id)).toContain('universal_metric');
    expect(result.map(m => m.id)).not.toContain('gpai_metric');
  });

  test('includes GPAI metrics for GPAI-flagged profile', () => {
    const profile = { role: 'provider', risk_category: 'limited', deployment_status: 'pre-deployment', gpai_flag: true };
    const result = getMetricsForProfile(mockKB, profile);
    expect(result.map(m => m.id)).toContain('gpai_metric');
  });
});

describe('getProcessRequirementsForProfile', () => {
  test('returns matching process requirements', () => {
    const profile = { role: 'provider', risk_category: 'high-risk', deployment_status: 'pre-deployment', gpai_flag: false };
    const result = getProcessRequirementsForProfile(mockKB, profile);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('risk_management');
  });

  test('returns empty array for non-matching profile', () => {
    const profile = { role: 'deployer', risk_category: 'limited', deployment_status: 'pilot', gpai_flag: false };
    const result = getProcessRequirementsForProfile(mockKB, profile);
    expect(result).toHaveLength(0);
  });
});

describe('isMetricRequired', () => {
  test('returns true for required metric', () => {
    const profile = { role: 'provider', risk_category: 'high-risk', deployment_status: 'pre-deployment', gpai_flag: false };
    expect(isMetricRequired(mockKB, 'overall_accuracy', profile)).toBe(true);
  });

  test('returns false for non-existent metric', () => {
    const profile = { role: 'provider', risk_category: 'high-risk', deployment_status: 'pre-deployment', gpai_flag: false };
    expect(isMetricRequired(mockKB, 'nonexistent', profile)).toBe(false);
  });
});

describe('warnOnUnknownProfileValues', () => {
  let warnSpy;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  test('does not warn for valid profile values', () => {
    warnOnUnknownProfileValues({ role: 'provider', risk_category: 'high-risk', deployment_status: 'pre-deployment' });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  test('warns for unknown role', () => {
    warnOnUnknownProfileValues({ role: 'admin', risk_category: 'high-risk', deployment_status: 'pre-deployment' });
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown profile.role: "admin"'));
  });

  test('warns for unknown risk_category', () => {
    warnOnUnknownProfileValues({ role: 'provider', risk_category: 'extreme', deployment_status: 'pre-deployment' });
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown profile.risk_category: "extreme"'));
  });

  test('warns for unknown deployment_status', () => {
    warnOnUnknownProfileValues({ role: 'provider', risk_category: 'high-risk', deployment_status: 'retired' });
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown profile.deployment_status: "retired"'));
  });

  test('does not warn when fields are missing (undefined)', () => {
    warnOnUnknownProfileValues({});
    expect(warnSpy).not.toHaveBeenCalled();
  });

  test('unknown values are treated as non-matching in filtering', () => {
    const profile = { role: 'admin', risk_category: 'extreme', deployment_status: 'retired', gpai_flag: false };
    const result = getMetricsForProfile(mockKB, profile);
    // Only universal_metric (no required_for_profiles) should match
    expect(result.map(m => m.id)).toEqual(['universal_metric']);
    expect(warnSpy).toHaveBeenCalled();
  });
});
