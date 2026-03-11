/**
 * ============================================================================
 * Unit Tests - Base58 Utilities
 * ============================================================================
 * Tests all functions from base58_utils.js
 * Location: www/js/crypto/base58_utils.js
 * ============================================================================
 */

const {
  B58_ALPHABET,
  isBase58String,
  b58ToHex,
  hexToB58,
} = require('@crypto/base58_utils.js');

describe('base58_utils', () => {

  // ==========================================================================
  // B58_ALPHABET
  // ==========================================================================

  describe('B58_ALPHABET', () => {

    test('contient exactement 58 caractères', () => {
      expect(B58_ALPHABET.length).toBe(58);
    });

    test('ne contient pas 0 (zero)', () => {
      expect(B58_ALPHABET).not.toContain('0');
    });

    test('ne contient pas O (lettre majuscule)', () => {
      expect(B58_ALPHABET).not.toContain('O');
    });

    test('ne contient pas I (i majuscule)', () => {
      expect(B58_ALPHABET).not.toContain('I');
    });

    test('ne contient pas l (l minuscule)', () => {
      expect(B58_ALPHABET).not.toContain('l');
    });

    test('commence par 1', () => {
      expect(B58_ALPHABET[0]).toBe('1');
    });
  });

  // ==========================================================================
  // isBase58String
  // ==========================================================================

  describe('isBase58String', () => {

    test('retourne true pour une adresse Bitcoin valide', () => {
      // Adresse Bitcoin legacy bien connue
      expect(isBase58String('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')).toBe(true);
    });

    test('retourne true pour une chaîne composée uniquement de caractères Base58', () => {
      expect(isBase58String('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz')).toBe(true);
    });

    test('retourne false pour une chaîne contenant "0" (zéro)', () => {
      expect(isBase58String('1A1z0P1e')).toBe(false);
    });

    test('retourne false pour une chaîne contenant "O" (O majuscule)', () => {
      expect(isBase58String('1A1zOP1e')).toBe(false);
    });

    test('retourne false pour une chaîne contenant "I" (i majuscule)', () => {
      expect(isBase58String('1A1zIP1e')).toBe(false);
    });

    test('retourne false pour une chaîne contenant "l" (l minuscule)', () => {
      expect(isBase58String('1A1zlP1e')).toBe(false);
    });

    test('retourne false pour une chaîne vide', () => {
      expect(isBase58String('')).toBe(false);
    });

    test('retourne false pour undefined', () => {
      expect(isBase58String(undefined)).toBe(false);
    });

    test('retourne false pour null', () => {
      expect(isBase58String(null)).toBe(false);
    });

    test('retourne false si la chaîne contient un espace', () => {
      expect(isBase58String('1A1z P1e')).toBe(false);
    });

    test('retourne false pour une adresse Ethereum (contient 0x et chiffres hex)', () => {
      expect(isBase58String('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5')).toBe(false);
    });
  });

  // ==========================================================================
  // hexToB58 / b58ToHex
  // ==========================================================================

  describe('hexToB58', () => {

    test('retourne une chaîne non vide pour un hex valide', () => {
      expect(hexToB58('deadbeef')).toBeTruthy();
    });

    test('retourne une chaîne Base58 valide (tous les chars dans B58_ALPHABET)', () => {
      const result = hexToB58('deadbeef');
      for (const c of result) {
        expect(B58_ALPHABET).toContain(c);
      }
    });

    test('est déterministe', () => {
      const hex = '0014b4fa76fa62dc01af0d6a5a3cf7ad1f9e6b7f0e6b';
      expect(hexToB58(hex)).toBe(hexToB58(hex));
    });

    test('produit des résultats différents pour des hex différents', () => {
      expect(hexToB58('deadbeef')).not.toBe(hexToB58('cafebabe'));
    });
  });

  describe('b58ToHex', () => {

    test('retourne une chaîne hex valide', () => {
      const b58 = hexToB58('deadbeef');
      const result = b58ToHex(b58);
      expect(result).toMatch(/^[0-9a-f]+$/);
    });

    test('retourne une chaîne hex (lowercase)', () => {
      const b58 = hexToB58('deadbeef');
      expect(b58ToHex(b58)).toBe(b58ToHex(b58).toLowerCase());
    });
  });

  describe('hexToB58 / b58ToHex round-trip', () => {

    test('hex → b58 → hex retourne le hex original (sans zéros de tête)', () => {
      // bs58 supprime les zéros de tête en hex, donc on utilise un hex sans ff..
      const hex = 'deadbeef';
      const b58 = hexToB58(hex);
      expect(b58ToHex(b58)).toBe(hex);
    });

    test('round-trip pour un hash 20 bytes (RIPEMD-160)', () => {
      const hex = 'ab'.repeat(20); // 40 chars hex
      const b58 = hexToB58(hex);
      expect(b58ToHex(b58)).toBe(hex);
    });

    test('round-trip pour un hash 32 bytes (SHA-256)', () => {
      const hex = 'cd'.repeat(32); // 64 chars hex
      const b58 = hexToB58(hex);
      expect(b58ToHex(b58)).toBe(hex);
    });

    test('est déterministe à travers le round-trip', () => {
      const hex = 'aabbccdd11223344';
      expect(b58ToHex(hexToB58(hex))).toBe(b58ToHex(hexToB58(hex)));
    });
  });
});
