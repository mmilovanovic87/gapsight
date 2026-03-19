/**
 * GapSight Core — Framework-agnostic compliance scoring engine.
 *
 * Provides the `runComplianceCheck` function that takes a JSON assessment
 * object and returns a structured compliance report with scores, gaps,
 * and pass/fail status per framework (EU AI Act, NIST AI RMF, ISO 42001).
 *
 * @module gapsight-core
 *
 * @example
 * const { runComplianceCheck } = require('./gapsight-core');
 * const knowledgeBase = require('./src/data/knowledge-base.json');
 *
 * const report = runComplianceCheck({
 *   knowledgeBase,
 *   profile: {
 *     role: 'provider',
 *     gpai_flag: false,
 *     risk_category: 'high-risk',
 *     deployment_status: 'pre-deployment',
 *     frameworks_selected: ['eu_ai_act'],
 *   },
 *   inputs: {
 *     overall_accuracy: 0.91,
 *     f1_score: 0.87,
 *     // ...
 *   },
 * });
 *
 * console.log(report.passed);        // true or false
 * console.log(report.riskLevel);     // { level: 'LOW', message: '...', criteria: {...} }
 * console.log(report.frameworkSummary); // { eu_ai_act: { pass: 8, review: 1, ... } }
 */

const { getMetricsForProfile, getProcessRequirementsForProfile, isMetricRequired } = require('./profile-filter');
const { getMetricStatus, getProcessStatus, getHumanOversightStatus, deriveContextFlags } = require('./scoring');
const { evaluateCrossMetricRules } = require('./cross-metric');
const { getRiskLevel, getFrameworkSummary } = require('./risk-level');
const constants = require('./constants');

/**
 * Filters framework mappings to only include selected frameworks.
 *
 * @param {Array<{ framework: string }>} mappings - Framework mapping array
 * @param {string[]} selected - Selected framework IDs
 * @returns {Array<{ framework: string }>} Filtered mappings
 */
function filterMappings(mappings, selected) {
  if (!selected || selected.length === 0 || !mappings) return mappings;
  return mappings.filter((m) => selected.includes(m.framework));
}

/**
 * Runs a full compliance check against the provided assessment data.
 *
 * This is the primary entry point for the GapSight scoring engine.
 * It is completely stateless and framework-agnostic — no React, no browser APIs.
 *
 * @param {object} assessment - Assessment input object
 * @param {object} assessment.knowledgeBase - The GapSight knowledge base JSON
 * @param {object} assessment.profile - User profile
 * @param {string} assessment.profile.role - 'provider' or 'deployer'
 * @param {boolean} assessment.profile.gpai_flag - Whether this is a GPAI system
 * @param {string} assessment.profile.risk_category - 'high-risk', 'limited', or 'gpai'
 * @param {string} assessment.profile.deployment_status - 'pre-deployment', 'post-deployment', or 'pilot'
 * @param {string[]} [assessment.profile.frameworks_selected] - Selected framework IDs
 * @param {object} assessment.inputs - All metric values and form inputs
 * @returns {{
 *   passed: boolean,
 *   riskLevel: { level: string, message: string, criteria: object },
 *   metricResults: Array<object>,
 *   processResults: Array<object>,
 *   oversightResult: object|null,
 *   crossMetricWarnings: Array<{ id: string, severity: string, message: string }>,
 *   frameworkSummary: object,
 *   contextFlags: string[],
 *   generatedAt: string,
 * }}
 *
 * @throws {Error} If assessment is not a non-null object
 * @throws {Error} If assessment.knowledgeBase is missing or not an object
 * @throws {Error} If assessment.knowledgeBase.metrics is not an array
 * @throws {Error} If assessment.knowledgeBase.process_requirements is not an array
 * @throws {Error} If assessment.profile is missing or not an object
 * @throws {Error} If assessment.inputs is missing or not an object
 *
 * @example
 * const report = runComplianceCheck({
 *   knowledgeBase: require('../src/data/knowledge-base.json'),
 *   profile: { role: 'provider', gpai_flag: false, risk_category: 'high-risk', deployment_status: 'pre-deployment', frameworks_selected: ['eu_ai_act'] },
 *   inputs: { overall_accuracy: 0.91, f1_score: 0.87, human_oversight: { q1: 'yes', q2: 'yes', q3: 'yes', q4: 'yes', q5: 'yes' } },
 * });
 * if (!report.passed) process.exit(1);
 */
function runComplianceCheck(assessment) {
  if (!assessment || typeof assessment !== 'object') {
    throw new Error('runComplianceCheck requires a non-null assessment object.');
  }

  const { knowledgeBase, profile, inputs } = assessment;

  if (!knowledgeBase || typeof knowledgeBase !== 'object') {
    throw new Error('assessment.knowledgeBase must be a non-null object.');
  }
  if (!Array.isArray(knowledgeBase.metrics)) {
    throw new Error('assessment.knowledgeBase.metrics must be an array.');
  }
  if (!Array.isArray(knowledgeBase.process_requirements)) {
    throw new Error('assessment.knowledgeBase.process_requirements must be an array.');
  }
  if (!profile || typeof profile !== 'object') {
    throw new Error('assessment.profile must be a non-null object.');
  }
  if (!inputs || typeof inputs !== 'object') {
    throw new Error('assessment.inputs must be a non-null object.');
  }

  const contextFlags = deriveContextFlags(inputs, profile);
  const metrics = getMetricsForProfile(knowledgeBase, profile);
  const processReqs = getProcessRequirementsForProfile(knowledgeBase, profile);
  const selectedFw = profile.frameworks_selected;
  const isRequired = (metricId, prof) => isMetricRequired(knowledgeBase, metricId, prof);

  // Score each metric
  const metricResults = metrics.map((metric) => {
    const value = inputs[metric.id];
    const status = getMetricStatus(value, metric, contextFlags, profile, isRequired);
    return {
      id: metric.id,
      label: metric.label,
      section: metric.section,
      value,
      status,
      required_for_profile: true,
      framework_mappings: filterMappings(metric.framework_mappings, selectedFw),
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
      status,
      required_for_profile: true,
      framework_mappings: filterMappings(req.framework_mappings, selectedFw),
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
      framework_mappings: filterMappings([
        { framework: 'eu_ai_act', reference: 'Article 14', description: 'Human oversight requirements' },
        { framework: 'nist_ai_rmf', reference: 'GOVERN 1, MEASURE 2.8', description: 'Human-AI interaction' },
        { framework: 'iso_42001', reference: 'Annex A.8', description: 'Human oversight controls' },
      ], selectedFw),
    };
  }

  const allResults = [
    ...metricResults,
    ...processResults,
    ...(oversightResult ? [oversightResult] : []),
  ];

  const crossMetricWarnings = evaluateCrossMetricRules(inputs, profile, oversightScore);
  const riskLevel = getRiskLevel(allResults, crossMetricWarnings);
  const frameworkSummary = getFrameworkSummary(allResults, profile.frameworks_selected);

  const passed = riskLevel.level === 'LOW' || riskLevel.level === 'MEDIUM';

  return {
    passed,
    riskLevel,
    metricResults,
    processResults,
    oversightResult,
    crossMetricWarnings,
    frameworkSummary,
    contextFlags,
    generatedAt: new Date().toISOString(),
  };
}

module.exports = {
  runComplianceCheck,
  constants,
};
