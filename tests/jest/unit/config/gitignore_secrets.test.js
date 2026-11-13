/**
 * ============================================================================
 * Unit tests - .gitignore : generated wallets and build outputs never committed
 * ============================================================================
 * Wallets saved by the app (folder '_output/', '.wits' files) hold secrets in
 * clear text (Private Key, WIF, Secret phrase). They must be ignored by git at
 * ANY depth: on 2026-03-10, test wallets saved in 'www/js/_main/_output/'
 * were committed because the former rule only covered the root '_output' folder.
 *   - 'git check-ignore' must ignore these paths
 *   - no tracked file may be a generated wallet or an installer
 * Skipped when git is not installed or the folder is not a git repository.
 * ============================================================================
 */
const path = require('path');
const { spawnSync } = require('child_process');

const PROJECT_ROOT = path.join(__dirname, '../../../..');

const git = (...args) => spawnSync('git', args, { cwd: PROJECT_ROOT, encoding: 'utf8' });
const IS_GIT_REPO  = git('rev-parse', '--is-inside-work-tree').stdout.trim() === 'true';
const describeIfGit = IS_GIT_REPO ? describe : describe.skip;

const IGNORED_PATHS = [
  '_output/2026_03_10_14h-47m-04s-7_DOGE_EN/wallet_info.wits',
  '_output/2026_03_10_14h-47m-04s-7_DOGE_EN/PrivateKey.png',
  'www/js/_main/_output/2026_03_10_14h-47m-04s-7_DOGE_EN/SecretPhrase.png',
  'www/js/_main/_output/2026_03_10_14h-47m-04s-7_DOGE_EN/wallet_info.txt',
  'tests/_output/any/WIF.png',
  'my_wallet.wits',
  'www/js/view/my_wallet.wits',
  '_inno_setup/Output/cryptocalc_setup.exe',
];
const NOT_IGNORED_PATHS = [
  'www/js/crypto/bip85/bip85_template-wallet_info.txt',
  'www/js/model/main_model.js',
  '_inno_setup/cryptocalc_setup.iss',
];
const WALLET_OR_BUILD_REGEX = /(^|\/)_output\/|\.wits$|^_inno_setup\/Output\//i;

describeIfGit('.gitignore: generated wallets and build outputs', () => {
  test.each(IGNORED_PATHS)('%s is ignored', (file_path) => {
    expect(git('check-ignore', '--no-index', '-q', file_path).status).toBe(0);
  });

  test.each(NOT_IGNORED_PATHS)('%s is NOT ignored', (file_path) => {
    expect(git('check-ignore', '--no-index', '-q', file_path).status).toBe(1);
  });

  test('no tracked file is a generated wallet or an installer', () => {
    const tracked = git('ls-files', '-z').stdout.split('\0').filter((file) => WALLET_OR_BUILD_REGEX.test(file));
    expect(tracked).toEqual([]);
  });
});
