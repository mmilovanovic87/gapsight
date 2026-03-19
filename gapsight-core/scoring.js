/**
 * Metric and process requirement scoring logic.
 *
 * Computes statuses for individual metrics, process requirements,
 * and human oversight questions.
 *
 * @module scoring
 */

const {
  OVERSIGHT_WEIGHTS,
  OVERSIGHT_PASS_THRESHOLD,
  OVERSIGHT_REVIEW_THRESHOLD,
  SMALL_TEST_SET_THRESHOLD,
  STALE_MODEL_24M_MONTHS,
  STALE_MODEL_12M_MONTHS,
} = require('./constants');

/**
 * Computes the status for a single numeric metric.
 *
 * @param {number|null} value - The user-provided metric value
 * @param {object} metric - Metric definition from knowledge-base.json
 * @param {string[]} contextFlags - Active context flags (e.g. SMALL_TEST_SET)
 * @param {object} profile - User profile
 * @param {function} isMetricRequiredFn - Function to check if metric is required
 * @returns {'CRITICAL_FAIL'|'FAIL'|'REVIEW'|'PASS'|'NOT_APPLICABLE'|'PROCESS_REQUIRED'}
 *
 * @example
 * const status = getMetricStatus(0.91, { pass_threshold: 0.80, review_threshold: 0.60, direction: 'higher_better' }, [], profile, isReqFn);
 * // => 'PASS'
 */
function getMetricStatus(value, metric, contextFlags, profile, isMetricRequiredFn) {
  // User explicitly marked this metric as not applicable to their system.
  // Treated as NOT_APPLICABLE regardless of whether the metric is required,
  // and excluded from risk scoring calculations.
  if (value === 'not_applicable') {
    return 'NOT_APPLICABLE';
  }

  if (contextFlags.includes('CRITICAL_FAIL')) {
    return 'CRITICAL_FAIL';
  }

  if (value === null || value === undefined || value === '') {
    if (isMetricRequiredFn(metric.id, profile)) {
      return 'FAIL';
    }
    return 'NOT_APPLICABLE';
  }

  if (metric.section === 'accuracy_performance') {
    if (contextFlags.includes('SMALL_TEST_SET')) return 'REVIEW';
    if (contextFlags.includes('UNREPRESENTATIVE_TEST_SET')) return 'REVIEW';
  }

  if (metric.section === 'robustness_drift' &&
      (metric.id === 'data_drift_score' || metric.id === 'concept_drift_score')) {
    if (contextFlags.includes('NO_PROD_MONITORING')) return 'PROCESS_REQUIRED';
  }

  const numValue = Math.abs(Number(value));
  if (metric.direction === 'higher_better') {
    if (numValue >= metric.pass_threshold) return 'PASS';
    if (numValue >= metric.review_threshold) return 'REVIEW';
    return 'FAIL';
  } else {
    if (numValue <= metric.pass_threshold) return 'PASS';
    if (numValue <= metric.review_threshold) return 'REVIEW';
    return 'FAIL';
  }
}

/**
 * Computes the status for a process requirement.
 *
 * @param {string} value - 'yes'|'in_progress'|'partial'|'no'|'not_applicable'
 * @param {object} processReq - Process requirement definition
 * @param {object} profile - User profile
 * @returns {'PASS'|'REVIEW'|'FAIL'|'NOT_APPLICABLE'}
 *
 * @example
 * getProcessStatus('yes', reqDef, profile);  // => 'PASS'
 * getProcessStatus('in_progress', reqDef, profile);  // => 'REVIEW'
 */
function getProcessStatus(value, processReq, profile) {
  if (value === 'not_applicable') return 'NOT_APPLICABLE';
  if (value === 'yes') return 'PASS';
  if (value === 'in_progress' || value === 'partial') return 'REVIEW';
  return 'FAIL';
}

/**
 * Computes the human oversight weighted score and status.
 *
 * @param {object} answers - { q1, q2, q3, q4, q5 } each 'yes'|'partially'|'no'
 * @returns {{ status: string, score: number, message: string|null }}
 *
 * @example
 * const result = getHumanOversightStatus({ q1: 'yes', q2: 'yes', q3: 'partially', q4: 'yes', q5: 'no' });
 * // => { status: 'REVIEW', score: 0.722, message: null }
 */
function getHumanOversightStatus(answers) {
  const answerValue = (a) => {
    if (a === 'yes') return 1;
    if (a === 'partially') return 0.5;
    return 0;
  };

  if (answers.q2 === 'no') {
    return {
      status: 'CRITICAL_FAIL',
      score: 0,
      message: 'EU AI Act Article 14: override mechanism is non-negotiable for high-risk systems.',
    };
  }

  const weights = OVERSIGHT_WEIGHTS;
  const values = [
    answerValue(answers.q1),
    answerValue(answers.q2),
    answerValue(answers.q3),
    answerValue(answers.q4),
    answerValue(answers.q5),
  ];

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const weightedScore = values.reduce((sum, v, i) => sum + v * weights[i], 0) / totalWeight;

  let status;
  if (weightedScore >= OVERSIGHT_PASS_THRESHOLD) status = 'PASS';
  else if (weightedScore >= OVERSIGHT_REVIEW_THRESHOLD) status = 'REVIEW';
  else status = 'FAIL';

  return { status, score: weightedScore, message: null };
}

/**
 * Derives context flags from user inputs and profile.
 *
 * @param {object} inputs - All user inputs
 * @param {object} profile - User profile
 * @returns {string[]} Array of active context flag strings
 *
 * @example
 * deriveContextFlags({ test_set_size: 20 }, profile);  // => ['SMALL_TEST_SET']
 */
function deriveContextFlags(inputs, profile) {
  const flags = [];

  if (inputs.test_set_size !== null && inputs.test_set_size !== undefined) {
    if (Number(inputs.test_set_size) < SMALL_TEST_SET_THRESHOLD) {
      flags.push('SMALL_TEST_SET');
    }
  }

  if (inputs.test_set_representative === 'partial' ||
      inputs.test_set_representative === 'no') {
    flags.push('UNREPRESENTATIVE_TEST_SET');
  }

  if ((profile.deployment_status === 'post-deployment' || profile.deployment_status === 'pilot') &&
      inputs.drift_monitoring_active === false) {
    flags.push('NO_PROD_MONITORING');
  }

  if (inputs.last_retrain_date) {
    const retrainDate = new Date(inputs.last_retrain_date);
    const now = new Date();
    const monthsSince = (now.getFullYear() - retrainDate.getFullYear()) * 12 +
      (now.getMonth() - retrainDate.getMonth());

    if (monthsSince >= STALE_MODEL_24M_MONTHS) {
      flags.push('STALE_MODEL_24M');
    } else if (monthsSince >= STALE_MODEL_12M_MONTHS) {
      flags.push('STALE_MODEL_12M');
    }
  }

  if (inputs.explainability_method === 'None') {
    flags.push('NO_EXPLAINABILITY');
  }

  if (inputs.instructions_for_use_documented === false &&
      (profile.risk_category === 'high-risk')) {
    flags.push('MISSING_INSTRUCTIONS_HIGH_RISK');
  }

  return flags;
}

/**
 * Computes months since a given date string.
 *
 * @param {string|null} dateStr - ISO date string
 * @returns {number|null} Months elapsed or null if no date
 */
function monthsSinceDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date();
  return (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
}

module.exports = {
  getMetricStatus,
  getProcessStatus,
  getHumanOversightStatus,
  deriveContextFlags,
  monthsSinceDate,
};
