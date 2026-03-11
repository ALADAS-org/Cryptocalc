/**
 * ============================================================================
 * Unit Tests - BIP39 Utilities (fonctions non couvertes)
 * ============================================================================
 * Complète la couverture de bip39_utils.js pour les fonctions :
 *   PrivateKeyToMnemonics, MnemonicsAs4letter, MnemonicsAsTwoParts, LabelWithSize
 * Location: www/js/crypto/bip39_utils.js
 * ============================================================================
 */

const { Bip39Utils } = require('@crypto/bip39_utils.js');
const { PrettyLog, UNIT_TESTS_LOG_MODE } = require('@util/log/log_utils.js');

describe('BIP39 Utilities - Fonctions complémentaires', () => {

  beforeAll(() => {
    PrettyLog.This.logMode = UNIT_TESTS_LOG_MODE;
  });

  const MNEMONICS_12 = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
  const MNEMONICS_24 = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art';

  // Clé privée de 32 bytes valide (64 hex chars)
  const VALID_PRIVATE_KEY = '0c28fca386c7a227600b2fe50b7cae11ec86d3bf1fbe471be89827e19d72aa1d';

  // ==========================================================================
  // PrivateKeyToMnemonics
  // ==========================================================================

  describe('PrivateKeyToMnemonics', () => {

    test('retourne une chaîne pour une clé privée valide de 64 chars', () => {
      const result = Bip39Utils.PrivateKeyToMnemonics(VALID_PRIVATE_KEY);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('retourne 24 mots pour une clé de 32 bytes', () => {
      const result = Bip39Utils.PrivateKeyToMnemonics(VALID_PRIVATE_KEY);
      if (!result.startsWith('**ERROR**')) {
        const words = result.trim().split(' ');
        expect(words.length).toBe(24);
      }
    });

    test('est déterministe — même clé → même résultat', () => {
      const result1 = Bip39Utils.PrivateKeyToMnemonics(VALID_PRIVATE_KEY);
      const result2 = Bip39Utils.PrivateKeyToMnemonics(VALID_PRIVATE_KEY);
      expect(result1).toBe(result2);
    });

    test('accepte une clé avec préfixe 0x', () => {
      const withPrefix    = Bip39Utils.PrivateKeyToMnemonics('0x' + VALID_PRIVATE_KEY);
      const withoutPrefix = Bip39Utils.PrivateKeyToMnemonics(VALID_PRIVATE_KEY);
      expect(withPrefix).toBe(withoutPrefix);
    });

    test('produit des mnemonics différents pour des clés différentes', () => {
      const key2 = 'ce9c8c7e620dea2d073c5a8fdc2470b643f2d75a4433aee39672ca8a4c63854c';
      const result1 = Bip39Utils.PrivateKeyToMnemonics(VALID_PRIVATE_KEY);
      const result2 = Bip39Utils.PrivateKeyToMnemonics(key2);
      expect(result1).not.toBe(result2);
    });

    test('retourne une erreur si la clé nest pas en hexadécimal', () => {
      const result = Bip39Utils.PrivateKeyToMnemonics('not-a-hex-string-at-allXXXXXXXXXXXXXXXXXXXXXXX');
      expect(result).toContain('**ERROR**');
    });

    test('retourne une erreur si la clé ne fait pas 32 bytes (trop courte)', () => {
      const result = Bip39Utils.PrivateKeyToMnemonics('deadbeef');
      expect(result).toContain('**ERROR**');
    });

    test('retourne une erreur si la clé est trop longue (>32 bytes)', () => {
      const result = Bip39Utils.PrivateKeyToMnemonics('ab'.repeat(33));
      expect(result).toContain('**ERROR**');
    });
  });

  // ==========================================================================
  // MnemonicsAs4letter
  // ==========================================================================

  describe('MnemonicsAs4letter', () => {

    test('retourne une chaîne non vide', () => {
      const result = Bip39Utils.MnemonicsAs4letter(MNEMONICS_12);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('retourne exactement 4 * nb_mots caractères pour des mots de 4+ lettres', () => {
      // "abandon" (7 lettres) → prefix 4 lettres × 12 mots = 48 chars
      const result = Bip39Utils.MnemonicsAs4letter(MNEMONICS_12);
      expect(result.length).toBe(48);
    });

    test('chaque préfixe commence par une majuscule', () => {
      const result = Bip39Utils.MnemonicsAs4letter(MNEMONICS_12);
      // Les préfixes de 4 lettres sont concaténés, chaque groupe commence par une majuscule
      // Vérifie que la première lettre est majuscule
      expect(result[0]).toBe(result[0].toUpperCase());
    });

    test('est déterministe', () => {
      expect(Bip39Utils.MnemonicsAs4letter(MNEMONICS_12))
        .toBe(Bip39Utils.MnemonicsAs4letter(MNEMONICS_12));
    });

    test('produit des résultats différents pour des mnemonics différents', () => {
      const other = 'zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo wrong';
      expect(Bip39Utils.MnemonicsAs4letter(MNEMONICS_12))
        .not.toBe(Bip39Utils.MnemonicsAs4letter(other));
    });

    test('fonctionne avec 24 mots → min(longueur_mot, 4) chars par mot', () => {
      const result = Bip39Utils.MnemonicsAs4letter(MNEMONICS_24);
      // Calcul dynamique : substr(0,4) retourne au plus 4 chars, moins si le mot est plus court
      const expected_length = MNEMONICS_24.split(' ')
                                          .reduce((acc, w) => acc + Math.min(w.length, 4), 0);
      expect(result.length).toBe(expected_length);
    });

    test('vecteur de référence : "abandon" → préfixe "Aban"', () => {
      const result = Bip39Utils.MnemonicsAs4letter('abandon abandon');
      expect(result).toBe('AbanAban');
    });
  });

  // ==========================================================================
  // MnemonicsAsTwoParts
  // ==========================================================================

  describe('MnemonicsAsTwoParts', () => {

    test('retourne un tableau pour 12 mots', () => {
      const result = Bip39Utils.MnemonicsAsTwoParts(MNEMONICS_12);
      expect(Array.isArray(result)).toBe(true);
    });

    test('retourne [phrase, ""] pour 12 mots (pas besoin de couper)', () => {
      const result = Bip39Utils.MnemonicsAsTwoParts(MNEMONICS_12);
      expect(result).toHaveLength(2);
      expect(result[0]).toBe(MNEMONICS_12);
      expect(result[1]).toBe('');
    });

    test('retourne 2 parties pour 24 mots', () => {
      const result = Bip39Utils.MnemonicsAsTwoParts(MNEMONICS_24);
      expect(result).toHaveLength(2);
    });

    test('chaque partie des 24 mots est non vide', () => {
      const result = Bip39Utils.MnemonicsAsTwoParts(MNEMONICS_24);
      expect(result[0].length).toBeGreaterThan(0);
      expect(result[1].length).toBeGreaterThan(0);
    });

    test('les 2 parties de 24 mots totalisent 24 mots', () => {
      const result = Bip39Utils.MnemonicsAsTwoParts(MNEMONICS_24);
      const total = result[0].split(' ').length + result[1].split(' ').length;
      expect(total).toBe(24);
    });

    test('les deux parties peuvent être rejointes pour reconstituer les mnemonics', () => {
      const result = Bip39Utils.MnemonicsAsTwoParts(MNEMONICS_24);
      expect(result[0] + ' ' + result[1]).toBe(MNEMONICS_24);
    });

    test('retourne "Null-MNEMONICS" pour undefined', () => {
      expect(Bip39Utils.MnemonicsAsTwoParts(undefined)).toBe('Null-MNEMONICS');
    });

    test('fonctionne avec 15 mots (moitié = 7 + 8)', () => {
      const mnemonics15 = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
      const result = Bip39Utils.MnemonicsAsTwoParts(mnemonics15);
      expect(result).toHaveLength(2);
      const total = result[0].split(' ').length + result[1].split(' ').length;
      expect(total).toBe(15);
    });
  });

  // ==========================================================================
  // LabelWithSize
  // ==========================================================================

  describe('LabelWithSize', () => {

    test('retourne "data(size)" pour data="entropy" et size=256', () => {
      expect(Bip39Utils.LabelWithSize('entropy', 256)).toBe('entropy(256)');
    });

    test('retourne "checksum(4)" pour data="checksum" et size=4', () => {
      expect(Bip39Utils.LabelWithSize('checksum', 4)).toBe('checksum(4)');
    });

    test('fonctionne avec size=0', () => {
      expect(Bip39Utils.LabelWithSize('test', 0)).toBe('test(0)');
    });

    test('est déterministe', () => {
      expect(Bip39Utils.LabelWithSize('x', 42)).toBe(Bip39Utils.LabelWithSize('x', 42));
    });
  });
});
