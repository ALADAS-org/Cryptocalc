/**
 * ============================================================================
 * Mutation testing launcher (StrykerJS), Windows and Linux
 * ============================================================================
 * Usage, from the project root:
 *     npm run test:mutation -- <target>        e.g. npm run test:mutation -- bip39_utils
 *     npm run test:mutation -- --list          known targets
 *     npm run test:mutation -- <target> --dry-run
 *         only the initial test run (checks that the tests are found, a few seconds)
 * Targets: tests/jest/tools/mutation_targets.js
 * ============================================================================
 */
'use strict';
const path = require('path');
const { spawnSync } = require('child_process');

const PROJECT_ROOT = path.join(__dirname, '../../..');
const CONFIG_FILE  = 'stryker.config.cjs';
const LIST_OPTION  = '--list';
const DRY_RUN_OPTION = '--dry-run';

const target_name = process.argv[2];
const { MUTATION_TARGETS, MUTATION_TARGET_ENV } = require('./mutation_targets.js');
const known       = Object.keys(MUTATION_TARGETS);

if (target_name === undefined || target_name === LIST_OPTION || ! known.includes(target_name)) {
  if (target_name !== undefined && target_name !== LIST_OPTION) {
    console.error('Unknown mutation target: ' + target_name);
  }
  console.log('Usage: npm run test:mutation -- <target> [' + DRY_RUN_OPTION + ']');
  console.log('Targets: ' + known.join(', '));
  process.exit(target_name === LIST_OPTION ? 0 : 1);
}

const stryker = path.join(PROJECT_ROOT, 'node_modules', '@stryker-mutator', 'core', 'bin', 'stryker.js');
const dry_run = process.argv.includes(DRY_RUN_OPTION);
const result  = spawnSync(process.execPath, [stryker, 'run', CONFIG_FILE, ...(dry_run ? ['--dryRunOnly'] : [])], {
  cwd:   PROJECT_ROOT,
  stdio: 'inherit',
  env:   { ...process.env, [MUTATION_TARGET_ENV]: target_name },
});
if (! dry_run) console.log('Report: tests/coverage/mutation/' + target_name + '.html');
process.exit(result.status === null ? 1 : result.status);
