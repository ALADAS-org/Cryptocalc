# CryptoCalc API - Documentation complète

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Démarrage rapide](#démarrage-rapide)
- [Endpoints disponibles](#endpoints-disponibles)
  - [Health Check](#1-health-check)
  - [Simple Wallet](#2-simple-wallet)
  - [HD Wallet (Hiérarchique)](#3-hd-wallet-hiérarchique)
- [Cryptomonnaies supportées](#cryptomonnaies-supportées)
- [Standards et spécifications](#standards-et-spécifications)
- [Exemples d'utilisation](#exemples-dutilisation)
- [Tests](#tests)
- [Gestion des erreurs](#gestion-des-erreurs)
- [Sécurité](#sécurité)

---

## Vue d'ensemble

CryptoCalc API est un serveur REST qui permet de générer des portefeuilles de cryptomonnaies de manière déterministe. L'API supporte deux types de génération de portefeuilles :

- **Simple Wallet** : Génération directe à partir d'une entropie
- **HD Wallet** : Génération hiérarchique conforme aux standards BIP32/BIP44

**Configuration par défaut :**
- **Port** : 3001
- **Host** : 127.0.0.1 (localhost)
- **Base URL** : `http://localhost:3001`

---

## Démarrage rapide

### 1. Démarrer le serveur

```bash
node www/js/api/api_start.js
```

**Sortie attendue :**
```
🔍 Vérification du port 3001...
✓ Port 3001 disponible

================================================
🚀 SERVEUR CRYPTOCALC DÉMARRÉ AVEC SUCCÈS !
================================================

📊 INFORMATIONS :
  • Port: 3001
  • URL: http://localhost:3001
  • Health: http://localhost:3001/health
```

### 2. Vérifier le statut

```bash
curl http://localhost:3001/health
```

### 3. Générer votre premier wallet

```bash
curl "http://localhost:3001/api/wallet/bitcoin/json?entropy=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
```

---

## Endpoints disponibles

### 1. Health Check

**Endpoint:** `GET /health`

Vérifie que le serveur est en ligne et fonctionnel.

#### Paramètres
Aucun.

#### Réponse

```json
{
  "status": "online",
  "port": 3001,
  "timestamp": "2025-02-09T13:45:23.456Z",
  "service": "CryptoCalc API v1.0"
}
```

#### Exemples

**cURL :**
```bash
curl http://localhost:3001/health
```

**JavaScript (Node.js) :**
```javascript
const http = require('http');

http.get('http://localhost:3001/health', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log(JSON.parse(data)));
});
```

**Python :**
```python
import requests
response = requests.get('http://localhost:3001/health')
print(response.json())
```

---

### 2. Simple Wallet

**Endpoint:** `GET /api/wallet/:coin/json`

Génère un portefeuille simple (non-hiérarchique) à partir d'une entropie donnée.

#### Paramètres

| Paramètre | Type | Obligatoire | Description |
|-----------|------|-------------|-------------|
| `:coin` | Path | ✅ | Nom de la cryptomonnaie (voir liste supportée) |
| `entropy` | Query | ✅ | Chaîne hexadécimale de 64 caractères (256 bits) |
| `net` | Query | ❌ | Réseau : "mainnet" ou "testnet" (défaut: "mainnet") |

#### Réponse

```json
{
  "success": true,
  "data": {
    "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    "privateKeyWIF": "5J3mBbAH58CpQ3Y5RNJpQYvE8aYaiA1tHZ...",
    "privateKey": "0c28fca386c7a227600b2fe50b7cae11ec86d3bf1fbe471be89827e19d72aa1d",
    "mnemonics": "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
    "blockchain": "BITCOIN",
    "network": "mainnet",
    "uuid": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

#### Champs de réponse

| Champ | Type | Description |
|-------|------|-------------|
| `success` | boolean | Indique si la requête a réussi |
| `data.address` | string | Adresse publique du portefeuille |
| `data.privateKeyWIF` | string\|null | Clé privée au format WIF (uniquement pour Bitcoin, Litecoin, Dogecoin, Terra) |
| `data.privateKey` | string | Clé privée en hexadécimal |
| `data.mnemonics` | string | Phrase mnémonique BIP39 (12-24 mots) |
| `data.blockchain` | string | Nom de la blockchain |
| `data.network` | string | Réseau utilisé (mainnet/testnet) |
| `data.uuid` | string | Identifiant unique du portefeuille |

#### Exemples

**Bitcoin (mainnet) :**
```bash
curl "http://localhost:3001/api/wallet/bitcoin/json?entropy=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
```

**Ethereum (mainnet) :**
```bash
curl "http://localhost:3001/api/wallet/ethereum/json?entropy=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
```

**Dogecoin (testnet) :**
```bash
curl "http://localhost:3001/api/wallet/dogecoin/json?entropy=bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb&net=testnet"
```

**JavaScript (fetch) :**
```javascript
const entropy = '0123456789abcdef'.repeat(4);
const url = `http://localhost:3001/api/wallet/bitcoin/json?entropy=${entropy}`;

fetch(url)
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      console.log('Address:', data.data.address);
      console.log('Private Key:', data.data.privateKey);
    }
  });
```

---

### 3. HD Wallet (Hiérarchique)

**Endpoint:** `GET /api/hdwallet/:coin/json`

Génère un portefeuille hiérarchique déterministe (HD) conforme au standard BIP32/BIP44.

#### Paramètres

| Paramètre | Type | Obligatoire | Description |
|-----------|------|-------------|-------------|
| `:coin` | Path | ✅ | Nom de la cryptomonnaie (voir liste supportée) |
| `entropy` | Query | ✅ | Chaîne hexadécimale de 64 caractères (256 bits) |
| `net` | Query | ❌ | Réseau : "mainnet" ou "testnet" (défaut: "mainnet") |
| `accountIndex` | Query | ❌ | Index du compte BIP44 (défaut: 0, min: 0) |
| `addressIndex` | Query | ❌ | Index de l'adresse BIP44 (défaut: 0, min: 0) |
| `changeIndex` | Query | ❌ | Index de change BIP44 (défaut: 0, min: 0, valeurs: 0 ou 1) |

#### Réponse

```json
{
  "success": true,
  "data": {
    "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    "privateKeyWIF": "5J3mBbAH58CpQ3Y5RNJpQYvE8aYaiA1tHZ...",
    "privateKey": "0c28fca386c7a227600b2fe50b7cae11ec86d3bf1fbe471be89827e19d72aa1d",
    "mnemonics": "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
    "blockchain": "BITCOIN",
    "network": "mainnet",
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "derivationPath": "m/44'/0'/0'/0/0",
    "accountIndex": 0,
    "addressIndex": 0,
    "changeIndex": 0
  }
}
```

#### Champs de réponse additionnels

| Champ | Type | Description |
|-------|------|-------------|
| `data.derivationPath` | string | Chemin de dérivation BIP44 complet |
| `data.accountIndex` | number | Index du compte utilisé |
| `data.addressIndex` | number | Index de l'adresse utilisée |
| `data.changeIndex` | number | Index de change utilisé (0=externe, 1=interne) |

#### Chemin de dérivation BIP44

Format standard : `m / 44' / coin_type' / account' / change / address_index`

**Exemple :** `m/44'/0'/0'/0/0`
- `m` : Master (racine)
- `44'` : BIP44 (hardenée)
- `0'` : Bitcoin coin type (hardenée)
- `0'` : Compte 0 (hardenée)
- `0` : Adresses externes (non-hardenée)
- `0` : Première adresse (non-hardenée)

#### Exemples

**Bitcoin - Compte 0, Adresse 0 (par défaut) :**
```bash
curl "http://localhost:3001/api/hdwallet/bitcoin/json?entropy=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
```
Chemin : `m/44'/0'/0'/0/0`

**Bitcoin - Compte 1, Adresse 5 :**
```bash
curl "http://localhost:3001/api/hdwallet/bitcoin/json?entropy=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef&accountIndex=1&addressIndex=5"
```
Chemin : `m/44'/0'/1'/0/5`

**Ethereum - Compte 0, Adresse 10 :**
```bash
curl "http://localhost:3001/api/hdwallet/ethereum/json?entropy=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&addressIndex=10"
```
Chemin : `m/44'/60'/0'/0/10`

**Bitcoin - Adresses de change (compte 0, change 1, adresse 3) :**
```bash
curl "http://localhost:3001/api/hdwallet/bitcoin/json?entropy=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef&changeIndex=1&addressIndex=3"
```
Chemin : `m/44'/0'/0'/1/3`

**JavaScript - Génération de plusieurs adresses :**
```javascript
const entropy = '0123456789abcdef'.repeat(4);
const baseUrl = 'http://localhost:3001/api/hdwallet/bitcoin/json';

// Générer les 5 premières adresses du compte 0
for (let i = 0; i < 5; i++) {
  const url = `${baseUrl}?entropy=${entropy}&addressIndex=${i}`;
  
  fetch(url)
    .then(res => res.json())
    .then(data => {
      console.log(`Address ${i}: ${data.data.address}`);
      console.log(`Path: ${data.data.derivationPath}`);
    });
}
```

---

## Cryptomonnaies supportées

Les deux endpoints (Simple Wallet et HD Wallet) supportent les cryptomonnaies suivantes :

| Blockchain | Paramètre URL | Coin Type BIP44 | WIF Support | Format d'adresse |
|------------|---------------|-----------------|-------------|------------------|
| Bitcoin | `bitcoin` ou `BITCOIN` | 0 | ✅ | 1... (P2PKH) |
| Ethereum | `ethereum` ou `ETHEREUM` | 60 | ❌ | 0x... |
| Dogecoin | `dogecoin` ou `DOGECOIN` | 3 | ✅ | D... |
| Litecoin | `litecoin` ou `LITECOIN` | 2 | ✅ | L... |
| Solana | `solana` ou `SOLANA` | 501 | ❌ | Base58 |
| Avalanche | `avalanche` ou `AVALANCHE` | 9000 | ❌ | 0x... |
| Polygon | `polygon` ou `POLYGON` | 966 | ❌ | 0x... |
| TonCoin | `toncoin` ou `TON` | 607 | ❌ | EQ... |
| Terra | `terra` ou `TERRA_LUNA` | 330 | ✅ | terra... |

**Notes :**
- Les noms sont **insensibles à la casse** : `bitcoin`, `Bitcoin`, `BITCOIN` sont équivalents
- Alias acceptés : `TONCOIN` = `TON`, `TERRA` = `TERRA_LUNA`
- Le format WIF (Wallet Import Format) n'est disponible que pour les blockchains UTXO

---

## Standards et spécifications

### BIP39 - Mnémoniques

Toutes les générations de portefeuilles utilisent le standard BIP39 pour créer des phrases mnémoniques :
- **Longueur** : 12 ou 24 mots (selon l'implémentation)
- **Langues supportées** : Anglais, Français, Espagnol, etc.
- **Entropie** : 128-256 bits

### BIP32 - Dérivation hiérarchique

Le standard BIP32 permet la dérivation de clés enfants à partir d'une clé parent :
- **Dérivation hardenée** (') : Pour les niveaux purpose, coin_type, account
- **Dérivation non-hardenée** : Pour change et address_index

### BIP44 - Multi-Account Hierarchy

Structure standardisée pour les HD Wallets :
```
m / purpose' / coin_type' / account' / change / address_index
```

**Niveaux :**
- `purpose` : Toujours 44' pour BIP44
- `coin_type` : Type de crypto (0 pour Bitcoin, 60 pour Ethereum, etc.)
- `account` : Compte utilisateur (0, 1, 2...)
- `change` : 0 pour adresses externes, 1 pour adresses de change
- `address_index` : Index de l'adresse (0, 1, 2...)

### WIF - Wallet Import Format

Format standard pour encoder les clés privées (Bitcoin, Litecoin, Dogecoin) :
- **Mainnet Bitcoin** : Commence par '5' (non compressé) ou 'K'/'L' (compressé)
- **Testnet Bitcoin** : Commence par '9' (non compressé) ou 'c' (compressé)
- **Longueur** : 51 ou 52 caractères

---

## Exemples d'utilisation

### Cas d'usage 1 : Portefeuille simple pour test

```bash
# Générer un wallet Bitcoin simple pour test
curl "http://localhost:3001/api/wallet/bitcoin/json?entropy=1111111111111111111111111111111111111111111111111111111111111111"
```

### Cas d'usage 2 : Portefeuille multi-comptes

```bash
# Compte personnel (account 0)
curl "http://localhost:3001/api/hdwallet/bitcoin/json?entropy=VOTRE_ENTROPY&accountIndex=0&addressIndex=0"

# Compte professionnel (account 1)
curl "http://localhost:3001/api/hdwallet/bitcoin/json?entropy=VOTRE_ENTROPY&accountIndex=1&addressIndex=0"

# Compte épargne (account 2)
curl "http://localhost:3001/api/hdwallet/bitcoin/json?entropy=VOTRE_ENTROPY&accountIndex=2&addressIndex=0"
```

### Cas d'usage 3 : Génération d'adresses de réception

```javascript
// Générer 20 adresses de réception pour un compte Bitcoin
const entropy = 'VOTRE_ENTROPY_ICI'.padEnd(64, '0');
const account = 0;

async function generateReceiveAddresses(count) {
  const addresses = [];
  
  for (let i = 0; i < count; i++) {
    const url = `http://localhost:3001/api/hdwallet/bitcoin/json?entropy=${entropy}&accountIndex=${account}&changeIndex=0&addressIndex=${i}`;
    const response = await fetch(url);
    const data = await response.json();
    
    addresses.push({
      index: i,
      address: data.data.address,
      path: data.data.derivationPath
    });
  }
  
  return addresses;
}

generateReceiveAddresses(20).then(addresses => {
  console.log('Adresses de réception générées :');
  addresses.forEach(addr => {
    console.log(`  [${addr.index}] ${addr.address} (${addr.path})`);
  });
});
```

### Cas d'usage 4 : Vérification déterministe

```bash
# Première génération
RESULT1=$(curl -s "http://localhost:3001/api/wallet/bitcoin/json?entropy=test123")

# Deuxième génération (avec la même entropy)
RESULT2=$(curl -s "http://localhost:3001/api/wallet/bitcoin/json?entropy=test123")

# Les résultats doivent être identiques
echo $RESULT1
echo $RESULT2
```

### Cas d'usage 5 : Multi-cryptos pour une même seed

```bash
ENTROPY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# Bitcoin
curl "http://localhost:3001/api/hdwallet/bitcoin/json?entropy=$ENTROPY"

# Ethereum
curl "http://localhost:3001/api/hdwallet/ethereum/json?entropy=$ENTROPY"

# Solana
curl "http://localhost:3001/api/hdwallet/solana/json?entropy=$ENTROPY"
```

---

## Tests

### Tests unitaires disponibles

Le projet inclut plusieurs suites de tests pour vérifier le bon fonctionnement de l'API.

#### 1. Test Simple Multi-Coins

**Fichier :** `tests/api/runners/test-simple-multi-coins.js`

Teste la génération de Simple Wallets pour toutes les cryptomonnaies supportées.

**Exécution :**
```bash
node tests/api/runners/test-simple-multi-coins.js
```

**Ce qui est testé :**
- ✅ Génération réussie pour chaque blockchain
- ✅ Format correct des adresses
- ✅ Présence du WIF pour Bitcoin, Litecoin, Dogecoin, Terra
- ✅ Présence de la clé privée pour toutes les blockchains

#### 2. Test HD Multi-Coins

**Fichier :** `tests/api/runners/test-hd-multi-coins.js`

Teste la génération de HD Wallets avec dérivation BIP44.

**Exécution :**
```bash
node tests/api/runners/test-hd-multi-coins.js
```

**Ce qui est testé :**
- ✅ Génération réussie pour chaque blockchain
- ✅ Chemins de dérivation corrects
- ✅ Différenciation par index de compte/adresse
- ✅ Déterminisme (même entropy = même résultat)

#### 3. Test Simple Wallet (Bitcoin détaillé)

**Fichier :** `tests/api/runners/test-simple-wallet.js`

Tests détaillés spécifiques à Bitcoin.

**Exécution :**
```bash
node tests/api/runners/test-simple-wallet.js
```

**Ce qui est testé :**
- ✅ Format P2PKH (adresses commençant par '1')
- ✅ Format WIF correct (51 caractères, commence par '5')
- ✅ Test déterministe

### Lancer tous les tests

```bash
# Windows
node tests/api/runners/test-simple-wallet.js && node tests/api/runners/test-simple-multi-coins.js && node tests/api/runners/test-hd-multi-coins.js

# Linux/Mac
npm test
```

### Résultats attendus

```
🧪 Test Simple Multi-Coins (Affichage WIF/PK adaptatif)

→ Test des 9 cryptomonnaies supportées
────────────────────────────────────────────────────────────
🔍 Testing BITCOIN      ... ✓ OK [Addr: 1A1zP1eP5Q... | WIF: 5J3mBbAH...]
🔍 Testing ETHEREUM     ... ✓ OK [Addr: 0x742d35Cc... | PK: 0c28fca3...]
...

============================================================
🏆 TOUS LES TESTS MULTI-COINS ONT RÉUSSIS !
============================================================
```

---

## Gestion des erreurs

### Codes de statut HTTP

| Code | Statut | Description |
|------|--------|-------------|
| 200 | OK | Requête réussie |
| 400 | Bad Request | Paramètres manquants ou invalides |
| 404 | Not Found | Endpoint ou blockchain non trouvé |
| 500 | Internal Server Error | Erreur serveur lors de la génération |

### Format des erreurs

```json
{
  "success": false,
  "error": "Message d'erreur descriptif"
}
```

### Exemples d'erreurs

#### Entropy manquante

**Requête :**
```bash
curl "http://localhost:3001/api/wallet/bitcoin/json"
```

**Réponse (400) :**
```json
{
  "success": false,
  "error": "Entropy is required as a query parameter."
}
```

#### Blockchain non supportée

**Requête :**
```bash
curl "http://localhost:3001/api/wallet/ripple/json?entropy=1111..."
```

**Réponse (404) :**
```json
{
  "success": false,
  "error": "Blockchain 'RIPPLE' not supported.",
  "supported": [
    "BITCOIN", "ETHEREUM", "DOGECOIN", "LITECOIN",
    "SOLANA", "AVALANCHE", "POLYGON", "TON", "TERRA"
  ]
}
```

#### Index invalide (HD Wallet)

**Requête :**
```bash
curl "http://localhost:3001/api/hdwallet/bitcoin/json?entropy=1111...&accountIndex=-1"
```

**Réponse (400) :**
```json
{
  "success": false,
  "error": "Indexes must be non-negative integers."
}
```

#### Endpoint non trouvé

**Requête :**
```bash
curl "http://localhost:3001/api/invalid"
```

**Réponse (404) :**
```json
{
  "error": "Endpoint not found",
  "available": [
    "/health",
    "/api/wallet/bitcoin/json",
    "/api/wallet/bitcoin/simple"
  ]
}
```

---

## Sécurité

### ⚠️ Avertissements importants

> **DANGER** : Cette API est conçue pour le développement et les tests. Ne jamais utiliser en production sans sécurisation appropriée.

### Bonnes pratiques

#### 1. HTTPS en production

```javascript
// ❌ MAUVAIS (en production)
const API_URL = 'http://api.example.com';

// ✅ BON (en production)
const API_URL = 'https://api.example.com';
```

#### 2. Ne jamais exposer les clés privées

```javascript
// ❌ MAUVAIS - Logger les clés privées
console.log('Private Key:', wallet.privateKey);

// ✅ BON - Logger uniquement les informations publiques
console.log('Address:', wallet.address);
console.log('Path:', wallet.derivationPath);
```

#### 3. Générer une entropy sécurisée

```javascript
// ❌ MAUVAIS - Entropy faible
const entropy = '1111111111111111111111111111111111111111111111111111111111111111';

// ✅ BON - Entropy cryptographiquement sécurisée
const crypto = require('crypto');
const entropy = crypto.randomBytes(32).toString('hex');
```

#### 4. Stocker les clés de manière sécurisée

```javascript
// ❌ MAUVAIS - Stocker en clair
localStorage.setItem('privateKey', wallet.privateKey);

// ✅ BON - Chiffrer avant stockage
const encryptedKey = encryptAES(wallet.privateKey, userPassword);
localStorage.setItem('encryptedKey', encryptedKey);
```

#### 5. Implémenter l'authentification

```javascript
// Exemple avec JWT
const jwt = require('jsonwebtoken');

router.use((req, res, next) => {
  const token = req.headers['authorization'];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.userId = decoded.id;
    next();
  });
});
```

#### 6. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requêtes par fenêtre
  message: 'Too many requests, please try again later.'
});

app.use('/api/', limiter);
```

### Variables d'environnement recommandées

```bash
# .env (ne jamais commiter ce fichier !)
PORT=3001
NODE_ENV=production
JWT_SECRET=votre_secret_ultra_securise
ALLOWED_ORIGINS=https://votre-app.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Checklist de sécurité en production

- [ ] HTTPS activé
- [ ] Authentification implémentée (JWT, OAuth, etc.)
- [ ] Rate limiting configuré
- [ ] Logs sécurisés (pas de clés privées)
- [ ] Variables d'environnement pour les secrets
- [ ] CORS configuré correctement
- [ ] Input validation stricte
- [ ] Monitoring des erreurs (Sentry, etc.)
- [ ] Backups réguliers
- [ ] Firewall configuré
- [ ] Mises à jour de sécurité régulières

---

## Différences entre Simple Wallet et HD Wallet

| Caractéristique | Simple Wallet | HD Wallet |
|----------------|---------------|-----------|
| **Endpoint** | `/api/wallet/:coin/json` | `/api/hdwallet/:coin/json` |
| **Standard** | Génération directe | BIP32/BIP44 |
| **Dérivation** | ❌ Non | ✅ Oui |
| **Chemin** | - | `m/44'/coin'/account'/change/address` |
| **Multi-comptes** | ❌ Non | ✅ Oui |
| **Multi-adresses** | ❌ Non | ✅ Oui (dérivation infinie) |
| **Compatibilité** | Basique | Portefeuilles modernes (MetaMask, Ledger, etc.) |
| **Use case** | Tests, prototypes | Production, applications professionnelles |
| **Récupération** | 1 seed = 1 wallet | 1 seed = ∞ wallets |

### Quand utiliser Simple Wallet ?

- ✅ Tests rapides
- ✅ Prototypes
- ✅ Génération ponctuelle
- ✅ Cas d'usage simple (1 adresse)

### Quand utiliser HD Wallet ?

- ✅ Applications en production
- ✅ Gestion multi-comptes
- ✅ Compatibilité avec hardware wallets
- ✅ Génération d'adresses multiples
- ✅ Conformité aux standards BIP

---

## FAQ

### Q : Puis-je récupérer un wallet avec la même entropy ?

**R :** Oui ! C'est le principe du déterminisme. Avec la même `entropy` et les mêmes paramètres de dérivation (pour HD Wallet), vous obtiendrez toujours exactement les mêmes clés et adresses.

### Q : Quelle est la différence entre WIF et clé privée hex ?

**R :** 
- **Hex** : Format brut (64 caractères hexadécimaux)
- **WIF** : Format encodé Base58Check, plus compact et avec checksum intégré (51-52 caractères)

### Q : Pourquoi certaines blockchains n'ont pas de WIF ?

**R :** Le WIF est spécifique aux blockchains de type UTXO (Bitcoin, Litecoin, etc.). Ethereum, Solana et autres utilisent directement la clé privée en hexadécimal.

### Q : Combien d'adresses puis-je générer avec HD Wallet ?

**R :** Théoriquement illimité ! BIP44 permet 2^31 comptes, chacun avec 2^31 adresses. En pratique, vous n'en aurez jamais besoin d'autant.

### Q : L'API fonctionne-t-elle hors ligne ?

**R :** Oui, complètement ! Aucune connexion internet n'est requise pour générer des wallets. Tout est calculé localement.

### Q : Puis-je importer les clés générées dans MetaMask ?

**R :** Oui, pour les blockchains compatibles (Ethereum, Polygon, Avalanche). Utilisez la clé privée hex ou la phrase mnémonique.

---

## Support et contribution

### Rapporter un bug

1. Vérifier que le serveur est démarré : `curl http://localhost:3001/health`
2. Consulter les logs du serveur
3. Tester avec les exemples de la documentation
4. Créer une issue sur le repository avec :
   - Endpoint utilisé
   - Paramètres envoyés
   - Réponse reçue
   - Logs du serveur

### Demander une nouvelle fonctionnalité

Ouvrir une issue sur le repository en décrivant :
- Le cas d'usage
- La fonctionnalité souhaitée
- Les bénéfices attendus

---

## Licence

Voir le fichier `LICENSE` du projet.

---

## Changelog

### v1.0.0 (2025-02-09)
- ✨ Endpoint Simple Wallet
- ✨ Endpoint HD Wallet avec BIP44
- ✨ Support de 9 cryptomonnaies
- ✨ Tests unitaires complets
- 📚 Documentation complète

---

**Made with ❤️ by CryptoCalc Team**
