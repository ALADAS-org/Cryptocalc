# 📋 Synthèse du Projet DSL Cryptocalc

## Vue d'ensemble

Ce projet fournit un **DSL (Domain Specific Language)** complet pour tester les fonctionnalités cryptographiques de Cryptocalc via des scripts YAML lisibles et maintenables, intégrés avec Jest.

## 🏗 Architecture

### Composants principaux

```
┌─────────────────────────────────────────────────────────┐
│                    Fichiers YAML                        │
│              (tests/fixtures/*.yaml)                    │
│     - Définition des tests en langage déclaratif       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│                   DSL Parser                            │
│              (tests/dsl-parser.js)                      │
│     - Parse et valide la structure YAML                │
│     - Vérifie la cohérence des actions                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│                DSL Interpreter                          │
│            (tests/dsl-interpreter.js)                   │
│     - Exécute les steps                                │
│     - Gère le contexte et les variables                │
│     - Évalue les assertions                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│                CryptoService                            │
│         (www/crypto/crypto_service.js)                  │
│     - Génération d'entropie                            │
│     - Création de wallets (Simple, HD, SWORD)          │
│     - Dérivation BIP32                                 │
│     - Validation BIP39                                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│              Bibliothèques crypto                       │
│         (bip32, bip39, bitcoinjs-lib)                   │
└─────────────────────────────────────────────────────────┘
```

## 📁 Structure des fichiers

```
Cryptocalc/
│
├── package.json                     # Configuration npm et scripts
├── jest.config.js                   # Configuration Jest
├── README.md                        # Documentation principale
├── QUICKSTART.md                    # Guide de démarrage rapide
│
├── www/
│   └── crypto/
│       └── crypto_service.js        # Service cryptographique principal
│
└── tests/
    ├── dsl-parser.js               # Parser YAML → structure de test
    ├── dsl-interpreter.js          # Exécuteur de tests DSL
    ├── dsl-runner.test.js          # Runner Jest principal
    ├── setup.js                    # Configuration globale Jest
    ├── run-tests.js                # Script utilitaire CLI
    ├── examples.js                 # Exemples d'utilisation programmatique
    ├── DSL_DOCUMENTATION.md        # Documentation complète du DSL
    │
    └── fixtures/                   # Tests YAML
        ├── simple_wallet.yaml      # Tests wallets simples
        ├── hd_wallet.yaml          # Tests HD wallets
        ├── mnemonic_validation.yaml # Tests mnémoniques
        └── advanced_features.yaml  # Tests fonctionnalités avancées
```

## 🔧 Composants détaillés

### 1. DSL Parser (`tests/dsl-parser.js`)

**Responsabilités:**
- Parse les fichiers YAML
- Valide la structure des tests
- Vérifie que les actions sont valides
- Contrôle la cohérence des paramètres

**Méthodes principales:**
- `parse(filepath)` - Parse un fichier YAML
- `validate(testSuite)` - Valide la structure
- `parseDirectory(dirPath)` - Parse tous les YAML d'un dossier

**Exemple:**
```javascript
const parser = new DSLParser();
const testSuite = parser.parse('./tests/fixtures/simple_wallet.yaml');
```

### 2. DSL Interpreter (`tests/dsl-interpreter.js`)

**Responsabilités:**
- Exécute les steps des tests
- Gère le contexte d'exécution (variables)
- Résout les références aux variables ($var)
- Évalue les assertions
- Charge les fixtures

**Méthodes principales:**
- `executeStep(step)` - Exécute un step
- `resolveVariable(value)` - Résout une variable
- `evaluateAssertion(assertion)` - Évalue une assertion
- `loadFixtures(fixtures)` - Charge les fixtures
- `reset()` - Réinitialise le contexte

**Exemple:**
```javascript
const interpreter = new DSLInterpreter({ CryptoService });
await interpreter.executeStep({
  action: 'generateEntropy',
  params: { size: 256 },
  assign: 'entropy'
});
const entropy = interpreter.getContextVariable('entropy');
```

### 3. CryptoService (`www/crypto/crypto_service.js`)

**Responsabilités:**
- Génération d'entropie cryptographique
- Création de wallets (Simple, HD, SWORD)
- Dérivation d'adresses BIP32
- Validation et conversion de mnémoniques BIP39

**Méthodes principales:**
- `generateEntropy(size)` - Génère de l'entropie
- `generateWallet(type, entropy, blockchain, passphrase)` - Crée un wallet
- `deriveAddress(entropy, account, addressIndex, blockchain)` - Dérive une adresse
- `validateMnemonic(mnemonic)` - Valide un mnémonique
- `convertToMnemonic(entropy)` - Convertit entropy → mnemonic
- `convertToEntropy(mnemonic)` - Convertit mnemonic → entropy

**Types de wallets supportés:**
- `SIMPLE_WALLET` - Wallet simple non hiérarchique
- `HD_WALLET` - Wallet hiérarchique déterministe (BIP32)
- `SWORD_WALLET` - Simple Wallet Over Randomized Deterministic

### 4. Test Runner (`tests/dsl-runner.test.js`)

**Responsabilités:**
- Intégration avec Jest
- Exécution des tests YAML
- Validation des résultats
- Génération de rapports

**Structure:**
```javascript
describe('DSL Test Runner', () => {
  // Setup
  beforeAll(() => { /* Initialisation */ });
  beforeEach(() => { /* Reset contexte */ });
  
  // Tests spécifiques
  describe('Simple Wallet Generation', () => { /* ... */ });
  describe('HD Wallet Generation', () => { /* ... */ });
  describe('Mnemonic Validation', () => { /* ... */ });
  
  // Tests du framework
  describe('Parser Validation', () => { /* ... */ });
  describe('Interpreter Variable Resolution', () => { /* ... */ });
});
```

## 🎯 Flux d'exécution

### Scénario typique: Générer un wallet HD

```
1. Utilisateur crée un fichier YAML:
   tests/fixtures/mon_test.yaml
   
2. DSL Parser parse le fichier:
   testSuite = parser.parse('mon_test.yaml')
   
3. DSL Interpreter exécute les steps:
   - generateEntropy(256) → entropy
   - generateWallet(HD_WALLET, entropy) → hdWallet
   - deriveAddress(entropy, 0, 0) → address
   
4. Les variables sont stockées dans le contexte:
   context = {
     entropy: "a1b2c3...",
     hdWallet: { type: "HD_WALLET", ... },
     address: { path: "m/44'/0'/0'/0/0", ... }
   }
   
5. Les assertions sont évaluées:
   - hdWallet.type === "HD_WALLET" ✓
   - address.path === "m/44'/0'/0'/0/0" ✓
   
6. Jest rapporte les résultats:
   ✓ Test passed (45ms)
```

## 📊 Types de données

### Structure d'un Test Suite

```yaml
name: string                    # Nom du test suite
description?: string            # Description optionnelle
imports?: string[]              # Services importés
setup?: object                  # Configuration initiale
tests: Test[]                   # Liste des tests
fixtures?: object               # Données de test réutilisables
```

### Structure d'un Test

```yaml
name: string                    # Nom du test
description?: string            # Description optionnelle
steps: Step[]                   # Liste des étapes
assertions?: Assertion[]        # Liste des assertions
```

### Structure d'un Step

```yaml
action: string                  # Action à exécuter
params?: object                 # Paramètres de l'action
assign?: string                 # Variable d'assignation
target?: string                 # Cible (pour save)
```

### Structure d'une Assertion

```yaml
property: string                # Propriété à tester ($var.prop)
equals?: any                    # Égalité
notEquals?: any                 # Non-égalité
hasLength?: number              # Longueur
matches?: string                # Expression régulière
greaterThan?: number            # Plus grand que
lessThan?: number               # Plus petit que
contains?: string               # Contient
isTrue?: boolean                # Est vrai
isFalse?: boolean               # Est faux
description?: string            # Description de l'assertion
```

## 🔐 Support cryptographique

### Algorithmes supportés
- **Entropie**: CSPRNG (Crypto Secure Pseudo Random Number Generator)
- **Hashing**: SHA-256, RIPEMD-160
- **Dérivation**: HMAC-SHA512 (BIP32)
- **Mnémoniques**: BIP39 wordlists
- **Courbes elliptiques**: secp256k1

### Blockchains supportées
- Bitcoin (BTC) - P2PKH addresses
- Ethereum (ETH) - 0x... addresses
- Litecoin (LTC) - P2PKH addresses
- Extensible pour d'autres blockchains

### Standards implémentés
- **BIP32**: Hierarchical Deterministic Wallets
- **BIP39**: Mnemonic code for generating deterministic keys
- **BIP44**: Multi-Account Hierarchy for Deterministic Wallets

## 🧪 Stratégie de test

### Tests unitaires
- Génération d'entropie
- Création de wallets
- Dérivation d'adresses
- Validation de mnémoniques
- Conversion entropie ↔ mnémonique

### Tests d'intégration
- Workflow complet: entropie → wallet → sauvegarde
- Multi-blockchain
- HD wallet avec dérivation multiple

### Tests de régression
- Fixtures avec valeurs connues
- Vérification du déterminisme
- Stabilité des conversions

### Tests de validation
- Formats d'adresses
- Chemins de dérivation BIP32
- Longueurs de mnémoniques
- Tailles d'entropie

## 📈 Métriques de qualité

### Objectifs de couverture
- Branches: ≥ 80%
- Fonctions: ≥ 80%
- Lignes: ≥ 80%
- Statements: ≥ 80%

### Temps d'exécution
- Tests unitaires: < 100ms par test
- Tests d'intégration: < 500ms par test
- Suite complète: < 5s

## 🚀 Commandes principales

```bash
# Installation
npm install

# Tests
npm test                    # Tous les tests
npm run test:dsl           # Tests DSL uniquement
npm run test:watch         # Mode watch
npm run test:coverage      # Avec couverture

# Utilitaires
node tests/run-tests.js --help
node tests/examples.js
```

## 🔮 Extensions futures possibles

### Actions supplémentaires
- `encryptBip38` - Encryption BIP38
- `decryptBip38` - Décryption BIP38
- `signMessage` - Signature de message
- `verifySignature` - Vérification de signature
- `importWallet` - Import depuis WIF

### Assertions supplémentaires
- `isValidBip32Path` - Validation chemin BIP32
- `isValidAddress` - Validation adresse par blockchain
- `matchesChecksum` - Validation checksum

### Fonctionnalités
- Support de plus de blockchains
- Tests de performance
- Génération de rapports HTML
- Mode interactif
- CI/CD integration

## 📝 Bonnes pratiques

### Pour les tests YAML
1. Noms descriptifs et explicites
2. Tests atomiques (une fonctionnalité par test)
3. Fixtures pour la régression
4. Assertions multiples pour validation complète
5. Documentation via descriptions

### Pour le code
1. Validation stricte des entrées
2. Gestion appropriée des erreurs
3. Logging pour le débogage
4. Code commenté et documenté
5. Tests unitaires pour chaque fonction

### Pour la sécurité
1. Ne jamais logger les clés privées
2. Utiliser des sources d'entropie sécurisées
3. Valider tous les inputs
4. Nettoyer les données sensibles après usage
5. Tests de sécurité réguliers

## 📚 Ressources

- [BIP32 Spec](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki)
- [BIP39 Spec](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)
- [BIP44 Spec](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)
- [Jest Documentation](https://jestjs.io/)
- [YAML Spec](https://yaml.org/spec/)

## 🎓 Conclusion

Ce framework DSL fournit:
- ✅ Tests lisibles et maintenables
- ✅ Intégration Jest complète
- ✅ Support cryptographique robuste
- ✅ Extensibilité et modularité
- ✅ Documentation exhaustive
- ✅ Exemples pratiques

Le DSL permet aux développeurs et testeurs de créer rapidement des tests complexes sans écrire de code JavaScript, tout en maintenant la flexibilité nécessaire pour des cas d'usage avancés.
