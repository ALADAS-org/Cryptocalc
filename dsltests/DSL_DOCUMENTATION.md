# DSL pour Tests Unitaires Cryptocalc

## Vue d'ensemble

Ce DSL (Domain Specific Language) permet d'écrire des tests unitaires pour Cryptocalc sous forme de scripts YAML lisibles et maintenables. Il s'intègre avec Jest pour l'exécution des tests.

## Structure d'un fichier de test YAML

```yaml
name: "Nom du test suite"
description: "Description optionnelle"

imports:
  - CryptoService

setup:
  entropy_size: 256
  blockchain: bitcoin
  wallet_mode: HD_WALLET

tests:
  - name: "Nom du test"
    description: "Description optionnelle"
    
    steps:
      - action: actionName
        params:
          param1: value1
        assign: variableName
    
    assertions:
      - property: $variableName
        equals: expectedValue

fixtures:
  fixture_var: "valeur de fixture"
```

## Actions disponibles

### generateEntropy
Génère de l'entropie cryptographique aléatoire.

**Paramètres:**
- `size` (requis): Taille en bits (128, 160, 192, 224, 256)

**Exemple:**
```yaml
- action: generateEntropy
  params:
    size: 256
  assign: entropy
```

### generateWallet
Génère un wallet à partir d'entropie.

**Paramètres:**
- `type` (requis): Type de wallet (`SIMPLE_WALLET`, `HD_WALLET`, `SWORD_WALLET`)
- `entropy` (requis): Entropie hexadécimale
- `blockchain` (optionnel): Blockchain cible (défaut: `bitcoin`)
- `passphrase` (optionnel): Passphrase BIP32

**Exemple:**
```yaml
- action: generateWallet
  params:
    type: HD_WALLET
    entropy: $entropy
    blockchain: bitcoin
    passphrase: "my-secure-passphrase"
  assign: wallet
```

### save
Sauvegarde un wallet (actuellement mocké pour les tests).

**Paramètres:**
- `target` (requis): Référence au wallet à sauvegarder

**Exemple:**
```yaml
- action: save
  target: $wallet
  assign: saveResult
```

### deriveAddress
Dérive une adresse spécifique d'un HD wallet.

**Paramètres:**
- `entropy` (requis): Entropie hexadécimale
- `account` (optionnel): Numéro de compte (défaut: 0)
- `addressIndex` (optionnel): Index d'adresse (défaut: 0)
- `blockchain` (optionnel): Blockchain (défaut: `bitcoin`)

**Exemple:**
```yaml
- action: deriveAddress
  params:
    entropy: $entropy
    account: 0
    addressIndex: 5
    blockchain: bitcoin
  assign: address
```

### validateMnemonic
Valide un mnémonique BIP39.

**Paramètres:**
- `mnemonic` (requis): Mnémonique à valider
- `language` (optionnel): Langue (défaut: `english`)

**Exemple:**
```yaml
- action: validateMnemonic
  params:
    mnemonic: "abandon ability able about..."
    language: english
  assign: isValid
```

### convertToMnemonic
Convertit l'entropie en mnémonique.

**Paramètres:**
- `entropy` (requis): Entropie hexadécimale
- `language` (optionnel): Langue (défaut: `english`)

**Exemple:**
```yaml
- action: convertToMnemonic
  params:
    entropy: $entropy
    language: english
  assign: mnemonic
```

### convertToEntropy
Convertit un mnémonique en entropie.

**Paramètres:**
- `mnemonic` (requis): Mnémonique
- `language` (optionnel): Langue (défaut: `english`)

**Exemple:**
```yaml
- action: convertToEntropy
  params:
    mnemonic: $mnemonic
    language: english
  assign: recoveredEntropy
```

## Assertions disponibles

### equals
Vérifie l'égalité stricte.

```yaml
- property: $wallet.type
  equals: HD_WALLET
```

### notEquals
Vérifie la non-égalité.

```yaml
- property: $address1
  notEquals: $address2
```

### hasLength
Vérifie la longueur d'un tableau ou d'une chaîne.

```yaml
- property: $wallet.secretPhrase
  hasLength: 24
```

### matches
Vérifie avec une expression régulière.

```yaml
- property: $wallet.address
  matches: "^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$"
```

### greaterThan
Vérifie qu'une valeur est supérieure à un seuil.

```yaml
- property: $wallet.wordCount
  greaterThan: 11
```

### lessThan
Vérifie qu'une valeur est inférieure à un seuil.

```yaml
- property: $entropy
  hasLength:
    lessThan: 65
```

### contains
Vérifie qu'une chaîne contient une sous-chaîne.

```yaml
- property: $mnemonic
  contains: "abandon"
```

### isTrue
Vérifie qu'une valeur est `true`.

```yaml
- property: $isValid
  isTrue: true
```

### isFalse
Vérifie qu'une valeur est `false`.

```yaml
- property: $isValid
  isFalse: true
```

## Variables

### Assignation
Les résultats peuvent être assignés à des variables avec `assign`:

```yaml
- action: generateEntropy
  params:
    size: 256
  assign: myEntropy
```

### Utilisation
Les variables sont référencées avec le préfixe `$`:

```yaml
- action: generateWallet
  params:
    entropy: $myEntropy
```

### Accès aux propriétés
Utilisez la notation par point pour accéder aux propriétés:

```yaml
- property: $wallet.address
  matches: "^[13].*"
```

## Fixtures

Les fixtures permettent de définir des données de test réutilisables:

```yaml
fixtures:
  known_entropy: "a0c42a9c3ac6cbf2bbba723a63a4e4e5d7e3d71f..."
  expected_address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"

tests:
  - name: "Test avec fixture"
    steps:
      - action: generateWallet
        params:
          entropy: $known_entropy
```

## Exemples complets

### Test Simple Wallet
```yaml
name: "Simple Wallet Test"

tests:
  - name: "Generate and validate simple wallet"
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
      
      - property: $wallet.address
        matches: "^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$"
```

### Test HD Wallet avec dérivation
```yaml
name: "HD Wallet Derivation Test"

tests:
  - name: "Derive multiple addresses"
    steps:
      - action: generateEntropy
        params:
          size: 256
        assign: entropy
      
      - action: deriveAddress
        params:
          entropy: $entropy
          account: 0
          addressIndex: 0
        assign: addr0
      
      - action: deriveAddress
        params:
          entropy: $entropy
          account: 0
          addressIndex: 1
        assign: addr1
    
    assertions:
      - property: $addr0.path
        equals: "m/44'/0'/0'/0/0"
      
      - property: $addr1.path
        equals: "m/44'/0'/0'/0/1"
      
      - property: $addr0.address
        notEquals: $addr1.address
```

## Exécution des tests

### Commandes Jest

```bash
# Exécuter tous les tests DSL
npm run test:dsl

# Exécuter avec mode watch
npm run test:watch

# Avec couverture de code
npm run test:coverage

# Mode verbose
npm run test:verbose
```

### Exécution programmatique

```javascript
const DSLParser = require('./tests/dsl-parser');
const DSLInterpreter = require('./tests/dsl-interpreter');
const CryptoService = require('./www/crypto/crypto_service');

const parser = new DSLParser();
const interpreter = new DSLInterpreter({
  CryptoService: new CryptoService()
});

const testSuite = parser.parse('./tests/fixtures/my_test.yaml');

for (const test of testSuite.tests) {
  for (const step of test.steps) {
    await interpreter.executeStep(step);
  }
  
  for (const assertion of test.assertions) {
    const result = interpreter.evaluateAssertion(assertion);
    console.log(result.passed ? '✓' : '✗', result.message);
  }
}
```

## Bonnes pratiques

### 1. Nommage descriptif
```yaml
name: "HD Wallet - BIP32 Derivation Path Validation"
description: "Vérifie que les chemins de dérivation BIP32 sont corrects"
```

### 2. Tests atomiques
Chaque test doit tester une seule fonctionnalité:

```yaml
tests:
  - name: "Test entropy generation only"
    # ...
  
  - name: "Test wallet generation only"
    # ...
```

### 3. Utilisation de fixtures pour la régression
```yaml
fixtures:
  regression_entropy: "a0c42a9c..."
  expected_first_word: "oppose"

tests:
  - name: "Regression test"
    steps:
      - action: convertToMnemonic
        params:
          entropy: $regression_entropy
```

### 4. Assertions multiples
Vérifiez plusieurs propriétés pour une validation complète:

```yaml
assertions:
  - property: $wallet.type
    equals: HD_WALLET
  
  - property: $wallet.secretPhrase
    hasLength: 24
  
  - property: $wallet.address
    matches: "^[13].*"
  
  - property: $wallet.privateKey
    hasLength: 64
```

### 5. Documentation
Ajoutez des descriptions aux assertions:

```yaml
- property: $wallet.address
  matches: "^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$"
  description: "L'adresse Bitcoin doit respecter le format standard"
```

## Débogage

### Afficher le contexte
```javascript
console.log(interpreter.context);
```

### Afficher une variable spécifique
```javascript
console.log(interpreter.getContextVariable('wallet'));
```

### Mode verbose Jest
```bash
npm run test:verbose
```

## Extension du DSL

### Ajouter une nouvelle action

1. **Dans `dsl-parser.js`:**
```javascript
this.validActions = [
  // ... actions existantes
  'myNewAction'
];
```

2. **Dans `dsl-interpreter.js`:**
```javascript
case 'myNewAction':
  result = await this.services.CryptoService.myNewMethod(
    resolvedParams.param1,
    resolvedParams.param2
  );
  break;
```

3. **Dans `crypto_service.js`:**
```javascript
async myNewMethod(param1, param2) {
  // Implémentation
  return result;
}
```

### Ajouter un nouveau type d'assertion

Dans `dsl-interpreter.js`:

```javascript
if ('myAssertion' in assertion) {
  const threshold = assertion.myAssertion;
  const passed = /* logique de validation */;
  return {
    passed,
    message: passed ? 'Success' : 'Failure'
  };
}
```

## Troubleshooting

### Erreur "Variable not found"
Vérifiez que la variable a bien été assignée dans un step précédent:

```yaml
- action: generateEntropy
  assign: entropy  # N'oubliez pas assign!

- action: generateWallet
  params:
    entropy: $entropy  # Maintenant disponible
```

### Erreur "Invalid action"
Vérifiez l'orthographe de l'action et consultez la liste des actions disponibles.

### Assertions qui échouent
Activez le mode verbose pour voir les valeurs réelles:

```bash
npm run test:verbose
```
