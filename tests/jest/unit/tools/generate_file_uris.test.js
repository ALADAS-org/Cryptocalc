/**
 * ============================================================================
 * Unit tests - generate_file_URIs.py : files.txt lists the files known to git
 * ============================================================================
 * A small temporary git repository is built, then the script is run with
 * '--yes --output' from a SUB-folder. files.txt must list exactly:
 *   - the tracked files and the new files not added yet (.js .css .txt .html .md)
 * and never:
 *   - a file ignored by .gitignore (e.g. coverage reports, log.txt)
 *   - a file in an excluded folder (_doc, _output...)
 *   - another extension (.png)
 *   - a tracked file deleted from the disk (deletion not committed yet)
 * Names with a space or an accent are URL-encoded.
 * Outside a git repository the script stops with exit code 1.
 * The tests are skipped when Python 3 is not installed.
 * ============================================================================
 */
const fs   = require('fs');
const os   = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const SCRIPT_PATH = path.join(__dirname, '../../../../generate_file_URIs.py');
const REPO_URL    = 'https://raw.githubusercontent.com/aladas-org/cryptocalc/master/';
const OUTPUT_NAME = 'files_test.txt';

// Python 3 command available on this machine ('python3', 'python' or the 'py' launcher)
const findPython = () => ['python3', 'python', 'py'].find((cmd) => {
  const result = spawnSync(cmd, ['-c', 'import sys; print(sys.version_info[0])'], { encoding: 'utf8' });
  return result.status === 0 && result.stdout.trim() === '3';
});
const PYTHON = findPython();
const describeIfPython = PYTHON ? describe : describe.skip;

const git = (cwd, ...args) => {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`git ${args.join(' ')}: ${result.stderr}`);
  return result.stdout;
};

const writeFile = (root, relative_path, content = 'x') => {
  const full_path = path.join(root, relative_path);
  fs.mkdirSync(path.dirname(full_path), { recursive: true });
  fs.writeFileSync(full_path, content);
};

const runScript = (cwd, output_path) => spawnSync(
  PYTHON, ['-I', SCRIPT_PATH, '--yes', '--output', output_path],
  { cwd, encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8' } });

const TRACKED_FILES = [
  'www/js/app.js',
  'www/css/app.css',
  'README.md',
  'docs/notes.txt',
  'www/index.html',
  'www/js/deleted_later.js',
  'www/img/logo.png',
  '_doc/manual.html',
  'www/_output/report.html',
];
const IGNORED_FILES = ['tests/coverage/jest/index.html', 'log.txt', 'www/js/_main/log.txt'];
const NEW_FILES     = ['www/js/new_module.js', 'www/js/mon fichier é.js'];

const EXPECTED_URLS = [
  'README.md',
  'docs/notes.txt',
  'www/css/app.css',
  'www/index.html',
  'www/js/app.js',
  'www/js/mon%20fichier%20%C3%A9.js',
  'www/js/new_module.js',
].map((relative_path) => REPO_URL + relative_path).sort();

describeIfPython('generate_file_URIs.py', () => {
  let repo_root;
  let output_path;

  beforeEach(() => {
    repo_root   = fs.mkdtempSync(path.join(os.tmpdir(), 'cryptocalc-files-'));
    output_path = path.join(repo_root, OUTPUT_NAME);
    git(repo_root, 'init', '-q');
    git(repo_root, 'config', 'user.email', 'test@example.com');
    git(repo_root, 'config', 'user.name', 'Test');
    git(repo_root, 'config', 'core.quotepath', 'true');
    writeFile(repo_root, '.gitignore', ['/tests/coverage/', 'log.txt', `/${OUTPUT_NAME}`].join('\n') + '\n');
    TRACKED_FILES.forEach((file) => writeFile(repo_root, file));
    git(repo_root, 'add', '-A');
    git(repo_root, 'commit', '-q', '-m', 'init');
    IGNORED_FILES.forEach((file) => writeFile(repo_root, file));
    NEW_FILES.forEach((file) => writeFile(repo_root, file));
    fs.rmSync(path.join(repo_root, 'www/js/deleted_later.js'));
  });

  afterEach(() => { fs.rmSync(repo_root, { recursive: true, force: true }); });

  test('lists exactly the files known to git, from a sub-folder', () => {
    const result = runScript(path.join(repo_root, 'www/js'), output_path);

    expect(result.status).toBe(0);
    const urls = fs.readFileSync(output_path, 'utf8').split('\n').filter((line) => line !== '');
    expect(urls).toEqual(EXPECTED_URLS);
  });

  test('never lists an ignored file, an excluded folder, another extension or a deleted file', () => {
    runScript(repo_root, output_path);
    const text = fs.readFileSync(output_path, 'utf8');

    ['coverage', 'log.txt', '_doc/', '_output/', '.png', 'deleted_later', '.gitignore', OUTPUT_NAME]
      .forEach((fragment) => expect(text).not.toContain(fragment));
  });

  test('the output uses LF line endings and is sorted', () => {
    runScript(repo_root, output_path);
    const text = fs.readFileSync(output_path, 'utf8');

    expect(text).not.toContain('\r');
    expect(text.endsWith('\n')).toBe(true);
    const urls = text.split('\n').filter((line) => line !== '');
    expect(urls).toEqual([...urls].sort());
  });

  test('outside a git repository: error message and exit code 1', () => {
    const outside_dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cryptocalc-nogit-'));
    try {
      const result = spawnSync(PYTHON, ['-I', SCRIPT_PATH, '--yes', '--output', path.join(outside_dir, OUTPUT_NAME)],
        { cwd: outside_dir, encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8', GIT_CEILING_DIRECTORIES: path.dirname(outside_dir) } });
      expect(result.status).toBe(1);
      expect(result.stdout).toMatch(/ERREUR/);
      expect(fs.existsSync(path.join(outside_dir, OUTPUT_NAME))).toBe(false);
    }
    finally {
      fs.rmSync(outside_dir, { recursive: true, force: true });
    }
  });
});
