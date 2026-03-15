/**
 * Tests for the GitHub Action's shouldFail function.
 *
 * Imports the real shouldFail from index.js to ensure the test
 * exercises the actual implementation, not a copy.
 */

// Mock @actions/core to prevent side effects when index.js is required
jest.mock('@actions/core', () => ({
  getInput: jest.fn(() => ''),
  setOutput: jest.fn(),
  setFailed: jest.fn(),
  info: jest.fn(),
}));

// Mock fs and the knowledge base require to prevent file-not-found errors
jest.mock('fs', () => ({
  existsSync: jest.fn(() => false),
  readFileSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

const { shouldFail } = require('../index');

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
