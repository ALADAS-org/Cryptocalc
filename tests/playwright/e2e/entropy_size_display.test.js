/**
 * ============================================================================
 * E2E Tests - Entropy size: the 'Entropy' combo and the word count agree
 * ============================================================================
 * Bug fixed: after choosing "12 words", the entropy and the secret phrase
 * became 128 bits / 12 words but the 'Entropy' combo kept showing "256 bits"
 * (WalletInfo.GUI_NODE_IDs[ENTROPY_SIZE] pointed to a node which doesn't exist).
 *
 * For Simple Wallet and HD Wallet:
 *   - at startup: default size of options.json (256 bits = 24 words)
 *   - choosing a word count updates the 'Entropy' combo
 *   - choosing an entropy size updates the word count
 *   and the entropy / secret phrase always have the displayed size.
 * ============================================================================
 */
const { test, expect, waitForAppReady } = require('../setup.js');
const { readValue, selectWalletMode, openSeedTab, POLL_TIMEOUT, UI_DELAY, WALLET_MODES } =
  require('./helpers/gui_actions.js');

const BIP39_SIZES = [
  { words: 12, bits: 128 }, { words: 15, bits: 160 }, { words: 18, bits: 192 },
  { words: 21, bits: 224 }, { words: 24, bits: 256 },
];
const DEFAULT_SIZE = { words: 24, bits: 256 }; // www/config/options.json "Entropy Size"

const SELECTS = { WORD_COUNT: '#word_count_select_id', ENTROPY_SIZE: '#entropy_size_select_id' };

// Displayed sizes: combos + actual entropy and secret phrase
const displayedSizes = async (page) => ({
  combo_bits:     Number(await readValue(page, SELECTS.ENTROPY_SIZE)),
  combo_words:    Number(await readValue(page, SELECTS.WORD_COUNT)),
  entropy_bits:   (await readValue(page, '#entropy_id')).length * 4,
  phrase_words:   (await readValue(page, '#mnemonics_id')).split(/\s+/).length,
});
const expectSizes = (page, { words, bits }) => expect.poll(() => displayedSizes(page), { timeout: POLL_TIMEOUT })
  .toEqual({ combo_bits: bits, combo_words: words, entropy_bits: bits, phrase_words: words });

const selectAndWait = async (page, selector, value) => {
  await openSeedTab(page);
  await page.selectOption(selector, String(value));
  await page.waitForTimeout(UI_DELAY);
};

test.describe('Entropy size display: combo, word count, entropy and phrase agree', () => {
  test.beforeEach(async ({ page }) => {
    await waitForAppReady(page);
  });

  for (const mode of [WALLET_MODES.SIMPLE, WALLET_MODES.HD]) {
    test(`${mode}: default size, then each word count, then each entropy size`, async ({ page }) => {
      test.setTimeout(180000);
      await selectWalletMode(page, mode);
      await openSeedTab(page);
      await expectSizes(page, DEFAULT_SIZE);

      for (const size of BIP39_SIZES) {
        await selectAndWait(page, SELECTS.WORD_COUNT, size.words);
        await expectSizes(page, size);
      }
      for (const size of [...BIP39_SIZES].reverse()) {
        await selectAndWait(page, SELECTS.ENTROPY_SIZE, size.bits);
        await expectSizes(page, size);
      }
    });
  }
});
