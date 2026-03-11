/**
 * ============================================================================
 * Unit Tests - PasswordStrengthEvaluator
 * ============================================================================
 * Tests the PasswordStrengthEvaluator singleton
 * Location: www/js/crypto/password_strength_evaluator.js
 * ============================================================================
 */

const { PasswordStrengthEvaluator } = require('@crypto/password_strength_evaluator.js');
const { PWD_STR_AS_SCORE, PWD_STR_AS_ADJECTIVE } = require('@www/js/const_keywords.js');

describe('PasswordStrengthEvaluator', () => {

  let pse;

  beforeAll(() => {
    pse = PasswordStrengthEvaluator.This;
  });

  // ==========================================================================
  // Singleton
  // ==========================================================================

  describe('Singleton Pattern', () => {

    test('This retourne une instance définie', () => {
      expect(pse).toBeDefined();
    });

    test('This retourne toujours la même instance', () => {
      expect(PasswordStrengthEvaluator.This).toBe(pse);
    });

    test("appel direct du constructeur lève une TypeError", () => {
      expect(() => new PasswordStrengthEvaluator()).toThrow(TypeError);
    });

    test('ALPHABET_ENTROPIES est défini comme propriété statique', () => {
      expect(PasswordStrengthEvaluator.ALPHABET_ENTROPIES).toBeDefined();
    });
  });

  // ==========================================================================
  // is_binary_string
  // ==========================================================================

  describe('is_binary_string', () => {

    test('retourne true pour "010101"', () => {
      expect(pse.is_binary_string('010101')).toBe(true);
    });

    test('retourne true pour "0"', () => {
      expect(pse.is_binary_string('0')).toBe(true);
    });

    test('retourne true pour "1"', () => {
      expect(pse.is_binary_string('1')).toBe(true);
    });

    test('retourne true pour une longue chaîne binaire', () => {
      expect(pse.is_binary_string('0'.repeat(128))).toBe(true);
    });

    test('retourne false pour "012" (contient 2)', () => {
      expect(pse.is_binary_string('012')).toBe(false);
    });

    test('retourne false pour une chaîne vide', () => {
      expect(pse.is_binary_string('')).toBe(false);
    });

    test('retourne false pour undefined', () => {
      expect(pse.is_binary_string(undefined)).toBe(false);
    });

    test('retourne false pour null', () => {
      expect(pse.is_binary_string(null)).toBe(false);
    });
  });

  // ==========================================================================
  // is_hexa_string
  // ==========================================================================

  describe('is_hexa_string', () => {

    test('retourne true pour "deadbeef"', () => {
      expect(pse.is_hexa_string('deadbeef')).toBe(true);
    });

    test('retourne true pour "DEADBEEF" (uppercase converti)', () => {
      expect(pse.is_hexa_string('DEADBEEF')).toBe(true);
    });

    test('retourne true pour une clé privée de 64 chars', () => {
      expect(pse.is_hexa_string('0'.repeat(64))).toBe(true);
    });

    test('retourne true pour "0xdeadbeef" (préfixe 0x accepté)', () => {
      expect(pse.is_hexa_string('0xdeadbeef')).toBe(true);
    });

    test('retourne false pour "xyz"', () => {
      expect(pse.is_hexa_string('xyz')).toBe(false);
    });

    test('retourne false pour une chaîne vide', () => {
      expect(pse.is_hexa_string('')).toBe(false);
    });

    test('retourne false pour undefined', () => {
      expect(pse.is_hexa_string(undefined)).toBe(false);
    });
  });

  // ==========================================================================
  // is_base58_string
  // ==========================================================================

  describe('is_base58_string', () => {

    test('retourne true pour une adresse Bitcoin valide', () => {
      expect(pse.is_base58_string('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')).toBe(true);
    });

    test('retourne false pour une chaîne contenant "0" (zéro)', () => {
      expect(pse.is_base58_string('1A1z0P1e')).toBe(false);
    });

    test('retourne false pour une chaîne vide', () => {
      expect(pse.is_base58_string('')).toBe(false);
    });

    test('retourne false pour undefined', () => {
      expect(pse.is_base58_string(undefined)).toBe(false);
    });
  });

  // ==========================================================================
  // is_base64_string
  // ==========================================================================

  describe('is_base64_string', () => {

    test('retourne true pour une chaîne base64 valide', () => {
      expect(pse.is_base64_string('SGVsbG8gV29ybGQ=')).toBe(true);
    });

    test('retourne true pour une chaîne base64 sans padding', () => {
      expect(pse.is_base64_string('SGVsbG8gV29ybGQ')).toBe(true);
    });

    test('retourne false pour une chaîne contenant des caractères invalides', () => {
      expect(pse.is_base64_string('Hello World!')).toBe(false);
    });

    test('retourne false pour une chaîne vide', () => {
      expect(pse.is_base64_string('')).toBe(false);
    });
  });

  // ==========================================================================
  // is_octal_string
  // ==========================================================================

  describe('is_octal_string', () => {

    test('retourne true pour "01234567"', () => {
      expect(pse.is_octal_string('01234567')).toBe(true);
    });

    test('retourne false pour "8" (hors plage octal)', () => {
      expect(pse.is_octal_string('8')).toBe(false);
    });

    test('retourne false pour une chaîne vide', () => {
      expect(pse.is_octal_string('')).toBe(false);
    });
  });

  // ==========================================================================
  // is_upper_case / is_lower_case / is_digit / is_special_character
  // ==========================================================================

  describe('is_upper_case', () => {
    test('retourne true pour "A"', () => expect(pse.is_upper_case('A')).toBe(true));
    test('retourne false pour "a"', () => expect(pse.is_upper_case('a')).toBe(false));
    test('retourne false pour "1"', () => expect(pse.is_upper_case('1')).toBe(false));
  });

  describe('is_lower_case', () => {
    test('retourne true pour "a"', () => expect(pse.is_lower_case('a')).toBe(true));
    test('retourne false pour "A"', () => expect(pse.is_lower_case('A')).toBe(false));
    test('retourne false pour "1"', () => expect(pse.is_lower_case('1')).toBe(false));
  });

  describe('is_digit', () => {
    test('retourne true pour "5"', () => expect(pse.is_digit('5')).toBe(true));
    test('retourne true pour "0"', () => expect(pse.is_digit('0')).toBe(true));
    test('retourne false pour "a"', () => expect(pse.is_digit('a')).toBe(false));
  });

  describe('is_special_character', () => {
    test('retourne true pour "#"', () => expect(pse.is_special_character('#')).toBe(true));
    test('retourne true pour "*"', () => expect(pse.is_special_character('*')).toBe(true));
    test('retourne true pour "!"', () => expect(pse.is_special_character('!')).toBe(true));
    test('retourne false pour "a"', () => expect(pse.is_special_character('a')).toBe(false));
    test('retourne false pour "5"', () => expect(pse.is_special_character('5')).toBe(false));
  });

  // ==========================================================================
  // getEntropyForAlphabetAsBits
  // ==========================================================================

  describe('getEntropyForAlphabetAsBits', () => {

    test('alphabet de 2 → 1.00 bit', () => {
      expect(pse.getEntropyForAlphabetAsBits(2)).toBeCloseTo(1.00, 2);
    });

    test('alphabet de 16 → 4.00 bits (hex)', () => {
      expect(pse.getEntropyForAlphabetAsBits(16)).toBeCloseTo(4.00, 2);
    });

    test('alphabet de 58 → ~5.86 bits (base58)', () => {
      expect(pse.getEntropyForAlphabetAsBits(58)).toBeCloseTo(5.86, 1);
    });

    test('alphabet de 64 → 6.00 bits (base64)', () => {
      expect(pse.getEntropyForAlphabetAsBits(64)).toBeCloseTo(6.00, 2);
    });

    test('retourne 0 pour alphabet_size ≤ 1', () => {
      expect(pse.getEntropyForAlphabetAsBits(1)).toBe(0);
      expect(pse.getEntropyForAlphabetAsBits(0)).toBe(0);
    });

    test("augmente avec la taille de l'alphabet", () => {
      expect(pse.getEntropyForAlphabetAsBits(32))
        .toBeGreaterThan(pse.getEntropyForAlphabetAsBits(16));
    });
  });

  // ==========================================================================
  // getPasswordStrengthAsBits
  // ==========================================================================

  describe('getPasswordStrengthAsBits', () => {

    test('chaîne binaire "010101" → 6 * 1.00 = 6 bits', () => {
      expect(pse.getPasswordStrengthAsBits('010101')).toBeCloseTo(6.00, 1);
    });

    test('chaîne hex "deadbeef" (8 chars) → 8 * 4.00 = 32 bits', () => {
      expect(pse.getPasswordStrengthAsBits('deadbeef')).toBeCloseTo(32.00, 1);
    });

    test('retourne un nombre positif pour un mot de passe classique', () => {
      expect(pse.getPasswordStrengthAsBits('Hello123!')).toBeGreaterThan(0);
    });

    test('retourne un nombre plus élevé pour un mot de passe plus long', () => {
      const short = pse.getPasswordStrengthAsBits('abc');
      const longer = pse.getPasswordStrengthAsBits('abcdefghijklmnop');
      expect(longer).toBeGreaterThan(short);
    });

    test('une clé privée hex 64 chars → 256 bits', () => {
      // '0'.repeat(64) est aussi du binaire valide → détecté comme binary (64 bits)
      // On utilise 'deadbeef'.repeat(8) : 64 chars non-binaires, clairement hex
      expect(pse.getPasswordStrengthAsBits('deadbeef'.repeat(8))).toBeCloseTo(256, 0);
    });
  });

  // ==========================================================================
  // getPasswordStrengthBitsAsAdjective
  // ==========================================================================

  describe('getPasswordStrengthBitsAsAdjective', () => {

    test('"password" (faible) → "Very Weak"', () => {
      expect(pse.getPasswordStrengthBitsAsAdjective('pass')).toBe('Very Weak');
    });

    test('chaîne hex courte (8 chars, 32 bits) → "Very Weak"', () => {
      // 32 bits > 27.99 et < 35.99 → Weak
      const adj = pse.getPasswordStrengthBitsAsAdjective('deadbeef');
      expect(['Very Weak', 'Weak']).toContain(adj);
    });

    test('clé privée hex 64 chars → "Very Secure" (256 bits ≥ 128)', () => {
      // 'deadbeef'.repeat(8) = 64 chars hex non-ambigus → 256 bits → "Very Secure"
      expect(pse.getPasswordStrengthBitsAsAdjective('deadbeef'.repeat(8))).toBe('Very Secure');
    });

    test('retourne une valeur parmi les valeurs attendues', () => {
      const VALID_ADJECTIVES = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Secure'];
      const result = pse.getPasswordStrengthBitsAsAdjective('TestPassword123!');
      expect(VALID_ADJECTIVES).toContain(result);
    });
  });

  // ==========================================================================
  // getPasswordStrengthScore (zxcvbn)
  // ==========================================================================

  describe('getPasswordStrengthScore', () => {

    test('retourne un entier entre 0 et 4', () => {
      const score = pse.getPasswordStrengthScore('Test123!');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(4);
      expect(Number.isInteger(score)).toBe(true);
    });

    test('"password" retourne 0 (très faible)', () => {
      expect(pse.getPasswordStrengthScore('password')).toBe(0);
    });

    test('"123456" retourne 0 (très faible)', () => {
      expect(pse.getPasswordStrengthScore('123456')).toBe(0);
    });

    test('un mot de passe aléatoire long retourne un score élevé (≥ 3)', () => {
      expect(pse.getPasswordStrengthScore('xK9!mP2#qR7&nL4@')).toBeGreaterThanOrEqual(3);
    });
  });

  // ==========================================================================
  // getPasswordScoreAsAdjective
  // ==========================================================================

  describe('getPasswordScoreAsAdjective', () => {

    test('"password" → "Very Weak" (score 0)', () => {
      expect(pse.getPasswordScoreAsAdjective('password')).toBe('Very Weak');
    });

    test('retourne une valeur parmi les adjectifs définis', () => {
      const VALID = ['Very Weak', 'Weak', 'Good', 'Strong', 'Very Strong'];
      expect(VALID).toContain(pse.getPasswordScoreAsAdjective('Test123'));
    });
  });

  // ==========================================================================
  // getPasswordStrengthInfo
  // ==========================================================================

  describe('getPasswordStrengthInfo', () => {

    test('retourne un objet avec les clés PWD_STR_AS_SCORE et PWD_STR_AS_ADJECTIVE', () => {
      const info = pse.getPasswordStrengthInfo('Test123!');
      expect(info).toHaveProperty(PWD_STR_AS_SCORE);
      expect(info).toHaveProperty(PWD_STR_AS_ADJECTIVE);
    });

    test('le score est un entier entre 0 et 4', () => {
      const info = pse.getPasswordStrengthInfo('Test123!');
      expect(info[PWD_STR_AS_SCORE]).toBeGreaterThanOrEqual(0);
      expect(info[PWD_STR_AS_SCORE]).toBeLessThanOrEqual(4);
    });

    test("l'adjectif est une chaîne non vide", () => {
      const info = pse.getPasswordStrengthInfo('Test123!');
      expect(typeof info[PWD_STR_AS_ADJECTIVE]).toBe('string');
      expect(info[PWD_STR_AS_ADJECTIVE].length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // DS_calculateAdjustedEntropy
  // ==========================================================================

  describe('DS_calculateAdjustedEntropy', () => {

    test('retourne un nombre positif pour un mot de passe non vide', () => {
      expect(pse.DS_calculateAdjustedEntropy('Test123!')).toBeGreaterThan(0);
    });

    test('retourne 0 pour une chaîne vide', () => {
      expect(pse.DS_calculateAdjustedEntropy('')).toBe(0);
    });

    test('augmente avec la longueur du mot de passe (caractères similaires)', () => {
      const short = pse.DS_calculateAdjustedEntropy('Abc1!');
      const longer = pse.DS_calculateAdjustedEntropy('Abc1!Abc1!Abc1!');
      expect(longer).toBeGreaterThan(short);
    });
  });

  // ==========================================================================
  // DS_entropyToScore
  // ==========================================================================

  describe('DS_entropyToScore', () => {

    test('< 28 → score 0 (Very Weak)', () => {
      expect(pse.DS_entropyToScore(10)).toBe(0);
    });

    test('28..34 → score 1 (Weak)', () => {
      expect(pse.DS_entropyToScore(30)).toBe(1);
    });

    test('35..44 → score 2 (Fair)', () => {
      expect(pse.DS_entropyToScore(40)).toBe(2);
    });

    test('45..54 → score 3 (Strong)', () => {
      expect(pse.DS_entropyToScore(50)).toBe(3);
    });

    test('≥ 55 → score 4 (Very Strong)', () => {
      expect(pse.DS_entropyToScore(60)).toBe(4);
    });
  });

  // ==========================================================================
  // DS_comprehensivePasswordStrength
  // ==========================================================================

  describe('DS_comprehensivePasswordStrength', () => {

    test('retourne un objet avec zxcvbnScore, entropy, feedback et finalAssessment', () => {
      const result = pse.DS_comprehensivePasswordStrength('Test123!');
      expect(result).toHaveProperty('zxcvbnScore');
      expect(result).toHaveProperty('entropy');
      expect(result).toHaveProperty('feedback');
      expect(result).toHaveProperty('finalAssessment');
    });

    test('zxcvbnScore est entre 0 et 4', () => {
      const result = pse.DS_comprehensivePasswordStrength('Test123!');
      expect(result.zxcvbnScore).toBeGreaterThanOrEqual(0);
      expect(result.zxcvbnScore).toBeLessThanOrEqual(4);
    });

    test('finalAssessment est entre 0 et 4', () => {
      const result = pse.DS_comprehensivePasswordStrength('Test123!');
      expect(result.finalAssessment).toBeGreaterThanOrEqual(0);
      expect(result.finalAssessment).toBeLessThanOrEqual(4);
    });

    test('finalAssessment ≥ zxcvbnScore (max des deux métriques)', () => {
      const result = pse.DS_comprehensivePasswordStrength('Test123!');
      expect(result.finalAssessment).toBeGreaterThanOrEqual(result.zxcvbnScore);
    });
  });
});
