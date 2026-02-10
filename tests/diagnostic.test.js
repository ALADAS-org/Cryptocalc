// tests/diagnostic.test.js - À exécuter AVEC Jest
const request = require('supertest');

describe('Diagnostic API CryptoCalc', () => {
  const API_URL = 'http://localhost:3001';
  
  test('1. L\'API devrait être en ligne', async () => {
    console.log('🔍 Vérification de l\'API sur', API_URL);
    
    try {
      const response = await request(API_URL)
        .get('/health')
        .timeout(5000);
      
      console.log('✅ API accessible');
      console.log('Status:', response.status);
      console.log('Body:', JSON.stringify(response.body, null, 2));
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('online');
      
    } catch (error) {
      console.error('❌ API non accessible');
      console.error('Erreur:', error.message);
      
      // Instructions de dépannage
      console.log('\n🔧 DÉPANNAGE:');
      console.log('1. Lance l\'API dans un autre terminal:');
      console.log('   npm run api');
      console.log('   OU');
      console.log('   node api-start.js');
      console.log('');
      console.log('2. Vérifie que le port 3001 est libre:');
      console.log('   netstat -an | findstr :3001  # Windows');
      console.log('   lsof -i :3001                # Mac/Linux');
      console.log('');
      console.log('3. Vérifie les logs de l\'API');
      
      // Force l'échec du test avec message utile
      throw new Error(`API non accessible sur ${API_URL}. Voir instructions ci-dessus.`);
    }
  }, 10000); // Timeout de 10s
  
  test('2. Test de génération de wallet', async () => {
    const entropy = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    
    console.log(`\n🧪 Test wallet avec entropie: ${entropy.substring(0, 16)}...`);
    
    try {
      const response = await request(API_URL)
        .get(`/api/wallet/bitcoin/json?entropy=${entropy}`)
        .timeout(10000);
      
      console.log('✅ Wallet généré avec succès');
      console.log('Status:', response.status);
      console.log('Adresse:', response.body.data?.address);
      console.log('WIF (début):', response.body.data?.privateKeyWIF?.substring(0, 16) + '...');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.address).toBeDefined();
      
    } catch (error) {
      console.error('❌ Erreur génération wallet:', error.message);
      throw error;
    }
  }, 15000);
});