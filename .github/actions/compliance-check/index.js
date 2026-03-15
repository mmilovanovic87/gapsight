/**
 * GapSight Compliance Check — GitHub Action entry point.
 *
 * Loads an assessment JSON file, runs the GapSight scoring engine,
 * prints a human-readable summary to the Actions log, writes a JSON
 * report artifact, and sets action outputs.
 *
 * @module compliance-check-action
 */

const core = require('@actions/core');
const fs = require('fs');
const path = require('path');
const { runComplianceCheck } = require('../../../gapsight-core');

/** @type {Record<string, string>} Maps fail-on input to ordered severity levels */
const FAIL_THRESHOLDS = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  NONE: 'NONE',
};

/** @type {string[]} Risk levels ordered by severity (highest first) */
const SEVERITY_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

/**
 * Returns true if the detected risk level meets or exceeds the fail threshold.
 *
 * @param {string} riskLevel - Detected risk level
 * @param {string} failOn - Configured fail threshold
 * @returns {boolean}
 */
function shouldFail(riskLevel, failOn) {
  if (failOn === 'NONE') return false;
  const riskIndex = SEVERITY_ORDER.indexOf(riskLevel);
  const thresholdIndex = SEVERITY_ORDER.indexOf(failOn);
  return riskIndex <= thresholdIndex;
}

/**
 * Formats a single metric result as a log line.
 *
 * @param {{ id: string, status: string, value: *, label: string }} result - Metric result
 * @returns {string} Formatted log line
 */
function formatResultLine(result) {
  const icon = result.status === 'PASS' ? '✅' :
    result.status === 'REVIEW' ? '⚠️' :
    result.status === 'CRITICAL_FAIL' ? '🚨' :
    result.status === 'NOT_APPLICABLE' ? '➖' : '❌';
  const valueStr = result.value != null ? ` (${result.value})` : '';
  return `  ${icon} ${result.label || result.id}: ${result.status}${valueStr}`;
}

/**
 * Prints a human-readable compliance report to the GitHub Actions log.
 *
 * @param {object} report - The full compliance report from runComplianceCheck
 */
function printReport(report) {
  const levelIcon = report.riskLevel.level === 'LOW' ? '🟢' :
    report.riskLevel.level === 'MEDIUM' ? '🟡' :
    report.riskLevel.level === 'HIGH' ? '🟠' : '🔴';

  core.info('');
  core.info('╔══════════════════════════════════════════════╗');
  core.info('║       GapSight Compliance Report             ║');
  core.info('╚══════════════════════════════════════════════╝');
  core.info('');
  core.info(`${levelIcon} Overall Risk Level: ${report.riskLevel.level}`);
  core.info(`   Result: ${report.passed ? 'PASSED ✅' : 'FAILED ❌'}`);
  core.info('');

  // Metric results
  if (report.metricResults.length > 0) {
    core.info('── Metrics ──');
    for (const result of report.metricResults) {
      core.info(formatResultLine(result));
    }
    core.info('');
  }

  // Process results
  if (report.processResults.length > 0) {
    core.info('── Governance & Process ──');
    for (const result of report.processResults) {
      core.info(formatResultLine(result));
    }
    core.info('');
  }

  // Human oversight
  if (report.oversightResult) {
    core.info('── Human Oversight ──');
    core.info(formatResultLine(report.oversightResult));
    if (report.oversightResult.message) {
      core.info(`     ↳ ${report.oversightResult.message}`);
    }
    core.info('');
  }

  // Cross-metric warnings
  if (report.crossMetricWarnings.length > 0) {
    core.info('── Cross-Metric Warnings ──');
    for (const w of report.crossMetricWarnings) {
      const icon = w.severity === 'CRITICAL' ? '🚨' : '⚠️';
      core.info(`  ${icon} [${w.severity}] ${w.id}: ${w.message}`);
    }
    core.info('');
  }

  // Framework summary
  const fwKeys = Object.keys(report.frameworkSummary);
  if (fwKeys.length > 0) {
    core.info('── Framework Summary ──');
    for (const fw of fwKeys) {
      const s = report.frameworkSummary[fw];
      core.info(`  ${fw}: ${s.pass} pass, ${s.review} review, ${s.fail} fail, ${s.critical} critical (${s.total} total)`);
    }
    core.info('');
  }

  // Context flags
  if (report.contextFlags.length > 0) {
    core.info('── Context Flags ──');
    core.info(`  ${report.contextFlags.join(', ')}`);
    core.info('');
  }
}

/**
 * Main action entry point.
 */
async function run() {
  try {
    const assessmentPath = core.getInput('assessment-path');
    const kbPath = core.getInput('knowledge-base-path');
    const failOn = core.getInput('fail-on').toUpperCase();

    if (!FAIL_THRESHOLDS[failOn]) {
      throw new Error(`Invalid fail-on value: "${failOn}". Must be one of: CRITICAL, HIGH, MEDIUM, NONE`);
    }

    // Load assessment file
    const resolvedAssessment = path.resolve(assessmentPath);
    if (!fs.existsSync(resolvedAssessment)) {
      throw new Error(
        `Assessment file not found: ${resolvedAssessment}\n` +
        'Create a .gapsight/assessment.json file or set the assessment-path input.'
      );
    }

    const assessmentData = JSON.parse(fs.readFileSync(resolvedAssessment, 'utf8'));

    // Load knowledge base (bundled or custom)
    let knowledgeBase;
    if (kbPath) {
      const resolvedKb = path.resolve(kbPath);
      if (!fs.existsSync(resolvedKb)) {
        throw new Error(`Knowledge base file not found: ${resolvedKb}`);
      }
      knowledgeBase = JSON.parse(fs.readFileSync(resolvedKb, 'utf8'));
    } else {
      knowledgeBase = require('../../../src/data/knowledge-base.json');
    }

    // Validate assessment structure
    const { profile, inputs } = assessmentData;
    if (!profile) {
      throw new Error('Assessment file must contain a "profile" object.');
    }
    if (!inputs) {
      throw new Error('Assessment file must contain an "inputs" object.');
    }

    // Run compliance check
    const report = runComplianceCheck({ knowledgeBase, profile, inputs });

    // Print human-readable output
    printReport(report);

    // Write JSON artifact
    const outputDir = path.resolve('.gapsight');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const reportPath = path.join(outputDir, 'compliance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    core.info(`📄 JSON report written to: ${reportPath}`);

    // Set outputs
    core.setOutput('passed', String(report.passed));
    core.setOutput('risk-level', report.riskLevel.level);
    core.setOutput('report-json', reportPath);

    // Fail if threshold exceeded
    if (shouldFail(report.riskLevel.level, failOn)) {
      core.setFailed(
        `Compliance check failed: risk level ${report.riskLevel.level} meets or exceeds threshold ${failOn}`
      );
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

module.exports = { shouldFail, run };

run();
