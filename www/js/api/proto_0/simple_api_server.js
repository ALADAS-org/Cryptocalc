// ============================================================================================================
// ===============================             simple_api_server.js             ===============================
// ============================================================================================================
"use strict";

const express = require('express');

class SimpleApiServer {
    constructor( port = 3001 ) {
        this.app = express();
        this.port = port;
        this.setup();
    } // constructor
    
    setup() {
        // Middleware basique
        this.app.use(express.json());
        
        // Une seule route pour commencer
        const walletRouter = require('./routes/wallet');
        this.app.use('/api/wallet', walletRouter);
        
        // Route de santé
        this.app.get('/health', (req, res) => {
            res.json({ status: 'ok', service: 'cryptocalc-api' });
        });
        
        // Gestion d'erreurs simple
        this.app.use((err, req, res, next) => {
            console.error('API Error:', err.message);
            res.status(500).json({ error: 'Something went wrong' });
        });
    } // setup() 
    
    start() {
        return new Promise((resolve) => {
            this.server = this.app.listen(this.port, () => {
                console.log(`✅ API Cryptocalc running on http://localhost:${this.port}`);
                console.log(`📡 Endpoint: POST http://localhost:${this.port}/api/wallet/bitcoin/simple`);
                resolve();
            });
        });
    }  // start()
    
    stop() {
        if (this.server) {
            this.server.close();
            console.log('🛑 API server stopped');
        }
    } // stop()
} // SimpleApiServer class 

function test_simple_api_server() {
    const server = new SimpleApiServer();
    server.start();
} // test_simple_api_server

test_simple_api_server();

if ( typeof exports === 'object' ) {
	exports.SimpleApiServer = SimpleApiServer	
} // exports of 'bip38_utils.js'