// check-api.js - À la RACINE du projet - Exécutable avec Node seul
const http = require('http');

async function checkAPI() {
  const API_URL = 'http://localhost:3001';
  
  console.log('🔍 Diagnostic API CryptoCalc\n');
  console.log('URL:', API_URL);
  console.log('─'.repeat(50));
  
  // 1. Vérifie la santé
  console.log('1. Vérification santé...');
  try {
    const health = await makeRequest(`${API_URL}/health`);
    console.log('   ✅ Santé OK');
    console.log('   Status:', health.status);
    console.log('   Response:', JSON.stringify(health.body, null, 2));
  } catch (error) {
    console.log('   ❌ Santé ÉCHEC');
    console.log('   Erreur:', error.message);
    console.log('\n🔧 L\'API ne tourne pas. Lance-la avec:');
    console.log('   _run_api_server.bat');
    return false;
  }
  
  // 2. Test génération wallet
  console.log('\n2. Test génération wallet...');
  const entropy = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
  
  try {
    const wallet = await makeRequest(
      `${API_URL}/api/wallet/bitcoin/json?entropy=${entropy}`
    );
    
    console.log('   ✅ Wallet généré');
    console.log('   Status:', wallet.status);
    
    if (wallet.body.success) {
      const data = wallet.body.data;
      console.log('   Adresse:', data.address);
      console.log('   WIF:', data.privateKeyWIF.substring(0, 20) + '...');
      console.log('   Blockchain:', data.blockchain);
      console.log('   Network:', data.network);
    } else {
      console.log('   Erreur API:', wallet.body.error);
    }
    
  } catch (error) {
    console.log('   ❌ Génération wallet ÉCHEC');
    console.log('   Erreur:', error.message);
    return false;
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🎉 API CryptoCalc fonctionne correctement!');
  console.log('\n📝 Test manuel:');
  console.log(`   curl "${API_URL}/api/wallet/bitcoin/json?entropy=${entropy}"`);
  
  return true;
}

// Fonction helper pour faire des requêtes HTTP
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            body: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: data
          });
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Timeout après 5s'));
    });
    
    req.end();
  });
}

// Exécute si appelé directement
if (require.main === module) {
  checkAPI().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Erreur inattendue:', error);
    process.exit(1);
  });
}

module.exports = { checkAPI };