/**
 * ============================================================================
 * MainGUI Sandbox - loads the Renderer file 'www/js/view/main_gui.js' in Node
 * ============================================================================
 * 'main_gui.js' is a Renderer (browser) script: it relies on globals (DOM,
 * HtmlUtils, window.ipcMain, constants from const_keywords.js / const_gui.js)
 * and instantiates its Singleton at load time.
 *
 * This helper evaluates the real source files in a 'vm' context where:
 *   - const_keywords.js and const_gui.js provide the REAL constants
 *   - DOM elements are simple in-memory objects (see 'el()')
 *   - HtmlUtils is a minimal fake backed by those elements
 *   - window.ipcMain.Bip85DeriveBip39 calls the REAL Bip85Utils
 *     (same code as the Main process IPC handler in electron_main.js)
 *   - any other unknown global resolves to an inert "stub" proxy
 *
 * A NEW sandbox (fresh Singleton) is created for each call: no shared state
 * between tests (no fragile 'beforeAll').
 * ============================================================================
 */

const vm   = require('vm');
const fs   = require('fs');
const path = require('path');

const { Bip85Utils } = require('@crypto/bip85_utils.js');

const WWW_JS_DIR = path.join(__dirname, '../../../../../www/js');

const SOURCE_FILES = [
  path.join(WWW_JS_DIR, 'const_keywords.js'),
  path.join(WWW_JS_DIR, 'view/const_gui.js'),
  path.join(WWW_JS_DIR, 'view/main_gui.js'),
];

// Inert proxy: callable, any property is another stub, converts to its name
const makeStub = (name) => new Proxy(function () {}, {
  get(target, prop) {
    if (prop === Symbol.toPrimitive || prop === 'toString') return () => name;
    if (prop === 'then') return undefined; // not a Promise
    return makeStub(name + '.' + String(prop));
  },
  apply()     { return makeStub(name + '()'); },
  construct() { return makeStub('new ' + name); },
});

// Top-level 'const' => 'var' so all files share the sandbox global scope
const loadSource = (file_path) =>
  fs.readFileSync(file_path, 'utf8')
    .replace(/\r/g, '')
    .replace(/^"use strict";/m, '')
    .replace(/^const\s+(\w+)\s*=/gm, 'var $1 =');

const createMainGuiSandbox = () => {
  const elements = {};
  const el = (id) => {
    const key = String(id);
    if (elements[key] === undefined) {
      elements[key] = {
        id: key, value: '', checked: false, innerText: '', src: '',
        style: {}, attributes: {},
        setAttribute(name, value) { this.attributes[name] = value; },
        removeAttribute(name)     { delete this.attributes[name]; },
        classList: { add() {}, remove() {} },
      };
    }
    return elements[key];
  };

  const derive_calls = [];
  const ipcMain = new Proxy({}, {
    get(target, prop) {
      if (prop in target) return target[prop];
      return makeStub('ipcMain.' + String(prop));
    },
  });
  ipcMain.Bip85DeriveBip39 = async ({ entropy, bip85_index, bip85_entropy_size }) => {
    derive_calls.push({ entropy, bip85_index, bip85_entropy_size });
    return Bip85Utils.This.deriveToBip85Infos(entropy, bip85_index, bip85_entropy_size);
  };

  const scope = {
    // NB: 'undefined', NaN... must be explicit: the 'with' proxy would otherwise turn them into stubs
    undefined, NaN, Infinity,
    console, Symbol, JSON, Object, Array, String, Number, Math, Promise, Error, parseInt, isNaN,
    trace2Main: () => {},
    pretty_func_header_format: (...args) => args.join(' '),
    pretty_format: () => '',
    _RED_: '', _END_: '', _CYAN_: '', _YELLOW_: '', _GREEN_: '',
    isString:      (value) => typeof value === 'string',
    valueIsNumber: (value) => typeof value === 'number' && ! isNaN(value),
    document: { getElementById: el },
    window:   { ipcMain },
    HtmlUtils: {
      // NB: a checkbox value is its 'checked' state
      GetElementValue: (id) => { const elt = el(id); return (elt.type === 'checkbox') ? elt.checked : elt.value; },
      SetElementValue: (id, value) => { el(id).value = value; },
      GetElement: el,
      ShowElement() {}, HideElement() {}, AddClass() {}, RemoveClass() {},
    },
  };

  const scope_proxy = new Proxy({}, {
    has: () => true,
    get(target, prop) {
      if (prop === Symbol.unscopables) return undefined;
      if (prop in scope) return scope[prop];
      return (scope[prop] = makeStub(String(prop)));
    },
    set(target, prop, value) { scope[prop] = value; return true; },
  });

  const out = {};
  scope.__out = out;
  const code = 'with (__scope) {\n'
             + SOURCE_FILES.map(loadSource).join('\n;\n')
             + '\n__out.MainGUI = MainGUI;\n}';
  vm.runInNewContext(code, { __scope: scope_proxy }, { filename: 'main_gui_sandbox.js' });

  const gui = out.MainGUI.This;

  // ---- In-memory wallet_info (attributes only) ----
  const attributes = {};
  gui.wallet_info = {
    attributes,
    getAttribute: (name) => attributes[name],
    setAttribute: (name, value) => { attributes[name] = value; },
  };
  attributes[scope.WALLET_MODE] = scope.HD_WALLET_TYPE;

  // ---- Heavy / out-of-scope collaborators replaced by spies ----
  const address_calls = [];
  gui.updateMnemonics         = async () => {};
  gui.updateChecksum          = async () => {};
  gui.setEntropyValueValidity = () => {};
  gui.generateHDWalletAddress     = async (blockchain, entropy_hex) => { address_calls.push(entropy_hex); return {}; };
  gui.generateSimpleWalletAddress = gui.generateHDWalletAddress;
  gui.getOptions = async () => ({ [scope.PREMIUM_ALLOWED]: true });
  gui.showBip85EnableWarningDialog = async () => true; // [OK] by default

  // ---- Bip85 GUI defaults (as in index.html) ----
  el(scope.BIP85_ENABLE_DISABLE_BTN_ID).type = 'checkbox';
  el(scope.BIP85_INDEX_ID).value        = '0';
  el(scope.BIP85_ENTROPY_SIZE_ID).value = '256';

  return {
    gui, scope, el, attributes, derive_calls, address_calls, ipcMain,
    K: scope, // constants (e.g. K.ENTROPY_ID, K.BIP85_INIT_ENTROPY)
    entropy:         () => el(scope.ENTROPY_ID).value,
    initialEntropy:  () => el(scope.BIP85_INIT_ENTROPY_ID).value,
    derivedEntropy:  () => el(scope.BIP85_DERIVED_ENTROPY_ID).value,
    lastAddressEntropy: () => address_calls[address_calls.length - 1],
    // Simulates a click on the 'Enable Bip85' checkbox
    clickEnableCheckbox: async (checked) => {
      el(scope.BIP85_ENABLE_DISABLE_BTN_ID).checked = checked;
      await gui.onEnableDisableBip85();
    },
  };
};

module.exports = { createMainGuiSandbox };
