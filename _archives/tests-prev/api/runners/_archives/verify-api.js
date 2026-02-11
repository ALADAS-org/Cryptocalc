// tests/api/runners/verify-api.js
const fs = require('fs');
const path = require('path');

async function verifyAPI() {
    console.log('🔍 Vérification API CryptoCalc\n');
    
    const projectRoot = process.cwd();
    
    // 1. Vérifie les fichiers API
    console.log('1. Fichiers API...');
    const apiFiles = [
        'www/js/api/simple_api_server.js',
        'www/js/api/api_start.js',
        'www/js/api/routes/wallet.js'
    ];
    
    let apiOk = true;
    apiFiles.forEach(file => {
        const exists = fs.existsSync(path.join(projectRoot, file));
        console.log(`   ${exists ? '✅' : '❌'} ${file}`);
        if (!exists) apiOk = false;
    });
    
    if (!apiOk) {
        console.log('\n⚠️  Fichiers API manquants!');
        return false;
    }
    
    // 2. Vérifie les fichiers crypto
    console.log('\n2. Fichiers crypto...');
    const cryptoFiles = [
        'www/js/crypto/crypto_services.js',
        'www/js/crypto/SimpleWallet/simple_wallet.js',
        'www/js/crypto/const_blockchains.js',
        'www/js/crypto/const_wallet.js'
    ];
    
    let cryptoOk = true;
    cryptoFiles.forEach(file => {
        const exists = fs.existsSync(path.join(projectRoot, file));
        console.log(`   ${exists ? '✅' : '❌'} ${file}`);
        if (!exists) cryptoOk = false;
    });
    
    if (!cryptoOk) {
        console.log('\n⚠️  Fichiers crypto manquants!');
        return false;
    }
    
    // 3. Teste le chargement
    console.log('\n3. Test chargement modules...');
    try {
        const serverPath = path.join(projectRoot, 'www/js/api/simple_api_server.js');
        require(serverPath);
        console.log('   ✅ Module serveur OK');
    } catch (error) {
        console.log('   ❌ Erreur:', error.message);
        return false;
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 API PRÊTE À FONCTIONNER!');
    console.log('='.repeat(50));
    
    console.log('\n🚀 Pour démarrer:');
    console.log('   npm run api');
    console.log('   OU');
    console.log('   node www/js/api/api_start.js');
    
    console.log('\n🧪 Pour tester:');
    console.log('   npm run test:api:smoke');
    console.log('   OU');
    console.log('   node tests/api/runners/check-api.js\n');
    
    return true;
}

if (require.main === module) {
    verifyAPI().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = verifyAPI;