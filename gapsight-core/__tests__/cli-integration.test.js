const { spawnSync } = require('child_process');
const path = require('path');
const { runCheck, formatResultLine } = require('../bin/check');

const CLI = path.resolve(__dirname, '../bin/check.js');
const FIXTURES = path.resolve(__dirname, 'fixtures');

/** Invoke CLI as a subprocess (true end-to-end) */
function runCLI(args) {
  const result = spawnSync('node', [CLI, ...args], {
    encoding: 'utf8',
    cwd: path.resolve(__dirname, '..'),
  });
  return {
    exitCode: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
  };
}

// ── Direct invocation tests (via runCheck — counted by Jest coverage) ──

describe('runCheck direct invocation', () => {
  describe('valid-assessment.json', () => {
    test('with --fail-on NONE exits 0 and prints passed', () => {
      const result = runCheck([
        path.join(FIXTURES, 'valid-assessment.json'),
        '--fail-on', 'NONE',
      ]);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Compliance check passed');
    });

    test('with --fail-on HIGH exits 0 (risk is LOW)', () => {
      const result = runCheck([
        path.join(FIXTURES, 'valid-assessment.json'),
        '--fail-on', 'HIGH',
      ]);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Compliance check passed');
      expect(result.stdout).toContain('LOW');
    });

    test('outputs Metrics Found section', () => {
      const result = runCheck([path.join(FIXTURES, 'valid-assessment.json')]);
      expect(result.stdout).toContain('Metrics Found in Assessment');
      expect(result.stdout).toContain('Overall Accuracy');
    });

    test('outputs Governance & Process section', () => {
      const result = runCheck([path.join(FIXTURES, 'valid-assessment.json')]);
      expect(result.stdout).toContain('Governance & Process');
      expect(result.stdout).toContain('Risk Management System');
    });

    test('outputs Human Oversight section', () => {
      const result = runCheck([path.join(FIXTURES, 'valid-assessment.json')]);
      expect(result.stdout).toContain('Human Oversight');
      expect(result.stdout).toContain('PASS');
    });

    test('shows all metrics provided message when none missing', () => {
      const result = runCheck([path.join(FIXTURES, 'valid-assessment.json')]);
      expect(result.stdout).toContain('all metrics provided');
    });
  });

  describe('failing-assessment.json', () => {
    test('with --fail-on HIGH exits 1 and prints failed', () => {
      const result = runCheck([
        path.join(FIXTURES, 'failing-assessment.json'),
        '--fail-on', 'HIGH',
      ]);
      expect(result.exitCode).toBe(1);
      expect(result.stdout).toContain('Compliance check failed');
      expect(result.stdout).toContain('HIGH');
    });

    test('with --fail-on NONE exits 0 (never fails)', () => {
      const result = runCheck([
        path.join(FIXTURES, 'failing-assessment.json'),
        '--fail-on', 'NONE',
      ]);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Compliance check passed');
    });

    test('outputs Metrics Missing section with missing metrics', () => {
      const result = runCheck([path.join(FIXTURES, 'failing-assessment.json')]);
      expect(result.stdout).toContain('Metrics Missing');
      expect(result.stdout).toContain('not provided');
    });

    test('outputs FAIL status for bad metrics', () => {
      const result = runCheck([
        path.join(FIXTURES, 'failing-assessment.json'),
      ]);
      expect(result.stdout).toContain('FAIL');
      expect(result.stdout).toContain('Overall Accuracy');
    });
  });

  describe('partial-assessment.json', () => {
    test('with --fail-on HIGH exits 1 (missing metrics default to FAIL)', () => {
      const result = runCheck([
        path.join(FIXTURES, 'partial-assessment.json'),
        '--fail-on', 'HIGH',
      ]);
      expect(result.exitCode).toBe(1);
      expect(result.stdout).toContain('Compliance check failed');
      expect(result.stdout).toContain('Metrics Missing');
    });
  });

  describe('not-applicable-assessment.json', () => {
    test('with --fail-on HIGH exits 0 and shows NOT_APPLICABLE (not FAIL)', () => {
      const result = runCheck([
        path.join(FIXTURES, 'not-applicable-assessment.json'),
        '--fail-on', 'HIGH',
      ]);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Compliance check passed');
      expect(result.stdout).toContain('NOT_APPLICABLE');
      const lines = result.stdout.split('\n');
      const naLines = lines.filter(l => l.includes('NOT_APPLICABLE'));
      for (const line of naLines) {
        expect(line).not.toContain('\u274C');
      }
    });
  });

  describe('malformed.json', () => {
    test('exits 1 with meaningful error (not raw stack trace)', () => {
      const result = runCheck([path.join(FIXTURES, 'malformed.json')]);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Failed to parse assessment JSON');
      expect(result.stderr).not.toMatch(/^\s+at\s+/m);
    });
  });

  describe('empty.json', () => {
    test('exits 1 with meaningful error about missing profile', () => {
      const result = runCheck([path.join(FIXTURES, 'empty.json')]);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('profile');
    });
  });

  describe('nonexistent file', () => {
    test('exits 1 with file not found message', () => {
      const result = runCheck(['nonexistent-file-that-does-not-exist.json']);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('not found');
    });
  });

  describe('no arguments', () => {
    test('exits 1 with usage message', () => {
      const result = runCheck([]);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Missing required argument');
      expect(result.stderr).toContain('Usage');
    });
  });

  describe('unknown flag', () => {
    test('exits 1 with error about unknown flag', () => {
      const result = runCheck([
        path.join(FIXTURES, 'valid-assessment.json'),
        '--unknown-flag',
      ]);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Unknown flag');
    });
  });

  describe('--fail-on without value', () => {
    test('exits 1 with error about missing value', () => {
      const result = runCheck([
        path.join(FIXTURES, 'valid-assessment.json'),
        '--fail-on',
      ]);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('--fail-on requires a value');
    });
  });

  describe('cross-metric-warnings.json', () => {
    test('outputs oversight hard blocker message', () => {
      const result = runCheck([
        path.join(FIXTURES, 'cross-metric-warnings.json'),
      ]);
      expect(result.stdout).toContain('Human Oversight');
      expect(result.stdout).toContain('CRITICAL_FAIL');
      // q2=no is a hard blocker, so oversight should have a message
      expect(result.stdout).toMatch(/\u21B3/);
    });

    test('outputs CRITICAL risk level for hard blocker', () => {
      const result = runCheck([
        path.join(FIXTURES, 'cross-metric-warnings.json'),
      ]);
      expect(result.stdout).toContain('CRITICAL');
    });
  });

  describe('invalid --fail-on value', () => {
    test('exits 1 with error about invalid value', () => {
      const result = runCheck([
        path.join(FIXTURES, 'valid-assessment.json'),
        '--fail-on', 'BANANAS',
      ]);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Invalid --fail-on value');
    });
  });

  describe('missing inputs object', () => {
    test('exits 1 with error about missing inputs', () => {
      // Create an in-memory temporary file approach: use a path to empty.json
      // but this has no profile either, so test that separately
      // We need a file with profile but no inputs
      const fs = require('fs');
      const tmpFile = path.join(FIXTURES, '_tmp_no_inputs.json');
      fs.writeFileSync(tmpFile, JSON.stringify({ profile: { role: 'provider' } }));
      try {
        const result = runCheck([tmpFile]);
        expect(result.exitCode).toBe(1);
        expect(result.stderr).toContain('inputs');
      } finally {
        fs.unlinkSync(tmpFile);
      }
    });
  });
});

// ── formatResultLine tests ──

describe('formatResultLine', () => {
  test('PASS status shows check mark', () => {
    const line = formatResultLine({ id: 'test', status: 'PASS', value: 0.95, label: 'Test' });
    expect(line).toContain('\u2705');
    expect(line).toContain('PASS');
    expect(line).toContain('0.95');
  });

  test('REVIEW status shows warning', () => {
    const line = formatResultLine({ id: 'test', status: 'REVIEW', value: 0.7, label: 'Test' });
    expect(line).toContain('REVIEW');
  });

  test('CRITICAL_FAIL status shows alert', () => {
    const line = formatResultLine({ id: 'test', status: 'CRITICAL_FAIL', value: null, label: 'Test' });
    expect(line).toContain('CRITICAL_FAIL');
  });

  test('NOT_APPLICABLE status shows dash', () => {
    const line = formatResultLine({ id: 'test', status: 'NOT_APPLICABLE', value: 'not_applicable', label: 'Test' });
    expect(line).toContain('\u2796');
    expect(line).toContain('NOT_APPLICABLE');
  });

  test('FAIL status shows cross', () => {
    const line = formatResultLine({ id: 'test', status: 'FAIL', value: 0.3, label: 'Test' });
    expect(line).toContain('\u274C');
  });

  test('null value omits value string', () => {
    const line = formatResultLine({ id: 'test', status: 'FAIL', value: null, label: 'Test' });
    expect(line).not.toContain('(null)');
    expect(line).toContain('Test: FAIL');
  });

  test('falls back to id when label is missing', () => {
    const line = formatResultLine({ id: 'my_metric', status: 'PASS', value: 1 });
    expect(line).toContain('my_metric');
  });
});

// ── Subprocess E2E tests (verify actual CLI entry point works) ──

describe('CLI subprocess E2E', () => {
  test('valid assessment exits 0 via subprocess', () => {
    const { exitCode, stdout } = runCLI([
      path.join(FIXTURES, 'valid-assessment.json'),
      '--fail-on', 'NONE',
    ]);
    expect(exitCode).toBe(0);
    expect(stdout).toContain('Compliance check passed');
  });

  test('failing assessment exits 1 via subprocess', () => {
    const { exitCode, stdout } = runCLI([
      path.join(FIXTURES, 'failing-assessment.json'),
      '--fail-on', 'HIGH',
    ]);
    expect(exitCode).toBe(1);
    expect(stdout).toContain('Compliance check failed');
  });

  test('no arguments exits 1 via subprocess', () => {
    const { exitCode, stderr } = runCLI([]);
    expect(exitCode).toBe(1);
    expect(stderr).toContain('Missing required argument');
  });
});
