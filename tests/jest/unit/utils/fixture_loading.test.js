/**
 * ============================================================================
 * Unit Tests - Fixture Loading Example
 * ============================================================================
 * Demonstrates how to use fixtures in tests
 * ============================================================================
 */

describe('Fixture Loading Examples', () => {
  
  test('can load input fixture', () => {
    const fixture = loadFixture('bitcoin-wallet-input.json');
    
    expect(fixture).toBeDefined();
    expect(fixture.coin).toBe('bitcoin');
    expect(fixture.entropy).toBeValidHash(64);
  });

  test('fixture contains expected properties', () => {
    const fixture = loadFixture('bitcoin-wallet-input.json');
    
    expect(fixture).toHaveProperty('coin');
    expect(fixture).toHaveProperty('network');
    expect(fixture).toHaveProperty('entropy');
    expect(fixture).toHaveProperty('mnemonic');
  });

  test('fixture entropy matches expected length', () => {
    const fixture = loadFixture('bitcoin-wallet-input.json');
    
    // 256-bit entropy = 64 hex characters
    expect(fixture.entropy.length).toBe(64);
    expect(fixture.entropy).toBeValidHash(64);
  });

  test('fixture mnemonic is valid', () => {
    const fixture = loadFixture('bitcoin-wallet-input.json');
    
    expect(fixture.mnemonic).toBeValidMnemonic();
  });
});

describe('Test Paths and Configuration', () => {
  
  test('TEST_PATHS are correctly configured', () => {
    // Use path separators that work on both Windows and Unix
    expect(TEST_PATHS.fixtures).toMatch(/tests[\\/]jest[\\/]fixtures/);
    expect(TEST_PATHS.inputs).toMatch(/fixtures[\\/]inputs/);
    expect(TEST_PATHS.expected).toMatch(/fixtures[\\/]expected/);
  });

  test('CRYPTO_CONFIG contains supported coins', () => {
    expect(CRYPTO_CONFIG.SUPPORTED_COINS).toContain('bitcoin');
    expect(CRYPTO_CONFIG.SUPPORTED_COINS).toContain('ethereum');
    expect(CRYPTO_CONFIG.SUPPORTED_COINS).toContain('litecoin');
  });

  test('CRYPTO_CONFIG contains BIP44 coin types', () => {
    expect(CRYPTO_CONFIG.BIP44_COIN_TYPES).toHaveProperty('bitcoin');
    expect(CRYPTO_CONFIG.BIP44_COIN_TYPES.bitcoin).toBe(0);
    expect(CRYPTO_CONFIG.BIP44_COIN_TYPES.ethereum).toBe(60);
  });
});
