/**
 * ============================================================================
 * BIP39 sizes - characterization matrix
 * ============================================================================
 * Computes the outputs of EVERY function which maps a word count, an entropy
 * size or an entropy length to another BIP39 size, for normal AND abnormal
 * inputs (non standard word counts, strings like "12", '0x' prefix, invalid
 * entropy lengths...).
 *
 * The expected values ('tests/jest/fixtures/expected/bip39_sizes_baseline.json')
 * were captured on the code BEFORE the deduplication of the BIP39 size tables
 * (single source 'BIP39_SIZES' in const_wallet.js): the refactoring must not
 * change a single value.
 *
 * NB: the baseline also freezes current quirks on purpose (e.g. the '0x' prefix
 *     counted in the entropy size). Fixing them is a separate, explicit change.
 * ============================================================================
 */
const { Bip39Utils }  = require('@crypto/bip39_utils.js');
const { EntropySize } = require('@crypto/entropy_size.js');
const { WORD_COUNT }  = require('@www/js/const_keywords.js');
const { createMainGuiSandbox } = require('../../view/helpers/main_gui_sandbox.js');

const HEX64 = '37297b2455dbaa522dea2cd9a0be34ab488c8f00e0ef7085d73137e2b84c94db';

// Inputs (normal and abnormal)
const WORD_COUNTS   = [undefined, 0, 1, 3, 11, 12, 13, 14, 15, 16, 18, 20, 21, 22, 24, 25, 27, 30, '12', '24', 12.5, -3];
const ENTROPY_BITS  = [undefined, 0, 32, 64, 96, 120, 128, 136, 160, 168, 192, 200, 224, 232, 256, 264, 288, 512, '128', '256'];
const HEX_DIGITS    = [0, 30, 32, 34, 38, 40, 46, 48, 54, 56, 62, 64, 66];
const HEX_PREFIXES  = ['', '0x'];
const LANGS         = ['EN', 'FR'];
const SOURCE_WORD_COUNTS = [12, 15, 18, 21, 24, 13, '12', undefined];
const ENTROPY_SOURCES = {
  text:    'Fortune cookie: the early bird gets the worm',
  hex32:   HEX64.slice(0, 32),
  hex64:   HEX64,
  hex30:   HEX64.slice(0, 30),
  hex0x64: '0x' + HEX64,
};
const WORD_INDEXES_COUNTS = [0, 11, 12, 13, 15, 18, 21, 24, 25];
const VALID_HEX_DIGITS    = [32, 40, 48, 56, 64];

const key  = (value) => (value === undefined ? 'undefined' : JSON.stringify(value));
const safe = (fn) => { try { return fn(); } catch (e) { return 'EXCEPTION'; } };
const hexOfLength = (digits) => HEX64.padEnd(66, 'a').slice(0, digits);
const mapOf = (inputs, fn) => Object.fromEntries(inputs.map((input) => [key(input), fn(input)]));

// Returns { function_name: { input_key: output } }
const computeBip39SizesMatrix = () => {
  const result = {};

  result.ES_GetChecksumBitCount        = mapOf(WORD_COUNTS,  (w) => EntropySize.GetChecksumBitCount(w));
  result.B39_GetChecksumBitCount       = mapOf(WORD_COUNTS,  (w) => Bip39Utils.GetChecksumBitCount(w));
  result.B39_GetChecksumBitCountCustom = mapOf(WORD_COUNTS,  (w) => Bip39Utils.GetChecksumBitCountCustom(w));
  result.ES_GetExpectedWordCount       = mapOf(ENTROPY_BITS, (b) => EntropySize.GetExpectedWordCount(b));
  result.ES_GetExpectedByteCount       = mapOf(ENTROPY_BITS, (b) => EntropySize.GetExpectedByteCount(b));

  result.ES_GetSHA256Substring = {};
  result.ES_GetWordCount       = {};
  for (const prefix of HEX_PREFIXES) {
    for (const w of WORD_COUNTS) {
      result.ES_GetSHA256Substring[prefix + '|' + key(w)] = safe(() => EntropySize.GetSHA256Substring(prefix + HEX64, w));
    }
    for (const digits of HEX_DIGITS) {
      result.ES_GetWordCount[prefix + '|' + digits] = EntropySize.GetWordCount(prefix + hexOfLength(digits));
    }
  }

  result.B39_EntropyToChecksum = {};
  for (const lang of LANGS) result['B39_EntropyToMnemonics_' + lang] = {};
  for (const prefix of HEX_PREFIXES) {
    for (const digits of HEX_DIGITS.filter((d) => d > 0 && d <= 64)) {
      const hex = prefix + HEX64.slice(0, digits);
      result.B39_EntropyToChecksum[prefix + '|' + digits] = safe(() => Bip39Utils.EntropyToChecksum(hex));
      for (const lang of LANGS) {
        result['B39_EntropyToMnemonics_' + lang][prefix + '|' + digits] = safe(() => Bip39Utils.EntropyToMnemonics(hex, lang));
      }
    }
  }

  result.B39_EntropySourceToEntropy = {};
  for (const [name, source] of Object.entries(ENTROPY_SOURCES)) {
    for (const w of SOURCE_WORD_COUNTS) {
      const options = (w === undefined) ? undefined : { [WORD_COUNT]: w };
      result.B39_EntropySourceToEntropy[name + '|' + key(w)] = safe(() => Bip39Utils.EntropySourceToEntropy(source, options));
    }
  }

  result.B39_WordIndexesToMnemonics = {};
  for (const count of WORD_INDEXES_COUNTS) {
    const indexes = Array.from({ length: count }, (_, i) => (i * 137 + 5) % 2048);
    result.B39_WordIndexesToMnemonics[count] = safe(() => {
      const mnemonics = Bip39Utils.WordIndexesToMnemonics(indexes, 'EN');
      return Array.isArray(mnemonics) ? mnemonics.join('|') : mnemonics;
    });
  }

  result.B39_MnemonicsToEntropyInfo = {};
  for (const digits of VALID_HEX_DIGITS) {
    const mnemonics = Bip39Utils.EntropyToMnemonics(HEX64.slice(0, digits), 'EN');
    result.B39_MnemonicsToEntropyInfo[digits] = safe(() => JSON.stringify(Bip39Utils.MnemonicsToEntropyInfo(mnemonics, 'EN')));
  }

  // Renderer (main_gui.js) copies, evaluated in the GUI sandbox
  const { scope } = createMainGuiSandbox();
  result.GUI_getChecksumBitCount = mapOf(WORD_COUNTS,  (w) => scope.getChecksumBitCount(w));
  result.GUI_getWordCount        = mapOf(ENTROPY_BITS, (b) => scope.getWordCount(b));
  result.GUI_wordCount2BitsSize  = mapOf(WORD_COUNTS,  (w) => scope.wordCount2BitsSize(w));

  return result;
};

module.exports = { computeBip39SizesMatrix, HEX64 };
