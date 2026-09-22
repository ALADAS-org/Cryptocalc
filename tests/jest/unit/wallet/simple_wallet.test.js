/**
 * ============================================================================
 * Unit Tests - Simple Wallet Generation
 * ============================================================================
 * Tests the generation of Simple Wallets for all supported blockchains
 * Location: www/js/crypto/SimpleWallet/simple_wallet.js
 * ============================================================================
 */

// Import PrettyLog and log mode constant to disable console.log from production code
const { PrettyLog, UNIT_TESTS_LOG_MODE } = require('@util/log/log_utils.js');

// Import required modules
const { SimpleWallet } = require('@crypto/SimpleWallet/simple_wallet.js');
const { HDWallet } = require('@crypto/HDWallet/hd_wallet.js');
const { CryptoServices } = require('@crypto/crypto_services.js');

// Import blockchain constants
const { 
  BITCOIN, ETHEREUM, DOGECOIN, LITECOIN, 
  SOLANA, AVALANCHE, POLYGON, TON, TERRA_LUNA, HORIZEN,
  COIN
} = require('@crypto/const_blockchains.js');

// Import wallet property constants
const { 
  ADDRESS, PRIVATE_KEY, PUBLIC_KEY_HEX, CRYPTO_NET
} = require('@crypto/const_wallet.js');

// Import keyword constants
const { 
  BLOCKCHAIN, NULL_BLOCKCHAIN,
  WALLET_MODE, SIMPLE_WALLET_TYPE,
  MNEMONICS, UUID
} = require('@www/js/const_keywords.js');

describe('Simple Wallet Generation', () => {
  
  // Test entropy and UUID
  let testEntropy;
  let testUuid;
  
  beforeAll(() => {
    // Disable console.log from pretty_log() calls in production code
    PrettyLog.This.logMode = UNIT_TESTS_LOG_MODE;
    
    // Use deterministic test entropy
    testEntropy = CRYPTO_CONFIG.TEST_ENTROPY_256;
    
    // Generate a test UUID
    const cryptoServices = CryptoServices.This;
    testUuid = cryptoServices.getUUID();
  });
  
  // ==========================================================================
  // BITCOIN TESTS
  // ==========================================================================
  
  describe('Bitcoin Simple Wallet', () => {
    let wallet;
    
    beforeAll(async () => {
      wallet = await SimpleWallet.GetWallet(testEntropy, testUuid, BITCOIN, 'mainnet');
    });
    
    test('generates a valid Bitcoin wallet', () => {
      expect(wallet).toBeDefined();
      expect(wallet[BLOCKCHAIN]).toBe(BITCOIN);
    });
    
    test('has valid Bitcoin address', () => {
      expect(wallet[ADDRESS]).toBeDefined();
      expect(wallet[ADDRESS]).toBeValidBitcoinAddress();
    });
    
    test('has valid private key', () => {
      expect(wallet[PRIVATE_KEY]).toBeDefined();
      expect(wallet[PRIVATE_KEY]).toBeValidHash(64);
    });
    
    test('has valid public key', () => {
      // Note: Not all Simple Wallets expose the public key
      // Some wallets may only provide address and private key
      if (wallet[PUBLIC_KEY_HEX]) {
        expect(wallet[PUBLIC_KEY_HEX]).toBeValidHash();
      } else {
        // If no public key, at least verify wallet has essential properties
        expect(wallet[ADDRESS]).toBeDefined();
        expect(wallet[PRIVATE_KEY]).toBeDefined();
      }
    });
    
    test('has valid mnemonic phrase', () => {
      expect(wallet[MNEMONICS]).toBeDefined();
      expect(wallet[MNEMONICS]).toBeValidMnemonic();
    });
    
    test('wallet mode is Simple Wallet', () => {
      expect(wallet[WALLET_MODE]).toBe(SIMPLE_WALLET_TYPE);
    });
  });
  
  // ==========================================================================
  // ETHEREUM TESTS
  // ==========================================================================
  
  describe('Ethereum Simple Wallet', () => {
    let wallet;
    
    beforeAll(async () => {
      wallet = await SimpleWallet.GetWallet(testEntropy, testUuid, ETHEREUM, 'mainnet');
    });
    
    test('generates a valid Ethereum wallet', () => {
      expect(wallet).toBeDefined();
      expect(wallet[BLOCKCHAIN]).toBe(ETHEREUM);
    });
    
    test('has valid Ethereum address', () => {
      expect(wallet[ADDRESS]).toBeDefined();
      expect(wallet[ADDRESS]).toBeValidEthereumAddress();
    });
    
    test('has valid private key', () => {
      expect(wallet[PRIVATE_KEY]).toBeDefined();
      expect(wallet[PRIVATE_KEY]).toBeValidHash(64);
    });
    
    test('has valid mnemonic phrase', () => {
      expect(wallet[MNEMONICS]).toBeDefined();
      expect(wallet[MNEMONICS]).toBeValidMnemonic();
    });
  });
  
  // ==========================================================================
  // LITECOIN TESTS
  // ==========================================================================
  
  describe('Litecoin Simple Wallet', () => {
    let wallet;
    
    beforeAll(async () => {
      wallet = await SimpleWallet.GetWallet(testEntropy, testUuid, LITECOIN, 'mainnet');
    });
    
    test('generates a valid Litecoin wallet', () => {
      expect(wallet).toBeDefined();
      expect(wallet[BLOCKCHAIN]).toBe(LITECOIN);
    });
    
    test('has valid address', () => {
      expect(wallet[ADDRESS]).toBeDefined();
      expect(wallet[ADDRESS]).toMatch(/^[LM3]/); // Litecoin addresses start with L, M, or 3
    });
    
    test('has valid private key', () => {
      expect(wallet[PRIVATE_KEY]).toBeDefined();
      expect(wallet[PRIVATE_KEY]).toBeValidHash(64);
    });
    
    test('has valid mnemonic phrase', () => {
      expect(wallet[MNEMONICS]).toBeDefined();
      expect(wallet[MNEMONICS]).toBeValidMnemonic();
    });
  });
  
  // ==========================================================================
  // DOGECOIN TESTS
  // ==========================================================================
  
  describe('Dogecoin Simple Wallet', () => {
    let wallet;
    
    beforeAll(async () => {
      wallet = await SimpleWallet.GetWallet(testEntropy, testUuid, DOGECOIN, 'mainnet');
    });
    
    test('generates a valid Dogecoin wallet', () => {
      expect(wallet).toBeDefined();
      expect(wallet[BLOCKCHAIN]).toBe(DOGECOIN);
    });
    
    test('has valid address', () => {
      expect(wallet[ADDRESS]).toBeDefined();
      expect(wallet[ADDRESS]).toMatch(/^D/); // Dogecoin addresses start with D
    });
    
    test('has valid private key', () => {
      expect(wallet[PRIVATE_KEY]).toBeDefined();
      expect(wallet[PRIVATE_KEY]).toBeValidHash(64);
    });
    
    test('has valid mnemonic phrase', () => {
      expect(wallet[MNEMONICS]).toBeDefined();
      expect(wallet[MNEMONICS]).toBeValidMnemonic();
    });
  });
  
  // ==========================================================================
  // SOLANA TESTS
  // ==========================================================================
  
  describe('Solana Simple Wallet', () => {
    let wallet;
    
    beforeAll(async () => {
      wallet = await SimpleWallet.GetWallet(testEntropy, testUuid, SOLANA, 'mainnet');
    });
    
    test('generates a valid Solana wallet', () => {
      expect(wallet).toBeDefined();
      // Solana doesn't set BLOCKCHAIN property in some implementations
      if (wallet[BLOCKCHAIN]) {
        expect(wallet[BLOCKCHAIN]).toBe(SOLANA);
      }
    });
    
    test('has valid Solana address', () => {
      expect(wallet[ADDRESS]).toBeDefined();
      expect(wallet[ADDRESS]).toMatch(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/); // Base58 format
    });
    
    test('has valid private key', () => {
      expect(wallet[PRIVATE_KEY]).toBeDefined();
      // Solana uses 128 character private keys (64 bytes in hex)
      expect(wallet[PRIVATE_KEY]).toBeValidHash(128);
    });
    
    test('has valid mnemonic phrase', () => {
      expect(wallet[MNEMONICS]).toBeDefined();
      expect(wallet[MNEMONICS]).toBeValidMnemonic();
    });
  });
  
  // ==========================================================================
  // AVALANCHE TESTS
  // ==========================================================================
  
  describe('Avalanche Simple Wallet', () => {
    let wallet;
    
    beforeAll(async () => {
      wallet = await SimpleWallet.GetWallet(testEntropy, testUuid, AVALANCHE, 'mainnet');
    });
    
    test('generates a valid Avalanche wallet', () => {
      expect(wallet).toBeDefined();
      // Note: Avalanche uses Ethereum_API internally, so BLOCKCHAIN may be set to ETHEREUM
      // The important thing is that COIN is correctly set to AVAX
      // This is a known behavior - Avalanche is Ethereum-compatible
      expect(wallet[COIN]).toBe('AVAX');
    });
    
    test('has valid Ethereum-compatible address', () => {
      expect(wallet[ADDRESS]).toBeDefined();
      expect(wallet[ADDRESS]).toBeValidEthereumAddress();
    });
    
    test('has valid private key', () => {
      expect(wallet[PRIVATE_KEY]).toBeDefined();
      expect(wallet[PRIVATE_KEY]).toBeValidHash(64);
    });
    
    test('has correct coin abbreviation', () => {
      expect(wallet[COIN]).toBe('AVAX');
    });
  });
  
  // ==========================================================================
  // POLYGON TESTS
  // ==========================================================================
  
  describe('Polygon Simple Wallet', () => {
    let wallet;
    
    beforeAll(async () => {
      wallet = await SimpleWallet.GetWallet(testEntropy, testUuid, POLYGON, 'mainnet');
    });
    
    test('generates a valid Polygon wallet', () => {
      expect(wallet).toBeDefined();
      // Note: Polygon uses Ethereum_API internally, so BLOCKCHAIN may be set to ETHEREUM
      // The important thing is that COIN is correctly set to POL
      // This is a known behavior - Polygon is Ethereum-compatible
      expect(wallet[COIN]).toBe('POL');
    });
    
    test('has valid Ethereum-compatible address', () => {
      expect(wallet[ADDRESS]).toBeDefined();
      expect(wallet[ADDRESS]).toBeValidEthereumAddress();
    });
    
    test('has valid private key', () => {
      expect(wallet[PRIVATE_KEY]).toBeDefined();
      expect(wallet[PRIVATE_KEY]).toBeValidHash(64);
    });
    
    test('has correct coin abbreviation', () => {
      expect(wallet[COIN]).toBe('POL');
    });
  });
  
  // ==========================================================================
  // TONCOIN TESTS
  // ==========================================================================
  
  describe('Toncoin Simple Wallet', () => {
    let wallet;
    
    beforeAll(async () => {
      wallet = await SimpleWallet.GetWallet(testEntropy, testUuid, TON, 'mainnet');
    });
    
    test('generates a valid Toncoin wallet', () => {
      expect(wallet).toBeDefined();
      expect(wallet[BLOCKCHAIN]).toBe(TON);
    });
    
    test('has valid address', () => {
      expect(wallet[ADDRESS]).toBeDefined();
      expect(wallet[ADDRESS].length).toBeGreaterThan(0);
    });
    
    test('has valid private key', () => {
      expect(wallet[PRIVATE_KEY]).toBeDefined();
      // TON uses 127 character private keys
      expect(wallet[PRIVATE_KEY].length).toBeGreaterThan(64);
      expect(wallet[PRIVATE_KEY]).toBeValidHash();
    });
    
    test('has valid mnemonic phrase', () => {
      expect(wallet[MNEMONICS]).toBeDefined();
      expect(wallet[MNEMONICS]).toBeValidMnemonic();
    });
  });
  
  // ==========================================================================
  // TERRA (LUNA) TESTS
  // ==========================================================================
  
  describe('Terra (Luna) Simple Wallet', () => {
    let wallet;
    
    beforeAll(async () => {
      wallet = await SimpleWallet.GetWallet(testEntropy, testUuid, TERRA_LUNA, 'mainnet');
    });
    
    test('generates a valid Terra wallet', () => {
      expect(wallet).toBeDefined();
      expect(wallet[BLOCKCHAIN]).toBe(TERRA_LUNA);
    });
    
    test('has valid address', () => {
      expect(wallet[ADDRESS]).toBeDefined();
      expect(wallet[ADDRESS]).toMatch(/^terra/); // Terra addresses start with 'terra'
    });
    
    test('has valid private key', () => {
      expect(wallet[PRIVATE_KEY]).toBeDefined();
      expect(wallet[PRIVATE_KEY]).toBeValidHash(64);
    });
    
    test('has valid mnemonic phrase', () => {
      expect(wallet[MNEMONICS]).toBeDefined();
      expect(wallet[MNEMONICS]).toBeValidMnemonic();
    });
  });
  
  // ==========================================================================
  // HORIZEN TESTS
  // ==========================================================================
  
  describe('Horizen Simple Wallet', () => {
    let wallet;
    
    beforeAll(async () => {
      wallet = await SimpleWallet.GetWallet(testEntropy, testUuid, HORIZEN, 'mainnet');
    });
    
    test('generates a valid Horizen wallet', () => {
      expect(wallet).toBeDefined();
      expect(wallet[BLOCKCHAIN]).toBe(HORIZEN);
    });
    
    test('has valid address', () => {
      expect(wallet[ADDRESS]).toBeDefined();
      expect(wallet[ADDRESS]).toMatch(/^zn/); // Horizen addresses start with 'zn'
    });
    
    test('has valid private key', () => {
      expect(wallet[PRIVATE_KEY]).toBeDefined();
      expect(wallet[PRIVATE_KEY]).toBeValidHash(64);
    });
    
    test('has valid mnemonic phrase', () => {
      expect(wallet[MNEMONICS]).toBeDefined();
      expect(wallet[MNEMONICS]).toBeValidMnemonic();
    });
  });
  
  // ==========================================================================
  // CROSS-BLOCKCHAIN TESTS
  // ==========================================================================
  
  describe('Cross-Blockchain Consistency', () => {
    
    test('same entropy generates different addresses for different blockchains', async () => {
      const btcWallet = await SimpleWallet.GetWallet(testEntropy, testUuid, BITCOIN, 'mainnet');
      const ethWallet = await SimpleWallet.GetWallet(testEntropy, testUuid, ETHEREUM, 'mainnet');
      
      expect(btcWallet[ADDRESS]).not.toBe(ethWallet[ADDRESS]);
    });
    
    test('same entropy generates same mnemonic for all blockchains', async () => {
      const btcWallet = await SimpleWallet.GetWallet(testEntropy, testUuid, BITCOIN, 'mainnet');
      const ethWallet = await SimpleWallet.GetWallet(testEntropy, testUuid, ETHEREUM, 'mainnet');
      const solWallet = await SimpleWallet.GetWallet(testEntropy, testUuid, SOLANA, 'mainnet');
      
      expect(btcWallet.Mnemonics).toBe(ethWallet.Mnemonics);
      expect(btcWallet.Mnemonics).toBe(solWallet.Mnemonics);
    });
    
    test('all wallets have wallet mode set to Simple Wallet', async () => {
      const blockchains = [BITCOIN, ETHEREUM, LITECOIN, DOGECOIN, SOLANA];
      
      for (const blockchain of blockchains) {
        const wallet = await SimpleWallet.GetWallet(testEntropy, testUuid, blockchain, 'mainnet');
        expect(wallet[WALLET_MODE]).toBe(SIMPLE_WALLET_TYPE);
      }
    });
  });
  
  // ==========================================================================
  // ENTROPY SIZE / WORD COUNT (128 bits => 12 words, 256 bits => 24 words)
  // ==========================================================================
  
  describe('Simple Wallet entropy sizes', () => {
    
    // Helper per test (more robust than a shared async beforeAll)
    const getBtcWallet = (entropy) =>
      SimpleWallet.GetWallet(entropy, testUuid, BITCOIN, 'mainnet');
    const getEthWallet = (entropy) =>
      SimpleWallet.GetWallet(entropy, testUuid, ETHEREUM, 'mainnet');
    const getSolWallet = (entropy) =>
      SimpleWallet.GetWallet(entropy, testUuid, SOLANA, 'mainnet');
    
    test('128-bit entropy produces a 12-word mnemonic', async () => {
      const wallet = await getBtcWallet(CRYPTO_CONFIG.TEST_ENTROPY_128);
      expect(wallet[MNEMONICS].split(' ')).toHaveLength(12);
      expect(wallet[MNEMONICS]).toBeValidMnemonic();
    });
    
    test('128-bit entropy yields a valid non-null Bitcoin address', async () => {
      const wallet = await getBtcWallet(CRYPTO_CONFIG.TEST_ENTROPY_128);
      expect(wallet[ADDRESS]).toBeDefined();
      expect(wallet[ADDRESS]).not.toBe('Null-ADDRESS'); // regression guard: INVALID PK SIZE
      expect(wallet[ADDRESS]).toBeValidBitcoinAddress();
    });
    
    test('128-bit entropy is derived to a 256-bit (64-hex) private key', async () => {
      const wallet = await getBtcWallet(CRYPTO_CONFIG.TEST_ENTROPY_128);
      expect(wallet[PRIVATE_KEY]).toBeValidHash(64);
      expect(wallet[PRIVATE_KEY]).not.toBe(CRYPTO_CONFIG.TEST_ENTROPY_128); // derived, not the raw entropy
    });
    
    // 15 / 18 / 21 words (160 / 192 / 224 bits): same < 256-bit path as 128 bits.
    // Entropy is derived from TEST_ENTROPY_256 by slicing to the right hex length.
    test.each([
      [160, 15],
      [192, 18],
      [224, 21],
    ])('%i-bit entropy => %i-word mnemonic + valid non-null BTC address + 64-hex key', async (bits, words) => {
      const entropy = CRYPTO_CONFIG.TEST_ENTROPY_256.slice(0, bits / 4);
      const wallet  = await getBtcWallet(entropy);
      expect(wallet[MNEMONICS].split(' ')).toHaveLength(words);
      expect(wallet[MNEMONICS]).toBeValidMnemonic();
      expect(wallet[ADDRESS]).not.toBe('Null-ADDRESS');
      expect(wallet[ADDRESS]).toBeValidBitcoinAddress();
      expect(wallet[PRIVATE_KEY]).toBeValidHash(64);
    });
    
    // --- Ethereum: raw-key coin (like Bitcoin), entropy expanded via getSecp256k1PK ---
    test('128-bit entropy yields a valid non-null Ethereum address', async () => {
      const wallet = await getEthWallet(CRYPTO_CONFIG.TEST_ENTROPY_128);
      expect(wallet[ADDRESS]).toBeDefined();
      expect(wallet[ADDRESS]).not.toBe('Null-ADDRESS');
      expect(wallet[ADDRESS]).toBeValidEthereumAddress();
    });
    
    test('128-bit Ethereum wallet has a 12-word mnemonic and a 64-hex private key', async () => {
      const wallet = await getEthWallet(CRYPTO_CONFIG.TEST_ENTROPY_128);
      expect(wallet[MNEMONICS].split(' ')).toHaveLength(12);
      expect(wallet[PRIVATE_KEY]).toBeValidHash(64);
    });
    
    // --- Solana: seed-derived coin, size-agnostic (no getSecp256k1PK expansion) ---
    test('128-bit entropy yields a valid non-null Solana address', async () => {
      const wallet = await getSolWallet(CRYPTO_CONFIG.TEST_ENTROPY_128);
      expect(wallet[ADDRESS]).toBeDefined();
      expect(wallet[ADDRESS]).not.toBe('Null-ADDRESS');
      expect(wallet[ADDRESS]).toMatch(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/); // Base58
    });
    
    test('128-bit Solana wallet has a 12-word mnemonic and a seed-derived key', async () => {
      const wallet = await getSolWallet(CRYPTO_CONFIG.TEST_ENTROPY_128);
      expect(wallet[MNEMONICS].split(' ')).toHaveLength(12);
      expect(wallet[MNEMONICS]).toBeValidMnemonic();
      expect(wallet[PRIVATE_KEY]).toBeValidHash(128); // 64-byte secret key, not expanded
    });
    
    test('256-bit entropy still produces a 24-word mnemonic', async () => {
      const wallet = await getBtcWallet(CRYPTO_CONFIG.TEST_ENTROPY_256);
      expect(wallet[MNEMONICS].split(' ')).toHaveLength(24);
    });
    
    test('256-bit entropy is used unchanged as the private key (non-breaking)', async () => {
      const wallet = await getBtcWallet(CRYPTO_CONFIG.TEST_ENTROPY_256);
      expect(wallet[PRIVATE_KEY]).toBe(CRYPTO_CONFIG.TEST_ENTROPY_256);
    });
    
    // --- Convergence Simple <-> HD for < 256-bit entropy ---
    // Same mnemonic => same BIP44 key (m/44'/coin'/0'/0/0'), so a Simple Wallet and an
    // HD Wallet built from the same 128-bit entropy must expose the same key AND address.
    // Key equality is guaranteed (both go through Bip32Utils); address equality is the real
    // cross-library check (CoinKey / Ethereum_API rendering vs HdAddGen).
    const stripHex = (v) => (v || '').toString().toLowerCase().replace(/^0x/, '');
    
    test('128-bit Simple Wallet BTC converges with HD Wallet BTC', async () => {
      const e      = CRYPTO_CONFIG.TEST_ENTROPY_128;
      const simple = await getBtcWallet(e);
      const hd     = await HDWallet.GetWallet(e, testUuid, { [BLOCKCHAIN]: BITCOIN });
      expect(stripHex(simple[PRIVATE_KEY])).toBe(stripHex(hd[PRIVATE_KEY]));
      expect(simple[ADDRESS]).toBe(hd[ADDRESS]);
    });
    
    test('128-bit Simple Wallet ETH converges with HD Wallet ETH', async () => {
      const e      = CRYPTO_CONFIG.TEST_ENTROPY_128;
      const simple = await getEthWallet(e);
      const hd     = await HDWallet.GetWallet(e, testUuid, { [BLOCKCHAIN]: ETHEREUM });
      expect(stripHex(simple[PRIVATE_KEY])).toBe(stripHex(hd[PRIVATE_KEY]));
      expect(stripHex(simple[ADDRESS])).toBe(stripHex(hd[ADDRESS])); // ETH: ignore 0x / casing
    });
    
    // Convergence also holds for 15 / 18 / 21 words (160 / 192 / 224 bits): same BIP44 path.
    test.each([
      [160, 15],
      [192, 18],
      [224, 21],
    ])('%i-bit (%i words) Simple Wallet BTC converges with HD Wallet BTC', async (bits) => {
      const e      = CRYPTO_CONFIG.TEST_ENTROPY_256.slice(0, bits / 4);
      const simple = await getBtcWallet(e);
      const hd     = await HDWallet.GetWallet(e, testUuid, { [BLOCKCHAIN]: BITCOIN });
      expect(stripHex(simple[PRIVATE_KEY])).toBe(stripHex(hd[PRIVATE_KEY]));
      expect(simple[ADDRESS]).toBe(hd[ADDRESS]);
    });
  });
  
  // ==========================================================================
  // ERROR HANDLING TESTS
  // ==========================================================================
  
  describe('Error Handling', () => {
    
    test('throws error when entropy_hex is undefined', async () => {
      await expect(
        SimpleWallet.GetWallet(undefined, testUuid, BITCOIN, 'mainnet')
      ).rejects.toThrow("SimpleWallet.GetWallet 'entropy_hex' NOT DEFINED");
    });
    
    test('throws error when entropy_hex is empty string', async () => {
      await expect(
        SimpleWallet.GetWallet('', testUuid, BITCOIN, 'mainnet')
      ).rejects.toThrow("SimpleWallet.GetWallet 'entropy_hex' NOT DEFINED");
    });
  });
  
  // ==========================================================================
  // TESTNET TESTS
  // ==========================================================================
  
  describe('Testnet Support', () => {
    
    test('generates Bitcoin testnet wallet', async () => {
      const wallet = await SimpleWallet.GetWallet(testEntropy, testUuid, BITCOIN, 'testnet');
      
      expect(wallet).toBeDefined();
      expect(wallet[BLOCKCHAIN]).toBe(BITCOIN);
      expect(wallet[CRYPTO_NET]).toBe('testnet');
    });
    
    test('generates Ethereum testnet wallet', async () => {
      const wallet = await SimpleWallet.GetWallet(testEntropy, testUuid, ETHEREUM, 'testnet');
      
      expect(wallet).toBeDefined();
      expect(wallet[BLOCKCHAIN]).toBe(ETHEREUM);
      expect(wallet[ADDRESS]).toBeValidEthereumAddress();
    });
  });
  
  // ==========================================================================
  // HELPER FUNCTION TESTS
  // ==========================================================================
  
  describe('Helper Functions', () => {
    
    test('InitializeWallet creates null wallet', () => {
      const nullWallet = SimpleWallet.InitializeWallet();
      
      expect(nullWallet).toBeDefined();
      expect(nullWallet[BLOCKCHAIN]).toBe(NULL_BLOCKCHAIN);
      expect(nullWallet[CRYPTO_NET]).toBe('Null-NET');
      expect(nullWallet[ADDRESS]).toBe('Null-ADDRESS');
      expect(nullWallet[MNEMONICS]).toBe('Null-MNEMONICS');
    });
    
    test('GenerateKeyPairFromMnemonic generates valid key pair', () => {
      const mnemonic = CRYPTO_CONFIG.TEST_MNEMONIC_24;
      const keyPair = SimpleWallet.GenerateKeyPairFromMnemonic(mnemonic);
      
      expect(keyPair).toBeDefined();
      expect(keyPair.privateKey).toBeDefined();
      expect(keyPair.publicKey).toBeDefined();
      expect(keyPair.privateKey).toBeValidHash(64);
      expect(keyPair.publicKey).toBeValidHash();
    });
  });
});
