const { parseArgs, shouldFail } = require('../bin/check');

describe('CLI parseArgs', () => {
  test('returns error when no arguments provided', () => {
    const result = parseArgs([]);
    expect(result.filePath).toBeNull();
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toMatch(/Missing required argument/);
  });

  test('parses a valid file path', () => {
    const result = parseArgs(['./assessment.json']);
    expect(result.filePath).toBe('./assessment.json');
    expect(result.failOn).toBe('NONE');
    expect(result.errors).toEqual([]);
  });

  test('parses --fail-on HIGH', () => {
    const result = parseArgs(['./assessment.json', '--fail-on', 'HIGH']);
    expect(result.filePath).toBe('./assessment.json');
    expect(result.failOn).toBe('HIGH');
    expect(result.errors).toEqual([]);
  });

  test('parses --fail-on NONE', () => {
    const result = parseArgs(['./assessment.json', '--fail-on', 'NONE']);
    expect(result.failOn).toBe('NONE');
    expect(result.errors).toEqual([]);
  });

  test('parses --fail-on case insensitively', () => {
    const result = parseArgs(['./assessment.json', '--fail-on', 'critical']);
    expect(result.failOn).toBe('CRITICAL');
    expect(result.errors).toEqual([]);
  });

  test('parses --fail-on MEDIUM', () => {
    const result = parseArgs(['./assessment.json', '--fail-on', 'MEDIUM']);
    expect(result.failOn).toBe('MEDIUM');
    expect(result.errors).toEqual([]);
  });

  test('returns error for invalid --fail-on value', () => {
    const result = parseArgs(['./assessment.json', '--fail-on', 'INVALID']);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toMatch(/Invalid --fail-on value/);
  });

  test('returns error when --fail-on has no value', () => {
    const result = parseArgs(['./assessment.json', '--fail-on']);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toMatch(/--fail-on requires a value/);
  });

  test('returns error for unknown flags', () => {
    const result = parseArgs(['./assessment.json', '--verbose']);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toMatch(/Unknown flag/);
  });

  test('returns error for unexpected extra arguments', () => {
    const result = parseArgs(['./a.json', './b.json']);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toMatch(/Unexpected argument/);
  });

  test('--fail-on before file path works', () => {
    const result = parseArgs(['--fail-on', 'HIGH', './assessment.json']);
    expect(result.filePath).toBe('./assessment.json');
    expect(result.failOn).toBe('HIGH');
    expect(result.errors).toEqual([]);
  });
});

describe('CLI shouldFail', () => {
  test('returns false when failOn is NONE', () => {
    expect(shouldFail('CRITICAL', 'NONE')).toBe(false);
    expect(shouldFail('HIGH', 'NONE')).toBe(false);
  });

  test('returns true when risk equals threshold', () => {
    expect(shouldFail('HIGH', 'HIGH')).toBe(true);
    expect(shouldFail('CRITICAL', 'CRITICAL')).toBe(true);
  });

  test('returns true when risk exceeds threshold', () => {
    expect(shouldFail('CRITICAL', 'HIGH')).toBe(true);
    expect(shouldFail('CRITICAL', 'MEDIUM')).toBe(true);
  });

  test('returns false when risk is below threshold', () => {
    expect(shouldFail('LOW', 'HIGH')).toBe(false);
    expect(shouldFail('MEDIUM', 'HIGH')).toBe(false);
    expect(shouldFail('LOW', 'MEDIUM')).toBe(false);
  });
});
