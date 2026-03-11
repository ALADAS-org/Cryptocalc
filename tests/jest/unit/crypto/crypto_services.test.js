/**
 * ============================================================================
 * Unit Tests - CryptoServices
 * ============================================================================
 * Tests the CryptoServices singleton
 * Location: www/js/crypto/crypto_services.js
 * ============================================================================
 */

const { CryptoServices } = require('@crypto/crypto_services.js');

// UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// WIF non-compressé commence par '5', compressé par 'K' ou 'L'
const WIF_UNCOMPRESSED_REGEX = /^5[1-9A-HJ-NP-Za-km-z]{50}$/;

describe('CryptoServices', () => {

  // ==========================================================================
  // Singleton
  // ==========================================================================

  describe('Singleton Pattern', () => {

    test('CryptoServices.This retourne une instance définie', () => {
      expect(CryptoServices.This).toBeDefined();
    });

    test('CryptoServices.This retourne toujours la même instance', () => {
      const instance1 = CryptoServices.This;
      const instance2 = CryptoServices.This;
      expect(instance1).toBe(instance2);
    });

    test("appel direct du constructeur lève une TypeError", () => {
      expect(() => new CryptoServices()).toThrow(TypeError);
    });

    test("l'instance expose getUUID", () => {
      expect(typeof CryptoServices.This.getUUID).toBe('function');
    });

    test("l'instance expose pk2WIF", () => {
      expect(typeof CryptoServices.This.pk2WIF).toBe('function');
    });
  });

  // ==========================================================================
  // getUUID
  // ==========================================================================

  describe('getUUID', () => {

    test('retourne une chaîne', () => {
      expect(typeof CryptoServices.This.getUUID()).toBe('string');
    });

    test('retourne un UUID v4 valide', () => {
      const uuid = CryptoServices.This.getUUID();
      expect(uuid).toMatch(UUID_V4_REGEX);
    });

    test('retourne un UUID non vide', () => {
      expect(CryptoServices.This.getUUID().length).toBeGreaterThan(0);
    });

    test('retourne un UUID de longueur 36 (format xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)', () => {
      expect(CryptoServices.This.getUUID()).toHaveLength(36);
    });

    test('génère un UUID différent à chaque appel (statistique)', () => {
      const uuid1 = CryptoServices.This.getUUID();
      const uuid2 = CryptoServices.This.getUUID();
      expect(uuid1).not.toBe(uuid2);
    });

    test('génère des UUID au format v4 de manière répétée (10 fois)', () => {
      for (let i = 0; i < 10; i++) {
        expect(CryptoServices.This.getUUID()).toMatch(UUID_V4_REGEX);
      }
    });
  });

  // ==========================================================================
  // pk2WIF
  // ==========================================================================

  describe('pk2WIF', () => {

    // Clé privée Bitcoin de test (32 bytes = 64 hex chars)
    const VALID_PRIVATE_KEY = '0c28fca386c7a227600b2fe50b7cae11ec86d3bf1fbe471be89827e19d72aa1d';

    test('retourne une chaîne non vide', () => {
      const result = CryptoServices.This.pk2WIF(VALID_PRIVATE_KEY);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('retourne un WIF non-compressé commençant par "5"', () => {
      const result = CryptoServices.This.pk2WIF(VALID_PRIVATE_KEY);
      expect(result[0]).toBe('5');
    });

    test('retourne un WIF de longueur ~51 (non-compressé)', () => {
      const result = CryptoServices.This.pk2WIF(VALID_PRIVATE_KEY);
      expect(result.length).toBeGreaterThanOrEqual(51);
      expect(result.length).toBeLessThanOrEqual(52);
    });

    test('accepte une clé avec préfixe 0x', () => {
      const result = CryptoServices.This.pk2WIF('0x' + VALID_PRIVATE_KEY);
      expect(result[0]).toBe('5');
    });

    test('est déterministe — même clé → même WIF', () => {
      const wif1 = CryptoServices.This.pk2WIF(VALID_PRIVATE_KEY);
      const wif2 = CryptoServices.This.pk2WIF(VALID_PRIVATE_KEY);
      expect(wif1).toBe(wif2);
    });

    test('produit des WIF différents pour des clés différentes', () => {
      const key2 = 'ce9c8c7e620dea2d073c5a8fdc2470b643f2d75a4433aee39672ca8a4c63854c';
      const wif1 = CryptoServices.This.pk2WIF(VALID_PRIVATE_KEY);
      const wif2 = CryptoServices.This.pk2WIF(key2);
      expect(wif1).not.toBe(wif2);
    });

    test('vecteur de référence : clé connue → WIF attendu', () => {
      // Source : https://en.bitcoin.it/wiki/Wallet_import_format
      const knownKey = '0c28fca386c7a227600b2fe50b7cae11ec86d3bf1fbe471be89827e19d72aa1d';
      const result = CryptoServices.This.pk2WIF(knownKey);
      // WIF non-compressé attendu pour cette clé
      expect(result).toBe('5HueCGU8rMjxEXxiPuD5BDku4MkFqeZyd4dZ1jvhTVqvbTLvyTJ');
    });
  });
});
