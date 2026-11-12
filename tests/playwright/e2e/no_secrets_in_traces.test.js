/**
 * ============================================================================
 * E2E Test - no secret in clear text in the traces (step 1.2)
 * ============================================================================
 * The application is launched like 'npm start' with the real
 * 'www/config/options.json' ('HashedSecretsInConsoleLog' true). While a
 * user pastes the reference entropy, generates a Simple Wallet and an HD
 * Wallet with the BIP39 passphrase 'TREZOR' (BTC, 24 words), the console of
 * the Main process (stdout / stderr, Renderer traces included: they are
 * written by the Main process) and the DevTools console of the Renderer are
 * captured. They must contain:
 *   - neither the entropy, nor 3 consecutive words of the secret phrase,
 *     nor the private key, nor the passphrase
 *   - no hex string of 64+ digits (public keys aside)
 *   - fingerprints ("<secret #xxxxxxxx (n)>") instead
 * ============================================================================
 */
const { test, expect, waitForAppReady } = require('../setup.js');
const { ENTROPY, BIP39_PASSPHRASE, COINS, mnemonicOf } = require('./helpers/bip39_references.js');
const {
  IDS, WALLET_MODES, readValue, openWalletTab,
  selectWordCount, selectSecretPhraseLang, pasteEntropy, selectWalletMode, selectBlockchain,
  applyBip39Passphrase,
} = require('./helpers/gui_actions.js');

const USE_CASE_TIMEOUT     = 120000;
const WORDS                = 24;
const LANG                 = 'EN';
const WORDS_IN_A_ROW       = 3;
const FINGERPRINT_REGEX    = /<secret #[0-9a-f]{8} \(\d+\)>/;
const LONG_HEX_REGEX       = /[0-9a-fA-F]{64,}/g;
const PUBLIC_KEY_HEX_REGEX = /^(0[23][0-9a-fA-F]{64}|04[0-9a-fA-F]{128})$/;
const LOG_FLUSH_DELAY      = 1500;

const wordSequences = (phrase, size) => {
  const words = phrase.split(' ');
  return words.slice(0, words.length - size + 1).map((word, i) => words.slice(i, i + size).join(' '));
};

test.describe('No secret in clear text in the traces', () => {
  test('BTC 24 words: Simple Wallet and HD Wallet + passphrase', async ({ electronApp, page }) => {
    test.setTimeout(USE_CASE_TIMEOUT);

    // ---- capture: Main process console (stdout/stderr) and Renderer DevTools console ----
    const logs = [];
    const main_process = electronApp.process();
    main_process.stdout.on('data', (chunk) => logs.push(chunk.toString()));
    main_process.stderr.on('data', (chunk) => logs.push(chunk.toString()));
    page.on('console', (msg) => logs.push(msg.text()));

    await waitForAppReady(page);

    // ---- user gestures ----
    await selectWordCount(page, WORDS);
    await selectSecretPhraseLang(page, LANG);
    await pasteEntropy(page, ENTROPY[WORDS]);
    expect(await readValue(page, IDS.MNEMONICS)).toBe(mnemonicOf(WORDS, LANG));

    await selectWalletMode(page, WALLET_MODES.SIMPLE);
    await selectBlockchain(page, COINS.BTC.label);
    await openWalletTab(page);
    const simple_private_key = await readValue(page, IDS.PRIVATE_KEY);

    await selectWalletMode(page, WALLET_MODES.HD);
    await applyBip39Passphrase(page, BIP39_PASSPHRASE);
    await selectBlockchain(page, COINS.BTC.label);
    await openWalletTab(page);
    const hd_private_key = await readValue(page, IDS.PRIVATE_KEY);

    await page.waitForTimeout(LOG_FLUSH_DELAY);
    const output = logs.join('\n');

    // ---- the traces were captured and hold fingerprints ----
    expect(output).toMatch(FINGERPRINT_REGEX);

    // ---- no secret in clear text ----
    const secrets = [
      ENTROPY[WORDS], BIP39_PASSPHRASE, simple_private_key, hd_private_key,
      ...wordSequences(mnemonicOf(WORDS, LANG), WORDS_IN_A_ROW),
    ].filter((secret) => typeof secret === 'string' && secret.length > 0);
    expect(secrets.length).toBeGreaterThan(WORDS);
    const leaks = secrets.filter((secret) => output.includes(secret));
    expect(leaks).toEqual([]);

    const long_hex = (output.match(LONG_HEX_REGEX) || []).filter((hex) => ! PUBLIC_KEY_HEX_REGEX.test(hex));
    expect(long_hex).toEqual([]);
  });
});
