/**
 * ============================================================================
 * Mutation testing (StrykerJS) - never part of 'npm test'
 * ============================================================================
 * A mutation test plants one small bug (a "mutant") in a source file and runs
 * the tests: a mutant that no test detects ("survived") shows a hole in the tests.
 *
 * One source file at a time, against ITS OWN unit tests
 * (tests/jest/tools/mutation_targets.js):
 * a mutant only killed by indirect tests (e.g. a wallet test which happens to
 * call the function) counts as survived, on purpose.
 *
 * Usage (Windows or Linux), from the project root:
 *     npm run test:mutation -- bip39_utils
 * Report: tests/coverage/mutation/<target>.html (not committed)
 * ============================================================================
 */
'use strict';

const { MUTATION_TARGETS, MUTATION_TARGET_ENV } = require('./tests/jest/tools/mutation_targets.js');
const DEFAULT_TARGET = 'bip39_utils';

const target_name = process.env[MUTATION_TARGET_ENV] || DEFAULT_TARGET;
const target      = MUTATION_TARGETS[target_name];
if (target === undefined) {
  throw new Error('Unknown mutation target "' + target_name + '". Known targets: '
                  + Object.keys(MUTATION_TARGETS).join(', '));
}

module.exports = {
  testRunner: 'jest',
  jest: {
    configFile: 'jest.config.js',
    config: {
      testMatch:         target.tests,
      reporters:         ['default'],
      coverageThreshold: {},
      verbose:           false,
    },
  },
  coverageAnalysis: 'perTest',
  mutate:           target.mutate,
  ignorePatterns:   ['.stryker-tmp', '_output', '_inno_setup', '_00_handovers',
                     'tests/coverage', 'tests/playwright', 'docs'],
  disableTypeChecks: false,
  reporters:        ['clear-text', 'progress', 'html', 'json'],
  htmlReporter:     { fileName: 'tests/coverage/mutation/' + target_name + '.html' },
  jsonReporter:     { fileName: 'tests/coverage/mutation/' + target_name + '.json' },
  tempDirName:      '.stryker-tmp',   // NB: not under tests/coverage/, which Jest ignores
  cleanTempDir:     true,
  timeoutMS:        60000,
};
