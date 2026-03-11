/**
 * ============================================================================
 * Unit Tests - Number Utilities
 * ============================================================================
 * Tests all functions from number_utils.js
 * Location: www/js/util/values/number_utils.js
 * ============================================================================
 */

const {
  stringToInt, stringToFloat,
  valueIsNumber, stringIsNumber,
} = require('@util/values/number_utils.js');

describe('number_utils', () => {

  // ==========================================================================
  // stringToInt
  // ==========================================================================

  describe('stringToInt', () => {

    test('converts "42" to 42', () => {
      expect(stringToInt('42')).toBe(42);
    });

    test('converts "0" to 0', () => {
      expect(stringToInt('0')).toBe(0);
    });

    test('converts negative string "-5" to -5', () => {
      expect(stringToInt('-5')).toBe(-5);
    });

    test('truncates decimal part: "3.9" → 3', () => {
      expect(stringToInt('3.9')).toBe(3);
    });

    test('truncates decimal part: "3.1" → 3', () => {
      expect(stringToInt('3.1')).toBe(3);
    });

    test('returns 0 for a non-numeric string', () => {
      expect(stringToInt('abc')).toBe(0);
    });

    test('parses leading number in mixed string "42abc"', () => {
      // parseInt('42abc') => 42
      expect(stringToInt('42abc')).toBe(42);
    });

    test('returns a number (not a string)', () => {
      expect(typeof stringToInt('7')).toBe('number');
    });
  });

  // ==========================================================================
  // stringToFloat
  // ==========================================================================

  describe('stringToFloat', () => {

    test('converts "3.14" to 3.14', () => {
      expect(stringToFloat('3.14')).toBeCloseTo(3.14);
    });

    test('converts "0" to 0', () => {
      expect(stringToFloat('0')).toBe(0);
    });

    test('converts integer string "5" to 5.0', () => {
      expect(stringToFloat('5')).toBe(5);
    });

    test('converts negative float "-1.5" to -1.5', () => {
      expect(stringToFloat('-1.5')).toBeCloseTo(-1.5);
    });

    test('returns 0 for a non-numeric string', () => {
      expect(stringToFloat('hello')).toBe(0);
    });

    test('returns a number (not a string)', () => {
      expect(typeof stringToFloat('3.14')).toBe('number');
    });
  });

  // ==========================================================================
  // valueIsNumber
  // ==========================================================================

  describe('valueIsNumber', () => {

    test('returns true for a positive integer', () => {
      expect(valueIsNumber(42)).toBe(true);
    });

    test('returns true for 0', () => {
      expect(valueIsNumber(0)).toBe(true);
    });

    test('returns true for a negative integer', () => {
      expect(valueIsNumber(-10)).toBe(true);
    });

    test('returns true for a float', () => {
      expect(valueIsNumber(3.14)).toBe(true);
    });

    test('returns false for NaN', () => {
      expect(valueIsNumber(NaN)).toBe(false);
    });

    test('returns false for Infinity', () => {
      expect(valueIsNumber(Infinity)).toBe(false);
    });

    test('returns false for -Infinity', () => {
      expect(valueIsNumber(-Infinity)).toBe(false);
    });

    test('returns false for a numeric string', () => {
      expect(valueIsNumber('42')).toBe(false);
    });

    test('returns false for null', () => {
      expect(valueIsNumber(null)).toBe(false);
    });

    test('returns false for undefined', () => {
      expect(valueIsNumber(undefined)).toBe(false);
    });

    test('returns false for a boolean', () => {
      expect(valueIsNumber(true)).toBe(false);
    });
  });

  // ==========================================================================
  // stringIsNumber
  // ==========================================================================

  describe('stringIsNumber', () => {

    test('returns true for "42"', () => {
      expect(stringIsNumber('42')).toBe(true);
    });

    test('returns true for "0"', () => {
      expect(stringIsNumber('0')).toBe(true);
    });

    test('returns true for "3.14"', () => {
      expect(stringIsNumber('3.14')).toBe(true);
    });

    test('returns true for a mixed string containing a digit "abc1"', () => {
      // isNum uses /\d/.test(v) which finds any digit
      expect(stringIsNumber('abc1')).toBe(true);
    });

    test('returns false for a pure alpha string "abc"', () => {
      expect(stringIsNumber('abc')).toBe(false);
    });

    test('returns false for an empty string', () => {
      expect(stringIsNumber('')).toBe(false);
    });

    test('returns false for an array (uses Array.isArray guard)', () => {
      expect(stringIsNumber([1, 2, 3])).toBe(false);
    });
  });
});
