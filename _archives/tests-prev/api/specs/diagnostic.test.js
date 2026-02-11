// tests/api/specs/diagnostic.test.js - À CRÉER
const request = require('supertest');

describe('Diagnostic API - Tests Jest', () => {
  const API_URL = 'http://localhost:3001';
  
  beforeAll(async () => {
    // Vérifie que l'API est en ligne avant tous les tests
    try {
      await request(API_URL).get('/health').timeout(5000);
    } catch (error) {
      throw new Error(`API non disponible sur ${API_URL}. Lance: npm run api`);
    }
  });
  
  test('GET /health retourne status online', async () => {
    const response = await request(API_URL)
      .get('/health')
      .expect(200);
    
    expect(response.body.status).toBe('online');
    expect(response.body).toHaveProperty('timestamp');
  });
  
  test('GET /api/wallet/bitcoin/json génère un wallet valide', async () => {
    const entropy = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    
    const response = await request(API_URL)
      .get(`/api/wallet/bitcoin/json?entropy=${entropy}`)
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({
      address: expect.any(String),
      privateKey: expect.any(String),
      privateKeyWIF: expect.any(String),
      network: 'mainnet',
      blockchain: 'Bitcoin'
    });
    
    // Format P2PKH
    expect(response.body.data.address).toMatch(/^1/);
    expect(response.body.data.privateKeyWIF).toMatch(/^5/);
  });
  
  test('GET /api/wallet/bitcoin/json valide l\'entropie', async () => {
    const response = await request(API_URL)
      .get('/api/wallet/bitcoin/json')
      .expect(200); // Ta API retourne 200 même en erreur
    
    expect(response.body.error).toBeDefined();
    expect(response.body.error).toContain('Missing');
  });
});