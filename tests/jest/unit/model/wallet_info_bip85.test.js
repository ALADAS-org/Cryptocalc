/**
 * ============================================================================
 * Unit Tests - Bip85 fields in 'wallet_info.txt' and 'wallet_info.wits'
 * ============================================================================
 * Location: www/js/model/wallet_info_tmpl.js  (WalletInfoTemplate - REAL)
 *           www/js/model/main_model.js        (buildWalletInfoTxt, saveWalletInfoAsJson)
 *
 * When Bip85 mode is enabled, MainGUI.getWalletInfo() adds to 'crypto_info':
 *   BIP85_INIT_ENTROPY, BIP85_INDEX, BIP85_ENTROPY_SIZE
 * ('Entropy' is then the Bip85 Entropy derived from the Initial Entropy)
 *
 * Mocked: electron, fs, bwip-js, logs, Bip38Utils, FileUtils
 * NOT mocked: WalletInfoTemplate (the template itself is under test)
 * ============================================================================
 */

// ============================================================================
// MOCKS  (must be declared before any require() of the modules under test)
// ============================================================================

jest.mock('electron', () => ({
  app: { getAppPath: jest.fn(() => '/mock/app/path') }
}), { virtual: true });

jest.mock('bwip-js', () => ({
  toBuffer: jest.fn((opts, cb) => cb(null, Buffer.from('PNG_DATA'))),
  toSVG:    jest.fn(() => '<svg/>'),
}), { virtual: true });

const mockFs = {
  writeFileSync: jest.fn(),
  mkdirSync:     jest.fn(),
  existsSync:    jest.fn(() => false),
  readFileSync:  jest.fn(() => '{}'),
};
jest.mock('fs', () => mockFs);

jest.mock('@util/log/skribi.js', () => ({ Skribi: { log: jest.fn() } }));

jest.mock('@util/log/log_utils.js', () => ({
  PrettyLog: { This: { logMode: 'test' }, logMode: 'test' },
  pretty_func_header_log: jest.fn(),
  pretty_log: jest.fn(),
  UNIT_TESTS_LOG_MODE: 'test'
}));

jest.mock('@crypto/bip38_utils.js', () => ({
  Bip38Utils: { This: { encrypt: jest.fn(() => Promise.resolve('encrypted_key')) } }
}));

jest.mock('@util/system/file_utils.js', () => ({ FileUtils: { CreateSubfolder: jest.fn() } }));

// ============================================================================
// IMPORTS
// ============================================================================

const { MainModel }          = require('@www/js/model/main_model.js');
const { WalletInfoTemplate } = require('@www/js/model/wallet_info_tmpl.js');

const {
  WALLET_MODE, BLOCKCHAIN, MNEMONICS, SHORTENED_MNEMONICS, ENTROPY, ENTROPY_SIZE,
  MNEMONICS_LABEL, SHORTENED_MNEMONICS_LABEL, BIP85_MNEMONICS_LABEL,
  BIP85_INIT_ENTROPY, BIP85_INDEX, BIP85_ENTROPY_SIZE,
  BIP85_INIT_ENTROPY_LABEL, BIP85_INDEX_LABEL, BIP85_ENTROPY_LABEL,
  BIP85_INIT_ENTROPY_WITS_KEY, BIP85_INDEX_WITS_KEY,
  WORD_INDEXES, LANG, SIMPLE_WALLET_TYPE, HD_WALLET_TYPE,
  BIP32_PASSPHRASE, DERIVATION_PATH, WIF,
} = require('@www/js/const_keywords.js');

const { ADDRESS, PRIVATE_KEY }               = require('@crypto/const_wallet.js');
const { COIN, BLOCKCHAIN_EXPLORER, BITCOIN } = require('@crypto/const_blockchains.js');

// ============================================================================
// TEST FIXTURES
// ============================================================================

const MOCK_OUTPUT_PATH = '/mock/output';
const MOCK_TIMESTAMP   = '2026_09_27_16h00m00s-0';
const TXT_KEY_WIDTH       = 24; // default label column width
const TXT_MIN_LABEL_GAP   = 2;  // at least 2 spaces between label and value

// Expected mnemonics labels in wallet_info.txt
const LABEL_SEEDPHRASE             = 'Seedphrase';
const LABEL_SHORTENED_SEEDPHRASE   = 'Shortened Seedphrase';
const LABEL_BIP85_SEEDPHRASE       = 'Bip85 Derived Seedphrase';
const SHORTENED_MNEMONICS_VALUE    = 'MachChunAddPlaySeaScor';

// Expected labels (Bip85 enabled)
const LABEL_INITIAL_ENTROPY = 'Initial Entropy';
const LABEL_BIP85_INDEX     = 'Bip 85 Index';
const LABEL_BIP85_ENTROPY   = 'Bip 85 Entropy';

// Expected '.wits' keys (Bip85 enabled)
const WITS_KEY_INITIAL_ENTROPY = 'Initial Entropy';
const WITS_KEY_BIP85_INDEX     = 'Bip85 Index';

// Reference values: www/js/crypto/bip85/bip85_template-wallet_info.*
const INITIAL_ENTROPY = '2e8ca70959dbf8915c00d0b1f9924248fe85c52101b62049127181f170627ad0';
const BIP85_ENTROPY   = '8585140cd32c1f8240ee52364fd7b0f77f2cf7f9905fbf7976b56402c974ae72';

const CRYPTO_INFO_SIMPLE = {
  [WALLET_MODE]:         SIMPLE_WALLET_TYPE,
  [BLOCKCHAIN]:          BITCOIN,
  [COIN]:                'BTC',
  [ADDRESS]:             '1NnVzhAauHqkPzQGvh6pZ1V4WKVQSYgfne',
  [BLOCKCHAIN_EXPLORER]: 'https://www.blockchain.com/explorer/addresses/btc/1NnVzhAauHqkPzQGvh6pZ1V4WKVQSYgfne',
  [PRIVATE_KEY]:         BIP85_ENTROPY,
  [WIF]:                 'L3b8nH3HcD7QYayofXj5GNeCeizcDqLifJiLJZfDfBvNRSMkzqQR',
  [MNEMONICS]:           'machine chunk add play sea scorpion admit ski curve leaf umbrella upon '
                       + 'version know town armor satoshi slight pull siege clutch ripple right ethics',
  [WORD_INDEXES]:        '1046, 359, 5, 1424, 1543, 1528, 22, 1594, 296, 1054, 1174, 1725, '
                       + '1840, 1620, 233, 1682, 1578, 464, 1560, 1413, 1515, 1476, 263, 551',
  [LANG]:                'EN',
  [ENTROPY]:             BIP85_ENTROPY,
  [ENTROPY_SIZE]:        256,
};

// As sent by MainGUI.getWalletInfo() when Bip85 is enabled
const BIP85_INFO = {
  [BIP85_INIT_ENTROPY]: INITIAL_ENTROPY,
  [BIP85_INDEX]:        0,
};

const CRYPTO_INFO_SIMPLE_BIP85 = { ...CRYPTO_INFO_SIMPLE, ...BIP85_INFO };

const CRYPTO_INFO_HD_BIP85 = {
  ...CRYPTO_INFO_SIMPLE_BIP85,
  [WALLET_MODE]:      HD_WALLET_TYPE,
  [BIP32_PASSPHRASE]: 'my passphrase',
  [DERIVATION_PATH]:  "m/44'/0'/0'/0/0'",
  [BIP85_INDEX]:      7,
  [ENTROPY]:          BIP85_ENTROPY.substring(0, 32),
  [ENTROPY_SIZE]:     128,
};

const BIP85_KEYS   = [ BIP85_INIT_ENTROPY, BIP85_INDEX, BIP85_ENTROPY_SIZE ];
const BIP85_LABELS    = [ LABEL_INITIAL_ENTROPY, LABEL_BIP85_INDEX, LABEL_BIP85_ENTROPY ];
const BIP85_WITS_KEYS = [ WITS_KEY_INITIAL_ENTROPY, WITS_KEY_BIP85_INDEX ];

// ============================================================================
// HELPERS
// ============================================================================

// Label column width = position of the value (same for all lines)
const txtLabelWidth = (txt) => {
  const match = /\s{2,}/.exec(txt.split('\n')[0]);
  return match.index + match[0].length;
};

// wallet_info.txt as { label: value }
const parseTxt = (txt) => {
  const width  = txtLabelWidth(txt);
  const result = {};
  txt.split('\n').forEach((line) => {
    result[line.substring(0, width).trim()] = line.substring(width);
  });
  return result;
};

const txtLabels = (txt) => Object.keys(parseTxt(txt));

// Returns the JSON object written in 'wallet_info.wits'
const saveAsJson = (crypto_info) => {
  mockFs.writeFileSync.mockClear();
  MainModel.This.saveWalletInfoAsJson(MOCK_OUTPUT_PATH, { ...crypto_info }, MOCK_TIMESTAMP);
  const [ file_path, json_str ] = mockFs.writeFileSync.mock.calls[0];
  expect(file_path).toBe(MOCK_OUTPUT_PATH + '/wallet_info.wits');
  return JSON.parse(json_str);
};

// ============================================================================
// TESTS
// ============================================================================

describe('Bip85 label constants', () => {
  test('mnemonics labels', () => {
    expect(MNEMONICS_LABEL).toBe(LABEL_SEEDPHRASE);
    expect(SHORTENED_MNEMONICS_LABEL).toBe(LABEL_SHORTENED_SEEDPHRASE);
    expect(BIP85_MNEMONICS_LABEL).toBe(LABEL_BIP85_SEEDPHRASE);
  });

  test('values', () => {
    expect(BIP85_INIT_ENTROPY_LABEL).toBe(LABEL_INITIAL_ENTROPY);
    expect(BIP85_INDEX_LABEL).toBe(LABEL_BIP85_INDEX);
    expect(BIP85_ENTROPY_LABEL).toBe(LABEL_BIP85_ENTROPY);
    expect(BIP85_INIT_ENTROPY_WITS_KEY).toBe(WITS_KEY_INITIAL_ENTROPY);
    expect(BIP85_INDEX_WITS_KEY).toBe(WITS_KEY_BIP85_INDEX);
  });
});

describe('WalletInfoTemplate - Bip85', () => {
  test('template contains Initial Entropy and Bip85 Index', () => {
    expect(WalletInfoTemplate.This.getIndexInTemplate(BIP85_INIT_ENTROPY)).toBeGreaterThanOrEqual(0);
    expect(WalletInfoTemplate.This.getIndexInTemplate(BIP85_INDEX)).toBeGreaterThanOrEqual(0);
  });

  test('template does NOT contain Bip85 Entropy Size (same value as Entropy Size)', () => {
    expect(WalletInfoTemplate.This.getIndexInTemplate(BIP85_ENTROPY_SIZE)).toBe(-1);
  });

  test('Bip85 keys are just before Entropy / Entropy Size, in order', () => {
    const tmpl   = WalletInfoTemplate.This;
    const i_init = tmpl.getIndexInTemplate(BIP85_INIT_ENTROPY);
    expect(tmpl.getIndexInTemplate(BIP85_INDEX)).toBe(i_init + 1);
    expect(tmpl.getIndexInTemplate(ENTROPY)).toBe(i_init + 2);
    expect(tmpl.getIndexInTemplate(ENTROPY_SIZE)).toBe(i_init + 3);
  });

  test('clear() resets values: setItemValue() does not mutate the template', () => {
    const tmpl  = WalletInfoTemplate.This;
    const index = tmpl.getIndexInTemplate(BIP85_INIT_ENTROPY);
    tmpl.clear();
    tmpl.setItemValue(index, INITIAL_ENTROPY);
    expect(tmpl.getItemValue(index)).toBe(INITIAL_ENTROPY);
    tmpl.clear();
    expect(tmpl.getItemValue(index)).toBe('');
  });
});

describe('MainModel.buildWalletInfoTxt() - Bip85 enabled', () => {
  test("labels: 'Initial Entropy', 'Bip 85 Index', 'Bip 85 Entropy'", () => {
    const lines = parseTxt(MainModel.This.buildWalletInfoTxt(CRYPTO_INFO_SIMPLE_BIP85));
    expect(lines[LABEL_INITIAL_ENTROPY]).toBe(INITIAL_ENTROPY);
    expect(lines[LABEL_BIP85_INDEX]).toBe('0');
    expect(lines[LABEL_BIP85_ENTROPY]).toBe(BIP85_ENTROPY);
    expect(lines[ENTROPY_SIZE]).toBe('256 bits');
  });

  test("no 'Entropy' label and no raw Bip85 keys", () => {
    const labels = txtLabels(MainModel.This.buildWalletInfoTxt(CRYPTO_INFO_SIMPLE_BIP85));
    expect(labels).not.toContain(ENTROPY);
    BIP85_KEYS.forEach((key) => expect(labels).not.toContain(key));
  });

  test('no Bip85 Entropy Size line, even if provided (duplicate of Entropy Size)', () => {
    const txt = MainModel.This.buildWalletInfoTxt({ ...CRYPTO_INFO_SIMPLE_BIP85, [BIP85_ENTROPY_SIZE]: 256 });
    expect(txt.match(/256 bits/g)).toHaveLength(1);
  });

  test('Bip 85 Index 0 is written (not removed as an empty value)', () => {
    const lines = parseTxt(MainModel.This.buildWalletInfoTxt(CRYPTO_INFO_SIMPLE_BIP85));
    expect(lines[LABEL_BIP85_INDEX]).toBe('0');
  });

  test('order: Coin, Initial Entropy, Bip 85 Index, Bip 85 Entropy, Entropy Size', () => {
    const labels = txtLabels(MainModel.This.buildWalletInfoTxt(CRYPTO_INFO_SIMPLE_BIP85));
    const i_coin = labels.indexOf(COIN);
    expect(labels.slice(i_coin, i_coin + 5))
      .toEqual([ COIN, LABEL_INITIAL_ENTROPY, LABEL_BIP85_INDEX, LABEL_BIP85_ENTROPY, ENTROPY_SIZE ]);
  });

  test('HD Wallet: other Bip85 parameters, HD lines unchanged', () => {
    const lines = parseTxt(MainModel.This.buildWalletInfoTxt(CRYPTO_INFO_HD_BIP85));
    expect(lines[LABEL_BIP85_INDEX]).toBe('7');
    expect(lines[ENTROPY_SIZE]).toBe('128 bits');
    expect(lines[DERIVATION_PATH]).toBe("m/44'/0'/0'/0/0'");
  });

  test("'Bip85 Derived Seedphrase' replaces 'Secret phrase'", () => {
    const lines = parseTxt(MainModel.This.buildWalletInfoTxt(CRYPTO_INFO_SIMPLE_BIP85));
    expect(lines[LABEL_BIP85_SEEDPHRASE]).toBe(CRYPTO_INFO_SIMPLE[MNEMONICS]);
    expect(lines).not.toHaveProperty(LABEL_SEEDPHRASE);
    expect(lines).not.toHaveProperty(MNEMONICS);
  });

  test("'Shortened Seedphrase' label", () => {
    const lines = parseTxt(MainModel.This.buildWalletInfoTxt({ ...CRYPTO_INFO_SIMPLE_BIP85, [SHORTENED_MNEMONICS]: SHORTENED_MNEMONICS_VALUE }));
    expect(lines[LABEL_SHORTENED_SEEDPHRASE]).toBe(SHORTENED_MNEMONICS_VALUE);
  });

  test('label column widened: all values aligned, at least 2 spaces after the longest label', () => {
    const txt   = MainModel.This.buildWalletInfoTxt(CRYPTO_INFO_SIMPLE_BIP85);
    const width = LABEL_BIP85_SEEDPHRASE.length + TXT_MIN_LABEL_GAP;
    txt.split('\n').forEach((line) => {
      expect(line.charAt(width - 1)).toBe(' ');
      expect(line.charAt(width)).not.toBe(' ');
    });
    const line = txt.split('\n').find((l) => l.startsWith(LABEL_INITIAL_ENTROPY));
    expect(line).toBe(LABEL_INITIAL_ENTROPY.padEnd(width, ' ') + INITIAL_ENTROPY);
    expect(txt.endsWith('\n')).toBe(false);
  });
});

describe('MainModel.buildWalletInfoTxt() - Bip85 disabled', () => {
  test("'Seedphrase' replaces 'Secret phrase', 'Shortened Seedphrase' replaces 'Shortened Secret phrase'", () => {
    const lines = parseTxt(MainModel.This.buildWalletInfoTxt({ ...CRYPTO_INFO_SIMPLE, [SHORTENED_MNEMONICS]: SHORTENED_MNEMONICS_VALUE }));
    expect(lines[LABEL_SEEDPHRASE]).toBe(CRYPTO_INFO_SIMPLE[MNEMONICS]);
    expect(lines[LABEL_SHORTENED_SEEDPHRASE]).toBe(SHORTENED_MNEMONICS_VALUE);
    [ MNEMONICS, SHORTENED_MNEMONICS, LABEL_BIP85_SEEDPHRASE ].forEach((label) => expect(lines).not.toHaveProperty(label));
  });

  test('label column width stays at 24', () => {
    const txt = MainModel.This.buildWalletInfoTxt({ ...CRYPTO_INFO_SIMPLE, [SHORTENED_MNEMONICS]: SHORTENED_MNEMONICS_VALUE });
    const line = txt.split('\n').find((l) => l.startsWith(LABEL_SEEDPHRASE));
    expect(line).toBe(LABEL_SEEDPHRASE.padEnd(TXT_KEY_WIDTH, ' ') + CRYPTO_INFO_SIMPLE[MNEMONICS]);
  });

  test("'Entropy' label unchanged, no Bip85 line", () => {
    const labels = txtLabels(MainModel.This.buildWalletInfoTxt(CRYPTO_INFO_SIMPLE));
    expect(labels).toContain(ENTROPY);
    BIP85_LABELS.forEach((label) => expect(labels).not.toContain(label));
    BIP85_KEYS.forEach((key) => expect(labels).not.toContain(key));
  });

  test('empty Initial Entropy is handled as Bip85 disabled', () => {
    const labels = txtLabels(MainModel.This.buildWalletInfoTxt({ ...CRYPTO_INFO_SIMPLE_BIP85, [BIP85_INIT_ENTROPY]: '' }));
    expect(labels).toContain(ENTROPY);
    expect(labels).not.toContain(LABEL_BIP85_ENTROPY);
  });

  test('no leak: a Bip85 save followed by a non Bip85 save', () => {
    MainModel.This.buildWalletInfoTxt(CRYPTO_INFO_SIMPLE_BIP85);
    const txt = MainModel.This.buildWalletInfoTxt(CRYPTO_INFO_SIMPLE);
    expect(txt).not.toContain(INITIAL_ENTROPY);
    BIP85_LABELS.forEach((label) => expect(txtLabels(txt)).not.toContain(label));
  });
});

describe('MainModel.saveWalletInfoAsJson() - Bip85', () => {
  test("Bip85 enabled: 'Bip85 Index' and 'Initial Entropy' are added", () => {
    const json = saveAsJson(CRYPTO_INFO_SIMPLE_BIP85);
    expect(json[WITS_KEY_BIP85_INDEX]).toBe(0);
    expect(json[WITS_KEY_INITIAL_ENTROPY]).toBe(INITIAL_ENTROPY);
  });

  test("Bip85 enabled: 'Entropy' and 'Entropy Size' are unchanged", () => {
    const json = saveAsJson(CRYPTO_INFO_SIMPLE_BIP85);
    expect(json[ENTROPY]).toBe(BIP85_ENTROPY);
    expect(json[ENTROPY_SIZE]).toBe(256);
    expect(json).not.toHaveProperty(LABEL_BIP85_ENTROPY);
  });

  test('Bip85 enabled: same JSON as without Bip85, plus the 2 Bip85 keys', () => {
    const json       = saveAsJson(CRYPTO_INFO_SIMPLE_BIP85);
    const json_plain = saveAsJson(CRYPTO_INFO_SIMPLE);
    const extra_keys = Object.keys(json).filter((key) => ! (key in json_plain));
    expect(extra_keys.sort()).toEqual([ ...BIP85_WITS_KEYS ].sort());
    Object.keys(json_plain).forEach((key) => expect(json[key]).toEqual(json_plain[key]));
  });

  test('Bip85 enabled: no txt label, no raw Bip85 key, no Bip85 Entropy Size', () => {
    const json = saveAsJson({ ...CRYPTO_INFO_SIMPLE_BIP85, [BIP85_ENTROPY_SIZE]: 256 });
    [ ...BIP85_KEYS, LABEL_BIP85_INDEX, LABEL_BIP85_ENTROPY ].forEach((key) => expect(json).not.toHaveProperty(key));
  });

  test("'.wits' mnemonics key unchanged ('Secret phrase'), no txt label", () => {
    const json = saveAsJson(CRYPTO_INFO_SIMPLE_BIP85);
    expect(json[MNEMONICS]).toBe(CRYPTO_INFO_SIMPLE[MNEMONICS]);
    [ LABEL_SEEDPHRASE, LABEL_BIP85_SEEDPHRASE ].forEach((label) => expect(json).not.toHaveProperty(label));
  });

  test("'Bip85 Index' given as a string is written as an integer", () => {
    const json = saveAsJson({ ...CRYPTO_INFO_SIMPLE_BIP85, [BIP85_INDEX]: '12' });
    expect(json[WITS_KEY_BIP85_INDEX]).toBe(12);
  });

  test('HD Wallet + Bip85: HD fields still present', () => {
    const json = saveAsJson(CRYPTO_INFO_HD_BIP85);
    expect(json[WITS_KEY_BIP85_INDEX]).toBe(7);
    expect(json[ENTROPY_SIZE]).toBe(128);
    expect(json[BIP32_PASSPHRASE]).toBe('my passphrase');
    expect(json[DERIVATION_PATH]).toBe("m/44'/0'/0'/0/0'");
  });

  test('Bip85 disabled: no Bip85 field', () => {
    const json = saveAsJson(CRYPTO_INFO_SIMPLE);
    [ ...BIP85_KEYS, ...BIP85_WITS_KEYS ].forEach((key) => expect(json).not.toHaveProperty(key));
  });

  test('empty Initial Entropy: no Bip85 field', () => {
    const json = saveAsJson({ ...CRYPTO_INFO_SIMPLE_BIP85, [BIP85_INIT_ENTROPY]: '' });
    [ ...BIP85_KEYS, ...BIP85_WITS_KEYS ].forEach((key) => expect(json).not.toHaveProperty(key));
  });
});
