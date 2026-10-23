/**
 * ============================================================================
 * E2E helpers - user actions on the Cryptocalc GUI
 * ============================================================================
 * Only real user gestures: select options, paste in a field, click buttons,
 * click on a menu item. No direct call to the application code.
 * ============================================================================
 */
const { expect } = require('@playwright/test');

const IDS = {
  SEED_TAB:        '#seed_tab_link_id',
  WALLET_TAB:      '#wallet_tab_link_id',
  WORD_COUNT:      '#word_count_select_id',
  ENTROPY:         'entropy_id',
  MNEMONICS:       '#mnemonics_id',
  WALLET_MODE:     '#wallet_mode_select_id',
  BLOCKCHAIN:      '#wallet_blockchain_id',
  ADDRESS:         '#address_id',
  PRIVATE_KEY:     '#private_key_id',
  GENERATE:        '#generate_btn_id',
  EDIT_PASSPHRASE: '#edit_bip39_passphrase_btn_id',
  PASSPHRASE_INPUT:'#passphrase_input_id',
  PASSPHRASE_APPLY:'#passphrase_dialog_apply_btn_id',
};

const WALLET_MODES = { SIMPLE: 'Simple Wallet', HD: 'HD Wallet' };

const POLL_TIMEOUT = 20000; // wallet derivation is asynchronous (IPC to the Main process)
const UI_DELAY     = 500;

// Pastes 'text' in the field 'id' (real 'paste' event with clipboard data)
const pasteInField = (page, id, text) => page.evaluate(({ id, text }) => {
  const field = document.getElementById(id);
  field.focus();
  const clipboard = new DataTransfer();
  clipboard.setData('text', text);
  field.dispatchEvent(new ClipboardEvent('paste', { clipboardData: clipboard, bubbles: true, cancelable: true }));
}, { id, text });

const readValue = (page, selector) => page.evaluate((selector) => {
  const element = document.querySelector(selector);
  if (element == null) return null;
  return (('value' in element) ? element.value : element.textContent).trim();
}, selector);

const openSeedTab   = async (page) => { await page.click(IDS.SEED_TAB);   await page.waitForTimeout(UI_DELAY); };
const openWalletTab = async (page) => { await page.click(IDS.WALLET_TAB); await page.waitForTimeout(UI_DELAY); };

// Word count must be chosen while the entropy source is active (before pasting an entropy)
const selectWordCount = async (page, words) => {
  await openSeedTab(page);
  await page.selectOption(IDS.WORD_COUNT, String(words));
  await page.waitForTimeout(UI_DELAY);
};

const pasteEntropy = async (page, entropy_hex) => {
  await openSeedTab(page);
  await pasteInField(page, IDS.ENTROPY, entropy_hex);
  await expect.poll(() => readValue(page, '#' + IDS.ENTROPY), { timeout: POLL_TIMEOUT }).toBe(entropy_hex);
};

const selectWalletMode = async (page, mode) => {
  await openWalletTab(page);
  await page.selectOption(IDS.WALLET_MODE, mode);
  await page.waitForTimeout(UI_DELAY);
};

const selectBlockchain = async (page, label) => {
  await openWalletTab(page);
  await page.selectOption(IDS.BLOCKCHAIN, label);
  await page.waitForTimeout(UI_DELAY);
};

// Real flow: [Edit] (pen icon) -> type the passphrase -> [Apply]
const applyBip39Passphrase = async (page, passphrase) => {
  await openSeedTab(page);
  await page.click(IDS.EDIT_PASSPHRASE);
  await page.fill(IDS.PASSPHRASE_INPUT, passphrase);
  await page.click(IDS.PASSPHRASE_APPLY);
  await page.waitForTimeout(UI_DELAY);
};

const expectAddress = async (page, expected) => {
  await openWalletTab(page);
  await expect.poll(() => readValue(page, IDS.ADDRESS), { timeout: POLL_TIMEOUT }).toBe(expected);
};

// Clicks the menu item whose label matches 'label_regex' (Main process menu)
const clickMenuItem = (electronApp, label_regex) => electronApp.evaluate(({ Menu }, source) => {
  const regex = new RegExp(source, 'i');
  const find = (items) => {
    for (const item of items) {
      if (regex.test(item.label)) { item.click(); return item.label; }
      if (item.submenu) { const found = find(item.submenu.items); if (found) return found; }
    }
    return null;
  };
  return find(Menu.getApplicationMenu().items);
}, label_regex);

module.exports = {
  IDS, WALLET_MODES, POLL_TIMEOUT, UI_DELAY,
  pasteInField, readValue, openSeedTab, openWalletTab,
  selectWordCount, pasteEntropy, selectWalletMode, selectBlockchain,
  applyBip39Passphrase, expectAddress, clickMenuItem,
};
