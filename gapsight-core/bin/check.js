#!/usr/bin/env node

/**
 * GapSight CLI — Local dry-run compliance check.
 *
 * Usage:
 *   node bin/check.js ./path/to/assessment.json [--fail-on HIGH]
 *
 * Runs the same compliance check as the GitHub Action, printing verbose output
 * and exiting with code 1 if risk meets or exceeds the fail-on threshold.
 */

const fs = require('fs');
const path = require('path');
const { runComplianceCheck } = require('../index');

/** @type {string[]} Risk levels ordered by severity (highest first) */
const SEVERITY_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

const VALID_FAIL_ON = ['CRITICAL', 'HIGH', 'MEDIUM', 'NONE'];

/**
 * Parses CLI arguments into a structured object.
 *
 * @param {string[]} argv - Process arguments (process.argv.slice(2))
 * @returns {{ filePath: string|null, failOn: string, errors: string[] }}
 */
function parseArgs(argv) {
  const errors = [];
  let filePath = null;
  let failOn = 'NONE';

  const args = argv.slice();
  let i = 0;
  while (i < args.length) {
    if (args[i] === '--fail-on') {
      if (i + 1 >= args.length) {
        errors.push('--fail-on requires a value (CRITICAL, HIGH, MEDIUM, or NONE).');
      } else {
        const val = args[i + 1].toUpperCase();
        if (!VALID_FAIL_ON.includes(val)) {
          errors.push(`Invalid --fail-on value: "${args[i + 1]}". Must be one of: ${VALID_FAIL_ON.join(', ')}`);
        } else {
          failOn = val;
        }
        i += 1;
      }
    } else if (args[i].startsWith('--')) {
      errors.push(`Unknown flag: ${args[i]}`);
    } else if (!filePath) {
      filePath = args[i];
    } else {
      errors.push(`Unexpected argument: ${args[i]}`);
    }
    i += 1;
  }

  if (!filePath && errors.length === 0) {
    errors.push('Missing required argument: path to assessment JSON file.');
  }

  return { filePath, failOn, errors };
}

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
 * Formats a single result as a log line.
 *
 * @param {{ id: string, status: string, value: *, label: string }} result
 * @returns {string}
 */
function formatResultLine(result) {
  const icon = result.status === 'PASS' ? '\u2705' :
    result.status === 'REVIEW' ? '\u26A0\uFE0F' :
    result.status === 'CRITICAL_FAIL' ? '\uD83D\uDEA8' :
    result.status === 'NOT_APPLICABLE' ? '\u2796' : '\u274C';
  const valueStr = result.value != null ? ` (${result.value})` : '';
  return `  ${icon} ${result.label || result.id}: ${result.status}${valueStr}`;
}

/**
 * Core CLI logic: loads, validates, runs compliance check, and returns structured output.
 * Extracted so it can be tested directly without subprocess invocation.
 *
 * @param {string[]} argv - CLI arguments (same as process.argv.slice(2))
 * @param {{ cwd?: string }} [options] - Optional overrides
 * @returns {{ exitCode: number, stdout: string, stderr: string }}
 */
function runCheck(argv, options = {}) {
  const stdout = [];
  const stderr = [];

  const { filePath, failOn, errors } = parseArgs(argv);

  if (errors.length > 0) {
    stderr.push('Error: ' + errors.join('\n'));
    stderr.push('\nUsage: gapsight-check <assessment.json> [--fail-on CRITICAL|HIGH|MEDIUM|NONE]');
    return { exitCode: 1, stdout: stdout.join('\n'), stderr: stderr.join('\n') };
  }

  const resolvedPath = options.cwd ? path.resolve(options.cwd, filePath) : path.resolve(filePath);
  if (!fs.existsSync(resolvedPath)) {
    stderr.push(`Assessment file not found: ${resolvedPath}`);
    return { exitCode: 1, stdout: stdout.join('\n'), stderr: stderr.join('\n') };
  }

  let assessmentData;
  try {
    assessmentData = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
  } catch (e) {
    stderr.push(`Failed to parse assessment JSON: ${e.message}`);
    return { exitCode: 1, stdout: stdout.join('\n'), stderr: stderr.join('\n') };
  }

  const { profile, inputs } = assessmentData;
  if (!profile) {
    stderr.push('Assessment file must contain a "profile" object.');
    return { exitCode: 1, stdout: stdout.join('\n'), stderr: stderr.join('\n') };
  }
  if (!inputs) {
    stderr.push('Assessment file must contain an "inputs" object.');
    return { exitCode: 1, stdout: stdout.join('\n'), stderr: stderr.join('\n') };
  }

  // Load knowledge base
  const knowledgeBase = require(path.join(__dirname, '..', '..', 'src', 'data', 'knowledge-base.json'));

  // Run compliance check
  const report = runComplianceCheck({ knowledgeBase, profile, inputs });

  // Verbose output: metrics found and missing
  const metricsFound = report.metricResults.filter((r) => r.value !== null && r.value !== undefined);
  const metricsMissing = report.metricResults.filter((r) => r.value === null || r.value === undefined);

  stdout.push('');
  stdout.push('\u2500\u2500 Metrics Found in Assessment \u2500\u2500');
  if (metricsFound.length > 0) {
    for (const r of metricsFound) {
      stdout.push(`  - ${r.label} (${r.id}): ${r.value}`);
    }
  } else {
    stdout.push('  (none)');
  }
  stdout.push('');

  stdout.push('\u2500\u2500 Metrics Missing (defaults applied) \u2500\u2500');
  if (metricsMissing.length > 0) {
    for (const r of metricsMissing) {
      stdout.push(`  - ${r.label} (${r.id}): not provided, scored as ${r.status}`);
    }
  } else {
    stdout.push('  (none \u2014 all metrics provided)');
  }
  stdout.push('');

  stdout.push('\u2500\u2500 Risk Assessment \u2500\u2500');
  stdout.push(`  Computed risk level: ${report.riskLevel.level}`);
  stdout.push(`  Fail-on threshold:   ${failOn}`);
  stdout.push(`  (fail-on: ${failOn} means the check fails if risk level is ${failOn} or above.)`);
  stdout.push('');

  // Print report
  const levelIcon = report.riskLevel.level === 'LOW' ? '\uD83D\uDFE2' :
    report.riskLevel.level === 'MEDIUM' ? '\uD83D\uDFE1' :
    report.riskLevel.level === 'HIGH' ? '\uD83D\uDFE0' : '\uD83D\uDD34';

  stdout.push('\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557');
  stdout.push('\u2551       GapSight Compliance Report             \u2551');
  stdout.push('\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D');
  stdout.push('');
  stdout.push(`${levelIcon} Overall Risk Level: ${report.riskLevel.level}`);
  stdout.push(`   Result: ${report.passed ? 'PASSED \u2705' : 'FAILED \u274C'}`);
  stdout.push('');

  if (report.metricResults.length > 0) {
    stdout.push('\u2500\u2500 Metrics \u2500\u2500');
    for (const result of report.metricResults) {
      stdout.push(formatResultLine(result));
    }
    stdout.push('');
  }

  if (report.processResults.length > 0) {
    stdout.push('\u2500\u2500 Governance & Process \u2500\u2500');
    for (const result of report.processResults) {
      stdout.push(formatResultLine(result));
    }
    stdout.push('');
  }

  if (report.oversightResult) {
    stdout.push('\u2500\u2500 Human Oversight \u2500\u2500');
    stdout.push(formatResultLine(report.oversightResult));
    if (report.oversightResult.message) {
      stdout.push(`     \u21B3 ${report.oversightResult.message}`);
    }
    stdout.push('');
  }

  if (report.crossMetricWarnings.length > 0) {
    stdout.push('\u2500\u2500 Cross-Metric Warnings \u2500\u2500');
    for (const w of report.crossMetricWarnings) {
      const icon = w.severity === 'CRITICAL' ? '\uD83D\uDEA8' : '\u26A0\uFE0F';
      stdout.push(`  ${icon} [${w.severity}] ${w.id}: ${w.message}`);
    }
    stdout.push('');
  }

  // Final verdict
  if (shouldFail(report.riskLevel.level, failOn)) {
    stdout.push(`\u274C Compliance check failed: risk level ${report.riskLevel.level} meets or exceeds fail-on threshold ${failOn}`);
    return { exitCode: 1, stdout: stdout.join('\n'), stderr: stderr.join('\n') };
  } else {
    stdout.push('\u2705 Compliance check passed');
    return { exitCode: 0, stdout: stdout.join('\n'), stderr: stderr.join('\n') };
  }
}

// Main execution — only runs when invoked directly (not when required for testing)
if (require.main === module) {
  const result = runCheck(process.argv.slice(2));
  if (result.stderr) console.error(result.stderr);
  if (result.stdout) console.log(result.stdout);
  process.exit(result.exitCode);
}

module.exports = { parseArgs, shouldFail, formatResultLine, runCheck };
