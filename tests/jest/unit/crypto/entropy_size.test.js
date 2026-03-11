/**
 * ============================================================================
 * Unit Tests - EntropySize
 * ============================================================================
 * Tests the EntropySize utility class
 * Location: www/js/crypto/entropy_size.js
 * ============================================================================
 */

const { EntropySize } = require('@crypto/entropy_size.js');
const { NULL_HEX, NULL_WORD_COUNT } = require('@crypto/const_wallet.js');

describe('EntropySize', () => {

  // ==========================================================================
  // GetBitCount
  // ==========================================================================

  describe('GetBitCount', () => {

    test.each([
      ['00'.repeat(16), 128],
      ['00'.repeat(20), 160],
      ['00'.repeat(24), 192],
      ['00'.repeat(28), 224],
      ['00'.repeat(32), 256],
    ])('returns %i bits for a %i-char hex string', (hex, expected) => {
      expect(EntropySize.GetBitCount(hex)).toBe(expected);
    });

    test('returns NULL_HEX for a non-hex string', () => {
      expect(EntropySize.GetBitCount('xyz')).toBe(NULL_HEX);
    });

    test('returns 0 for an empty string (isHexString("") is true, 0 chars * 4 = 0)', () => {
      expect(EntropySize.GetBitCount('')).toBe(0);
    });

    test('accepts uppercase hex', () => {
      const hex = 'AB'.repeat(16); // 128 bits
      expect(EntropySize.GetBitCount(hex)).toBe(128);
    });

    test('is proportional to hex string length (4 bits per char)', () => {
      const hex = 'a'.repeat(10);
      expect(EntropySize.GetBitCount(hex)).toBe(40);
    });
  });

  // ==========================================================================
  // GetWordCount
  // ==========================================================================

  describe('GetWordCount', () => {

    test.each([
      ['00'.repeat(16), 12],
      ['00'.repeat(20), 15],
      ['00'.repeat(24), 18],
      ['00'.repeat(28), 21],
      ['00'.repeat(32), 24],
    ])('returns %i words for %i-char hex entropy', (hex, expected) => {
      expect(EntropySize.GetWordCount(hex)).toBe(expected);
    });

    test('returns NULL_WORD_COUNT for invalid hex', () => {
      expect(EntropySize.GetWordCount('not-hex')).toBe(NULL_WORD_COUNT);
    });

    test('returns default word count (24) for empty string (0 bits → default case)', () => {
      expect(EntropySize.GetWordCount('')).toBe(24);
    });
  });

  // ==========================================================================
  // GetExpectedWordCount
  // ==========================================================================

  describe('GetExpectedWordCount', () => {

    test.each([
      [128, 12],
      [160, 15],
      [192, 18],
      [224, 21],
      [256, 24],
    ])('maps %i bits → %i words', (bits, words) => {
      expect(EntropySize.GetExpectedWordCount(bits)).toBe(words);
    });

    test('returns 24 for unknown entropy size (default case)', () => {
      expect(EntropySize.GetExpectedWordCount(999)).toBe(24);
    });

    test('returns 24 for entropy size 0', () => {
      expect(EntropySize.GetExpectedWordCount(0)).toBe(24);
    });
  });

  // ==========================================================================
  // GetExpectedByteCount
  // ==========================================================================

  describe('GetExpectedByteCount', () => {

    test.each([
      [128, 16],
      [160, 20],
      [192, 24],
      [224, 28],
      [256, 32],
    ])('maps %i bits → %i bytes', (bits, bytes) => {
      expect(EntropySize.GetExpectedByteCount(bits)).toBe(bytes);
    });

    test('returns 32 for unknown entropy size (default case)', () => {
      expect(EntropySize.GetExpectedByteCount(0)).toBe(32);
    });

    test('byte count * 8 equals bit count', () => {
      [128, 160, 192, 224, 256].forEach(bits => {
        expect(EntropySize.GetExpectedByteCount(bits) * 8).toBe(bits);
      });
    });
  });

  // ==========================================================================
  // GetChecksumBitCount
  // ==========================================================================

  describe('GetChecksumBitCount', () => {

    test.each([
      [12, 4],
      [15, 5],
      [18, 6],
      [21, 7],
      [24, 8],
    ])('returns %i checksum bits for %i words', (words, bits) => {
      expect(EntropySize.GetChecksumBitCount(words)).toBe(bits);
    });

    test('defaults to 4 bits when word_count is undefined', () => {
      expect(EntropySize.GetChecksumBitCount(undefined)).toBe(4);
    });

    test('returns 8 for unknown word count (default case)', () => {
      expect(EntropySize.GetChecksumBitCount(99)).toBe(8);
    });

    test('checksum increases with word count', () => {
      const counts = [12, 15, 18, 21, 24];
      const bits = counts.map(c => EntropySize.GetChecksumBitCount(c));
      for (let i = 1; i < bits.length; i++) {
        expect(bits[i]).toBeGreaterThan(bits[i - 1]);
      }
    });
  });

  // ==========================================================================
  // GetSHA256Substring
  // ==========================================================================

  describe('GetSHA256Substring', () => {

    const SHA256 = 'a'.repeat(64); // 64 hex chars

    test.each([
      [12, 32],
      [15, 40],
      [18, 48],
      [21, 56],
      [24, 64],
    ])('returns substring of length %i for word_count=%i', (words, len) => {
      expect(EntropySize.GetSHA256Substring(SHA256, words)).toHaveLength(len);
    });

    test('returns a prefix of the original SHA256 for 12 words', () => {
      const result = EntropySize.GetSHA256Substring(SHA256, 12);
      expect(SHA256.startsWith(result)).toBe(true);
    });

    test('returns the full SHA256 for 24 words', () => {
      expect(EntropySize.GetSHA256Substring(SHA256, 24)).toBe(SHA256);
    });
  });

  // ==========================================================================
  // Cohérence inter-méthodes
  // ==========================================================================

  describe('Cohérence inter-méthodes', () => {

    test('GetWordCount is consistent with GetExpectedWordCount', () => {
      const hex = 'ab'.repeat(32); // 256 bits
      const wordCount = EntropySize.GetWordCount(hex);
      const bitCount  = EntropySize.GetBitCount(hex);
      expect(wordCount).toBe(EntropySize.GetExpectedWordCount(bitCount));
    });

    test('GetExpectedByteCount * 2 matches hex string length for all sizes', () => {
      [128, 160, 192, 224, 256].forEach(bits => {
        const byteCount = EntropySize.GetExpectedByteCount(bits);
        const hex = '0'.repeat(byteCount * 2);
        expect(EntropySize.GetBitCount(hex)).toBe(bits);
      });
    });

    test('GetWordCount and GetExpectedWordCount agree for all standard entropy sizes', () => {
      [128, 160, 192, 224, 256].forEach(bits => {
        const byteCount = EntropySize.GetExpectedByteCount(bits);
        const hex = '0'.repeat(byteCount * 2);
        expect(EntropySize.GetWordCount(hex))
          .toBe(EntropySize.GetExpectedWordCount(bits));
      });
    });
  });
});
