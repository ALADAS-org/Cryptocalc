// test-runner.js - Exécute les tests dans un ordre logique
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function runTests() {
  console.log('🚀 Lancement des tests CryptoCalc API\n');
  
  const testSuites = [
    { name: 'Validation des formats', cmd: 'npm run test:formats' },
    { name: 'Validation entropie', cmd: 'npm run test:validation' },
    { name: 'API Bitcoin', cmd: 'npm run test:api:bitcoin' },
    { name: 'Tous les tests API', cmd: 'npm run test:api' }
  ];
  
  let allPassed = true;
  
  for (const suite of testSuites) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 ${suite.name}`);
    console.log(`${'='.repeat(60)}`);
    
    try {
      const { stdout, stderr } = await execPromise(suite.cmd);
      console.log(stdout);
      if (stderr) console.error('Stderr:', stderr);
      console.log(`✅ ${suite.name} - PASSÉ\n`);
    } catch (error) {
      console.error(`❌ ${suite.name} - ÉCHEC`);
      console.error(error.stdout);
      allPassed = false;
      break; // Arrête au premier échec
    }
  }
  
  console.log('\n' + '='.repeat(60));
  if (allPassed) {
    console.log('🎉 TOUS LES TESTS ONT RÉUSSI !');
  } else {
    console.log('💥 CERTAINS TESTS ONT ÉCHOUÉ');
    process.exit(1);
  }
}

// Lance les tests
runTests().catch(console.error);