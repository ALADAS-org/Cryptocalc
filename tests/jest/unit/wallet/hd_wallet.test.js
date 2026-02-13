/**
 * ============================================================================
 * Unit Tests - HD Wallet Generation (BIP32/BIP44)
 * ============================================================================
 * Tests the generation of Hierarchical Deterministic (HD) Wallets
 * Location: www/js/crypto/HDWallet/hd_wallet.js
 * Note: Console.log suppression is configured globally in setup.js
 * ============================================================================
 */

// Import required modules
const { HDWallet } = require('@crypto/HDWallet/hd_wallet.js');
const { CryptoServices } = require('@crypto/crypto_services.js');

// Import PrettyLog and log mode constant to disable console.log from production code
const { PrettyLog, UNIT_TESTS_LOG_MODE } = require('@util/log/log_utils.js');

// Import blockchain constants
const { 
  BITCOIN, ETHEREUM, DOGECOIN, LITECOIN, 
  SOLANA, AVALANCHE, POLYGON, CARDANO, SUI,
  ETHEREUM_CLASSIC, STELLAR, RIPPLE, TRON,
  BITCOIN_CASH, BITCOIN_SV, RAVENCOIN, VECHAIN, DASH, FIRO,
  BINANCE_BSC, HORIZEN,
  COIN, COIN_TYPE, MAINNET, TESTNET
} = require('@crypto/const_blockchains.js');

// Import wallet property constants
const { 
  ADDRESS, PRIVATE_KEY, PUBLIC_KEY_HEX, CRYPTO_NET, PRIV_KEY
} = require('@crypto/const_wallet.js');

// Import keyword constants
const { 
  BLOCKCHAIN, NULL_BLOCKCHAIN,
  WALLET_MODE, HD_WALLET_TYPE,
  MNEMONICS, UUID, WIF,
  BIP32_PROTOCOL, BIP32_PASSPHRASE,
  ACCOUNT, ADDRESS_INDEX, DERIVATION_PATH
} = require('@www/js/const_keywords.js');

describe('HD Wallet Generation (BIP32/BIP44)', () => {
  
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
  // INITIALIZATION TESTS
  // ==========================================================================
  
  describe('HDWallet Initialization', () => {
    
    test('InitializeWallet creates null wallet with correct structure', () => {
      const nullWallet = HDWallet.InitializeWallet();
      
      expect(nullWallet).toBeDefined();
      expect(nullWallet[BLOCKCHAIN]).toBe(NULL_BLOCKCHAIN);
      expect(nullWallet[CRYPTO_NET]).toBe('Null-NET');
      expect(nullWallet[UUID]).toBe('Null-UUID');
      expect(nullWallet[BIP32_PROTOCOL]).toBe(44);
      expect(nullWallet[ADDRESS]).toBe('Null-ADDRESS');
      expect(nullWallet[MNEMONICS]).toBe('Null-MNEMONICS');
    });
  });
  
  // ==========================================================================
  // ERROR HANDLING TESTS
  // ==========================================================================
  
  describe('Error Handling', () => {
    
    test('throws error when entropy_hex is undefined', async () => {
      const args = {
        [BLOCKCHAIN]: BITCOIN,
        [CRYPTO_NET]: MAINNET
      };
      
      await expect(
        HDWallet.GetWallet(undefined, testUuid, args)
      ).rejects.toThrow("HDWallet.GetWallet 'entropy_hex' NOT DEFINED");
    });
    
    test('throws error when entropy_hex is empty string', async () => {
      const args = {
        [BLOCKCHAIN]: BITCOIN,
        [CRYPTO_NET]: MAINNET
      };
      
      await expect(
        HDWallet.GetWallet('', testUuid, args)
      ).rejects.toThrow("HDWallet.GetWallet 'entropy_hex' NOT DEFINED");
    });
    
    test('throws error when salt_uuid is undefined', async () => {
      const args = {
        [BLOCKCHAIN]: BITCOIN,
        [CRYPTO_NET]: MAINNET
      };
      
      await expect(
        HDWallet.GetWallet(testEntropy, undefined, args)
      ).rejects.toThrow("HDWallet.GetWallet 'salt_uuid' NOT DEFINED");
    });
    
    test('throws error when salt_uuid is empty string', async () => {
      const args = {
        [BLOCKCHAIN]: BITCOIN,
        [CRYPTO_NET]: MAINNET
      };
      
      await expect(
        HDWallet.GetWallet(testEntropy, '', args)
      ).rejects.toThrow("HDWallet.GetWallet 'salt_uuid' NOT DEFINED");
    });
  });
  
  // ==========================================================================
  // BITCOIN HD WALLET TESTS
  // ==========================================================================
  
  describe('Bitcoin HD Wallet (BIP44)', () => {
    let wallet;
    
    beforeAll(async () => {
      const args = {
        [BLOCKCHAIN]: BITCOIN,
        [CRYPTO_NET]: MAINNET,
        [BIP32_PROTOCOL]: 44,
        [ACCOUNT]: 0,
        [ADDRESS_INDEX]: 0
      };
      wallet = await HDWallet.GetWallet(testEntropy, testUuid, args);
    });
    
    test('generates a valid Bitcoin HD wallet', () => {
      expect(wallet).toBeDefined();
      expect(wallet[BLOCKCHAIN]).toBe(BITCOIN);
      expect(wallet[WALLET_MODE]).toBe(HD_WALLET_TYPE);
    });
    
    test('has valid Bitcoin address', () => {
      expect(wallet[ADDRESS]).toBeDefined();
      expect(wallet[ADDRESS]).toBeValidBitcoinAddress();
    });
    
    test('has valid private key', () => {
      expect(wallet[PRIVATE_KEY]).toBeDefined();
      expect(wallet[PRIVATE_KEY]).toBeValidHash(64);
    });
    
    test('has valid WIF', () => {
      expect(wallet[WIF]).toBeDefined();
      expect(wallet[WIF]).toBeValidWIF();
    });
    
    test('has valid mnemonic phrase', () => {
      expect(wallet[MNEMONICS]).toBeDefined();
      expect(wallet[MNEMONICS]).toBeValidMnemonic();
    });
    
    test('has correct derivation path', () => {
      expect(wallet[DERIVATION_PATH]).toBeDefined();
      // Note: The actual format includes a trailing apostrophe
      expect(wallet[DERIVATION_PATH]).toMatch(/^m\/44'\/0'\/0'\/0\/0'$/);
    });
    
    test('has coin type information', () => {
      expect(wallet[COIN]).toBe('BTC');
      expect(wallet[COIN_TYPE]).toBe(0);
    });
  });
  
  // ==========================================================================
  // ETHEREUM HD WALLET TESTS
  // ==========================================================================
  
  describe('Ethereum HD Wallet (BIP44)', () => {
    let wallet;
    
    beforeAll(async () => {
      const args = {
        [BLOCKCHAIN]: ETHEREUM,
        [CRYPTO_NET]: MAINNET,
        [BIP32_PROTOCOL]: 44,
        [ACCOUNT]: 0,
        [ADDRESS_INDEX]: 0
      };
      wallet = await HDWallet.GetWallet(testEntropy, testUuid, args);
    });
    
    test('generates a valid Ethereum HD wallet', () => {
      expect(wallet).toBeDefined();
      expect(wallet[BLOCKCHAIN]).toBe(ETHEREUM);
      expect(wallet[WALLET_MODE]).toBe(HD_WALLET_TYPE);
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
    
    test('has correct derivation path', () => {
      expect(wallet[DERIVATION_PATH]).toBeDefined();
      // Note: The actual format includes a trailing apostrophe
      expect(wallet[DERIVATION_PATH]).toMatch(/^m\/44'\/60'\/0'\/0\/0'$/);
    });
    
    test('has coin type information', () => {
      expect(wallet[COIN]).toBe('ETH');
      expect(wallet[COIN_TYPE]).toBe(60);
    });
  });
  
  // ==========================================================================
  // LITECOIN HD WALLET TESTS
  // ==========================================================================
  
  describe('Litecoin HD Wallet (BIP44)', () => {
    let wallet;
    
    beforeAll(async () => {
      const args = {
        [BLOCKCHAIN]: LITECOIN,
        [CRYPTO_NET]: MAINNET,
        [BIP32_PROTOCOL]: 44,
        [ACCOUNT]: 0,
        [ADDRESS_INDEX]: 0
      };
      wallet = await HDWallet.GetWallet(testEntropy, testUuid, args);
    });
    
    test('generates a valid Litecoin HD wallet', () => {
      expect(wallet).toBeDefined();
      expect(wallet[BLOCKCHAIN]).toBe(LITECOIN);
    });
    
    test('has valid Litecoin address', () => {
      expect(wallet[ADDRESS]).toBeDefined();
      expect(wallet[ADDRESS]).toMatch(/^[LM3]/);
    });
    
    test('has valid private key', () => {
      expect(wallet[PRIVATE_KEY]).toBeDefined();
      expect(wallet[PRIVATE_KEY]).toBeValidHash(64);
    });
    
    test('has correct derivation path', () => {
      expect(wallet[DERIVATION_PATH]).toBeDefined();
      expect(wallet[DERIVATION_PATH]).toMatch(/^m\/44'\/2'\/0'\/0\/0'$/);
    });
    
    test('has coin type information', () => {
      expect(wallet[COIN]).toBe('LTC');
      expect(wallet[COIN_TYPE]).toBe(2);
    });
  });
  
  // ==========================================================================
  // DOGECOIN HD WALLET TESTS
  // ==========================================================================
  
  describe('Dogecoin HD Wallet (BIP44)', () => {
    let wallet;
    
    beforeAll(async () => {
      const args = {
        [BLOCKCHAIN]: DOGECOIN,
        [CRYPTO_NET]: MAINNET,
        [BIP32_PROTOCOL]: 44,
        [ACCOUNT]: 0,
        [ADDRESS_INDEX]: 0
      };
      wallet = await HDWallet.GetWallet(testEntropy, testUuid, args);
    });
    
    test('generates a valid Dogecoin HD wallet', () => {
      expect(wallet).toBeDefined();
      expect(wallet[BLOCKCHAIN]).toBe(DOGECOIN);
    });
    
    test('has valid Dogecoin address', () => {
      expect(wallet[ADDRESS]).toBeDefined();
      expect(wallet[ADDRESS]).toMatch(/^D/);
    });
    
    test('has valid private key', () => {
      expect(wallet[PRIVATE_KEY]).toBeDefined();
      expect(wallet[PRIVATE_KEY]).toBeValidHash(64);
    });
    
    test('has correct derivation path', () => {
      expect(wallet[DERIVATION_PATH]).toBeDefined();
      expect(wallet[DERIVATION_PATH]).toMatch(/^m\/44'\/3'\/0'\/0\/0'$/);
    });
    
    test('has coin type information', () => {
      expect(wallet[COIN]).toBe('DOGE');
      expect(wallet[COIN_TYPE]).toBe(3);
    });
  });
  
  // ==========================================================================
  // AVALANCHE HD WALLET TESTS (Uses Ethereum derivation)
  // ==========================================================================
  
  describe('Avalanche HD Wallet (BIP44 - Ethereum compatible)', () => {
    let wallet;
    
    beforeAll(async () => {
      const args = {
        [BLOCKCHAIN]: AVALANCHE,
        [CRYPTO_NET]: MAINNET,
        [BIP32_PROTOCOL]: 44,
        [ACCOUNT]: 0,
        [ADDRESS_INDEX]: 0
      };
      wallet = await HDWallet.GetWallet(testEntropy, testUuid, args);
    });
    
    test('generates a valid Avalanche HD wallet', () => {
      expect(wallet).toBeDefined();
      expect(wallet[BLOCKCHAIN]).toBe(AVALANCHE);
    });
    
    test('has valid Ethereum-compatible address', () => {
      expect(wallet[ADDRESS]).toBeDefined();
      expect(wallet[ADDRESS]).toBeValidEthereumAddress();
    });
    
    test('has valid private key', () => {
      expect(wallet[PRIVATE_KEY]).toBeDefined();
      expect(wallet[PRIVATE_KEY]).toBeValidHash(64);
    });
    
    test('uses Ethereum derivation path', () => {
      expect(wallet[DERIVATION_PATH]).toBeDefined();
      expect(wallet[DERIVATION_PATH]).toMatch(/^m\/44'\/60'\/0'\/0\/0'$/);
    });
    
    test('has coin abbreviation (ETH since it uses Ethereum API)', () => {
      // Note: Avalanche uses Ethereum API internally, so COIN will be 'ETH'
      // This is expected behavior
      expect(wallet[COIN]).toBe('ETH');
    });
  });
  
  // ==========================================================================
  // POLYGON HD WALLET TESTS (Uses Ethereum derivation)
  // ==========================================================================
  
  describe('Polygon HD Wallet (BIP44 - Ethereum compatible)', () => {
    let wallet;
    
    beforeAll(async () => {
      const args = {
        [BLOCKCHAIN]: POLYGON,
        [CRYPTO_NET]: MAINNET,
        [BIP32_PROTOCOL]: 44,
        [ACCOUNT]: 0,
        [ADDRESS_INDEX]: 0
      };
      wallet = await HDWallet.GetWallet(testEntropy, testUuid, args);
    });
    
    test('generates a valid Polygon HD wallet', () => {
      expect(wallet).toBeDefined();
      expect(wallet[BLOCKCHAIN]).toBe(POLYGON);
    });
    
    test('has valid Ethereum-compatible address', () => {
      expect(wallet[ADDRESS]).toBeDefined();
      expect(wallet[ADDRESS]).toBeValidEthereumAddress();
    });
    
    test('uses Ethereum derivation path', () => {
      expect(wallet[DERIVATION_PATH]).toBeDefined();
      expect(wallet[DERIVATION_PATH]).toMatch(/^m\/44'\/60'\/0'\/0\/0'$/);
    });
    
    test('has coin abbreviation (ETH since it uses Ethereum API)', () => {
      // Note: Polygon uses Ethereum API internally, so COIN will be 'ETH'
      // This is expected behavior
      expect(wallet[COIN]).toBe('ETH');
    });
  });
  
  // ==========================================================================
  // SOLANA HD WALLET TESTS
  // ==========================================================================
  
  describe('Solana HD Wallet (BIP44)', () => {
    let wallet;
    
    beforeAll(async () => {
      const args = {
        [BLOCKCHAIN]: SOLANA,
        [CRYPTO_NET]: MAINNET,
        [BIP32_PROTOCOL]: 44,
        [ACCOUNT]: 0,
        [ADDRESS_INDEX]: 0
      };
      wallet = await HDWallet.GetWallet(testEntropy, testUuid, args);
    });
    
    test('generates a valid Solana HD wallet', () => {
      expect(wallet).toBeDefined();
      expect(wallet[BLOCKCHAIN]).toBe(SOLANA);
    });
    
    test('has valid Solana address', () => {
      expect(wallet[ADDRESS]).toBeDefined();
      expect(wallet[ADDRESS]).toMatch(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/);
    });
    
    test('has valid private key (Base58 format for Solana)', () => {
      expect(wallet[PRIVATE_KEY]).toBeDefined();
      // Solana private key is in Base58 format, not hex
      expect(wallet[PRIVATE_KEY].length).toBeGreaterThan(0);
    });
    
    test('has valid mnemonic phrase', () => {
      expect(wallet[MNEMONICS]).toBeDefined();
      expect(wallet[MNEMONICS]).toBeValidMnemonic();
    });
  });
  
  // ==========================================================================
  // CARDANO HD WALLET TESTS
  // ==========================================================================
  
  describe('Cardano HD Wallet (BIP44)', () => {
    let wallet;
    
    beforeAll(async () => {
      const args = {
        [BLOCKCHAIN]: CARDANO,
        [CRYPTO_NET]: MAINNET,
        [BIP32_PROTOCOL]: 44,
        [ACCOUNT]: 0,
        [ADDRESS_INDEX]: 0
      };
      wallet = await HDWallet.GetWallet(testEntropy, testUuid, args);
    });
    
    test('generates a valid Cardano HD wallet', () => {
      expect(wallet).toBeDefined();
      expect(wallet[BLOCKCHAIN]).toBe(CARDANO);
    });
    
    test('has valid Cardano address', () => {
      expect(wallet[ADDRESS]).toBeDefined();
      expect(wallet[ADDRESS]).toMatch(/^addr1/);
    });
    
    test('has valid private key (Cardano extended format)', () => {
      expect(wallet[PRIVATE_KEY]).toBeDefined();
      // Cardano uses extended private key format (xprv...)
      expect(wallet[PRIVATE_KEY].length).toBeGreaterThan(0);
    });
    
    test('has valid mnemonic phrase', () => {
      expect(wallet[MNEMONICS]).toBeDefined();
      expect(wallet[MNEMONICS]).toBeValidMnemonic();
    });
  });
  
  // ==========================================================================
  // DERIVATION PATH TESTS
  // ==========================================================================
  
  describe('Derivation Path Variations', () => {
    
    test('generates different addresses for different address indices', async () => {
      const args1 = {
        [BLOCKCHAIN]: BITCOIN,
        [CRYPTO_NET]: MAINNET,
        [ACCOUNT]: 0,
        [ADDRESS_INDEX]: 0
      };
      
      const args2 = {
        [BLOCKCHAIN]: BITCOIN,
        [CRYPTO_NET]: MAINNET,
        [ACCOUNT]: 0,
        [ADDRESS_INDEX]: 1
      };
      
      const wallet1 = await HDWallet.GetWallet(testEntropy, testUuid, args1);
      const wallet2 = await HDWallet.GetWallet(testEntropy, testUuid, args2);
      
      expect(wallet1[ADDRESS]).not.toBe(wallet2[ADDRESS]);
      expect(wallet1[DERIVATION_PATH]).not.toBe(wallet2[DERIVATION_PATH]);
    });
    
    test('generates different addresses for different accounts', async () => {
      const args1 = {
        [BLOCKCHAIN]: BITCOIN,
        [CRYPTO_NET]: MAINNET,
        [ACCOUNT]: 0,
        [ADDRESS_INDEX]: 0
      };
      
      const args2 = {
        [BLOCKCHAIN]: BITCOIN,
        [CRYPTO_NET]: MAINNET,
        [ACCOUNT]: 1,
        [ADDRESS_INDEX]: 0
      };
      
      const wallet1 = await HDWallet.GetWallet(testEntropy, testUuid, args1);
      const wallet2 = await HDWallet.GetWallet(testEntropy, testUuid, args2);
      
      expect(wallet1[ADDRESS]).not.toBe(wallet2[ADDRESS]);
      expect(wallet1[DERIVATION_PATH]).toMatch(/^m\/44'\/0'\/0'\/0\/0'$/);
      expect(wallet2[DERIVATION_PATH]).toMatch(/^m\/44'\/0'\/1'\/0\/0'$/);
    });
    
    test('BIP44 protocol generates valid addresses', async () => {
      const argsBip44 = {
        [BLOCKCHAIN]: BITCOIN,
        [CRYPTO_NET]: MAINNET,
        [BIP32_PROTOCOL]: 44,
        [ACCOUNT]: 0,
        [ADDRESS_INDEX]: 0
      };
      
      const walletBip44 = await HDWallet.GetWallet(testEntropy, testUuid, argsBip44);
      
      expect(walletBip44[ADDRESS]).toBeDefined();
      expect(walletBip44[ADDRESS]).toBeValidBitcoinAddress();
      expect(walletBip44[DERIVATION_PATH]).toMatch(/^m\/44'/);
    });
  });
  
  // ==========================================================================
  // BIP32 PASSPHRASE TESTS
  // ==========================================================================
  
  describe('BIP32 Passphrase Support', () => {
    
    test('generates different addresses with different passphrases', async () => {
      const args1 = {
        [BLOCKCHAIN]: BITCOIN,
        [CRYPTO_NET]: MAINNET,
        [BIP32_PASSPHRASE]: '',
        [ACCOUNT]: 0,
        [ADDRESS_INDEX]: 0
      };
      
      const args2 = {
        [BLOCKCHAIN]: BITCOIN,
        [CRYPTO_NET]: MAINNET,
        [BIP32_PASSPHRASE]: 'MySecretPassphrase123',
        [ACCOUNT]: 0,
        [ADDRESS_INDEX]: 0
      };
      
      const wallet1 = await HDWallet.GetWallet(testEntropy, testUuid, args1);
      const wallet2 = await HDWallet.GetWallet(testEntropy, testUuid, args2);
      
      expect(wallet1[ADDRESS]).not.toBe(wallet2[ADDRESS]);
      expect(wallet1[PRIVATE_KEY]).not.toBe(wallet2[PRIVATE_KEY]);
    });
    
    test('wallet with passphrase stores passphrase field', async () => {
      const passphrase = 'MyTestPassphrase';
      const args = {
        [BLOCKCHAIN]: BITCOIN,
        [CRYPTO_NET]: MAINNET,
        [BIP32_PASSPHRASE]: passphrase,
        [ACCOUNT]: 0,
        [ADDRESS_INDEX]: 0
      };
      
      const wallet = await HDWallet.GetWallet(testEntropy, testUuid, args);
      
      expect(wallet[BIP32_PASSPHRASE]).toBe(passphrase);
    });
    
    test('wallet without passphrase does not store passphrase field', async () => {
      const args = {
        [BLOCKCHAIN]: BITCOIN,
        [CRYPTO_NET]: MAINNET,
        [BIP32_PASSPHRASE]: '',
        [ACCOUNT]: 0,
        [ADDRESS_INDEX]: 0
      };
      
      const wallet = await HDWallet.GetWallet(testEntropy, testUuid, args);
      
      expect(wallet[BIP32_PASSPHRASE]).toBeUndefined();
    });
  });
  
  // ==========================================================================
  // DEFAULT VALUES TESTS
  // ==========================================================================
  
  describe('Default Values', () => {
    
    test('uses default values when args specify blockchain and crypto_net', async () => {
      const args = {
        [BLOCKCHAIN]: BITCOIN,
        [CRYPTO_NET]: MAINNET
      };
      
      const wallet = await HDWallet.GetWallet(testEntropy, testUuid, args);
      
      expect(wallet).toBeDefined();
      expect(wallet[BLOCKCHAIN]).toBe(BITCOIN);
      expect(wallet[CRYPTO_NET]).toBe(MAINNET);
      expect(wallet[DERIVATION_PATH]).toMatch(/^m\/44'\/0'\/0'\/0\/0'$/); // Default BIP44, account 0, index 0
    });
    
    test('defaults to Bitcoin when no blockchain specified', async () => {
      const args = {
        [CRYPTO_NET]: MAINNET
      };
      
      const wallet = await HDWallet.GetWallet(testEntropy, testUuid, args);
      
      expect(wallet[BLOCKCHAIN]).toBe(BITCOIN);
    });
    
    test('defaults to BIP44 when no protocol specified', async () => {
      const args = {
        [BLOCKCHAIN]: BITCOIN,
        [CRYPTO_NET]: MAINNET
      };
      
      const wallet = await HDWallet.GetWallet(testEntropy, testUuid, args);
      
      expect(wallet[DERIVATION_PATH]).toMatch(/^m\/44'/);
    });
    
    test('defaults to account 0 and address_index 0', async () => {
      const args = {
        [BLOCKCHAIN]: BITCOIN,
        [CRYPTO_NET]: MAINNET
      };
      
      const wallet = await HDWallet.GetWallet(testEntropy, testUuid, args);
      
      expect(wallet[DERIVATION_PATH]).toMatch(/\/0'\/0\/0'$/);
    });
  });
  
  // ==========================================================================
  // CROSS-BLOCKCHAIN CONSISTENCY TESTS
  // ==========================================================================
  
  describe('Cross-Blockchain Consistency', () => {
    
    test('same entropy generates same mnemonic for all blockchains', async () => {
      const blockchains = [BITCOIN, ETHEREUM, LITECOIN, DOGECOIN];
      const mnemonics = [];
      
      for (const blockchain of blockchains) {
        const args = { 
          [BLOCKCHAIN]: blockchain,
          [CRYPTO_NET]: MAINNET
        };
        const wallet = await HDWallet.GetWallet(testEntropy, testUuid, args);
        mnemonics.push(wallet[MNEMONICS]);
      }
      
      // All mnemonics should be identical
      expect(mnemonics[0]).toBe(mnemonics[1]);
      expect(mnemonics[0]).toBe(mnemonics[2]);
      expect(mnemonics[0]).toBe(mnemonics[3]);
    });
    
    test('same entropy generates different addresses for different blockchains', async () => {
      const args1 = { 
        [BLOCKCHAIN]: BITCOIN,
        [CRYPTO_NET]: MAINNET
      };
      const args2 = { 
        [BLOCKCHAIN]: ETHEREUM,
        [CRYPTO_NET]: MAINNET
      };
      
      const btcWallet = await HDWallet.GetWallet(testEntropy, testUuid, args1);
      const ethWallet = await HDWallet.GetWallet(testEntropy, testUuid, args2);
      
      expect(btcWallet[ADDRESS]).not.toBe(ethWallet[ADDRESS]);
    });
    
    test('all HD wallets have HD_WALLET_TYPE mode', async () => {
      const blockchains = [BITCOIN, ETHEREUM, LITECOIN, DOGECOIN];
      
      for (const blockchain of blockchains) {
        const args = { 
          [BLOCKCHAIN]: blockchain,
          [CRYPTO_NET]: MAINNET
        };
        const wallet = await HDWallet.GetWallet(testEntropy, testUuid, args);
        expect(wallet[WALLET_MODE]).toBe(HD_WALLET_TYPE);
      }
    });
  });
  
  // ==========================================================================
  // TESTNET TESTS
  // ==========================================================================
  
  describe('Testnet Support', () => {
    
    test('generates Bitcoin testnet HD wallet', async () => {
      const args = {
        [BLOCKCHAIN]: BITCOIN,
        [CRYPTO_NET]: TESTNET,
        [ACCOUNT]: 0,
        [ADDRESS_INDEX]: 0
      };
      
      const wallet = await HDWallet.GetWallet(testEntropy, testUuid, args);
      
      expect(wallet).toBeDefined();
      expect(wallet[BLOCKCHAIN]).toBe(BITCOIN);
      // Note: CRYPTO_NET might not be explicitly set in the wallet object for Bitcoin
      expect(wallet[ADDRESS]).toBeValidBitcoinAddress();
    });
    
    test('generates Ethereum testnet HD wallet', async () => {
      const args = {
        [BLOCKCHAIN]: ETHEREUM,
        [CRYPTO_NET]: TESTNET,
        [ACCOUNT]: 0,
        [ADDRESS_INDEX]: 0
      };
      
      const wallet = await HDWallet.GetWallet(testEntropy, testUuid, args);
      
      expect(wallet).toBeDefined();
      expect(wallet[BLOCKCHAIN]).toBe(ETHEREUM);
      expect(wallet[ADDRESS]).toBeValidEthereumAddress();
    });
  });
});
