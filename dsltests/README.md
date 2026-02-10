# Cryptocalc DSL Testing Framework

Un DSL (Domain-Specific Language) basé sur YAML pour tester les services cryptographiques de Cryptocalc avec Jest.

## 📋 Table des Matières

- [Installation](#installation)
- [Démarrage Rapide](#démarrage-rapide)
- [Syntaxe DSL](#syntaxe-dsl)
- [Actions Disponibles](#actions-disponibles)
- [Types d'Assertions](#types-dassertions)
- [Exemples](#exemples)
- [Intégration avec Cryptocalc](#intégration-avec-cryptocalc)

## 🚀 Installation

```bash
npm install
```

## ⚡ Démarrage Rapide

### Exécuter tous les tests

```bash
npm test
```

### Exécuter uniquement les tests DSL

```bash
npm run test:dsl
```

### Mode watch (développement)

```bash
npm run test:watch
```

### Coverage

```bash
npm run test:coverage
```

## 📝 Syntaxe DSL

### Structure de base d'un fichier de test YAML

```yaml
name: "Nom de la suite de tests"
description: "Description optionnelle"

imports:
  - CryptoService
  - BIP38Service

setup:
  entropy_size: 256
  blockchain: BTC
  wallet_mode: HD_WALLET

tests:
  - name: "Nom du test"
    steps:
      - action: generateEntropy
        params:
          size: 256
        assign: entropy
        
      - action: generateWallet
        params:
          type: HD_WALLET
          entropy: $entropy
        assign: wallet
        
    assertions:
      - property: $wallet.address
        matches: "^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$"
        
fixtures:
  expected_data:
    key: "value"
```

## 🎯 Actions Disponibles

### `generateEntropy`
Génère de l'entropie aléatoire.

```yaml
- action: generateEntropy
  params:
    size: 256  # 128, 160, 192, 224, ou 256 bits
  assign: entropy
```

### `generateWallet`
Génère un wallet à partir de l'entropie.

```yaml
- action: generateWallet
  params:
    type: HD_WALLET  # HD_WALLET, SIMPLE_WALLET, ou SWORD_WALLET
    entropy: $entropy
    blockchain: BTC  # BTC, ETH, XRP, ADA, etc.
    passphrase: "optional"  # Passphrase BIP32 optionnelle
  assign: wallet
```

### `encrypt`
Chiffre une clé privée avec BIP38.

```yaml
- action: encrypt
  params:
    privateKey: $wallet.privateKey
    passphrase: "MySecurePassword"
    difficulty: 16384  # Optionnel, défaut: 16384
  assign: encrypted_key
```

### `decrypt`
Déchiffre une clé privée BIP38.

```yaml
- action: decrypt
  params:
    encryptedKey: $encrypted_key
    passphrase: "MySecurePassword"
  assign: decrypted_key
```

### `save`
Sauvegarde un wallet.

```yaml
- action: save
  target: $wallet
  params:
    includeEncrypted: true
  assign: save_result
```

### `deriveKey`
Dérive une clé BIP32.

```yaml
- action: deriveKey
  params:
    masterKey: $wallet.privateKey
    path: "m/44'/0'/0'/0/0"
  assign: derived_key
```

### `validateAddress`
Valide une adresse blockchain.

```yaml
- action: validateAddress
  params:
    address: $wallet.address
    blockchain: BTC
  assign: is_valid
```

### `computeChecksum`
Calcule un checksum.

```yaml
- action: computeChecksum
  params:
    data: $wallet.entropy
    algorithm: sha256  # sha256, sha512, etc.
  assign: checksum
```

## ✅ Types d'Assertions

### `equals`
Vérifie l'égalité stricte.

```yaml
- property: $wallet.type
  equals: HD_WALLET
```

### `notEquals`
Vérifie l'inégalité.

```yaml
- property: $wallet.address
  notEquals: null
```

### `hasLength`
Vérifie la longueur d'une chaîne ou d'un tableau.

```yaml
- property: $wallet.secretPhrase
  hasLength: 24
```

### `matches`
Vérifie qu'une chaîne correspond à une regex.

```yaml
- property: $wallet.address
  matches: "^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$"
```

### `greaterThan` / `lessThan`
Compare des valeurs numériques.

```yaml
- property: $entropy
  greaterThan: 0

- property: $difficulty
  lessThan: 100000
```

### `contains`
Vérifie qu'une chaîne contient une sous-chaîne.

```yaml
- property: $wallet.address
  contains: "1A"
```

### `isTrue` / `isFalse`
Vérifie les valeurs booléennes.

```yaml
- property: $is_valid
  isTrue: true

- property: $has_error
  isFalse: true
```

### `isDefined`
Vérifie qu'une valeur est définie (non null/undefined).

```yaml
- property: $wallet.privateKey
  isDefined: true
```

## 📚 Exemples

### Exemple 1: Test Simple de Génération de Wallet

```yaml
name: "Simple Wallet Test"

tests:
  - name: "Generate BTC wallet"
    steps:
      - action: generateEntropy
        params:
          size: 256
        assign: entropy
        
      - action: generateWallet
        params:
          type: HD_WALLET
          entropy: $entropy
          blockchain: BTC
        assign: wallet
        
    assertions:
      - property: $wallet.address
        matches: "^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$"
```

### Exemple 2: Test BIP38

```yaml
name: "BIP38 Test"

tests:
  - name: "Encrypt and decrypt"
    steps:
      - action: generateEntropy
        params:
          size: 256
        assign: entropy
        
      - action: generateWallet
        params:
          type: HD_WALLET
          entropy: $entropy
          blockchain: BTC
        assign: wallet
        
      - action: encrypt
        params:
          privateKey: $wallet.privateKey
          passphrase: "TestPass123"
        assign: encrypted
        
      - action: decrypt
        params:
          encryptedKey: $encrypted
          passphrase: "TestPass123"
        assign: decrypted
        
    assertions:
      - property: $encrypted
        matches: "^6PR"
      - property: $decrypted
        isDefined: true
```

### Exemple 3: Multi-Blockchain

```yaml
name: "Multi-Chain Test"

tests:
  - name: "Same entropy, different chains"
    steps:
      - action: generateEntropy
        params:
          size: 256
        assign: shared_entropy
        
      - action: generateWallet
        params:
          type: HD_WALLET
          entropy: $shared_entropy
          blockchain: BTC
        assign: btc_wallet
        
      - action: generateWallet
        params:
          type: HD_WALLET
          entropy: $shared_entropy
          blockchain: ETH
        assign: eth_wallet
        
    assertions:
      - property: $btc_wallet.secretPhrase
        equals: $eth_wallet.secretPhrase
      - property: $btc_wallet.address
        notEquals: $eth_wallet.address
```

## 🔌 Intégration avec Cryptocalc

### Structure des Répertoires

```
cryptocalc-dsl/
├── src/
│   └── dsl/
│       ├── parser.js           # Parser YAML
│       ├── interpreter.js      # Interpréteur DSL
│       └── mock-services.js    # Services mockés
├── tests/
│   ├── fixtures/              # Tests YAML
│   │   ├── test_hd_wallet_btc.yaml
│   │   ├── test_multi_blockchain.yaml
│   │   ├── test_bip38.yaml
│   │   └── test_address_validation.yaml
│   └── dsl-runner.test.js     # Runner Jest
└── package.json
```

### Utiliser les Vrais Services Cryptocalc

Pour remplacer les mocks par les vrais services de Cryptocalc:

```javascript
// tests/dsl-runner.test.js
const DSLInterpreter = require('../src/dsl/interpreter');

// Importer les vrais services depuis Cryptocalc
const CryptoService = require('../../www/js/model/crypto_service');
const BIP38Service = require('../../www/js/model/bip38_service');
// ... autres services

const interpreter = new DSLInterpreter({
  CryptoService: CryptoService,
  BIP38Service: BIP38Service,
  // ... autres services
});
```

## 🎨 Variables et Contexte

### Référencer des Variables

Utilisez le préfixe `$` pour référencer des variables:

```yaml
- action: generateEntropy
  assign: myEntropy

- action: generateWallet
  params:
    entropy: $myEntropy  # Référence la variable
```

### Variables de Setup

Les variables définies dans `setup` sont accessibles avec le préfixe `_setup_`:

```yaml
setup:
  blockchain: BTC

tests:
  - name: "Use setup variable"
    steps:
      - action: generateWallet
        params:
          blockchain: $_setup_blockchain  # Utilise la valeur du setup
```

## 🔍 Debugging

### Mode Verbose

Les tests affichent automatiquement des logs détaillés:

```
=== Executing test suite: HD Wallet Generation - Bitcoin ===
Description: Test la génération complète d'un wallet BIP32 pour Bitcoin

  → Test: Generate HD wallet with 256-bit entropy
    Step 1: generateEntropy
      → Generated entropy: a1b2c3d4e5f6789...
      → Assigned to $entropy
    Step 2: generateWallet
      → Generated HD_WALLET wallet for BTC
      → Assigned to $wallet
      ✓ Value equals 64
      ✓ Value is defined
  ✓ Test passed
```

### Inspection du Contexte

Vous pouvez inspecter le contexte dans les tests Jest:

```javascript
it('should have correct context', async () => {
  await interpreter.executeTestSuite(testSuite);
  const context = interpreter.getContext();
  console.log('Context:', context);
});
```

## 🛠️ Extension du DSL

### Ajouter une Nouvelle Action

1. Ajouter l'action dans `parser.js`:

```javascript
this.validActions = [
  // ... actions existantes
  'myNewAction'
];
```

2. Implémenter l'action dans `interpreter.js`:

```javascript
async executeStep(step) {
  switch(action) {
    // ... cas existants
    case 'myNewAction':
      result = await this.executeMyNewAction(resolvedParams);
      break;
  }
}

async executeMyNewAction(params) {
  // Implémentation
  return result;
}
```

3. Utiliser dans YAML:

```yaml
- action: myNewAction
  params:
    param1: value1
  assign: result
```

### Ajouter un Nouveau Type d'Assertion

Modifier la méthode `checkAssertion` dans `interpreter.js`:

```javascript
async checkAssertion(assertion) {
  // ... cas existants
  else if ('myCustomCheck' in assertion) {
    const threshold = assertion.myCustomCheck;
    result.passed = /* votre logique */;
  }
}
```

## 📄 License

MIT

## 👤 Auteur

Michel - Développeur TSCG Framework

## 🤝 Contribution

Les contributions sont bienvenues ! Créez une issue ou un pull request sur GitHub.
