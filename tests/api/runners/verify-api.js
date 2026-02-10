// tests/api/runners/verify-api.js
const fs = require('fs');
const path = require('path');
const colors = require('./color_console');

async function verifyAPI() {
    console.log(`${colors.magenta}${colors.bright}${colors.icon.search} Vérification API CryptoCalc${colors.reset}\n`);
    
    const projectRoot = process.cwd();
    
    // 1. Vérifie les fichiers API
    console.log(`${colors.cyan}${colors.bright}1.${colors.reset} Fichiers API...`);
    const apiFiles = [
        'www/js/api/simple_api_server.js',
        'www/js/api/api_start.js',
        'www/js/api/routes/wallet.js'
    ];
    
    let apiOk = true;
    apiFiles.forEach(file => {
        const exists = fs.existsSync(path.join(projectRoot, file));
        const icon = exists ? `${colors.green}${colors.icon.success}` : `${colors.red}${colors.icon.error}`;
        console.log(`   ${icon}${colors.reset} ${colors.dim}${file}${colors.reset}`);
        if (!exists) apiOk = false;
    });
    
    if (!apiOk) {
        console.log(`\n${colors.yellow}${colors.icon.warning} Fichiers API manquants!${colors.reset}`);
        return false;
    }
    
    // 2. Vérifie les fichiers crypto
    console.log(`\n${colors.cyan}${colors.bright}2.${colors.reset} Fichiers crypto...`);
    const cryptoFiles = [
        'www/js/crypto/crypto_services.js',
        'www/js/crypto/SimpleWallet/simple_wallet.js',
        'www/js/crypto/const_blockchains.js',
        'www/js/crypto/const_wallet.js'
    ];
    
    let cryptoOk = true;
    cryptoFiles.forEach(file => {
        const exists = fs.existsSync(path.join(projectRoot, file));
        const icon = exists ? `${colors.green}${colors.icon.success}` : `${colors.red}${colors.icon.error}`;
        console.log(`   ${icon}${colors.reset} ${colors.dim}${file}${colors.reset}`);
        if (!exists) cryptoOk = false;
    });
    
    if (!cryptoOk) {
        console.log(`\n${colors.yellow}${colors.icon.warning} Fichiers crypto manquants!${colors.reset}`);
        return false;
    }
    
    // 3. Teste le chargement
    console.log(`\n${colors.cyan}${colors.bright}3.${colors.reset} Test chargement modules...`);
    try {
        const serverPath = path.join(projectRoot, 'www/js/api/simple_api_server.js');
        require(serverPath);
        console.log(`   ${colors.green}${colors.icon.success} Module serveur OK${colors.reset}`);
    } catch (error) {
        console.log(`   ${colors.red}${colors.icon.error} Erreur:${colors.reset} ${colors.yellow}${error.message}${colors.reset}`);
        return false;
    }
    
    // 4. Vérifie les tests
    console.log(`\n${colors.cyan}${colors.bright}4.${colors.reset} Fichiers de tests...`);
    const testFiles = [
        'tests/api/runners/smoke-test.js',
        'tests/api/runners/diagnostic.js',
        'tests/api/runners/test-simple-wallet.js',
        'tests/api/runners/test-simple-multi-coins.js',
        'tests/api/runners/verify-api.js'
    ];
    
    let testsOk = true;
    testFiles.forEach(file => {
        const exists = fs.existsSync(path.join(projectRoot, file));
        const icon = exists ? `${colors.green}${colors.icon.success}` : `${colors.dim}⚠️`;
        console.log(`   ${icon}${colors.reset} ${colors.dim}${file}${colors.reset}`);
        if (!exists && file !== 'tests/api/runners/verify-api.js') testsOk = false;
    });
    
    // 5. Vérifie package.json
    console.log(`\n${colors.cyan}${colors.bright}5.${colors.reset} Vérification package.json...`);
    try {
        const packagePath = path.join(projectRoot, 'package.json');
        const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        console.log(`   ${colors.green}${colors.icon.success} package.json trouvé${colors.reset}`);
        console.log(`   ${colors.dim}Nom:${colors.reset} ${colors.cyan}${packageData.name}${colors.reset}`);
        console.log(`   ${colors.dim}Version:${colors.reset} ${colors.green}${packageData.version}${colors.reset}`);
        
        // Vérifie les scripts API
        const apiScripts = ['api', 'api:smoke', 'api:simple', 'test:allsimple'];
        console.log(`   ${colors.dim}Scripts API:${colors.reset}`);
        apiScripts.forEach(script => {
            const hasScript = packageData.scripts && packageData.scripts[script];
            const icon = hasScript ? `${colors.green}${colors.icon.success}` : `${colors.red}${colors.icon.error}`;
            console.log(`        ${icon}${colors.reset} npm run ${script}${colors.reset}`);
        });
    } catch (error) {
        console.log(`   ${colors.red}${colors.icon.error} Erreur package.json:${colors.reset} ${colors.yellow}${error.message}${colors.reset}`);
        return false;
    }
    
    // Résumé
    console.log(`\n${colors.bright}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.bright}${colors.green}${colors.icon.trophy} API PRÊTE À FONCTIONNER!${colors.reset}`);
    console.log(`${colors.bright}${'='.repeat(60)}${colors.reset}`);
    
    console.log(`\n${colors.blue}${colors.icon.rocket} Pour démarrer:${colors.reset}`);
    console.log(`   ${colors.dim}npm run api${colors.reset}`);
    console.log(`   ${colors.dim}OU${colors.reset}`);
    console.log(`   ${colors.dim}node www/js/api/api_start.js${colors.reset}`);
    
    console.log(`\n${colors.cyan}${colors.icon.test} Pour tester:${colors.reset}`);
    console.log(`   ${colors.dim}npm run api:smoke${colors.reset}       # Test rapide`);
    console.log(`   ${colors.dim}npm run api:simple${colors.reset}      # Test Simple Wallet`);
    console.log(`   ${colors.dim}npm run test:allsimple${colors.reset}  # Test Multi-coins`);
    console.log(`   ${colors.dim}npm run api:diagnostic${colors.reset}  # Diagnostic complet`);
    console.log(`   ${colors.dim}npm run api:verify${colors.reset}      # Cette vérification\n`);
    
    return true;
}

if (require.main === module) {
    verifyAPI().then(success => {
        if (success) {
            console.log(`${colors.bright}${colors.green}${colors.icon.trophy} Vérification terminée avec succès!${colors.reset}`);
        } else {
            console.log(`${colors.bright}${colors.red}${colors.icon.fire} Vérification a échoué!${colors.reset}`);
        }
        process.exit(success ? 0 : 1);
    });
}

module.exports = verifyAPI;