// cryptocalc/test-simple-wallet.js
const request = require('supertest');

const API_URL = 'http://localhost:3001';

async function testSimpleWallet() {
  console.log('🧪 Test Simple Wallet Bitcoin P2PKH\n');
  
  const testCases = [
    {
      name: 'Format P2PKH (commence par 1)',
      entropy: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      validate: (data) => {
        if (!data.address.startsWith('1')) {
          throw new Error(`Adresse ne commence pas par 1: ${data.address}`);
        }
        return true;
      }
    },
    {
      name: 'WIF format (commence par 5)',
      entropy: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      validate: (data) => {
        if (!data.privateKeyWIF.startsWith('5')) {
          throw new Error(`WIF ne commence pas par 5: ${data.privateKeyWIF.substring(0, 20)}...`);
        }
        if (data.privateKeyWIF.length !== 51) {
          throw new Error(`WIF longueur invalide: ${data.privateKeyWIF.length} (attendu 51)`);
        }
        return true;
      }
    },
    {
      name: 'Déterministe',
      entropy: 'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
      validate: async (data) => {
        // Teste deux fois
        const response2 = await request(API_URL)
          .get(`/api/wallet/bitcoin/json?entropy=cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc`);
        
        if (response2.body.data.privateKey !== data.privateKey) {
          throw new Error('Non déterministe!');
        }
        return true;
      }
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`▶️  ${testCase.name}`);
    console.log('─'.repeat(40));
    
    try {
      const response = await request(API_URL)
        .get(`/api/wallet/bitcoin/json?entropy=${testCase.entropy}`)
        .timeout(5000);
      
      if (response.body.success) {
        const data = response.body.data;
        
        console.log(`   Adresse: ${data.address}`);
        console.log(`   WIF: ${data.privateKeyWIF.substring(0, 20)}...`);
        console.log(`   Mnemonics: ${data.mnemonics.split(' ').slice(0, 3).join(' ')}...`);
        
        // Validation spécifique
        await testCase.validate(data);
        
        console.log(`✅ ${testCase.name} - PASSÉ\n`);
      } else {
        console.log(`❌ API error: ${response.body.error}`);
        return false;
      }
    } catch (error) {
      console.log(`❌ ${testCase.name} - ERREUR: ${error.message}`);
      return false;
    }
  }
  
  console.log('='.repeat(60));
  console.log('🎉 TOUS LES TESTS SIMPLE WALLET PASSÉS!');
  console.log('\n📋 Résumé:');
  console.log('   • Format: P2PKH (adresses commençant par 1)');
  console.log('   • Type: Simple Wallet (non-hiérarchique)');
  console.log('   • WIF: Format mainnet (commence par 5)');
  console.log('   • Compatible: Bitcoin Core, Electrum, etc.');
  
  return true;
}

// Exécute si appelé directement
if (require.main === module) {
  testSimpleWallet().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { testSimpleWallet };