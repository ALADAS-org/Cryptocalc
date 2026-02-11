/**
 * ============================================================================
 * Global Jest Setup for Cryptocalc
 * ============================================================================
 * This file is executed before all tests
 * It configures the global test environment
 * ============================================================================
 */

const path = require('path');
const fs = require('fs');

// ==========================================================================
// ENVIRONMENT CONFIGURATION
// ==========================================================================

// Global timeout for all tests (milliseconds)
jest.setTimeout(10000);

// Environment variables
process.env.NODE_ENV = 'test';
process.env.TEST_MODE = 'true';
process.env.COVERAGE_DIR = path.join(__dirname, '../coverage/jest');

// ==========================================================================
// PATH CONFIGURATION
// ==========================================================================

global.TEST_PATHS = {
  root: path.join(__dirname, '../..'),
  fixtures: path.join(__dirname, 'fixtures'),
  inputs: path.join(__dirname, 'fixtures/inputs'),
  expected: path.join(__dirname, 'fixtures/expected'),
  www: path.join(__dirname, '../../www'),
  crypto: path.join(__dirname, '../../www/js/crypto'),
  api: path.join(__dirname, '../../www/js/api'),
  util: path.join(__dirname, '../../www/js/util')
};

// ==========================================================================
// GLOBAL MOCKS (OPTIONAL)
// ==========================================================================

// Uncomment to suppress certain logs during tests
/*
global.console = {
  ...console,
  log: jest.fn(),      // Mock console.log
  debug: jest.fn(),    // Mock console.debug
  info: console.info,  // Keep console.info
  warn: console.warn,  // Keep console.warn
  error: console.error // Keep console.error
};
*/

// ==========================================================================
// GLOBAL HELPERS
// ==========================================================================

/**
 * Helper to load a JSON fixture file
 * @param {string} filename - File name in fixtures/inputs/
 * @returns {Object} Parsed JSON content
 */
global.loadFixture = (filename) => {
  const fixturePath = path.join(global.TEST_PATHS.inputs, filename);
  
  if (!fs.existsSync(fixturePath)) {
    throw new Error(`Fixture not found: ${fixturePath}`);
  }
  
  const content = fs.readFileSync(fixturePath, 'utf8');
  return JSON.parse(content);
};

/**
 * Helper to load an expected output JSON file
 * @param {string} filename - File name in fixtures/expected/
 * @returns {Object} Parsed JSON content
 */
global.loadExpected = (filename) => {
  const expectedPath = path.join(global.TEST_PATHS.expected, filename);
  
  if (!fs.existsSync(expectedPath)) {
    throw new Error(`Expected output not found: ${expectedPath}`);
  }
  
  const content = fs.readFileSync(expectedPath, 'utf8');
  return JSON.parse(content);
};

/**
 * Helper to save a fixture (useful for generating expected outputs)
 * @param {string} filename - File name
 * @param {Object} data - Data to save
 * @param {string} type - 'input' or 'expected'
 */
global.saveFixture = (filename, data, type = 'input') => {
  const dir = type === 'input' ? global.TEST_PATHS.inputs : global.TEST_PATHS.expected;
  const filePath = path.join(dir, filename);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

// ==========================================================================
// CUSTOM MATCHERS
// ==========================================================================

expect.extend({
  
  /**
   * Verify that a value is a valid hash (hex string)
   * @param {string} received - Value to test
   * @param {number} length - Expected length (optional)
   */
  toBeValidHash(received, length = null) {
    const isString = typeof received === 'string';
    const isHex = /^[0-9a-fA-F]+$/.test(received);
    const hasCorrectLength = length ? received.length === length : true;
    
    const pass = isString && isHex && hasCorrectLength;
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid hash`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid hash${length ? ` of length ${length}` : ''}`,
        pass: false
      };
    }
  },
  
  /**
   * Verify that an address is a valid Bitcoin address
   * @param {string} received - Address to test
   */
  toBeValidBitcoinAddress(received) {
    // Legacy addresses (1... or 3...)
    const isLegacy = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(received);
    // SegWit addresses (bc1...)
    const isSegWit = /^bc1[a-z0-9]{39,87}$/.test(received);
    // Testnet addresses (m... or n... or tb1...)
    const isTestnet = /^[mn][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(received) || 
                      /^tb1[a-z0-9]{39,87}$/.test(received);
    
    const isValid = isLegacy || isSegWit || isTestnet;
    
    if (isValid) {
      return {
        message: () => `expected ${received} not to be a valid Bitcoin address`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid Bitcoin address`,
        pass: false
      };
    }
  },
  
  /**
   * Verify that a WIF private key is valid
   * @param {string} received - WIF to test
   */
  toBeValidWIF(received) {
    // WIF uncompressed (5...) or compressed (K... or L...)
    const isValid = /^[5KL][1-9A-HJ-NP-Za-km-z]{50,51}$/.test(received);
    
    if (isValid) {
      return {
        message: () => `expected ${received} not to be a valid WIF`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid WIF`,
        pass: false
      };
    }
  },
  
  /**
   * Verify that an Ethereum address is valid
   * @param {string} received - Address to test
   */
  toBeValidEthereumAddress(received) {
    const isValid = /^0x[0-9a-fA-F]{40}$/.test(received);
    
    if (isValid) {
      return {
        message: () => `expected ${received} not to be a valid Ethereum address`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid Ethereum address`,
        pass: false
      };
    }
  },
  
  /**
   * Verify that a mnemonic phrase is valid
   * @param {string} received - Mnemonic phrase to test
   */
  toBeValidMnemonic(received) {
    if (!received || typeof received !== 'string') {
      return {
        message: () => `expected a valid mnemonic string, received ${received}`,
        pass: false
      };
    }
    
    const words = received.trim().split(/\s+/);
    const validLengths = [12, 15, 18, 21, 24];
    const isValidLength = validLengths.includes(words.length);
    const allWordsValid = words.every(word => word.length > 0);
    
    const isValid = isValidLength && allWordsValid;
    
    if (isValid) {
      return {
        message: () => `expected ${received} not to be a valid mnemonic`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid mnemonic (12/15/18/21/24 words)`,
        pass: false
      };
    }
  }
});

// ==========================================================================
// GLOBAL HOOKS
// ==========================================================================

beforeAll(() => {
  console.log('\n' + '='.repeat(80));
  console.log('🚀 Starting Jest tests for Cryptocalc');
  console.log('='.repeat(80) + '\n');
});

afterAll(() => {
  console.log('\n' + '='.repeat(80));
  console.log('✅ Jest tests completed');
  console.log('='.repeat(80) + '\n');
});

// ==========================================================================
// CRYPTO CONFIGURATION - Test Constants
// ==========================================================================

global.CRYPTO_CONFIG = {
  
  // Test entropies (hex strings)
  TEST_ENTROPY_128: '00112233445566778899aabbccddeeff',
  TEST_ENTROPY_256: '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff',
  
  // BIP39 test mnemonics
  TEST_MNEMONIC_12: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
  TEST_MNEMONIC_24: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art',
  
  // Test passphrases
  TEST_PASSPHRASE: 'TREZOR',
  TEST_PASSPHRASE_EMPTY: '',
  
  // Test seeds (hex)
  TEST_SEED_12: '5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4',
  TEST_SEED_24: 'bda85446c68413707090a52022edd26a1c9462295029f2e60cd7c4f2bbd3097170af7a4d73245cafa9c3cca8d561a7c3de6f5d4a10be8ed2a5e608d68f92fcc8',
  
  // Supported coins
  SUPPORTED_COINS: [
    'bitcoin', 
    'ethereum', 
    'litecoin', 
    'dogecoin', 
    'solana', 
    'avalanche', 
    'polygon', 
    'toncoin', 
    'terra'
  ],
  
  // BIP44 coin types
  BIP44_COIN_TYPES: {
    bitcoin: 0,
    ethereum: 60,
    litecoin: 2,
    dogecoin: 3,
    solana: 501,
    avalanche: 9000,
    polygon: 60,
    toncoin: 607,
    terra: 330
  },
  
  // Supported entropy sizes
  ENTROPY_SIZES: [128, 160, 192, 224, 256],
  
  // Wallet types
  WALLET_TYPES: ['SIMPLE_WALLET', 'HD_WALLET']
};

// ==========================================================================
// API CONFIGURATION - For integration tests
// ==========================================================================

global.API_CONFIG = {
  BASE_URL: 'http://localhost:3000',
  TIMEOUT: 5000,
  ENDPOINTS: {
    SIMPLE_WALLET: '/api/wallet/:coin/json',
    HD_WALLET: '/api/hdwallet/:coin/json'
  }
};

// ==========================================================================
// DEBUG INFORMATION
// ==========================================================================

console.log('📋 Jest setup loaded from tests/jest/setup.js');
console.log(`📁 Fixtures directory: ${global.TEST_PATHS.fixtures}`);
console.log(`📁 Coverage directory: ${process.env.COVERAGE_DIR}`);
console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
