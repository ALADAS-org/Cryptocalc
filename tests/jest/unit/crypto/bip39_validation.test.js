/**
 * ============================================================================
 * Unit tests - Secret phrase validation (plan 2.2)
 * ============================================================================
 * Bip39Utils.ValidateMnemonics( mnemonics, lang ) -> { valid, reason, word, position }
 * Bip39Utils.MnemonicsToEntropyInfo throws if the phrase is invalid
 * Bip39Utils.CheckMnemonics relies on the same validation
 *
 * Up to 0.5.34 the checksum was never checked, an unknown word gave the index -1
 * (wrong entropy), an index above 2047 shifted the following bits, an undefined
 * phrase was replaced by a hard-coded phrase, and 2 Cryptocalc wordlists lost data:
 *   - Greek: 10 pairs of words only differ by their accents (first one found won)
 *   - Latin: 2 words ended with a space
 * ============================================================================
 */
const crypto = require('crypto');
const bip39  = require('bip39');

const { PrettyLog, UNIT_TESTS_LOG_MODE } = require('@util/log/log_utils.js');
const { Bip39Utils, MNEMONICS_ERROR }    = require('@crypto/bip39_utils.js');
const { ENTROPY_HEX, BIP39_WORD_COUNTS, BIP39_SIZES } = require('@crypto/const_wallet.js');
const { LANG }                           = require('@www/js/const_keywords.js');

const SUPPORTED_LANGS = ['EN', 'DE', 'FR', 'ES', 'IT', 'CS', 'PT', 'JP', 'KO', 'SC', 'TC',
                         'EO', 'RU', 'LA', 'EL', 'HI', 'GU', 'BN'];
const WORDLIST_SIZE      = 2048;
const BITS_PER_HEX_DIGIT = 4;
const BITS_PER_BYTE      = 8;
const RANDOM_PHRASES_PER_LANG = 20;
const ALTERED_PHRASES_COUNT   = 1000;

// Official BIP39 test vectors (English)
const OFFICIAL_VECTORS = [
  { entropy: '00000000000000000000000000000000',
    mnemonics: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about' },
  { entropy: '7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f',
    mnemonics: 'legal winner thank year wave sausage worth useful legal winner thank yellow' },
  { entropy: '80808080808080808080808080808080',
    mnemonics: 'letter advice cage absurd amount doctor acoustic avoid letter advice cage above' },
  { entropy: 'ffffffffffffffffffffffffffffffff',
    mnemonics: 'zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo wrong' },
  { entropy: '000000000000000000000000000000000000000000000000',
    mnemonics: 'abandon '.repeat(17) + 'agent' },
  { entropy: '0000000000000000000000000000000000000000000000000000000000000000',
    mnemonics: 'abandon '.repeat(23) + 'art' },
  { entropy: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    mnemonics: 'zoo '.repeat(23) + 'vote' },
];
const ABANDON_ABOUT   = OFFICIAL_VECTORS[0].mnemonics;
const ABANDON_ZOO     = 'abandon '.repeat(11) + 'zoo';                       // wrong checksum
const UNKNOWN_WORD    = 'abuot';
const UNKNOWN_PHRASE  = ABANDON_ABOUT.replace(/ about$/, ' ' + UNKNOWN_WORD); // 12th word unknown
const ABANDON_ABOUT_INDEXES = '0 0 0 0 0 0 0 0 0 0 0 3';                     // 'about' = index 3

// Greek words which only differ by their accents (index in the Cryptocalc Greek wordlist)
const GREEK_POTE = { accented_1: 'ποτέ', index_1: 1468, accented_2: 'πότε', index_2: 1535, unaccented: 'ποτε' };

const randomEntropy  = (bits) => crypto.randomBytes(bits / BITS_PER_BYTE).toString('hex');
const entropyBitsOf  = (word_count) => BIP39_SIZES[word_count].entropy_bits;
const wordIndexes    = (phrase, lang) => phrase.split(' ').map((word) => Bip39Utils.LookupWordIndex(word, lang).index);
const removeAccents  = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '');

// Same entropy, last word with its lowest bit flipped: the lowest bit is always a checksum bit
const withWrongChecksum = (phrase, lang) => {
  const words = phrase.split(' ');
  const last  = Bip39Utils.LookupWordIndex(words[words.length - 1], lang).index;
  words[words.length - 1] = Bip39Utils.GetBIP39Dictionary(lang)[last ^ 1];
  return words.join(' ');
};

beforeAll(() => { PrettyLog.This.logMode = UNIT_TESTS_LOG_MODE; });

describe('ValidateMnemonics - official BIP39 vectors', () => {
  test.each(OFFICIAL_VECTORS)('$mnemonics', ({ entropy, mnemonics }) => {
    expect(bip39.entropyToMnemonic(entropy)).toBe(mnemonics); // the vector itself
    expect(Bip39Utils.ValidateMnemonics(mnemonics, 'EN')).toEqual({ valid: true });
    expect(Bip39Utils.MnemonicsToEntropyInfo(mnemonics, 'EN')[ENTROPY_HEX]).toBe(entropy);
  });

  test('a phrase given as word indexes is valid and gives the same entropy', () => {
    expect(Bip39Utils.ValidateMnemonics(ABANDON_ABOUT_INDEXES, 'EN')).toEqual({ valid: true });
    expect(Bip39Utils.MnemonicsToEntropyInfo(ABANDON_ABOUT_INDEXES, 'EN')[ENTROPY_HEX])
      .toBe(OFFICIAL_VECTORS[0].entropy);
  });
});

describe('ValidateMnemonics - reasons', () => {
  test("'abandon x11 zoo': CHECKSUM", () => {
    expect(Bip39Utils.ValidateMnemonics(ABANDON_ZOO, 'EN')).toEqual({ valid: false, reason: MNEMONICS_ERROR.CHECKSUM });
  });

  test('unknown word: UNKNOWN_WORD, with the word and its position (1 = first word)', () => {
    expect(Bip39Utils.ValidateMnemonics(UNKNOWN_PHRASE, 'EN'))
      .toEqual({ valid: false, reason: MNEMONICS_ERROR.UNKNOWN_WORD, word: UNKNOWN_WORD, position: 12 });
  });

  test.each(['2048', '5000'])('index %s: INDEX_OUT_OF_RANGE', (index) => {
    const phrase = ABANDON_ABOUT_INDEXES.replace(/^0 /, index + ' ');
    expect(Bip39Utils.ValidateMnemonics(phrase, 'EN'))
      .toEqual({ valid: false, reason: MNEMONICS_ERROR.INDEX_OUT_OF_RANGE, word: index, position: 1 });
  });

  test.each([1, 11, 13, 23, 25])('%i words: WORD_COUNT', (count) => {
    const phrase = Array(count).fill('abandon').join(' ');
    expect(Bip39Utils.ValidateMnemonics(phrase, 'EN')).toEqual({ valid: false, reason: MNEMONICS_ERROR.WORD_COUNT });
  });

  test.each([[''], [undefined], [null]])('no phrase (%p): WORD_COUNT', (phrase) => {
    expect(Bip39Utils.ValidateMnemonics(phrase, 'EN')).toEqual({ valid: false, reason: MNEMONICS_ERROR.WORD_COUNT });
  });

  test('the language defaults to English', () => {
    expect(Bip39Utils.ValidateMnemonics(ABANDON_ABOUT)).toEqual({ valid: true });
  });
});

describe('Every language', () => {
  // Guard of the Greek and Latin wordlists: every word gives back its own index
  test.each(SUPPORTED_LANGS)('%s: each of the 2048 words gives its own index', (lang) => {
    const wordlist = Bip39Utils.GetBIP39Dictionary(lang);
    expect(wordlist).toHaveLength(WORDLIST_SIZE);
    const wrong = wordlist.filter((word, index) => Bip39Utils.LookupWordIndex(word, lang).index !== index);
    expect(wrong).toEqual([]);
  });

  test.each(SUPPORTED_LANGS)('%s: no word contains a whitespace', (lang) => {
    expect(Bip39Utils.GetBIP39Dictionary(lang).filter((word) => /\s/.test(word))).toEqual([]);
  });

  test.each(SUPPORTED_LANGS)('%s: random entropy -> phrase -> valid, same entropy; wrong checksum detected', (lang) => {
    for (let i = 0; i < RANDOM_PHRASES_PER_LANG; i++) {
      const word_count = BIP39_WORD_COUNTS[i % BIP39_WORD_COUNTS.length];
      const entropy    = randomEntropy(entropyBitsOf(word_count));
      const phrase     = Bip39Utils.EntropyToMnemonics(entropy, lang);
      expect({ lang, entropy, result: Bip39Utils.ValidateMnemonics(phrase, lang) })
        .toEqual({ lang, entropy, result: { valid: true } });
      expect(Bip39Utils.MnemonicsToEntropyInfo(phrase, lang)[ENTROPY_HEX]).toBe(entropy);
      expect(Bip39Utils.ValidateMnemonics(withWrongChecksum(phrase, lang), lang).reason).toBe(MNEMONICS_ERROR.CHECKSUM);
    }
  });
});

describe('Accents', () => {
  test.each(['FR', 'ES'])('%s: phrases with and without accents are valid and give the same entropy', (lang) => {
    const accented = Bip39Utils.GetBIP39Dictionary(lang).filter((word) => removeAccents(word) !== word);
    expect(accented.length).toBeGreaterThan(0);
    accented.forEach((word) => {
      expect({ word, index: Bip39Utils.LookupWordIndex(removeAccents(word), lang).index })
        .toEqual({ word, index: Bip39Utils.GetBIP39Dictionary(lang).indexOf(word) });
    });
    for (let i = 0; i < RANDOM_PHRASES_PER_LANG; i++) {
      const entropy = randomEntropy(entropyBitsOf(24));
      const phrase  = removeAccents(Bip39Utils.EntropyToMnemonics(entropy, lang));
      expect(Bip39Utils.MnemonicsToEntropyInfo(phrase, lang)[ENTROPY_HEX]).toBe(entropy);
    }
  });

  test('Greek: words which only differ by their accents are found with their accents', () => {
    expect(Bip39Utils.LookupWordIndex(GREEK_POTE.accented_1, 'EL')).toEqual({ index: GREEK_POTE.index_1 });
    expect(Bip39Utils.LookupWordIndex(GREEK_POTE.accented_2, 'EL')).toEqual({ index: GREEK_POTE.index_2 });
  });

  test('Greek: such a word typed without accents is AMBIGUOUS_WORD', () => {
    expect(Bip39Utils.LookupWordIndex(GREEK_POTE.unaccented, 'EL')).toEqual({ reason: MNEMONICS_ERROR.AMBIGUOUS_WORD });
  });
});

describe('Agreement with the bip39 library', () => {
  test(`${ALTERED_PHRASES_COUNT} random English phrases with one word replaced`, () => {
    const english = bip39.wordlists.english;
    let invalid_count = 0;
    for (let i = 0; i < ALTERED_PHRASES_COUNT; i++) {
      const word_count = BIP39_WORD_COUNTS[i % BIP39_WORD_COUNTS.length];
      const words = bip39.entropyToMnemonic(randomEntropy(entropyBitsOf(word_count))).split(' ');
      words[crypto.randomInt(word_count)] = english[crypto.randomInt(WORDLIST_SIZE)];
      const phrase = words.join(' ');
      const valid  = Bip39Utils.ValidateMnemonics(phrase, 'EN').valid;
      expect({ phrase, valid }).toEqual({ phrase, valid: bip39.validateMnemonic(phrase) });
      if (! valid) invalid_count++;
    }
    expect(invalid_count).toBeGreaterThan(0); // the alterations do produce invalid phrases
  });
});

describe('MnemonicsToEntropyInfo throws if the phrase is invalid', () => {
  test('error with the reason and the position, the word is NOT in the message (secret)', () => {
    let error;
    try { Bip39Utils.MnemonicsToEntropyInfo(UNKNOWN_PHRASE, 'EN'); } catch (e) { error = e; }
    expect(error).toBeInstanceOf(Error);
    expect({ reason: error.reason, position: error.position })
      .toEqual({ reason: MNEMONICS_ERROR.UNKNOWN_WORD, position: 12 });
    expect(error.message).toContain(MNEMONICS_ERROR.UNKNOWN_WORD);
    expect(error.message).not.toContain(UNKNOWN_WORD);
    UNKNOWN_PHRASE.split(' ').forEach((word) => expect(error.message).not.toContain(word));
  });

  test('wrong checksum: CHECKSUM', () => {
    expect(() => Bip39Utils.MnemonicsToEntropyInfo(ABANDON_ZOO, 'EN'))
      .toThrow(expect.objectContaining({ reason: MNEMONICS_ERROR.CHECKSUM }));
  });

  test('no phrase: throws (formerly replaced by a hard-coded phrase)', () => {
    expect(() => Bip39Utils.MnemonicsToEntropyInfo(undefined, 'EN'))
      .toThrow(expect.objectContaining({ reason: MNEMONICS_ERROR.WORD_COUNT }));
  });
});

describe('CheckMnemonics relies on the same validation', () => {
  const options = (word_count) => ({ [LANG]: 'EN', word_count });

  test('valid phrase with the expected word count: true', () => {
    expect(Bip39Utils.CheckMnemonics(ABANDON_ABOUT, options(12))).toBe(true);
  });

  test('wrong checksum: false (formerly true: only the words were checked)', () => {
    expect(Bip39Utils.CheckMnemonics(ABANDON_ZOO, options(12))).toBe(false);
  });

  test('unknown word or other word count: false', () => {
    expect(Bip39Utils.CheckMnemonics(UNKNOWN_PHRASE, options(12))).toBe(false);
    expect(Bip39Utils.CheckMnemonics(ABANDON_ABOUT, options(24))).toBe(false);
  });

  test('word indexes of the phrase are those of the reference wordlist (EN)', () => {
    expect(wordIndexes(ABANDON_ABOUT, 'EN')).toEqual(ABANDON_ABOUT_INDEXES.split(' ').map(Number));
  });
});
