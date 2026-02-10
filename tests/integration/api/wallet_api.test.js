// tests/integration/api/wallet_api.test.js
const request = require('supertest');
const path    = require('path');

// Mock les modules problématiques AVANT d'importer quoi que ce soit
jest.mock('../../../../www/js/crypto/SimpleWallet/luna_sw_api.js', () => ({
  GetWallet: jest.fn()
}), { virtual: true });

jest.mock('../../../../www/js/crypto/SimpleWallet/solana_sw_api.js', () => ({
  GetWallet: jest.fn()
}), { virtual: true });

jest.mock('../../../../www/js/crypto/SimpleWallet/ton_sw_api.js', () => ({
  GetWallet: jest.fn()
}), { virtual: true });

jest.mock('../../../../www/js/crypto/SimpleWallet/zen_sw_api.js', () => ({
  GetWallet: jest.fn()
}), { virtual: true });

describe('CryptoCalc API - Tests avec vrais chemins', () => {
  let app;
  
  beforeAll(() => {
    // Crée app Express
    const express = require('express');
    app = express();
    app.use(express.json());
    
    // Importe TES vraies routes API
    // Elles seront automatiquement mockées grâce aux mocks ci-dessus
    const wallet_router = require('../../../www/js/api/routes/wallet.js');
    app.use('/api/wallet', wallet_router);
    
    // Route santé
    app.get('/health', (req, res) => {
      res.json({ 
        status: 'online',
        source: 'www/js/',
        timestamp: new Date().toISOString()
      });
    });
  });
  
  test('GET /health devrait fonctionner', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body.status).toBe('online');
    expect(response.body.source).toBe('www/js/');
  });
  
  test('POST /api/wallet/bitcoin/mock devrait fonctionner', async () => {
    const response = await request(app)
      .post('/api/wallet/bitcoin/mock')
      .send({ entropy: 'test' })
      .expect(200);
    
    expect(response.body.mode).toBe('mock');
  });
});