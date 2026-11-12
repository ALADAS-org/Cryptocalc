/**
 * ============================================================================
 * Static guard - every trace of a secret goes through redactSecret()
 * ============================================================================
 * Scans the application code (Main process and Renderer) for trace calls
 * (trace2Main, trace2MainSync, console.*, pretty_log, Skribi.log,
 * pretty_format, pretty_func_header_*) whose arguments use a SENSITIVE
 * identifier (entropy, mnemonics, secret phrase, private key, WIF,
 * passphrase, password, seed, salt, xpriv, chaincode, fortune cookie, paste,
 * word indexes, keystrokes...) outside redactSecret( ) / hideSecret( ).
 * Sizes and counts ('entropy_size', 'word_count', '.length', ...) are allowed.
 *
 * Renderer: a redacted value must be traced with trace2Main(), never with
 * console.*() (the marker would be shown in clear in the DevTools console,
 * see log_utils.js).
 *
 * Not scanned: libraries, archives, prototypes, and 'test_*' functions
 * which are never called (dead code, removed in step 5.4).
 * ============================================================================
 */
const fs   = require('fs');
const path = require('path');

const WWW_DIR    = path.join(__dirname, '../../../../www');
const INDEX_HTML = path.join(WWW_DIR, 'index.html');
const SCANNED_DIRS  = [path.join(WWW_DIR, 'js'), path.join(WWW_DIR, 'vizjets')];
const EXCLUDED_DIRS = ['_archives', '_proto', 'proto', 'previous', 'lib', 'mnemonics'];
const EXCLUDED_FILE_REGEX = /^(test_|proto_)/;

const TRACE_CALL_REGEX = /\b(trace2Main|trace2MainSync|console\.(log|info|warn|error|debug)|pretty_log|Skribi\.log|pretty_format|pretty_func_header_log|pretty_func_header_format)\s*\(/;
const CONSOLE_CALL_REGEX = /\bconsole\.(log|info|warn|error|debug)\s*\(/;
const REDACTION_REGEX  = /\b(redactSecret|hideSecret)\s*\(/;
const MAX_STATEMENT_LINES = 10;

// Identifiers holding a secret
const SENSITIVE_REGEX = /(entrop|mnemonic|secret|priv|wif|passphrase|password|pwd|seed|salt|chaincode|fortune|paste|word_index|keystore|evt\.key|new_char|selected_text|_hex\b|hex_str|base64|base58|clipboard|bip85_infos|json_data|wits_json)/i;
// Identifiers which are NOT secrets (sizes, counts, types, element ids, flags...)
const NOT_SECRET_REGEX = /(_size|_count|_length|_bytes\b|\.length|_type|_id\b|_ID\b|_src_type|_lang|_label|_visibility|_digits|_pbar|_strength|_enabled|_allowed|_dialog|_elt|_mode|filename|index_in_|resolveSecretMarkers)/i;
// Constants (IPC event names, keywords...): 'ToMain_RQ_...', 'FromMain_...', 'TOOLS_SECRET_...'
const CONSTANT_REGEX   = /^(ToMain_|FromMain_)|^[A-Z][A-Z0-9_]*$/;
// Access to a secret attribute through a keyword: getAttribute(ENTROPY), wallet[MNEMONICS]...
const SECRET_KEYWORDS        = 'ENTROPY|MNEMONICS|WIF|PRIVATE_KEY|PRIV_KEY|BIP39_PASSPHRASE|BIP38_PASSPHRASE|CHAINCODE|SALT';
const SECRET_ATTRIBUTE_REGEX = new RegExp('(getAttribute\\(\\s*|\\[\\s*)(' + SECRET_KEYWORDS + ')\\s*[)\\]]');

// Trace calls with a SENSITIVE identifier which is not a secret (reviewed one by one)
const ALLOWED_LINES = [
  /trace2Main\(\s*pretty_format\(\s*"entropy UNDEFINED/,          // message only, the value is undefined
  /pretty_func_header_format\(\s*"MainGUI\.getSaltedEntropySource",\s*entropy_source\s*\)/, // entropy source TYPE ("Fortunes", "Image"...)
  /pretty_func_header_format\(\s*"MainGUI\.(GuiGenerateBip39Passphrase|GuiClearBip39Passphrase|Bip38GeneratePassphrase|Bip38ClearPassphrase|GuiToggleBip32PassphraseVisibility|GuiToggleBip38PasswordVisibility|onGuiChangeBip38Passphrase|updatePassphraseStrength|onBip38PassphrasePaste|onEntropyPaste|onMnemonicsPaste|onEntropyKeypress|onGenerateNewEntropy|drawEntropySource|generateSalt|generateEntropyFromEntropySource|getSaltedEntropySource)"\s*\)/,
];

// ---------- helpers ----------
const listJsFiles = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const full_path = path.join(dir, entry.name);
  if (entry.isDirectory()) return EXCLUDED_DIRS.includes(entry.name) ? [] : listJsFiles(full_path);
  return (entry.name.endsWith('.js') && ! EXCLUDED_FILE_REGEX.test(entry.name)) ? [full_path] : [];
});

const TEST_FUNCTION_START = /^(\s*)(async\s+)?(function\s+test_\w+\s*\(|const\s+test_\w+\s*=|test_\w+\s*\(\)\s*\{)/;

// Lines of active code: comments and never called 'test_*' functions removed
const activeLines = (file_path) => {
  const lines  = fs.readFileSync(file_path, 'utf8').replace(/\r/g, '').split('\n');
  const result = [];
  let skip_indent = undefined;
  lines.forEach((line, i) => {
    if (skip_indent !== undefined) {
      if (new RegExp('^' + skip_indent + '\\}').test(line)) skip_indent = undefined;
      return;
    }
    const start = line.match(TEST_FUNCTION_START);
    if (start) { skip_indent = start[1]; return; }
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;
    result.push({ number: i + 1, text: line.replace(/\s\/\/.*$/, '') });
  });
  return result;
};

// Text of the line with string literals and redacted arguments removed
const unsafeText = (line) => {
  let text = line.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/g, '""');
  // remove 'redactSecret( ... )' / 'hideSecret( ... )' (balanced parentheses)
  let match;
  while ((match = REDACTION_REGEX.exec(text)) !== null) {
    let depth = 0, end = match.index + match[0].length - 1;
    for (; end < text.length; end++) {
      if (text[end] === '(') depth++;
      if (text[end] === ')' && --depth === 0) break;
    }
    text = text.slice(0, match.index) + 'REDACTED' + text.slice(end + 1);
  }
  return text;
};

const isUnsafeTrace = (line) => {
  if (! TRACE_CALL_REGEX.test(line)) return false;
  if (ALLOWED_LINES.some((regex) => regex.test(line))) return false;
  const unsafe_text = unsafeText(line);
  if (SECRET_ATTRIBUTE_REGEX.test(unsafe_text)) return true;
  const identifiers = unsafe_text.match(/[A-Za-z_$][\w$.\[\]]*/g) || [];
  return identifiers.some((id) => SENSITIVE_REGEX.test(id) && ! NOT_SECRET_REGEX.test(id) && ! CONSTANT_REGEX.test(id));
};

const parenBalance = (line) => {
  const code = line.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/g, '""');
  return (code.match(/\(/g) || []).length - (code.match(/\)/g) || []).length;
};

// Trace calls of a file, a call written on several lines being joined into one statement
const traceStatements = (file_path) => {
  const lines = activeLines(file_path);
  const statements = [];
  for (let i = 0; i < lines.length; i++) {
    if (! TRACE_CALL_REGEX.test(lines[i].text)) continue;
    let text = lines[i].text;
    let balance = parenBalance(text);
    for (let j = i + 1; balance > 0 && j < lines.length && j <= i + MAX_STATEMENT_LINES; j++) {
      text += ' ' + lines[j].text.trim();
      balance += parenBalance(lines[j].text);
    }
    statements.push({ number: lines[i].number, text });
  }
  return statements;
};

const RENDERER_SCRIPTS = (fs.readFileSync(INDEX_HTML, 'utf8').match(/src="\.\/([^"]+\.js)"/g) || [])
  .map((src) => path.join(WWW_DIR, src.slice('src="./'.length, -1)))
  .filter((file_path) => ! file_path.includes(`${path.sep}lib${path.sep}`));

const relative = (file_path) => path.relative(WWW_DIR, file_path).split(path.sep).join('/');

const ALL_FILES = SCANNED_DIRS.flatMap(listJsFiles);

describe('No secret in clear text in the traces (static guard)', () => {
  test('the scan covers the Main process and the Renderer', () => {
    const files = ALL_FILES.map(relative);
    expect(files).toEqual(expect.arrayContaining([
      'js/_main/electron_main.js', 'js/view/main_gui.js', 'js/crypto/HDWallet/bip32_utils.js',
      'vizjets/entropy_converter_dialog/entropy_converter_dialog.js',
    ]));
  });

  test('every trace using a secret goes through redactSecret() / hideSecret()', () => {
    const violations = ALL_FILES.flatMap((file_path) => traceStatements(file_path)
      .filter(({ text }) => isUnsafeTrace(text))
      .map(({ number, text }) => `${relative(file_path)}:${number}: ${text.trim()}`));
    expect(violations).toEqual([]);
  });

  test('Renderer: no console.*() call with a redacted value (use trace2Main())', () => {
    const violations = RENDERER_SCRIPTS.flatMap((file_path) => traceStatements(file_path)
      .filter(({ text }) => CONSOLE_CALL_REGEX.test(text) && REDACTION_REGEX.test(text))
      .map(({ number, text }) => `${relative(file_path)}:${number}: ${text.trim()}`));
    expect(violations).toEqual([]);
  });

  test('the guard detects an unsafe trace and accepts a redacted one', () => {
    expect(isUnsafeTrace('trace2Main( pretty_format( "rGUI.openW> wif", wif ) );')).toBe(true);
    expect(isUnsafeTrace('console.log(" new_entropy: " + new_entropy);')).toBe(true);
    expect(isUnsafeTrace('pretty_log( "b32> private key", private_key );')).toBe(true);
    expect(isUnsafeTrace('trace2Main( pretty_format( "rGUI.openW> wif", redactSecret( wif ) ) );')).toBe(false);
    expect(isUnsafeTrace('trace2Main( pretty_format( "rGUI.upEsz> entropy_size", entropy_size ) );')).toBe(false);
    expect(isUnsafeTrace('let wif = getWif( private_key );')).toBe(false);
    expect(isUnsafeTrace('trace2Main( pretty_format( "x", this.wallet_info.getAttribute(ENTROPY) ) );')).toBe(true);
    expect(isUnsafeTrace('trace2Main( pretty_format( "x", redactSecret( this.wallet_info.getAttribute(ENTROPY) ) ) );')).toBe(false);
    expect(isUnsafeTrace('pretty_func_header_log( "[Electron]", ToMain_RQ_MNEMONICS_TO_ENTROPY_INFO );')).toBe(false);
  });

  test('a trace written on several lines is checked as a whole', () => {
    const tmp_file = path.join(require('os').tmpdir(), 'cryptocalc_multiline_trace.js');
    fs.writeFileSync(tmp_file, 'trace2Main(  "   *OK 1* to paste_data (full "\n         + expected_digits + " digits): " + paste_data);\n');
    const statements = traceStatements(tmp_file);
    fs.rmSync(tmp_file);
    expect(statements).toHaveLength(1);
    expect(isUnsafeTrace(statements[0].text)).toBe(true);
  });
});
