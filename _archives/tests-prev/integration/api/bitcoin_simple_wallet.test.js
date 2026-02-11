// tests/integration/api/bitcoin_simple_wallet.test.js - Version CORRIGÉE
const request = require('supertest');

// IMPORTANT: On teste l'API RÉELLE, pas un serveur mocké
const API_BASE = 'http://localhost:3001';

// Vérifie d'abord que l'API est en ligne
beforeAll(async () => {
  try {
    const healthCheck = await request(API_BASE)
      .get('/health')
      .timeout(5000);
    
    if (healthCheck.body.status !== 'online') {
      throw new Error('API not online');
    }
    
    console.log('✅ API détectée sur', API_BASE);
  } catch (error) {
    console.error('❌ API non disponible sur', API_BASE);
    console.error('   Lance l\'API avec: npm run api');
    throw error;
  }
}, 10000); // Timeout de 10s pour le beforeAll

describe('CryptoCalc Bitcoin Simple Wallet API - TESTS RÉELS', () => {
  describe('Format Simple Wallet (non-hiérarchique)', () => {
    test('GET /api/wallet/bitcoin/json devrait générer un Simple Wallet P2PKH', async () => {
      const entropy = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
      
      console.log(`\n📡 Test avec entropie: ${entropy.substring(0, 16)}...`);
      
      const response = await request(API_BASE)
        .get(`/api/wallet/bitcoin/json?entropy=${entropy}`)
        .timeout(10000); // Timeout plus long
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      const { data } = response.body;
      
      // VÉRIFICATIONS SPÉCIFIQUES AU SIMPLE WALLET
      console.log('📝 Simple Wallet généré:');
      console.log(`   Adresse: ${data.address}`);
      console.log(`   Clé privée (hex): ${data.privateKey.substring(0, 16)}...`);
      console.log(`   WIF: ${data.privateKeyWIF.substring(0, 16)}...`);
      
      // 1. Adresse DOIT commencer par '1' (P2PKH legacy)
      expect(data.address).toMatch(/^1/);
      expect(data.address).not.toMatch(/^3/); // Pas P2SH
      expect(data.address).not.toMatch(/^bc1/); // Pas SegWit
      
      // 2. WIF DOIT commencer par '5' (mainnet, non-compressed)
      // ou 'L'/'K' pour compressed, mais Simple Wallet souvent '5'
      expect(data.privateKeyWIF).toMatch(/^5/);
      
      // 3. Pas de derivation path (Simple Wallet)
      expect(data).not.toHaveProperty('derivationPath');
      expect(data).not.toHaveProperty('xpub');
      expect(data).not.toHaveProperty('xpriv');
      
      // 4. Mnemonics présents mais pas d'arbre HD
      expect(data.mnemonics).toBeDefined();
      expect(data.mnemonics.split(' ').length).toBe(24); // 256 bits
    }, 15000); // Timeout de 15s pour ce test
    
    test('Simple Wallet = déterministe depuis entropie', async () => {
      const entropy = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
      
      console.log(`\n🔁 Test déterministe avec: ${entropy.substring(0, 16)}...`);
      
      const response1 = await request(API_BASE)
        .get(`/api/wallet/bitcoin/json?entropy=${entropy}`);
      
      const response2 = await request(API_BASE)
        .get(`/api/wallet/bitcoin/json?entropy=${entropy}`);
      
      // Même entropie = même Simple Wallet
      expect(response1.body.data.privateKey).toBe(response2.body.data.privateKey);
      expect(response1.body.data.address).toBe(response2.body.data.address);
      
      console.log(`✅ Déterministe: ${response1.body.data.address}`);
    }, 15000);
  });
});