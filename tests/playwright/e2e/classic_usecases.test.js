/**
 * ============================================================================
 * E2E Tests - Classic use cases: BTC / ETH / DOGE
 * ============================================================================
 * For each blockchain and each secret phrase size (12 and 24 words), with a
 * fixed entropy pasted in the 'Entropy' field (real user gesture), and a
 * secret phrase language chosen explicitly (EN, plus FR for BTC: the BIP39
 * seed, hence the HD addresses, depends on the language of the phrase):
 *   1. Secret phrase       == bip39 reference
 *   2. Simple Wallet       == address (and private key) computed with
 *                             independent libraries
 *   3. HD Wallet           == reference address, without BIP39 passphrase
 *   4. HD Wallet + passphrase (real [Edit] / [Apply] dialog)
 *                          == reference address with the passphrase,
 *                             and different from the address without it
 *
 * Reference values: helpers/bip39_references.js (no Cryptocalc code involved)
 *
 * KNOWN DIVERGENCE (pending decision): Cryptocalc derives the keys from the
 * ENGLISH secret phrase whatever the language displayed and saved
 * (hd_wallet.js and simple_wallet.js call Bip39Utils.EntropyToMnemonics()
 * without the language). BIP39 computes the seed from the words themselves,
 * so the displayed French phrase restored in another BIP39 wallet gives other
 * addresses. The French cases are therefore marked 'expected to fail'
 * (test.fail): Playwright reports them as soon as this behavior changes.
 * ============================================================================
 */
const { test, expect, waitForAppReady } = require('../setup.js');
const {
  ENTROPY, BIP39_PASSPHRASE, COINS,
  mnemonicOf, hdWalletAddress, simpleWalletAddress, simpleWalletPrivateKeyHex,
} = require('./helpers/bip39_references.js');
const {
  IDS, WALLET_MODES, readValue,
  selectWordCount, selectSecretPhraseLang, pasteEntropy, selectWalletMode, selectBlockchain,
  applyBip39Passphrase, expectAddress, openWalletTab,
} = require('./helpers/gui_actions.js');

const USE_CASE_TIMEOUT = 120000;

// [ coin symbol, word count, secret phrase language ]
const USE_CASES = [
  ['BTC', 12, 'EN'], ['BTC', 24, 'EN'],
  ['ETH', 12, 'EN'], ['ETH', 24, 'EN'],
  ['DOGE', 12, 'EN'], ['DOGE', 24, 'EN'],
  ['BTC', 12, 'FR'], ['BTC', 24, 'FR'],
];

test.describe('Use cases - Simple Wallet and HD Wallet (BTC / ETH / DOGE)', () => {
  test.beforeEach(async ({ page }) => {
    await waitForAppReady(page);
  });

  for (const [symbol, words, lang] of USE_CASES) {
    const coin = COINS[symbol];

    test(`${symbol} - ${words} words (${lang}): Simple Wallet, HD Wallet, HD Wallet + passphrase`, async ({ page }) => {
      test.setTimeout(USE_CASE_TIMEOUT);
      test.fail(lang !== 'EN', 'Keys are derived from the ENGLISH secret phrase whatever the displayed language');

      // ---- Entropy -> Secret phrase ----
      await selectWordCount(page, words);
      await selectSecretPhraseLang(page, lang);
      await pasteEntropy(page, ENTROPY[words]);
      expect(await readValue(page, IDS.MNEMONICS)).toBe(mnemonicOf(words, lang));

      // ---- Simple Wallet ----
      await selectWalletMode(page, WALLET_MODES.SIMPLE);
      await selectBlockchain(page, coin.label);
      await expectAddress(page, simpleWalletAddress(coin, words, lang));
      await openWalletTab(page);
      expect(await readValue(page, IDS.PRIVATE_KEY)).toBe(simpleWalletPrivateKeyHex(coin, words, lang));

      // ---- HD Wallet, no BIP39 passphrase ----
      await selectWalletMode(page, WALLET_MODES.HD);
      await selectBlockchain(page, coin.label);
      const address_without_passphrase = hdWalletAddress(coin, words, '', lang);
      await expectAddress(page, address_without_passphrase);

      // ---- HD Wallet, with BIP39 passphrase ----
      await applyBip39Passphrase(page, BIP39_PASSPHRASE);
      await selectBlockchain(page, coin.label);
      const address_with_passphrase = hdWalletAddress(coin, words, BIP39_PASSPHRASE, lang);
      expect(address_with_passphrase).not.toBe(address_without_passphrase);
      await expectAddress(page, address_with_passphrase);

      // The secret phrase is unchanged by the wallet mode and the passphrase
      expect(await readValue(page, IDS.MNEMONICS)).toBe(mnemonicOf(words, lang));
    });
  }
});
