/**
 * ============================================================================
 * Unit Tests - BIP85 Utilities
 * ============================================================================
 * Tests the BIP85 derivation (Deterministic Entropy From BIP32 Keychains)
 * Location: www/js/crypto/bip85_utils.js
 * Spec:     https://github.com/bitcoin/bips/blob/master/bip-0085.mediawiki
 *
 * Reference vectors:
 *   - BIP85 specification test vectors (master xprv)
 *   - Ian Coleman BIP39 (entropy -> BIP85 24 words), see www/js/crypto/test_bip85_debug.js
 * ============================================================================
 */

// ============================================================================
// IMPORTS
// ============================================================================

const { Bip85Utils } = require('@crypto/bip85_utils.js');
const bip39          = require('bip39');

// ============================================================================
// TEST FIXTURES
// ============================================================================

// ---- BIP85 specification test vectors ----
const SPEC_MASTER_XPRV =
  'xprv9s21ZrQH143K2LBWUUQRFXhucrQqBpKdRRxNVq2zBqsx8HVqFk2uYo8kmbaLLHRdqtQpUm98uKfu3vca1LqdGhUtyoFnCNkfmXRyPXLjbKb';

const SPEC_TEST_CASE_1_PATH    = "m/83696968'/0'/0'";
const SPEC_TEST_CASE_1_ENTROPY =
  'efecfbccffea313214232d29e71563d941229afb4338c21f9517c41aaa0d16f0'
  + '0b83d2a09ef747e7a64e8e2bd5a14869e693da66ce94ac2da570ab7ee48618f7';

const SPEC_TEST_CASE_2_PATH    = "m/83696968'/0'/1'";
const SPEC_TEST_CASE_2_ENTROPY =
  '70c6e3e8ebee8dc4c0dbba66076819bb8c09672527c4277ca8729532ad711872'
  + '218f826919f6b67218adde99018a6df9095ab2b58d803b5b93ec9802085a690e';

const LANGUAGE_ENGLISH = 0;

const SPEC_BIP39_VECTORS = [
  { words: 12,
    entropy:  '6250b68daf746d12a24d58b4787a714b',
    mnemonic: 'girl mad pet galaxy egg matter matrix prison refuse sense ordinary nose' },
  { words: 18,
    entropy:  '938033ed8b12698449d4bbca3c853c66b293ea1b1ce9d9dc',
    mnemonic: 'near account window bike charge season chef number sketch tomorrow excuse sniff '
            + 'circle vital hockey outdoor supply token' },
  { words: 24,
    entropy:  'ae131e2312cdc61331542efe0d1077bac5ea803adf24b313a4f0e48e9c51f37f',
    mnemonic: 'puppy ocean match cereal symbol another shed magic wrap hammer bulb intact gadget '
            + 'divorce twin tonight reason outdoor destroy simple truth cigar social volcano' },
];

const SPEC_WIF  = 'Kzyv4uF39d4Jrw2W7UryTHwZr1zQVNk4dAFyqE6BuMrMh1Za7uhp';
const SPEC_XPRV =
  'xprv9s21ZrQH143K2srSbCSg4m4kLvPMzcWydgmKEnMmoZUurYuBuYG46c6P71UGXMzmriLzCCBvKQWBUv3vPB3m1SATMhp3uEjXHJ42jFg7myX';
const SPEC_HEX_NUM_BYTES = 64;
const SPEC_HEX =
  '492db4698cf3b73a5a24998aa3e9d7fa96275d85724a91e71aa2d645442f8785'
  + '55d078fd1f1f67e368976f04137b1f7a0d19232136ca50c44614af72b5582a5c';

// ---- Ian Coleman BIP39 vector (Cryptocalc workflow: entropy -> BIP85) ----
const COLEMAN_INITIAL_ENTROPY  = '8a49b1a4b05dca8982a7d35a225093cecbd4d3b23c3f52517ec664434359bc4c';
const COLEMAN_INITIAL_MNEMONIC =
  'medal eternal hard gaze syrup dynamic appear whip focus barely ceiling outside '
  + 'run hawk similar margin false message ranch silk crouch proud van main';
const COLEMAN_BIP85_INDEX        = 0;
const COLEMAN_BIP85_ENTROPY_SIZE = 256;
const COLEMAN_BIP85_SEEDPHRASE   =
  'odor interest neither predict divorce lounge polar buyer task stumble unaware human '
  + 'reunion few alien glide time burst stadium rude midnight advice quote torch';

// ---- deriveToBip85Infos() parameters ----
const INITIAL_ENTROPY_128 = '00112233445566778899aabbccddeeff';
const VALID_ENTROPY_SIZES = [
  { size: 128, words: 12 },
  { size: 160, words: 15 },
  { size: 192, words: 18 },
  { size: 224, words: 21 },
  { size: 256, words: 24 },
];
const SPEC_BIP39_WORD_COUNTS = [ 12, 18, 24 ];
const INVALID_ENTROPY_SIZES = [ 0, 96, 100, 136, 288, 512, '256', null ]; // NB: 'undefined' => default 256
const INVALID_INDEXES       = [ -1, '0', null, NaN ];
const BIP85_MAX_INDEX       = 2147483647;
const HEX_DIGITS_PER_BYTE   = 2;
const BITS_PER_HEX_DIGIT    = 4;

// ============================================================================
// HELPERS
// ============================================================================

const U = () => Bip85Utils.This;

const wordCount = (mnemonic) => mnemonic.trim().split(/\s+/).length;

// ============================================================================
// TESTS
// ============================================================================

describe('Bip85Utils', () => {

  // --------------------------------------------------------------------------
  describe('Singleton', () => {
    test('getInstance() always returns the same instance', () => {
      expect(Bip85Utils.getInstance()).toBe(Bip85Utils.getInstance());
    });

    test("'This' getter returns the Singleton", () => {
      expect(Bip85Utils.This).toBe(Bip85Utils.getInstance());
    });

    test("'new Bip85Utils()' returns the Singleton", () => {
      expect(new Bip85Utils()).toBe(Bip85Utils.getInstance());
    });
  });

  // --------------------------------------------------------------------------
  describe('BIP85 specification test vectors', () => {
    test('test case 1: raw derivation', () => {
      const master = U().fromBase58(SPEC_MASTER_XPRV);
      expect(master.derive(SPEC_TEST_CASE_1_PATH)).toBe(SPEC_TEST_CASE_1_ENTROPY);
    });

    test('test case 2: raw derivation', () => {
      const master = U().fromBase58(SPEC_MASTER_XPRV);
      expect(master.derive(SPEC_TEST_CASE_2_PATH)).toBe(SPEC_TEST_CASE_2_ENTROPY);
    });

    test.each(SPEC_BIP39_VECTORS)('BIP39 application: $words words', ({ words, entropy, mnemonic }) => {
      const child = U().fromBase58(SPEC_MASTER_XPRV).deriveBIP39(LANGUAGE_ENGLISH, words, 0);
      expect(child.toEntropy()).toBe(entropy);
      expect(child.toMnemonic()).toBe(mnemonic);
      expect(U().deriveBIP39(SPEC_MASTER_XPRV, LANGUAGE_ENGLISH, words, 0)).toBe(mnemonic);
    });

    test('WIF application', () => {
      expect(U().deriveWIF(SPEC_MASTER_XPRV, 0)).toBe(SPEC_WIF);
    });

    test('XPRV application', () => {
      expect(U().deriveXPRV(SPEC_MASTER_XPRV, 0)).toBe(SPEC_XPRV);
    });

    test('HEX application', () => {
      expect(U().deriveHex(SPEC_MASTER_XPRV, SPEC_HEX_NUM_BYTES, 0)).toBe(SPEC_HEX);
    });
  });

  // --------------------------------------------------------------------------
  describe('Ian Coleman BIP39 vector (entropy -> BIP85)', () => {
    test('initial entropy -> initial mnemonic', () => {
      expect(bip39.entropyToMnemonic(COLEMAN_INITIAL_ENTROPY)).toBe(COLEMAN_INITIAL_MNEMONIC);
    });

    test('deriveToBip85Infos() gives the expected BIP85 seedphrase and entropy', () => {
      const infos = U().deriveToBip85Infos(COLEMAN_INITIAL_ENTROPY, COLEMAN_BIP85_INDEX, COLEMAN_BIP85_ENTROPY_SIZE);
      expect(infos.bip85_mnemonics).toBe(COLEMAN_BIP85_SEEDPHRASE);
      expect(infos.bip85_entropy).toBe(bip39.mnemonicToEntropy(COLEMAN_BIP85_SEEDPHRASE));
    });
  });

  // --------------------------------------------------------------------------
  describe('deriveToBip85Infos()', () => {
    test('returns index, entropy, mnemonics and entropy size', () => {
      const infos = U().deriveToBip85Infos(INITIAL_ENTROPY_128, 3, 256);
      expect(infos).toEqual({
        bip85_index:        3,
        bip85_entropy:      expect.any(String),
        bip85_mnemonics:    expect.any(String),
        bip85_entropy_size: 256,
      });
    });

    test.each(VALID_ENTROPY_SIZES)('entropy size $size bits -> $words words', ({ size, words }) => {
      const infos = U().deriveToBip85Infos(INITIAL_ENTROPY_128, 0, size);
      expect(infos.bip85_entropy).toMatch(/^[0-9a-f]+$/);
      expect(infos.bip85_entropy.length * BITS_PER_HEX_DIGIT).toBe(size);
      expect(wordCount(infos.bip85_mnemonics)).toBe(words);
      expect(bip39.validateMnemonic(infos.bip85_mnemonics)).toBe(true);
      expect(bip39.mnemonicToEntropy(infos.bip85_mnemonics)).toBe(infos.bip85_entropy);
    });

    // NB: the BIP85 spec BIP39 application only defines 12, 18 and 24 words
    //     (160 and 224 bits / 15 and 21 words are a Cryptocalc extension of deriveToBip85Infos())
    test('is consistent with the BIP39 application path (12, 18, 24 words)', () => {
      const index = 7;
      VALID_ENTROPY_SIZES.filter(({ words }) => SPEC_BIP39_WORD_COUNTS.includes(words)).forEach(({ size, words }) => {
        const infos = U().deriveToBip85Infos(INITIAL_ENTROPY_128, index, size);
        const child = U().fromEntropy(INITIAL_ENTROPY_128).deriveBIP39(LANGUAGE_ENGLISH, words, index);
        expect(infos.bip85_entropy).toBe(child.entropy);
      });
    });

    test('is deterministic', () => {
      const infos_1 = U().deriveToBip85Infos(INITIAL_ENTROPY_128, 5, 192);
      const infos_2 = U().deriveToBip85Infos(INITIAL_ENTROPY_128, 5, 192);
      expect(infos_2).toEqual(infos_1);
    });

    test('different index -> different BIP85 entropy', () => {
      const infos_0 = U().deriveToBip85Infos(INITIAL_ENTROPY_128, 0, 256);
      const infos_1 = U().deriveToBip85Infos(INITIAL_ENTROPY_128, 1, 256);
      expect(infos_1.bip85_entropy).not.toBe(infos_0.bip85_entropy);
    });

    test('different initial entropy -> different BIP85 entropy', () => {
      const infos_a = U().deriveToBip85Infos(INITIAL_ENTROPY_128, 0, 256);
      const infos_b = U().deriveToBip85Infos(COLEMAN_INITIAL_ENTROPY, 0, 256);
      expect(infos_b.bip85_entropy).not.toBe(infos_a.bip85_entropy);
    });

    test('BIP85 entropy is never the initial entropy', () => {
      const infos = U().deriveToBip85Infos(COLEMAN_INITIAL_ENTROPY, 0, 256);
      expect(infos.bip85_entropy).not.toBe(COLEMAN_INITIAL_ENTROPY);
    });

    test('accepts the maximum index (2^31 - 1)', () => {
      const infos = U().deriveToBip85Infos(INITIAL_ENTROPY_128, BIP85_MAX_INDEX, 128);
      expect(infos.bip85_index).toBe(BIP85_MAX_INDEX);
      expect(infos.bip85_entropy.length).toBe((128 / 8) * HEX_DIGITS_PER_BYTE);
    });

    test('default parameters: index 0, 256 bits', () => {
      expect(U().deriveToBip85Infos(INITIAL_ENTROPY_128))
        .toEqual(U().deriveToBip85Infos(INITIAL_ENTROPY_128, 0, 256));
    });

    test.each(INVALID_ENTROPY_SIZES)('throws on invalid entropy size: %p', (size) => {
      expect(() => U().deriveToBip85Infos(INITIAL_ENTROPY_128, 0, size)).toThrow(/entropy_size/);
    });

    test.each(INVALID_INDEXES)('throws on invalid index: %p', (index) => {
      expect(() => U().deriveToBip85Infos(INITIAL_ENTROPY_128, index, 256)).toThrow(/invalid index/);
    });

    test('throws on invalid initial entropy', () => {
      expect(() => U().deriveToBip85Infos('xyz', 0, 256)).toThrow();
    });
  });
});
