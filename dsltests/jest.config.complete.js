/**
 * ============================================================================
 * Configuration Jest pour Cryptocalc DSL
 * ============================================================================
 * Framework de tests pour les wallets cryptographiques
 * Supporte: BIP32, BIP39, BIP38, Bitcoin, Ethereum, Litecoin
 * 
 * Documentation: https://jestjs.io/docs/configuration
 * ============================================================================
 */

module.exports = {
  
  // ==========================================================================
  // ENVIRONNEMENT DE TEST
  // ==========================================================================
  
  /**
   * Environnement d'exécution des tests
   * - 'node': Pour tester du code Node.js (notre cas)
   * - 'jsdom': Pour tester du code navigateur
   */
  testEnvironment: 'node',
  
  /**
   * Timeout global pour tous les tests (en millisecondes)
   * Les opérations cryptographiques peuvent être lentes
   */
  testTimeout: 10000,
  
  
  // ==========================================================================
  // DÉCOUVERTE DES TESTS
  // ==========================================================================
  
  /**
   * Patterns glob pour trouver les fichiers de tests
   * Cherche tous les fichiers *.test.js et *.spec.js dans tests/
   */
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
    '**/__tests__/**/*.js'
  ],
  
  /**
   * Dossiers et fichiers à ignorer lors de la recherche de tests
   */
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/_output/',
    '/dist/',
    '/build/',
    '/.git/'
  ],
  
  
  // ==========================================================================
  // COUVERTURE DE CODE
  // ==========================================================================
  
  /**
   * Répertoire de sortie pour les rapports de couverture
   */
  coverageDirectory: 'coverage',
  
  /**
   * Fichiers à inclure dans le calcul de couverture
   * Exclut les fichiers de test eux-mêmes
   */
  collectCoverageFrom: [
    'www/**/*.js',
    'tests/dsl-*.js',
    '!www/**/*.test.js',
    '!www/**/*.spec.js',
    '!tests/**/*.test.js',
    '!tests/**/*.spec.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/vendor/**'
  ],
  
  /**
   * Seuils minimums de couverture
   * Si non atteints, le build échoue
   */
  coverageThreshold: {
    global: {
      branches: 80,      // 80% des branches conditionnelles
      functions: 80,     // 80% des fonctions
      lines: 80,         // 80% des lignes
      statements: 80     // 80% des statements
    }
  },
  
  /**
   * Provider de couverture
   * - 'v8': Plus rapide, natif Node.js
   * - 'babel': Plus précis mais plus lent
   */
  coverageProvider: 'v8',
  
  /**
   * Formats de rapport de couverture à générer
   */
  coverageReporters: [
    'text',           // Affichage dans la console
    'text-summary',   // Résumé dans la console
    'lcov',           // Format standard pour CI/CD (SonarQube, Codecov, etc.)
    'html',           // Rapport HTML interactif
    'json',           // Format JSON pour parsing automatisé
    'cobertura'       // Format XML pour certains outils CI
  ],
  
  
  // ==========================================================================
  // REPORTERS ET AFFICHAGE
  // ==========================================================================
  
  /**
   * Mode verbose: affiche chaque test individuellement
   */
  verbose: true,
  
  /**
   * Reporters pour générer des rapports de tests
   */
  reporters: [
    'default',        // Reporter standard de Jest
    [
      'jest-html-reporter',
      {
        pageTitle: 'Cryptocalc DSL - Rapport de Tests',
        outputPath: 'coverage/test-report.html',
        includeFailureMsg: true,
        includeConsoleLog: true,
        includeObsoleteSnapshots: true,
        theme: 'defaultTheme',
        dateFormat: 'yyyy-mm-dd HH:MM:ss',
        sort: 'status',
        executionTimeWarningThreshold: 5,
        useCssFile: false
      }
    ],
    // Optionnel: Reporter JUnit pour CI/CD
    // ['jest-junit', {
    //   outputDirectory: 'coverage',
    //   outputName: 'junit.xml',
    // }]
  ],
  
  
  // ==========================================================================
  // CONFIGURATION DES TESTS
  // ==========================================================================
  
  /**
   * Fichiers de setup exécutés après l'initialisation de Jest
   * Utilisé pour configurer l'environnement de test global
   */
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.js'
  ],
  
  /**
   * Nettoie automatiquement les mocks entre chaque test
   */
  clearMocks: true,
  
  /**
   * Restaure automatiquement les mocks entre chaque test
   */
  restoreMocks: true,
  
  /**
   * Réinitialise les modules entre les tests (isolation)
   * false = garde le cache des modules (plus rapide)
   */
  resetModules: false,
  
  /**
   * Arrête l'exécution après N échecs
   * 0 = exécute tous les tests même si certains échouent
   */
  bail: 0,
  
  /**
   * Nombre de workers pour paralléliser les tests
   * '50%' = utilise 50% des CPU disponibles
   * Peut être un nombre fixe: 2, 4, etc.
   */
  maxWorkers: '50%',
  
  
  // ==========================================================================
  // TRANSFORMATION ET RÉSOLUTION DE MODULES
  // ==========================================================================
  
  /**
   * Extensions de fichiers reconnues par Jest
   */
  moduleFileExtensions: [
    'js',
    'json',
    'node'
  ],
  
  /**
   * Alias pour simplifier les imports
   * Exemple: import foo from '@/bar' au lieu de '../../www/bar'
   */
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/www/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    '^@crypto/(.*)$': '<rootDir>/www/crypto/$1',
    '^@fixtures/(.*)$': '<rootDir>/tests/fixtures/$1'
  },
  
  /**
   * Répertoires où Jest cherche les modules
   */
  moduleDirectories: [
    'node_modules',
    'www',
    'tests'
  ],
  
  /**
   * Transformation des fichiers avant exécution
   * Vide = pas de transformation (pas de Babel/TypeScript)
   */
  transform: {},
  
  /**
   * Patterns de fichiers à ne pas transformer
   */
  transformIgnorePatterns: [
    '/node_modules/',
    '\\.pnp\\.[^\\/]+$'
  ],
  
  
  // ==========================================================================
  // WATCH MODE
  // ==========================================================================
  
  /**
   * Fichiers à ignorer en mode watch
   */
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/_output/',
    '\\.git',
    '\\.DS_Store'
  ],
  
  /**
   * Plugins pour améliorer le mode watch
   * Permet de filtrer les tests par nom ou fichier
   */
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  
  
  // ==========================================================================
  // CONFIGURATION AVANCÉE
  // ==========================================================================
  
  /**
   * Collecter la couverture automatiquement
   * false = uniquement si --coverage est passé en CLI
   */
  collectCoverage: false,
  
  /**
   * Injecter les globals de Jest (describe, test, expect, etc.)
   * true = disponibles sans import
   */
  injectGlobals: true,
  
  /**
   * Détecter les fuites de mémoire dans les tests
   * Utile pour identifier les tests qui ne nettoient pas après eux
   */
  detectLeaks: false,
  
  /**
   * Détecter les handles ouverts (connexions, timers, etc.)
   * Peut ralentir les tests mais aide au debugging
   */
  detectOpenHandles: false,
  
  /**
   * Limite de mémoire avant que Jest redémarre un worker
   */
  workerIdleMemoryLimit: '512MB',
  
  
  // ==========================================================================
  // NOTIFICATIONS
  // ==========================================================================
  
  /**
   * Notifications système après exécution des tests
   */
  notify: false,
  
  /**
   * Quand notifier
   * - 'always': À chaque exécution
   * - 'failure': Seulement en cas d'échec
   * - 'success': Seulement en cas de succès
   * - 'change': Seulement si le résultat change
   * - 'failure-change': Échec ou changement de statut
   */
  notifyMode: 'failure-change',
  
  
  // ==========================================================================
  // VARIABLES GLOBALES
  // ==========================================================================
  
  /**
   * Variables globales disponibles dans tous les tests
   */
  globals: {
    TEST_MODE: true,
    CRYPTO_TEST_CONFIG: {
      defaultEntropySize: 256,
      defaultBlockchain: 'bitcoin',
      supportedEntropySizes: [128, 160, 192, 224, 256],
      supportedBlockchains: ['bitcoin', 'ethereum', 'litecoin'],
      walletTypes: ['SIMPLE_WALLET', 'HD_WALLET', 'SWORD_WALLET']
    }
  },
  
  
  // ==========================================================================
  // CHEMINS ET RÉPERTOIRES
  // ==========================================================================
  
  /**
   * Répertoire racine du projet
   */
  rootDir: '.',
  
  /**
   * Répertoires racines pour la recherche de tests
   */
  roots: [
    '<rootDir>/tests',
    '<rootDir>/www'
  ],
  
  
  // ==========================================================================
  // PERFORMANCE
  // ==========================================================================
  
  /**
   * Activer le cache Jest
   * Accélère les exécutions suivantes
   */
  cache: true,
  
  /**
   * Répertoire du cache
   */
  cacheDirectory: '/tmp/jest_cache',
  
  /**
   * Nombre maximum de tests exécutés simultanément
   */
  maxConcurrency: 5,
  
  
  // ==========================================================================
  // DEBUGGING
  // ==========================================================================
  
  /**
   * Mode silencieux (supprime la sortie console)
   */
  silent: false,
  
  /**
   * Afficher la liste des tests sans les exécuter
   */
  listTests: false,
  
  /**
   * Exécuter tous les tests dans le même processus (plus lent mais facilite le debug)
   * Décommenter pour activer:
   */
  // runInBand: true,
  
  
  // ==========================================================================
  // SNAPSHOTS
  // ==========================================================================
  
  /**
   * Sérialiseurs personnalisés pour les snapshots
   */
  snapshotSerializers: [],
  
  /**
   * Format des snapshots
   */
  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: true
  },
  
  
  // ==========================================================================
  // AUTRES OPTIONS
  // ==========================================================================
  
  /**
   * Chemin vers un module de résolution personnalisé
   */
  // resolver: undefined,
  
  /**
   * Configuration pour des projets multiples (monorepo)
   */
  // projects: undefined,
  
  /**
   * Runner personnalisé
   */
  // runner: 'jest-runner',
  
  /**
   * Preset de configuration (remplace cette config)
   */
  // preset: undefined,
  
  /**
   * Force l'utilisation du timezone
   */
  // timers: 'real',
  
  /**
   * Message à afficher en cas d'échec
   */
  // errorOnDeprecated: true,
  
};

/**
 * ============================================================================
 * NOTES D'UTILISATION
 * ============================================================================
 * 
 * Commandes courantes:
 * 
 * npm test                     - Exécute tous les tests
 * npm run test:watch           - Mode watch (re-exécution auto)
 * npm run test:coverage        - Avec rapport de couverture
 * npm test -- --verbose        - Mode verbose
 * npm test -- --runInBand      - Exécution séquentielle (debug)
 * npm test -- --no-cache       - Sans cache
 * npm test -- --clearCache     - Nettoie le cache
 * 
 * Variables d'environnement:
 * 
 * DEBUG=true npm test          - Active les logs de debug
 * NODE_ENV=test npm test       - Force l'environnement test
 * 
 * ============================================================================
 */
