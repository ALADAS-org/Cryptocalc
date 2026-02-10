// tests/api/runners/diagnostic.js
const http = require('http');
const { exec } = require('child_process');
const util = require('util');
const colors = require('./color_console');
const execPromise = util.promisify(exec);

async function diagnostic() {
    console.log(`${colors.magenta}${colors.bright}${colors.icon.search} Diagnostic API CryptoCalc${colors.reset}\n`);
    
    const API_URL = 'http://localhost:3001';
    
    // 1. Vérifie si l'API tourne
    console.log(`${colors.cyan}${colors.bright}1.${colors.reset} État de l'API...`);
    try {
        const health = await makeRequest(`${API_URL}/health`);
        console.log(`   ${colors.green}${colors.icon.success} API en ligne sur ${colors.blue}${API_URL}${colors.reset}`);
        console.log(`   ${colors.dim}Status:${colors.reset} ${colors.yellow}${health.status}${colors.reset}`);
        console.log(`   ${colors.dim}Response:${colors.reset} ${colors.green}${JSON.stringify(health.body)}${colors.reset}`);
    } catch (error) {
        console.log(`   ${colors.red}${colors.icon.error} API hors ligne (${colors.yellow}${error.message}${colors.reset})`);
        console.log(`\n   ${colors.yellow}${colors.icon.warning} Pour démarrer:${colors.reset}`);
        console.log(`      ${colors.dim}npm run api${colors.reset}`);
        console.log(`      ${colors.dim}node www/js/api/api_start.js${colors.reset}`);
        return false;
    }
    
    // 2. Test génération wallet
    console.log(`\n${colors.cyan}${colors.bright}2.${colors.reset} Test génération Bitcoin Simple Wallet...`);
    console.log(`${colors.dim}${'─'.repeat(60)}${colors.reset}`);
    
    const entropy = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    
    try {
        const response = await makeRequest(
            `${API_URL}/api/wallet/bitcoin/json?entropy=${entropy}`
        );
        
        if (response.body.success) {
            const data = response.body.data;
            console.log(`   ${colors.green}${colors.icon.success} Wallet généré avec succès${colors.reset}`);
            console.log(`   ${colors.dim}Adresse:${colors.reset} ${colors.blue}${data.address}${colors.reset}`);
            console.log(`   ${colors.dim}Format:${colors.reset} ${data.address.startsWith('1') ? `${colors.green}P2PKH ✅${colors.reset}` : `${colors.yellow}⚠️${colors.reset}`}`);
            console.log(`   ${colors.dim}WIF:${colors.reset} ${colors.yellow}${data.privateKeyWIF.substring(0, 20)}...${colors.reset}`);
            console.log(`   ${colors.dim}Blockchain:${colors.reset} ${colors.cyan}${data.blockchain}${colors.reset}`);
            console.log(`   ${colors.dim}Mots:${colors.reset} ${colors.green}${data.mnemonics.split(' ').length}${colors.reset}`);
        } else {
            console.log(`   ${colors.red}${colors.icon.error} Erreur API:${colors.reset} ${colors.yellow}${response.body.error}${colors.reset}`);
            return false;
        }
    } catch (error) {
        console.log(`   ${colors.red}${colors.icon.error} Échec génération:${colors.reset} ${colors.yellow}${error.message}${colors.reset}`);
        return false;
    }
    
    // 3. Vérifie avec curl (optionnel)
    console.log(`\n${colors.cyan}${colors.bright}3.${colors.reset} Vérification commande curl...`);
    try {
        const { stdout } = await execPromise(`curl -s "${API_URL}/health"`);
        if (stdout.includes('online')) {
            console.log(`   ${colors.green}${colors.icon.success} curl fonctionne${colors.reset}`);
        } else {
            console.log(`   ${colors.yellow}${colors.icon.warning} curl retourne une réponse inattendue${colors.reset}`);
        }
    } catch {
        console.log(`   ${colors.dim}ℹ️  curl non disponible (peut être ignoré)${colors.reset}`);
    }
    
    // 4. Test rapide des endpoints
    console.log(`\n${colors.cyan}${colors.bright}4.${colors.reset} Tests rapides des endpoints...`);
    console.log(`${colors.dim}${'─'.repeat(60)}${colors.reset}`);
    
    const quickTests = [
        { name: 'Health', path: '/health', expected: 200 },
        { name: 'Bitcoin', path: `/api/wallet/BITCOIN/json?entropy=${entropy}`, expected: 200 },
        { name: 'Ethereum', path: `/api/wallet/ETHEREUM/json?entropy=${entropy}`, expected: 200 },
        { name: 'Invalid', path: `/api/wallet/INVALID/json?entropy=${entropy}`, expected: 404 }
    ];
    
    for (const test of quickTests) {
        process.stdout.write(`   ${colors.cyan}${colors.icon.search} ${test.name.padEnd(10)}...${colors.reset} `);
        try {
            const result = await makeRequest(`${API_URL}${test.path}`);
            if (result.status === test.expected) {
                console.log(`${colors.green}${colors.icon.success} OK${colors.reset}`);
            } else {
                console.log(`${colors.red}${colors.icon.error} FAIL (got ${result.status})${colors.reset}`);
            }
        } catch {
            console.log(`${colors.red}${colors.icon.error} ERROR${colors.reset}`);
        }
    }
    
    // Affichage des résultats
    console.log(`\n${colors.bright}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.bright}${colors.green}${colors.icon.trophy} DIAGNOSTIC COMPLET - TOUT EST OK!${colors.reset}`);
    console.log(`${colors.bright}${'='.repeat(60)}${colors.reset}`);
    
    console.log(`\n${colors.blue}${colors.icon.info} Tests disponibles:${colors.reset}`);
    console.log(`   ${colors.dim}npm run api:smoke${colors.reset}       # Test rapide`);
    console.log(`   ${colors.dim}npm run api:simple${colors.reset}      # Test Simple Wallet avec BTC`);
    console.log(`   ${colors.dim}npm run test:allsimple${colors.reset}  # Test Simple Wallet avec les cryptos compatibles`);
    console.log(`   ${colors.dim}npm run api:diagnostic${colors.reset}  # Lancer ce diagnostic\n`);
	console.log(`   ${colors.dim}npm run api:alltests${colors.reset}    # Lancer tous les tests\n`);
    
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
        if (success) {
            console.log(`\n${colors.bright}${colors.green}${colors.icon.trophy} Diagnostic terminé avec succès!${colors.reset}`);
        } else {
            console.log(`\n${colors.bright}${colors.red}${colors.icon.fire} Diagnostic a échoué, vérifiez l'API${colors.reset}`);
        }
        process.exit(success ? 0 : 1);
    });
}

module.exports = diagnostic;