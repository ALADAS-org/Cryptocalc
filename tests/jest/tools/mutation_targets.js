/**
 * Mutation testing targets (StrykerJS): name -> source file(s) to mutate and
 * the unit tests which own them. Used by stryker.config.cjs and run_mutation.js.
 *
 * Add one target per source file, with ITS OWN unit tests only: a mutant which
 * only indirect tests kill (e.g. wallet tests) must count as survived.
 *
 * Test patterns: same style as 'testMatch' in jest.config.js (starting with '**').
 * NB: '<rootDir>/tests/...' matches no file on Windows (drive letter and
 *     backslashes in <rootDir>): Stryker then stops with "No tests were found".
 */
'use strict';

const MUTATION_TARGETS = {
  bip39_utils: {
    mutate: ['www/js/crypto/bip39_utils.js'],
    tests:  ['**/tests/jest/unit/crypto/bip39_*.test.js'],
  },
};

const MUTATION_TARGET_ENV = 'CRYPTOCALC_MUTATION_TARGET';

module.exports = { MUTATION_TARGETS, MUTATION_TARGET_ENV };
