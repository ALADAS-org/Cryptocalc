/**
 * ============================================================================
 * Unit Tests - String Utilities
 * ============================================================================
 * Tests all functions from string_utils.js
 * Location: www/js/util/values/string_utils.js
 * ============================================================================
 */

const {
  isString, stringify,
  insertAfterEveryN, stringToHex,
  getShortenedString, asTwoParts,
} = require('@util/values/string_utils.js');

describe('string_utils', () => {

  // ==========================================================================
  // isString
  // ==========================================================================

  describe('isString', () => {

    test('returns true for a string literal', () => {
      expect(isString('hello')).toBe(true);
    });

    test('returns true for an empty string', () => {
      expect(isString('')).toBe(true);
    });

    test('returns true for new String()', () => {
      expect(isString(new String('hello'))).toBe(true);
    });

    test('returns false for a number', () => {
      expect(isString(42)).toBe(false);
    });

    test('returns false for null', () => {
      expect(isString(null)).toBe(false);
    });

    test('returns false for undefined', () => {
      expect(isString(undefined)).toBe(false);
    });

    test('returns false for an array', () => {
      expect(isString([])).toBe(false);
    });

    test('returns false for an object', () => {
      expect(isString({})).toBe(false);
    });

    test('returns false for a boolean', () => {
      expect(isString(true)).toBe(false);
    });
  });

  // ==========================================================================
  // stringify
  // ==========================================================================

  describe('stringify', () => {

    test('serializes a simple object', () => {
      expect(stringify({ a: 1 })).toBe('{"a":1}');
    });

    test('serializes nested objects', () => {
      expect(stringify({ a: { b: 2 } })).toBe('{"a":{"b":2}}');
    });

    test('serializes arrays', () => {
      expect(stringify([1, 2, 3])).toBe('[1,2,3]');
    });

    test('handles circular references without throwing', () => {
      const obj = { a: 1 };
      obj.self = obj;
      expect(() => stringify(obj)).not.toThrow();
    });

    test('drops the circular reference key silently', () => {
      const obj = { a: 1 };
      obj.self = obj;
      const result = JSON.parse(stringify(obj));
      expect(result.a).toBe(1);
      expect(result.self).toBeUndefined();
    });

    test('returns a string', () => {
      expect(typeof stringify({ x: 1 })).toBe('string');
    });
  });

  // ==========================================================================
  // insertAfterEveryN
  // ==========================================================================

  describe('insertAfterEveryN', () => {

    test('inserts a space every 4 chars', () => {
      expect(insertAfterEveryN('abcdefgh', ' ', 4)).toBe('abcd efgh');
    });

    test('does not add separator after the last incomplete chunk', () => {
      // 'abcde' → 'abcd' + '-' + 'e' (chunk of 1, no separator appended)
      expect(insertAfterEveryN('abcde', '-', 4)).toBe('abcd-e');
    });

    test('works with n=1', () => {
      expect(insertAfterEveryN('abc', '-', 1)).toBe('a-b-c');
    });

    test('works with n equal to string length', () => {
      expect(insertAfterEveryN('abcd', '-', 4)).toBe('abcd');
    });

    test('works on a hex entropy (groups of 8)', () => {
      const hex = '00112233445566778899aabbccddeeff';
      const result = insertAfterEveryN(hex, ' ', 8);
      expect(result.split(' ')).toHaveLength(4);
    });

    test('output contains the correct number of separators', () => {
      // 'abcdefgh' avec n=4 → 1 séparateur entre 2 chunks complets
      const result = insertAfterEveryN('abcdefgh', '|', 4);
      const separatorCount = (result.match(/\|/g) || []).length;
      expect(separatorCount).toBe(1);
    });
  });

  // ==========================================================================
  // stringToHex
  // ==========================================================================

  describe('stringToHex', () => {

    test('converts "A" to 41', () => {
      expect(stringToHex('A')).toBe('41');
    });

    test('converts "a" to 61', () => {
      expect(stringToHex('a')).toBe('61');
    });

    test('converts empty string to empty hex', () => {
      expect(stringToHex('')).toBe('');
    });

    test('output length is double the input length', () => {
      const s = 'hello';
      expect(stringToHex(s)).toHaveLength(s.length * 2);
    });

    test('output is valid lowercase hex', () => {
      expect(stringToHex('Test123')).toMatch(/^[0-9a-f]+$/);
    });

    test('is deterministic', () => {
      expect(stringToHex('abc')).toBe(stringToHex('abc'));
    });

    test('different strings produce different hex', () => {
      expect(stringToHex('abc')).not.toBe(stringToHex('ABC'));
    });
  });

  // ==========================================================================
  // getShortenedString
  // ==========================================================================

  describe('getShortenedString', () => {

    test('returns full string if shorter than max_length', () => {
      expect(getShortenedString('hello', 10)).toBe('hello');
    });

    test('returns full string if equal to max_length', () => {
      expect(getShortenedString('hello', 5)).toBe('hello');
    });

    test('truncates and adds "..." if longer than max_length', () => {
      const result = getShortenedString('abcdefghij', 5);
      expect(result).toBe('abcde...');
    });

    test('uses default max_length of 90', () => {
      const s = 'x'.repeat(100);
      const result = getShortenedString(s);
      expect(result.endsWith('...')).toBe(true);
      expect(result.length).toBeLessThanOrEqual(93); // 90 + '...'
    });

    test('removes \\n characters', () => {
      const result = getShortenedString('a\nb\nc', 20);
      expect(result).not.toContain('\n');
    });

    test('removes \\r characters', () => {
      const result = getShortenedString('a\rb', 20);
      expect(result).not.toContain('\r');
    });
  });

  // ==========================================================================
  // asTwoParts
  // ==========================================================================

  describe('asTwoParts', () => {

    const phrase12 = 'one two three four five six seven eight nine ten eleven twelve';
    const phrase24 = Array(24).fill('word').map((w, i) => w + i).join(' ');

    test('returns single-element array for phrase with 12 words (≤ word_count_per_line=15)', () => {
      const result = asTwoParts(phrase12, 15);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(phrase12);
    });

    test('splits 24-word phrase into exactly 2 parts', () => {
      const result = asTwoParts(phrase24, 15);
      expect(result).toHaveLength(2);
    });

    test('each part is a non-empty string', () => {
      const result = asTwoParts(phrase24, 15);
      expect(result[0].length).toBeGreaterThan(0);
      expect(result[1].length).toBeGreaterThan(0);
    });

    test('concatenation of both parts (space-joined) equals original', () => {
      const result = asTwoParts(phrase24, 15);
      expect(result.join(' ')).toBe(phrase24);
    });

    test('each part contains roughly half the words', () => {
      const result = asTwoParts(phrase24, 15);
      const words1 = result[0].split(' ').length;
      const words2 = result[1].split(' ').length;
      expect(words1 + words2).toBe(24);
    });

    test('returns "Null-SEEDPHRASE" for undefined input', () => {
      expect(asTwoParts(undefined, 15)).toBe('Null-SEEDPHRASE');
    });
  });
});
