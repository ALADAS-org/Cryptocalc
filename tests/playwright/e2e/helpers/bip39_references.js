/**
 * ============================================================================
 * E2E helpers - reference values computed with INDEPENDENT libraries
 * ============================================================================
 * The values displayed by Cryptocalc are compared with values computed here
 * with bip39 / bip32 / tiny-secp256k1 / bitcoinjs-lib / ethereumjs-util,
 * i.e. without any Cryptocalc code.
 *
 * Derivation used by Cryptocalc (0.5.34):
 *   - HD Wallet: m/44'/coin'/0'/0/0'  (address index HARDENED)
 *   - Simple Wallet, 256-bit entropy: the entropy IS the private key
 *   - Simple Wallet, < 256-bit entropy: same key as the HD Wallet first address
 *     (no BIP39 passphrase)
 * NB: if the default derivation path changes (address index non hardened),
 *     'HD_ADDRESS_PATH' must be updated accordingly.
 * ============================================================================
 */
const bip39 = require('bip39');
const ecc   = require('tiny-secp256k1');
const { BIP32Factory } = require('bip32');
const bitcoin = require('bitcoinjs-lib');
const ethUtil = require('ethereumjs-util');

const bip32 = BIP32Factory(ecc);

// Fixed test entropy (12 words = first 128 bits, 24 words = 256 bits)
const HEX64   = '37297b2455dbaa522dea2cd9a0be34ab488c8f00e0ef7085d73137e2b84c94db';
const ENTROPY = { 12: HEX64.slice(0, 32), 24: HEX64 };
const BIP39_PASSPHRASE = 'TREZOR';

const DOGECOIN_NETWORK = {
  messagePrefix: '\x19Dogecoin Signed Message:\n', bech32: 'doge',
  bip32: { public: 0x02facafd, private: 0x02fac398 },
  pubKeyHash: 0x1e, scriptHash: 0x16, wif: 0x9e,
};

// label = value of the 'Blockchain' select in the GUI
const COINS = {
  BTC:  { label: 'Bitcoin',  coin_type: 0,  kind: 'utxo', network: bitcoin.networks.bitcoin },
  ETH:  { label: 'Ethereum', coin_type: 60, kind: 'evm' },
  DOGE: { label: 'DogeCoin', coin_type: 3,  kind: 'utxo', network: DOGECOIN_NETWORK },
};

const HD_ADDRESS_PATH = (coin_type) => `m/44'/${coin_type}'/0'/0/0'`;

const addressFromPrivateKey = (coin, private_key) => {
  if (coin.kind === 'evm') {
    return ethUtil.toChecksumAddress('0x' + ethUtil.privateToAddress(Buffer.from(private_key)).toString('hex'));
  }
  const pubkey = Buffer.from(ecc.pointFromScalar(Buffer.from(private_key), true));
  return bitcoin.payments.p2pkh({ pubkey, network: coin.network }).address;
};

// Secret phrase languages used by the tests (value of the 'Seed Phrase' language select)
const WORDLISTS = { EN: bip39.wordlists.english, FR: bip39.wordlists.french };

// NB: the BIP39 seed depends on the LANGUAGE of the secret phrase (the words are hashed)
const mnemonicOf = (words, lang = 'EN') => bip39.entropyToMnemonic(ENTROPY[words], WORDLISTS[lang]);

const hdPrivateKey = (coin, words, passphrase = '', lang = 'EN') => {
  const seed = bip39.mnemonicToSeedSync(mnemonicOf(words, lang), passphrase);
  return bip32.fromSeed(seed).derivePath(HD_ADDRESS_PATH(coin.coin_type)).privateKey;
};

const hdWalletAddress = (coin, words, passphrase = '', lang = 'EN') =>
  addressFromPrivateKey(coin, hdPrivateKey(coin, words, passphrase, lang));

// 256 bits: the entropy is the private key (independent of the language)
const simpleWalletPrivateKeyHex = (coin, words, lang = 'EN') => (words === 24)
  ? ENTROPY[24]
  : Buffer.from(hdPrivateKey(coin, words, '', lang)).toString('hex');

const simpleWalletAddress = (coin, words, lang = 'EN') =>
  addressFromPrivateKey(coin, Buffer.from(simpleWalletPrivateKeyHex(coin, words, lang), 'hex'));

module.exports = {
  HEX64, ENTROPY, BIP39_PASSPHRASE, COINS, WORDLISTS,
  mnemonicOf, hdWalletAddress, simpleWalletAddress, simpleWalletPrivateKeyHex,
};
