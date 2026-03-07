import { monthsSinceDate } from './scoring';

/**
 * Evaluates all 7 cross-metric validation rules against user inputs and profile.
 *
 * @param {object} inputs - All user-provided values (flat object)
 * @param {object} profile - { role, gpai_flag, risk_category, deployment_status }
 * @param {number|null} humanOversightScore - Weighted score from human oversight section
 * @returns {Array<{ id: string, severity: string, message: string }>}
 */
export function evaluateCrossMetricRules(inputs, profile, humanOversightScore) {
  const warnings = [];
  const hasEuAiAct = profile.frameworks_selected?.includes('eu_ai_act') ?? true;
  const hasNist = profile.frameworks_selected?.includes('nist_ai_rmf') ?? true;

  // RULE 1 - Accuracy-Fairness Tradeoff
  if (toNum(inputs.overall_accuracy) >= 0.90 &&
      toNum(inputs.demographic_parity_diff) >= 0.15) {
    const refs = [];
    if (hasEuAiAct) refs.push('EU AI Act Article 10');
    if (hasNist) refs.push('NIST MEASURE 2.11');
    const refText = refs.length > 0 ? ` ${refs.join(' and ')} require` : ' Best practices require';
    warnings.push({
      id: 'accuracy_fairness_tradeoff',
      severity: 'WARNING',
      message: `High accuracy with significant fairness gap detected.${refText} explicit analysis and documentation of this tradeoff.`,
    });
  }

  // RULE 2 - Robustness Without Monitoring
  if (toNum(inputs.adversarial_robustness_score) >= 0.80 &&
      inputs.drift_monitoring_active === false) {
    warnings.push({
      id: 'robustness_without_monitoring',
      severity: 'WARNING',
      message: 'Robustness measured during development does not guarantee runtime robustness without active production monitoring.',
    });
  }

  // RULE 3 - High Drift Without Retraining
  const monthsSinceRetrain = monthsSinceDate(inputs.last_retrain_date);
  if (toNum(inputs.data_drift_score) >= 0.20 &&
      monthsSinceRetrain !== null && monthsSinceRetrain >= 12) {
    warnings.push({
      id: 'high_drift_without_retraining',
      severity: 'CRITICAL',
      message: 'High drift score combined with stale model requires immediate retraining plan.',
    });
  }

  // RULE 4 - Fairness Without Mitigation
  if (toNum(inputs.equalized_odds_diff) >= 0.10 &&
      inputs.bias_mitigation_applied === false) {
    warnings.push({
      id: 'fairness_without_mitigation',
      severity: 'CRITICAL',
      message: hasEuAiAct
        ? 'Bias detected without applied mitigation. Direct EU AI Act Article 10 violation.'
        : 'Bias detected without applied mitigation. Immediate remediation required.',
    });
  }

  // RULE 5 - Explainability-Oversight Gap
  if (inputs.explainability_method === 'None' &&
      humanOversightScore !== null && humanOversightScore < 0.80) {
    warnings.push({
      id: 'explainability_oversight_gap',
      severity: 'WARNING',
      message: 'Absence of explainability combined with weak human oversight increases automation bias risk.',
    });
  }

  // RULE 6 - GPAI Systemic Risk Notification (EU AI Act only)
  if (hasEuAiAct &&
      profile.gpai_flag === true &&
      toNum(inputs.training_flops) >= 1e25 &&
      inputs.systemic_risk_notification_sent === 'no') {
    warnings.push({
      id: 'gpai_systemic_risk_notification',
      severity: 'CRITICAL',
      message: 'GPAI systemic risk threshold exceeded. Notification to EU AI Office is mandatory immediately.',
    });
  }

  // RULE 7 - High-Risk Post-Deployment Without Logging
  if (profile.risk_category === 'high-risk' &&
      profile.deployment_status === 'post-deployment' &&
      inputs.automated_logging === 'no') {
    warnings.push({
      id: 'high_risk_post_deploy_no_logging',
      severity: 'CRITICAL',
      message: hasEuAiAct
        ? 'EU AI Act Article 12 requires automated logging for high-risk systems in production.'
        : 'Automated logging is required for high-risk systems in production.',
    });
  }

  return warnings;
}

/**
 * Groups warnings by severity for display.
 */
export function groupWarningsBySeverity(warnings) {
  return {
    CRITICAL: warnings.filter(w => w.severity === 'CRITICAL'),
    WARNING: warnings.filter(w => w.severity === 'WARNING'),
    INFO: warnings.filter(w => w.severity === 'INFO'),
  };
}

function toNum(val) {
  if (val === null || val === undefined || val === '') return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}
