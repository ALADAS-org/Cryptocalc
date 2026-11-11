/**
 * ============================================================================
 * E2E Tests - BIP39 sizes in the Tools dialogs and the Entropy source
 * ============================================================================
 * These are the places where the BIP39 sizes (12..24 words, 128..256 bits)
 * were hard-coded in the Renderer:
 *   - Tools / Entropy Converter: hexadecimal entropy -> secret phrase + size,
 *     only for the 5 BIP39 sizes
 *   - Tools / Secret phrase Translator: translation EN -> FR, and rejection of
 *     a word count which is not a BIP39 word count
 *   - Entropy tab (D6 dices source): the generated entropy has the size of
 *     the selected word count
 * ============================================================================
 */
const { test, expect, waitForAppReady } = require('../setup.js');
const bip39 = require('bip39');
const { HEX64 } = require('./helpers/bip39_references.js');
const { readValue, pasteInField, selectWordCount, openSeedTab, clickMenuItem, localizedLabelRegex,
        POLL_TIMEOUT, UI_DELAY } = require('./helpers/gui_actions.js');

const BIP39_SIZES = [
  { words: 12, bits: 128 }, { words: 15, bits: 160 }, { words: 18, bits: 192 },
  { words: 21, bits: 224 }, { words: 24, bits: 256 },
];
const INVALID_HEX_DIGITS   = 30;            // 120 bits: not a BIP39 entropy size
const INVALID_WORD_COUNTS  = [11, 13, 23];
// Menu items, found by their label in any language of the application (keys of gui-msg-xx.json)
const MENU = {
  ENTROPY_CONVERTER: localizedLabelRegex('EntropyConverterTool'),
  TRANSLATOR:        localizedLabelRegex('SecretPhraseTranslatorTool'),
};

const CONVERTER = {
  HEX:          '#econverter_hexadecimal_input_id',
  SECRET_PHRASE:'#econverter_secret_phrase_input_id',
  SIZE:         '#econverter_entropy_size_select_id',
  BASE64:       '#econverter_base64_input_id',
};
const TRANSLATOR = {
  INPUT:      'translator_input_id',
  OUTPUT_LANG:'#translator_output_lang_select_id',
  TRANSLATED: '#translator_translated_id',
  TRANSLATE:  '#translator_translate_btn_id',
  CLEAR:      '#translator_dialog_clear_btn_id',
  ERROR:      '#translator_error_msg_id',
};
const INVALID_COUNT_MSG = (count) => `Invalid mnemonics count: ${count}`;

const hexOfBits   = (bits) => HEX64.slice(0, bits / 4);
const phraseOf    = (words, wordlist = bip39.wordlists.english) =>
  bip39.entropyToMnemonic(hexOfBits(BIP39_SIZES.find((s) => s.words === words).bits), wordlist);
const wordsOfCount = (count) => phraseOf(24).split(' ').concat(phraseOf(24).split(' ')).slice(0, count).join(' ');

test.describe('BIP39 sizes - Tools dialogs and Entropy source', () => {
  test.beforeEach(async ({ page }) => {
    await waitForAppReady(page);
  });

  test('Entropy Converter: hexadecimal -> secret phrase and size, for the 5 BIP39 sizes only', async ({ page, electronApp }) => {
    expect(await clickMenuItem(electronApp, MENU.ENTROPY_CONVERTER)).toBeTruthy();
    await page.waitForTimeout(UI_DELAY);

    for (const { words, bits } of BIP39_SIZES) {
      await page.fill(CONVERTER.HEX, hexOfBits(bits));
      await expect.poll(() => readValue(page, CONVERTER.SECRET_PHRASE), { timeout: POLL_TIMEOUT }).toBe(phraseOf(words));
      expect(await readValue(page, CONVERTER.SIZE)).toBe(String(bits));
    }

    // Not a BIP39 size: no secret phrase, no Base64
    await page.fill(CONVERTER.HEX, HEX64.slice(0, INVALID_HEX_DIGITS));
    await expect.poll(() => readValue(page, CONVERTER.SECRET_PHRASE), { timeout: POLL_TIMEOUT }).toBe('');
    expect(await readValue(page, CONVERTER.BASE64)).toBe('');
  });

  test('Secret phrase Translator: EN -> FR, and only BIP39 word counts are accepted', async ({ page, electronApp }) => {
    expect(await clickMenuItem(electronApp, MENU.TRANSLATOR)).toBeTruthy();
    await page.waitForTimeout(UI_DELAY);

    // Paste (real gesture) then change the output language
    for (const { words } of BIP39_SIZES) {
      await page.click(TRANSLATOR.CLEAR);
      await pasteInField(page, TRANSLATOR.INPUT, phraseOf(words));
      await page.selectOption(TRANSLATOR.OUTPUT_LANG, 'FR');
      await expect.poll(() => readValue(page, TRANSLATOR.TRANSLATED), { timeout: POLL_TIMEOUT })
        .toBe(phraseOf(words, bip39.wordlists.french));
      expect(await readValue(page, TRANSLATOR.ERROR)).toBe('');
      await page.selectOption(TRANSLATOR.OUTPUT_LANG, 'EN');
    }

    // Word counts which are not BIP39 word counts: rejected, both when pasting and with [Translate]
    for (const count of INVALID_WORD_COUNTS) {
      await page.click(TRANSLATOR.CLEAR);
      await pasteInField(page, TRANSLATOR.INPUT, wordsOfCount(count));
      await expect.poll(() => readValue(page, TRANSLATOR.ERROR), { timeout: POLL_TIMEOUT }).toContain(INVALID_COUNT_MSG(count));

      await page.click(TRANSLATOR.CLEAR);
      await page.fill('#' + TRANSLATOR.INPUT, wordsOfCount(count));
      await page.click(TRANSLATOR.TRANSLATE);
      await expect.poll(() => readValue(page, TRANSLATOR.ERROR), { timeout: POLL_TIMEOUT }).toContain(INVALID_COUNT_MSG(count));
    }
  });

  test('Entropy source (D6 dices): the entropy size follows the selected word count', async ({ page }) => {
    for (const { words, bits } of BIP39_SIZES) {
      await selectWordCount(page, words);
      await openSeedTab(page);
      await expect.poll(async () => (await readValue(page, '#entropy_id')).length, { timeout: POLL_TIMEOUT }).toBe(bits / 4);
      expect((await readValue(page, '#mnemonics_id')).split(' ')).toHaveLength(words);
    }
  });
});
