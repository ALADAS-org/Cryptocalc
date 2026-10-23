/**
 * ============================================================================
 * E2E Tests - Classic use cases: BTC / ETH / DOGE
 * ============================================================================
 * For each blockchain and each secret phrase size (12 and 24 words), with a
 * fixed entropy pasted in the 'Entropy' field (real user gesture):
 *   1. Secret phrase       == bip39 reference
 *   2. Simple Wallet       == address (and private key) computed with
 *                             independent libraries
 *   3. HD Wallet           == reference address, without BIP39 passphrase
 *   4. HD Wallet + passphrase (real [Edit] / [Apply] dialog)
 *                          == reference address with the passphrase,
 *                             and different from the address without it
 *
 * Reference values: helpers/bip39_references.js (no Cryptocalc code involved)
 * ============================================================================
 */
const { test, expect, waitForAppReady } = require('../setup.js');
const {
  ENTROPY, BIP39_PASSPHRASE, COINS,
  mnemonicOf, hdWalletAddress, simpleWalletAddress, simpleWalletPrivateKeyHex,
} = require('./helpers/bip39_references.js');
const {
  IDS, WALLET_MODES, readValue,
  selectWordCount, pasteEntropy, selectWalletMode, selectBlockchain,
  applyBip39Passphrase, expectAddress, openWalletTab,
} = require('./helpers/gui_actions.js');

const USE_CASE_TIMEOUT = 120000;
const WORD_COUNTS      = [12, 24];

test.describe('Use cases - Simple Wallet and HD Wallet (BTC / ETH / DOGE)', () => {
  test.beforeEach(async ({ page }) => {
    await waitForAppReady(page);
  });

  for (const [symbol, coin] of Object.entries(COINS)) {
    for (const words of WORD_COUNTS) {
      test(`${symbol} - ${words} words: Simple Wallet, HD Wallet, HD Wallet + passphrase`, async ({ page }) => {
        test.setTimeout(USE_CASE_TIMEOUT);

        // ---- Entropy -> Secret phrase ----
        await selectWordCount(page, words);
        await pasteEntropy(page, ENTROPY[words]);
        expect(await readValue(page, IDS.MNEMONICS)).toBe(mnemonicOf(words));

        // ---- Simple Wallet ----
        await selectWalletMode(page, WALLET_MODES.SIMPLE);
        await selectBlockchain(page, coin.label);
        await expectAddress(page, simpleWalletAddress(coin, words));
        await openWalletTab(page);
        expect(await readValue(page, IDS.PRIVATE_KEY)).toBe(simpleWalletPrivateKeyHex(coin, words));

        // ---- HD Wallet, no BIP39 passphrase ----
        await selectWalletMode(page, WALLET_MODES.HD);
        await selectBlockchain(page, coin.label);
        const address_without_passphrase = hdWalletAddress(coin, words);
        await expectAddress(page, address_without_passphrase);

        // ---- HD Wallet, with BIP39 passphrase ----
        await applyBip39Passphrase(page, BIP39_PASSPHRASE);
        await selectBlockchain(page, coin.label);
        const address_with_passphrase = hdWalletAddress(coin, words, BIP39_PASSPHRASE);
        expect(address_with_passphrase).not.toBe(address_without_passphrase);
        await expectAddress(page, address_with_passphrase);

        // The secret phrase is unchanged by the wallet mode and the passphrase
        expect(await readValue(page, IDS.MNEMONICS)).toBe(mnemonicOf(words));
      });
    }
  }
});
