import knowledgeBase from '../data/knowledge-base.json';

/**
 * Generates action items grouped by urgency from assessment results.
 *
 * Urgency groups:
 *   CRITICAL — before deployment / immediately
 *   HIGH — within 30 days
 *   MEDIUM — within 90 days
 *   ONGOING — monitoring and maintenance
 */
export function generateActionItems(allResults, crossMetricWarnings, profile, inputs, contextFlags) {
  const items = { CRITICAL: [], HIGH: [], MEDIUM: [], ONGOING: [] };

  // From metric/process results
  for (const result of allResults) {
    if (result.status === 'CRITICAL_FAIL') {
      items.CRITICAL.push({
        id: `${result.id}_critical`,
        metric: result.id,
        label: result.label,
        action: getActionText(result),
        frameworks: formatFrameworks(result.framework_mappings),
        message: result.message || null,
      });
    } else if (result.status === 'FAIL') {
      items.HIGH.push({
        id: `${result.id}_fail`,
        metric: result.id,
        label: result.label,
        action: getActionText(result),
        frameworks: formatFrameworks(result.framework_mappings),
      });
    } else if (result.status === 'REVIEW' || result.status === 'PROCESS_REQUIRED') {
      items.MEDIUM.push({
        id: `${result.id}_review`,
        metric: result.id,
        label: result.label,
        action: getReviewActionText(result),
        frameworks: formatFrameworks(result.framework_mappings),
        completion_date: result.completion_date || null,
      });
    }
  }

  // From cross-metric warnings
  for (const warning of crossMetricWarnings) {
    if (warning.severity === 'CRITICAL') {
      items.CRITICAL.push({
        id: `cross_${warning.id}`,
        metric: warning.id,
        label: 'Cross-metric validation',
        action: warning.message,
        frameworks: [],
      });
    }
  }

  // Context-flag-based items
  if (contextFlags.includes('NO_PROD_MONITORING')) {
    items.CRITICAL.push({
      id: 'ctx_no_prod_monitoring',
      metric: 'drift_monitoring',
      label: 'Production Monitoring',
      action: 'Post-deployment system without active drift monitoring. Implement monitoring before continuing production use.',
      frameworks: ['EU AI Act Article 15', 'NIST MEASURE 3.1'],
    });
  }

  if (contextFlags.includes('MISSING_INSTRUCTIONS_HIGH_RISK')) {
    items.CRITICAL.push({
      id: 'ctx_missing_instructions',
      metric: 'instructions_for_use',
      label: 'Instructions for Use',
      action: 'Instructions for use documentation is required before deployment for high-risk systems.',
      frameworks: ['EU AI Act Article 13'],
    });
  }

  // Annex IV unchecked items
  if (inputs.governance?.technical_documentation?.status === 'partial') {
    const annexChecks = inputs.annex_iv_checklist || {};
    for (const element of knowledgeBase.annex_iv_elements) {
      if (!annexChecks[element.id]) {
        items.MEDIUM.push({
          id: `annex_iv_${element.id}`,
          metric: 'technical_documentation',
          label: `Annex IV: ${element.label}`,
          action: `Document: ${element.label}`,
          frameworks: ['EU AI Act Annex IV'],
        });
      }
    }
  }

  // Ongoing items for post-deployment
  if (profile.deployment_status === 'post-deployment' || profile.deployment_status === 'pilot') {
    items.ONGOING.push({
      id: 'ongoing_monitoring',
      metric: 'monitoring',
      label: 'Continuous Monitoring',
      action: 'Maintain active monitoring for data drift, concept drift, and model performance degradation.',
      frameworks: ['EU AI Act Article 15', 'NIST MEASURE 3.1'],
    });
    items.ONGOING.push({
      id: 'ongoing_reassessment',
      metric: 'reassessment',
      label: 'Periodic Reassessment',
      action: 'Re-run this self-assessment at regular intervals, especially after model retraining or KB updates.',
      frameworks: ['ISO 42001 Clause 9'],
    });
  }

  return items;
}

function getActionText(result) {
  if (result.if_no_guidance) return result.if_no_guidance;
  if (result.section === 'governance') {
    return `Implement ${result.label}. This is required for your profile.`;
  }
  return `${result.label} is below the acceptable threshold. Review and improve this metric.`;
}

function getReviewActionText(result) {
  if (result.section === 'governance' && result.completion_date) {
    return `${result.label} is in progress (expected: ${result.completion_date}). Track to completion.`;
  }
  if (result.section === 'governance') {
    return `${result.label} needs attention. Set a target completion date.`;
  }
  return `${result.label} is in the review range. Consider improving this metric.`;
}

function formatFrameworks(mappings) {
  if (!mappings) return [];
  return mappings.map((m) => `${m.framework.replace(/_/g, ' ').toUpperCase()} ${m.reference}`);
}
