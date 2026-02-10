// tests/api/runners/smoke-test.js
const http = require('http');
const colors = require('./color_console');

class APITester {
    constructor(baseURL = 'http://localhost:3001') {
        this.baseURL = baseURL;
        this.entropy = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    }

    async testEndpoint(name, path, expectedStatus = 200, validator = null) {
        process.stdout.write(`${colors.cyan}${colors.icon.search}${colors.reset} ${colors.bright}${name.padEnd(25)}${colors.reset}... `);
        
        try {
            const result = await this.makeRequest(path);
            
            if (result.status !== expectedStatus) {
                console.log(`${colors.red}${colors.icon.error} FAILED${colors.reset} (expected ${colors.yellow}${expectedStatus}${colors.reset}, got ${colors.red}${result.status}${colors.reset})`);
                return false;
            }
            
            if (validator && !validator(result.body)) {
                console.log(`${colors.red}${colors.icon.error} FAILED${colors.reset} (validation error)`);
                return false;
            }
            
            console.log(`${colors.green}${colors.icon.success} OK${colors.reset}`);
            return true;
        } catch (error) {
            console.log(`${colors.red}${colors.icon.error} ERROR${colors.reset} (${colors.yellow}${error.message}${colors.reset})`);
            return false;
        }
    }

    async makeRequest(path) {
        return new Promise((resolve, reject) => {
            const req = http.get(`${this.baseURL}${path}`, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        resolve({
                            status: res.statusCode,
                            body: data ? JSON.parse(data) : null
                        });
                    } catch (e) {
                        reject(new Error(`Invalid JSON: ${data.substring(0, 100)}`));
                    }
                });
            });
            
            req.on('error', reject);
            req.setTimeout(3000, () => {
                req.destroy();
                reject(new Error('Timeout 3s'));
            });
        });
    }

    async run() {
        console.log(`${colors.magenta}${colors.bright}${colors.icon.rocket} API Smoke Test - Enhanced${colors.reset}\n`);
        
        const tests = [
            {
                name: 'Health Check',
                path: '/health',
                expected: 200,
                validator: (body) => body.status === 'online'
            },
            {
                name: 'Bitcoin Simple Wallet',
                path: `/api/wallet/BITCOIN/json?entropy=${this.entropy}`,
                expected: 200,
                validator: (body) => 
                    body.success === true && 
                    body.data.address && 
                    body.data.address.startsWith('1')
            },
            {
                name: 'Ethereum Simple Wallet',
                path: `/api/wallet/ETHEREUM/json?entropy=${this.entropy}`,
                expected: 200,
                validator: (body) => 
                    body.success === true && 
                    body.data.address && 
                    body.data.address.startsWith('0x')
            },
            {
                name: 'Dogecoin Simple Wallet',
                path: `/api/wallet/DOGECOIN/json?entropy=${this.entropy}`,
                expected: 200,
                validator: (body) => 
                    body.success === true && 
                    body.data.address && 
                    body.data.privateKeyWIF
            },
            {
                name: 'Invalid Coin',
                path: `/api/wallet/INVALIDCOIN/json?entropy=${this.entropy}`,
                expected: 404,
                validator: (body) => body.success === false
            }
        ];
        
        let passed = 0;
        let failed = 0;
        
        for (const test of tests) {
            const success = await this.testEndpoint(
                test.name,
                test.path,
                test.expected,
                test.validator
            );
            
            if (success) passed++;
            else failed++;
        }
        
        // Utilisation de la méthode utilitaire
        colors.showResults(passed, tests.length);
        
        return failed === 0;
    }
}

// Exécution
if (require.main === module) {
    const tester = new APITester();
    tester.run().then(success => {
        if (success) {
            console.log(`\n${colors.bright}${colors.green}${colors.icon.trophy} ALL TESTS PASSED!${colors.reset}`);
        } else {
            console.log(`\n${colors.bright}${colors.red}${colors.icon.fire} SOME TESTS FAILED${colors.reset}`);
        }
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error(`${colors.red}${colors.bright}Fatal error:${colors.reset}`, error);
        process.exit(1);
    });
}

module.exports = APITester;