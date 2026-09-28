/**
 * ============================================================================
 * Unit Tests - MainGUI: Bip85 mode activation / deactivation
 * ============================================================================
 * Location: www/js/view/main_gui.js (Renderer script)
 * Spec:     README.md, 5.1.6 'BIP85 derivation'
 *
 * The REAL 'main_gui.js' (+ const_keywords.js, const_gui.js) is loaded in a
 * 'vm' sandbox (see helpers/main_gui_sandbox.js). BIP85 derivation uses the
 * REAL Bip85Utils. Only DOM, HtmlUtils, wallet address generation and
 * mnemonics display are faked.
 *
 * A new sandbox is created in each test (no shared state, no 'beforeAll').
 * ============================================================================
 */

// ============================================================================
// IMPORTS
// ============================================================================

const { createMainGuiSandbox } = require('./helpers/main_gui_sandbox.js');
const { Bip85Utils }           = require('@crypto/bip85_utils.js');

// ============================================================================
// TEST FIXTURES
// ============================================================================

const ENTROPY_A_128 = '00112233445566778899aabbccddeeff';
const ENTROPY_B_128 = 'ffeeddccbbaa99887766554433221100';
const ENTROPY_C_256 = '8a49b1a4b05dca8982a7d35a225093cecbd4d3b23c3f52517ec664434359bc4c';

const DEFAULT_BIP85_INDEX        = 0;
const DEFAULT_BIP85_ENTROPY_SIZE = 256;

const EDITED_BIP85_INDEX        = 5;
const EDITED_BIP85_ENTROPY_SIZE = 128;

const LABEL_GENERATE_DISABLED   = 'Generate';
const LABEL_GENERATE_ENABLED    = 'Bip85 Generate';
const LABEL_ENTROPY_DISABLED    = 'Entropy';
const LABEL_ENTROPY_ENABLED     = 'Bip85 Entropy';
const LABEL_SEEDPHRASE_DISABLED = 'Seedphrase';
const LABEL_SEEDPHRASE_ENABLED  = 'Bip85 Seedphrase';
const MODE_ENABLED              = 'enabled';
const MODE_DISABLED             = 'disabled';

const BITS_PER_HEX_DIGIT = 4;
const WORD_COUNTS        = { 128: 12, 160: 15, 192: 18, 224: 21, 256: 24 };

// ============================================================================
// HELPERS
// ============================================================================

// Expected 'Bip85 Entropy' computed independently with Bip85Utils
const bip85Entropy = (initial_entropy, index, entropy_size) =>
  Bip85Utils.This.deriveToBip85Infos(initial_entropy, index, entropy_size).bip85_entropy;

const bip85Mnemonics = (initial_entropy, index, entropy_size) =>
  Bip85Utils.This.deriveToBip85Infos(initial_entropy, index, entropy_size).bip85_mnemonics;

// Sandbox with 'ENTROPY_A_128' as current (non Bip85) entropy
const createSandboxWithEntropy = async (entropy = ENTROPY_A_128) => {
  const sb = createMainGuiSandbox();
  await sb.gui.updateEntropy(entropy);
  return sb;
};

// Sandbox with Bip85 mode enabled (user clicked the checkbox then [OK])
const createBip85EnabledSandbox = async (entropy = ENTROPY_A_128) => {
  const sb = await createSandboxWithEntropy(entropy);
  await sb.clickEnableCheckbox(true);
  return sb;
};

const expectWalletEntropySize = (sb, entropy_size) => {
  const { K, attributes } = sb;
  expect(attributes[K.ENTROPY_SIZE]).toBe(entropy_size);
  expect(attributes[K.WORD_COUNT]).toBe(WORD_COUNTS[entropy_size]);
  expect(attributes[K.EXPECTED_ENTROPY_DIGITS]).toBe(entropy_size / BITS_PER_HEX_DIGIT);
  expect(sb.el(K.ENTROPY_ID).attributes['maxlength']).toBe(entropy_size / BITS_PER_HEX_DIGIT);
};

const expectLabels = (sb, enabled) => {
  const { K, el } = sb;
  expect(el(K.GENERATE_BTN_ID).value)        .toBe(enabled ? LABEL_GENERATE_ENABLED   : LABEL_GENERATE_DISABLED);
  expect(el(K.ENTROPY_LABEL_ID).innerText)   .toBe(enabled ? LABEL_ENTROPY_ENABLED    : LABEL_ENTROPY_DISABLED);
  expect(el(K.SEEDPHRASE_LABEL_ID).innerText).toBe(enabled ? LABEL_SEEDPHRASE_ENABLED : LABEL_SEEDPHRASE_DISABLED);
  expect(el(K.BIP85_MODE_ID).value)          .toBe(enabled ? MODE_ENABLED             : MODE_DISABLED);
};

// ============================================================================
// TESTS
// ============================================================================

describe('MainGUI - Bip85 mode', () => {

  // --------------------------------------------------------------------------
  describe('Bip85 disabled (default)', () => {
    test('Bip85 is disabled at startup', () => {
      const sb = createMainGuiSandbox();
      expect(sb.gui.bip85_enable).toBe(false);
    });

    test('updateEntropy(): entropy unchanged, Bip85 derivation is only a preview', async () => {
      const sb = await createSandboxWithEntropy(ENTROPY_A_128);
      expect(sb.entropy()).toBe(ENTROPY_A_128);
      expect(sb.initialEntropy()).toBe(ENTROPY_A_128);
      expect(sb.derivedEntropy()).toBe(bip85Entropy(ENTROPY_A_128, DEFAULT_BIP85_INDEX, DEFAULT_BIP85_ENTROPY_SIZE));
      expect(sb.el(sb.K.BIP85_DERIVED_SEEDPHRASE_ID).value)
        .toBe(bip85Mnemonics(ENTROPY_A_128, DEFAULT_BIP85_INDEX, DEFAULT_BIP85_ENTROPY_SIZE));
      expect(sb.lastAddressEntropy()).toBe(ENTROPY_A_128);
    });

    test('updateEntropy() does not change wallet entropy size', async () => {
      const sb = await createSandboxWithEntropy(ENTROPY_A_128);
      expect(sb.attributes[sb.K.ENTROPY_SIZE]).toBeUndefined();
    });

    test('Bip85 parameters are stored in wallet_info', async () => {
      const sb = await createSandboxWithEntropy(ENTROPY_A_128);
      const { K, attributes } = sb;
      expect(attributes[K.BIP85_INIT_ENTROPY]).toBe(ENTROPY_A_128);
      expect(attributes[K.BIP85_INDEX]).toBe(DEFAULT_BIP85_INDEX);
      expect(attributes[K.BIP85_ENTROPY_SIZE]).toBe(DEFAULT_BIP85_ENTROPY_SIZE);
    });
  });

  // --------------------------------------------------------------------------
  describe('Activation', () => {
    test('[OK]: current Entropy becomes Initial Entropy and is replaced by Bip85 Entropy', async () => {
      const sb = await createBip85EnabledSandbox(ENTROPY_A_128);
      const expected = bip85Entropy(ENTROPY_A_128, DEFAULT_BIP85_INDEX, DEFAULT_BIP85_ENTROPY_SIZE);
      expect(sb.gui.bip85_enable).toBe(true);
      expect(sb.initialEntropy()).toBe(ENTROPY_A_128);
      expect(sb.entropy()).toBe(expected);
      expect(sb.attributes[sb.K.ENTROPY]).toBe(expected);
    });

    test('[OK]: wallet is recomputed from the Bip85 Entropy', async () => {
      const sb = await createBip85EnabledSandbox(ENTROPY_A_128);
      expect(sb.lastAddressEntropy())
        .toBe(bip85Entropy(ENTROPY_A_128, DEFAULT_BIP85_INDEX, DEFAULT_BIP85_ENTROPY_SIZE));
    });

    test('[OK]: labels are renamed (Bip85 Generate / Bip85 Entropy / Bip85 Seedphrase)', async () => {
      const sb = await createBip85EnabledSandbox();
      expectLabels(sb, true);
    });

    test('[OK]: wallet entropy size is aligned on Bip85 entropy size', async () => {
      const sb = await createBip85EnabledSandbox(ENTROPY_A_128); // 128 bits -> Bip85 256 bits
      expectWalletEntropySize(sb, DEFAULT_BIP85_ENTROPY_SIZE);
    });

    test('[Cancel]: nothing changes and checkbox is unchecked', async () => {
      const sb = await createSandboxWithEntropy(ENTROPY_A_128);
      sb.gui.showBip85EnableWarningDialog = async () => false;
      const address_count = sb.address_calls.length;

      await sb.clickEnableCheckbox(true);

      expect(sb.gui.bip85_enable).toBe(false);
      expect(sb.el(sb.K.BIP85_ENABLE_DISABLE_BTN_ID).checked).toBe(false);
      expect(sb.entropy()).toBe(ENTROPY_A_128);
      expect(sb.address_calls.length).toBe(address_count);
      expectLabels(sb, false);
    });

    test('warning dialog is shown only when enabling', async () => {
      const sb = await createBip85EnabledSandbox();
      const dialog = jest.fn(async () => true);
      sb.gui.showBip85EnableWarningDialog = dialog;
      await sb.clickEnableCheckbox(false);
      expect(dialog).not.toHaveBeenCalled();
    });

    test('setBip85Enabled(true) twice does not derive twice', async () => {
      const sb = await createBip85EnabledSandbox(ENTROPY_A_128);
      const entropy = sb.entropy();
      await sb.gui.setBip85Enabled(true);
      expect(sb.entropy()).toBe(entropy);
      expect(sb.initialEntropy()).toBe(ENTROPY_A_128);
    });
  });

  // --------------------------------------------------------------------------
  describe('Bip85 enabled: entropy updates', () => {
    test('refresh with current Bip85 Entropy (Account, Address Index, Bip39 passphrase) does not re-derive', async () => {
      const sb = await createBip85EnabledSandbox(ENTROPY_A_128);
      const bip85_entropy = sb.entropy();
      const derive_count  = sb.derive_calls.length;

      await sb.gui.updateEntropy(sb.gui.Entropy);

      expect(sb.derive_calls.length).toBe(derive_count);
      expect(sb.entropy()).toBe(bip85_entropy);
      expect(sb.initialEntropy()).toBe(ENTROPY_A_128);
      expect(sb.lastAddressEntropy()).toBe(bip85_entropy);
    });

    test('updateBip39Passphrase() keeps Initial and Bip85 Entropy', async () => {
      const sb = await createBip85EnabledSandbox(ENTROPY_A_128);
      const bip85_entropy = sb.entropy();
      await sb.gui.updateBip39Passphrase('passphrase');
      expect(sb.entropy()).toBe(bip85_entropy);
      expect(sb.initialEntropy()).toBe(ENTROPY_A_128);
    });

    test('[Bip85 Generate]: new entropy becomes the new Initial Entropy and is derived', async () => {
      const sb = await createBip85EnabledSandbox(ENTROPY_A_128);
      await sb.gui.updateEntropy(ENTROPY_B_128); // what updateFields() does after [Bip85 Generate]
      const expected = bip85Entropy(ENTROPY_B_128, DEFAULT_BIP85_INDEX, DEFAULT_BIP85_ENTROPY_SIZE);
      expect(sb.initialEntropy()).toBe(ENTROPY_B_128);
      expect(sb.entropy()).toBe(expected);
      expect(sb.lastAddressEntropy()).toBe(expected);
    });

    test('derivation failure: entropy is kept as is', async () => {
      const sb = await createBip85EnabledSandbox(ENTROPY_A_128);
      sb.ipcMain.Bip85DeriveBip39 = async () => { throw new Error('IPC failure'); };
      await sb.gui.updateEntropy(ENTROPY_B_128);
      expect(sb.entropy()).toBe(ENTROPY_B_128);
      expect(sb.lastAddressEntropy()).toBe(ENTROPY_B_128);
    });
  });

  // --------------------------------------------------------------------------
  describe('Bip85 parameters (Edit dialog / Entropy Size selectors)', () => {
    test('Bip85 enabled: Initial Entropy unchanged, Bip85 Entropy recomputed, wallet recomputed', async () => {
      const sb = await createBip85EnabledSandbox(ENTROPY_A_128);
      await sb.gui.onApplyBip85Params({ bip85_index: EDITED_BIP85_INDEX, bip85_entropy_size: EDITED_BIP85_ENTROPY_SIZE });
      const expected = bip85Entropy(ENTROPY_A_128, EDITED_BIP85_INDEX, EDITED_BIP85_ENTROPY_SIZE);
      expect(sb.initialEntropy()).toBe(ENTROPY_A_128);
      expect(sb.entropy()).toBe(expected);
      expect(sb.lastAddressEntropy()).toBe(expected);
      expect(sb.el(sb.K.BIP85_INDEX_ID).value).toBe(EDITED_BIP85_INDEX);
      expect(sb.el(sb.K.BIP85_ENTROPY_SIZE_ID).value).toBe(EDITED_BIP85_ENTROPY_SIZE);
    });

    test('Bip85 enabled: wallet entropy size follows the new Bip85 entropy size', async () => {
      const sb = await createBip85EnabledSandbox(ENTROPY_A_128);
      await sb.gui.onApplyBip85Params({ bip85_index: EDITED_BIP85_INDEX, bip85_entropy_size: EDITED_BIP85_ENTROPY_SIZE });
      expectWalletEntropySize(sb, EDITED_BIP85_ENTROPY_SIZE);
    });

    test("'data.entropy' from the dialog is ignored (Initial Entropy is used)", async () => {
      const sb = await createBip85EnabledSandbox(ENTROPY_A_128);
      await sb.gui.onApplyBip85Params({ entropy: sb.entropy(), bip85_index: 1, bip85_entropy_size: 256 });
      expect(sb.initialEntropy()).toBe(ENTROPY_A_128);
      expect(sb.entropy()).toBe(bip85Entropy(ENTROPY_A_128, 1, 256));
    });

    test('Bip85 disabled: preview only, entropy and wallet unchanged', async () => {
      const sb = await createSandboxWithEntropy(ENTROPY_A_128);
      const address_count = sb.address_calls.length;
      await sb.gui.onApplyBip85Params({ bip85_index: EDITED_BIP85_INDEX, bip85_entropy_size: EDITED_BIP85_ENTROPY_SIZE });
      expect(sb.entropy()).toBe(ENTROPY_A_128);
      expect(sb.derivedEntropy()).toBe(bip85Entropy(ENTROPY_A_128, EDITED_BIP85_INDEX, EDITED_BIP85_ENTROPY_SIZE));
      expect(sb.address_calls.length).toBe(address_count);
      expect(sb.attributes[sb.K.ENTROPY_SIZE]).toBeUndefined();
    });

    test.each([ 128, 160, 192, 224 ])('Bip85 enabled: wallet [Entropy Size] = %i changes Bip85 entropy size', async (entropy_size) => {
      const sb = await createBip85EnabledSandbox(ENTROPY_A_128);
      const { K } = sb;
      await sb.gui.onGuiUpdateEntropySize({ target: { id: K.ENTROPY_SIZE_SELECT_ID, value: String(entropy_size) } });
      expect(sb.el(K.BIP85_ENTROPY_SIZE_ID).value).toBe(entropy_size);
      expect(sb.initialEntropy()).toBe(ENTROPY_A_128);
      expect(sb.entropy()).toBe(bip85Entropy(ENTROPY_A_128, DEFAULT_BIP85_INDEX, entropy_size));
      expectWalletEntropySize(sb, entropy_size);
    });

    test('Bip85 enabled: wallet [Word Count] changes Bip85 entropy size (keeps Bip85 index)', async () => {
      const sb = await createBip85EnabledSandbox(ENTROPY_A_128);
      const { K } = sb;
      await sb.gui.onApplyBip85Params({ bip85_index: EDITED_BIP85_INDEX, bip85_entropy_size: 256 });
      await sb.gui.onGuiUpdateWordCount({ target: { id: K.WORD_COUNT_SELECT_ID, value: '18' } });
      expect(sb.el(K.BIP85_INDEX_ID).value).toBe(EDITED_BIP85_INDEX);
      expect(sb.entropy()).toBe(bip85Entropy(ENTROPY_A_128, EDITED_BIP85_INDEX, 192));
      expectWalletEntropySize(sb, 192);
    });

    test('Bip85 disabled: wallet [Entropy Size] uses the standard path (updateEntropySize)', async () => {
      const sb = await createSandboxWithEntropy(ENTROPY_A_128);
      const { K } = sb;
      const spy = jest.fn(async () => {});
      sb.gui.updateEntropySize = spy;
      await sb.gui.onGuiUpdateEntropySize({ target: { id: K.ENTROPY_SIZE_SELECT_ID, value: '192' } });
      expect(spy).toHaveBeenCalledWith(192);
    });
  });

  // --------------------------------------------------------------------------
  describe('Show / Hide Bip85 parameters', () => {
    test('Bip85 enabled: Show/Hide does not overwrite Initial Entropy', async () => {
      const sb = await createBip85EnabledSandbox(ENTROPY_A_128);
      sb.gui.onShowHideBip85();
      sb.gui.onShowHideBip85();
      expect(sb.initialEntropy()).toBe(ENTROPY_A_128);
      expect(sb.gui.bip85_enable).toBe(true);
    });

    test('Bip85 disabled: Show copies current Entropy to Initial Entropy', async () => {
      const sb = await createSandboxWithEntropy(ENTROPY_A_128);
      sb.gui.Entropy = ENTROPY_B_128;
      sb.gui.onShowHideBip85();
      expect(sb.initialEntropy()).toBe(ENTROPY_B_128);
    });
  });

  // --------------------------------------------------------------------------
  describe('Deactivation', () => {
    test('Initial Entropy is restored as the current Entropy', async () => {
      const sb = await createBip85EnabledSandbox(ENTROPY_A_128);
      await sb.clickEnableCheckbox(false);
      expect(sb.gui.bip85_enable).toBe(false);
      expect(sb.entropy()).toBe(ENTROPY_A_128);
      expect(sb.lastAddressEntropy()).toBe(ENTROPY_A_128);
    });

    test('labels are restored', async () => {
      const sb = await createBip85EnabledSandbox();
      await sb.clickEnableCheckbox(false);
      expectLabels(sb, false);
    });

    test('wallet entropy size is aligned on the restored Initial Entropy', async () => {
      const sb = await createBip85EnabledSandbox(ENTROPY_A_128); // 128 bits
      expectWalletEntropySize(sb, 256);
      await sb.clickEnableCheckbox(false);
      expectWalletEntropySize(sb, 128);
    });

    test('after [Bip85 Generate], the last Initial Entropy is restored', async () => {
      const sb = await createBip85EnabledSandbox(ENTROPY_A_128);
      await sb.gui.updateEntropy(ENTROPY_C_256);
      await sb.clickEnableCheckbox(false);
      expect(sb.entropy()).toBe(ENTROPY_C_256);
      expectWalletEntropySize(sb, 256);
    });

    test('re-activation derives again from the current Entropy', async () => {
      const sb = await createBip85EnabledSandbox(ENTROPY_A_128);
      await sb.clickEnableCheckbox(false);
      await sb.clickEnableCheckbox(true);
      expect(sb.initialEntropy()).toBe(ENTROPY_A_128);
      expect(sb.entropy()).toBe(bip85Entropy(ENTROPY_A_128, DEFAULT_BIP85_INDEX, DEFAULT_BIP85_ENTROPY_SIZE));
    });
  });

  // --------------------------------------------------------------------------
  describe('Premium', () => {
    test('Premium disabled while Bip85 enabled: Bip85 is disabled and Initial Entropy restored', async () => {
      const sb = await createBip85EnabledSandbox(ENTROPY_A_128);
      const { K } = sb;
      sb.gui.getOptions = async () => ({ [K.PREMIUM_ALLOWED]: false });
      await sb.gui.checkPremium();
      expect(sb.gui.bip85_enable).toBe(false);
      expect(sb.el(K.BIP85_ENABLE_DISABLE_BTN_ID).checked).toBe(false);
      expect(sb.entropy()).toBe(ENTROPY_A_128);
      expectLabels(sb, false);
    });

    test('Premium disabled while Bip85 disabled: entropy unchanged', async () => {
      const sb = await createSandboxWithEntropy(ENTROPY_A_128);
      const address_count = sb.address_calls.length;
      sb.gui.getOptions = async () => ({ [sb.K.PREMIUM_ALLOWED]: false });
      await sb.gui.checkPremium();
      expect(sb.entropy()).toBe(ENTROPY_A_128);
      expect(sb.address_calls.length).toBe(address_count);
    });

    test('Premium allowed: Bip85 mode is NOT enabled automatically', async () => {
      const sb = await createSandboxWithEntropy(ENTROPY_A_128);
      await sb.gui.checkPremium(true);
      expect(sb.gui.bip85_enable).toBe(false);
      expect(sb.entropy()).toBe(ENTROPY_A_128);
    });
  });

  // --------------------------------------------------------------------------
  describe('getWalletInfo() (data saved in wallet_info.txt / wallet_info.wits)', () => {
    // Minimal GUI state required by getWalletInfo()
    const prepareSave = (sb) => {
      const { K, el } = sb;
      el(K.WALLET_MODE_SELECT_ID).value = K.SIMPLE_WALLET_TYPE;
      el(K.WALLET_BLOCKCHAIN_ID).value  = 'Unsupported-Blockchain';
      el(K.WALLET_COIN_ID).value        = 'XXX';
      el(K.MNEMONICS_ID).value          = 'mnemonics';
      el(K.MNEMONICS_4LETTER_ID).value  = 'MNEM';
      sb.gui.isBlockchainSupported      = () => false;
      sb.ipcMain.MnemonicsToWordIndexes = async () => [ 1, 2, 3 ];
    };

    test('Bip85 enabled: Initial Entropy and Index are added (not Bip85 Entropy Size)', async () => {
      const sb = await createBip85EnabledSandbox(ENTROPY_A_128);
      await sb.gui.onApplyBip85Params({ bip85_index: EDITED_BIP85_INDEX, bip85_entropy_size: EDITED_BIP85_ENTROPY_SIZE });
      prepareSave(sb);
      const { K } = sb;

      const crypto_info = await sb.gui.getWalletInfo();

      expect(crypto_info[K.BIP85_INIT_ENTROPY]).toBe(ENTROPY_A_128);
      expect(crypto_info[K.BIP85_INDEX]).toBe(EDITED_BIP85_INDEX);
      expect(crypto_info).not.toHaveProperty(K.BIP85_ENTROPY_SIZE); // same value as ENTROPY_SIZE
      expect(crypto_info[K.ENTROPY]).toBe(bip85Entropy(ENTROPY_A_128, EDITED_BIP85_INDEX, EDITED_BIP85_ENTROPY_SIZE));
      expect(crypto_info[K.ENTROPY_SIZE]).toBe(EDITED_BIP85_ENTROPY_SIZE);
    });

    test('Bip85 disabled: no Bip85 field (even if Bip85 preview was computed)', async () => {
      const sb = await createSandboxWithEntropy(ENTROPY_A_128);
      prepareSave(sb);
      const { K } = sb;

      const crypto_info = await sb.gui.getWalletInfo();

      expect(crypto_info).not.toHaveProperty(K.BIP85_INIT_ENTROPY);
      expect(crypto_info).not.toHaveProperty(K.BIP85_INDEX);
      expect(crypto_info).not.toHaveProperty(K.BIP85_ENTROPY_SIZE);
      expect(crypto_info[K.ENTROPY]).toBe(ENTROPY_A_128);
    });

    test('Bip85 disabled after being enabled: no Bip85 field', async () => {
      const sb = await createBip85EnabledSandbox(ENTROPY_A_128);
      await sb.clickEnableCheckbox(false);
      prepareSave(sb);

      const crypto_info = await sb.gui.getWalletInfo();

      expect(crypto_info).not.toHaveProperty(sb.K.BIP85_INIT_ENTROPY);
      expect(crypto_info[sb.K.ENTROPY]).toBe(ENTROPY_A_128);
    });
  });

  // --------------------------------------------------------------------------
  describe('alignWalletEntropySize()', () => {
    test.each([ 128, 160, 192, 224, 256 ])('%i bits', (entropy_size) => {
      const sb = createMainGuiSandbox();
      sb.gui.alignWalletEntropySize(entropy_size);
      expectWalletEntropySize(sb, entropy_size);
      expect(sb.gui.expected_entropy_bytes).toBe(entropy_size / 8);
    });

    test('accepts a string', () => {
      const sb = createMainGuiSandbox();
      sb.gui.alignWalletEntropySize('192');
      expectWalletEntropySize(sb, 192);
    });

    test.each([ 0, 100, 136, 288, NaN ])('ignores invalid size %p', (entropy_size) => {
      const sb = createMainGuiSandbox();
      sb.gui.alignWalletEntropySize(entropy_size);
      expect(sb.attributes[sb.K.ENTROPY_SIZE]).toBeUndefined();
    });
  });
});
