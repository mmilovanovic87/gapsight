/**
 * Filters knowledge base items by user profile.
 *
 * @module profile-filter
 */

const {
  VALID_ROLES,
  VALID_RISK_CATEGORIES,
  VALID_DEPLOYMENT_STATUSES,
} = require('./constants');

/**
 * Logs a warning if a profile field has an unrecognized value.
 *
 * Design decision: unknown enum values are treated as non-matching rather than
 * throwing an error. This ensures forward compatibility — if a new role or risk
 * category is added to the knowledge base before constants are updated, the
 * engine degrades gracefully (fewer matches) instead of crashing. The console
 * warning alerts integrators to the mismatch so they can update their profile.
 *
 * @param {object} profile - User profile to validate
 */
function warnOnUnknownProfileValues(profile) {
  if (profile.role && !VALID_ROLES.includes(profile.role)) {
    console.warn(`[gapsight-core] Unknown profile.role: "${profile.role}". Known values: ${VALID_ROLES.join(', ')}`);
  }
  if (profile.risk_category && !VALID_RISK_CATEGORIES.includes(profile.risk_category)) {
    console.warn(`[gapsight-core] Unknown profile.risk_category: "${profile.risk_category}". Known values: ${VALID_RISK_CATEGORIES.join(', ')}`);
  }
  if (profile.deployment_status && !VALID_DEPLOYMENT_STATUSES.includes(profile.deployment_status)) {
    console.warn(`[gapsight-core] Unknown profile.deployment_status: "${profile.deployment_status}". Known values: ${VALID_DEPLOYMENT_STATUSES.join(', ')}`);
  }
}

/**
 * Checks whether a KB item is required for the given user profile.
 *
 * @param {object} item - KB metric or process requirement with required_for_profiles
 * @param {object} profile - { role, gpai_flag, risk_category, deployment_status }
 * @returns {boolean} True if the item applies to this profile
 */
function isRequiredForProfile(item, profile) {
  const req = item.required_for_profiles;
  if (!req) return true;

  const roleMatch = req.roles.includes(profile.role) || req.roles.includes('both');
  const riskMatch = req.risk_categories.includes(profile.risk_category) ||
    (profile.gpai_flag && req.risk_categories.includes('gpai'));
  const deployMatch = req.deployment_statuses.includes(profile.deployment_status);

  return roleMatch && riskMatch && deployMatch;
}

/**
 * Returns metrics from the knowledge base filtered by profile.
 *
 * @param {object} knowledgeBase - The full knowledge base object
 * @param {object} profile - User profile
 * @returns {object[]} Filtered metrics array
 *
 * @example
 * const metrics = getMetricsForProfile(kb, { role: 'provider', risk_category: 'high-risk', deployment_status: 'pre-deployment' });
 */
function getMetricsForProfile(knowledgeBase, profile) {
  warnOnUnknownProfileValues(profile);
  return knowledgeBase.metrics.filter(m => isRequiredForProfile(m, profile));
}

/**
 * Returns process requirements from the knowledge base filtered by profile.
 *
 * @param {object} knowledgeBase - The full knowledge base object
 * @param {object} profile - User profile
 * @returns {object[]} Filtered process requirements array
 */
function getProcessRequirementsForProfile(knowledgeBase, profile) {
  return knowledgeBase.process_requirements.filter(p => isRequiredForProfile(p, profile));
}

/**
 * Checks whether a specific metric ID is required for the given profile.
 *
 * @param {object} knowledgeBase - The full knowledge base object
 * @param {string} metricId - Metric identifier
 * @param {object} profile - User profile
 * @returns {boolean}
 */
function isMetricRequired(knowledgeBase, metricId, profile) {
  const metric = knowledgeBase.metrics.find(m => m.id === metricId);
  if (!metric) return false;
  return isRequiredForProfile(metric, profile);
}

module.exports = {
  isRequiredForProfile,
  getMetricsForProfile,
  getProcessRequirementsForProfile,
  isMetricRequired,
  warnOnUnknownProfileValues,
};
