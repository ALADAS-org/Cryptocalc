// uuid: 2d3e4f5g-6h7i-8j9k-0l1m-2n3o4p5q6r7s
// tests/api/runners/smoke.test.js

const http = require('http');

/**
 * Smoke Test : Vérification rapide de la connectivité et du premier endpoint
 */
async function runSmokeTest() {
    console.log('💨 API Smoke Test - Quick Check\n');
    
    const API_URL = 'http://localhost:3001';
    const endpoints = [
        { name: 'Health Check', path: '/health' },
        { name: 'Wallet Status', path: '/api/wallet/status' },
        { name: 'Bitcoin Generation', path: '/api/wallet/BITCOIN/json?entropy=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef' }
    ];
    
    let allPassed = true;

    for (const ep of endpoints) {
        process.stdout.write(`🔍 Checking ${ep.name.padEnd(20)}... `);
        try {
            const res = await new Promise((resolve, reject) => {
                http.get(`${API_URL}${ep.path}`, (res) => {
                    let data = '';
                    res.on('data', (chunk) => data += chunk);
                    res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
                }).on('error', reject);
            });

            if (res.status === 200 && (res.body.status === 'online' || res.body.success)) {
                console.log('✅ OK');
            } else {
                console.log('❌ FAILED');
                allPassed = false;
            } // end if status check
        } catch (error) {
            console.log(`❌ ERROR (${error.message})`);
            allPassed = false;
        } // end try-catch
    } // end for loop

    console.log('\n' + (allPassed ? '👍 API is healthy' : '👎 API has issues'));
    process.exit(allPassed ? 0 : 1);
} // end runSmokeTest block

runSmokeTest();