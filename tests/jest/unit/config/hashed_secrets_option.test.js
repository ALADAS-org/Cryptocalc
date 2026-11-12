/**
 * ============================================================================
 * Unit tests - 'HashedSecretsInConsoleLog' option in the 3 option sources
 * ============================================================================
 * Secrets (Entropy, Secret phrase, Private Key, WIF, passphrases...) appear in
 * the console log as fingerprints unless this option is explicitly 'false'.
 * It must be 'true' in:
 *   - www/config/options.json             (current options)
 *   - www/config/defaults/options.json    (used by 'Reset Options' and to
 *                                          regenerate a missing options.json)
 *   - DEFAULT_OPTIONS (const_default_options.js, built-in copy)
 * ============================================================================
 */
const fs   = require('fs');
const path = require('path');

const { HASHED_SECRETS_IN_CONSOLE_LOG } = require('@www/js/const_keywords.js');
const { DEFAULT_OPTIONS }               = require('@crypto/const_default_options.js');

const CONFIG_DIR            = path.join(__dirname, '../../../../www/config');
const OPTIONS_PATH          = path.join(CONFIG_DIR, 'options.json');
const DEFAULT_OPTIONS_PATH  = path.join(CONFIG_DIR, 'defaults/options.json');
const EXPECTED_OPTION_NAME  = 'HashedSecretsInConsoleLog';
const EXPECTED_DEFAULT      = true;

const readJson = (file_path) => JSON.parse(fs.readFileSync(file_path, 'utf8'));

describe('HashedSecretsInConsoleLog option', () => {
  test('keyword constant has the expected name', () => {
    expect(HASHED_SECRETS_IN_CONSOLE_LOG).toBe(EXPECTED_OPTION_NAME);
  });

  test.each([
    ['www/config/options.json',          () => readJson(OPTIONS_PATH)],
    ['www/config/defaults/options.json', () => readJson(DEFAULT_OPTIONS_PATH)],
    ['DEFAULT_OPTIONS (built-in)',       () => DEFAULT_OPTIONS],
  ])('is %s === true (boolean)', (label, getOptions) => {
    expect(getOptions()[HASHED_SECRETS_IN_CONSOLE_LOG]).toBe(EXPECTED_DEFAULT);
  });
});
