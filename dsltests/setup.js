/**
 * ============================================================================
 * Setup Jest - Configuration globale de l'environnement de test
 * ============================================================================
 * 
 * Ce fichier est exécuté AVANT tous les tests.
 * Il configure:
 * - Les matchers personnalisés
 * - Les helpers globaux
 * - Les variables d'environnement
 * - Les mocks par défaut
 * 
 * ============================================================================
 */

// ============================================================================
// CONFIGURATION DU TIMEOUT
// ============================================================================

/**
 * Timeout par défaut pour tous les tests
 * Les opérations cryptographiques (BIP32, BIP38) peuvent être lentes
 */
jest.setTimeout(10000); // 10 secondes

// ============================================================================
// MOCK DE LA CONSOLE
// ============================================================================

/**
 * Mock de console pour réduire le bruit dans les tests
 * Active les logs seulement si DEBUG=true
 * 
 * Usage: DEBUG=true npm test
 */
const originalConsole = global.console;

global.console = {
  ...originalConsole,
  // Ces méthodes sont mockées (silencieuses) par défaut
  log: process.env.DEBUG ? originalConsole.log : jest.fn(),
  debug: process.env.DEBUG ? originalConsole.debug : jest.fn(),
  info: process.env.DEBUG ? originalConsole.info : jest.fn(),
  
  // Ces méthodes restent toujours visibles
  warn: originalConsole.warn,
  error: originalConsole.error,
  
  // Méthodes de groupe et tableaux (utiles pour debugging)
  group: originalConsole.group,
  groupEnd: originalConsole.groupEnd,
  table: process.env.DEBUG ? originalConsole.table : jest.fn(),
};

// ============================================================================
// VARIABLES GLOBALES - CHEMINS
// ============================================================================

/**
 * Chemins vers les répertoires de test
 */
global.TEST_FIXTURES_DIR = './tests/fixtures';
global.TEST_OUTPUT_DIR = './tests/output';
global.TEST_TEMP_DIR = './tests/temp';

/**
 * Chemins vers les ressources crypto
 */
global.CRYPTO_SERVICE_PATH = './www/crypto/crypto_service.js';

// ============================================================================
// HELPERS GLOBAUX - UTILITAIRES
// ============================================================================

/**
 * Pause l'exécution pendant N millisecondes
 * Utile pour les tests de timing ou animations
 * 
 * @param {number} ms - Millisecondes à attendre
 * @returns {Promise<void>}
 * 
 * @example
 * await sleep(1000); // Attend 1 seconde
 */
global.sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Convertit une chaîne hexadécimale en Buffer
 * 
 * @param {string} hex - Chaîne hexadécimale
 * @returns {Buffer}
 * 
 * @example
 * const buffer = hexToBuffer('a1b2c3d4');
 */
global.hexToBuffer = (hex) => Buffer.from(hex, 'hex');

/**
 * Convertit un Buffer en chaîne hexadécimale
 * 
 * @param {Buffer} buffer - Buffer à convertir
 * @returns {string}
 * 
 * @example
 * const hex = bufferToHex(Buffer.from([161, 178, 195, 212]));
 */
global.bufferToHex = (buffer) => buffer.toString('hex');

/**
 * Génère un nombre aléatoire entre min et max (inclusif)
 * 
 * @param {number} min - Minimum
 * @param {number} max - Maximum
 * @returns {number}
 * 
 * @example
 * const random = randomInt(0, 100);
 */
global.randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Génère une chaîne hexadécimale aléatoire
 * 
 * @param {number} bytes - Nombre de bytes
 * @returns {string}
 * 
 * @example
 * const entropy = randomHex(32); // 256 bits
 */
global.randomHex = (bytes) => {
  return bufferToHex(Buffer.from(
    Array.from({ length: bytes }, () => randomInt(0, 255))
  ));
};

/**
 * Nettoie une chaîne (trim + normalize whitespace)
 * 
 * @param {string} str - Chaîne à nettoyer
 * @returns {string}
 * 
 * @example
 * const clean = cleanString("  hello   world  "); // "hello world"
 */
global.cleanString = (str) => {
  return str.trim().replace(/\s+/g, ' ');
};

// ============================================================================
// MATCHERS PERSONNALISÉS JEST
// ============================================================================

expect.extend({
  
  /**
   * Vérifie qu'une chaîne est une entropie hexadécimale valide
   * 
   * @param {string} received - Valeur à tester
   * @param {number} expectedBits - Taille attendue en bits (128, 160, 192, 224, 256)
   * 
   * @example
   * expect(entropy).toBeValidHexEntropy(256);
   */
  toBeValidHexEntropy(received, expectedBits) {
    const expectedLength = expectedBits / 4; // 4 bits par caractère hex
    const hexPattern = /^[0-9a-f]+$/i;
    
    const pass = 
      typeof received === 'string' &&
      received.length === expectedLength &&
      hexPattern.test(received);
    
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be valid ${expectedBits}-bit hex entropy`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be valid ${expectedBits}-bit hex entropy ` +
          `(length: ${received?.length}, expected: ${expectedLength})`,
        pass: false,
      };
    }
  },
  
  /**
   * Vérifie qu'une adresse Bitcoin est valide (format de base)
   * Supporte P2PKH (commence par 1 ou 3)
   * 
   * @param {string} received - Adresse à valider
   * 
   * @example
   * expect(address).toBeValidBitcoinAddress();
   */
  toBeValidBitcoinAddress(received) {
    const btcPattern = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
    const pass = typeof received === 'string' && btcPattern.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid Bitcoin address`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid Bitcoin address`,
        pass: false,
      };
    }
  },
  
  /**
   * Vérifie qu'une adresse Ethereum est valide (format de base)
   * Commence par 0x suivi de 40 caractères hexadécimaux
   * 
   * @param {string} received - Adresse à valider
   * 
   * @example
   * expect(address).toBeValidEthereumAddress();
   */
  toBeValidEthereumAddress(received) {
    const ethPattern = /^0x[a-fA-F0-9]{40}$/;
    const pass = typeof received === 'string' && ethPattern.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid Ethereum address`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid Ethereum address`,
        pass: false,
      };
    }
  },
  
  /**
   * Vérifie qu'un chemin de dérivation BIP32 est valide
   * Format: m/44'/0'/0'/0/0 (avec hardened paths optionnels)
   * 
   * @param {string} received - Chemin à valider
   * 
   * @example
   * expect(path).toBeValidBip32Path();
   */
  toBeValidBip32Path(received) {
    const bip32Pattern = /^m(\/\d+'?)+$/;
    const pass = typeof received === 'string' && bip32Pattern.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid BIP32 path`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid BIP32 path`,
        pass: false,
      };
    }
  },
  
  /**
   * Vérifie qu'une clé privée est valide (64 caractères hexadécimaux)
   * 
   * @param {string} received - Clé privée à valider
   * 
   * @example
   * expect(privateKey).toBeValidPrivateKey();
   */
  toBeValidPrivateKey(received) {
    const pass = 
      typeof received === 'string' &&
      received.length === 64 &&
      /^[0-9a-f]+$/i.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid private key`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be a valid private key (64 hex chars)`,
        pass: false,
      };
    }
  },
  
  /**
   * Vérifie qu'un mnémonique BIP39 a le bon nombre de mots
   * 
   * @param {string} received - Mnémonique à valider
   * @param {number} [expectedWordCount] - Nombre de mots attendu (optionnel)
   * 
   * @example
   * expect(mnemonic).toBeValidMnemonic();
   * expect(mnemonic).toBeValidMnemonic(24);
   */
  toBeValidMnemonic(received, expectedWordCount) {
    if (typeof received !== 'string') {
      return {
        message: () => `expected mnemonic to be a string, got ${typeof received}`,
        pass: false,
      };
    }
    
    const words = received.split(' ').filter(w => w.length > 0);
    const validWordCounts = [12, 15, 18, 21, 24];
    
    if (expectedWordCount) {
      const pass = words.length === expectedWordCount;
      return {
        message: () =>
          pass
            ? `expected mnemonic not to have ${expectedWordCount} words`
            : `expected mnemonic to have ${expectedWordCount} words, got ${words.length}`,
        pass,
      };
    } else {
      const pass = validWordCounts.includes(words.length);
      return {
        message: () =>
          pass
            ? `expected mnemonic not to have valid word count`
            : `expected mnemonic to have valid word count (12/15/18/21/24), got ${words.length}`,
        pass,
      };
    }
  },
  
  /**
   * Vérifie qu'une valeur est un wallet valide
   * Vérifie la présence des propriétés essentielles
   * 
   * @param {object} received - Objet wallet à valider
   * 
   * @example
   * expect(wallet).toBeValidWallet();
   */
  toBeValidWallet(received) {
    const requiredProps = ['type', 'entropy', 'secretPhrase', 'address'];
    const hasAllProps = requiredProps.every(prop => prop in received);
    
    if (hasAllProps) {
      return {
        message: () => `expected wallet not to be valid`,
        pass: true,
      };
    } else {
      const missingProps = requiredProps.filter(prop => !(prop in received));
      return {
        message: () =>
          `expected wallet to be valid, missing properties: ${missingProps.join(', ')}`,
        pass: false,
      };
    }
  },
  
  /**
   * Vérifie qu'un tableau contient seulement des valeurs uniques
   * 
   * @param {Array} received - Tableau à vérifier
   * 
   * @example
   * expect([1, 2, 3]).toHaveUniqueValues();
   */
  toHaveUniqueValues(received) {
    if (!Array.isArray(received)) {
      return {
        message: () => `expected ${received} to be an array`,
        pass: false,
      };
    }
    
    const uniqueValues = new Set(received);
    const pass = uniqueValues.size === received.length;
    
    if (pass) {
      return {
        message: () => `expected array not to have unique values`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected array to have unique values, found duplicates`,
        pass: false,
      };
    }
  },
  
});

// ============================================================================
// CONFIGURATION GLOBALE CRYPTO
// ============================================================================

/**
 * Configuration globale pour les tests cryptographiques
 * Accessible dans tous les tests via global.CRYPTO_TEST_CONFIG
 */
global.CRYPTO_TEST_CONFIG = {
  // Taille d'entropie par défaut
  defaultEntropySize: 256,
  
  // Blockchain par défaut
  defaultBlockchain: 'bitcoin',
  
  // Tailles d'entropie supportées (en bits)
  supportedEntropySizes: [128, 160, 192, 224, 256],
  
  // Blockchains supportées
  supportedBlockchains: ['bitcoin', 'ethereum', 'litecoin'],
  
  // Types de wallets
  walletTypes: {
    SIMPLE: 'SIMPLE_WALLET',
    HD: 'HD_WALLET',
    SWORD: 'SWORD_WALLET'
  },
  
  // Correspondance taille d'entropie → nombre de mots
  entropyToWords: {
    128: 12,
    160: 15,
    192: 18,
    224: 21,
    256: 24
  },
  
  // Langues supportées pour les mnémoniques
  supportedLanguages: [
    'english', 'french', 'spanish', 'italian', 'czech',
    'portuguese', 'japanese', 'korean', 'chinese_simplified',
    'chinese_traditional'
  ],
  
  // Patterns de validation
  patterns: {
    hex: /^[0-9a-f]+$/i,
    bitcoinAddress: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    ethereumAddress: /^0x[a-fA-F0-9]{40}$/,
    bip32Path: /^m(\/\d+'?)+$/,
    privateKey: /^[0-9a-f]{64}$/i,
  }
};

// ============================================================================
// HOOKS GLOBAUX
// ============================================================================

/**
 * Fonction exécutée avant chaque test
 * Nettoie l'environnement
 */
beforeEach(() => {
  // Nettoie les timers en attente
  jest.clearAllTimers();
  
  // Log du nom du test en mode DEBUG
  if (process.env.DEBUG) {
    const testName = expect.getState().currentTestName;
    console.log(`\n▶️  Running: ${testName}`);
  }
});

/**
 * Fonction exécutée après chaque test
 * Nettoie les ressources
 */
afterEach(() => {
  // Restaure tous les mocks
  jest.restoreAllMocks();
  
  // Force le garbage collector si disponible
  if (global.gc) {
    global.gc();
  }
});

// ============================================================================
// INITIALISATION
// ============================================================================

/**
 * Log d'initialisation en mode DEBUG
 */
if (process.env.DEBUG) {
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║   🧪 Cryptocalc DSL Test Environment Ready       ║');
  console.log('╚════════════════════════════════════════════════════╝\n');
  console.log('Configuration:');
  console.table({
    'Entropy Size': global.CRYPTO_TEST_CONFIG.defaultEntropySize + ' bits',
    'Blockchain': global.CRYPTO_TEST_CONFIG.defaultBlockchain,
    'Timeout': '10000 ms',
    'Fixtures Dir': global.TEST_FIXTURES_DIR,
  });
  console.log('\n');
}

// ============================================================================
// ERROR HANDLERS
// ============================================================================

/**
 * Handler pour les erreurs non gérées
 */
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Promise Rejection:', error);
});

/**
 * Handler pour les exceptions non capturées
 */
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

/**
 * ============================================================================
 * EXPORTS (pour utilisation dans les tests)
 * ============================================================================
 */

module.exports = {
  // Configuration
  CRYPTO_TEST_CONFIG: global.CRYPTO_TEST_CONFIG,
  
  // Helpers
  sleep: global.sleep,
  hexToBuffer: global.hexToBuffer,
  bufferToHex: global.bufferToHex,
  randomInt: global.randomInt,
  randomHex: global.randomHex,
  cleanString: global.cleanString,
};

/**
 * ============================================================================
 * NOTES D'UTILISATION
 * ============================================================================
 * 
 * Matchers personnalisés disponibles:
 * 
 * - expect(value).toBeValidHexEntropy(256)
 * - expect(value).toBeValidBitcoinAddress()
 * - expect(value).toBeValidEthereumAddress()
 * - expect(value).toBeValidBip32Path()
 * - expect(value).toBeValidPrivateKey()
 * - expect(value).toBeValidMnemonic(24)
 * - expect(value).toBeValidWallet()
 * - expect(array).toHaveUniqueValues()
 * 
 * Helpers globaux disponibles:
 * 
 * - sleep(ms)
 * - hexToBuffer(hex)
 * - bufferToHex(buffer)
 * - randomInt(min, max)
 * - randomHex(bytes)
 * - cleanString(str)
 * 
 * Variables globales:
 * 
 * - CRYPTO_TEST_CONFIG
 * - TEST_FIXTURES_DIR
 * - TEST_OUTPUT_DIR
 * - TEST_TEMP_DIR
 * 
 * ============================================================================
 */
