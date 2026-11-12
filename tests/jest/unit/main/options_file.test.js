/**
 * ============================================================================
 * Unit tests - www/js/_main/options_file.js : regenerate a missing options.json
 * ============================================================================
 * readOrRegenerateOptions( config_path, builtin_defaults ):
 *   1. options.json present                    => read as is
 *   2. options.json missing                    => copy of defaults/options.json
 *   3. defaults/options.json missing as well   => written from the built-in copy
 *   + options.json empty ("", "{}", "[]")      => regenerated like a missing one
 *   + options.json with invalid JSON           => left unchanged, built-in used
 *   + defaults/options.json with invalid JSON  => built-in copy written
 *   + options.json not writable                => options in memory, no throw
 *   + the built-in options are never modified
 * Each test uses its own temporary 'config' folder (no shared state).
 * ============================================================================
 */
const fs   = require('fs');
const os   = require('os');
const path = require('path');

const {
  OPTIONS_SOURCE_FILE, OPTIONS_SOURCE_DEFAULTS_FILE, OPTIONS_SOURCE_BUILTIN,
  readOrRegenerateOptions, getOptionsPaths, cloneOptions,
} = require('@www/js/_main/options_file.js');

const { DEFAULT_OPTIONS }               = require('@crypto/const_default_options.js');
const { HASHED_SECRETS_IN_CONSOLE_LOG } = require('@www/js/const_keywords.js');

const REAL_DEFAULTS_PATH = path.join(__dirname, '../../../../www/config/defaults/options.json');

const USER_OPTIONS     = { 'Wallet Mode': 'HD Wallet', Lang: 'FR', [HASHED_SECRETS_IN_CONSOLE_LOG]: false };
const EMPTY_TEXTS      = ['', '{}', '[]', '  \n'];
const INVALID_JSON     = '{ "Lang": "FR", ';
const WRITE_ERROR_TEXT = 'EACCES: permission denied';

// ---------- helpers (one temporary folder per test) ----------
const makeConfigDir = () => {
  const config_path = fs.mkdtempSync(path.join(os.tmpdir(), 'cryptocalc-config-'));
  fs.mkdirSync(path.join(config_path, 'defaults'));
  return config_path;
};
const writeOptions  = (config_path, text) => fs.writeFileSync(getOptionsPaths(config_path).options_path, text);
const writeDefaults = (config_path, text) => fs.writeFileSync(getOptionsPaths(config_path).defaults_path, text);
const copyRealDefaults = (config_path) => fs.copyFileSync(REAL_DEFAULTS_PATH, getOptionsPaths(config_path).defaults_path);
const readOptionsText  = (config_path) => fs.readFileSync(getOptionsPaths(config_path).options_path, 'utf8');
const optionsExists    = (config_path) => fs.existsSync(getOptionsPaths(config_path).options_path);

// fs whose write methods fail (read-only installation folder)
const readOnlyFs = () => ({
  ...fs,
  copyFileSync()  { throw new Error(WRITE_ERROR_TEXT); },
  writeFileSync() { throw new Error(WRITE_ERROR_TEXT); },
});

let config_path;
beforeEach(() => { config_path = makeConfigDir(); });
afterEach(() => { fs.rmSync(config_path, { recursive: true, force: true }); });

describe('readOrRegenerateOptions()', () => {
  test('case 1: options.json present => read as is, not rewritten', () => {
    const text = JSON.stringify(USER_OPTIONS);
    writeOptions(config_path, text);
    copyRealDefaults(config_path);

    const result = readOrRegenerateOptions(config_path, DEFAULT_OPTIONS);

    expect(result.source).toBe(OPTIONS_SOURCE_FILE);
    expect(result.written).toBe(false);
    expect(result.error).toBeUndefined();
    expect(result.options).toEqual(USER_OPTIONS);
    expect(readOptionsText(config_path)).toBe(text);
  });

  test('case 2: options.json missing => byte-for-byte copy of defaults/options.json', () => {
    copyRealDefaults(config_path);

    const result = readOrRegenerateOptions(config_path, DEFAULT_OPTIONS);

    expect(result.source).toBe(OPTIONS_SOURCE_DEFAULTS_FILE);
    expect(result.written).toBe(true);
    expect(result.error).toBeUndefined();
    expect(readOptionsText(config_path)).toBe(fs.readFileSync(REAL_DEFAULTS_PATH, 'utf8'));
    expect(result.options).toEqual(JSON.parse(fs.readFileSync(REAL_DEFAULTS_PATH, 'utf8')));
    expect(result.options[HASHED_SECRETS_IN_CONSOLE_LOG]).toBe(true);
  });

  test('case 3: options.json and defaults/options.json missing => written from the built-in copy', () => {
    const result = readOrRegenerateOptions(config_path, DEFAULT_OPTIONS);

    expect(result.source).toBe(OPTIONS_SOURCE_BUILTIN);
    expect(result.written).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.options).toEqual(DEFAULT_OPTIONS);
    expect(JSON.parse(readOptionsText(config_path))).toEqual(DEFAULT_OPTIONS);
    expect(result.options[HASHED_SECRETS_IN_CONSOLE_LOG]).toBe(true);
  });

  test.each(EMPTY_TEXTS.map((text) => [JSON.stringify(text), text]))(
    'empty options.json %s => regenerated like a missing one', (label, text) => {
      writeOptions(config_path, text);
      copyRealDefaults(config_path);

      const result = readOrRegenerateOptions(config_path, DEFAULT_OPTIONS);

      expect(result.source).toBe(OPTIONS_SOURCE_DEFAULTS_FILE);
      expect(result.written).toBe(true);
      expect(readOptionsText(config_path)).toBe(fs.readFileSync(REAL_DEFAULTS_PATH, 'utf8'));
    });

  test('options.json with invalid JSON => left unchanged, built-in options, error reported', () => {
    writeOptions(config_path, INVALID_JSON);
    copyRealDefaults(config_path);

    const result = readOrRegenerateOptions(config_path, DEFAULT_OPTIONS);

    expect(result.source).toBe(OPTIONS_SOURCE_BUILTIN);
    expect(result.written).toBe(false);
    expect(result.error).toMatch(/Invalid JSON/);
    expect(result.options).toEqual(DEFAULT_OPTIONS);
    expect(readOptionsText(config_path)).toBe(INVALID_JSON);
  });

  test('defaults/options.json with invalid JSON => options.json written from the built-in copy', () => {
    writeDefaults(config_path, INVALID_JSON);

    const result = readOrRegenerateOptions(config_path, DEFAULT_OPTIONS);

    expect(result.source).toBe(OPTIONS_SOURCE_BUILTIN);
    expect(result.written).toBe(true);
    expect(JSON.parse(readOptionsText(config_path))).toEqual(DEFAULT_OPTIONS);
  });

  test.each([
    ['defaults/options.json present', true,  OPTIONS_SOURCE_DEFAULTS_FILE],
    ['defaults/options.json missing', false, OPTIONS_SOURCE_BUILTIN],
  ])('options.json not writable (%s) => options in memory, error reported, no throw',
    (label, with_defaults, expected_source) => {
      if (with_defaults) copyRealDefaults(config_path);

      const result = readOrRegenerateOptions(config_path, DEFAULT_OPTIONS, readOnlyFs());

      expect(result.source).toBe(expected_source);
      expect(result.written).toBe(false);
      expect(result.error).toContain(WRITE_ERROR_TEXT);
      expect(result.options[HASHED_SECRETS_IN_CONSOLE_LOG]).toBe(true);
      expect(optionsExists(config_path)).toBe(false);
    });

  test('the built-in options are never modified (a copy is returned)', () => {
    const snapshot = cloneOptions(DEFAULT_OPTIONS);

    const result = readOrRegenerateOptions(config_path, DEFAULT_OPTIONS);
    result.options.Lang = 'FR';
    result.options.Blockchains['HD Wallet'].push('Monero');

    expect(result.options).not.toBe(DEFAULT_OPTIONS);
    expect(DEFAULT_OPTIONS).toEqual(snapshot);
  });
});

describe('electron_main.js uses options_file.js', () => {
  const ELECTRON_MAIN = fs.readFileSync(path.join(__dirname, '../../../../www/js/_main/electron_main.js'), 'utf8');

  test('readOptionsFile() delegates to readOrRegenerateOptions()', () => {
    expect(ELECTRON_MAIN).toMatch(/readOrRegenerateOptions\(\s*config_path,\s*DEFAULT_OPTIONS\s*\)/);
  });

  test('DEFAULT_OPTIONS is never assigned as is (always a copy)', () => {
    expect(ELECTRON_MAIN).not.toMatch(/=\s*DEFAULT_OPTIONS\s*;/);
  });
});
