import { isMetricRequired } from './profile-filter';
import {
  OVERSIGHT_WEIGHTS,
  OVERSIGHT_PASS_THRESHOLD,
  OVERSIGHT_REVIEW_THRESHOLD,
  SMALL_TEST_SET_THRESHOLD,
  STALE_MODEL_24M_MONTHS,
  STALE_MODEL_12M_MONTHS,
} from './constants';

/**
 * Computes the status for a single numeric metric.
 *
 * Returns one of: 'CRITICAL_FAIL', 'FAIL', 'REVIEW', 'PASS',
 *                 'NOT_APPLICABLE', 'PROCESS_REQUIRED'
 *
 * @param {number|null} value - The user-provided metric value
 * @param {object} metric - Metric definition from knowledge-base.json
 * @param {string[]} contextFlags - Active context flags (e.g. SMALL_TEST_SET)
 * @param {object} profile - User profile
 */
export function getMetricStatus(value, metric, contextFlags, profile) {
  // Hard blockers first
  if (contextFlags.includes('CRITICAL_FAIL')) {
    return 'CRITICAL_FAIL';
  }

  // Not provided
  if (value === null || value === undefined || value === '') {
    if (isMetricRequired(metric.id, profile)) {
      return 'FAIL';
    }
    return 'NOT_APPLICABLE';
  }

  // Context flag overrides for accuracy section
  if (metric.section === 'accuracy_performance') {
    if (contextFlags.includes('SMALL_TEST_SET')) return 'REVIEW';
    if (contextFlags.includes('UNREPRESENTATIVE_TEST_SET')) return 'REVIEW';
  }

  // Context flag override for drift section
  if (metric.section === 'robustness_drift' &&
      (metric.id === 'data_drift_score' || metric.id === 'concept_drift_score')) {
    if (contextFlags.includes('NO_PROD_MONITORING')) return 'PROCESS_REQUIRED';
  }

  // Numeric threshold comparison
  const numValue = Math.abs(Number(value));
  if (metric.direction === 'higher_better') {
    if (numValue >= metric.pass_threshold) return 'PASS';
    if (numValue >= metric.review_threshold) return 'REVIEW';
    return 'FAIL';
  } else {
    // lower_better
    if (numValue <= metric.pass_threshold) return 'PASS';
    if (numValue <= metric.review_threshold) return 'REVIEW';
    return 'FAIL';
  }
}

/**
 * Computes the status for a process requirement (self-attested).
 *
 * @param {string} value - 'yes' | 'in_progress' | 'partial' | 'no' | 'not_applicable'
 * @param {object} processReq - Process requirement definition
 * @param {object} profile - User profile
 */
export function getProcessStatus(value, processReq, profile) {
  if (value === 'not_applicable') return 'NOT_APPLICABLE';
  if (value === 'yes') return 'PASS';
  if (value === 'in_progress' || value === 'partial') return 'REVIEW';
  if (value === 'no' || value === null || value === undefined) return 'FAIL';
  return 'FAIL';
}

/**
 * Computes the human oversight weighted score and status.
 *
 * Questions (weight, hard_blocker):
 *   1. Can operators understand outputs? (1x, no)
 *   2. Override or stop mechanism? (3x, YES)
 *   3. Operator training completed? (2x, no)
 *   4. Escalation procedures documented? (2x, no)
 *   5. System prevents automation bias? (1x, no)
 *
 * Answers: 'yes'=1, 'partially'=0.5, 'no'=0
 *
 * @param {object} answers - { q1, q2, q3, q4, q5 } each 'yes'|'partially'|'no'
 * @returns {{ status: string, score: number, message: string|null }}
 */
export function getHumanOversightStatus(answers) {
  const answerValue = (a) => {
    if (a === 'yes') return 1;
    if (a === 'partially') return 0.5;
    return 0;
  };

  // Hard blocker: question 2 (override mechanism)
  if (answers.q2 === 'no') {
    return {
      status: 'CRITICAL_FAIL',
      score: 0,
      message: 'EU AI Act Article 14: override mechanism is non-negotiable for high-risk systems. Deployment is not possible without this functionality.',
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
 * Derives context flags from the full set of user inputs.
 *
 * @param {object} inputs - All user inputs
 * @param {object} profile - User profile
 * @returns {string[]} Array of active context flag strings
 */
export function deriveContextFlags(inputs, profile) {
  const flags = [];

  // Small test set
  if (inputs.test_set_size !== null && inputs.test_set_size !== undefined) {
    if (Number(inputs.test_set_size) < SMALL_TEST_SET_THRESHOLD) {
      flags.push('SMALL_TEST_SET');
    }
  }

  // Unrepresentative test set
  if (inputs.test_set_representative === 'partial' ||
      inputs.test_set_representative === 'no') {
    flags.push('UNREPRESENTATIVE_TEST_SET');
  }

  // Post-deployment without monitoring
  if ((profile.deployment_status === 'post-deployment' || profile.deployment_status === 'pilot') &&
      inputs.drift_monitoring_active === false) {
    flags.push('NO_PROD_MONITORING');
  }

  // Stale retrain date overrides for drift metrics
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

  // Explainability method None
  if (inputs.explainability_method === 'None') {
    flags.push('NO_EXPLAINABILITY');
  }

  // Instructions for use missing for high-risk
  if (inputs.instructions_for_use_documented === false &&
      (profile.risk_category === 'high-risk')) {
    flags.push('MISSING_INSTRUCTIONS_HIGH_RISK');
  }

  return flags;
}

/**
 * Computes months since a given date string.
 */
export function monthsSinceDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date();
  return (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
}
