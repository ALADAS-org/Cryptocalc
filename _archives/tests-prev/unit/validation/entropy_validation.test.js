// tests/unit/validation/entropy_validation.test.js
// Tests PURS de validation - aucune dépendance

class EntropyValidator {
  static isValidHex(input) {
    return typeof input === 'string' && /^[0-9a-fA-F]+$/.test(input);
  }
  
  static isValidEntropyLength(hexString) {
    if (!this.isValidHex(hexString)) return false;
    
    const validLengths = {
      32: 128,  // 128 bits
      40: 160,  // 160 bits
      48: 192,  // 192 bits
      56: 224,  // 224 bits
      64: 256   // 256 bits
    };
    
    return hexString.length in validLengths;
  }
  
  static getEntropyBits(hexString) {
    if (!this.isValidHex(hexString)) return 0;
    return hexString.length * 4; // 1 char hex = 4 bits
  }
  
  static getWordCount(hexString) {
    const bits = this.getEntropyBits(hexString);
    // BIP39: bits ÷ 32 × 3
    return Math.floor(bits / 32) * 3;
  }
}

describe('Entropy Validation - Tests avancés', () => {
  describe('Validation hexadécimale', () => {
    const testCases = [
      { input: '123abc', expected: true, description: 'hex simple' },
      { input: 'ABCDEF', expected: true, description: 'hex majuscules' },
      { input: '1234567890abcdef', expected: true, description: 'hex complet' },
      { input: '', expected: false, description: 'chaîne vide' },
      { input: '123xyz', expected: false, description: 'caractères non-hex' },
      { input: '0x123abc', expected: false, description: 'préfixe 0x' },
      { input: null, expected: false, description: 'null' },
      { input: undefined, expected: false, description: 'undefined' },
      { input: 123456, expected: false, description: 'nombre' }
    ];
    
    testCases.forEach(({ input, expected, description }) => {
      test(`${description} (${input})`, () => {
        expect(EntropyValidator.isValidHex(input)).toBe(expected);
      });
    });
  });
  
  describe('Validation longueur entropie', () => {
    const validLengths = [
      { hex: 'a'.repeat(32), bits: 128, words: 12, description: '128 bits' },
      { hex: 'b'.repeat(40), bits: 160, words: 15, description: '160 bits' },
      { hex: 'c'.repeat(48), bits: 192, words: 18, description: '192 bits' },
      { hex: 'd'.repeat(56), bits: 224, words: 21, description: '224 bits' },
      { hex: 'e'.repeat(64), bits: 256, words: 24, description: '256 bits' }
    ];
    
    validLengths.forEach(({ hex, bits, words, description }) => {
      test(`Accepte ${description}`, () => {
        expect(EntropyValidator.isValidEntropyLength(hex)).toBe(true);
        expect(EntropyValidator.getEntropyBits(hex)).toBe(bits);
        expect(EntropyValidator.getWordCount(hex)).toBe(words);
      });
    });
    
    const invalidLengths = [
      { hex: 'f'.repeat(16), description: '64 bits (trop court)' },
      { hex: 'f'.repeat(80), description: '320 bits (trop long)' },
      { hex: 'f'.repeat(31), description: '124 bits (non standard)' }
    ];
    
    invalidLengths.forEach(({ hex, description }) => {
      test(`Rejette ${description}`, () => {
        expect(EntropyValidator.isValidEntropyLength(hex)).toBe(false);
      });
    });
  });
  
  describe('Calculs BIP39', () => {
    test('128 bits = 12 mots', () => {
      const hex128 = 'a'.repeat(32);
      expect(EntropyValidator.getWordCount(hex128)).toBe(12);
    });
    
    test('256 bits = 24 mots', () => {
      const hex256 = 'a'.repeat(64);
      expect(EntropyValidator.getWordCount(hex256)).toBe(24);
    });
    
    test('192 bits = 18 mots', () => {
      const hex192 = 'a'.repeat(48);
      expect(EntropyValidator.getWordCount(hex192)).toBe(18);
    });
  });
});