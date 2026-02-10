// www/js/api/simple_api_server.js
const express = require('express');
const path    = require('path');

class SimpleApiServer {
    constructor(port = 3001) {
        this.app = express();
        this.port = port;
        this.setup();
    }
    
    setup() {
        // Middleware
        this.app.use(express.json());
        
        // Routes - CHEMIN RELATIF CORRECT
        const walletRouter = require('./routes/wallet');
        this.app.use('/api/wallet', walletRouter);
        
        // Route santé SIMPLIFIÉE
        this.app.get('/health', (req, res) => {
            res.json({ 
                status: 'online', 
                port: this.port,
                timestamp: new Date().toISOString(),
                service: 'CryptoCalc API v1.0'
            });
        });
        
        // Logging des requêtes
        this.app.use((req, res, next) => {
            console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
            next();
        });
        
        // Route 404
        this.app.use((req, res) => {
            res.status(404).json({
                error: 'Endpoint not found',
                available: ['/health', '/api/wallet/bitcoin/json', '/api/wallet/bitcoin/simple']
            });
        });
    }
    
    start() {
        return new Promise((resolve) => {
            this.server = this.app.listen(this.port, '127.0.0.1', () => {
                // ==================================================
                // MESSAGE DE DÉMARRAGE OPTIMISÉ POUR CMD
                // ==================================================
                const COLORS = {
                    RESET: '\x1b[0m',
                    BOLD: '\x1b[1m',
                    CYAN: '\x1b[96m',
                    GREEN: '\x1b[92m',
                    BLUE: '\x1b[94m',
                    MAGENTA: '\x1b[95m',
                    GRAY: '\x1b[90m'
                };
                
                const SYMBOLS = {
                    ROCKET: '🚀',
                    BULLET: '•',
                    ENDPOINT: '📍'
                };
                
                const border = COLORS.CYAN + '='.repeat(48) + COLORS.RESET;
                
                console.log('\n' + border);
                console.log(COLORS.BOLD + SYMBOLS.ROCKET + ' API CryptoCalc DÉMARRÉE' + COLORS.RESET);
                console.log(border + '\n');
                
                console.log(COLORS.GREEN + 'Port: ' + this.port + COLORS.RESET);
                console.log(COLORS.CYAN + 'URL: http://localhost:' + this.port + COLORS.RESET);
                console.log('');
                
                console.log(COLORS.BOLD + SYMBOLS.ENDPOINT + ' Endpoints:' + COLORS.RESET);
                console.log(COLORS.GRAY + '  ' + SYMBOLS.BULLET + ' GET  /health' + COLORS.RESET);
                console.log(COLORS.GRAY + '  ' + SYMBOLS.BULLET + ' GET  /api/wallet/bitcoin/simple' + COLORS.RESET);
                console.log(COLORS.GRAY + '  ' + SYMBOLS.BULLET + ' GET  /api/wallet/bitcoin/json?entropy=...' + COLORS.RESET);
                console.log(COLORS.GRAY + '  ' + SYMBOLS.BULLET + ' POST /api/wallet/bitcoin/real' + COLORS.RESET);
                console.log(COLORS.GRAY + '  ' + SYMBOLS.BULLET + ' POST /api/wallet/bitcoin/mock' + COLORS.RESET);
                
                console.log('\n' + border + '\n');
                // ==================================================
                
                resolve();
            });
        });
    }
    
    stop() {
        if (this.server) {
            this.server.close();
            console.log('🛑 API arrêtée');
        }
    }
}

module.exports = SimpleApiServer;