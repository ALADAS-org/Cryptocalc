# 🚀 Quick Start Guide - Cryptocalc DSL

## Installation en 3 étapes

### 1. Cloner et installer

```bash
cd /chemin/vers/Cryptocalc
npm install
```

### 2. Vérifier l'installation

```bash
npm test
```

Vous devriez voir:
```
 PASS  tests/dsl-runner.test.js
  ✓ Simple Wallet Generation (45ms)
  ✓ HD Wallet Generation (38ms)
  ✓ Mnemonic Validation (12ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
```

### 3. Écrire votre premier test

Créez `tests/fixtures/mon_test.yaml`:

```yaml
name: "Mon Premier Test"

tests:
  - name: "Générer un wallet Bitcoin"
    steps:
      - action: generateEntropy
        params:
          size: 256
        assign: entropy
      
      - action: generateWallet
        params:
          type: SIMPLE_WALLET
          entropy: $entropy
          blockchain: bitcoin
        assign: wallet
    
    assertions:
      - property: $wallet.type
        equals: SIMPLE_WALLET
      
      - property: $wallet.secretPhrase
        hasLength: 24
```

Exécutez:
```bash
npm run test:fixture mon_test
```

## 📖 Exemples de syntaxe

### Générer de l'entropie

```yaml
- action: generateEntropy
  params:
    size: 256  # 128, 160, 192, 224, ou 256
  assign: entropy
```

### Créer un wallet simple

```yaml
- action: generateWallet
  params:
    type: SIMPLE_WALLET
    entropy: $entropy
    blockchain: bitcoin
  assign: wallet
```

### Créer un HD wallet

```yaml
- action: generateWallet
  params:
    type: HD_WALLET
    entropy: $entropy
    blockchain: bitcoin
    passphrase: "optional-bip32-passphrase"
  assign: hdWallet
```

### Dériver des adresses

```yaml
- action: deriveAddress
  params:
    entropy: $entropy
    account: 0
    addressIndex: 5
    blockchain: bitcoin
  assign: address
```

### Valider un mnémonique

```yaml
- action: validateMnemonic
  params:
    mnemonic: "abandon ability able about..."
  assign: isValid
```

### Convertir entropy ↔ mnemonic

```yaml
# Entropy → Mnemonic
- action: convertToMnemonic
  params:
    entropy: $entropy
  assign: mnemonic

# Mnemonic → Entropy
- action: convertToEntropy
  params:
    mnemonic: $mnemonic
  assign: recoveredEntropy
```

## ✅ Assertions courantes

### Égalité

```yaml
- property: $wallet.type
  equals: SIMPLE_WALLET
```

### Longueur

```yaml
- property: $wallet.secretPhrase
  hasLength: 24
```

### Expression régulière

```yaml
- property: $wallet.address
  matches: "^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$"
```

### Comparaisons

```yaml
- property: $wallet.wordCount
  greaterThan: 11

- property: $entropy
  hasLength:
    lessThan: 65
```

### Contenu

```yaml
- property: $mnemonic
  contains: "abandon"
```

### Booléens

```yaml
- property: $isValid
  isTrue: true
```

## 🎯 Cas d'usage typiques

### Test de régression

```yaml
name: "Regression Test"

fixtures:
  known_entropy: "a0c42a9c3ac6cbf2bbba723a63a4e4e5d7e3d71f..."

tests:
  - name: "Vérifier stabilité"
    steps:
      - action: generateWallet
        params:
          type: SIMPLE_WALLET
          entropy: $known_entropy
        assign: wallet
    
    assertions:
      - property: $wallet.address
        equals: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
```

### Test de déterminisme

```yaml
tests:
  - name: "Même entropy = même wallet"
    steps:
      - action: generateWallet
        params:
          entropy: "0123456789abcdef..."
        assign: wallet1
      
      - action: generateWallet
        params:
          entropy: "0123456789abcdef..."
        assign: wallet2
    
    assertions:
      - property: $wallet1.address
        equals: $wallet2.address
```

### Test multi-blockchain

```yaml
tests:
  - name: "Générer pour BTC et ETH"
    steps:
      - action: generateEntropy
        assign: entropy
      
      - action: generateWallet
        params:
          entropy: $entropy
          blockchain: bitcoin
        assign: btcWallet
      
      - action: generateWallet
        params:
          entropy: $entropy
          blockchain: ethereum
        assign: ethWallet
    
    assertions:
      - property: $btcWallet.address
        matches: "^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$"
      
      - property: $ethWallet.address
        matches: "^0x[a-fA-F0-9]{40}$"
```

## 🛠 Commandes utiles

```bash
# Tous les tests
npm test

# Tests DSL seulement
npm run test:dsl

# Mode watch (auto-reload)
npm run test:watch

# Avec couverture de code
npm run test:coverage

# Test d'un fixture spécifique
npm run test:fixture simple_wallet

# Mode verbose
npm run test:verbose

# Script utilitaire avec options
node tests/run-tests.js --help
node tests/run-tests.js --watch
node tests/run-tests.js --coverage
node tests/run-tests.js --fixture=hd_wallet
```

## 📁 Structure des fichiers

```
Cryptocalc/
├── www/
│   └── crypto/
│       └── crypto_service.js      # Service principal
├── tests/
│   ├── dsl-parser.js              # Parser YAML
│   ├── dsl-interpreter.js         # Interpréteur
│   ├── dsl-runner.test.js         # Runner Jest
│   ├── setup.js                   # Setup global
│   ├── run-tests.js               # Script utilitaire
│   └── fixtures/                  # Vos tests YAML
│       ├── simple_wallet.yaml
│       ├── hd_wallet.yaml
│       └── mnemonic_validation.yaml
└── package.json
```

## 🐛 Dépannage

### "Module not found"

```bash
npm install
```

### Tests qui échouent

```bash
npx jest --clearCache
npm test
```

### Voir le contexte d'exécution

Ajoutez dans votre test runner:

```javascript
console.log('Context:', interpreter.context);
```

### Mode debug

```bash
DEBUG=true npm test
```

## 📚 Ressources

- [Documentation complète](tests/DSL_DOCUMENTATION.md)
- [README principal](README.md)
- [Repository GitHub](https://github.com/ALADAS-org/Cryptocalc)

## 💡 Prochaines étapes

1. ✅ Exécutez les tests existants
2. ✅ Explorez les fixtures dans `tests/fixtures/`
3. ✅ Créez votre premier test YAML
4. ✅ Lisez la documentation complète
5. ✅ Ajoutez vos propres assertions personnalisées

## 🎓 Exemples avancés

Voir les fixtures fournis:
- `simple_wallet.yaml` - Wallets simples
- `hd_wallet.yaml` - HD wallets et dérivation
- `mnemonic_validation.yaml` - Validation BIP39
- `advanced_features.yaml` - Fonctionnalités avancées

Bonne chance! 🚀
