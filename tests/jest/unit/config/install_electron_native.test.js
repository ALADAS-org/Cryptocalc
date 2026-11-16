/**
 * ============================================================================
 * Unit tests - tools/install_electron_native.js
 * ============================================================================
 * 'npm install' ("postinstall") and 'npm run rebuild' download the prebuilt
 * 'better-sqlite3' binary for the installed Electron version: no compiler
 * (Visual Studio) for the developers nor for the users who install from Git.
 * The download itself is simulated here (the real one is covered by the
 * Playwright tests, which start the application).
 * ============================================================================
 */
const fs   = require('fs');
const os   = require('os');
const path = require('path');

const {
  NATIVE_MODULES, readElectronVersion, prebuildArgs, manualCommand, installPrebuilt, main,
} = require('../../../../tools/install_electron_native.js');

const PROJECT_ROOT   = path.join(__dirname, '../../../..');
const PACKAGE_JSON   = path.join(PROJECT_ROOT, 'package.json');
const SCRIPT_COMMAND = 'node tools/install_electron_native.js';
const ELECTRON_VERSION = '39.8.10';
const PLATFORM = 'win32';
const ARCH     = 'x64';
const SQLITE   = 'better-sqlite3';

const SUCCESS = () => ({ status: 0 });
const FAILURE = () => ({ status: 1 });
const SPAWN_ERROR = () => ({ status: null, error: new Error('spawn failed') });

// Fake project: node_modules/electron/package.json and node_modules/better-sqlite3
const makeFakeProject = ({ electron = true, sqlite = true } = {}) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cryptocalc-native-'));
  if (electron) {
    fs.mkdirSync(path.join(root, 'node_modules', 'electron'), { recursive: true });
    fs.writeFileSync(path.join(root, 'node_modules', 'electron', 'package.json'),
                     JSON.stringify({ name: 'electron', version: ELECTRON_VERSION }));
  }
  if (sqlite) fs.mkdirSync(path.join(root, 'node_modules', SQLITE), { recursive: true });
  return root;
};

let logSpy, warnSpy;
beforeEach(() => {
  logSpy  = jest.spyOn(console, 'log').mockImplementation(() => {});
  warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => { logSpy.mockRestore(); warnSpy.mockRestore(); });

describe('package.json: no compiler needed', () => {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));

  test("'postinstall' and 'rebuild' run the script", () => {
    expect({ postinstall: pkg.scripts.postinstall, rebuild: pkg.scripts.rebuild })
      .toEqual({ postinstall: SCRIPT_COMMAND, rebuild: SCRIPT_COMMAND });
  });

  test("'electron-rebuild' (needs Visual Studio) is neither a script nor a dependency", () => {
    expect(Object.values(pkg.scripts).join(' ')).not.toContain('electron-rebuild');
    expect(Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })).not.toContain('electron-rebuild');
  });

  test('better-sqlite3 is the native module handled', () => {
    expect(NATIVE_MODULES).toEqual([SQLITE]);
  });
});

describe('Command', () => {
  test('prebuild-install arguments: Electron runtime, version, platform, architecture', () => {
    expect(prebuildArgs(ELECTRON_VERSION, PLATFORM, ARCH))
      .toEqual(['--runtime', 'electron', '--target', ELECTRON_VERSION, '--platform', PLATFORM, '--arch', ARCH]);
  });

  test('the manual command (shown on failure) contains the same arguments', () => {
    const command = manualCommand(SQLITE, ELECTRON_VERSION, PLATFORM, ARCH);
    expect(command).toContain('npx prebuild-install ' + prebuildArgs(ELECTRON_VERSION, PLATFORM, ARCH).join(' '));
    expect(command).toContain(SQLITE);
  });

  test('the Electron version is read from node_modules/electron/package.json', () => {
    expect(readElectronVersion(makeFakeProject())).toBe(ELECTRON_VERSION);
    expect(readElectronVersion(makeFakeProject({ electron: false }))).toBeUndefined();
  });
});

describe('Installation (download simulated)', () => {
  test('success: prebuild-install runs in the module folder with the Electron version', () => {
    const root  = makeFakeProject();
    const spawn = jest.fn(SUCCESS);
    expect(main(root, PLATFORM, ARCH, spawn)).toEqual([]);
    expect(spawn).toHaveBeenCalledTimes(1);
    const [command, args, options] = spawn.mock.calls[0];
    expect(command).toBe(process.execPath);
    expect(args[0]).toMatch(/prebuild-install[\\/]bin\.js$/);
    expect(args.slice(1)).toEqual(prebuildArgs(ELECTRON_VERSION, PLATFORM, ARCH));
    expect(options.cwd).toBe(path.join(root, 'node_modules', SQLITE));
  });

  test.each([['download failed', FAILURE], ['spawn error', SPAWN_ERROR]])(
    '%s: no exception, the module is reported and the manual command printed', (label, outcome) => {
      const spawn = jest.fn(outcome);
      expect(() => main(makeFakeProject(), PLATFORM, ARCH, spawn)).not.toThrow();
      expect(main(makeFakeProject(), PLATFORM, ARCH, spawn)).toEqual([SQLITE]);
      expect(warnSpy.mock.calls.flat().join('\n')).toContain('npx prebuild-install');
    });

  test('Electron not installed: nothing to do', () => {
    const spawn = jest.fn(SUCCESS);
    expect(main(makeFakeProject({ electron: false }), PLATFORM, ARCH, spawn)).toEqual([]);
    expect(spawn).not.toHaveBeenCalled();
  });

  test('better-sqlite3 not installed: skipped', () => {
    const spawn = jest.fn(SUCCESS);
    expect(installPrebuilt(makeFakeProject({ sqlite: false }), SQLITE, ELECTRON_VERSION, PLATFORM, ARCH, spawn)).toBe(true);
    expect(spawn).not.toHaveBeenCalled();
  });
});
