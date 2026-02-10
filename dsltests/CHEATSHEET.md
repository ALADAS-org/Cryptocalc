# 📝 Aide-Mémoire Cryptocalc DSL

## 🚀 Commandes Rapides

### Installation
```bash
cd cryptocalc-dsl
npm install
```

### Exécution des Tests

#### Avec Jest (recommandé pour développement)
```bash
# Tous les tests
npm test

# Tests DSL uniquement
npm run test:dsl

# Mode watch (re-exécute à chaque modification)
npm run test:watch

# Avec coverage
npm run test:coverage

# Test spécifique
npm test -- tests/fixtures/test_demo.yaml
```

#### Avec le CLI
```bash
# Test spécifique
node run-dsl-tests.js tests/fixtures/test_demo.yaml

# Mode verbose
node run-dsl-tests.js -v tests/fixtures/test_demo.yaml

# Sortie JSON
node run-dsl-tests.js --json tests/fixtures/test_demo.yaml

# Tous les tests d'un répertoire
node run-dsl-tests.js tests/fixtures/

# Aide
node run-dsl-tests.js --help
```

## 📁 Fichiers Importants

### Documentation
```
README.md           - Documentation principale
INTEGRATION.md      - Guide d'intégration avec Cryptocalc
PRESENTATION.md     - Présentation complète
PROJECT_STRUCTURE.md - Structure et statistiques
```

### Code Source
```
src/dsl/parser.js       - Parser YAML
src/dsl/interpreter.js  - Interpréteur DSL
src/dsl/mock-services.js - Services mockés
```

### Tests
```
tests/dsl-runner.test.js - Runner Jest
tests/fixtures/*.yaml    - Tests YAML
```

## ✍️ Créer un Nouveau Test

### Structure de Base
```yaml
name: "Mon Test"
description: "Description optionnelle"

setup:
  entropy_size: 256
  blockchain: BTC

tests:
  - name: "Test 1"
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

### Sauvegarder dans
```bash
tests/fixtures/mon_test.yaml
```

### Exécuter
```bash
npm test
# ou
node run-dsl-tests.js tests/fixtures/mon_test.yaml
```

## 🎯 Actions Disponibles

```yaml
# Générer de l'entropie
- action: generateEntropy
  params:
    size: 256  # 128, 160, 192, 224, 256
  assign: entropy

# Créer un wallet
- action: generateWallet
  params:
    type: HD_WALLET  # HD_WALLET, SIMPLE_WALLET, SWORD_WALLET
    entropy: $entropy
    blockchain: BTC  # BTC, ETH, XRP, ADA, etc.
    passphrase: "optional"
  assign: wallet

# Chiffrer avec BIP38
- action: encrypt
  params:
    privateKey: $wallet.privateKey
    passphrase: "MyPass"
    difficulty: 16384  # optionnel
  assign: encrypted

# Déchiffrer BIP38
- action: decrypt
  params:
    encryptedKey: $encrypted
    passphrase: "MyPass"
  assign: decrypted

# Sauvegarder
- action: save
  target: $wallet
  params:
    includeEncrypted: true
  assign: result

# Dériver une clé BIP32
- action: deriveKey
  params:
    masterKey: $wallet.privateKey
    path: "m/44'/0'/0'/0/0"
  assign: derived

# Valider une adresse
- action: validateAddress
  params:
    address: $wallet.address
    blockchain: BTC
  assign: isValid

# Calculer un checksum
- action: computeChecksum
  params:
    data: $entropy
    algorithm: sha256
  assign: checksum
```

## ✅ Types d'Assertions

```yaml
# Égalité
- property: $value
  equals: "expected"

# Inégalité
- property: $value
  notEquals: "notExpected"

# Longueur
- property: $array
  hasLength: 24

# Regex
- property: $address
  matches: "^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$"

# Comparaisons
- property: $number
  greaterThan: 100
- property: $number
  lessThan: 200

# Contient
- property: $text
  contains: "substring"

# Booléens
- property: $bool
  isTrue: true
- property: $bool
  isFalse: true

# Existence
- property: $value
  isDefined: true
```

## 🔧 Intégration avec Cryptocalc

### 1. Copier les fichiers
```bash
# Dans le dossier Cryptocalc
cp -r cryptocalc-dsl/src/dsl tests/
cp -r cryptocalc-dsl/tests/fixtures tests/
cp cryptocalc-dsl/tests/dsl-runner.test.js tests/
```

### 2. Installer les dépendances
```bash
npm install --save-dev jest js-yaml
```

### 3. Ajouter les scripts dans package.json
```json
{
  "scripts": {
    "test": "jest",
    "test:dsl": "jest tests/dsl-runner.test.js"
  }
}
```

### 4. Créer l'adaptateur de services
Voir `INTEGRATION.md` section "Étape 3"

### 5. Exécuter
```bash
npm test
```

## 🐛 Debugging

### Logs Verbeux
```bash
node run-dsl-tests.js -v test.yaml
```

### Inspecter le Contexte
```javascript
// Dans un test Jest
it('debug', async () => {
  await interpreter.executeTestSuite(testSuite);
  console.log(interpreter.getContext());
});
```

### Mode Debug Jest
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
# Ouvrir chrome://inspect
```

## 📊 Coverage

### Générer le Coverage
```bash
npm run test:coverage
```

### Voir le Rapport
```bash
# Ouvrir dans le navigateur
open coverage/lcov-report/index.html
```

## 🔄 CI/CD

### GitHub Actions
```yaml
# .github/workflows/test.yml
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
```

### GitLab CI
```yaml
# .gitlab-ci.yml
test:
  image: node:18
  script:
    - npm install
    - npm test
    - npm run test:coverage
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'
```

## 📦 Distribution

### Créer une Archive
```bash
tar --exclude='node_modules' -czf cryptocalc-dsl.tar.gz cryptocalc-dsl/
```

### NPM Package
```bash
npm pack
# Génère: cryptocalc-dsl-1.0.0.tgz
```

### Git Repository
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <url>
git push -u origin main
```

## 🎨 Exemples Rapides

### Test Simple
```yaml
name: "Quick Test"
tests:
  - name: "Generate wallet"
    steps:
      - action: generateEntropy
        assign: e
      - action: generateWallet
        params: { entropy: $e, blockchain: BTC }
        assign: w
    assertions:
      - property: $w.address
        isDefined: true
```

### Test BIP38
```yaml
name: "BIP38 Test"
tests:
  - name: "Encrypt/Decrypt"
    steps:
      - action: generateWallet
        params: { blockchain: BTC }
        assign: w
      - action: encrypt
        params: { privateKey: $w.privateKey, passphrase: "pass" }
        assign: enc
      - action: decrypt
        params: { encryptedKey: $enc, passphrase: "pass" }
        assign: dec
    assertions:
      - property: $enc
        matches: "^6PR"
```

### Test Multi-Chain
```yaml
name: "Multi-Chain"
tests:
  - name: "Compare chains"
    steps:
      - action: generateEntropy
        assign: e
      - action: generateWallet
        params: { entropy: $e, blockchain: BTC }
        assign: btc
      - action: generateWallet
        params: { entropy: $e, blockchain: ETH }
        assign: eth
    assertions:
      - property: $btc.entropy
        equals: $eth.entropy
```

## 🆘 Dépannage

### Problème: Tests ne s'exécutent pas
```bash
# Vérifier l'installation
npm list jest js-yaml

# Réinstaller
rm -rf node_modules
npm install
```

### Problème: Erreur de parsing YAML
```bash
# Valider la syntaxe
node -e "require('js-yaml').load(require('fs').readFileSync('test.yaml', 'utf8'))"
```

### Problème: Variables non résolues
- Vérifier que la variable est assignée avant utilisation
- Utiliser le mode verbose: `node run-dsl-tests.js -v`

### Problème: Assertions échouent
- Vérifier le type de données attendu
- Utiliser `console.log` dans l'interpréteur
- Activer les logs verbeux

## 📚 Ressources

### Documentation
- [README.md](README.md) - Guide principal
- [INTEGRATION.md](INTEGRATION.md) - Intégration
- [PRESENTATION.md](PRESENTATION.md) - Présentation complète

### Exemples
- `tests/fixtures/` - Tous les exemples de tests
- `tests/dsl-runner.test.js` - Tests unitaires

### Liens Utiles
- [Jest Documentation](https://jestjs.io/)
- [YAML Specification](https://yaml.org/)
- [Cryptocalc Repository](https://github.com/ALADAS-org/Cryptocalc)

## 🎯 Checklist de Démarrage

- [ ] Installer les dépendances (`npm install`)
- [ ] Exécuter les tests d'exemple (`npm test`)
- [ ] Lire README.md
- [ ] Créer un premier test simple
- [ ] Exécuter votre test
- [ ] Consulter INTEGRATION.md si besoin
- [ ] Adapter les services pour Cryptocalc
- [ ] Créer vos tests métier
- [ ] Configurer CI/CD

## ✨ Raccourcis Clavier (mode watch)

```
# En mode watch (npm run test:watch)
p - Filtrer par nom de fichier
t - Filtrer par nom de test
a - Exécuter tous les tests
q - Quitter
```

---

**Bon test !** 🚀
