// tests/unit/core/crypto_services.test.js
const { CryptoServices } = require('../../../www/js/crypto/crypto_services.js');

describe('CryptoServices - Tests unitaires', () => {
  test('getUUID() devrait générer un UUID valide', () => {
    const uuid = CryptoServices.This.getUUID();
    
    expect(uuid).toBeDefined();
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });
  
  test('pk2WIF() devrait convertir une clé privée en WIF', () => {
    const privateKey = '1a2b3c4d5e6f7890a1b2c3d4e5f678901234567890abcdef1234567890abcdef';
    
    const wif = CryptoServices.This.pk2WIF(privateKey);
    
    expect(wif).toBeDefined();
    expect(wif).toMatch(/^[5KL][1-9A-HJ-NP-Za-km-z]{50,51}$/);
  });
  
  test('pk2WIF() devrait gérer différentes clés', () => {
    const testKeys = [
      '0000000000000000000000000000000000000000000000000000000000000001',
      'fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364140'
    ];
    
    testKeys.forEach(privateKey => {
      const wif = CryptoServices.This.pk2WIF(privateKey);
      expect(wif).toMatch(/^[5KL][1-9A-HJ-NP-Za-km-z]{50,51}$/);
    });
  });
});