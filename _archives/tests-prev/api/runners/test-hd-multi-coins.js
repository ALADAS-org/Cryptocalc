// uuid: f3a4b5c6-d7e8-9f0a-1b2c-3d4e5f6a7b8c
// tests/api/runners/test-hd-multi-coins.js

const http = require('http');
const colors = require('./color_console');

/**
 * Test HD wallet generation using the official /api/wallet prefix
 */
async function testHDMultiCoins() {
    console.log(`${colors.magenta}${colors.bright}${colors.icon.test} Test HD Wallet Multi-Coins (BIP32/BIP44)${colors.reset}\n`);
    
    const API_URL = 'http://localhost:3001';
    const entropy = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    
    // Updated coin names to match ALLOWED_BLOCKCHAINS keys in wallet.js
     //const coins = [
     //    'Bitcoin', 'DogeCoin', 'LiteCoin', 
      //   'SOLANA', 'AVALANCHE', 'POLYGON', 'TONCOIN', 'TERRA',
      //   'BINANCE_BSC'
     //];
	
	const coins = [
        'BITCOIN', 'ETHEREUM', 'DOGECOIN', 'LITECOIN', 
        'SOLANA', 'AVALANCHE', 'POLYGON', 'TON', 'TERRA_LUNA',
		'BINANCE_BSC'
    ];
    
    let allPassed = true;
    let passedCount = 0;

    console.log(`${colors.cyan}${colors.bright}${colors.icon.arrow} Testing ${coins.length} coins via /api/wallet/hd/...${colors.reset}`);
    console.log(`${colors.dim}${'─'.repeat(60)}${colors.reset}`);

    for (const coin of coins) {
        process.stdout.write(`${colors.dim}🔍 Testing ${coin.padEnd(15)}... ${colors.reset}`);
        
        try {
            // Updated URL to include /api prefix as defined in simple_api_server.js
            const url = `${API_URL}/api/wallet/hd/${coin}/json?entropy=${entropy}`;
            const response = await makeRequest(url);

            if (response.status === 200 && response.body.success) {
                console.log(`${colors.green}✅ OK${colors.reset}`);
                passedCount++;
            } else {
                const errorMsg = response.body ? response.body.error : 'Endpoint not found (404)';
                console.log(`${colors.red}❌ Error: ${errorMsg}${colors.reset}`);
                allPassed = false;
            } // end if response
        } catch (error) {
            console.log(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
            allPassed = false;
        } // end try-catch
    } // end for coins

    console.log(`\n${colors.bright}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.bright}📊 FINAL RESULTS:${colors.reset}`);
    console.log(`✅ Passed: ${passedCount}`);
    console.log(`❌ Failed: ${coins.length - passedCount}`);
    console.log(`${colors.bright}${'='.repeat(60)}${colors.reset}`);
    
    return allPassed;
} // end testHDMultiCoins block

/**
 * Utility for HTTP GET requests
 */
function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(data) });
                } catch (e) {
                    reject(new Error(`Invalid JSON response`));
                } // end try-catch
            }); // end res.on end
        }); // end http.get
        req.on('error', reject);
        req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
    }); // end Promise block
} // end makeRequest block

if (require.main === module) {
    testHDMultiCoins().then(success => process.exit(success ? 0 : 1));
} // end main block