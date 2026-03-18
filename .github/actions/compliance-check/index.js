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
const os = require('os');
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
 * Semantics: "fail-on: HIGH" means the check fails if the detected risk level
 * is HIGH or above (i.e., HIGH or CRITICAL). The comparison uses SEVERITY_ORDER
 * where index 0 is the most severe. A risk level "meets or exceeds" the threshold
 * when its index in SEVERITY_ORDER is less than or equal to the threshold's index.
 * If failOn is 'NONE', the check never fails (report-only mode).
 *
 * @param {string} riskLevel - Detected risk level (CRITICAL, HIGH, MEDIUM, or LOW)
 * @param {string} failOn - Configured fail threshold (CRITICAL, HIGH, MEDIUM, or NONE)
 * @returns {boolean} true if the action should fail
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

    // Verbose output: metrics found and missing
    const allInputKeys = Object.keys(inputs).filter((k) => k !== 'human_oversight' && k !== 'governance');
    const metricsFound = report.metricResults.filter((r) => r.value !== null && r.value !== undefined);
    const metricsMissing = report.metricResults.filter((r) => r.value === null || r.value === undefined);

    core.info('');
    core.info('── Metrics Found in Assessment ──');
    if (metricsFound.length > 0) {
      for (const r of metricsFound) {
        core.info(`  - ${r.label} (${r.id}): ${r.value}`);
      }
    } else {
      core.info('  (none)');
    }
    core.info('');

    core.info('── Metrics Missing (defaults applied) ──');
    if (metricsMissing.length > 0) {
      for (const r of metricsMissing) {
        core.info(`  - ${r.label} (${r.id}): not provided, scored as ${r.status}`);
      }
    } else {
      core.info('  (none — all metrics provided)');
    }
    core.info('');

    core.info('── Risk Assessment ──');
    core.info(`  Computed risk level: ${report.riskLevel.level}`);
    core.info(`  Fail-on threshold:   ${failOn}`);
    core.info(`  (fail-on: ${failOn} means the check fails if risk level is ${failOn} or above.)`);
    core.info('');

    // Print human-readable output
    printReport(report);

    // Final verdict
    if (shouldFail(report.riskLevel.level, failOn)) {
      core.info(`\u274C Compliance check failed: risk level ${report.riskLevel.level} meets or exceeds fail-on threshold ${failOn}`);
    } else {
      core.info('\u2705 Compliance check passed');
    }
    core.info('');

    // Write JSON artifact
    const outputDir = path.resolve('.gapsight');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const reportPath = path.join(outputDir, 'compliance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    core.info(`📄 JSON report written to: ${reportPath}`);

    // Write and upload structured artifact report
    const metricsNotApplicable = report.metricResults
      .filter((r) => r.value === 'not_applicable')
      .map((r) => r.label || r.id);
    const artifactReport = {
      timestamp: new Date().toISOString(),
      risk_level: report.riskLevel.level,
      passed: report.passed,
      fail_on: failOn,
      metrics_found: metricsFound.map((r) => r.label || r.id),
      metrics_missing: metricsMissing.map((r) => r.label || r.id),
      metrics_not_applicable: metricsNotApplicable,
      compliance_result: report,
    };
    const tempDir = process.env.RUNNER_TEMP || os.tmpdir();
    const artifactPath = path.join(tempDir, 'gapsight-compliance-report.json');
    fs.writeFileSync(artifactPath, JSON.stringify(artifactReport, null, 2));

    try {
      const { DefaultArtifactClient } = require('@actions/artifact');
      const artifact = new DefaultArtifactClient();
      await artifact.uploadArtifact('gapsight-compliance-report', [artifactPath], tempDir);
      core.info('📦 Compliance report uploaded as artifact: gapsight-compliance-report');
    } catch (artifactErr) {
      // Artifact upload is best-effort — don't fail the action if it fails
      core.warning(`Artifact upload failed (non-fatal): ${artifactErr.message}`);
    }

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
