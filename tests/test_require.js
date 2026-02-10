// test-require.js - Pour tester les chemins
const path = require('path');

console.log('🔍 Test de résolution de chemins:');

const testPaths = [
    './www/js/crypto/SimpleWallet/simple_wallet.js',
    '../www/js/crypto/SimpleWallet/simple_wallet.js',
    path.join(__dirname, '../www', 'js', 'crypto', 'SimpleWallet', 'simple_wallet.js')
];

testPaths.forEach(testPath => {
    try {
        console.log(`\nEssaie: ${testPath}`);
        const resolved = require.resolve(testPath);
        console.log(`✅ Résolu: ${resolved}`);
        
        // Essaie de charger
        const module = require(testPath);
        console.log(`✅ Chargé: ${Object.keys(module).join(', ')}`);
    } catch (error) {
        console.log(`❌ Échec: ${error.message}`);
    }
});