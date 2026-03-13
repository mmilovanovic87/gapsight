/**
 * Tests for the GitHub Action's pure logic functions.
 *
 * We cannot run the full action (it depends on @actions/core runtime),
 * but we can test the shouldFail threshold logic by extracting it.
 */

const SEVERITY_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

/**
 * Mirror of the shouldFail function from index.js.
 */
function shouldFail(riskLevel, failOn) {
  if (failOn === 'NONE') return false;
  const riskIndex = SEVERITY_ORDER.indexOf(riskLevel);
  const thresholdIndex = SEVERITY_ORDER.indexOf(failOn);
  return riskIndex <= thresholdIndex;
}

describe('shouldFail', () => {
  test('NONE threshold never fails', () => {
    expect(shouldFail('CRITICAL', 'NONE')).toBe(false);
    expect(shouldFail('HIGH', 'NONE')).toBe(false);
    expect(shouldFail('LOW', 'NONE')).toBe(false);
  });

  test('CRITICAL threshold fails only on CRITICAL', () => {
    expect(shouldFail('CRITICAL', 'CRITICAL')).toBe(true);
    expect(shouldFail('HIGH', 'CRITICAL')).toBe(false);
    expect(shouldFail('MEDIUM', 'CRITICAL')).toBe(false);
    expect(shouldFail('LOW', 'CRITICAL')).toBe(false);
  });

  test('HIGH threshold fails on CRITICAL and HIGH', () => {
    expect(shouldFail('CRITICAL', 'HIGH')).toBe(true);
    expect(shouldFail('HIGH', 'HIGH')).toBe(true);
    expect(shouldFail('MEDIUM', 'HIGH')).toBe(false);
    expect(shouldFail('LOW', 'HIGH')).toBe(false);
  });

  test('MEDIUM threshold fails on CRITICAL, HIGH, and MEDIUM', () => {
    expect(shouldFail('CRITICAL', 'MEDIUM')).toBe(true);
    expect(shouldFail('HIGH', 'MEDIUM')).toBe(true);
    expect(shouldFail('MEDIUM', 'MEDIUM')).toBe(true);
    expect(shouldFail('LOW', 'MEDIUM')).toBe(false);
  });
});
