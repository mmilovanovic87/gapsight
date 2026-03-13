/**
 * Filters knowledge base items by user profile.
 *
 * @module profile-filter
 */

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
 */
function getMetricsForProfile(knowledgeBase, profile) {
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
};
