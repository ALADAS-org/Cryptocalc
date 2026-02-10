// tests/api/runners/test-simple-wallet.js - SCRIPT NODE.JS
const http = require('http');
const colors = require('./color_console');

async function testSimpleWallet() {
    console.log(`${colors.magenta}${colors.bright}${colors.icon.test} Test Simple Wallet Bitcoin P2PKH${colors.reset}\n`);
    
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
    let passedCount = 0;
    const totalTests = tests.length + 1; // +1 pour le test déterministe
    
    for (const test of tests) {
        console.log(`${colors.cyan}${colors.bright}${colors.icon.arrow}${colors.reset}  ${colors.bright}${test.name}${colors.reset}`);
        console.log(`${colors.dim}─${colors.reset}`.repeat(40));
        
        try {
            const response = await makeRequest(
                `${API_URL}/api/wallet/bitcoin/json?entropy=${test.entropy}`
            );
            
            if (response.body.success) {
                const data = response.body.data;
                
                console.log(`   ${colors.dim}Adresse:${colors.reset} ${colors.blue}${data.address}${colors.reset}`);
                console.log(`   ${colors.dim}WIF:${colors.reset} ${colors.yellow}${data.privateKeyWIF.substring(0, 20)}...${colors.reset}`);
                console.log(`   ${colors.dim}Mnemonics:${colors.reset} ${colors.green}${data.mnemonics.split(' ').slice(0, 3).join(' ')}...${colors.reset}`);
                
                // Validation
                await test.validate(data);
                
                console.log(`   ${colors.green}${colors.icon.success} PASSÉ${colors.reset}\n`);
                passedCount++;
            } else {
                console.log(`   ${colors.red}${colors.icon.error} Erreur API:${colors.reset} ${colors.yellow}${response.body.error}${colors.reset}\n`);
                allPassed = false;
            }
        } catch (error) {
            console.log(`   ${colors.red}${colors.icon.error}${colors.reset} ${colors.yellow}${error.message}${colors.reset}\n`);
            allPassed = false;
        }
    }
    
    // Test déterministe
    console.log(`${colors.cyan}${colors.bright}${colors.icon.repeat} Test déterministe${colors.reset}`);
    console.log(`${colors.dim}─${colors.reset}`.repeat(40));
    
    try {
        const entropy = 'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc';
        const response1 = await makeRequest(`${API_URL}/api/wallet/bitcoin/json?entropy=${entropy}`);
        const response2 = await makeRequest(`${API_URL}/api/wallet/bitcoin/json?entropy=${entropy}`);
        
        if (response1.body.data.privateKey === response2.body.data.privateKey &&
            response1.body.data.address === response2.body.data.address) {
            console.log(`   ${colors.green}${colors.icon.success} Déterministe:${colors.reset} ${colors.blue}${response1.body.data.address}${colors.reset}\n`);
            passedCount++;
        } else {
            console.log(`   ${colors.red}${colors.icon.error} Non déterministe!${colors.reset}\n`);
            allPassed = false;
        }
    } catch (error) {
        console.log(`   ${colors.red}${colors.icon.error}${colors.reset} ${colors.yellow}${error.message}${colors.reset}\n`);
        allPassed = false;
    }
    
    // Affichage des résultats finaux
    colors.showResults(passedCount, totalTests);
    
    console.log(`${colors.bright}${'='.repeat(50)}${colors.reset}`);
    if (allPassed) {
        console.log(`${colors.bright}${colors.green}${colors.icon.trophy} TOUS LES TESTS SIMPLE WALLET PASSÉS!${colors.reset}`);
    } else {
        console.log(`${colors.bright}${colors.red}${colors.icon.fire} CERTAINS TESTS ONT ÉCHOUÉ${colors.reset}`);
    }
    console.log(`${colors.bright}${'='.repeat(50)}${colors.reset}`);
    
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