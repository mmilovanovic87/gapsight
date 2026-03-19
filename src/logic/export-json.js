import kbChangelog from '../data/kb-changelog.json';
import en from '../locales/en.json';
import pkg from '../../package.json';

/**
 * Generates a JSON export of the assessment results.
 *
 * Required fields: UUID, timestamps, disclaimer, all required_in_exports phrases.
 */
export function generateJsonExport(results, session) {
  const exportData = {
    _disclaimer: en.exports.disclaimer,
    _note: 'This is an informative self-assessment. It is not legal advice and not a compliance certificate.',
    _canonical: en.exports.canonical_note,
    _meta: {
      generated_at: results.generatedAt,
      gapsight_version: pkg.version,
      kb_version: `v${kbChangelog.current_version}`,
      eu_ai_act_reference: 'Regulation (EU) 2024/1689',
    },
    assessment_id: session?.assessment_id || null,
    generated_at: results.generatedAt,
    tos_accepted_at: session?.tos_accepted_at || null,
    disclaimer_confirmed_at: session?.disclaimer_confirmed_at || null,
    kb_version: kbChangelog.current_version,
    kb_date: kbChangelog.versions[0].date,
    profile: {
      role: results.profile.role,
      gpai_flag: results.profile.gpai_flag,
      risk_category: results.profile.risk_category,
      deployment_status: results.profile.deployment_status,
    },
    risk_level: {
      level: results.riskLevel.level,
      message: results.riskLevel.message,
      criteria: results.riskLevel.criteria,
    },
    framework_summary: results.frameworkSummary,
    cross_metric_warnings: results.crossMetricWarnings.map((w) => ({
      id: w.id,
      severity: w.severity,
      message: w.message,
    })),
    metric_results: results.metricResults.map((r) => ({
      id: r.id,
      label: r.label,
      section: r.section,
      value: r.value,
      status: r.status,
      threshold_note: r.threshold_note,
    })),
    process_results: results.processResults.map((r) => ({
      id: r.id,
      label: r.label,
      value: r.value,
      status: r.status,
      evidence: r.evidence || null,
      completion_date: r.completion_date || null,
    })),
    oversight_result: results.oversightResult ? {
      score: results.oversightResult.value,
      status: results.oversightResult.status,
      message: results.oversightResult.message,
    } : null,
    action_items: results.actionItems,
    context_flags: results.contextFlags,
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Triggers a file download of the JSON export.
 */
export function downloadJsonExport(results, session) {
  try {
    const json = generateJsonExport(results, session);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gapsight-assessment-${results.generatedAt.slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch {
    window.alert('Export failed. Please try again.');
  }
}
