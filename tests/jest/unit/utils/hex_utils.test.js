/**
 * ============================================================================
 * Unit Tests - Hex Utilities
 * ============================================================================
 * Example unit test for hex utility functions
 * ============================================================================
 */

describe('Hex Utilities - Example Tests', () => {
  
  describe('Basic hex validation', () => {
    
    test('validates hex strings correctly', () => {
      const validHex = '0123456789abcdef';
      expect(validHex).toMatch(/^[0-9a-fA-F]+$/);
    });

    test('rejects non-hex strings', () => {
      const invalidHex = 'xyz123';
      expect(invalidHex).not.toMatch(/^[0-9a-fA-F]+$/);
    });

    test('validates hex string length', () => {
      const hex64 = '0'.repeat(64);
      expect(hex64.length).toBe(64);
      expect(hex64).toBeValidHash(64);
    });
  });

  describe('Custom matchers', () => {
    
    test('toBeValidHash matcher works', () => {
      expect('deadbeef').toBeValidHash();
      expect('00112233445566778899aabbccddeeff').toBeValidHash();
    });

    test('toBeValidHash with length parameter', () => {
      const entropy256 = '0'.repeat(64);
      expect(entropy256).toBeValidHash(64);
    });
  });

  describe('Entropy validation', () => {
    
    test('validates 128-bit entropy (32 hex chars)', () => {
      const entropy128 = CRYPTO_CONFIG.TEST_ENTROPY_128;
      expect(entropy128).toBeValidHash(32);
    });

    test('validates 256-bit entropy (64 hex chars)', () => {
      const entropy256 = CRYPTO_CONFIG.TEST_ENTROPY_256;
      expect(entropy256).toBeValidHash(64);
    });
  });
});
