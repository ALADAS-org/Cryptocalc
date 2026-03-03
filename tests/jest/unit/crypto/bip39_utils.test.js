/**
 * ============================================================================
 * Unit Tests - BIP39 Utilities
 * ============================================================================
 * Tests the BIP39 utility functions for mnemonic phrase generation and 
 * entropy handling
 * Location: www/js/crypto/bip39_utils.js
 * Note: Console.log suppression is configured globally in setup.js
 * ============================================================================
 */

// Import required modules
const { Bip39Utils } = require('@crypto/bip39_utils.js');

// Import PrettyLog and log mode constant to disable console.log from production code
const { PrettyLog, UNIT_TESTS_LOG_MODE } = require('@util/log/log_utils.js');

// Import wallet property constants
const { 
  CHECKSUM,
  ENTROPY_HEX,
  UUID
} = require('@crypto/const_wallet.js');

// Import keyword constants
const { 
  BLOCKCHAIN,
  LANG, MNEMONICS, WORD_COUNT,
  ACCOUNT, ADDRESS_INDEX
} = require('@www/js/const_keywords.js');

// Import blockchain constants
const {
  BITCOIN, ETHEREUM, MAINNET
} = require('@crypto/const_blockchains.js');

describe('BIP39 Utilities', () => {

  // Test data - well-known BIP39 reference vectors
  const TEST_ENTROPY_128  = "00000000000000000000000000000000";          // 12 words
  const TEST_ENTROPY_256  = "a".repeat(64);                               // 24 words
  const TEST_ENTROPY_160  = "b".repeat(40);                               // 15 words
  const TEST_ENTROPY_192  = "c".repeat(48);                               // 18 words
  const TEST_ENTROPY_224  = "d".repeat(56);                               // 21 words

  const TEST_MNEMONICS_12 = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
  const TEST_MNEMONICS_ALT = "much bottom such hurt hunt welcome cushion erosion pulse admit name deer";

  beforeAll(() => {
    // Disable console.log from pretty_log() calls in production code
    PrettyLog.This.logMode = UNIT_TESTS_LOG_MODE;
  });

  // ==========================================================================
  // EntropyToMnemonics TESTS
  // ==========================================================================

  describe('EntropyToMnemonics', () => {

    test('generates 12-word mnemonic from 128-bit (32 hex chars) entropy', () => {
      const mnemonics = Bip39Utils.EntropyToMnemonics(TEST_ENTROPY_128);

      expect(mnemonics).toBeDefined();
      expect(typeof mnemonics).toBe('string');
      const words = mnemonics.trim().split(' ');
      expect(words.length).toBe(12);
    });

    test('generates 24-word mnemonic from 256-bit (64 hex chars) entropy', () => {
      const mnemonics = Bip39Utils.EntropyToMnemonics(TEST_ENTROPY_256);

      expect(mnemonics).toBeDefined();
      const words = mnemonics.trim().split(' ');
      expect(words.length).toBe(24);
    });

    test('generates 15-word mnemonic from 160-bit (40 hex chars) entropy', () => {
      const mnemonics = Bip39Utils.EntropyToMnemonics(TEST_ENTROPY_160);

      expect(mnemonics).toBeDefined();
      const words = mnemonics.trim().split(' ');
      expect(words.length).toBe(15);
    });

    test('generates 18-word mnemonic from 192-bit (48 hex chars) entropy', () => {
      const mnemonics = Bip39Utils.EntropyToMnemonics(TEST_ENTROPY_192);

      expect(mnemonics).toBeDefined();
      const words = mnemonics.trim().split(' ');
      expect(words.length).toBe(18);
    });

    test('generates 21-word mnemonic from 224-bit (56 hex chars) entropy', () => {
      const mnemonics = Bip39Utils.EntropyToMnemonics(TEST_ENTROPY_224);

      expect(mnemonics).toBeDefined();
      const words = mnemonics.trim().split(' ');
      expect(words.length).toBe(21);
    });

    test('is deterministic - same entropy always produces same mnemonics', () => {
      const mnemonics1 = Bip39Utils.EntropyToMnemonics(TEST_ENTROPY_128);
      const mnemonics2 = Bip39Utils.EntropyToMnemonics(TEST_ENTROPY_128);

      expect(mnemonics1).toBe(mnemonics2);
    });

    test('generates different mnemonics for different entropy inputs', () => {
      const mnemonics1 = Bip39Utils.EntropyToMnemonics(TEST_ENTROPY_128);
      const mnemonics2 = Bip39Utils.EntropyToMnemonics(TEST_ENTROPY_256);

      expect(mnemonics1).not.toBe(mnemonics2);
    });

    test('defaults to English when lang is undefined', () => {
      const mnemonics = Bip39Utils.EntropyToMnemonics(TEST_ENTROPY_128, undefined);
      const words = mnemonics.trim().split(' ');

      // All words should be found in the English BIP39 dictionary
      const dict = Bip39Utils.GetBIP39Dictionary('EN');
      words.forEach(word => {
        expect(dict.indexOf(word)).toBeGreaterThan(-1);
      });
    });

    test('generates French mnemonics when lang is FR', () => {
      const mnemonics = Bip39Utils.EntropyToMnemonics(TEST_ENTROPY_128, 'FR');
      const words = mnemonics.trim().split(' ');
      const dict = Bip39Utils.GetBIP39Dictionary('FR');

      words.forEach(word => {
        expect(dict.indexOf(word)).toBeGreaterThan(-1);
      });
    });

    test('throws an error when entropy is undefined', () => {
      expect(() => {
        Bip39Utils.EntropyToMnemonics(undefined);
      }).toThrow();
    });

    test('throws an error when entropy is empty string', () => {
      expect(() => {
        Bip39Utils.EntropyToMnemonics("");
      }).toThrow();
    });

    test('all generated words are valid English BIP39 words', () => {
      const mnemonics = Bip39Utils.EntropyToMnemonics(TEST_ENTROPY_256);
      const words = mnemonics.trim().split(' ');
      const dict = Bip39Utils.GetBIP39Dictionary('EN');

      words.forEach(word => {
        expect(dict.indexOf(word)).toBeGreaterThan(-1);
      });
    });
  });

  // ==========================================================================
  // EntropyToChecksum TESTS
  // ==========================================================================

  describe('EntropyToChecksum', () => {

    test('returns a binary string for 128-bit entropy (12 words => 4 checksum bits)', () => {
      const checksum = Bip39Utils.EntropyToChecksum(TEST_ENTROPY_128);

      expect(checksum).toBeDefined();
      expect(typeof checksum).toBe('string');
      expect(checksum).toMatch(/^[01]+$/);
      expect(checksum).toHaveLength(4);
    });

    test('returns 5 checksum bits for 160-bit entropy (15 words)', () => {
      const checksum = Bip39Utils.EntropyToChecksum(TEST_ENTROPY_160);

      expect(checksum).toHaveLength(5);
    });

    test('returns 6 checksum bits for 192-bit entropy (18 words)', () => {
      const checksum = Bip39Utils.EntropyToChecksum(TEST_ENTROPY_192);

      expect(checksum).toHaveLength(6);
    });

    test('returns 7 checksum bits for 224-bit entropy (21 words)', () => {
      const checksum = Bip39Utils.EntropyToChecksum(TEST_ENTROPY_224);

      expect(checksum).toHaveLength(7);
    });

    test('returns 8 checksum bits for 256-bit entropy (24 words)', () => {
      const checksum = Bip39Utils.EntropyToChecksum(TEST_ENTROPY_256);

      expect(checksum).toHaveLength(8);
    });

    test('is deterministic - same entropy always returns same checksum', () => {
      const checksum1 = Bip39Utils.EntropyToChecksum(TEST_ENTROPY_128);
      const checksum2 = Bip39Utils.EntropyToChecksum(TEST_ENTROPY_128);

      expect(checksum1).toBe(checksum2);
    });

    test('returns different checksum for different entropy', () => {
      const checksum1 = Bip39Utils.EntropyToChecksum(TEST_ENTROPY_128);
      const checksum2 = Bip39Utils.EntropyToChecksum("ffffffffffffffffffffffffffffffff");

      expect(checksum1).not.toBe(checksum2);
    });
  });

  // ==========================================================================
  // GetChecksumBitCount TESTS
  // ==========================================================================

  describe('GetChecksumBitCount', () => {

    const cases = [
      { word_count: 12, expected: 4 },
      { word_count: 15, expected: 5 },
      { word_count: 18, expected: 6 },
      { word_count: 21, expected: 7 },
      { word_count: 24, expected: 8 }
    ];

    test.each(cases)(
      'returns $expected checksum bits for $word_count words',
      ({ word_count, expected }) => {
        expect(Bip39Utils.GetChecksumBitCount(word_count)).toBe(expected);
      }
    );

    test('defaults to 4 bits when word_count is undefined', () => {
      expect(Bip39Utils.GetChecksumBitCount(undefined)).toBe(4);
    });

    test('defaults to 4 bits for unknown word_count', () => {
      expect(Bip39Utils.GetChecksumBitCount(99)).toBe(4);
    });
  });

  // ==========================================================================
  // MnemonicsToEntropyInfo TESTS
  // ==========================================================================

  describe('MnemonicsToEntropyInfo', () => {

    test('returns an object with ENTROPY_HEX and CHECKSUM keys', () => {
      const info = Bip39Utils.MnemonicsToEntropyInfo(TEST_MNEMONICS_12);

      expect(info).toBeDefined();
      expect(info[ENTROPY_HEX]).toBeDefined();
      expect(info[CHECKSUM]).toBeDefined();
    });

    test('returns a valid hex string for ENTROPY_HEX', () => {
      const info = Bip39Utils.MnemonicsToEntropyInfo(TEST_MNEMONICS_12);

      expect(info[ENTROPY_HEX]).toMatch(/^[0-9a-f]+$/i);
    });

    test('ENTROPY_HEX is 32 hex chars (128 bits) for 12-word mnemonics', () => {
      const info = Bip39Utils.MnemonicsToEntropyInfo(TEST_MNEMONICS_12);

      expect(info[ENTROPY_HEX]).toHaveLength(32);
    });

    test('CHECKSUM is a binary string', () => {
      const info = Bip39Utils.MnemonicsToEntropyInfo(TEST_MNEMONICS_12);

      expect(info[CHECKSUM]).toMatch(/^[01]+$/);
    });

    test('round-trip: entropy -> mnemonics -> entropy returns same entropy hex', () => {
      const original_entropy = TEST_ENTROPY_128;
      const mnemonics        = Bip39Utils.EntropyToMnemonics(original_entropy);
      const info             = Bip39Utils.MnemonicsToEntropyInfo(mnemonics);

      expect(info[ENTROPY_HEX]).toBe(original_entropy);
    });

    test('produces different entropy for different mnemonics', () => {
      const info1 = Bip39Utils.MnemonicsToEntropyInfo(TEST_MNEMONICS_12);
      const info2 = Bip39Utils.MnemonicsToEntropyInfo(TEST_MNEMONICS_ALT);

      expect(info1[ENTROPY_HEX]).not.toBe(info2[ENTROPY_HEX]);
    });

    test('uses default mnemonics when none provided', () => {
      const info = Bip39Utils.MnemonicsToEntropyInfo(undefined);

      expect(info).toBeDefined();
      expect(info[ENTROPY_HEX]).toBeDefined();
    });
  });

  // ==========================================================================
  // EntropySourceToEntropy TESTS
  // ==========================================================================

  describe('EntropySourceToEntropy', () => {

    test('returns a hex string from a non-hex entropy source string', () => {
      const entropy = Bip39Utils.EntropySourceToEntropy("my random source string");

      expect(entropy).toBeDefined();
      expect(entropy).toMatch(/^[0-9a-f]+$/i);
    });

    test('returns 32 hex chars for 12-word count (128 bits)', () => {
      const entropy = Bip39Utils.EntropySourceToEntropy("test source", { [WORD_COUNT]: 12 });

      expect(entropy).toHaveLength(32);
    });

    test('returns 40 hex chars for 15-word count (160 bits)', () => {
      const entropy = Bip39Utils.EntropySourceToEntropy("test source", { [WORD_COUNT]: 15 });

      expect(entropy).toHaveLength(40);
    });

    test('returns 48 hex chars for 18-word count (192 bits)', () => {
      const entropy = Bip39Utils.EntropySourceToEntropy("test source", { [WORD_COUNT]: 18 });

      expect(entropy).toHaveLength(48);
    });

    test('returns 56 hex chars for 21-word count (224 bits)', () => {
      const entropy = Bip39Utils.EntropySourceToEntropy("test source", { [WORD_COUNT]: 21 });

      expect(entropy).toHaveLength(56);
    });

    test('is deterministic - same source always returns same entropy', () => {
      const source  = "deterministic test source";
      const entropy1 = Bip39Utils.EntropySourceToEntropy(source);
      const entropy2 = Bip39Utils.EntropySourceToEntropy(source);

      expect(entropy1).toBe(entropy2);
    });

    test('passes through hex input unchanged when it has the correct bit count', () => {
      // 32 hex chars = 128 bits = correct for 12 words
      const entropy = Bip39Utils.EntropySourceToEntropy(TEST_ENTROPY_128, { [WORD_COUNT]: 12 });

      expect(entropy).toBe(TEST_ENTROPY_128);
    });
  });

  // ==========================================================================
  // EntropySourceToMnemonics TESTS
  // ==========================================================================

  describe('EntropySourceToMnemonics', () => {

    test('generates mnemonics from a string entropy source', () => {
      const mnemonics = Bip39Utils.EntropySourceToMnemonics("hello world");

      expect(mnemonics).toBeDefined();
      expect(typeof mnemonics).toBe('string');
      expect(mnemonics.trim().split(' ').length).toBeGreaterThan(0);
    });

    test('is deterministic - same source always produces same mnemonics', () => {
      const source     = "same source";
      const mnemonics1 = Bip39Utils.EntropySourceToMnemonics(source);
      const mnemonics2 = Bip39Utils.EntropySourceToMnemonics(source);

      expect(mnemonics1).toBe(mnemonics2);
    });

    test('generates 12-word mnemonics by default', () => {
      const mnemonics = Bip39Utils.EntropySourceToMnemonics("test");
      const words     = mnemonics.trim().split(' ');

      expect(words.length).toBe(12);
    });

    test('respects word_count option for 24 words', () => {
      const mnemonics = Bip39Utils.EntropySourceToMnemonics("test", { [WORD_COUNT]: 24 });
      const words     = mnemonics.trim().split(' ');

      expect(words.length).toBe(24);
    });

    test('generates different mnemonics for different sources', () => {
      const mnemonics1 = Bip39Utils.EntropySourceToMnemonics("source one");
      const mnemonics2 = Bip39Utils.EntropySourceToMnemonics("source two");

      expect(mnemonics1).not.toBe(mnemonics2);
    });
  });

  // ==========================================================================
  // GetWordIndexes TESTS
  // ==========================================================================

  describe('GetWordIndexes', () => {

    test('returns an array of word indexes for a 12-word mnemonic', () => {
      const indexes = Bip39Utils.GetWordIndexes(TEST_MNEMONICS_12);

      expect(Array.isArray(indexes)).toBe(true);
      expect(indexes.length).toBe(12);
    });

    test('each index is a string representation of a number', () => {
      const indexes = Bip39Utils.GetWordIndexes(TEST_MNEMONICS_12);

      indexes.forEach(idx => {
        expect(typeof idx).toBe('string');
        expect(Number.isNaN(parseInt(idx))).toBe(false);
      });
    });

    test('indexes are in the valid BIP39 range [0..2047]', () => {
      const indexes = Bip39Utils.GetWordIndexes(TEST_MNEMONICS_12);

      indexes.forEach(idx => {
        const n = parseInt(idx);
        expect(n).toBeGreaterThanOrEqual(0);
        expect(n).toBeLessThanOrEqual(2047);
      });
    });

    test('returns binary strings when word_index_base is Binary', () => {
      const indexes = Bip39Utils.GetWordIndexes(TEST_MNEMONICS_12, { word_index_base: "Binary" });

      indexes.forEach(idx => {
        expect(idx).toMatch(/^[01]{11}$/);
      });
    });

    test('produces correct index for known mnemonic word "abandon" (index 0)', () => {
      const indexes = Bip39Utils.GetWordIndexes(TEST_MNEMONICS_12);
      // "abandon abandon ..." => all first 11 indexes should be 0
      for (let i = 0; i < 11; i++) {
        expect(indexes[i]).toBe('0');
      }
    });

    test('is deterministic - same mnemonics always produce same indexes', () => {
      const indexes1 = Bip39Utils.GetWordIndexes(TEST_MNEMONICS_12);
      const indexes2 = Bip39Utils.GetWordIndexes(TEST_MNEMONICS_12);

      expect(indexes1).toEqual(indexes2);
    });
  });

  // ==========================================================================
  // WordIndexesToMnemonics TESTS
  // ==========================================================================

  describe('WordIndexesToMnemonics', () => {

    test('reconstructs mnemonics from word indexes', () => {
      const indexes    = Bip39Utils.GetWordIndexes(TEST_MNEMONICS_12);
      const mnemonics  = Bip39Utils.WordIndexesToMnemonics(indexes);

      expect(mnemonics).toBe(TEST_MNEMONICS_12);
    });

    test('round-trip: GetWordIndexes -> WordIndexesToMnemonics returns original mnemonics', () => {
      const indexes   = Bip39Utils.GetWordIndexes(TEST_MNEMONICS_ALT);
      const recovered = Bip39Utils.WordIndexesToMnemonics(indexes);

      expect(recovered).toBe(TEST_MNEMONICS_ALT);
    });

    test('returns an empty array for invalid word count', () => {
      const result = Bip39Utils.WordIndexesToMnemonics(['0', '1', '2']); // 3 words = invalid

      expect(result).toEqual([]);
    });

    test('returns an empty array when word_indexes is undefined', () => {
      const result = Bip39Utils.WordIndexesToMnemonics(undefined);

      expect(result).toEqual([]);
    });

    test('generates English mnemonics by default', () => {
      const indexes   = Bip39Utils.GetWordIndexes(TEST_MNEMONICS_12);
      const mnemonics = Bip39Utils.WordIndexesToMnemonics(indexes);
      const words     = mnemonics.trim().split(' ');
      const dict      = Bip39Utils.GetBIP39Dictionary('EN');

      words.forEach(word => {
        expect(dict.indexOf(word)).toBeGreaterThan(-1);
      });
    });
  });

  // ==========================================================================
  // GuessMnemonicsLang TESTS
  // ==========================================================================

  describe('GuessMnemonicsLang', () => {

    test('correctly identifies English mnemonics', () => {
      const lang = Bip39Utils.GuessMnemonicsLang(TEST_MNEMONICS_12);

      expect(lang).toBe('EN');
    });

    test('correctly identifies French mnemonics', () => {
      // Generate French mnemonics from known entropy
      const mnemonics_FR = Bip39Utils.EntropyToMnemonics(TEST_ENTROPY_128, 'FR');
      const lang         = Bip39Utils.GuessMnemonicsLang(mnemonics_FR);

      expect(lang).toBe('FR');
    });

    test('correctly identifies Spanish mnemonics', () => {
      const mnemonics_ES = Bip39Utils.EntropyToMnemonics(TEST_ENTROPY_128, 'ES');
      const lang         = Bip39Utils.GuessMnemonicsLang(mnemonics_ES);

      expect(lang).toBe('ES');
    });

    test('correctly identifies Portuguese mnemonics', () => {
      const mnemonics_PT = "agrupar jato bitola moderno ocupado ossada sedutor quente grisalho julho moto vagaroso";
      const lang         = Bip39Utils.GuessMnemonicsLang(mnemonics_PT);

      expect(lang).toBe('PT');
    });

    test('is consistent - same mnemonics always return the same language', () => {
      const lang1 = Bip39Utils.GuessMnemonicsLang(TEST_MNEMONICS_12);
      const lang2 = Bip39Utils.GuessMnemonicsLang(TEST_MNEMONICS_12);

      expect(lang1).toBe(lang2);
    });
  });

  // ==========================================================================
  // CheckMnemonics TESTS
  // ==========================================================================

  describe('CheckMnemonics', () => {

    test('returns true for a valid 12-word English mnemonic', () => {
      const result = Bip39Utils.CheckMnemonics(TEST_MNEMONICS_12, { [WORD_COUNT]: 12, [LANG]: 'EN' });

      expect(result).toBe(true);
    });

    test('returns false when word count does not match expected word count', () => {
      const result = Bip39Utils.CheckMnemonics(TEST_MNEMONICS_12, { [WORD_COUNT]: 24, [LANG]: 'EN' });

      expect(result).toBe(false);
    });

    test('returns false when mnemonics contain words not in the dictionary', () => {
      const invalid = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon INVALID_WORD";
      const result  = Bip39Utils.CheckMnemonics(invalid, { [WORD_COUNT]: 12, [LANG]: 'EN' });

      expect(result).toBe(false);
    });

    test('returns true for valid alternative 12-word mnemonics', () => {
      const result = Bip39Utils.CheckMnemonics(TEST_MNEMONICS_ALT, { [WORD_COUNT]: 12, [LANG]: 'EN' });

      expect(result).toBe(true);
    });

    test('uses default args (EN, 12 words) when args is undefined', () => {
      const result = Bip39Utils.CheckMnemonics(TEST_MNEMONICS_12, undefined);

      // Should not throw, and the valid 12-word EN mnemonic should pass
      expect(result).toBe(true);
    });
  });

  // ==========================================================================
  // MnemonicsAs4letter TESTS
  // ==========================================================================

  describe('MnemonicsAs4letter', () => {

    test('returns a single concatenated string', () => {
      const result = Bip39Utils.MnemonicsAs4letter(TEST_MNEMONICS_12);

      expect(typeof result).toBe('string');
    });

    test('length is 4 * word_count for 12-word mnemonic', () => {
      const result = Bip39Utils.MnemonicsAs4letter(TEST_MNEMONICS_12);

      // Each word contributes exactly 4 chars (or less if word < 4 chars, but BIP39 words are >= 3 chars)
      // "abandon" -> "Aban" (4 chars) * 12 = 48
      expect(result.length).toBe(48);
    });

    test('each 4-letter block starts with an uppercase letter', () => {
      const result = Bip39Utils.MnemonicsAs4letter(TEST_MNEMONICS_12);

      // Each block of 4 chars should start with an uppercase letter
      for (let i = 0; i < result.length; i += 4) {
        const firstChar = result[i];
        expect(firstChar).toMatch(/[A-Z]/);
      }
    });

    test('is deterministic', () => {
      const result1 = Bip39Utils.MnemonicsAs4letter(TEST_MNEMONICS_12);
      const result2 = Bip39Utils.MnemonicsAs4letter(TEST_MNEMONICS_12);

      expect(result1).toBe(result2);
    });

    test('generates different output for different mnemonics', () => {
      const result1 = Bip39Utils.MnemonicsAs4letter(TEST_MNEMONICS_12);
      const result2 = Bip39Utils.MnemonicsAs4letter(TEST_MNEMONICS_ALT);

      expect(result1).not.toBe(result2);
    });
  });

  // ==========================================================================
  // MnemonicsAsTwoParts TESTS
  // ==========================================================================

  describe('MnemonicsAsTwoParts', () => {

    test('returns an array of 2 elements', () => {
      const parts = Bip39Utils.MnemonicsAsTwoParts(TEST_MNEMONICS_12);

      expect(Array.isArray(parts)).toBe(true);
      expect(parts.length).toBe(2);
    });

    test('for 12 words: first part contains all mnemonics, second part is empty string', () => {
      const parts = Bip39Utils.MnemonicsAsTwoParts(TEST_MNEMONICS_12);

      expect(parts[0]).toBe(TEST_MNEMONICS_12);
      expect(parts[1]).toBe('');
    });

    test('for 24 words: splits into two equal halves of 12 words each', () => {
      const mnemonics_24 = Bip39Utils.EntropyToMnemonics(TEST_ENTROPY_256);
      const parts        = Bip39Utils.MnemonicsAsTwoParts(mnemonics_24);

      expect(parts[0].trim().split(' ').length).toBe(12);
      expect(parts[1].trim().split(' ').length).toBe(12);
    });

    test('for 18 words: splits into two halves of 9 words each', () => {
      const mnemonics_18 = Bip39Utils.EntropyToMnemonics(TEST_ENTROPY_192);
      const parts        = Bip39Utils.MnemonicsAsTwoParts(mnemonics_18);

      expect(parts[0].trim().split(' ').length).toBe(9);
      expect(parts[1].trim().split(' ').length).toBe(9);
    });

    test('returns "Null-MNEMONICS" string when mnemonics is undefined', () => {
      const result = Bip39Utils.MnemonicsAsTwoParts(undefined);

      expect(result).toBe('Null-MNEMONICS');
    });

    test('joining both parts recovers the original mnemonics for 24 words', () => {
      const mnemonics_24 = Bip39Utils.EntropyToMnemonics(TEST_ENTROPY_256);
      const parts        = Bip39Utils.MnemonicsAsTwoParts(mnemonics_24);
      const recovered    = (parts[0] + ' ' + parts[1]).trim();

      expect(recovered).toBe(mnemonics_24.trim());
    });
  });

  // ==========================================================================
  // GetBIP39Dictionary TESTS
  // ==========================================================================

  describe('GetBIP39Dictionary', () => {

    test('returns an array for English language', () => {
      const dict = Bip39Utils.GetBIP39Dictionary('EN');

      expect(Array.isArray(dict)).toBe(true);
    });

    test('English dictionary has exactly 2048 words', () => {
      const dict = Bip39Utils.GetBIP39Dictionary('EN');

      expect(dict.length).toBe(2048);
    });

    test('French dictionary has exactly 2048 words', () => {
      const dict = Bip39Utils.GetBIP39Dictionary('FR');

      expect(dict.length).toBe(2048);
    });

    test('Spanish dictionary has exactly 2048 words', () => {
      const dict = Bip39Utils.GetBIP39Dictionary('ES');

      expect(dict.length).toBe(2048);
    });

    test('defaults to English when lang is undefined', () => {
      const dictDefault = Bip39Utils.GetBIP39Dictionary(undefined);
      const dictEN      = Bip39Utils.GetBIP39Dictionary('EN');

      expect(dictDefault).toEqual(dictEN);
    });

    test('defaults to English for unknown language code', () => {
      const dictUnknown = Bip39Utils.GetBIP39Dictionary('XX');
      const dictEN      = Bip39Utils.GetBIP39Dictionary('EN');

      expect(dictUnknown).toEqual(dictEN);
    });

    const SUPPORTED_LANGS = ['EN', 'FR', 'ES', 'IT', 'CS', 'PT', 'JP', 'KO', 'SC', 'TC', 'DE', 'EO', 'RU', 'EL', 'LA'];

    test.each(SUPPORTED_LANGS)('dictionary for %s is not empty', (lang) => {
      const dict = Bip39Utils.GetBIP39Dictionary(lang);

      expect(dict).toBeDefined();
      expect(dict.length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // GetArgs TESTS
  // ==========================================================================

  describe('GetArgs', () => {

    test('returns an object with all default keys when called with undefined', () => {
      const args = Bip39Utils.GetArgs(undefined);

      expect(args).toBeDefined();
      expect(args[LANG]).toBe('EN');
      expect(args[WORD_COUNT]).toBe(12);
      expect(args[BLOCKCHAIN]).toBe(BITCOIN);
      expect(args[ADDRESS_INDEX]).toBe(0);
      expect(args[ACCOUNT]).toBe(0);
    });

    test('preserves explicitly provided values', () => {
      const input = {
        [LANG]:          'FR',
        [WORD_COUNT]:    24,
        [ADDRESS_INDEX]: 5,
        [ACCOUNT]:       2
      };

      const args = Bip39Utils.GetArgs(input);

      expect(args[LANG]).toBe('FR');
      expect(args[WORD_COUNT]).toBe(24);
      expect(args[ADDRESS_INDEX]).toBe(5);
      expect(args[ACCOUNT]).toBe(2);
    });

    test('fills in missing keys with defaults while keeping provided ones', () => {
      const input = { [LANG]: 'ES' };
      const args  = Bip39Utils.GetArgs(input);

      expect(args[LANG]).toBe('ES');
      expect(args[WORD_COUNT]).toBe(12);   // default
      expect(args[ACCOUNT]).toBe(0);       // default
    });

    test('generates a UUID when none is provided', () => {
      const args = Bip39Utils.GetArgs({});

      expect(args[UUID]).toBeDefined();
      expect(typeof args[UUID]).toBe('string');
      expect(args[UUID].length).toBeGreaterThan(0);
    });

    test('returns an object even when called with empty object', () => {
      const args = Bip39Utils.GetArgs({});

      expect(typeof args).toBe('object');
      expect(args[LANG]).toBe('EN');
    });
  });

  // ==========================================================================
  // PrivateKeyToMnemonics TESTS
  // ==========================================================================

  describe('PrivateKeyToMnemonics', () => {

    const VALID_PRIVATE_KEY = "0ed797c1da6515542acda6358045702a0a558be931cb0490ea7044e0c0311645";

    test('returns a string for a valid 32-byte private key', () => {
      const mnemonics = Bip39Utils.PrivateKeyToMnemonics(VALID_PRIVATE_KEY);

      expect(typeof mnemonics).toBe('string');
    });

    test('generates 24 words from a 32-byte private key', () => {
      const mnemonics = Bip39Utils.PrivateKeyToMnemonics(VALID_PRIVATE_KEY);
      const words     = mnemonics.trim().split(' ');

      expect(words.length).toBe(24);
    });

    test('is deterministic - same private key always produces same mnemonics', () => {
      const mnemonics1 = Bip39Utils.PrivateKeyToMnemonics(VALID_PRIVATE_KEY);
      const mnemonics2 = Bip39Utils.PrivateKeyToMnemonics(VALID_PRIVATE_KEY);

      expect(mnemonics1).toBe(mnemonics2);
    });

    test('returns an error string for a private key with wrong byte count', () => {
      const short_key = "deadbeef"; // only 4 bytes instead of 32
      const result    = Bip39Utils.PrivateKeyToMnemonics(short_key);

      expect(typeof result).toBe('string');
      expect(result).toMatch(/\*\*ERROR\*\*/);
    });

    test('returns an error string for non-hex input', () => {
      const result = Bip39Utils.PrivateKeyToMnemonics("not_a_hex_string_and_not_32_bytes_either");

      expect(typeof result).toBe('string');
      expect(result).toMatch(/\*\*ERROR\*\*/);
    });

    test('generates different mnemonics for different private keys', () => {
      const key2      = "1".repeat(64);
      const mnemonics1 = Bip39Utils.PrivateKeyToMnemonics(VALID_PRIVATE_KEY);
      const mnemonics2 = Bip39Utils.PrivateKeyToMnemonics(key2);

      expect(mnemonics1).not.toBe(mnemonics2);
    });
  });

  // ==========================================================================
  // CONSISTENCY AND ROUND-TRIP TESTS
  // ==========================================================================

  describe('Consistency and Round-trips', () => {

    test('full round-trip: entropy -> mnemonics -> entropy info -> same entropy', () => {
      const original_entropy = TEST_ENTROPY_128;
      const mnemonics        = Bip39Utils.EntropyToMnemonics(original_entropy);
      const info             = Bip39Utils.MnemonicsToEntropyInfo(mnemonics);

      expect(info[ENTROPY_HEX]).toBe(original_entropy);
    });

    test('full round-trip: entropy -> mnemonics -> word indexes -> mnemonics', () => {
      const mnemonics      = Bip39Utils.EntropyToMnemonics(TEST_ENTROPY_128);
      const indexes        = Bip39Utils.GetWordIndexes(mnemonics);
      const recovered      = Bip39Utils.WordIndexesToMnemonics(indexes);

      expect(recovered).toBe(mnemonics);
    });

    test('EntropyToMnemonics and EntropySourceToMnemonics are consistent for hex entropy of correct size', () => {
      const mnemonics1 = Bip39Utils.EntropyToMnemonics(TEST_ENTROPY_128);
      const mnemonics2 = Bip39Utils.EntropySourceToMnemonics(TEST_ENTROPY_128, { [WORD_COUNT]: 12 });

      expect(mnemonics1).toBe(mnemonics2);
    });

    test('CheckMnemonics validates mnemonics generated from entropy', () => {
      const mnemonics = Bip39Utils.EntropyToMnemonics(TEST_ENTROPY_256);
      const result    = Bip39Utils.CheckMnemonics(mnemonics, { [WORD_COUNT]: 24, [LANG]: 'EN' });

      expect(result).toBe(true);
    });

    test('GuessMnemonicsLang correctly identifies language of generated mnemonics', () => {
      const mnemonics_IT = Bip39Utils.EntropyToMnemonics(TEST_ENTROPY_128, 'IT');
      const lang         = Bip39Utils.GuessMnemonicsLang(mnemonics_IT);

      expect(lang).toBe('IT');
    });
  });

}); // BIP39 Utilities
