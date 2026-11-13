/**
 * ============================================================================
 * Golden addresses - cases and computation (shared by the test and the generator)
 * ============================================================================
 * A "golden" entry freezes, for one fixed input, the values a wallet shows to
 * the user: address, private key, WIF, derivation path and secret phrase.
 * The expected values ('tests/jest/fixtures/expected/golden_addresses.json')
 * are captured from the CURRENT code by 'tests/jest/tools/generate_golden_addresses.js'.
 * They are the safety net of the refactoring lots (5 to 7): a refactoring must
 * not change a single value. A lot which changes addresses on purpose (lot 6)
 * regenerates the file explicitly, and the diff shows every changed address.
 *
 * Cases: every blockchain of DEFAULT_OPTIONS, in HD Wallet and Simple Wallet,
 *   - 12 words: entropy 00..00 ('abandon ... about', BIP39 official vector)
 *   - 24 words: entropy 37297b...94db (Cryptocalc test vector)
 *   - HD Wallet only, 24 words with a BIP39 passphrase: 'TREZOR', the passphrase
 *     of the official BIP39 test vectors (consensus value, not a hardware-wallet case)
 * HD Wallet: BIP44, account 0, address index 0, mainnet.
 *
 * NB: relative require() only (no Jest alias): the generator runs with plain Node.
 * NB: the values freeze current quirks on purpose (hardened address index,
 *     uncompressed WIF...). Fixing them is a separate, explicit change.
 * ============================================================================
 */
const { HDWallet }        = require('../../../../../www/js/crypto/HDWallet/hd_wallet.js');
const { SimpleWallet }    = require('../../../../../www/js/crypto/SimpleWallet/simple_wallet.js');
const { DEFAULT_OPTIONS } = require('../../../../../www/js/crypto/const_default_options.js');
const { MAINNET }         = require('../../../../../www/js/crypto/const_blockchains.js');
const { ADDRESS, PRIVATE_KEY } = require('../../../../../www/js/crypto/const_wallet.js');
const {
  BLOCKCHAIN, CRYPTO_NET, BIP32_PROTOCOL, ACCOUNT, ADDRESS_INDEX, BIP39_PASSPHRASE,
  DERIVATION_PATH, MNEMONICS, WIF, HD_WALLET_TYPE, SIMPLE_WALLET_TYPE,
} = require('../../../../../www/js/const_keywords.js');

const ENTROPY_12_WORDS = '00000000000000000000000000000000';
const ENTROPY_24_WORDS = '37297b2455dbaa522dea2cd9a0be34ab488c8f00e0ef7085d73137e2b84c94db';
const BIP39_TEST_PASSPHRASE = 'TREZOR'; // passphrase of the official BIP39 test vectors
const NO_PASSPHRASE    = '';
const TEST_UUID        = 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6';
const BIP44            = 44;

// Values frozen for each entry (when the wallet has them)
const GOLDEN_FIELDS = [ADDRESS, PRIVATE_KEY, WIF, DERIVATION_PATH, MNEMONICS];

const ENTROPIES = [
  { words: 12, entropy: ENTROPY_12_WORDS },
  { words: 24, entropy: ENTROPY_24_WORDS },
];

const unique = (values) => [...new Set(values)];

const HD_BLOCKCHAINS     = unique(DEFAULT_OPTIONS.Blockchains[HD_WALLET_TYPE]);
const SIMPLE_BLOCKCHAINS = unique(DEFAULT_OPTIONS.Blockchains[SIMPLE_WALLET_TYPE]);

const caseKey = ({ mode, blockchain, words, passphrase }) =>
  [mode, blockchain, words + ' words', passphrase ? 'BIP39 passphrase' : 'no passphrase'].join(' | ');

const GOLDEN_CASES = [
  ...HD_BLOCKCHAINS.flatMap((blockchain) => [
    ...ENTROPIES.map(({ words, entropy }) =>
      ({ mode: HD_WALLET_TYPE, blockchain, words, entropy, passphrase: NO_PASSPHRASE })),
    { mode: HD_WALLET_TYPE, blockchain, words: 24, entropy: ENTROPY_24_WORDS, passphrase: BIP39_TEST_PASSPHRASE },
  ]),
  ...SIMPLE_BLOCKCHAINS.flatMap((blockchain) => ENTROPIES.map(({ words, entropy }) =>
    ({ mode: SIMPLE_WALLET_TYPE, blockchain, words, entropy, passphrase: NO_PASSPHRASE }))),
].map((golden_case) => ({ ...golden_case, key: caseKey(golden_case) }));

const generateWallet = (golden_case) => {
  if (golden_case.mode === HD_WALLET_TYPE) {
    return HDWallet.GetWallet(golden_case.entropy, TEST_UUID, {
      [BLOCKCHAIN]: golden_case.blockchain, [CRYPTO_NET]: MAINNET, [BIP32_PROTOCOL]: BIP44,
      [ACCOUNT]: 0, [ADDRESS_INDEX]: 0, [BIP39_PASSPHRASE]: golden_case.passphrase,
    });
  }
  return SimpleWallet.GetWallet(golden_case.entropy, TEST_UUID, golden_case.blockchain, MAINNET);
};

// { values } with the golden fields, or { error } if the generation throws
const computeGoldenValues = async (golden_case) => {
  try {
    const wallet = await generateWallet(golden_case);
    const values = {};
    GOLDEN_FIELDS.forEach((field) => {
      if (wallet[field] !== undefined) values[field] = String(wallet[field]);
    });
    return { values };
  }
  catch (error) {
    return { error: error.message };
  }
};

// Generates twice: the fields which differ are 'unstable' (random key: defect, not frozen)
const computeGoldenEntry = async (golden_case) => {
  const first  = await computeGoldenValues(golden_case);
  const second = await computeGoldenValues(golden_case);
  if (first.error !== undefined) return { error: first.error };
  const unstable = Object.keys(first.values).filter((field) => first.values[field] !== second.values[field]);
  const expected = {};
  Object.keys(first.values).filter((field) => ! unstable.includes(field))
                           .forEach((field) => { expected[field] = first.values[field]; });
  return unstable.length > 0 ? { expected, unstable } : { expected };
};

module.exports = {
  GOLDEN_CASES, GOLDEN_FIELDS, HD_BLOCKCHAINS, SIMPLE_BLOCKCHAINS,
  ENTROPY_12_WORDS, ENTROPY_24_WORDS, BIP39_TEST_PASSPHRASE, TEST_UUID,
  computeGoldenValues, computeGoldenEntry, generateWallet,
};
