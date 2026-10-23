/**
 * ============================================================================
 * Unit tests - BIP39 sizes: characterization (no behavior change)
 * ============================================================================
 * Every function mapping a word count / entropy size / entropy length to another
 * BIP39 size must return EXACTLY the values captured before the deduplication
 * of the BIP39 size tables (see helpers/bip39_sizes_matrix.js).
 *
 * Fixture: tests/jest/fixtures/expected/bip39_sizes_baseline.json
 * ============================================================================
 */
const fs   = require('fs');
const path = require('path');

const { PrettyLog, UNIT_TESTS_LOG_MODE } = require('@util/log/log_utils.js');
const { computeBip39SizesMatrix } = require('./helpers/bip39_sizes_matrix.js');

const BASELINE_PATH = path.join(__dirname, '../../fixtures/expected/bip39_sizes_baseline.json');
const BASELINE      = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));

// Silence the application logs while computing the matrix
PrettyLog.This.logMode = UNIT_TESTS_LOG_MODE;
const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
const CURRENT = computeBip39SizesMatrix();
consoleSpy.mockRestore();

const CASES = Object.entries(BASELINE).flatMap(([fn_name, values]) =>
  Object.entries(values).map(([input, expected]) => [fn_name, input, expected]));

describe('BIP39 sizes - characterization against the baseline', () => {
  test('the baseline covers every function of the matrix', () => {
    expect(Object.keys(CURRENT).sort()).toEqual(Object.keys(BASELINE).sort());
  });

  test('the baseline is complete (360 captured values)', () => {
    expect(CASES.length).toBe(360);
  });

  test.each(CASES)('%s( %s ) unchanged', (fn_name, input, expected) => {
    expect(CURRENT[fn_name][input]).toEqual(expected);
  });
});
