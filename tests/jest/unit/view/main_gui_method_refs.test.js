/**
 * main_gui_method_refs.test.js
 *
 * Static check: every 'this.X()' in main_gui.js and every 'MainGUI.This.X()' in the vizjets
 * must call a method actually defined in MainGUI.
 * Regression (0.5.30 renames): Bip39UpdatePassphrase / GuiApplyPassword / generateRandomFields
 * were called but not defined => Bip39 passphrase never applied nor saved, Regenerate icon broken.
 */
const fs   = require('fs');
const path = require('path');

const ROOT_DIR     = path.resolve(__dirname, '../../../..');
const MAIN_GUI_JS  = path.join(ROOT_DIR, 'www/js/view/main_gui.js');
const VIZJETS_DIR  = path.join(ROOT_DIR, 'www/vizjets');

const METHOD_DEF_REGEX   = /^\s*(?:static\s+)?(?:async\s+)?(?:get\s+|set\s+)?([A-Za-z_]\w*)\s*\([^)]*\)\s*\{/gm;
const THIS_CALL_REGEX    = /\bthis\.([A-Za-z_]\w*)\s*\(/g;
const MAINGUI_CALL_REGEX = /MainGUI\.This\.([A-Za-z_]\w*)\s*\(/g;

const BIP39_PASSPHRASE_METHODS = [
  'Bip39UpdatePassphrase', 'Bip39ApplyPassword', 'Bip39SetPassphraseApplyState',
  'GuiGenerateBip39Passphrase', 'GuiClearBip39Passphrase',
];

const main_gui_src    = fs.readFileSync(MAIN_GUI_JS, 'utf8');
const defined_methods = new Set([...main_gui_src.matchAll(METHOD_DEF_REGEX)].map((m) => m[1]));

const listJsFiles = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? listJsFiles(path.join(dir, e.name))
                    : (e.name.endsWith('.js') ? [path.join(dir, e.name)] : []));

const undefinedCalls = (src, regex) =>
  [...new Set([...src.matchAll(regex)].map((m) => m[1]))].filter((n) => !defined_methods.has(n));

describe('MainGUI — method references', () => {

  test('Bip39 passphrase methods are defined', () => {
    BIP39_PASSPHRASE_METHODS.forEach((name) => expect(defined_methods.has(name)).toBe(true));
  });

  test("every 'this.X()' in main_gui.js is a defined MainGUI method", () => {
    expect(undefinedCalls(main_gui_src, THIS_CALL_REGEX)).toEqual([]);
  });

  test.each(listJsFiles(VIZJETS_DIR).map((f) => [path.relative(ROOT_DIR, f), f]))(
    "every 'MainGUI.This.X()' in %s is a defined MainGUI method", (_rel, file_path) => {
      expect(undefinedCalls(fs.readFileSync(file_path, 'utf8'), MAINGUI_CALL_REGEX)).toEqual([]);
    });

});
