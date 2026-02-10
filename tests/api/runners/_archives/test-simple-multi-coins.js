// uuid: a1b2c3d4-e5f6-4a5b-bc6d-7e8f9a0b1c2d
// tests/api/runners/test-simple-multi-coins.js

const http = require('http');

/**
 * Test la génération de wallets pour la liste restreinte de cryptomonnaies
 */
async function testSimpleMultiCoins() {
    console.log('🧪 Test Simple Multi-Coins (Affichage WIF/PK adaptatif)\n');
    
    const API_URL = 'http://localhost:3001';
    const entropy = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    
    const coins = [
        'BITCOIN', 'ETHEREUM', 'DOGECOIN', 'LiteCoin', 
        'Solana', 'Avalanche', 'Polygon', 'TonCoin', 'Terra'
    ];
    
    let allPassed = true;
    
    for (const coin of coins) {
        process.stdout.write(`▶️  Testing ${coin.padEnd(12)}... `);
        
        try {
            const url = `${API_URL}/api/wallet/${coin}/json?entropy=${entropy}`;
            const response = await makeRequest(url);
            
            if (response.body.success) {
                const data = response.body.data;
                const addrPrefix = data.address ? data.address.substring(0, 10) : 'N/A';
                
                // Logique de repli : Priorité au WIF, sinon clé privée tronquée
                const secretDisplay = data.privateKeyWIF 
                    ? `WIF: ${data.privateKeyWIF.substring(0, 8)}...` 
                    : `PK: ${data.privateKey.substring(0, 8)}...`;

                console.log(`✅ OK [Addr: ${addrPrefix}... | ${secretDisplay}]`);
            } else {
                console.log(`❌ Erreur: ${response.body.error}`);
                allPassed = false;
            } // end if success
        } catch (error) {
            console.log(`❌ Échec: ${error.message}`);
            allPassed = false;
        } // end try-catch
    } // end for coins
    
    console.log('\n' + '='.repeat(60));
    if (allPassed) {
        console.log('🎉 TOUS LES TESTS MULTI-COINS ONT RÉUSSIS !');
    } else {
        console.log('💥 CERTAINS TESTS ONT ÉCHOUÉ');
    } // end final check
    console.log('='.repeat(60));
    
    return allPassed;
} // end testSimpleMultiCoins block

/**
 * Utilitaire pour effectuer des requêtes HTTP vers l'API
 */
function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        body: JSON.parse(data)
                    });
                } catch (e) {
                    reject(new Error(`Réponse non-JSON reçue`));
                } // end try-catch JSON
            }); // end res.on end
        }); // end http.get
        
        req.on('error', reject);
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Timeout API (10s)'));
        }); // end timeout block
    }); // end Promise block
} // end makeRequest block

if (require.main === module) {
    testSimpleMultiCoins().then(success => {
        process.exit(success ? 0 : 1);
    });
} // end main execution check block

module.exports = testSimpleMultiCoins;