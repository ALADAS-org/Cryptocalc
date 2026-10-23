/**
 * ============================================================================
 * Unit tests - BIP39 sizes: single source (www/js/crypto/const_wallet.js)
 * ============================================================================
 * - BIP39_SIZES is consistent with the BIP39 specification and with the
 *   'bip39' library
 * - getBip39Size() / getBip39WordCount() match strictly (like the former
 *   'switch' statements: "12" is not 12)
 * - the former hard-coded tables are gone and every former location uses the
 *   single source
 * - in the Renderer, const_wallet.js is loaded before every script using it
 * ============================================================================
 */
const fs    = require('fs');
const path  = require('path');
const bip39 = require('bip39');

const {
  BIP39_SIZES, BIP39_WORD_COUNTS, BIP39_ENTROPY_BIT_SIZES, getBip39Size, getBip39WordCount,
} = require('@crypto/const_wallet.js');

const WWW_DIR    = path.join(__dirname, '../../../../www');
const INDEX_HTML = path.join(WWW_DIR, 'index.html');
const HEX64      = '37297b2455dbaa522dea2cd9a0be34ab488c8f00e0ef7085d73137e2b84c94db';

const EXPECTED_WORD_COUNTS   = [12, 15, 18, 21, 24];
const EXPECTED_ENTROPY_SIZES = [128, 160, 192, 224, 256];
const BITS_PER_WORD          = 11;
const ENTROPY_BITS_PER_CHECKSUM_BIT = 32;

// Former locations of the hard-coded BIP39 size tables (relative to www/)
const FORMER_LOCATIONS = {
  'js/crypto/entropy_size.js':                                            ['getBip39Size', 'getBip39WordCount'],
  'js/crypto/bip39_utils.js':                                             ['getBip39Size'],
  'js/view/main_gui.js':                                                  ['getBip39Size', 'getBip39WordCount'],
  'vizjets/entropy_converter_dialog/entropy_converter_dialog.js':         ['BIP39_ENTROPY_BIT_SIZES', 'BIP39_WORD_COUNTS'],
  'vizjets/secret_phrase_translator_dialog/secret_phrase_translator_dialog.js': ['BIP39_WORD_COUNTS'],
  'js/crypto/entropy_source/draw_entropy_dice_d6.js':                     ['BIP39_ENTROPY_BIT_SIZES'],
};
const HARD_CODED_TABLE_PATTERNS = [
  /case\s+(12|15|18|21|24)\s*:/,                  // switch on a word count
  /case\s+(128|160|192|224|256)\s*:/,             // switch on an entropy size
  /128\s*,\s*160\s*,\s*192\s*,\s*224\s*,\s*256/,  // list of entropy sizes
  /==\s*12\s*\|\|[^\n]*==\s*15/,                  // list of word counts
];

// Renderer scripts which use the single source (must be loaded AFTER const_wallet.js)
const RENDERER_USERS = [
  'js/view/main_gui.js',
  'js/crypto/entropy_source/draw_entropy_dice_d6.js',
  'vizjets/entropy_converter_dialog/entropy_converter_dialog.js',
  'vizjets/secret_phrase_translator_dialog/secret_phrase_translator_dialog.js',
];

const activeCode = (file_path) => fs.readFileSync(file_path, 'utf8')
  .split('\n').filter((line) => ! line.trim().startsWith('//')).join('\n');

describe('BIP39_SIZES (single source)', () => {
  test('the 5 BIP39 word counts and entropy sizes', () => {
    expect([...BIP39_WORD_COUNTS]).toEqual(EXPECTED_WORD_COUNTS);
    expect([...BIP39_ENTROPY_BIT_SIZES]).toEqual(EXPECTED_ENTROPY_SIZES);
    expect(Object.keys(BIP39_SIZES).map(Number)).toEqual(EXPECTED_WORD_COUNTS);
  });

  test.each(EXPECTED_WORD_COUNTS)('%i words: entropy + checksum = 11 bits per word, checksum = entropy / 32', (words) => {
    const { entropy_bits, checksum_bits } = BIP39_SIZES[words];
    expect(entropy_bits + checksum_bits).toBe(words * BITS_PER_WORD);
    expect(checksum_bits).toBe(entropy_bits / ENTROPY_BITS_PER_CHECKSUM_BIT);
  });

  test.each(EXPECTED_WORD_COUNTS)('%i words: same word count as the bip39 library', (words) => {
    const entropy_hex = HEX64.slice(0, BIP39_SIZES[words].entropy_bits / 4);
    expect(bip39.entropyToMnemonic(entropy_hex).split(' ')).toHaveLength(words);
  });

  test('the table cannot be modified (frozen)', () => {
    expect(Object.isFrozen(BIP39_SIZES)).toBe(true);
    expect(Object.isFrozen(BIP39_SIZES[12])).toBe(true);
    expect(Object.isFrozen(BIP39_WORD_COUNTS)).toBe(true);
    expect(Object.isFrozen(BIP39_ENTROPY_BIT_SIZES)).toBe(true);
  });
});

describe('getBip39Size() / getBip39WordCount(): strict match', () => {
  test.each(EXPECTED_WORD_COUNTS)('getBip39Size(%i) is the table entry', (words) => {
    expect(getBip39Size(words)).toBe(BIP39_SIZES[words]);
  });

  test.each([undefined, null, 0, 11, 13, 25, 12.5, -12, '12', '24', NaN])('getBip39Size(%p) is undefined', (value) => {
    expect(getBip39Size(value)).toBeUndefined();
  });

  test.each(EXPECTED_ENTROPY_SIZES.map((bits, i) => [bits, EXPECTED_WORD_COUNTS[i]]))('getBip39WordCount(%i) = %i', (bits, words) => {
    expect(getBip39WordCount(bits)).toBe(words);
  });

  test.each([undefined, null, 0, 120, 136, 512, '128', '256'])('getBip39WordCount(%p) is undefined', (value) => {
    expect(getBip39WordCount(value)).toBeUndefined();
  });
});

describe('Former hard-coded tables are replaced by the single source', () => {
  test.each(Object.entries(FORMER_LOCATIONS))('%s: no hard-coded BIP39 size table, uses %p', (file, symbols) => {
    const code = activeCode(path.join(WWW_DIR, file));
    HARD_CODED_TABLE_PATTERNS.forEach((pattern) => expect(code).not.toMatch(pattern));
    symbols.forEach((symbol) => expect(code).toContain(symbol));
  });

  test('Renderer: const_wallet.js is loaded before every script using it', () => {
    const html = fs.readFileSync(INDEX_HTML, 'utf8');
    const position = (file) => html.indexOf('./' + file);
    expect(position('js/crypto/const_wallet.js')).toBeGreaterThan(-1);
    RENDERER_USERS.forEach((file) => {
      expect(position(file)).toBeGreaterThan(position('js/crypto/const_wallet.js'));
    });
  });
});
