/**
 * ============================================================================
 * Unit tests - Mutation testing targets (tests/jest/tools/mutation_targets.js)
 * ============================================================================
 * Each target names its source file(s) and its own unit tests. A test pattern
 * starting with '<rootDir>' matches no file on Windows (drive letter and
 * backslashes): Stryker then stops with "No tests were found".
 *
 * NB: no glob library ('micromatch' is not a direct dependency: a fresh
 *     install does not put it at the root of node_modules).
 * ============================================================================
 */
const fs         = require('fs');
const path       = require('path');

const { MUTATION_TARGETS } = require('../../../../tests/jest/tools/mutation_targets.js');

const PROJECT_ROOT = path.join(__dirname, '../../../..');
const TESTS_DIR    = path.join(PROJECT_ROOT, 'tests', 'jest');

// Test files of the project, as forward-slash paths relative to the project root
const listTestFiles = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const full_path = path.join(dir, entry.name);
  return entry.isDirectory() ? listTestFiles(full_path) : [full_path];
}).filter((file) => file.endsWith('.test.js'))
  .map((file) => path.relative(PROJECT_ROOT, file).split(path.sep).join('/'));

const TEST_FILES = listTestFiles(TESTS_DIR);

// The simple globs of the targets ('**/' = any folders, '*' = any characters but '/')
const escapeRegExp = (text) => text.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
const globToRegExp = (glob) => new RegExp('^' + glob.split('**/')
  .map((part) => part.split('*').map(escapeRegExp).join('[^/]*'))
  .join('(?:.*/)?') + '$');
const matchingFiles = (globs) => TEST_FILES.filter((file) => globs.some((glob) => globToRegExp(glob).test(file)));
const TARGETS    = Object.entries(MUTATION_TARGETS);

describe('Mutation testing targets', () => {
  test('at least one target', () => {
    expect(TARGETS.length).toBeGreaterThan(0);
  });

  test.each(TARGETS)("%s: test patterns don't use <rootDir> (no match on Windows)", (name, target) => {
    target.tests.forEach((pattern) => expect(pattern).not.toContain('<rootDir>'));
  });

  test.each(TARGETS)('%s: the test patterns match at least one test file', (name, target) => {
    expect(matchingFiles(target.tests).length).toBeGreaterThan(0);
  });

  test('glob translation: same files as Jest for the bip39_utils target', () => {
    expect(matchingFiles(MUTATION_TARGETS.bip39_utils.tests).sort()).toEqual([
      'tests/jest/unit/crypto/bip39_extras.test.js',
      'tests/jest/unit/crypto/bip39_sizes.test.js',
      'tests/jest/unit/crypto/bip39_sizes_characterization.test.js',
      'tests/jest/unit/crypto/bip39_utils.test.js',
      'tests/jest/unit/crypto/bip39_validation.test.js',
    ]);
  });

  test.each(TARGETS)('%s: the source files to mutate exist', (name, target) => {
    target.mutate.forEach((file) => expect(fs.existsSync(path.join(PROJECT_ROOT, file))).toBe(true));
  });
});
