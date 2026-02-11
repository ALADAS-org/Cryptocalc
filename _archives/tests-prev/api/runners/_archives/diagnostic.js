// tests/api/runners/diagnostic.js
const http = require('http');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function diagnostic() {
    console.log('🩺 Diagnostic API CryptoCalc\n');
    
    const API_URL = 'http://localhost:3001';
    
    // 1. Vérifie si l'API tourne
    console.log('1. État de l\'API...');
    try {
        const health = await makeRequest(`${API_URL}/health`);
        console.log(`   ✅ API en ligne sur ${API_URL}`);
        console.log(`   Status: ${health.status}`);
        console.log(`   Response: ${JSON.stringify(health.body)}`);
    } catch (error) {
        console.log(`   ❌ API hors ligne (${error.message})`);
        console.log('\n   🔧 Pour démarrer:');
        console.log('      npm run api');
        console.log('      node www/js/api/api_start.js');
        return false;
    }
    
    // 2. Test génération wallet
    console.log('\n2. Test génération Bitcoin Simple Wallet...');
    const entropy = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    
    try {
        const response = await makeRequest(
            `${API_URL}/api/wallet/bitcoin/json?entropy=${entropy}`
        );
        
        if (response.body.success) {
            const data = response.body.data;
            console.log('   ✅ Wallet généré avec succès');
            console.log(`   Adresse: ${data.address}`);
            console.log(`   Format: ${data.address.startsWith('1') ? 'P2PKH ✅' : '⚠️'}`);
            console.log(`   WIF: ${data.privateKeyWIF.substring(0, 20)}...`);
            console.log(`   Blockchain: ${data.blockchain}`);
            console.log(`   Mots: ${data.mnemonics.split(' ').length}`);
        } else {
            console.log('   ❌ Erreur API:', response.body.error);
            return false;
        }
    } catch (error) {
        console.log('   ❌ Échec génération:', error.message);
        return false;
    }
    
    // 3. Vérifie avec curl (optionnel)
    console.log('\n3. Vérification commande curl...');
    try {
        const { stdout } = await execPromise(`curl -s "${API_URL}/health"`);
        if (stdout.includes('online')) {
            console.log('   ✅ curl fonctionne');
        }
    } catch {
        console.log('   ℹ️  curl non disponible (peut être ignoré)');
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ DIAGNOSTIC COMPLET - TOUT EST OK!');
    console.log('='.repeat(50));
    
    console.log('\n📋 Tests disponibles:');
    console.log('   npm run api:smoke       # Test rapide');
    console.log('   npm run api:simple      # Test Simple Wallet avec BTC');
    console.log('   npm run test:allsimple  # Test Simple Wallet avec les cryptos compatibles\n');
    
    return true;
}

function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const req = http.request(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        body: data ? JSON.parse(data) : {}
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
            reject(new Error('Timeout 5s'));
        });
        
        req.end();
    });
}

if (require.main === module) {
    diagnostic().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = diagnostic;