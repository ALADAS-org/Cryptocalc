/**
 * ============================================================================
 * Unit tests - 'v8-compile-cache' is no longer used
 * ============================================================================
 * 'v8-compile-cache' replaces the compilation of the CommonJS modules: a
 * dependency published as an ES module only (e.g. 'uuid' 12+, required by
 * 'rpc-websockets' 9.3.9, itself required by '@solana/web3.js') is then
 * compiled as CommonJS and the main process crashes at startup:
 *     SyntaxError: Unexpected token 'export'
 * Without it, Electron 39 (Node 22) loads such modules with require().
 *
 * Jest cannot require() an ES-only module either: package.json pins
 * 'rpc-websockets' (npm 'overrides') to 9.3.8, whose 'uuid' 11 still has a
 * CommonJS build (9.3.9 requires 'uuid' 14, ES-only; 9.3.10 is deprecated).
 * ============================================================================
 */
const fs   = require('fs');
const path = require('path');

const PROJECT_ROOT  = path.join(__dirname, '../../../..');
const ELECTRON_MAIN = path.join(PROJECT_ROOT, 'www/js/_main/electron_main.js');
const PACKAGE_JSON  = path.join(PROJECT_ROOT, 'package.json');
const MODULE_NAME   = 'v8-compile-cache';
const RPC_WEBSOCKETS = 'rpc-websockets';
const RPC_WEBSOCKETS_COMMONJS_VERSION = '9.3.8';

describe("'v8-compile-cache' is not used (ES-only dependencies crash the startup)", () => {
  test('electron_main.js does not require it', () => {
    const source = fs.readFileSync(ELECTRON_MAIN, 'utf8');
    expect(source).not.toMatch(new RegExp("require\\(\\s*['\"]" + MODULE_NAME + "['\"]\\s*\\)"));
  });

  test('package.json does not declare it', () => {
    const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
    expect(Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })).not.toContain(MODULE_NAME);
  });
});

describe("'rpc-websockets' is pinned to a version whose dependencies have a CommonJS build", () => {
  test('package.json overrides it', () => {
    const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
    expect((pkg.overrides || {})[RPC_WEBSOCKETS]).toBe(RPC_WEBSOCKETS_COMMONJS_VERSION);
  });

  test('@solana/web3.js (which uses it) loads in Jest', () => {
    expect(() => require('@solana/web3.js')).not.toThrow();
  });
});
