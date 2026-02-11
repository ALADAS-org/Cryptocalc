const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

class TestRunner {
    constructor() {
        this.apiProcess = null;
        this.didStartAPI = false;
    }
    
    async checkAPI() {
        return new Promise((resolve) => {
            const req = http.get('http://localhost:3001/health', (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        resolve(json.status === 'online');
                    } catch {
                        resolve(false);
                    }
                });
            });
            
            req.on('error', () => resolve(false));
            req.setTimeout(2000, () => {
                req.destroy();
                resolve(false);
            });
        });
    }
    
    async startAPI() {
        console.log('🚀 Démarrage de l\'API...');
        
        return new Promise((resolve) => {
            const apiScript = path.join(process.cwd(), 'www', 'js', 'api', 'api_start.js');
            
            if (process.platform === 'win32') {
                this.apiProcess = spawn('cmd.exe', [
                    '/c', 'start', 'cmd.exe', '/k', 
                    `node "${apiScript}"`
                ], {
                    detached: true,
                    stdio: 'ignore'
                });
            } else {
                this.apiProcess = spawn('node', [apiScript], {
                    detached: true,
                    stdio: 'ignore'
                });
            }
            
            this.didStartAPI = true;
            this.apiProcess.unref();
            
            setTimeout(async () => {
                let attempts = 0;
                while (attempts < 10) {
                    if (await this.checkAPI()) {
                        console.log('✅ API démarrée avec succès');
                        resolve(true);
                        return;
                    }
                    await new Promise(r => setTimeout(r, 1000));
                    attempts++;
                }
                console.log('❌ API n\'a pas démarré dans les temps');
                resolve(false);
            }, 8000);
        });
    }
    
    async stopAPI() {
        if (this.didStartAPI) {
            console.log('🛑 Arrêt de l\'API...');
            try {
                const killApi = require('./kill-api');
                await killApi();
            } catch (error) {
                console.log('⚠️ Erreur lors de l\'arrêt:', error.message);
            }
        }
    }
    
    async runTest(testName) {
        const scriptPath = path.join(__dirname, '..', 'runners', testName);
        
        console.log(`🧪 Exécution du test: ${testName}`);
        console.log('='.repeat(50));
        
        const apiIsRunning = await this.checkAPI();
        
        if (!apiIsRunning) {
            console.log('⚠️ API non détectée, tentative de démarrage...');
            const started = await this.startAPI();
            if (!started) {
                console.log('❌ Impossible de démarrer l\'API, test annulé');
                return false;
            }
        } else {
            console.log('✅ API déjà en cours d\'exécution');
        }
        
        try {
            const testModule = require(scriptPath);
            
            let testResult;
            
            if (typeof testModule === 'function') {
                testResult = await testModule();
            } else if (testModule.default && typeof testModule.default === 'function') {
                testResult = await testModule.default();
            } else if (testModule.APITester && typeof testModule.APITester === 'function') {
                const TesterClass = testModule.APITester;
                const tester = new TesterClass();
                testResult = await tester.run();
            } else if (testModule.run && typeof testModule.run === 'function') {
                testResult = await testModule.run();
            } else {
                console.log('❌ Format de test non reconnu');
                return false;
            }
            
            console.log('='.repeat(50));
            console.log(testResult ? '✅ TEST RÉUSSI' : '❌ TEST ÉCHOUÉ');
            
            return testResult;
        } catch (error) {
            console.error('❌ Erreur lors de l\'exécution du test:', error.message);
            if (error.stack) {
                console.error('Stack:', error.stack.split('\n')[0]);
            }
            return false;
        } finally {
            await this.stopAPI();
        }
    }
}

async function main() {
    if (process.argv.length < 3) {
        console.error('Usage: node test-runner.js <test-script>');
        console.error('Exemples:');
        console.error('  node test-runner.js smoke-test.js');
        console.error('  node test-runner.js diagnostic.js');
        process.exit(1);
    }
    
    const testName = process.argv[2];
    const runner = new TestRunner();
    
    const success = await runner.runTest(testName);
    process.exit(success ? 0 : 1);
}

if (require.main === module) {
    main();
}

module.exports = TestRunner;