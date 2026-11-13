/**
 * ============================================================================
 * Unit tests - Golden addresses (safety net of the refactorings)
 * ============================================================================
 * Every golden case (every blockchain of DEFAULT_OPTIONS, HD Wallet and Simple
 * Wallet, 12 and 24 words, HD Wallet with and without passphrase) must give
 * EXACTLY the values captured from the code before the refactorings:
 * address, private key, WIF, derivation path and secret phrase.
 *
 * Fixture:   tests/jest/fixtures/expected/golden_addresses.json
 * Generator: node tests/jest/tools/generate_golden_addresses.js [--write]
 * Cases:     tests/jest/unit/wallet/helpers/golden_wallets.js
 *
 * Also:
 *   - EntropyToMnemonics equals bip39.entropyToMnemonic (128 to 256 bits)
 *   - Sui, Terra and Horizen equal independent reference libraries (2.6)
 *   - every Simple Wallet is tagged 'Simple Wallet' (missing 'await' up to 0.5.34)
 *   - known defects, documented with 'test.failing' until their fix:
 *       H2  HD Bitcoin 'abandon ... about' differs from the standard BIP44 address
 *       H3  the address of a BIP38-decrypted key differs from the displayed address
 * ============================================================================
 */
const fs   = require('fs');
const path = require('path');

jest.mock('electron', () => ({ dialog: { showMessageBoxSync: jest.fn() } }));

const bip39         = require('bip39');
const Bip38         = require('bip38');
const { BIP32Factory } = require('bip32');
const ecc           = require('tiny-secp256k1');
const bitcoinjs     = require('bitcoinjs-lib');
const bs58check     = require('bs58check').default;
const wif           = require('wif');
const { Ed25519Keypair } = require('@mysten/sui/keypairs/ed25519');
const { MnemonicKey }    = require('@terra-money/terra.js');

const { PrettyLog, UNIT_TESTS_LOG_MODE } = require('@util/log/log_utils.js');
const { Bip39Utils } = require('@crypto/bip39_utils.js');
const { Bip38Utils } = require('@crypto/bip38_utils.js');
const { BITCOIN, SUI, TERRA_LUNA, HORIZEN } = require('@crypto/const_blockchains.js');
const { ADDRESS, PRIVATE_KEY } = require('@crypto/const_wallet.js');
const { HD_WALLET_TYPE, SIMPLE_WALLET_TYPE, WALLET_MODE, MNEMONICS, WIF,
        DERIVATION_PATH } = require('@www/js/const_keywords.js');
const {
  GOLDEN_CASES, HD_BLOCKCHAINS, SIMPLE_BLOCKCHAINS, ENTROPY_12_WORDS, ENTROPY_24_WORDS,
  computeGoldenValues, generateWallet,
} = require('./helpers/golden_wallets.js');

const GOLDEN_PATH = path.join(__dirname, '../../fixtures/expected/golden_addresses.json');
const GOLDEN      = JSON.parse(fs.readFileSync(GOLDEN_PATH, 'utf8')).entries;

const GOLDEN_TIMEOUT_MS   = 30000;  // HD Wallet derivation is slow under Jest
const BIP38_TIMEOUT_MS    = 30000;
const BIP38_TEST_SCRYPT   = { N: 16, r: 8, p: 8 }; // reduced cost: the logic, not the strength, is tested
const BIP38_PASSPHRASE    = 'TestingOneTwoThree'; // passphrase of the official BIP38 test vectors
const BITCOIN_BIP44_PATH  = "m/44'/0'/0'/0/0";
const ABANDON_ABOUT       = Bip39Utils.EntropyToMnemonics(ENTROPY_12_WORDS);
const ABANDON_ABOUT_BIP44_BTC_ADDRESS = '1LqBGSKuX5yYUonjxT5qGfpUsXKYYWeabA'; // BIP44 reference vector
const ENTROPY_SIZES_BITS  = [128, 160, 192, 224, 256];
const BITS_PER_HEX_DIGIT  = 4;
const ABANDON_ABOUT_SUI_ADDRESS   = '0x5e93a736d04fbb25737aa40bee40171ef79f65fae833749e3c089fe7cc2161f1';
const ABANDON_ABOUT_TERRA_ADDRESS = 'terra1amdttz2937a3dytmxmkany53pp6ma6dy4vsllv';
const HORIZEN_P2PKH_PREFIX  = Buffer.from('2089', 'hex');   // 'zn' addresses (mainnet)
const HORIZEN_WIF_VERSION   = 0x80;
const HORIZEN_12_WORDS_PATH = "m/44'/121'/0'/0/0'";            // same rule as the other secp256k1 coins

const caseOf = (key) => GOLDEN_CASES.find((golden_case) => golden_case.key === key);
const keysWhere = (predicate) => Object.keys(GOLDEN).filter((key) => predicate(GOLDEN[key]));

const STABLE_KEYS   = keysWhere((entry) => entry.error === undefined && entry.unstable === undefined);
const UNSTABLE_KEYS = keysWhere((entry) => entry.unstable !== undefined);
const ERROR_KEYS    = keysWhere((entry) => entry.error !== undefined);
const goldenKeysOf  = (mode, blockchain) => Object.keys(GOLDEN)
  .filter((key) => key.startsWith(mode + ' | ' + blockchain + ' | '));

const p2pkhAddress = (private_key_buf, compressed) => {
  const pubkey = Buffer.from(ecc.pointFromScalar(private_key_buf, compressed));
  return bitcoinjs.payments.p2pkh({ pubkey }).address;
};

const fakeWindow = () => ({ webContents: { send: jest.fn() } });

let consoleSpy;
beforeAll(() => {
  PrettyLog.This.logMode = UNIT_TESTS_LOG_MODE;
  // Some wallet APIs log with console.log directly (secrets are redacted, see 1.2)
  consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
});
afterAll(() => { consoleSpy.mockRestore(); });

describe('Golden addresses - completeness', () => {
  test('every golden case of the current code has an entry, and only them', () => {
    expect(Object.keys(GOLDEN).sort()).toEqual(GOLDEN_CASES.map((golden_case) => golden_case.key).sort());
  });

  test('HD Wallet: 3 cases per blockchain, Simple Wallet: 2 cases per blockchain', () => {
    const count = (mode) => GOLDEN_CASES.filter((golden_case) => golden_case.mode === mode).length;
    expect(count(HD_WALLET_TYPE)).toBe(3 * HD_BLOCKCHAINS.length);
    expect(count(SIMPLE_WALLET_TYPE)).toBe(2 * SIMPLE_BLOCKCHAINS.length);
  });

  // The generator still records a random value ('unstable') or a failure ('error'):
  // since 2.6 none is accepted
  test('no entry has a random value or a failed generation', () => {
    expect({ unstable: UNSTABLE_KEYS, error: ERROR_KEYS }).toEqual({ unstable: [], error: [] });
  });

  test('every stable entry freezes at least the address and the private key', () => {
    STABLE_KEYS.forEach((key) => {
      expect({ key, fields: Object.keys(GOLDEN[key].expected) })
        .toEqual({ key, fields: expect.arrayContaining([ADDRESS, PRIVATE_KEY]) });
    });
  });
});

describe('Golden addresses - the code gives exactly the frozen values', () => {
  test.each(STABLE_KEYS)('%s', async (key) => {
    const { values, error } = await computeGoldenValues(caseOf(key));
    expect(error).toBeUndefined();
    expect(values).toEqual(GOLDEN[key].expected);
  }, GOLDEN_TIMEOUT_MS);
});

describe('Simple Wallet: every wallet is tagged as a Simple Wallet', () => {
  test.each(SIMPLE_BLOCKCHAINS)('%s', async (blockchain) => {
    const wallet = await generateWallet(caseOf(goldenKeysOf(SIMPLE_WALLET_TYPE, blockchain)[0]));
    expect(wallet[WALLET_MODE]).toBe(SIMPLE_WALLET_TYPE);
  }, GOLDEN_TIMEOUT_MS);
});

// ==========================================================================
// 2.6 - Sui, Terra and Horizen equal independent reference libraries
//       (up to 0.5.34: random keys for Sui and Terra, Horizen failed with 12 words)
// ==========================================================================
describe('Sui (HD Wallet) equals @mysten/sui', () => {
  test("'abandon ... about': BIP44 reference address", () => {
    expect(GOLDEN['HD Wallet | ' + SUI + ' | 12 words | no passphrase'].expected[ADDRESS])
      .toBe(ABANDON_ABOUT_SUI_ADDRESS);
  });

  test.each(goldenKeysOf(HD_WALLET_TYPE, SUI))('%s', (key) => {
    const { expected } = GOLDEN[key];
    const seed_hex = bip39.mnemonicToSeedSync(expected[MNEMONICS], caseOf(key).passphrase).toString('hex');
    const keypair  = Ed25519Keypair.deriveKeypairFromSeed(seed_hex, expected[DERIVATION_PATH]);
    expect({ address: expected[ADDRESS], private_key: expected[PRIVATE_KEY] })
      .toEqual({ address: keypair.toSuiAddress(), private_key: keypair.getSecretKey() });
  });

  test('the BIP39 passphrase changes the address', () => {
    expect(GOLDEN['HD Wallet | ' + SUI + ' | 24 words | BIP39 passphrase'].expected[ADDRESS])
      .not.toBe(GOLDEN['HD Wallet | ' + SUI + ' | 24 words | no passphrase'].expected[ADDRESS]);
  });

  test('two generations give the same address', async () => {
    const golden_case = caseOf('HD Wallet | ' + SUI + ' | 12 words | no passphrase');
    const first  = await computeGoldenValues(golden_case);
    const second = await computeGoldenValues(golden_case);
    expect(second.values[ADDRESS]).toBe(first.values[ADDRESS]);
  }, GOLDEN_TIMEOUT_MS);
});

describe('Terra (Simple Wallet) equals @terra-money/terra.js', () => {
  test("'abandon ... about': reference address", () => {
    expect(GOLDEN['Simple Wallet | ' + TERRA_LUNA + ' | 12 words | no passphrase'].expected[ADDRESS])
      .toBe(ABANDON_ABOUT_TERRA_ADDRESS);
  });

  test.each(goldenKeysOf(SIMPLE_WALLET_TYPE, TERRA_LUNA))('%s', (key) => {
    const { expected } = GOLDEN[key];
    const reference = new MnemonicKey({ mnemonic: expected[MNEMONICS] });
    expect({ address: expected[ADDRESS], private_key: expected[PRIVATE_KEY] })
      .toEqual({ address: reference.accAddress, private_key: reference.privateKey.toString('hex') });
  });

  test('two generations give the same address', async () => {
    const golden_case = caseOf('Simple Wallet | ' + TERRA_LUNA + ' | 12 words | no passphrase');
    const first  = await computeGoldenValues(golden_case);
    const second = await computeGoldenValues(golden_case);
    expect(second.values[ADDRESS]).toBe(first.values[ADDRESS]);
  }, GOLDEN_TIMEOUT_MS);
});

describe('Horizen (Simple Wallet): key, address and WIF consistent', () => {
  const horizenAddress = (private_key_hex) => {
    const pubkey = Buffer.from(ecc.pointFromScalar(Buffer.from(private_key_hex, 'hex'), true));
    return bs58check.encode(Buffer.concat([HORIZEN_P2PKH_PREFIX, bitcoinjs.crypto.hash160(pubkey)]));
  };

  test('12 words: BIP44 key derived from the phrase', () => {
    const { expected } = GOLDEN['Simple Wallet | ' + HORIZEN + ' | 12 words | no passphrase'];
    const node = BIP32Factory(ecc).fromSeed(bip39.mnemonicToSeedSync(expected[MNEMONICS])).derivePath(HORIZEN_12_WORDS_PATH);
    expect(expected[PRIVATE_KEY]).toBe(Buffer.from(node.privateKey).toString('hex'));
  });

  test('24 words: the entropy is the private key (unchanged)', () => {
    expect(GOLDEN['Simple Wallet | ' + HORIZEN + ' | 24 words | no passphrase'].expected[PRIVATE_KEY])
      .toBe(ENTROPY_24_WORDS);
  });

  test.each(goldenKeysOf(SIMPLE_WALLET_TYPE, HORIZEN))('%s: address of the compressed public key', (key) => {
    const { expected } = GOLDEN[key];
    expect(expected[ADDRESS]).toBe(horizenAddress(expected[PRIVATE_KEY]));
  });

  test.each(goldenKeysOf(SIMPLE_WALLET_TYPE, HORIZEN))('%s: compressed WIF of the private key', (key) => {
    const { expected } = GOLDEN[key];
    const decoded = wif.decode(expected[WIF]);
    expect({ version: decoded.version, compressed: decoded.compressed,
             private_key: Buffer.from(decoded.privateKey).toString('hex') })
      .toEqual({ version: HORIZEN_WIF_VERSION, compressed: true, private_key: expected[PRIVATE_KEY] });
  });
});

describe('EntropyToMnemonics equals the bip39 library', () => {
  test.each(ENTROPY_SIZES_BITS)('%i bits', (bits) => {
    const entropy = ENTROPY_24_WORDS.slice(0, bits / BITS_PER_HEX_DIGIT);
    expect(Bip39Utils.EntropyToMnemonics(entropy)).toBe(bip39.entropyToMnemonic(entropy));
  });
});

describe('Reference values (checked before being used by the known defects below)', () => {
  test("bip32 + bitcoinjs-lib: 'abandon ... about' on m/44'/0'/0'/0/0 is the BIP44 reference address", () => {
    const node = BIP32Factory(ecc).fromSeed(bip39.mnemonicToSeedSync(ABANDON_ABOUT)).derivePath(BITCOIN_BIP44_PATH);
    expect(bitcoinjs.payments.p2pkh({ pubkey: Buffer.from(node.publicKey) }).address)
      .toBe(ABANDON_ABOUT_BIP44_BTC_ADDRESS);
  });

  test('BIP38 (reduced scrypt): the decrypted private key equals the encrypted one', async () => {
    const golden_key = 'Simple Wallet | Bitcoin | 24 words | no passphrase';
    const private_key = GOLDEN[golden_key].expected[PRIVATE_KEY];
    Bip38Utils.This.scryptParams = BIP38_TEST_SCRYPT;
    const encrypted = await Bip38Utils.This.encrypt(private_key, BIP38_PASSPHRASE, fakeWindow());
    const decrypted = Bip38.decrypt(encrypted, BIP38_PASSPHRASE, undefined, BIP38_TEST_SCRYPT);
    expect(decrypted.privateKey.toString('hex')).toBe(private_key);
  }, BIP38_TIMEOUT_MS);
});

// ==========================================================================
// KNOWN DEFECTS - 'test.failing' passes as long as the defect is present.
// When a fix lands, Jest reports the test as failing: turn it into 'test'.
// ==========================================================================
describe('Known defects (test.failing until fixed)', () => {
  test.failing("H2: HD Bitcoin 'abandon ... about' is the standard BIP44 address (lot 6, decision D1)", () => {
    const key = 'HD Wallet | ' + BITCOIN + ' | 12 words | no passphrase';
    expect(GOLDEN[key].expected[ADDRESS]).toBe(ABANDON_ABOUT_BIP44_BTC_ADDRESS);
  });

  test.failing('H3: the address of the BIP38-decrypted key is the displayed address (2.4)', async () => {
    const golden = GOLDEN['Simple Wallet | ' + BITCOIN + ' | 24 words | no passphrase'].expected;
    Bip38Utils.This.scryptParams = BIP38_TEST_SCRYPT;
    const encrypted = await Bip38Utils.This.encrypt(golden[PRIVATE_KEY], BIP38_PASSPHRASE, fakeWindow());
    const decrypted = Bip38.decrypt(encrypted, BIP38_PASSPHRASE, undefined, BIP38_TEST_SCRYPT);
    expect(p2pkhAddress(decrypted.privateKey, decrypted.compressed)).toBe(golden[ADDRESS]);
  }, BIP38_TIMEOUT_MS);

});
