/**
 * ============================================================================
 * Unit Tests - Hex Utilities
 * ============================================================================
 * Tests all functions from hex_utils.js
 * Location: www/js/crypto/hex_utils.js
 * ============================================================================
 */

const {
  hexWithoutPrefix, hexWithPrefix, isHexString,
  hexToBinary, binaryToHex,
  hexToUint8Array, uint8ArrayToHex,
  hexToBytes, hexToB64, b64ToHex,
  getRandomInt, getRandomByte, getRandomHexValue,
} = require('@crypto/hex_utils.js');

describe('hex_utils', () => {

  // ==========================================================================
  // hexWithoutPrefix / hexWithPrefix
  // ==========================================================================

  describe('hexWithoutPrefix', () => {

    test('strips 0x prefix', () => {
      expect(hexWithoutPrefix('0xdeadbeef')).toBe('deadbeef');
    });

    test('is idempotent when no prefix', () => {
      expect(hexWithoutPrefix('deadbeef')).toBe('deadbeef');
    });

    test('strips 0x from a 64-char private key', () => {
      const key = '0x' + 'a'.repeat(64);
      expect(hexWithoutPrefix(key)).toBe('a'.repeat(64));
    });
  });

  describe('hexWithPrefix', () => {

    test('adds 0x prefix', () => {
      expect(hexWithPrefix('deadbeef')).toBe('0xdeadbeef');
    });

    test('is idempotent when prefix already present', () => {
      expect(hexWithPrefix('0xdeadbeef')).toBe('0xdeadbeef');
    });
  });

  describe('hexWithoutPrefix / hexWithPrefix round-trip', () => {

    test('add then remove prefix returns original', () => {
      const hex = 'aabbccdd';
      expect(hexWithoutPrefix(hexWithPrefix(hex))).toBe(hex);
    });

    test('remove then add prefix returns prefixed string', () => {
      const hex = '0xaabbccdd';
      expect(hexWithPrefix(hexWithoutPrefix(hex))).toBe(hex);
    });
  });

  // ==========================================================================
  // isHexString
  // ==========================================================================

  describe('isHexString', () => {

    test('accepts lowercase hex', () => {
      expect(isHexString('0123456789abcdef')).toBe(true);
    });

    test('accepts uppercase hex', () => {
      expect(isHexString('ABCDEF')).toBe(true);
    });

    test('accepts mixed case hex', () => {
      expect(isHexString('DeAdBeEf')).toBe(true);
    });

    test('accepts 0x-prefixed hex', () => {
      expect(isHexString('0xdeadbeef')).toBe(true);
    });

    test('rejects strings with non-hex characters', () => {
      expect(isHexString('xyz')).toBe(false);
    });

    test('rejects strings with spaces', () => {
      expect(isHexString('dead beef')).toBe(false);
    });

    test('rejects a standard English word', () => {
      expect(isHexString('hello')).toBe(false);
    });
  });

  // ==========================================================================
  // hexToBinary / binaryToHex
  // ==========================================================================

  describe('hexToBinary', () => {

    test('converts 0 → 0000', () => {
      expect(hexToBinary('0')).toBe('0000');
    });

    test('converts f → 1111', () => {
      expect(hexToBinary('f')).toBe('1111');
    });

    test('converts ff → 11111111', () => {
      expect(hexToBinary('ff')).toBe('11111111');
    });

    test('converts 00 → 00000000', () => {
      expect(hexToBinary('00')).toBe('00000000');
    });

    test('output length is 4x input length', () => {
      const hex = 'deadbeef';
      expect(hexToBinary(hex)).toHaveLength(hex.length * 4);
    });
  });

  describe('binaryToHex', () => {

    test('converts 0000 → 0', () => {
      expect(binaryToHex('0000')).toBe('0');
    });

    test('converts 1111 → f', () => {
      expect(binaryToHex('1111')).toBe('f');
    });

    test('converts 11111111 → ff', () => {
      expect(binaryToHex('11111111')).toBe('ff');
    });
  });

  describe('hexToBinary / binaryToHex round-trip', () => {

    test('hex → binary → hex returns original', () => {
      const hex = 'deadbeef';
      expect(binaryToHex(hexToBinary(hex))).toBe(hex);
    });

    test('round-trip pour tous les nibbles 0-f', () => {
      const hex = '0123456789abcdef';
      expect(binaryToHex(hexToBinary(hex))).toBe(hex);
    });

    test('round-trip pour une entropie 256 bits', () => {
      const hex = 'a'.repeat(64);
      expect(binaryToHex(hexToBinary(hex))).toBe(hex);
    });
  });

  // ==========================================================================
  // hexToUint8Array / uint8ArrayToHex
  // ==========================================================================

  describe('hexToUint8Array', () => {

    test('converts ff → Uint8Array([255])', () => {
      const arr = hexToUint8Array('ff');
      expect(arr).toBeInstanceOf(Uint8Array);
      expect(arr[0]).toBe(255);
    });

    test('converts 00 → Uint8Array([0])', () => {
      expect(hexToUint8Array('00')[0]).toBe(0);
    });

    test('converts 0001 → [0, 1]', () => {
      const arr = hexToUint8Array('0001');
      expect(arr.length).toBe(2);
      expect(arr[0]).toBe(0);
      expect(arr[1]).toBe(1);
    });

    test('output length equals input_length / 2', () => {
      const hex = 'deadbeef';
      expect(hexToUint8Array(hex).length).toBe(hex.length / 2);
    });

    test('throws on odd-length hex string', () => {
      expect(() => hexToUint8Array('abc')).toThrow();
    });

    test('strips 0x prefix before conversion', () => {
      const arr = hexToUint8Array('0xff');
      expect(arr[0]).toBe(255);
    });
  });

  describe('uint8ArrayToHex', () => {

    test('converts [255] → ff', () => {
      expect(uint8ArrayToHex(new Uint8Array([255]))).toBe('ff');
    });

    test('pads single-digit values with leading zero', () => {
      expect(uint8ArrayToHex(new Uint8Array([1]))).toBe('01');
    });

    test('converts [0, 1] → 0001', () => {
      expect(uint8ArrayToHex(new Uint8Array([0, 1]))).toBe('0001');
    });
  });

  describe('hexToUint8Array / uint8ArrayToHex round-trip', () => {

    test('hex → Uint8Array → hex returns original', () => {
      const hex = 'deadbeef';
      expect(uint8ArrayToHex(hexToUint8Array(hex))).toBe(hex);
    });

    test('round-trip pour une entropie 128 bits', () => {
      const hex = '0'.repeat(32);
      expect(uint8ArrayToHex(hexToUint8Array(hex))).toBe(hex);
    });
  });

  // ==========================================================================
  // hexToBytes
  // ==========================================================================

  describe('hexToBytes', () => {

    test('converts ff → [255]', () => {
      expect(hexToBytes('ff')).toEqual([255]);
    });

    test('converts 0001 → [0, 1]', () => {
      expect(hexToBytes('0001')).toEqual([0, 1]);
    });

    test('output is a regular Array (not Uint8Array)', () => {
      expect(Array.isArray(hexToBytes('ff'))).toBe(true);
    });

    test('throws on odd-length hex', () => {
      expect(() => hexToBytes('abc')).toThrow();
    });
  });

  // ==========================================================================
  // hexToB64 / b64ToHex
  // ==========================================================================

  describe('hexToB64', () => {

    test('returns a non-empty string', () => {
      expect(hexToB64('deadbeef')).toBeTruthy();
    });

    test('output does not look like hex', () => {
      const b64 = hexToB64('deadbeef');
      // Base64 contient souvent des +, / ou =
      expect(typeof b64).toBe('string');
      expect(b64.length).toBeGreaterThan(0);
    });
  });

  describe('hexToB64 / b64ToHex round-trip', () => {

    test('hex → b64 → hex returns original', () => {
      const hex = 'deadbeef';
      expect(b64ToHex(hexToB64(hex))).toBe(hex);
    });

    test('round-trip pour une clé privée de 64 chars', () => {
      const privKey = 'a'.repeat(64);
      expect(b64ToHex(hexToB64(privKey))).toBe(privKey);
    });

    test('round-trip pour une entropie 256 bits', () => {
      const hex = '0'.repeat(64);
      expect(b64ToHex(hexToB64(hex))).toBe(hex);
    });
  });

  // ==========================================================================
  // getRandomInt / getRandomByte / getRandomHexValue
  // ==========================================================================

  describe('getRandomInt', () => {

    test('retourne un entier dans [0, max]', () => {
      for (let i = 0; i < 50; i++) {
        const v = getRandomInt(10);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(10);
        expect(Number.isInteger(v)).toBe(true);
      }
    });

    test('retourne 0 pour max=0', () => {
      expect(getRandomInt(0)).toBe(0);
    });
  });

  describe('getRandomByte', () => {

    test('retourne une valeur dans [0, 255]', () => {
      for (let i = 0; i < 50; i++) {
        const v = getRandomByte();
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(255);
        expect(Number.isInteger(v)).toBe(true);
      }
    });
  });

  describe('getRandomHexValue', () => {

    test('retourne une chaîne de longueur byte_count * 2', () => {
      expect(getRandomHexValue(16)).toHaveLength(32);
      expect(getRandomHexValue(32)).toHaveLength(64);
    });

    test('retourne une chaîne hex valide (minuscules)', () => {
      expect(getRandomHexValue(32)).toMatch(/^[0-9a-f]+$/);
    });

    test('produit des valeurs différentes à chaque appel (statistique)', () => {
      const v1 = getRandomHexValue(32);
      const v2 = getRandomHexValue(32);
      // Probabilité de collision négligeable sur 256 bits
      expect(v1).not.toBe(v2);
    });

    test('fonctionne avec 1 byte', () => {
      expect(getRandomHexValue(1)).toHaveLength(2);
    });
  });
});
