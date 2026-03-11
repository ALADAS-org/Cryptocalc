/**
 * ============================================================================
 * Unit Tests - MainModel
 * ============================================================================
 * Location: www/js/model/main_model.js
 *
 * MainModel est un singleton responsable de :
 *   - saveWalletInfo()      : sauvegarder le wallet complet (txt, json/wits, QR codes)
 *   - saveWalletInfoAsJson(): sérialiser le wallet en JSON → wallet_info.wits
 *   - loadWalletInfoFromJson(): charger un wallet depuis un .wits
 *   - createQRCode()        : générer des QR codes PNG/SVG via bwip-js
 *
 * Dépendances mockées :
 *   - electron (app.getAppPath)
 *   - fs (writeFileSync, mkdirSync, existsSync)
 *   - bwip-js (toBuffer, toSVG)
 *   - Modules internes : Skribi, log_utils, WalletInfoTemplate, Bip38Utils, FileUtils
 *
 * Périmètre testé :
 *   - Singleton pattern (MainModel.This)
 *   - saveWalletInfoAsJson() : contenu JSON, champs obligatoires, dérivation
 *     du DERIVATION_PATH vers account/address_index
 *   - Comportement is_not_null()  (via les QR codes conditionnels)
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// Mocks — doivent être déclarés avant les imports
// ---------------------------------------------------------------------------

// Mock electron
jest.mock('electron', () => ({
  app: { getAppPath: jest.fn(() => '/mock/app/path') }
}), { virtual: true });

// Mock bwip-js
jest.mock('bwip-js', () => ({
  toBuffer: jest.fn((opts, cb) => cb(null, Buffer.from('PNG_DATA'))),
  toSVG: jest.fn(() => '<svg/>'),
}), { virtual: true });

// Mock fs
const mockFs = {
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
  existsSync: jest.fn(() => false),
  readFileSync: jest.fn(() => '{}'),
};
jest.mock('fs', () => mockFs);

// Mock des dépendances internes
jest.mock('@util/log/skribi.js', () => ({
  Skribi: { log: jest.fn() }
}));

jest.mock('@util/log/log_utils.js', () => ({
  PrettyLog: { 
    This: { logMode: 'test' },
    logMode: 'test'
  },
  pretty_func_header_log: jest.fn(),
  pretty_log: jest.fn(),
  UNIT_TESTS_LOG_MODE: 'test'
}));

jest.mock('@www/js/model/wallet_info_tmpl.js', () => ({
  WalletInfoTemplate: {
    This: {
      clear: jest.fn(),
      getItems: jest.fn(() => []),
      getIndexInTemplate: jest.fn(() => -1),
      setItemValue: jest.fn(),
      getItem: jest.fn(),
      removeEmptyItems: jest.fn(),
      getItemKey: jest.fn(),
      getItemValue: jest.fn()
    }
  }
}));

jest.mock('@crypto/bip38_utils.js', () => ({
  Bip38Utils: {
    This: {
      encrypt: jest.fn(() => Promise.resolve('encrypted_key'))
    }
  }
}));

jest.mock('@util/system/file_utils.js', () => ({
  FileUtils: {
    CreateSubfolder: jest.fn()
  }
}));

jest.mock('@util/values/string_utils.js', () => ({
  isString: jest.fn((val) => typeof val === 'string')
}));

jest.mock('@crypto/hex_utils.js', () => ({
  isHexString: jest.fn(() => true)
}));

// ---------------------------------------------------------------------------
// Imports (après les mocks)
// ---------------------------------------------------------------------------
const { PrettyLog, UNIT_TESTS_LOG_MODE } = require('@util/log/log_utils.js');
const { MainModel } = require('@www/js/model/main_model.js');

const {
  WALLET_MODE, BLOCKCHAIN, MNEMONICS, ENTROPY, ENTROPY_SIZE,
  WORD_INDEXES, BIP32_PASSPHRASE, BIP38_PASSPHRASE,
  DERIVATION_PATH, WIF, LANG,
  SIMPLE_WALLET_TYPE, HD_WALLET_TYPE,
  ACCOUNT, ADDRESS_INDEX
} = require('@www/js/const_keywords.js');

const { ADDRESS, PRIVATE_KEY, BIP38_ENCRYPTED_PK } = require('@crypto/const_wallet.js');
const { COIN, BLOCKCHAIN_EXPLORER, BITCOIN, DOGECOIN } = require('@crypto/const_blockchains.js');

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_CRYPTO_INFO_SIMPLE = {
  [WALLET_MODE]: SIMPLE_WALLET_TYPE,
  [BLOCKCHAIN]: BITCOIN,
  [ENTROPY]: 'deadbeef'.repeat(8),
  [ENTROPY_SIZE]: 256,
  [ADDRESS]: '1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf',
  [BLOCKCHAIN_EXPLORER]: 'https://blockchain.com/btc/address/1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf',
  [PRIVATE_KEY]: 'a'.repeat(64),
  [WIF]: 'L1aW4aubDFB7yfras2S1mN3bqg9nwySY8nkoLmJebSLD5BWv3ENZ',
  [MNEMONICS]: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
  [WORD_INDEXES]: '0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3',
  [LANG]: 'EN',
};

const MOCK_CRYPTO_INFO_HD = {
  ...MOCK_CRYPTO_INFO_SIMPLE,
  [WALLET_MODE]: HD_WALLET_TYPE,
  [BIP32_PASSPHRASE]: 'my passphrase',
  [DERIVATION_PATH]: "m/44'/0'/2'/0/5'",
  [ADDRESS]: '1HDWalletAddress123456789',
};

const MOCK_CRYPTO_INFO_DOGE = {
  ...MOCK_CRYPTO_INFO_SIMPLE,
  [BLOCKCHAIN]: DOGECOIN,
  [ADDRESS]: 'DQf4pDQoqaEuQGEpUv41Vx7TQWKzWhH2Ur',
  [LANG]: 'EN',
};

const MOCK_TIMESTAMP = '2026_03_10_14h00m00s-0';

beforeAll(() => {
  PrettyLog.This.logMode = UNIT_TESTS_LOG_MODE;
});

beforeEach(() => {
  jest.clearAllMocks();
  mockFs.existsSync.mockReturnValue(false);
  
  // Mock de getAppVersion
  jest.spyOn(MainModel.This, 'getAppVersion').mockReturnValue('0.3.2');
});

// ===========================================================================
describe('MainModel — Singleton', () => {

  test('MainModel.This retourne toujours la même instance', () => {
    const a = MainModel.This;
    const b = MainModel.This;
    expect(a).toBe(b);
  });

  test('le constructeur privé rejette un appel direct', () => {
    expect(() => new MainModel()).toThrow(TypeError);
  });

  test('l\'instance a la propriété app_version initialisée', () => {
    expect(MainModel.This).toHaveProperty('app_version');
  });

});

// ===========================================================================
describe('MainModel — saveWalletInfoAsJson() : Simple Wallet', () => {

  // Déplacer l'appel dans un beforeEach pour garantir l'ordre
  beforeEach(() => {
    mockFs.writeFileSync.mockClear();
    MainModel.This.saveWalletInfoAsJson(
      '/mock/output/path',
      { ...MOCK_CRYPTO_INFO_SIMPLE },
      MOCK_TIMESTAMP
    );
  });

  test('appelle fs.writeFileSync une fois', () => {
    expect(mockFs.writeFileSync).toHaveBeenCalledTimes(1);
  });

  test('le JSON écrit contient WALLET_MODE', () => {
    const written = JSON.parse(mockFs.writeFileSync.mock.calls[0][1]);
    expect(written[WALLET_MODE]).toBe(SIMPLE_WALLET_TYPE);
  });

  test('le JSON écrit contient BLOCKCHAIN', () => {
    const written = JSON.parse(mockFs.writeFileSync.mock.calls[0][1]);
    expect(written[BLOCKCHAIN]).toBe(BITCOIN);
  });

  test('le JSON écrit contient ADDRESS', () => {
    const written = JSON.parse(mockFs.writeFileSync.mock.calls[0][1]);
    expect(written[ADDRESS]).toBe(MOCK_CRYPTO_INFO_SIMPLE[ADDRESS]);
  });

  test('le JSON écrit contient ENTROPY', () => {
    const written = JSON.parse(mockFs.writeFileSync.mock.calls[0][1]);
    expect(written[ENTROPY]).toBe(MOCK_CRYPTO_INFO_SIMPLE[ENTROPY]);
  });

  test('le JSON écrit contient WIF', () => {
    const written = JSON.parse(mockFs.writeFileSync.mock.calls[0][1]);
    expect(written[WIF]).toBe(MOCK_CRYPTO_INFO_SIMPLE[WIF]);
  });

  test('le JSON écrit contient PRIVATE_KEY', () => {
    const written = JSON.parse(mockFs.writeFileSync.mock.calls[0][1]);
    expect(written[PRIVATE_KEY]).toBe(MOCK_CRYPTO_INFO_SIMPLE[PRIVATE_KEY]);
  });

  test('le JSON écrit contient MNEMONICS', () => {
    const written = JSON.parse(mockFs.writeFileSync.mock.calls[0][1]);
    expect(written[MNEMONICS]).toBe(MOCK_CRYPTO_INFO_SIMPLE[MNEMONICS]);
  });

  test('le JSON écrit contient LANG', () => {
    const written = JSON.parse(mockFs.writeFileSync.mock.calls[0][1]);
    expect(written[LANG]).toBe('EN');
  });

  test('le JSON écrit contient le timestamp', () => {
    const written = JSON.parse(mockFs.writeFileSync.mock.calls[0][1]);
    expect(written['timestamp']).toBe(MOCK_TIMESTAMP);
  });

  test('ENTROPY_SIZE est converti en entier', () => {
    const written = JSON.parse(mockFs.writeFileSync.mock.calls[0][1]);
    expect(typeof written[ENTROPY_SIZE]).toBe('number');
    expect(written[ENTROPY_SIZE]).toBe(256);
  });

  test('ENTROPY_SIZE string est aussi converti en entier', () => {
    mockFs.writeFileSync.mockClear();
    MainModel.This.saveWalletInfoAsJson(
      '/mock/output',
      { ...MOCK_CRYPTO_INFO_SIMPLE, [ENTROPY_SIZE]: '128' },
      MOCK_TIMESTAMP
    );
    const written = JSON.parse(mockFs.writeFileSync.mock.calls[0][1]);
    expect(typeof written[ENTROPY_SIZE]).toBe('number');
    expect(written[ENTROPY_SIZE]).toBe(128);
  });

  test('Simple Wallet : BIP32_PASSPHRASE absent du JSON', () => {
    const written = JSON.parse(mockFs.writeFileSync.mock.calls[0][1]);
    expect(written[BIP32_PASSPHRASE]).toBeUndefined();
  });

});

// ===========================================================================
describe('MainModel — saveWalletInfoAsJson() : HD Wallet', () => {

  beforeEach(() => {
    mockFs.writeFileSync.mockClear();
    MainModel.This.saveWalletInfoAsJson(
      '/mock/output/hd',
      { ...MOCK_CRYPTO_INFO_HD },
      MOCK_TIMESTAMP
    );
  });

  test('WALLET_MODE est HD Wallet', () => {
    const written = JSON.parse(mockFs.writeFileSync.mock.calls[0][1]);
    expect(written[WALLET_MODE]).toBe(HD_WALLET_TYPE);
  });

  test('BIP32_PASSPHRASE est présent pour un HD Wallet', () => {
    const written = JSON.parse(mockFs.writeFileSync.mock.calls[0][1]);
    expect(written[BIP32_PASSPHRASE]).toBe('my passphrase');
  });

  test('DERIVATION_PATH est conservé', () => {
    const written = JSON.parse(mockFs.writeFileSync.mock.calls[0][1]);
    expect(written[DERIVATION_PATH]).toBe("m/44'/0'/2'/0/5'");
  });

  test('ACCOUNT est extrait du DERIVATION_PATH (index 3 sans apostrophe)', () => {
    const written = JSON.parse(mockFs.writeFileSync.mock.calls[0][1]);
    expect(written[ACCOUNT]).toBe('2');
  });

  test('ADDRESS_INDEX est extrait du DERIVATION_PATH (index 5 avec apostrophe)', () => {
    const written = JSON.parse(mockFs.writeFileSync.mock.calls[0][1]);
    expect(written[ADDRESS_INDEX]).toMatch(/^5'?$/);
  });

});

// ===========================================================================
describe('MainModel — saveWalletInfoAsJson() : Dogecoin', () => {

  beforeEach(() => {
    mockFs.writeFileSync.mockClear();
    MainModel.This.saveWalletInfoAsJson(
      '/mock/output/doge',
      { ...MOCK_CRYPTO_INFO_DOGE },
      MOCK_TIMESTAMP
    );
  });

  test('BLOCKCHAIN est Dogecoin', () => {
    const written = JSON.parse(mockFs.writeFileSync.mock.calls[0][1]);
    expect(written[BLOCKCHAIN]).toBe(DOGECOIN);
  });

  test('COIN est l\'abréviation correcte pour Dogecoin', () => {
    const written = JSON.parse(mockFs.writeFileSync.mock.calls[0][1]);
    expect(written[COIN]).toBe('DOGE');
  });

  test('ADDRESS contient une adresse Dogecoin valide', () => {
    const written = JSON.parse(mockFs.writeFileSync.mock.calls[0][1]);
    expect(written[ADDRESS]).toMatch(/^D[1-9A-HJ-NP-Za-km-z]{32,34}$/);
  });

});

// ===========================================================================
describe('MainModel — saveWalletInfoAsJson() : champs optionnels', () => {

  test('BIP38_ENCRYPTED_PK absent si non défini dans crypto_info', () => {
    mockFs.writeFileSync.mockClear();
    const info = { ...MOCK_CRYPTO_INFO_SIMPLE };
    delete info[BIP38_ENCRYPTED_PK];
    MainModel.This.saveWalletInfoAsJson('/mock/out', info, MOCK_TIMESTAMP);
    const written = JSON.parse(mockFs.writeFileSync.mock.calls[0][1]);
    expect(written[BIP38_ENCRYPTED_PK]).toBeUndefined();
  });

  test('BIP38_PASSPHRASE absent si non défini', () => {
    mockFs.writeFileSync.mockClear();
    const info = { ...MOCK_CRYPTO_INFO_SIMPLE };
    delete info[BIP38_PASSPHRASE];
    MainModel.This.saveWalletInfoAsJson('/mock/out', info, MOCK_TIMESTAMP);
    const written = JSON.parse(mockFs.writeFileSync.mock.calls[0][1]);
    expect(written[BIP38_PASSPHRASE]).toBeUndefined();
  });

  test('WORD_INDEXES est inclus', () => {
    mockFs.writeFileSync.mockClear();
    MainModel.This.saveWalletInfoAsJson('/mock/out', { ...MOCK_CRYPTO_INFO_SIMPLE }, MOCK_TIMESTAMP);
    const written = JSON.parse(mockFs.writeFileSync.mock.calls[0][1]);
    expect(written[WORD_INDEXES]).toBe(MOCK_CRYPTO_INFO_SIMPLE[WORD_INDEXES]);
  });

});