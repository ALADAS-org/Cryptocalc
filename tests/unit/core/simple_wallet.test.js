// tests/unit/core/simple_wallet.test.js
const request = require('supertest');
const path = require('path');

const { SimpleWallet } = require('../../../www/js/crypto/SimpleWallet/simple_wallet.js');
const { BITCOIN }      = require('../../../www/js/crypto/const_blockchains.js');
const { PRIVATE_KEY }  = require('../../../www/js/crypto/const_wallet.js');

// tests/unit/core/simple_wallet.test.js
// Mock TOUTES les dépendances problématiques d'abord

jest.mock('../../../www/js/crypto/SimpleWallet/luna_sw_api.js', () => ({
  GetWallet: jest.fn()
}));

jest.mock('../../../www/js/crypto/SimpleWallet/solana_sw_api.js', () => ({
  GetWallet: jest.fn()
}));

jest.mock('../../../www/js/crypto/SimpleWallet/ton_sw_api.js', () => ({
  GetWallet: jest.fn()
}));

jest.mock('../../../www/js/crypto/SimpleWallet/zen_sw_api.js', () => ({
  GetWallet: jest.fn()
}));

jest.mock('@terra-money/feather.js', () => ({
  MnemonicKey: jest.fn()
}));

// Mock elliptique
jest.mock('elliptic', () => {
  return {
    ec: jest.fn().mockReturnValue({
      genKeyPair: jest.fn().mockReturnValue({
        getPrivate: jest.fn().mockReturnValue('mocked-private-key'),
        getPublic: jest.fn().mockReturnValue('mocked-public-key')
      })
    })
  };
});

// Mock bip39
jest.mock('bip39', () => ({
  mnemonicToSeedSync: jest.fn().mockReturnValue(Buffer.from('mocked-seed'))
}));

// Mock coinkey
jest.mock('coinkey', () => {
  return jest.fn().mockImplementation(() => ({
    privateKey: Buffer.from('mocked'),
    publicAddress: '1MockedAddress1234567890'
  }));
});


describe('SimpleWallet depuis www/js/', () => {
  test('devrait exister', () => {
    expect(SimpleWallet).toBeDefined();
    expect(typeof SimpleWallet.GetWallet).toBe('function');
  });
  
  test('InitializeWallet devrait créer un objet null', () => {
    const nullWallet = SimpleWallet.InitializeWallet();
    
    expect(nullWallet).toBeInstanceOf(Object);
    expect(nullWallet.BLOCKCHAIN).toBeDefined();
    expect(nullWallet.ADDRESS).toBeDefined();
  });
  
  test('GenerateKeyPairFromMnemonic avec mocks', () => {
    // Arrange
    const testMnemonics = 'test test test';
    
    // Act
    const result = SimpleWallet.GenerateKeyPairFromMnemonic(testMnemonics);
    
    // Assert
    expect(result).toHaveProperty('privateKey');
    expect(result).toHaveProperty('publicKey');
    expect(result.privateKey).toBe('mocked-private-key');
  });
});