/**
 * ============================================================================
 * Jest Configuration for Cryptocalc
 * ============================================================================
 * Testing framework for cryptocurrency wallets
 * Supports: BIP32, BIP39, BIP38, Bitcoin, Ethereum, Litecoin, etc.
 * 
 * Documentation: https://jestjs.io/docs/configuration
 * ============================================================================
 */

const path = require('path');

module.exports = {
  
  // ==========================================================================
  // TEST ENVIRONMENT
  // ==========================================================================
  
  /**
   * Test execution environment
   * 'node' for Node.js code testing
   */
  testEnvironment: 'node',
  
  /**
   * Global timeout for all tests (milliseconds)
   * Cryptographic operations can be slow
   */
  testTimeout: 10000,
  
  
  // ==========================================================================
  // TEST DISCOVERY
  // ==========================================================================
  
  /**
   * Glob patterns to find test files
   * Only in tests/jest/
   */
  testMatch: [
    '**/tests/jest/**/*.test.js',
    '**/tests/jest/**/*.spec.js'
  ],
  
  /**
   * Folders and files to ignore during test search
   */
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/playwright/',          // Ignore Playwright
    '/tests/coverage/',            // Ignore coverage
    '/_output/',
    '/dist/',
    '/build/',
    '/.git/'
  ],
  
  
  // ==========================================================================
  // CODE COVERAGE - Output in tests/coverage/jest/
  // ==========================================================================
  
  /**
   * Output directory for coverage reports
   */
  coverageDirectory: path.join(__dirname, 'tests/coverage/jest'),
  
  /**
   * Files to include in coverage calculation
   */
  collectCoverageFrom: [
    'www/js/crypto/**/*.js',
    'www/js/api/**/*.js',
    'www/js/util/**/*.js',
    '!www/js/lib/**',              // Exclude external libraries
    '!www/**/*.test.js',
    '!www/**/*.spec.js',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  
  /**
   * Minimum coverage thresholds
   * Build fails if not met
   */
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  /**
   * Coverage provider
   * 'v8': Faster, native Node.js
   */
  coverageProvider: 'v8',
  
  /**
   * Coverage report formats to generate
   */
  coverageReporters: [
    'text',           // Console output
    'text-summary',   // Console summary
    'lcov',           // Standard format for CI/CD
    'html',           // Interactive HTML report
    'json',           // JSON format
    'cobertura'       // XML format for CI
  ],
  
  
  // ==========================================================================
  // REPORTERS AND OUTPUT
  // ==========================================================================
  
  /**
   * Verbose mode: displays each test individually
   */
  verbose: true,
  
  /**
   * Reporters to generate test reports
   */
  reporters: [
    'default',
    [
      'jest-html-reporter',
      {
        pageTitle: 'Cryptocalc - Jest Test Report',
        outputPath: path.join(__dirname, 'tests/coverage/jest/test-report.html'),
        includeFailureMsg: true,
        includeConsoleLog: true,
        includeObsoleteSnapshots: true,
        theme: 'defaultTheme',
        dateFormat: 'yyyy-mm-dd HH:MM:ss',
        sort: 'status',
        executionTimeWarningThreshold: 5,
        useCssFile: false
      }
    ]
  ],
  
  
  // ==========================================================================
  // TEST CONFIGURATION
  // ==========================================================================
  
  /**
   * Setup files executed after Jest initialization
   * Setup in tests/jest/setup.js
   */
  setupFilesAfterEnv: [
    '<rootDir>/tests/jest/setup.js'
  ],
  
  /**
   * Automatically clear mocks between each test
   */
  clearMocks: true,
  
  /**
   * Automatically restore mocks between each test
   */
  restoreMocks: true,
  
  /**
   * Reset modules between tests (isolation)
   * false = keep module cache (faster)
   */
  resetModules: false,
  
  /**
   * Stop execution after N failures
   * 0 = run all tests even if some fail
   */
  bail: 0,
  
  /**
   * Number of workers to parallelize tests
   * '50%' = use 50% of available CPUs
   */
  maxWorkers: '50%',
  
  
  // ==========================================================================
  // TRANSFORMATION AND MODULE RESOLUTION
  // ==========================================================================
  
  /**
   * File extensions recognized by Jest
   */
  moduleFileExtensions: [
    'js',
    'json',
    'node'
  ],
  
  /**
   * Aliases to simplify imports
   * Example: import foo from '@/bar' instead of '../../www/bar'
   */
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/www/$1',
    '^@www/(.*)$': '<rootDir>/www/$1',
    '^@crypto/(.*)$': '<rootDir>/www/js/crypto/$1',
    '^@api/(.*)$': '<rootDir>/www/js/api/$1',
    '^@util/(.*)$': '<rootDir>/www/js/util/$1',
    '^@tests/(.*)$': '<rootDir>/tests/jest/$1',
    '^@fixtures/(.*)$': '<rootDir>/tests/jest/fixtures/$1'
  },
  
  /**
   * Directories where Jest searches for modules
   */
  moduleDirectories: [
    'node_modules',
    'www',
    'tests/jest'
  ],
  
  /**
   * File transformation before execution
   * Empty = no transformation (no Babel/TypeScript)
   */
  transform: {},
  
  /**
   * File patterns not to transform
   */
  transformIgnorePatterns: [
    '/node_modules/',
    '\\.pnp\\.[^\\/]+$'
  ],
  
  
  // ==========================================================================
  // WATCH MODE
  // ==========================================================================
  
  /**
   * Files to ignore in watch mode
   */
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/tests/coverage/',
    '/tests/playwright/',
    '/_output/',
    '\\.git',
    '\\.DS_Store'
  ],
  
  /**
   * Plugins to improve watch mode
   * Allows filtering tests by name or file
   */
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  
  
  // ==========================================================================
  // ADVANCED CONFIGURATION
  // ==========================================================================
  
  /**
   * Collect coverage automatically
   * false = only if --coverage is passed in CLI
   */
  collectCoverage: false,
  
  /**
   * Inject Jest globals (describe, test, expect, etc.)
   * true = available without import
   */
  injectGlobals: true,
  
  /**
   * Detect memory leaks in tests
   */
  detectLeaks: false,
  
  /**
   * Detect open handles (connections, timers, etc.)
   */
  detectOpenHandles: false,
  
  /**
   * Memory limit before Jest restarts a worker
   */
  workerIdleMemoryLimit: '512MB',
  
  
  // ==========================================================================
  // NOTIFICATIONS
  // ==========================================================================
  
  /**
   * System notifications after test execution
   */
  notify: false,
  
  /**
   * When to notify
   */
  notifyMode: 'failure-change',
  
  
  // ==========================================================================
  // GLOBAL VARIABLES
  // ==========================================================================
  
  /**
   * Global variables available in all tests
   */
  globals: {
    TEST_MODE: true,
    CRYPTO_TEST_CONFIG: {
      defaultEntropySize: 256,
      defaultBlockchain: 'bitcoin',
      supportedEntropySizes: [128, 160, 192, 224, 256],
      supportedBlockchains: [
        'bitcoin', 
        'ethereum', 
        'litecoin', 
        'dogecoin', 
        'solana', 
        'avalanche', 
        'polygon', 
        'toncoin', 
        'terra'
      ],
      walletTypes: ['SIMPLE_WALLET', 'HD_WALLET']
    }
  },
  
  
  // ==========================================================================
  // PATHS AND DIRECTORIES
  // ==========================================================================
  
  /**
   * Project root directory
   */
  rootDir: '.',
  
  /**
   * Root directories for test search
   */
  roots: [
    '<rootDir>/tests/jest',
    '<rootDir>/www'
  ],
  
  
  // ==========================================================================
  // PERFORMANCE
  // ==========================================================================
  
  /**
   * Enable Jest cache
   * Speeds up subsequent runs
   */
  cache: true,
  
  /**
   * Cache directory
   */
  cacheDirectory: '/tmp/jest_cache',
  
  /**
   * Maximum number of tests executed simultaneously
   */
  maxConcurrency: 5,
  
  
  // ==========================================================================
  // DEBUGGING
  // ==========================================================================
  
  /**
   * Silent mode (suppress console output)
   */
  silent: false,
  
  /**
   * Display test list without executing them
   */
  listTests: false,
  
  
  // ==========================================================================
  // SNAPSHOTS
  // ==========================================================================
  
  /**
   * Custom serializers for snapshots
   */
  snapshotSerializers: [],
  
  /**
   * Snapshot format
   */
  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: true
  }
};

/**
 * ============================================================================
 * USAGE NOTES
 * ============================================================================
 * 
 * Common commands:
 * 
 * npm test                     - Run all Jest tests
 * npm run test:jest:watch      - Watch mode (auto re-run)
 * npm run test:jest:coverage   - With coverage report
 * npm test -- --verbose        - Verbose mode
 * npm test -- --runInBand      - Sequential execution (debug)
 * npm test -- --no-cache       - Without cache
 * npm test -- --clearCache     - Clean cache
 * 
 * Environment variables:
 * 
 * DEBUG=true npm test          - Enable debug logs
 * NODE_ENV=test npm test       - Force test environment
 * 
 * ============================================================================
 */
