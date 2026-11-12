/**
 * ============================================================================
 * Unit tests - www/js/util/log/log_utils.js : no secret in clear text in the log
 * ============================================================================
 * redactSecret( value ) / hideSecret( value ), 'HashedSecretsInConsoleLog':
 *   - true (default, also before the options are loaded):
 *       redactSecret => "<secret #<8 hex> (<length>)>"
 *                       HMAC-SHA256( session key, value ) truncated
 *       hideSecret   => "<secret hidden (<length>)>" (no fingerprint)
 *   - false (debug only): the value in clear text
 *   - undefined, null and '' are returned as is
 * Renderer (no Node 'require'): a marker is returned, the Main process
 * replaces it with resolveSecretMarkers() (one key for both processes).
 * electron_main.js applies the option in setOptions() and resolves the
 * markers of the messages sent by the Renderer.
 * ============================================================================
 */
const fs     = require('fs');
const vm     = require('vm');
const path   = require('path');
const crypto = require('crypto');

const LOG_UTILS_MODULE = '@util/log/log_utils.js';
const LOG_UTILS_PATH   = path.join(__dirname, '../../../../www/js/util/log/log_utils.js');
const ELECTRON_MAIN    = path.join(__dirname, '../../../../www/js/_main/electron_main.js');

const TEST_KEY        = Buffer.alloc(32, 7);
const ENTROPY_HEX     = '37297b2455dbaa522dea2cd9a0be34ab488c8f00e0ef7085d73137e2b84c94db';
const ENTROPY_FP      = '30faaa83'; // HMAC-SHA256(TEST_KEY, ENTROPY_HEX), 8 first hex digits
const PASSPHRASE      = 'TREZOR';
const UNICODE_SECRET  = 'abandon ability été ' + 'é中';
const FINGERPRINT_RE  = /^<secret #[0-9a-f]{8} \(\d+\)>$/;
const MARKER_RE       = /\u0002[SH]:[^\u0003]*\u0003/;

const expectedFingerprint = (text, key = TEST_KEY) =>
  crypto.createHmac('sha256', key).update(text, 'utf8').digest('hex').substring(0, 8);

// A fresh module (fresh PrettyLog singleton) for each test: no shared state
const loadLogUtils = () => {
  let log_utils;
  jest.isolateModules(() => { log_utils = require(LOG_UTILS_MODULE); });
  return log_utils;
};

// log_utils.js evaluated like in the Renderer: <script> tag, 'window', no 'require'
const loadRendererLogUtils = () => {
  const context = vm.createContext({ window: {}, console });
  const source  = fs.readFileSync(LOG_UTILS_PATH, 'utf8').replace(/^const\s+(\w+)\s*=/gm, 'var $1 =');
  vm.runInContext(source, context);
  return context;
};

describe('redactSecret() / hideSecret() in the Main process', () => {
  test('default (options not loaded yet): fingerprint, never the clear value', () => {
    const L = loadLogUtils();
    const redacted = L.redactSecret(ENTROPY_HEX);
    expect(redacted).toMatch(FINGERPRINT_RE);
    expect(redacted).not.toContain(ENTROPY_HEX);
  });

  test('fingerprint = HMAC-SHA256(session key, value), 8 hex digits, with the length', () => {
    const L = loadLogUtils();
    L.setSecretFingerprintKey(TEST_KEY);
    expect(L.SECRET_FINGERPRINT_HEX_LENGTH).toBe(8);
    expect(L.redactSecret(ENTROPY_HEX)).toBe('<secret #' + ENTROPY_FP + ' (64)>');
    expect(L.redactSecret(PASSPHRASE)).toBe('<secret #' + expectedFingerprint(PASSPHRASE) + ' (6)>');
  });

  test('same value => same fingerprint in a session, different values => different fingerprints', () => {
    const L = loadLogUtils();
    expect(L.redactSecret(ENTROPY_HEX)).toBe(L.redactSecret(ENTROPY_HEX));
    expect(L.redactSecret(ENTROPY_HEX)).not.toBe(L.redactSecret(ENTROPY_HEX.replace(/^3/, '4')));
  });

  test('the session key is random: 2 sessions give different fingerprints', () => {
    const fingerprints = [loadLogUtils(), loadLogUtils()].map((L) => L.redactSecret(ENTROPY_HEX));
    expect(fingerprints[0]).not.toBe(fingerprints[1]);
  });

  test('the fingerprint is not a plain hash (no dictionary attack on short secrets)', () => {
    const L = loadLogUtils();
    const plain_sha256 = crypto.createHash('sha256').update(PASSPHRASE).digest('hex');
    const plain_md5    = crypto.createHash('md5').update(PASSPHRASE).digest('hex');
    const fingerprint  = L.redactSecret(PASSPHRASE).match(/#([0-9a-f]{8})/)[1];
    expect(plain_sha256.startsWith(fingerprint)).toBe(false);
    expect(plain_md5.startsWith(fingerprint)).toBe(false);
  });

  test('hideSecret(): length only, no fingerprint', () => {
    const L = loadLogUtils();
    expect(L.hideSecret('a')).toBe('<secret hidden (1)>');
    expect(L.hideSecret('a')).toBe(L.hideSecret('b'));
  });

  test.each([[undefined], [null], ['']])('%p is returned as is', (value) => {
    const L = loadLogUtils();
    expect(L.redactSecret(value)).toBe(value);
    expect(L.hideSecret(value)).toBe(value);
  });

  test('non string values (array, object, number) are redacted too', () => {
    const L = loadLogUtils();
    L.setSecretFingerprintKey(TEST_KEY);
    const words = ['abandon', 'ability'];
    expect(L.redactSecret(words)).toBe('<secret #' + expectedFingerprint(JSON.stringify(words)) + ' (21)>');
    expect(L.redactSecret({ entropy: ENTROPY_HEX })).not.toContain(ENTROPY_HEX);
    expect(L.redactSecret(1234)).toMatch(FINGERPRINT_RE);
  });

  test("'HashedSecretsInConsoleLog' false (debug): clear values", () => {
    const L = loadLogUtils();
    L.setHashedSecretsInConsoleLog(false);
    expect(L.redactSecret(ENTROPY_HEX)).toBe(ENTROPY_HEX);
    expect(L.hideSecret('a')).toBe('a');
  });

  test.each([[true], [undefined], ['false'], [0], [null]])(
    "only a boolean 'false' shows the clear values (%p => fingerprints)", (flag) => {
      const L = loadLogUtils();
      L.setHashedSecretsInConsoleLog(false);
      L.setHashedSecretsInConsoleLog(flag);
      expect(L.redactSecret(ENTROPY_HEX)).toMatch(FINGERPRINT_RE);
    });

  test('pretty_log() output contains the fingerprint, not the secret', () => {
    const L   = loadLogUtils();
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    L.pretty_log('entropy_hex', L.redactSecret(ENTROPY_HEX));
    const output = spy.mock.calls.flat().join('\n');
    spy.mockRestore();
    expect(output).toContain('<secret #');
    expect(output).not.toContain(ENTROPY_HEX);
  });
});

describe('Renderer: markers resolved by the Main process', () => {
  test('in the Renderer, redactSecret() returns a marker (no fingerprint, no Node crypto)', () => {
    const R = loadRendererLogUtils();
    const marked = R.redactSecret(ENTROPY_HEX);
    expect(marked).toMatch(MARKER_RE);
    expect(marked).not.toMatch(/<secret/);
    expect(R.redactSecret(undefined)).toBeUndefined();
  });

  test('the Main process replaces the markers with the SAME fingerprint as its own', () => {
    const R = loadRendererLogUtils();
    const L = loadLogUtils();
    L.setSecretFingerprintKey(TEST_KEY);
    const msg = '   rGUI.genHDW> entropy_hex: ' + R.redactSecret(ENTROPY_HEX) + ' key: ' + R.hideSecret('7');
    expect(L.resolveSecretMarkers(msg))
      .toBe('   rGUI.genHDW> entropy_hex: <secret #' + ENTROPY_FP + ' (64)> key: <secret hidden (1)>');
    expect(L.resolveSecretMarkers(msg)).toContain(L.redactSecret(ENTROPY_HEX));
  });

  test('unicode values (non English secret phrases) survive the marker', () => {
    const R = loadRendererLogUtils();
    const L = loadLogUtils();
    L.setSecretFingerprintKey(TEST_KEY);
    expect(L.resolveSecretMarkers(R.redactSecret(UNICODE_SECRET))).toBe(L.redactSecret(UNICODE_SECRET));
    L.setHashedSecretsInConsoleLog(false);
    expect(L.resolveSecretMarkers(R.redactSecret(UNICODE_SECRET))).toBe(UNICODE_SECRET);
  });

  test('a malformed marker is hidden, messages without marker and non strings are unchanged', () => {
    const L = loadLogUtils();
    expect(L.resolveSecretMarkers('x \u0002S:%E0%A4%A\u0003 y')).toBe('x <secret hidden> y');
    expect(L.resolveSecretMarkers('>> MainGUI.newWallet')).toBe('>> MainGUI.newWallet');
    expect(L.resolveSecretMarkers(undefined)).toBeUndefined();
  });
});

describe('electron_main.js applies the option and resolves the Renderer markers', () => {
  const source = fs.readFileSync(ELECTRON_MAIN, 'utf8');
  const activeLines = source.split('\n').filter((line) => ! line.trim().startsWith('//'));

  test("'this.Options' is only assigned in the constructor and in setOptions()", () => {
    const assignments = activeLines.filter((line) => /this\.Options\s*=[^=]/.test(line));
    expect(assignments.map((line) => line.trim())).toEqual(['this.Options                   = {};', 'this.Options = options;']);
  });

  test('setOptions() calls setHashedSecretsInConsoleLog() with the option', () => {
    expect(source).toMatch(/setOptions\( options \) \{[\s\S]*?HASHED_SECRETS_IN_CONSOLE_LOG[\s\S]*?setHashedSecretsInConsoleLog\(/);
  });

  test('both log handlers (log2main, log2main_sync) resolve the markers', () => {
    expect(source.match(/Skribi\.log\( resolveSecretMarkers\( data \) \)/g)).toHaveLength(2);
    expect(activeLines.filter((line) => /Skribi\.log\(\s*data\s*\)/.test(line))).toHaveLength(0);
  });
});
