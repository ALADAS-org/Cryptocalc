// api-simple.js - Version 100% fonctionnelle
const express = require('express');
const app = express();
const PORT = 3001;

// Middleware essentiel
app.use(express.json());

// Route GET pour test navigateur
app.get('/api/wallet/bitcoin/simple', (req, res) => {
    res.send(`
        <html>
        <body style="font-family: Arial; padding: 20px;">
            <h1>🔐 CryptoCalc API Test</h1>
            <p>Cette route fonctionne en GET. Pour tester :</p>
            
            <button onclick="testPost()" style="padding: 10px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Tester la génération de wallet
            </button>
            
            <div id="result" style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 5px;"></div>
            
            <h3>Test avec curl :</h3>
            <pre style="background: #eee; padding: 10px;">
curl -X POST http://localhost:3001/api/wallet/bitcoin/simple \\
  -H "Content-Type: application/json" \\
  -d '{"entropy":"1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"}'
            </pre>
            
            <script>
            async function testPost() {
                const result = document.getElementById('result');
                result.innerHTML = '⏳ Génération en cours...';
                
                try {
                    const response = await fetch('/api/wallet/bitcoin/simple', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            entropy: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
                            label: 'Test'
                        })
                    });
                    
                    // Vérifie le Content-Type
                    const contentType = response.headers.get('content-type');
                    console.log('Content-Type:', contentType);
                    
                    if (contentType && contentType.includes('application/json')) {
                        const data = await response.json();
                        result.innerHTML = '<span style="color: green;">✅ Succès !</span><br>' + 
                                          JSON.stringify(data, null, 2);
                    } else {
                        const text = await response.text();
                        console.log('Received HTML:', text.substring(0, 200));
                        result.innerHTML = '❌ Erreur : Réponse non-JSON reçue';
                    }
                } catch (error) {
                    result.innerHTML = '❌ Erreur : ' + error.message;
                }
            }
            </script>
        </body>
        </html>
    `);
});

// Route POST simplifiée au maximum
app.post('/api/wallet/bitcoin/simple', (req, res) => {
    console.log('📥 POST reçu :', req.body);
    
    try {
        const { entropy } = req.body;
        
        if (!entropy) {
            return res.status(400).json({ 
                error: 'Entropy manquante',
                solution: 'Envoyez {"entropy":"votre_entropie_hex"}' 
            });
        }
        
        // SIMULATION - remplace ça par ton vrai code plus tard
        const mockWallet = {
            address: "1F1tAaz5x1HUXrCNLbtMDqcw6o5GNn4xqX",
            privateKey: "5J3mBbAH58CpQ3Y5RNJpUKPE62SQ5tfcvU2JpbnkeyhfsYB1Jcn",
            publicKey: "029e5e17a9e4b6b35a42b2d8eaf..." + entropy.substring(0, 10),
            network: "mainnet",
            entropyLength: entropy.length,
            timestamp: new Date().toISOString()
        };
        
        // FORCE le Content-Type JSON
        res.setHeader('Content-Type', 'application/json');
        res.json({
            success: true,
            message: "Wallet généré (simulation)",
            data: mockWallet
        });
        
    } catch (error) {
        console.error('Erreur:', error);
        res.setHeader('Content-Type', 'application/json');
        res.status(500).json({ 
            error: "Erreur serveur", 
            details: error.message 
        });
    }
});

// Route santé
app.get('/health', (req, res) => {
    res.json({ 
        status: 'online',
        timestamp: new Date().toISOString(),
        endpoints: ['GET /api/wallet/bitcoin/simple', 'POST /api/wallet/bitcoin/simple']
    });
});

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Route non trouvée',
        path: req.path,
        method: req.method
    });
});

// Démarrer
app.listen(PORT, 'localhost', () => {
    console.log(`🚀 API démarrée sur http://localhost:${PORT}`);
    console.log(`🔗 Test GET : http://localhost:${PORT}/api/wallet/bitcoin/simple`);
    console.log(`🔗 Santé    : http://localhost:${PORT}/health`);
    console.log('\n📝 Test curl :');
    console.log(`curl -X POST http://localhost:${PORT}/api/wallet/bitcoin/simple \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -d '{"entropy":"1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"}'`);
});