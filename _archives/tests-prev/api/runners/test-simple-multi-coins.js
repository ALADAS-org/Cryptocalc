// uuid: a1b2c3d4-e5f6-4a5b-bc6d-7e8f9a0b1c2d
// tests/api/runners/test-simple-multi-coins.js

const http = require('http');
const colors = require('./color_console');

/**
 * Test la génération de wallets pour la liste restreinte de cryptomonnaies
 */
async function testSimpleMultiCoins() {
    console.log(`${colors.magenta}${colors.bright}${colors.icon.test} Test Simple Multi-Coins (Affichage WIF/PK adaptatif)${colors.reset}\n`);
    
    const API_URL = 'http://localhost:3001';
    const entropy = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    
    const coins = [
        'BITCOIN', 'ETHEREUM', 'DOGECOIN', 'LiteCoin', 
        'Solana', 'Avalanche', 'Polygon', 'TonCoin', 'Terra'
    ];
    
    let allPassed = true;
    let passedCount = 0;
    
    console.log(`${colors.cyan}${colors.bright}${colors.icon.arrow} Test des ${coins.length} cryptomonnaies supportées${colors.reset}`);
    console.log(`${colors.dim}${'─'.repeat(60)}${colors.reset}`);
    
    for (const coin of coins) {
        process.stdout.write(`${colors.cyan}${colors.icon.search}${colors.reset} Testing ${colors.bright}${coin.padEnd(12)}${colors.reset}... `);
        
        try {
            const url = `${API_URL}/api/wallet/${coin}/json?entropy=${entropy}`;
            const response = await makeRequest(url);
            
            if (response.body.success) {
                const data = response.body.data;
                const addrPrefix = data.address ? data.address.substring(0, 10) : 'N/A';
                
                // Logique de repli : Priorité au WIF, sinon clé privée tronquée
                const secretDisplay = data.privateKeyWIF 
                    ? `${colors.dim}WIF:${colors.reset} ${colors.yellow}${data.privateKeyWIF.substring(0, 8)}...${colors.reset}` 
                    : `${colors.dim}PK:${colors.reset} ${colors.yellow}${data.privateKey.substring(0, 8)}...${colors.reset}`;

                console.log(`${colors.green}${colors.icon.success} OK${colors.reset} [${colors.dim}Addr:${colors.reset} ${colors.blue}${addrPrefix}...${colors.reset} | ${secretDisplay}]`);
                passedCount++;
            } else {
                console.log(`${colors.red}${colors.icon.error} Erreur:${colors.reset} ${colors.yellow}${response.body.error}${colors.reset}`);
                allPassed = false;
            } // end if success
        } catch (error) {
            console.log(`${colors.red}${colors.icon.error} Échec:${colors.reset} ${colors.yellow}${error.message}${colors.reset}`);
            allPassed = false;
        } // end try-catch
    } // end for coins
    
    // Affichage des résultats finaux
    colors.showResults(passedCount, coins.length);
    
    console.log(`${colors.bright}${'='.repeat(60)}${colors.reset}`);
    if (allPassed) {
        console.log(`${colors.bright}${colors.green}${colors.icon.trophy} TOUS LES TESTS MULTI-COINS ONT RÉUSSIS !${colors.reset}`);
    } else {
        console.log(`${colors.bright}${colors.red}${colors.icon.fire} CERTAINS TESTS ONT ÉCHOUÉ${colors.reset}`);
    } // end final check
    console.log(`${colors.bright}${'='.repeat(60)}${colors.reset}`);
    
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