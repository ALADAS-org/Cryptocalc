/**
 * ============================================================================
 * Unit Tests - Wallet Address Validation
 * ============================================================================
 * Example unit tests for wallet address validation
 * ============================================================================
 */

// Import PrettyLog and log mode constant to disable console.log from production code
const { PrettyLog, UNIT_TESTS_LOG_MODE } = require('@util/log/log_utils.js');

describe('Wallet Address Validation', () => {
  
  beforeAll(() => {
    // Disable console.log from pretty_log() calls in production code
    PrettyLog.This.logMode = UNIT_TESTS_LOG_MODE;
  });
  
  describe('Bitcoin Address Validation', () => {
    
    test('validates legacy Bitcoin addresses (starts with 1)', () => {
      const legacyAddress = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
      expect(legacyAddress).toBeValidBitcoinAddress();
    });

    test('validates P2SH Bitcoin addresses (starts with 3)', () => {
      const p2shAddress = '3J98t1WpEZ73CNmYviecrnyiWrnqRhWNLy';
      expect(p2shAddress).toBeValidBitcoinAddress();
    });

    test('validates SegWit addresses (starts with bc1)', () => {
      const segwitAddress = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq';
      expect(segwitAddress).toBeValidBitcoinAddress();
    });

    test('rejects invalid Bitcoin addresses', () => {
      expect('invalid_address').not.toBeValidBitcoinAddress();
      expect('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb').not.toBeValidBitcoinAddress();
    });
  });

  describe('Ethereum Address Validation', () => {
    
    test('validates Ethereum addresses', () => {
      const ethAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5';
      expect(ethAddress).toBeValidEthereumAddress();
    });

    test('rejects invalid Ethereum addresses', () => {
      expect('invalid_eth_address').not.toBeValidEthereumAddress();
      expect('742d35Cc6634C0532925a3b844Bc9e7595f0bEb5').not.toBeValidEthereumAddress(); // Missing 0x
    });

    test('validates checksum addresses', () => {
      const checksumAddress = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed';
      expect(checksumAddress).toBeValidEthereumAddress();
    });
  });

  describe('WIF Private Key Validation', () => {
    
    test('validates uncompressed WIF (starts with 5)', () => {
      const uncompressedWIF = '5HueCGU8rMjxEXxiPuD5BDku4MkFqeZyd4dZ1jvhTVqvbTLvyTJ';
      expect(uncompressedWIF).toBeValidWIF();
    });

    test('validates compressed WIF (starts with K or L)', () => {
      const compressedWIF = 'KwdMAjGmerYanjeui5SHS7JkmpZvVipYvB2LJGU1ZxJwYvP98617';
      expect(compressedWIF).toBeValidWIF();
    });

    test('rejects invalid WIF', () => {
      expect('invalid_wif').not.toBeValidWIF();
      expect('1234567890').not.toBeValidWIF();
    });
  });

  describe('Mnemonic Phrase Validation', () => {
    
    test('validates 12-word mnemonic', () => {
      const mnemonic12 = CRYPTO_CONFIG.TEST_MNEMONIC_12;
      expect(mnemonic12).toBeValidMnemonic();
    });

    test('validates 24-word mnemonic', () => {
      const mnemonic24 = CRYPTO_CONFIG.TEST_MNEMONIC_24;
      expect(mnemonic24).toBeValidMnemonic();
    });

    test('rejects invalid mnemonic (wrong word count)', () => {
      expect('abandon abandon abandon').not.toBeValidMnemonic();
      expect('').not.toBeValidMnemonic();
    });
  });
});
