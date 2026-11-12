/**
 * ============================================================================
 * Behavior test - no secret in clear text in the console log (Main process)
 * ============================================================================
 * Wallets are generated (HD and Simple Wallet, every blockchain of
 * DEFAULT_OPTIONS) with the logs ENABLED (PRODUCTION_LOG_MODE) and the
 * console captured. With 'HashedSecretsInConsoleLog' true (default):
 *   - the console never contains the entropy, the secret phrase (nor 3
 *     consecutive words of it), the private key, the WIF, the 'PRIV KEY',
 *     the chaincode or the BIP39 passphrase of the wallet
 *   - no hexadecimal string of 64 digits or more (entropy, keys, seeds,
 *     chaincodes are at least 32 bytes), public keys (02/03/04 prefix) aside
 *   - the entropy is traced as the SAME fingerprint wherever it is traced
 * With 'HashedSecretsInConsoleLog' false (debug): the entropy appears.
 * Test vector: entropy 37297b...94db, passphrase 'TREZOR'.
 * ============================================================================
 */
const {
  PrettyLog, PRODUCTION_LOG_MODE, UNIT_TESTS_LOG_MODE,
  setHashedSecretsInConsoleLog, setSecretFingerprintKey, redactSecret,
} = require('@util/log/log_utils.js');

const { HDWallet }        = require('@crypto/HDWallet/hd_wallet.js');
const { SimpleWallet }    = require('@crypto/SimpleWallet/simple_wallet.js');
const { Bip39Utils }      = require('@crypto/bip39_utils.js');
const { DEFAULT_OPTIONS } = require('@crypto/const_default_options.js');
const { MAINNET }         = require('@crypto/const_blockchains.js');
const {
  ADDRESS, PRIVATE_KEY, PRIV_KEY, CHAINCODE,
} = require('@crypto/const_wallet.js');
const {
  BLOCKCHAIN, CRYPTO_NET, BIP32_PROTOCOL, ACCOUNT, ADDRESS_INDEX,
  BIP39_PASSPHRASE, MNEMONICS, WIF, HD_WALLET_TYPE, SIMPLE_WALLET_TYPE,
} = require('@www/js/const_keywords.js');

const ENTROPY_HEX     = '37297b2455dbaa522dea2cd9a0be34ab488c8f00e0ef7085d73137e2b84c94db';
const PASSPHRASE      = 'TREZOR';
const TEST_UUID       = 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6';
const TEST_KEY        = Buffer.alloc(32, 7);
const WORDS_IN_A_ROW  = 3;
const LONG_HEX_REGEX  = /[0-9a-fA-F]{64,}/g;
const PUBLIC_KEY_HEX_REGEX = /^(0[23][0-9a-fA-F]{64}|04[0-9a-fA-F]{128})$/; // compressed / uncompressed
const SECRET_FIELDS   = [PRIVATE_KEY, WIF, PRIV_KEY, CHAINCODE];
const CONSOLE_METHODS = ['log', 'info', 'warn', 'error', 'debug'];
const MIN_SECRET_LENGTH = 8; // shorter values (e.g. 'Null-...' placeholders aside) are not checked

const HD_BLOCKCHAINS     = [...new Set(DEFAULT_OPTIONS.Blockchains[HD_WALLET_TYPE])];
const SIMPLE_BLOCKCHAINS = [...new Set(DEFAULT_OPTIONS.Blockchains[SIMPLE_WALLET_TYPE])];
const MNEMONICS_WORDS    = Bip39Utils.EntropyToMnemonics(ENTROPY_HEX).split(' ');

// ---------- helpers ----------
// Runs 'generate' with the logs enabled and returns { result, output }
const captureConsole = async (generate) => {
  const lines = [];
  const spies = CONSOLE_METHODS.map((method) =>
    jest.spyOn(console, method).mockImplementation((...args) => { lines.push(args.map(String).join(' ')); }));
  PrettyLog.This.logMode = PRODUCTION_LOG_MODE;
  try {
    const result = await generate();
    return { result, output: lines.join('\n') };
  }
  finally {
    PrettyLog.This.logMode = UNIT_TESTS_LOG_MODE;
    spies.forEach((spy) => spy.mockRestore());
  }
};

const hdArgs = (blockchain) => ({
  [BLOCKCHAIN]: blockchain, [CRYPTO_NET]: MAINNET, [BIP32_PROTOCOL]: 44,
  [ACCOUNT]: 0, [ADDRESS_INDEX]: 0, [BIP39_PASSPHRASE]: PASSPHRASE,
});

const wordSequences = (words, size) =>
  words.slice(0, words.length - size + 1).map((word, i) => words.slice(i, i + size).join(' '));

// Every secret value which must never appear in clear text
const secretsOf = (wallet) => {
  const values = [ENTROPY_HEX, PASSPHRASE, ...wordSequences(MNEMONICS_WORDS, WORDS_IN_A_ROW)];
  if (typeof wallet[MNEMONICS] === 'string') {
    values.push(...wordSequences(wallet[MNEMONICS].split(' '), WORDS_IN_A_ROW));
  }
  SECRET_FIELDS.forEach((field) => {
    const value = wallet[field];
    if (typeof value === 'string' && value.length >= MIN_SECRET_LENGTH && ! value.startsWith('Null-')) {
      values.push(value);
    }
  });
  return values;
};

const expectNoSecret = (output, wallet) => {
  secretsOf(wallet).forEach((secret) => {
    expect({ secret, found: output.includes(secret) }).toEqual({ secret, found: false });
  });
  const long_hex = (output.match(LONG_HEX_REGEX) || []).filter((hex) => ! PUBLIC_KEY_HEX_REGEX.test(hex));
  expect(long_hex).toEqual([]);
};

beforeEach(() => {
  setHashedSecretsInConsoleLog(true);
  setSecretFingerprintKey(TEST_KEY);
});
afterAll(() => { setHashedSecretsInConsoleLog(true); });

describe("'HashedSecretsInConsoleLog' true: no secret in the console log", () => {
  test.each(HD_BLOCKCHAINS)('HD Wallet %s (passphrase TREZOR)', async (blockchain) => {
    const { result, output } = await captureConsole(() => HDWallet.GetWallet(ENTROPY_HEX, TEST_UUID, hdArgs(blockchain)));
    expect(result[ADDRESS]).toBeDefined();
    expectNoSecret(output, result);
  });

  test.each(SIMPLE_BLOCKCHAINS)('Simple Wallet %s', async (blockchain) => {
    const { result, output } = await captureConsole(() => SimpleWallet.GetWallet(ENTROPY_HEX, TEST_UUID, blockchain, MAINNET));
    expect(result[ADDRESS]).toBeDefined();
    expectNoSecret(output, result);
  });

  test('the entropy is traced as one and the same fingerprint', async () => {
    const { output } = await captureConsole(() => SimpleWallet.GetWallet(ENTROPY_HEX, TEST_UUID, SIMPLE_BLOCKCHAINS[0], MAINNET));
    expect(output).toContain(redactSecret(ENTROPY_HEX));
  });
});

describe("'HashedSecretsInConsoleLog' false (debug): secrets in clear text", () => {
  test('the entropy appears in the console log', async () => {
    setHashedSecretsInConsoleLog(false);
    const { output } = await captureConsole(() => SimpleWallet.GetWallet(ENTROPY_HEX, TEST_UUID, SIMPLE_BLOCKCHAINS[0], MAINNET));
    expect(output).toContain(ENTROPY_HEX);
  });
});
