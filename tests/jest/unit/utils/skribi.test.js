/**
 * ============================================================================
 * Unit tests - www/js/util/log/skribi.js : no log file anymore
 * ============================================================================
 * Cryptocalc must never write a log file ('log.txt'): log messages may contain
 * sensitive information (Entropy, Secret phrase, Private Key, WIF...).
 *
 * - Skribi.log() writes to the console only
 * - no file is written, whatever the argument given to Skribi.Initialize()
 * - 'electron-log' and 'app_config.json' ("ToFile") are no longer used
 * - no 'log.txt' left in the repository (www/ folder and repository root)
 * ============================================================================
 */
const fs   = require('fs');
const path = require('path');

const { Skribi } = require('@util/log/skribi.js');

const REPO_ROOT       = path.join(__dirname, '../../../..');
const WWW_JS_DIR      = path.join(REPO_ROOT, 'www/js');
const SKRIBI_PATH     = path.join(WWW_JS_DIR, 'util/log/skribi.js');
const APP_CONFIG_PATH = path.join(REPO_ROOT, 'www/config/app_config.json');

const LOG_FILENAME     = 'log.txt';
const LOG_MESSAGE      = '>> MainGUI.didFinishLoadInit';
const LEGACY_TO_FILE   = { ToFile: true }; // former 'app_config.json' content enabling the log file
const FS_WRITE_METHODS = ['writeFileSync', 'appendFileSync', 'writeFile', 'appendFile', 'createWriteStream'];

// Folders which are not part of the application code
const EXCLUDED_DIRS = ['_archives', '_proto', 'previous', 'lib'];

// Lines of code without comments (a comment may explain that 'log.txt' was removed)
const activeCode = (file_path) => fs.readFileSync(file_path, 'utf8')
  .split('\n')
  .filter((line) => { const t = line.trim(); return ! (t.startsWith('//') || t.startsWith('*') || t.startsWith('/*')); })
  .join('\n');

const listJsFiles = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const full_path = path.join(dir, entry.name);
  if (entry.isDirectory()) return EXCLUDED_DIRS.includes(entry.name) ? [] : listJsFiles(full_path);
  return entry.name.endsWith('.js') ? [full_path] : [];
});

describe('Skribi: console only, no log file', () => {
  let consoleSpy;
  let fsSpies;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    fsSpies = FS_WRITE_METHODS.map((method) => jest.spyOn(fs, method));
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    fsSpies.forEach((spy) => spy.mockRestore());
  });

  test('Skribi.log() writes the message to the console', () => {
    Skribi.log(LOG_MESSAGE);
    expect(consoleSpy).toHaveBeenCalledWith(LOG_MESSAGE);
  });

  test('Skribi.log() initializes Skribi when needed', () => {
    Skribi.Initialized = false;
    Skribi.log(LOG_MESSAGE);
    expect(Skribi.Initialized).toBe(true);
  });

  test('no file is written, even with the former { ToFile: true } configuration', () => {
    Skribi.Initialize(LEGACY_TO_FILE);
    Skribi.log(LOG_MESSAGE);
    Skribi.log(undefined);
    fsSpies.forEach((spy) => expect(spy).not.toHaveBeenCalled());
  });
});

describe('No log file in the code nor in the repository', () => {
  test("skribi.js no longer loads 'electron-log' nor 'fs'", () => {
    const code = activeCode(SKRIBI_PATH);
    expect(code).not.toMatch(/require\(\s*['"]electron-log['"]\s*\)/);
    expect(code).not.toMatch(/require\(\s*['"]fs['"]\s*\)/);
  });

  test("no application file loads 'electron-log'", () => {
    const offenders = listJsFiles(WWW_JS_DIR)
      .filter((file) => /require\(\s*['"]electron-log['"]\s*\)/.test(activeCode(file)));
    expect(offenders).toEqual([]);
  });

  test("no application file builds a 'log.txt' path", () => {
    const offenders = listJsFiles(WWW_JS_DIR)
      .filter((file) => /['"/\\]log\.txt['"]/.test(activeCode(file)));
    expect(offenders).toEqual([]);
  });

  test("'www/config/app_config.json' (ToFile option) no longer exists", () => {
    expect(fs.existsSync(APP_CONFIG_PATH)).toBe(false);
  });

  // NB: checked on disk (not with 'git ls-files'): after 'git apply' the deletions are not yet committed
  test('no log.txt in the repository (www/ folder and repository root)', () => {
    const findLogFiles = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full_path = path.join(dir, entry.name);
      if (entry.isDirectory()) return findLogFiles(full_path);
      return (entry.name === LOG_FILENAME) ? [path.relative(REPO_ROOT, full_path)] : [];
    });
    const log_files = findLogFiles(path.join(REPO_ROOT, 'www'));
    if (fs.existsSync(path.join(REPO_ROOT, LOG_FILENAME))) log_files.push(LOG_FILENAME);
    expect(log_files).toEqual([]);
  });
});
