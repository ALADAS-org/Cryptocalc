# 🎯 Cryptocalc DSL Testing Framework - Présentation Complète

## Vue d'Ensemble

Le **Cryptocalc DSL Testing Framework** est un système de tests déclaratifs basé sur YAML qui permet de tester les fonctionnalités cryptographiques de Cryptocalc de manière simple, lisible et maintenable.

## 🌟 Caractéristiques Principales

### 1. Syntaxe Déclarative en YAML
- Tests lisibles par des non-développeurs
- Séparation claire entre la logique et les données de test
- Réutilisation facile des fixtures

### 2. Couverture Complète des Fonctionnalités
- ✅ Génération de wallets (HD, Simple, SWORD)
- ✅ Support multi-blockchain (BTC, ETH, XRP, ADA, etc.)
- ✅ Chiffrement/déchiffrement BIP38
- ✅ Dérivation BIP32
- ✅ Validation d'adresses
- ✅ Calcul de checksums

### 3. Système d'Assertions Riche
- Égalité, inégalité
- Expressions régulières
- Comparaisons numériques
- Vérifications de longueur
- Tests booléens
- Vérification d'existence

### 4. Gestion de Variables
- Assignation et réutilisation de variables
- Chaînage d'opérations
- Variables de setup globales

### 5. Intégration Jest
- Compatible avec l'écosystème Jest
- Support du coverage
- Exécution parallèle
- Mode watch pour développement

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Test YAML Files                          │
│  (test_hd_wallet.yaml, test_bip38.yaml, etc.)              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                    DSL Parser                                │
│  - Charge les fichiers YAML                                 │
│  - Valide la structure                                      │
│  - Vérifie les actions disponibles                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                  DSL Interpreter                             │
│  - Exécute les étapes séquentiellement                     │
│  - Gère le contexte et les variables                       │
│  - Résout les dépendances                                  │
│  - Vérifie les assertions                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                    Services Layer                            │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    Crypto    │  │    BIP38     │  │    BIP32     │     │
│  │   Service    │  │   Service    │  │   Service    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐                       │
│  │   Address    │  │   Checksum   │                       │
│  │  Validator   │  │   Service    │                       │
│  └──────────────┘  └──────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

## 💡 Exemple Complet

### Fichier YAML (test_example.yaml)

```yaml
name: "Complete Wallet Workflow"
description: "Génération, chiffrement et validation d'un wallet"

setup:
  entropy_size: 256
  blockchain: BTC

tests:
  - name: "Full workflow test"
    steps:
      # 1. Générer l'entropie
      - action: generateEntropy
        params:
          size: 256
        assign: entropy
        
      # 2. Créer le wallet
      - action: generateWallet
        params:
          type: HD_WALLET
          entropy: $entropy
          blockchain: BTC
          passphrase: "MyBip32Pass"
        assign: wallet
        
      # 3. Chiffrer la clé privée
      - action: encrypt
        params:
          privateKey: $wallet.privateKey
          passphrase: "MyBip38Pass"
        assign: encrypted
        
      # 4. Valider l'adresse
      - action: validateAddress
        params:
          address: $wallet.address
          blockchain: BTC
        assign: isValid
        
      # 5. Sauvegarder
      - action: save
        target: $wallet
        assign: saveResult
        
    assertions:
      # Vérifier l'entropie
      - property: $entropy
        hasLength: 64
        
      # Vérifier le wallet
      - property: $wallet.type
        equals: HD_WALLET
      - property: $wallet.address
        matches: "^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$"
        
      # Vérifier le chiffrement
      - property: $encrypted
        matches: "^6PR"
        
      # Vérifier la validation
      - property: $isValid
        isTrue: true
        
      # Vérifier la sauvegarde
      - property: $saveResult.success
        isTrue: true
```

### Exécution

```bash
# Avec Jest
npm test

# Avec le CLI
node run-dsl-tests.js tests/fixtures/test_example.yaml

# Mode verbose
node run-dsl-tests.js -v tests/fixtures/test_example.yaml
```

### Sortie

```
📋 Running: Complete Wallet Workflow

=== Executing test suite: Complete Wallet Workflow ===
Description: Génération, chiffrement et validation d'un wallet

  → Test: Full workflow test
    Step 1: generateEntropy
      → Generated entropy: a1b2c3d4e5f6789...
      → Assigned to $entropy
    Step 2: generateWallet
      → Generated HD_WALLET wallet for BTC
      → Assigned to $wallet
    Step 3: encrypt
      → Encrypted private key
      → Assigned to $encrypted
    Step 4: validateAddress
      → Address validation: true
      → Assigned to $isValid
    Step 5: save
      → Wallet saved
      → Assigned to $saveResult
      ✓ Length is 64
      ✓ Value equals HD_WALLET
      ✓ Value matches pattern
      ✓ Value matches pattern
      ✓ Value is true
      ✓ Value is true
  ✓ Test passed

═══════════════════════════════════════
📊 Test Summary
═══════════════════════════════════════
Total Tests:   1
✓ Passed:      1
✗ Failed:      0
Success Rate:  100.00%
═══════════════════════════════════════
```

## 🚀 Cas d'Usage

### 1. Tests de Régression
Vérifier qu'une entropie connue produit toujours les mêmes résultats:

```yaml
tests:
  - name: "Regression test"
    steps:
      - action: generateWallet
        params:
          entropy: "a1b2c3d4..." # Entropie fixe
          blockchain: BTC
        assign: wallet
    assertions:
      - property: $wallet.address
        equals: "1A1zP..." # Adresse attendue
```

### 2. Tests Multi-Blockchain
Vérifier le comportement sur plusieurs blockchains:

```yaml
tests:
  - name: "Multi-chain test"
    steps:
      - action: generateEntropy
        assign: entropy
      - action: generateWallet
        params:
          entropy: $entropy
          blockchain: BTC
        assign: btc
      - action: generateWallet
        params:
          entropy: $entropy
          blockchain: ETH
        assign: eth
    assertions:
      - property: $btc.secretPhrase
        equals: $eth.secretPhrase
```

### 3. Tests de Sécurité
Vérifier le comportement du chiffrement BIP38:

```yaml
tests:
  - name: "BIP38 security"
    steps:
      - action: generateWallet
        assign: wallet
      - action: encrypt
        params:
          privateKey: $wallet.privateKey
          passphrase: "pass1"
        assign: enc1
      - action: encrypt
        params:
          privateKey: $wallet.privateKey
          passphrase: "pass2"
        assign: enc2
    assertions:
      - property: $enc1
        notEquals: $enc2  # Différents passphrases = différents chiffrés
```

### 4. Tests de Validation
Tester les validateurs d'adresses:

```yaml
tests:
  - name: "Address validation"
    steps:
      - action: validateAddress
        params:
          address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
          blockchain: BTC
        assign: valid
      - action: validateAddress
        params:
          address: "InvalidAddress"
          blockchain: BTC
        assign: invalid
    assertions:
      - property: $valid
        isTrue: true
      - property: $invalid
        isFalse: true
```

## 📈 Avantages

### Pour les Développeurs
- ✅ Tests rapides à écrire (YAML vs JavaScript)
- ✅ Moins de code boilerplate
- ✅ Réutilisation des fixtures
- ✅ Debugging facilité avec logs verbeux
- ✅ Intégration CI/CD simple

### Pour les Testeurs
- ✅ Syntaxe accessible (pas besoin de connaître JavaScript)
- ✅ Tests lisibles et documentés
- ✅ Modification facile des paramètres
- ✅ Ajout de nouveaux tests sans coder

### Pour le Projet
- ✅ Meilleure couverture de tests
- ✅ Documentation vivante (les tests servent de doc)
- ✅ Détection rapide des régressions
- ✅ Validation automatisée

## 📦 Livrables

### Code Source
1. **Parser DSL** (`src/dsl/parser.js`)
   - Charge et valide les fichiers YAML
   - ~200 lignes de code

2. **Interpréteur DSL** (`src/dsl/interpreter.js`)
   - Exécute les tests et vérifie les assertions
   - ~500 lignes de code

3. **Services Mockés** (`src/dsl/mock-services.js`)
   - Simulations des services crypto pour tests rapides
   - ~150 lignes de code

### Tests YAML
4. **test_hd_wallet_btc.yaml** - Tests wallets HD Bitcoin
5. **test_multi_blockchain.yaml** - Tests multi-chaînes
6. **test_bip38.yaml** - Tests chiffrement BIP38
7. **test_address_validation.yaml** - Tests validation d'adresses
8. **test_advanced.yaml** - Tests avancés avec fixtures
9. **test_demo.yaml** - Démonstration rapide

### Infrastructure
10. **Runner Jest** (`tests/dsl-runner.test.js`)
    - Intégration avec Jest
    - ~350 lignes de code

11. **CLI** (`run-dsl-tests.js`)
    - Outil en ligne de commande
    - ~200 lignes de code

### Documentation
12. **README.md** - Documentation principale
13. **INTEGRATION.md** - Guide d'intégration avec Cryptocalc
14. **Ce document** - Présentation complète

## 🎓 Formation Rapide

### Créer votre Premier Test (5 minutes)

1. Créez `my_test.yaml`:

```yaml
name: "My First Test"

tests:
  - name: "Generate wallet"
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
        isDefined: true
```

2. Exécutez:

```bash
node run-dsl-tests.js my_test.yaml
```

3. C'est tout ! ✨

## 🔧 Maintenance

### Ajouter une Action
1. Mettre à jour `validActions` dans `parser.js`
2. Ajouter le `case` dans `interpreter.js`
3. Implémenter la méthode `execute[Action]`

### Ajouter une Assertion
1. Modifier `checkAssertion` dans `interpreter.js`
2. Ajouter votre logique de vérification

## 📊 Statistiques

- **~1500 lignes de code** (framework complet)
- **9 types d'assertions** différentes
- **8 actions** de base extensibles
- **5 services** mockés ou réels
- **9 fichiers de tests** d'exemple

## 🎯 Conclusion

Le Cryptocalc DSL Testing Framework offre une solution élégante, puissante et accessible pour tester les fonctionnalités cryptographiques. Il combine la simplicité d'écriture des tests YAML avec la puissance de Jest, tout en restant extensible et maintenable.

**Idéal pour:**
- Tests unitaires rapides
- Tests d'intégration
- Tests de régression
- Documentation technique
- Formation d'équipe

---

**Prêt à l'utiliser ?** Consultez le [README.md](README.md) pour commencer ! 🚀
