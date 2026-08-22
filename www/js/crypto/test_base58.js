// test-bip85.js
const { deriveBIP85Entropy } = require('./bip85');
const crypto = require('crypto');
const bip39 = require('bip39');

/**
 * Convertit une phrase mnémonique en entropie (Buffer)
 */
function mnemonicToEntropy(mnemonic) {
    // La phrase doit être valide BIP39
    if (!bip39.validateMnemonic(mnemonic)) {
        throw new Error('Phrase mnémonique invalide');
    }
    return bip39.mnemonicToEntropy(mnemonic);
}

/**
 * Convertit une entropie en phrase mnémonique BIP39
 */
function entropyToMnemonic(entropy) {
    return bip39.entropyToMnemonic(entropy);
}

// ============================================================
// TEST 1 : Vecteur officiel BIP85
// ============================================================
console.log('=== TEST 1 : Vecteur officiel BIP85 ===\n');

// Clé maître BIP32 (entropie de 32 octets extraite d'une seed BIP39)
// Note : Pour ce test, on utilise l'entropie correspondant à la seed
const masterEntropyTest1 = Buffer.from(
    '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f',
    'hex'
);

const indexTest1 = 0;
const bitsTest1 = 256; // 32 octets

const derivedTest1 = deriveBIP85Entropy(masterEntropyTest1, indexTest1, bitsTest1);

console.log('Entropie dérivée (hex) :', derivedTest1.toString('hex'));
console.log('Entropie attendue       : efecfbccffea313214232d29e71563d941229afb4338c21f9517c41aaa0d16f00b83d2a09ef747e7a64e8e2bd5a14869e693da66ce94ac2da570ab7ee48618f7');
console.log('Correspond ?', derivedTest1.toString('hex') === 'efecfbccffea313214232d29e71563d941229afb4338c21f9517c41aaa0d16f00b83d2a09ef747e7a64e8e2bd5a14869e693da66ce94ac2da570ab7ee48618f7' ? '✅ OUI' : '❌ NON');
console.log();

// ============================================================
// TEST 2 : Votre cas d'usage (phrase mnémonique → entropie BIP85)
// ============================================================
console.log('=== TEST 2 : Cas d\'usage spécifique ===\n');

const mnemonicInput = 'become bomb guilt gesture gravity box opera jaguar sea ceiling inject planet speak smile appear jelly enjoy warm core galaxy viable glass name grant';

// 1. Convertir la phrase en entropie (32 octets = 256 bits)
const masterEntropyTest2 = mnemonicToEntropy(mnemonicInput);

console.log('Phrase d\'entrée :');
console.log(mnemonicInput);
console.log('\nEntropie maître (hex) :', masterEntropyTest2.toString('hex'));
console.log('Taille :', masterEntropyTest2.length, 'octets\n');

// 2. Dériver l'entropie enfant avec BIP85
const indexTest2 = 0; // On utilise l'index 0 pour ce test
const bitsTest2 = 256; // On demande 256 bits pour générer une phrase BIP39 de 24 mots

const derivedEntropyTest2 = deriveBIP85Entropy(masterEntropyTest2, indexTest2, bitsTest2);

console.log('Entropie dérivée (hex) :', derivedEntropyTest2.toString('hex'));
console.log('Taille :', derivedEntropyTest2.length, 'octets\n');

// 3. Convertir l'entropie dérivée en phrase mnémonique BIP39
const derivedMnemonic = entropyToMnemonic(derivedEntropyTest2);

console.log('Phrase mnémonique dérivée :');
console.log(derivedMnemonic);
console.log();

// 4. Vérifier par rapport à la sortie attendue
const expectedMnemonic = 'hybrid luggage wet unit error media search sea scale labor motor crunch ocean fiscal polar pretty tackle ranch invite gown athlete urge fashion cruel';

console.log('Phrase attendue :');
console.log(expectedMnemonic);
console.log('\nCorrespond ?', derivedMnemonic === expectedMnemonic ? '✅ OUI' : '❌ NON');

// ============================================================
// TEST 3 : Dérivation multiple avec différents index
// ============================================================
console.log('\n=== TEST 3 : Dérivation avec différents index ===\n');

// On utilise la même entropie maître
const masterEntropyTest3 = masterEntropyTest2;

for (let idx = 0; idx < 3; idx++) {
    const derived = deriveBIP85Entropy(masterEntropyTest3, idx, 128); // 128 bits
    const mnemonic128 = bip39.entropyToMnemonic(derived);
    console.log(`Index ${idx} → 12 mots (128 bits) :`);
    console.log(mnemonic128);
    console.log();
}

// ============================================================
// TEST 4 : Validation des erreurs
// ============================================================
console.log('=== TEST 4 : Validation des erreurs ===\n');

try {
    // Entropie trop courte
    const invalidEntropy = Buffer.from('0001020304050607', 'hex');
    deriveBIP85Entropy(invalidEntropy, 0, 128);
} catch (err) {
    console.log('✅ Erreur capturée (entropie trop courte) :', err.message);
}

try {
    // Bits non multiple de 8
    deriveBIP85Entropy(masterEntropyTest2, 0, 100);
} catch (err) {
    console.log('✅ Erreur capturée (bits non multiple de 8) :', err.message);
}

try {
    // Index hors limites
    deriveBIP85Entropy(masterEntropyTest2, 0xFFFFFFFF + 1, 128);
} catch (err) {
    console.log('✅ Erreur capturée (index hors limites) :', err.message);
}

console.log('\n=== Tous les tests terminés ===');