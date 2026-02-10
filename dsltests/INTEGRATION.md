# Guide d'Intégration avec Cryptocalc

Ce guide explique comment intégrer le DSL de tests dans le projet Cryptocalc existant.

## 📂 Structure Recommandée

```
Cryptocalc/
├── www/
│   └── js/
│       └── model/
│           ├── crypto_service.js       # Service crypto existant
│           ├── bip38_service.js        # Service BIP38 existant
│           └── ...
├── tests/
│   ├── dsl/                           # NOUVEAU: Framework DSL
│   │   ├── parser.js
│   │   ├── interpreter.js
│   │   └── services-adapter.js        # Adaptateur pour services réels
│   ├── fixtures/                      # NOUVEAU: Tests YAML
│   │   ├── test_hd_wallet_btc.yaml
│   │   ├── test_bip38.yaml
│   │   └── ...
│   ├── dsl-runner.test.js            # NOUVEAU: Runner Jest
│   └── unit/                          # Tests unitaires existants
└── package.json
```

## 🔧 Étapes d'Intégration

### Étape 1: Copier les Fichiers DSL

Copiez les fichiers du framework DSL dans votre projet Cryptocalc:

```bash
# Depuis le dossier cryptocalc-dsl
cp -r src/dsl ../Cryptocalc/tests/
cp -r tests/fixtures ../Cryptocalc/tests/
cp tests/dsl-runner.test.js ../Cryptocalc/tests/
```

### Étape 2: Adapter le package.json

Ajoutez les dépendances et scripts dans `Cryptocalc/package.json`:

```json
{
  "devDependencies": {
    "jest": "^29.7.0",
    "js-yaml": "^4.1.0"
  },
  "scripts": {
    "test": "jest",
    "test:dsl": "jest tests/dsl-runner.test.js",
    "test:watch": "jest --watch"
  }
}
```

### Étape 3: Créer l'Adaptateur de Services

Créez `tests/dsl/services-adapter.js` pour adapter vos services existants:

```javascript
// tests/dsl/services-adapter.js

/**
 * Adaptateur pour utiliser les vrais services Cryptocalc
 * au lieu des mocks
 */

// Importer les services réels de Cryptocalc
const CryptoServiceReal = require('../../www/js/model/crypto_service');
const BIP38ServiceReal = require('../../www/js/model/bip38_service');
const BIP32ServiceReal = require('../../www/js/model/bip32_service');
const AddressValidatorReal = require('../../www/js/model/address_validator');

/**
 * Adaptateur pour CryptoService
 * Transforme l'interface du service réel pour correspondre au DSL
 */
class CryptoServiceAdapter {
  constructor() {
    this.realService = new CryptoServiceReal();
  }

  async generateEntropy(size = 256) {
    // Appel au vrai service Cryptocalc
    return await this.realService.generateEntropy(size);
  }

  async generateWallet(type, entropy, options = {}) {
    const { blockchain = 'BTC', passphrase = '' } = options;
    
    // Adapter l'appel selon votre API réelle
    const wallet = await this.realService.createWallet({
      type: type,
      entropy: entropy,
      blockchain: blockchain,
      bip32Passphrase: passphrase
    });
    
    // Retourner un objet normalisé
    return {
      type: type,
      blockchain: blockchain,
      entropy: wallet.entropy,
      secretPhrase: wallet.mnemonics || wallet.secretPhrase,
      privateKey: wallet.privateKey,
      address: wallet.address,
      wif: wallet.wif,
      passphrase: passphrase || null,
      derivationPath: wallet.derivationPath,
      
      // Ajouter la méthode save
      save: async function(params = {}) {
        return await this.realService.saveWallet(wallet, params);
      }.bind(this)
    };
  }
}

/**
 * Adaptateur pour BIP38Service
 */
class BIP38ServiceAdapter {
  constructor() {
    this.realService = new BIP38ServiceReal();
  }

  async encrypt(privateKey, passphrase, difficulty = 16384) {
    return await this.realService.encrypt(
      privateKey,
      passphrase,
      difficulty
    );
  }

  async decrypt(encryptedKey, passphrase) {
    return await this.realService.decrypt(
      encryptedKey,
      passphrase
    );
  }
}

/**
 * Adaptateur pour BIP32Service
 */
class BIP32ServiceAdapter {
  constructor() {
    this.realService = new BIP32ServiceReal();
  }

  async derive(masterKey, path) {
    const result = await this.realService.derivePath(masterKey, path);
    
    return {
      path: path,
      privateKey: result.privateKey,
      publicKey: result.publicKey,
      chainCode: result.chainCode
    };
  }
}

/**
 * Adaptateur pour AddressValidator
 */
class AddressValidatorAdapter {
  constructor() {
    this.realService = new AddressValidatorReal();
  }

  async validate(address, blockchain) {
    return await this.realService.isValid(address, blockchain);
  }
}

module.exports = {
  CryptoServiceAdapter,
  BIP38ServiceAdapter,
  BIP32ServiceAdapter,
  AddressValidatorAdapter
};
```

### Étape 4: Modifier le Runner pour Utiliser les Vrais Services

Modifiez `tests/dsl-runner.test.js`:

```javascript
const DSLParser = require('./dsl/parser');
const DSLInterpreter = require('./dsl/interpreter');

// Option 1: Utiliser les mocks (pour tests rapides)
const {
  MockCryptoService,
  MockBIP38Service,
  // ...
} = require('./dsl/mock-services');

// Option 2: Utiliser les vrais services (pour tests d'intégration)
const {
  CryptoServiceAdapter,
  BIP38ServiceAdapter,
  // ...
} = require('./dsl/services-adapter');

describe('DSL Test Runner', () => {
  let parser;
  let interpreter;

  beforeAll(() => {
    parser = new DSLParser();
    
    // Choisir les services à utiliser
    const USE_REAL_SERVICES = process.env.USE_REAL_SERVICES === 'true';
    
    if (USE_REAL_SERVICES) {
      // Tests d'intégration avec vrais services
      interpreter = new DSLInterpreter({
        CryptoService: new CryptoServiceAdapter(),
        BIP38Service: new BIP38ServiceAdapter(),
        BIP32Service: new BIP32ServiceAdapter(),
        AddressValidator: new AddressValidatorAdapter()
      });
    } else {
      // Tests unitaires avec mocks
      interpreter = new DSLInterpreter({
        CryptoService: new MockCryptoService(),
        BIP38Service: new MockBIP38Service(),
        // ...
      });
    }
  });

  // ... reste des tests
});
```

### Étape 5: Configurer Jest

Créez `jest.config.js` dans le dossier racine de Cryptocalc:

```javascript
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'www/js/model/**/*.js',
    'tests/dsl/**/*.js',
    '!tests/**/*.test.js'
  ],
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  verbose: true,
  testTimeout: 30000  // 30 secondes pour les tests crypto
};
```

## 🚀 Utilisation

### Tests Rapides avec Mocks

```bash
npm run test:dsl
```

### Tests d'Intégration avec Vrais Services

```bash
USE_REAL_SERVICES=true npm run test:dsl
```

### Tests Spécifiques

```bash
# Tester uniquement BIP38
npm test -- tests/fixtures/test_bip38.yaml

# Tester avec pattern
npm test -- --testNamePattern="BIP38"
```

## 🔍 Exemples d'Adaptation de Services

### Si votre API crypto_service.js est différente

```javascript
// Exemple: votre service retourne directement les mnemonics
class CryptoServiceAdapter {
  async generateWallet(type, entropy, options) {
    const wallet = await this.realService.createFromEntropy(entropy);
    
    // Adapter la structure de retour
    return {
      type: type,
      blockchain: options.blockchain,
      entropy: entropy,
      secretPhrase: wallet.mnemonic.split(' '),  // Adapter si nécessaire
      privateKey: wallet.privateKey,
      address: wallet.address,
      // ...
    };
  }
}
```

### Si vous utilisez des Promises au lieu d'async/await

```javascript
class BIP38ServiceAdapter {
  encrypt(privateKey, passphrase, difficulty) {
    return new Promise((resolve, reject) => {
      this.realService.encrypt(
        privateKey,
        passphrase,
        difficulty,
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });
  }
}
```

## 📝 Créer de Nouveaux Tests

1. Créez un fichier YAML dans `tests/fixtures/`:

```yaml
# tests/fixtures/test_my_feature.yaml
name: "My Feature Test"

tests:
  - name: "Test something"
    steps:
      - action: generateEntropy
        params:
          size: 256
        assign: entropy
    assertions:
      - property: $entropy
        hasLength: 64
```

2. Le test sera automatiquement découvert et exécuté par Jest.

## 🐛 Debugging

### Activer les Logs Détaillés

```javascript
// Dans dsl-runner.test.js
beforeAll(() => {
  // Activer le mode verbose
  process.env.DSL_VERBOSE = 'true';
});
```

### Inspecter le Contexte

```javascript
it('should debug context', async () => {
  await interpreter.executeTestSuite(testSuite);
  const context = interpreter.getContext();
  console.log('Full context:', JSON.stringify(context, null, 2));
});
```

### Breakpoints dans les Tests

```bash
# Lancer Jest en mode debug
npm run test:debug

# Dans Chrome, aller à: chrome://inspect
```

## ⚡ Optimisations

### Cache des Entropies

Pour accélérer les tests:

```javascript
// tests/dsl/test-cache.js
class EntropyCache {
  constructor() {
    this.cache = new Map();
  }

  get(size) {
    if (!this.cache.has(size)) {
      const entropy = crypto.randomBytes(size / 8).toString('hex');
      this.cache.set(size, entropy);
    }
    return this.cache.get(size);
  }
}
```

### Tests Parallèles

```javascript
// jest.config.js
module.exports = {
  maxWorkers: 4,  // Exécuter 4 tests en parallèle
  // ...
};
```

## 🔐 Sécurité

### Ne Jamais Commiter de Vraies Clés

Assurez-vous que `.gitignore` inclut:

```gitignore
# Test outputs
tests/output/
tests/fixtures/*.private.yaml
tests/fixtures/*_real_keys.yaml

# Coverage
coverage/
```

### Tests Isolés

Les tests DSL sont isolés - chaque test a son propre contexte qui est nettoyé après exécution.

## 📊 CI/CD

### GitHub Actions

Créez `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
      
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## 🎯 Prochaines Étapes

1. ✅ Copier les fichiers DSL dans Cryptocalc
2. ✅ Créer les adaptateurs de services
3. ✅ Configurer Jest
4. ✅ Exécuter les tests
5. ✅ Créer vos propres tests YAML
6. ✅ Intégrer dans votre CI/CD

## 🆘 Support

Si vous rencontrez des problèmes:

1. Vérifiez que tous les services sont correctement adaptés
2. Activez le mode verbose pour voir les détails d'exécution
3. Consultez les exemples dans `tests/fixtures/`
4. Créez une issue sur GitHub avec les logs d'erreur
