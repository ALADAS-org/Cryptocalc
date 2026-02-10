#!/usr/bin/env node

/**
 * CLI pour exécuter les tests DSL
 * Usage: node run-dsl-tests.js [options] [test-file]
 */

const DSLParser = require('./src/dsl/parser');
const DSLInterpreter = require('./src/dsl/interpreter');
const {
  MockCryptoService,
  MockBIP38Service,
  MockBIP32Service,
  MockAddressValidator,
  MockChecksumService
} = require('./src/dsl/mock-services');

const path = require('path');
const fs = require('fs');

// Parse command line arguments
const args = process.argv.slice(2);
let testFile = null;
let verbose = false;
let jsonOutput = false;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg === '--verbose' || arg === '-v') {
    verbose = true;
  } else if (arg === '--json') {
    jsonOutput = true;
  } else if (arg === '--help' || arg === '-h') {
    printHelp();
    process.exit(0);
  } else if (!arg.startsWith('-')) {
    testFile = arg;
  }
}

function printHelp() {
  console.log(`
Cryptocalc DSL Test Runner
==========================

Usage: node run-dsl-tests.js [options] [test-file]

Options:
  -v, --verbose    Afficher les logs détaillés
  --json           Sortie en format JSON
  -h, --help       Afficher cette aide

Examples:
  # Exécuter un test spécifique
  node run-dsl-tests.js tests/fixtures/test_hd_wallet_btc.yaml
  
  # Exécuter avec logs verbeux
  node run-dsl-tests.js -v tests/fixtures/test_bip38.yaml
  
  # Sortie JSON pour parsing
  node run-dsl-tests.js --json tests/fixtures/test_multi_blockchain.yaml
  
  # Exécuter tous les tests dans un répertoire
  node run-dsl-tests.js tests/fixtures/
`);
}

async function runTest(filepath) {
  const parser = new DSLParser();
  const interpreter = new DSLInterpreter({
    CryptoService: new MockCryptoService(),
    BIP38Service: new MockBIP38Service(),
    BIP32Service: new MockBIP32Service(),
    AddressValidator: new MockAddressValidator(),
    ChecksumService: new MockChecksumService()
  });

  try {
    const testSuite = parser.parse(filepath);
    
    if (!jsonOutput && !verbose) {
      console.log(`\n📋 Running: ${testSuite.name}`);
    }
    
    const results = await interpreter.executeTestSuite(testSuite);
    
    return {
      file: filepath,
      suite: testSuite.name,
      results: results
    };
  } catch (error) {
    return {
      file: filepath,
      suite: 'Error',
      error: error.message,
      results: []
    };
  }
}

async function runTests() {
  let testFiles = [];
  
  if (!testFile) {
    // Si aucun fichier spécifié, chercher dans tests/fixtures/
    const fixturesDir = path.join(__dirname, 'tests', 'fixtures');
    if (fs.existsSync(fixturesDir)) {
      testFiles = fs.readdirSync(fixturesDir)
        .filter(f => f.endsWith('.yaml') || f.endsWith('.yml'))
        .map(f => path.join(fixturesDir, f));
    } else {
      console.error('❌ No test files found. Please specify a test file or ensure tests/fixtures/ exists.');
      process.exit(1);
    }
  } else {
    // Vérifier si c'est un fichier ou un répertoire
    const stats = fs.statSync(testFile);
    
    if (stats.isDirectory()) {
      testFiles = fs.readdirSync(testFile)
        .filter(f => f.endsWith('.yaml') || f.endsWith('.yml'))
        .map(f => path.join(testFile, f));
    } else {
      testFiles = [testFile];
    }
  }

  if (testFiles.length === 0) {
    console.error('❌ No test files found.');
    process.exit(1);
  }

  const allResults = [];
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  for (const file of testFiles) {
    const result = await runTest(file);
    allResults.push(result);
    
    if (result.error) {
      failedTests++;
      if (!jsonOutput) {
        console.error(`❌ Error in ${path.basename(file)}: ${result.error}`);
      }
    } else {
      for (const testResult of result.results) {
        totalTests++;
        if (testResult.success) {
          passedTests++;
          if (!jsonOutput && !verbose) {
            console.log(`  ✓ ${testResult.name}`);
          }
        } else {
          failedTests++;
          if (!jsonOutput) {
            console.log(`  ✗ ${testResult.name}`);
            for (const error of testResult.errors) {
              console.log(`    Error: ${error}`);
            }
            for (const assertion of testResult.assertions) {
              if (!assertion.passed) {
                console.log(`    Failed: ${assertion.message}`);
              }
            }
          }
        }
      }
    }
  }

  if (jsonOutput) {
    console.log(JSON.stringify(allResults, null, 2));
  } else {
    console.log(`
═══════════════════════════════════════
📊 Test Summary
═══════════════════════════════════════
Total Tests:   ${totalTests}
✓ Passed:      ${passedTests}
✗ Failed:      ${failedTests}
Success Rate:  ${totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : 0}%
═══════════════════════════════════════
`);
  }

  // Exit with error code if tests failed
  process.exit(failedTests > 0 ? 1 : 0);
}

// Gérer les erreurs non capturées
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Exécuter les tests
runTests();
