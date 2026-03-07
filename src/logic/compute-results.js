import { getMetricsForProfile, getProcessRequirementsForProfile } from './profile-filter';
import { getMetricStatus, getProcessStatus, getHumanOversightStatus, deriveContextFlags } from './scoring';
import { evaluateCrossMetricRules } from './cross-metric';
import { getRiskLevel, getFrameworkSummary } from './risk-level';
import { generateActionItems } from './action-items';

/**
 * Computes all results from user inputs and profile.
 *
 * Returns the complete result object needed by ResultsPage and exports.
 */
export function computeResults(inputs, profile) {
  const contextFlags = deriveContextFlags(inputs, profile);
  const metrics = getMetricsForProfile(profile);
  const processReqs = getProcessRequirementsForProfile(profile);

  // Score each metric
  const metricResults = metrics.map((metric) => {
    const value = inputs[metric.id];
    const status = getMetricStatus(value, metric, contextFlags, profile);
    return {
      id: metric.id,
      label: metric.label,
      section: metric.section,
      value,
      status,
      required_for_profile: true,
      framework_mappings: metric.framework_mappings,
      threshold_note: metric.threshold_note,
      pass_threshold: metric.pass_threshold,
      review_threshold: metric.review_threshold,
      direction: metric.direction,
    };
  });

  // Score each process requirement
  const govData = inputs.governance || {};
  const processResults = processReqs.map((req) => {
    const data = govData[req.id] || {};
    const status = getProcessStatus(data.status, req, profile);
    return {
      id: req.id,
      label: req.label,
      section: req.section,
      value: data.status,
      evidence: data.evidence,
      completion_date: data.completion_date,
      status,
      required_for_profile: true,
      framework_mappings: req.framework_mappings,
      if_no_guidance: req.if_no_guidance,
    };
  });

  // Human oversight
  const oversightAnswers = inputs.human_oversight || {};
  const hasOversight = oversightAnswers.q1 || oversightAnswers.q2 || oversightAnswers.q3 ||
    oversightAnswers.q4 || oversightAnswers.q5;
  let oversightResult = null;
  let oversightScore = null;

  if (hasOversight) {
    const oversight = getHumanOversightStatus(oversightAnswers);
    oversightScore = oversight.score;
    oversightResult = {
      id: 'human_oversight',
      label: 'Human Oversight',
      section: 'human_oversight',
      value: oversightScore,
      status: oversight.status,
      message: oversight.message,
      required_for_profile: true,
      framework_mappings: [
        { framework: 'eu_ai_act', reference: 'Article 14', description: 'Human oversight requirements' },
        { framework: 'nist_ai_rmf', reference: 'GOVERN 1, MEASURE 2.8', description: 'Human-AI interaction' },
        { framework: 'iso_42001', reference: 'Annex A.8', description: 'Human oversight controls' },
      ],
    };
  }

  // Combine all results
  const allResults = [
    ...metricResults,
    ...processResults,
    ...(oversightResult ? [oversightResult] : []),
  ];

  // Cross-metric warnings
  const crossMetricWarnings = evaluateCrossMetricRules(inputs, profile, oversightScore);

  // Risk level
  const riskLevel = getRiskLevel(allResults, crossMetricWarnings);

  // Framework summary
  const frameworkSummary = getFrameworkSummary(allResults, profile.frameworks_selected);

  // Action items
  const actionItems = generateActionItems(allResults, crossMetricWarnings, profile, inputs, contextFlags);

  return {
    profile,
    inputs,
    metricResults,
    processResults,
    oversightResult,
    allResults,
    crossMetricWarnings,
    riskLevel,
    frameworkSummary,
    actionItems,
    contextFlags,
    generatedAt: new Date().toISOString(),
  };
}
