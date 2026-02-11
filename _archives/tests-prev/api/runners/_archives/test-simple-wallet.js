// tests/api/runners/test-simple-wallet.js - SCRIPT NODE.JS
const http = require('http');

async function testSimpleWallet() {
    console.log('🧪 Test Simple Wallet Bitcoin P2PKH\n');
    
    const API_URL = 'http://localhost:3001';
    
    const tests = [
        {
            name: 'Format P2PKH (commence par 1)',
            entropy: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            validate: (data) => {
                if (!data.address.startsWith('1')) {
                    throw new Error(`Adresse: ${data.address} (doit commencer par 1)`);
                }
                return true;
            }
        },
        {
            name: 'WIF format (commence par 5, longueur 51)',
            entropy: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
            validate: (data) => {
                if (!data.privateKeyWIF.startsWith('5')) {
                    throw new Error(`WIF: ${data.privateKeyWIF.substring(0, 20)}... (doit commencer par 5)`);
                }
                if (data.privateKeyWIF.length !== 51) {
                    throw new Error(`WIF longueur: ${data.privateKeyWIF.length} (doit être 51)`);
                }
                return true;
            }
        }
    ];
    
    let allPassed = true;
    
    for (const test of tests) {
        console.log(`▶️  ${test.name}`);
        console.log('─'.repeat(40));
        
        try {
            const response = await makeRequest(
                `${API_URL}/api/wallet/bitcoin/json?entropy=${test.entropy}`
            );
            
            if (response.body.success) {
                const data = response.body.data;
                
                console.log(`   Adresse: ${data.address}`);
                console.log(`   WIF: ${data.privateKeyWIF.substring(0, 20)}...`);
                console.log(`   Mnemonics: ${data.mnemonics.split(' ').slice(0, 3).join(' ')}...`);
                
                // Validation
                await test.validate(data);
                
                console.log(`   ✅ PASSÉ\n`);
            } else {
                console.log(`   ❌ Erreur API: ${response.body.error}\n`);
                allPassed = false;
            }
        } catch (error) {
            console.log(`   ❌ ${error.message}\n`);
            allPassed = false;
        }
    }
    
    // Test déterministe
    console.log(`🔁 Test déterministe`);
    console.log('─'.repeat(40));
    
    try {
        const entropy = 'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc';
        const response1 = await makeRequest(`${API_URL}/api/wallet/bitcoin/json?entropy=${entropy}`);
        const response2 = await makeRequest(`${API_URL}/api/wallet/bitcoin/json?entropy=${entropy}`);
        
        if (response1.body.data.privateKey === response2.body.data.privateKey &&
            response1.body.data.address === response2.body.data.address) {
            console.log(`   ✅ Déterministe: ${response1.body.data.address}\n`);
        } else {
            console.log(`   ❌ Non déterministe!\n`);
            allPassed = false;
        }
    } catch (error) {
        console.log(`   ❌ ${error.message}\n`);
        allPassed = false;
    }
    
    console.log('='.repeat(50));
    if (allPassed) {
        console.log('🎉 TOUS LES TESTS SIMPLE WALLET PASSÉS!');
    } else {
        console.log('💥 CERTAINS TESTS ONT ÉCHOUÉ');
    }
    console.log('='.repeat(50));
    
    return allPassed;
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
                        body: JSON.parse(data)
                    });
                } catch (e) {
                    reject(new Error(`Réponse non-JSON: ${data.substring(0, 100)}`));
                }
            });
        });
        
        req.on('error', reject);
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Timeout 10s'));
        });
        
        req.end();
    });
}

if (require.main === module) {
    testSimpleWallet().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = testSimpleWallet;