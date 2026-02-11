// tests/unit/core/constants.test.js
// Teste seulement les constantes (pas de dépendances)

const { BITCOIN, ETHEREUM }    = require('../../../www/js/crypto/const_blockchains.js');
const { PRIVATE_KEY, ADDRESS } = require('../../../www/js/crypto/const_wallet.js');

describe('Constantes CryptoCalc', () => {
  test('const_blockchains devrait exister', () => {
    expect(BITCOIN).toBe('Bitcoin');
    expect(ETHEREUM).toBe('Ethereum');
  });
  
  test('const_wallet devrait exister', () => {
    expect(PRIVATE_KEY).toBe('Private Key');
    expect(ADDRESS).toBe('Wallet Address');
  });
});