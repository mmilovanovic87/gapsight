/**
 * Calculates the overall risk level from metric results and cross-metric warnings.
 *
 * Risk level calibration (from ALGORITHM.md Step 6):
 *   CRITICAL: any CRITICAL_FAIL in required metrics
 *   HIGH: fail rate >= 30% OR >= 2 cross-metric CRITICAL warnings
 *   MEDIUM: fail rate < 30% AND review rate >= 20%
 *   LOW: all other cases
 *
 * @param {Array<{ status: string, required_for_profile: boolean }>} results
 *   Each result has a status string and whether it's required for the profile.
 * @param {Array<{ severity: string }>} crossMetricWarnings
 *   Warnings from cross-metric validation.
 * @returns {{ level: string, message: string, criteria: object }}
 */
export function getRiskLevel(results, crossMetricWarnings) {
  const required = results.filter(r => r.required_for_profile);
  const total = required.length;

  if (total === 0) {
    return {
      level: 'LOW',
      message: 'No required metrics for this profile. Periodic reassessment is recommended.',
      criteria: { total: 0, critical: 0, failed: 0, reviewed: 0, crossCritical: 0, failRate: 0, reviewRate: 0 },
    };
  }

  const critical = required.filter(r => r.status === 'CRITICAL_FAIL').length;
  const failed = required.filter(r => r.status === 'FAIL').length;
  const reviewed = required.filter(r => r.status === 'REVIEW').length;
  const crossCritical = crossMetricWarnings.filter(w => w.severity === 'CRITICAL').length;

  const failRate = failed / total;
  const reviewRate = reviewed / total;

  const criteria = { total, critical, failed, reviewed, crossCritical, failRate, reviewRate };

  // CRITICAL: any CRITICAL_FAIL
  if (critical >= 1) {
    return {
      level: 'CRITICAL',
      message: 'Deployment is not permitted until critical issues are resolved.',
      criteria,
    };
  }

  // HIGH: fail rate >= 30% OR >= 2 cross-metric CRITICAL
  if (failRate >= 0.30 || crossCritical >= 2) {
    return {
      level: 'HIGH',
      message: 'Significant gaps identified. Address before deployment. Consult a qualified legal professional.',
      criteria,
    };
  }

  // MEDIUM: review rate >= 20%
  if (reviewRate >= 0.20) {
    return {
      level: 'MEDIUM',
      message: 'Some areas require attention. A review with a qualified professional is recommended.',
      criteria,
    };
  }

  // LOW: everything else
  return {
    level: 'LOW',
    message: 'Profile shows a good baseline. Periodic reassessment is recommended.',
    criteria,
  };
}

/**
 * Counts statuses grouped by framework for the summary panel.
 *
 * @param {Array<{ status: string, framework_mappings: Array<{ framework: string }> }>} results
 * @returns {object} e.g. { eu_ai_act: { pass: 3, review: 1, fail: 0, critical: 0, total: 4 }, ... }
 */
export function getFrameworkSummary(results) {
  const frameworks = ['eu_ai_act', 'nist_ai_rmf', 'iso_42001'];
  const summary = {};

  for (const fw of frameworks) {
    summary[fw] = { pass: 0, review: 0, fail: 0, critical: 0, total: 0 };
  }

  for (const result of results) {
    if (!result.framework_mappings) continue;

    const mappedFrameworks = new Set(result.framework_mappings.map(m => m.framework));

    for (const fw of frameworks) {
      if (!mappedFrameworks.has(fw)) continue;
      summary[fw].total++;

      switch (result.status) {
        case 'PASS':
          summary[fw].pass++;
          break;
        case 'REVIEW':
        case 'PROCESS_REQUIRED':
          summary[fw].review++;
          break;
        case 'CRITICAL_FAIL':
          summary[fw].critical++;
          break;
        case 'FAIL':
          summary[fw].fail++;
          break;
        default:
          break;
      }
    }
  }

  return summary;
}
