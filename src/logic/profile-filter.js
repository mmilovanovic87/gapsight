import knowledgeBase from '../data/knowledge-base.json';

/**
 * Checks whether a KB item (metric or process requirement) is required
 * for the given user profile.
 *
 * Profile shape: { role, gpai_flag, risk_category, deployment_status }
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
 * Returns metrics filtered by profile.
 */
export function getMetricsForProfile(profile) {
  return knowledgeBase.metrics.filter(m => isRequiredForProfile(m, profile));
}

/**
 * Returns process requirements filtered by profile.
 */
export function getProcessRequirementsForProfile(profile) {
  return knowledgeBase.process_requirements.filter(p => isRequiredForProfile(p, profile));
}

/**
 * Returns whether a specific metric ID is required for the given profile.
 */
export function isMetricRequired(metricId, profile) {
  const metric = knowledgeBase.metrics.find(m => m.id === metricId);
  if (!metric) return false;
  return isRequiredForProfile(metric, profile);
}

/**
 * Returns whether the GPAI section should be shown.
 */
export function showGpaiSection(profile) {
  return profile.gpai_flag === true;
}

/**
 * Returns the full filtered KB for a profile: metrics, process requirements,
 * and whether GPAI section is shown.
 */
export function getFilteredKB(profile) {
  return {
    metrics: getMetricsForProfile(profile),
    processRequirements: getProcessRequirementsForProfile(profile),
    showGpai: showGpaiSection(profile),
    annexIvElements: knowledgeBase.annex_iv_elements,
    gpaiCopyrightChecklist: knowledgeBase.gpai_copyright_checklist,
    crossMetricRules: knowledgeBase.cross_metric_rules,
    riskLevelCriteria: knowledgeBase.risk_level_criteria,
    complianceDeadlines: knowledgeBase.compliance_deadlines,
    kbVersion: knowledgeBase.kb_version,
    kbDate: knowledgeBase.kb_date,
  };
}

export { isRequiredForProfile };
