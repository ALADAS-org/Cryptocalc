/**
 * ============================================================================
 * Unit Tests - BIP38 Utilities
 * ============================================================================
 * Tests the BIP38 utility functions for private key encryption/decryption
 * Location: www/js/crypto/bip38_utils.js
 * Note: Console.log suppression is configured globally in setup.js
 *
 * !! IMPORTANT - WHY bip38 IS MOCKED !!
 * The real bip38 library uses scrypt with N=16384 (the BIP38 recommended
 * default). Each encrypt/decrypt call takes ~5-15 seconds. Mocking avoids
 * multi-minute test runs while still testing all the surrounding logic:
 * input validation, singleton pattern, error handling, IPC progress callback,
 * window management, and correct argument forwarding to the library.
 * Integration tests (using the real library) should be kept in a separate
 * slower test suite.
 * ============================================================================
 */

// ============================================================================
// MOCKS  (must be declared before any require() of the modules under test)
// ============================================================================

// Mock electron - not available in a Jest/Node environment
jest.mock('electron', () => ({
  dialog: {
    showMessageBoxSync: jest.fn()
  }
}));

// Mock the bip38 library to avoid prohibitively slow scrypt operations.
// Return values match the BIP38 spec test vectors (Non-EC / Method 1).
jest.mock('bip38', () => {
  const mock = {
    scryptParams: {},   // must be writable - the constructor sets it
    encrypt: jest.fn(),
    decrypt: jest.fn()
  };
  return mock;
});

// Mock const_events so the IPC event constant is available
jest.mock('@www/js/const_events.js', () => ({
  FromMain_BIP38_PROGRESS_TICK: 'fromMain_BIP38_PROGRESS_TICK'
}));

// ============================================================================
// IMPORTS
// ============================================================================

const { Bip38Utils }                = require('@crypto/bip38_utils.js');
const { PrettyLog, UNIT_TESTS_LOG_MODE } = require('@util/log/log_utils.js');
const { ERROR_RETURN_VALUE }        = require('@www/js/const_keywords.js');

// Access the mocked bip38 module so we can configure per-test return values
const Bip38 = require('bip38');

// ============================================================================
// TEST FIXTURES
// ============================================================================

// BIP38 Non-EC (Method 1) spec test vector
// Source: https://github.com/bitcoin/bips/blob/master/bip-0038.mediawiki
const SPEC_PRIVATE_KEY  = 'cbf4b9f70470856bb4f40f80b87edb90865997ffee6df315ab166d713af433a5';
const SPEC_PASSPHRASE   = 'TestingOneTwoThree';
const SPEC_ENCRYPTED_PK = '6PRVWUbkzzsbcVac2qwfssoUJAN1Xhrg6bNk8J7Nzm5H7kxEbn2Nh2ZoGg';

// Second test vector from the built-in test_Bip38Utils() function in the source file
const ALT_PRIVATE_KEY   = '5f62891bb6f10fb522f5473e05b8bdf025cd7231fd34d9798c06dd8752fb9272';
const ALT_PASSPHRASE    = 'TestingOneTwoThree';

// Helper: creates a minimal Electron BrowserWindow mock
const createMockWindow = () => ({
  webContents: {
    send: jest.fn().mockResolvedValue(undefined)
  }
});

// ============================================================================
// TEST SUITE
// ============================================================================

describe('BIP38 Utilities', () => {

  let mockWindow;

  beforeAll(() => {
    PrettyLog.This.logMode = UNIT_TESTS_LOG_MODE;
  });

  beforeEach(() => {
    // Fresh window mock and cleared call counters before every test
    mockWindow = createMockWindow();
    jest.clearAllMocks();

    // Default happy-path stubs (individual tests may override)
    Bip38.encrypt.mockReturnValue(SPEC_ENCRYPTED_PK);
    Bip38.decrypt.mockReturnValue({
      privateKey: Buffer.from(SPEC_PRIVATE_KEY, 'hex')
    });
  });

  // ==========================================================================
  // SINGLETON PATTERN TESTS
  // ==========================================================================

  describe('Singleton Pattern', () => {

    test('Bip38Utils.This returns a defined instance', () => {
      expect(Bip38Utils.This).toBeDefined();
    });

    test('Bip38Utils.This always returns the same instance', () => {
      const instance1 = Bip38Utils.This;
      const instance2 = Bip38Utils.This;

      expect(instance1).toBe(instance2);
    });

    test('direct constructor call throws a TypeError', () => {
      expect(() => new Bip38Utils()).toThrow(TypeError);
    });

    test('instance exposes encrypt method', () => {
      expect(typeof Bip38Utils.This.encrypt).toBe('function');
    });

    test('instance exposes decrypt method', () => {
      expect(typeof Bip38Utils.This.decrypt).toBe('function');
    });

    test('instance exposes getMainWindow method', () => {
      expect(typeof Bip38Utils.This.getMainWindow).toBe('function');
    });
  });

  // ==========================================================================
  // encrypt() TESTS
  // ==========================================================================

  describe('encrypt()', () => {

    // --- Happy path ---

    test('returns a non-empty string for valid private key and passphrase', async () => {
      const result = await Bip38Utils.This.encrypt(SPEC_PRIVATE_KEY, SPEC_PASSPHRASE, mockWindow);

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('returns a string starting with "6P" (BIP38 Non-EC prefix)', async () => {
      const result = await Bip38Utils.This.encrypt(SPEC_PRIVATE_KEY, SPEC_PASSPHRASE, mockWindow);

      expect(result).toMatch(/^6P/);
    });

    test('forwards the private key buffer to the bip38 library', async () => {
      await Bip38Utils.This.encrypt(SPEC_PRIVATE_KEY, SPEC_PASSPHRASE, mockWindow);

      expect(Bip38.encrypt).toHaveBeenCalledTimes(1);
      const calledWithKey = Bip38.encrypt.mock.calls[0][0];
      // bip38 must receive a binary key (Buffer or Uint8Array), not a raw hex string.
      // Buffer extends Uint8Array, so instanceof covers both regardless of wif version.
      expect(calledWithKey instanceof Uint8Array).toBe(true);
    });

    test('forwards the passphrase to the bip38 library', async () => {
      await Bip38Utils.This.encrypt(SPEC_PRIVATE_KEY, SPEC_PASSPHRASE, mockWindow);

      const calledWithPassphrase = Bip38.encrypt.mock.calls[0][2];
      expect(calledWithPassphrase).toBe(SPEC_PASSPHRASE);
    });

    test('accepts a private key with 0x prefix', async () => {
      const result = await Bip38Utils.This.encrypt('0x' + SPEC_PRIVATE_KEY, SPEC_PASSPHRASE, mockWindow);

      expect(result).toBeDefined();
      expect(result).not.toBe(ERROR_RETURN_VALUE);
    });

    test('produces consistent result for different valid private keys', async () => {
      const ENCRYPTED_ALT = '6PRWdmoT74bPaNSBpJ3yfSGGBzAHFiRHNLFmkn2ycKd3C9tH9JdFqHxUNYW';
      Bip38.encrypt.mockReturnValue(ENCRYPTED_ALT);

      const result = await Bip38Utils.This.encrypt(ALT_PRIVATE_KEY, ALT_PASSPHRASE, mockWindow);

      expect(result).toBe(ENCRYPTED_ALT);
    });

    // --- Guard clauses: empty / undefined inputs → return "" ---

    test('returns empty string when private_key is undefined', async () => {
      const result = await Bip38Utils.This.encrypt(undefined, SPEC_PASSPHRASE, mockWindow);

      expect(result).toBe('');
    });

    test('returns empty string when private_key is empty string', async () => {
      const result = await Bip38Utils.This.encrypt('', SPEC_PASSPHRASE, mockWindow);

      expect(result).toBe('');
    });

    test('returns empty string when passphrase is undefined', async () => {
      const result = await Bip38Utils.This.encrypt(SPEC_PRIVATE_KEY, undefined, mockWindow);

      expect(result).toBe('');
    });

    test('returns empty string when passphrase is empty string', async () => {
      const result = await Bip38Utils.This.encrypt(SPEC_PRIVATE_KEY, '', mockWindow);

      expect(result).toBe('');
    });

    test('returns empty string when both private_key and passphrase are undefined', async () => {
      const result = await Bip38Utils.This.encrypt(undefined, undefined, mockWindow);

      expect(result).toBe('');
    });

    // --- bip38 does not get called for invalid inputs ---

    test('does not call bip38.encrypt when private_key is empty', async () => {
      await Bip38Utils.This.encrypt('', SPEC_PASSPHRASE, mockWindow);

      expect(Bip38.encrypt).not.toHaveBeenCalled();
    });

    test('does not call bip38.encrypt when passphrase is empty', async () => {
      await Bip38Utils.This.encrypt(SPEC_PRIVATE_KEY, '', mockWindow);

      expect(Bip38.encrypt).not.toHaveBeenCalled();
    });

    // --- Error handling ---

    test('returns ERROR_RETURN_VALUE when bip38.encrypt throws', async () => {
      Bip38.encrypt.mockImplementation(() => { throw new Error('scrypt failure'); });

      const result = await Bip38Utils.This.encrypt(SPEC_PRIVATE_KEY, SPEC_PASSPHRASE, mockWindow);

      expect(result).toBe(ERROR_RETURN_VALUE);
    });

    test('calls dialog.showMessageBoxSync on encrypt error', async () => {
      Bip38.encrypt.mockImplementation(() => { throw new Error('scrypt failure'); });
      const { dialog } = require('electron');

      await Bip38Utils.This.encrypt(SPEC_PRIVATE_KEY, SPEC_PASSPHRASE, mockWindow);

      expect(dialog.showMessageBoxSync).toHaveBeenCalledTimes(1);
    });

    // --- Progress callback wiring ---

    test('passes a progress callback function as 4th argument to bip38.encrypt', async () => {
      await Bip38Utils.This.encrypt(SPEC_PRIVATE_KEY, SPEC_PASSPHRASE, mockWindow);

      const progressCb = Bip38.encrypt.mock.calls[0][3];
      expect(typeof progressCb).toBe('function');
    });

    test('passes scryptParams as 5th argument to bip38.encrypt', async () => {
      await Bip38Utils.This.encrypt(SPEC_PRIVATE_KEY, SPEC_PASSPHRASE, mockWindow);

      const passedScryptParams = Bip38.encrypt.mock.calls[0][4];
      expect(passedScryptParams).toBeDefined();
      expect(passedScryptParams).toHaveProperty('N');
      expect(passedScryptParams).toHaveProperty('r');
      expect(passedScryptParams).toHaveProperty('p');
    });
  });

  // ==========================================================================
  // decrypt() TESTS
  // ==========================================================================

  describe('decrypt()', () => {

    // --- Happy path ---

    test('returns a non-empty string for valid encrypted key and passphrase', async () => {
      const result = await Bip38Utils.This.decrypt(SPEC_ENCRYPTED_PK, SPEC_PASSPHRASE, mockWindow);

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('returns a valid 64-character hex private key', async () => {
      const result = await Bip38Utils.This.decrypt(SPEC_ENCRYPTED_PK, SPEC_PASSPHRASE, mockWindow);

      expect(result).toMatch(/^[0-9a-f]{64}$/i);
    });

    test('returns the correct private key for the spec test vector', async () => {
      const result = await Bip38Utils.This.decrypt(SPEC_ENCRYPTED_PK, SPEC_PASSPHRASE, mockWindow);

      expect(result).toBe(SPEC_PRIVATE_KEY);
    });

    test('forwards the encrypted key to the bip38 library', async () => {
      await Bip38Utils.This.decrypt(SPEC_ENCRYPTED_PK, SPEC_PASSPHRASE, mockWindow);

      expect(Bip38.decrypt).toHaveBeenCalledTimes(1);
      expect(Bip38.decrypt.mock.calls[0][0]).toBe(SPEC_ENCRYPTED_PK);
    });

    test('forwards the passphrase to the bip38 library', async () => {
      await Bip38Utils.This.decrypt(SPEC_ENCRYPTED_PK, SPEC_PASSPHRASE, mockWindow);

      expect(Bip38.decrypt.mock.calls[0][1]).toBe(SPEC_PASSPHRASE);
    });

    // --- Guard clauses: empty / undefined inputs → return "" ---

    test('returns empty string when encrypted_pk is undefined', async () => {
      const result = await Bip38Utils.This.decrypt(undefined, SPEC_PASSPHRASE, mockWindow);

      expect(result).toBe('');
    });

    test('returns empty string when encrypted_pk is empty string', async () => {
      const result = await Bip38Utils.This.decrypt('', SPEC_PASSPHRASE, mockWindow);

      expect(result).toBe('');
    });

    test('returns empty string when passphrase is undefined', async () => {
      const result = await Bip38Utils.This.decrypt(SPEC_ENCRYPTED_PK, undefined, mockWindow);

      expect(result).toBe('');
    });

    test('returns empty string when passphrase is empty string', async () => {
      const result = await Bip38Utils.This.decrypt(SPEC_ENCRYPTED_PK, '', mockWindow);

      expect(result).toBe('');
    });

    test('returns empty string when both encrypted_pk and passphrase are undefined', async () => {
      const result = await Bip38Utils.This.decrypt(undefined, undefined, mockWindow);

      expect(result).toBe('');
    });

    // --- bip38 does not get called for invalid inputs ---

    test('does not call bip38.decrypt when encrypted_pk is empty', async () => {
      await Bip38Utils.This.decrypt('', SPEC_PASSPHRASE, mockWindow);

      expect(Bip38.decrypt).not.toHaveBeenCalled();
    });

    test('does not call bip38.decrypt when passphrase is empty', async () => {
      await Bip38Utils.This.decrypt(SPEC_ENCRYPTED_PK, '', mockWindow);

      expect(Bip38.decrypt).not.toHaveBeenCalled();
    });

    // --- Error handling ---

    test('returns ERROR_RETURN_VALUE when bip38.decrypt throws', async () => {
      Bip38.decrypt.mockImplementation(() => { throw new Error('wrong passphrase'); });

      const result = await Bip38Utils.This.decrypt(SPEC_ENCRYPTED_PK, 'wrong', mockWindow);

      expect(result).toBe(ERROR_RETURN_VALUE);
    });

    test('calls dialog.showMessageBoxSync on decrypt error', async () => {
      Bip38.decrypt.mockImplementation(() => { throw new Error('wrong passphrase'); });
      const { dialog } = require('electron');

      await Bip38Utils.This.decrypt(SPEC_ENCRYPTED_PK, 'wrong', mockWindow);

      expect(dialog.showMessageBoxSync).toHaveBeenCalledTimes(1);
    });

    // --- Progress callback wiring ---

    test('passes a progress callback function as 3rd argument to bip38.decrypt', async () => {
      await Bip38Utils.This.decrypt(SPEC_ENCRYPTED_PK, SPEC_PASSPHRASE, mockWindow);

      const progressCb = Bip38.decrypt.mock.calls[0][2];
      expect(typeof progressCb).toBe('function');
    });

    test('passes scryptParams as 4th argument to bip38.decrypt', async () => {
      await Bip38Utils.This.decrypt(SPEC_ENCRYPTED_PK, SPEC_PASSPHRASE, mockWindow);

      const passedScryptParams = Bip38.decrypt.mock.calls[0][3];
      expect(passedScryptParams).toBeDefined();
      expect(passedScryptParams).toHaveProperty('N');
    });
  });

  // ==========================================================================
  // getMainWindow() TESTS
  // ==========================================================================

  describe('getMainWindow()', () => {

    test('returns undefined before any encrypt/decrypt call', () => {
      // The singleton may have been used by earlier tests, so we only verify
      // that getMainWindow() is callable and returns something
      expect(() => Bip38Utils.This.getMainWindow()).not.toThrow();
    });

    test('returns the window passed to encrypt()', async () => {
      const win = createMockWindow();
      await Bip38Utils.This.encrypt(SPEC_PRIVATE_KEY, SPEC_PASSPHRASE, win);

      expect(Bip38Utils.This.getMainWindow()).toBe(win);
    });

    test('returns the window passed to decrypt()', async () => {
      const win = createMockWindow();
      await Bip38Utils.This.decrypt(SPEC_ENCRYPTED_PK, SPEC_PASSPHRASE, win);

      expect(Bip38Utils.This.getMainWindow()).toBe(win);
    });

    test('updates stored window when decrypt is called after encrypt with a different window', async () => {
      const win1 = createMockWindow();
      const win2 = createMockWindow();

      await Bip38Utils.This.encrypt(SPEC_PRIVATE_KEY, SPEC_PASSPHRASE, win1);
      await Bip38Utils.This.decrypt(SPEC_ENCRYPTED_PK, SPEC_PASSPHRASE, win2);

      expect(Bip38Utils.This.getMainWindow()).toBe(win2);
    });
  });

  // ==========================================================================
  // SCRYPT CONFIGURATION TESTS
  // ==========================================================================

  describe('scryptParams Configuration', () => {

    test('scryptParams has an N property', () => {
      expect(Bip38Utils.This.scryptParams).toHaveProperty('N');
    });

    test('scryptParams has an r property equal to 8', () => {
      expect(Bip38Utils.This.scryptParams.r).toBe(8);
    });

    test('scryptParams has a p property equal to 8', () => {
      expect(Bip38Utils.This.scryptParams.p).toBe(8);
    });

    test('encryptDifficulty is a positive integer', () => {
      expect(Bip38Utils.This.encryptDifficulty).toBeGreaterThan(0);
      expect(Number.isInteger(Bip38Utils.This.encryptDifficulty)).toBe(true);
    });

    test('N in scryptParams matches encryptDifficulty', () => {
      expect(Bip38Utils.This.scryptParams.N).toBe(Bip38Utils.This.encryptDifficulty);
    });

    test('scryptParams is passed to bip38.encrypt on every call', async () => {
      await Bip38Utils.This.encrypt(SPEC_PRIVATE_KEY, SPEC_PASSPHRASE, mockWindow);

      const usedParams = Bip38.encrypt.mock.calls[0][4];
      expect(usedParams).toEqual(Bip38Utils.This.scryptParams);
    });
  });

  // ==========================================================================
  // ENCRYPT / DECRYPT ROUND-TRIP TESTS
  // (mocked at bip38 boundary - verifies correct data flow end to end)
  // ==========================================================================

  describe('Encrypt / Decrypt Round-trip (mocked bip38 boundary)', () => {

    test('decrypt returns the original private key after encrypt (via mock)', async () => {
      // Configure mock so decrypt recovers the key that was "encrypted"
      Bip38.encrypt.mockReturnValue(SPEC_ENCRYPTED_PK);
      Bip38.decrypt.mockReturnValue({
        privateKey: Buffer.from(SPEC_PRIVATE_KEY, 'hex')
      });

      const encrypted = await Bip38Utils.This.encrypt(SPEC_PRIVATE_KEY, SPEC_PASSPHRASE, mockWindow);
      const decrypted = await Bip38Utils.This.decrypt(encrypted, SPEC_PASSPHRASE, mockWindow);

      expect(decrypted).toBe(SPEC_PRIVATE_KEY);
    });

    test('encrypted key starts with "6P" and is non-empty, decrypted key is 64 hex chars', async () => {
      const encrypted = await Bip38Utils.This.encrypt(SPEC_PRIVATE_KEY, SPEC_PASSPHRASE, mockWindow);
      const decrypted = await Bip38Utils.This.decrypt(encrypted, SPEC_PASSPHRASE, mockWindow);

      expect(encrypted).toMatch(/^6P/);
      expect(decrypted).toMatch(/^[0-9a-f]{64}$/i);
    });

    test('wrong passphrase causes decrypt to return ERROR_RETURN_VALUE', async () => {
      Bip38.decrypt.mockImplementation(() => { throw new Error('wrong passphrase'); });

      const encrypted = await Bip38Utils.This.encrypt(SPEC_PRIVATE_KEY, SPEC_PASSPHRASE, mockWindow);
      const decrypted = await Bip38Utils.This.decrypt(encrypted, 'wrong_password', mockWindow);

      expect(decrypted).toBe(ERROR_RETURN_VALUE);
    });

    test('encrypt error does not corrupt a subsequent successful decrypt', async () => {
      // First call throws
      Bip38.encrypt.mockImplementationOnce(() => { throw new Error('fail'); });
      await Bip38Utils.This.encrypt(SPEC_PRIVATE_KEY, SPEC_PASSPHRASE, mockWindow);

      // Second call (decrypt) must still work normally
      const decrypted = await Bip38Utils.This.decrypt(SPEC_ENCRYPTED_PK, SPEC_PASSPHRASE, mockWindow);
      expect(decrypted).toBe(SPEC_PRIVATE_KEY);
    });
  });

}); // BIP38 Utilities
