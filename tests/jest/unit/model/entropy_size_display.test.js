/**
 * ============================================================================
 * Unit tests - Entropy size: display and default value
 * ============================================================================
 * 1. Every node id of WalletInfo.GUI_NODE_IDs (js/view/model/wallet_info.js,
 *    the file loaded by index.html) exists in
 *    index.html. 'ENTROPY_SIZE' pointed to "entropy_bits_select_id", which
 *    does not exist: the 'Entropy' combo was never updated (it kept showing
 *    "256 bits" after choosing 12 words).
 * 2. The built-in DEFAULT_OPTIONS (const_default_options.js, used when
 *    'options.json' is not found) have the same 'Entropy Size' as
 *    'www/config/defaults/options.json': 256 bits, as numbers (was "128").
 * ============================================================================
 */
const fs   = require('fs');
const path = require('path');

const { DEFAULT_OPTIONS } = require('@crypto/const_default_options.js');
const { ENTROPY_SIZE, HD_WALLET_TYPE, SWORD_WALLET_TYPE, SIMPLE_WALLET_TYPE } = require('@www/js/const_keywords.js');
const { BIP39_ENTROPY_BIT_SIZES } = require('@crypto/const_wallet.js');

const WWW_DIR              = path.join(__dirname, '../../../../www');
const INDEX_HTML           = fs.readFileSync(path.join(WWW_DIR, 'index.html'), 'utf8');
// NB: the Renderer loads 'js/view/model/wallet_info.js' ('js/model/wallet_info.js' is an unused older copy)
const WALLET_INFO_FILE     = 'js/view/model/wallet_info.js';
const WALLET_INFO_SOURCE   = fs.readFileSync(path.join(WWW_DIR, WALLET_INFO_FILE), 'utf8');
const DEFAULTS_OPTIONS_JSON = JSON.parse(fs.readFileSync(path.join(WWW_DIR, 'config/defaults/options.json'), 'utf8'));

const ENTROPY_SIZE_SELECT_ID = 'entropy_size_select_id';
const DEFAULT_ENTROPY_BITS   = 256;
const WALLET_MODES           = [HD_WALLET_TYPE, SWORD_WALLET_TYPE, SIMPLE_WALLET_TYPE];

// Node ids (string values) of the static 'GUI_NODE_IDs' table of wallet_info.js
const guiNodeIds = () => {
  const start = WALLET_INFO_SOURCE.indexOf('static GUI_NODE_IDs');
  const end   = WALLET_INFO_SOURCE.indexOf('};', start);
  const block = WALLET_INFO_SOURCE.slice(start, end);
  return [...block.matchAll(/:\s*"([^"]*)"/g)].map((match) => match[1]).filter((id) => id !== "");
};

describe('WalletInfo.GUI_NODE_IDs: every node exists in index.html', () => {
  const ids = guiNodeIds();

  test('index.html loads this wallet_info.js', () => {
    expect(INDEX_HTML).toContain(`src="./${WALLET_INFO_FILE}"`);
  });

  test('the table is found and not empty', () => {
    expect(ids.length).toBeGreaterThan(10);
  });

  test.each(ids)('id="%s" exists in index.html', (id) => {
    expect(INDEX_HTML).toContain(`id="${id}"`);
  });

  test('ENTROPY_SIZE is displayed in the Entropy combo (entropy_size_select_id)', () => {
    expect(ids).toContain(ENTROPY_SIZE_SELECT_ID);
    expect(ids).not.toContain('entropy_bits_select_id');
  });
});

describe('DEFAULT_OPTIONS: default entropy size', () => {
  test.each(WALLET_MODES)('%s: 256 bits, as a number', (wallet_mode) => {
    expect(DEFAULT_OPTIONS[ENTROPY_SIZE][wallet_mode]).toBe(DEFAULT_ENTROPY_BITS);
  });

  test('same "Entropy Size" as www/config/defaults/options.json', () => {
    expect(DEFAULT_OPTIONS[ENTROPY_SIZE]).toEqual(DEFAULTS_OPTIONS_JSON[ENTROPY_SIZE]);
  });

  test.each(WALLET_MODES)('%s: default entropy size is a BIP39 entropy size', (wallet_mode) => {
    expect(BIP39_ENTROPY_BIT_SIZES).toContain(DEFAULT_OPTIONS[ENTROPY_SIZE][wallet_mode]);
  });
});
