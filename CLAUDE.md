# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CryptoCalc** is a standalone non-custodial Electron desktop application for cryptocurrency wallet generation. It supports Simple Wallets and HD (Hierarchical Deterministic) wallets via BIP32/BIP39/BIP38 standards across 23 cryptocurrencies. Wallet outputs are saved as `.wits` JSON files, and a SQLite database can be populated from them.

## Commands

### Run the app
```
npm start
# Or on Windows: _runW.bat
# Or on Linux: _runX.sh
```

### Run all Jest unit tests
```
npm test
```

### Run a single test file
```
npx jest tests/jest/unit/crypto/bip39_utils.test.js
```

### Run tests in watch mode
```
npm run test:jest:watch
```

### Run tests with coverage
```
npm run test:jest:coverage
# Report is generated at tests/coverage/jest/test-report.html
```

### Run Playwright E2E tests
```
npm run test:playwright
npm run test:playwright:ui   # With interactive UI
npm run test:playwright:debug
```

### Build installer (Windows)
```
npm run build
```

### Rebuild native modules (after Electron version change)
```
npm run rebuild
```

## Architecture

### Process model (Electron)
- **Main process**: `www/js/_main/electron_main.js` — Electron entry point. Manages the BrowserWindow, file I/O (`.wits` files), app options, menus, and IPC. Singleton `ElectronMain` class.
- **Preload**: `www/js/_main/preload.js` — exposes a safe IPC bridge to the renderer.
- **Renderer process**: `www/index.html` loads the renderer-side JS.

### Core layers (renderer-side, all under `www/js/`)

| Directory | Role |
|---|---|
| `crypto/` | All cryptographic logic: BIP39/BIP32/BIP38 utils, blockchain constants, simple & HD wallet generators |
| `crypto/SimpleWallet/` | Per-blockchain simple (non-HD) wallet implementations |
| `crypto/HDWallet/` | HD wallet + BIP32 derivation, with specialized APIs for Cardano, Solana, SUI |
| `crypto/entropy_source/` | Dice (d6) and mouse-move entropy collection |
| `view/` | GUI classes: `MainGUI` (singleton), dialog manager, custom controls |
| `model/` | `MainModel` (singleton) — QR code generation, wallet info persistence, SQLite utils |
| `api/` | Express-based local REST API server (`SimpleApiServer` on port 3001), routes under `api/routes/` |
| `util/` | Logging, color console codes, HTML utilities, value helpers, fortune cookies |
| `L10n/` | Localization: `gui-msg-en.json`, `gui-msg-fr.json` |
| `const_keywords.js` | Shared string constants (field names, keywords) |
| `const_events.js` | IPC event name constants |

### Key constant files
- `www/js/crypto/const_blockchains.js` — blockchain names, coin types, BIP44 derivation params for all 23 coins
- `www/js/crypto/const_wallet.js` — wallet field name constants (ADDRESS, PRIVATE_KEY, WIF, etc.)
- `www/js/const_keywords.js` — app-wide keywords (MNEMONICS, ENTROPY, DERIVATION_PATH, etc.)

### Wallet generation flow
1. Entropy is generated (from dice, mouse, image, or UUID salt + user input)
2. `Bip39Utils` converts entropy hex → BIP39 mnemonic (with checksum)
3. For **Simple Wallet**: `SimpleWallet` (and per-blockchain APIs in `crypto/SimpleWallet/`) derives the address directly from the private key
4. For **HD Wallet**: `HdWallet` + `Bip32Utils` performs BIP32 key derivation (m/purpose'/coin_type'/account'/0/index) then calls blockchain-specific address logic
5. Output is saved as a `.wits` JSON file under `_output/` with QR codes in an `xtras/` subfolder

### Singleton pattern
Major classes (`ElectronMain`, `MainGUI`, `MainModel`, `CryptoServices`) use a private-key Singleton pattern:
```js
static #Key = Symbol();
static #Singleton = new MyClass(this.#Key);
static get This() { return MyClass.#Singleton; }
```

### Module exports pattern
Every module checks `if (typeof exports === 'object')` before exporting, so files work both in Electron renderer (no CommonJS) and in Node.js (tests).

## Testing

### Test structure
```
tests/
  jest/
    setup.js              # Global Jest setup, custom matchers, CRYPTO_CONFIG constants
    fixtures/             # inputs/ and expected/ JSON fixtures
    unit/
      crypto/             # bip32, bip38, bip39, address validation, hd_wallet, simple_wallet
      wallet/             # wallet-level tests
      utils/              # utility tests
    integration/          # API integration tests
    smoke.test.js
  playwright/             # E2E tests
```

### Jest module aliases (from `jest.config.js`)
```
@/       → www/
@crypto/ → www/js/crypto/
@api/    → www/js/api/
@util/   → www/js/util/
@tests/  → tests/jest/
```

### Coverage thresholds
All four metrics (branches, functions, lines, statements) must be ≥ 70%.

## Important constraints

- **ElectronJS ≤ 31** — Later versions block access to dropped file paths for security reasons.
- **bs58 pinned to 5.0.0** — Newer versions use ESM `import` syntax which is incompatible with Electron's CommonJS `require`.
- The app is designed to be used **offline** (cold wallet). Internet connectivity is deliberately detected and displayed as a warning.
- Wallet save output goes to `_output/` (timestamped subfolders). This folder is git-ignored.
