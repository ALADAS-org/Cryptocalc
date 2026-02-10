const crypto = require('crypto');

/**
 * Mock du CryptoService pour les tests
 * Simule les fonctionnalités de génération de wallets
 */
class MockCryptoService {
  /**
   * Génère de l'entropie aléatoire
   * @param {number} size - Taille en bits (128, 160, 192, 224, 256)
   * @returns {string} Entropie en hexadécimal
   */
  async generateEntropy(size = 256) {
    const bytes = size / 8;
    const entropy = crypto.randomBytes(bytes).toString('hex');
    return entropy;
  }

  /**
   * Génère un wallet à partir de l'entropie
   * @param {string} type - Type de wallet (HD_WALLET, SIMPLE_WALLET, SWORD_WALLET)
   * @param {string} entropy - Entropie en hexadécimal
   * @param {object} options - Options (blockchain, passphrase, etc.)
   * @returns {object} Wallet généré
   */
  async generateWallet(type, entropy, options = {}) {
    const { blockchain = 'BTC', passphrase = '' } = options;

    // Génération de la secret phrase (simulation)
    const secretPhrase = this.entropyToMnemonic(entropy);
    
    // Génération de la clé privée (simulation)
    const privateKey = this.derivePrivateKey(entropy, passphrase);
    
    // Génération de l'adresse (simulation)
    const address = this.deriveAddress(privateKey, blockchain);
    
    // Génération du WIF pour Bitcoin-like
    const wif = this.isBitcoinLike(blockchain) 
      ? this.privateKeyToWIF(privateKey, blockchain)
      : null;

    const wallet = {
      type,
      blockchain,
      entropy,
      secretPhrase,
      privateKey,
      address,
      wif,
      passphrase: passphrase || null,
      
      // Méthode save
      save: async function(params = {}) {
        return {
          success: true,
          path: `/output/wallet_${Date.now()}`,
          timestamp: new Date().toISOString()
        };
      }
    };

    // Pour HD Wallet, ajouter les paramètres de dérivation
    if (type === 'HD_WALLET') {
      wallet.derivationPath = "m/44'/0'/0'/0/0";
      wallet.account = 0;
      wallet.addressIndex = 0;
    }

    return wallet;
  }

  /**
   * Convertit l'entropie en mnémoniques (simulation)
   */
  entropyToMnemonic(entropy) {
    // Wordlist BIP39 simplifiée pour les tests
    const wordlist = [
      'abandon', 'ability', 'able', 'about', 'above', 'absent', 
      'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident',
      'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire',
      'across', 'act', 'action', 'actor', 'actress', 'actual'
    ];

    const numWords = (entropy.length / 2) * 8 / 11; // Approximation
    const words = [];
    
    for (let i = 0; i < Math.floor(numWords); i++) {
      // Utiliser l'entropie pour sélectionner des mots
      const index = parseInt(entropy.substring(i * 2, i * 2 + 2), 16) % wordlist.length;
      words.push(wordlist[index]);
    }
    
    return words;
  }

  /**
   * Dérive une clé privée de l'entropie
   */
  derivePrivateKey(entropy, passphrase = '') {
    const hash = crypto.createHash('sha256')
      .update(entropy + passphrase)
      .digest('hex');
    return hash;
  }

  /**
   * Dérive une adresse de la clé privée
   */
  deriveAddress(privateKey, blockchain) {
    const hash = crypto.createHash('sha256')
      .update(privateKey + blockchain)
      .digest('hex');

    // Format selon la blockchain
    switch (blockchain) {
      case 'BTC':
        return '1' + hash.substring(0, 33);
      case 'ETH':
        return '0x' + hash.substring(0, 40);
      case 'XRP':
        return 'r' + hash.substring(0, 33);
      case 'ADA':
        return 'addr1' + hash.substring(0, 54);
      default:
        return hash.substring(0, 34);
    }
  }

  /**
   * Vérifie si la blockchain est de type Bitcoin
   */
  isBitcoinLike(blockchain) {
    return ['BTC', 'LTC', 'BCH', 'DASH', 'DOGE'].includes(blockchain);
  }

  /**
   * Convertit une clé privée en WIF
   */
  privateKeyToWIF(privateKey, blockchain) {
    // Simulation simplifiée
    const prefix = blockchain === 'BTC' ? '5' : 'L';
    return prefix + privateKey.substring(0, 50);
  }
}

/**
 * Mock du BIP38Service
 */
class MockBIP38Service {
  /**
   * Chiffre une clé privée avec BIP38
   */
  async encrypt(privateKey, passphrase, difficulty = 16384) {
    const hash = crypto.createHash('sha256')
      .update(privateKey + passphrase + difficulty)
      .digest('hex');
    
    return '6PR' + hash.substring(0, 55);
  }

  /**
   * Déchiffre une clé privée BIP38
   */
  async decrypt(encryptedKey, passphrase) {
    if (!encryptedKey.startsWith('6PR')) {
      throw new Error('Invalid BIP38 encrypted key');
    }
    
    // Simulation: déchiffrement
    const hash = crypto.createHash('sha256')
      .update(encryptedKey + passphrase)
      .digest('hex');
    
    return hash;
  }
}

/**
 * Mock du BIP32Service
 */
class MockBIP32Service {
  /**
   * Dérive une clé selon un chemin BIP32
   */
  async derive(masterKey, path) {
    const hash = crypto.createHash('sha256')
      .update(masterKey + path)
      .digest('hex');
    
    return {
      path,
      privateKey: hash,
      publicKey: hash.substring(0, 64),
      chainCode: hash.substring(64)
    };
  }
}

/**
 * Mock du AddressValidator
 */
class MockAddressValidator {
  /**
   * Valide une adresse selon la blockchain
   */
  async validate(address, blockchain) {
    const patterns = {
      BTC: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
      ETH: /^0x[a-fA-F0-9]{40}$/,
      XRP: /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/,
      ADA: /^addr1[a-z0-9]{54,}$/
    };

    const pattern = patterns[blockchain];
    return pattern ? pattern.test(address) : false;
  }
}

/**
 * Mock du ChecksumService
 */
class MockChecksumService {
  /**
   * Calcule un checksum
   */
  async compute(data, algorithm = 'sha256') {
    const hash = crypto.createHash(algorithm)
      .update(data)
      .digest('hex');
    
    return hash;
  }
}

module.exports = {
  MockCryptoService,
  MockBIP38Service,
  MockBIP32Service,
  MockAddressValidator,
  MockChecksumService
};
