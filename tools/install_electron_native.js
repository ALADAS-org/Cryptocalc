/**
 * ============================================================================
 * Native modules for Electron, without any compiler (Windows, Linux, macOS)
 * ============================================================================
 * 'npm install' fetches the native modules built for Node. Most of them work
 * in Electron as they are (N-API prebuilds, or a JavaScript fallback), except
 * 'better-sqlite3', whose binary depends on the exact Electron version.
 *
 * This script downloads the prebuilt 'better-sqlite3' binary for the installed
 * Electron version ('prebuild-install', installed with 'better-sqlite3'):
 * no Visual Studio, no node-gyp. It runs:
 *   - automatically after 'npm install' ("postinstall")
 *   - on demand: 'npm run rebuild' (e.g. after an Electron update)
 *
 * It never makes 'npm install' fail: on error (no network, no prebuilt binary)
 * it prints the manual command and exits with code 0.
 *
 * NB: up to 0.5.35 'npm run rebuild' used 'electron-rebuild', which compiles
 *     the native modules and needs Visual Studio (C++ Build Tools).
 * ============================================================================
 */
'use strict';
const fs   = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const PROJECT_ROOT   = path.join(__dirname, '..');
const NATIVE_MODULES = ['better-sqlite3']; // native modules without an Electron-compatible prebuild
const RUNTIME        = 'electron';
const LOG_PREFIX     = '[install_electron_native] ';

const moduleDir = (root, module_name) => path.join(root, 'node_modules', module_name);

const readElectronVersion = (root) => {
  const electron_package = path.join(moduleDir(root, 'electron'), 'package.json');
  if (! fs.existsSync(electron_package)) return undefined;
  return JSON.parse(fs.readFileSync(electron_package, 'utf8')).version;
};

// Arguments of 'prebuild-install' for a module, an Electron version, a platform and an architecture
const prebuildArgs = (electron_version, platform, arch) =>
  ['--runtime', RUNTIME, '--target', electron_version, '--platform', platform, '--arch', arch];

// Command line to type by hand (shown when the download fails)
const manualCommand = (module_name, electron_version, platform, arch) =>
  'cd node_modules' + path.sep + module_name + ' && npx prebuild-install '
  + prebuildArgs(electron_version, platform, arch).join(' ');

// true if the prebuilt binary was installed; never throws
const installPrebuilt = (root, module_name, electron_version, platform, arch, spawn = spawnSync) => {
  const module_dir = moduleDir(root, module_name);
  if (! fs.existsSync(module_dir)) {
    console.log(LOG_PREFIX + module_name + ': not installed, skipped');
    return true;
  }
  let prebuild_install;
  try {
    prebuild_install = require.resolve('prebuild-install/bin.js', { paths: [module_dir, PROJECT_ROOT] });
  }
  catch (error) {
    console.warn(LOG_PREFIX + module_name + ': prebuild-install not found');
    console.warn(LOG_PREFIX + 'Manual command: ' + manualCommand(module_name, electron_version, platform, arch));
    return false;
  }
  const result = spawn(process.execPath, [prebuild_install, ...prebuildArgs(electron_version, platform, arch)],
                       { cwd: module_dir, stdio: 'inherit' });
  if (result.error !== undefined || result.status !== 0) {
    console.warn(LOG_PREFIX + module_name + ': no prebuilt binary installed for Electron ' + electron_version
                 + ' (' + platform + '-' + arch + ')');
    console.warn(LOG_PREFIX + 'Manual command: ' + manualCommand(module_name, electron_version, platform, arch));
    return false;
  }
  console.log(LOG_PREFIX + module_name + ': prebuilt binary for Electron ' + electron_version
              + ' (' + platform + '-' + arch + ') installed');
  return true;
};

// Returns the list of the modules which failed (empty: all installed)
const main = (root = PROJECT_ROOT, platform = process.platform, arch = process.arch, spawn = spawnSync) => {
  const electron_version = readElectronVersion(root);
  if (electron_version === undefined) {
    console.warn(LOG_PREFIX + 'Electron is not installed: nothing to do');
    return [];
  }
  return NATIVE_MODULES.filter((module_name) =>
    ! installPrebuilt(root, module_name, electron_version, platform, arch, spawn));
};

if (require.main === module) {
  main();
  process.exit(0); // never make 'npm install' fail
}

module.exports = { NATIVE_MODULES, readElectronVersion, prebuildArgs, manualCommand, installPrebuilt, main };
