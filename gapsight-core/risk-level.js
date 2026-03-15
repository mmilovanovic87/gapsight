/**
 * Risk level calculation from assessment results.
 *
 * @module risk-level
 */

const {
  RISK_FAIL_RATE_THRESHOLD,
  RISK_REVIEW_RATE_THRESHOLD,
  RISK_CROSS_CRITICAL_THRESHOLD,
  FRAMEWORK_NAMES,
} = require('./constants');

/** All known framework IDs, derived from FRAMEWORK_NAMES to avoid hardcoding. */
const ALL_FRAMEWORK_IDS = Object.keys(FRAMEWORK_NAMES);

/**
 * Calculates the overall risk level from scored results and cross-metric warnings.
 *
 * @param {Array<{ status: string, required_for_profile: boolean }>} results - Scored results
 * @param {Array<{ severity: string }>} crossMetricWarnings - Cross-metric warnings
 * @returns {{ level: string, message: string, criteria: object }}
 *
 * @example
 * const risk = getRiskLevel(allResults, warnings);
 * // { level: 'HIGH', message: '...', criteria: { total: 10, critical: 0, ... } }
 */
function getRiskLevel(results, crossMetricWarnings) {
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

  if (critical >= 1) {
    return { level: 'CRITICAL', message: 'Deployment is not permitted until critical issues are resolved.', criteria };
  }

  if (failRate >= RISK_FAIL_RATE_THRESHOLD || crossCritical >= RISK_CROSS_CRITICAL_THRESHOLD) {
    return { level: 'HIGH', message: 'Significant gaps identified. Address before deployment.', criteria };
  }

  if (reviewRate >= RISK_REVIEW_RATE_THRESHOLD) {
    return { level: 'MEDIUM', message: 'Some areas require attention. Review recommended.', criteria };
  }

  return { level: 'LOW', message: 'Profile shows a good baseline. Periodic reassessment is recommended.', criteria };
}

/**
 * Counts statuses grouped by framework for the summary panel.
 *
 * @param {Array<{ status: string, framework_mappings: Array<{ framework: string }> }>} results
 * @param {string[]} [selectedFrameworks] - Frameworks to include
 * @returns {object} Framework summary counts
 *
 * @example
 * const summary = getFrameworkSummary(allResults, ['eu_ai_act']);
 * // { eu_ai_act: { pass: 3, review: 1, fail: 0, critical: 0, total: 4 } }
 */
function getFrameworkSummary(results, selectedFrameworks) {
  const frameworks = selectedFrameworks && selectedFrameworks.length > 0
    ? selectedFrameworks
    : ALL_FRAMEWORK_IDS;
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
        case 'PASS': summary[fw].pass++; break;
        case 'REVIEW':
        case 'PROCESS_REQUIRED': summary[fw].review++; break;
        case 'CRITICAL_FAIL': summary[fw].critical++; break;
        case 'FAIL': summary[fw].fail++; break;
        default: break;
      }
    }
  }

  return summary;
}

module.exports = { getRiskLevel, getFrameworkSummary };
