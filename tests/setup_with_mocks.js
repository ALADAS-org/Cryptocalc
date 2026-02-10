// tests/setup_with_mocks.js - ANCIEN setup.js avec tous les mocks
console.log('🔧 Setup tests avec www/js/ comme source...');

// Mock le module crypto problématique AVANT tout
jest.mock('crypto', () => {
  const original = jest.requireActual('crypto');
  return {
    ...original,
    // Surcharge si nécessaire
  };
}, { virtual: true });

// Mock @terra-money/feather.js
jest.mock('@terra-money/feather.js', () => ({
  MnemonicKey: jest.fn(() => ({
    accAddress: 'terra1testxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    privateKey: Buffer.from('test')
  }))
}), { virtual: true });

// Mock bip39
jest.mock('bip39', () => ({
  mnemonicToSeedSync: jest.fn().mockReturnValue(Buffer.from('mocked-seed'))
}), { virtual: true });

// Mock elliptique
jest.mock('elliptic', () => ({
  ec: jest.fn().mockReturnValue({
    genKeyPair: jest.fn().mockReturnValue({
      getPrivate: jest.fn().mockReturnValue('mocked-private'),
      getPublic: jest.fn().mockReturnValue('mocked-public')
    })
  })
}), { virtual: true });

// Mock coinkey
jest.mock('coinkey', () => {
  return jest.fn().mockImplementation(() => ({
    privateKey: Buffer.from('mocked'),
    publicAddress: '1MockedAddress1234567890',
    privateKeyHex: 'mockedprivatekeyhex'
  }));
}, { virtual: true });

// Mock des modules spécifiques à ton projet
jest.mock('../../www/js/crypto/SimpleWallet/luna_sw_api.js', () => ({
  GetWallet: jest.fn()
}), { virtual: true });

jest.mock('../../www/js/crypto/SimpleWallet/solana_sw_api.js', () => ({
  GetWallet: jest.fn()
}), { virtual: true });

jest.mock('../../www/js/crypto/SimpleWallet/ton_sw_api.js', () => ({
  GetWallet: jest.fn()
}), { virtual: true });

jest.mock('../../www/js/crypto/SimpleWallet/zen_sw_api.js', () => ({
  GetWallet: jest.fn()
}), { virtual: true });

// Mock des autres dépendances problématiques
jest.mock('@mysten/sui', () => ({
  // Mock Sui SDK
}), { virtual: true });

jest.mock('@solana/web3.js', () => ({
  // Mock Solana
}), { virtual: true });

jest.mock('tweetnacl', () => ({
  // Mock tweetnacl
}), { virtual: true });

// Défini global pour Electron si nécessaire
if (typeof window === 'undefined') {
  global.window = { require: require };
}

console.log('✅ Tous les mocks sont configurés');