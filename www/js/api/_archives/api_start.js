// www/js/api/api_start.js - AVEC VÉRIFICATION DU PORT 3001
const SimpleApiServer = require('./simple_api_server');
const net = require('net');

// ==================================================
// COULEURS ANSI POUR CMD (garanties)
// ==================================================
const COLORS = {
    RESET: '\x1b[0m',
    BOLD: '\x1b[1m',
    
    // Couleurs claires - bien visibles sur CMD
    RED: '\x1b[91m',
    GREEN: '\x1b[92m', 
    YELLOW: '\x1b[93m',
    BLUE: '\x1b[94m',
    MAGENTA: '\x1b[95m',
    CYAN: '\x1b[96m',
    WHITE: '\x1b[97m',
    GRAY: '\x1b[90m'
};

// Symboles Unicode (fonctionnent sur CMD Windows 10+)
const SYMBOLS = {
    CHECK: '✓',
    CROSS: '✗',
    ROCKET: '🚀',
    INFO: '📊',
    WRENCH: '🔧',
    EARTH: '🌐',
    MAGNIFY: '🔍',
    HOURGLASS: '⏳',
    BULLET: '•',
    WARNING: '⚠️'
};

// Fonction utilitaire pour colorer le texte
function colorize(text, color) {
    return (COLORS[color] || '') + text + COLORS.RESET;
}

// ==================================================
// CONFIGURATION
// ==================================================
const PORT = process.env.PORT || 3001;
const HOST = '127.0.0.1';

// ==================================================
// VÉRIFICATION DU PORT
// ==================================================
function checkPort3001() {
    return new Promise((resolve) => {
        console.log(colorize(SYMBOLS.MAGNIFY + ' Vérification du port ' + PORT + '...', 'CYAN'));
        
        const tester = net.createServer();
        
        tester.once('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(colorize(SYMBOLS.CROSS + ' Le port ' + PORT + ' est déjà utilisé !', 'RED'));
                resolve(true);
            } else {
                console.log(colorize(SYMBOLS.WARNING + ' Erreur inattendue: ' + err.code, 'YELLOW'));
                resolve(false);
            }
        });
        
        tester.once('listening', () => {
            tester.once('close', () => {
                console.log(colorize(SYMBOLS.CHECK + ' Port ' + PORT + ' disponible', 'GREEN'));
                resolve(false);
            }).close();
        });
        
        tester.listen(PORT, HOST);
    });
}

// ==================================================
// INSTRUCTIONS D'ERREUR
// ==================================================
function showErrorInstructions() {
    const border = colorize('='.repeat(60), 'GRAY');
    
    console.error('\n' + border);
    console.error(colorize('!!! IMPOSSIBLE DE DÉMARRER LE SERVEUR', 'RED'));
    console.error(border + '\n');
    
    console.error('Le port 3001 est déjà utilisé par un autre processus.');
    console.error('\n' + colorize('QUE FAIRE ?', 'BOLD') + '\n');
    
    console.error(colorize('1. ARRÊTER LE SERVEUR EXISTANT', 'YELLOW'));
    console.error('   • Va dans la fenêtre/terminal où le serveur tourne');
    console.error('   • Appuie sur Ctrl+C\n');
    
    console.error(colorize('2. TUER LE PROCESSUS MANUELLEMENT (Windows)', 'YELLOW'));
    console.error('   a. Trouve l\'ID du processus :');
    console.error('      ' + colorize('netstat -ano | findstr :3001', 'CYAN'));
    console.error('   b. Tue le processus (remplace PID par l\'ID) :');
    console.error('      ' + colorize('taskkill /PID PID /F', 'CYAN') + '\n');
    
    console.error(colorize('3. TUER TOUS LES PROCESSUS NODE.JS', 'YELLOW'));
    console.error('   ' + colorize('taskkill /F /IM node.exe', 'CYAN') + '\n');
    
    console.error(colorize('4. CHANGER DE PORT', 'YELLOW'));
    console.error('   ' + colorize('set PORT=3002 && node api_start.js', 'CYAN') + '\n');
    
    console.error(colorize('5. REDÉMARRER (dernier recours)', 'YELLOW') + '\n');
    
    console.error(colorize('ASTUCE :', 'BOLD') + ' Pour éviter ce problème à l\'avenir,');
    console.error('toujours arrêter le serveur avec Ctrl+C avant de fermer le terminal.');
    console.error(border + '\n');
}

// ==================================================
// DÉMARRAGE DU SERVEUR
// ==================================================
async function startServer() {
    try {
        // Vérifier si le port est utilisé
        const portInUse = await checkPort3001();
        
        if (portInUse) {
            showErrorInstructions();
            process.exit(1);
        }
        
        // Créer et démarrer le serveur
        const server = new SimpleApiServer(PORT);
        
        // Gestion propre de l'arrêt
        const gracefulShutdown = (signal) => {
            console.log('\n' + colorize(SYMBOLS.HOURGLASS + ' Arrêt demandé (' + signal + ')...', 'MAGENTA'));
            server.stop();
            setTimeout(() => {
                console.log(colorize(SYMBOLS.CHECK + ' Serveur arrêté proprement', 'GREEN'));
                process.exit(0);
            }, 500);
        };
        
        process.on('SIGINT', () => gracefulShutdown('Ctrl+C'));
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        
        // Démarrer
        await server.start();
        
        // ==================================================
        // MESSAGE DE SUCCÈS - VERSION OPTIMISÉE CMD
        // ==================================================
        const border = colorize('='.repeat(52), 'CYAN');
        
        console.log('\n' + border);
        console.log(colorize(SYMBOLS.ROCKET + ' SERVEUR CRYPTOCALC DÉMARRÉ AVEC SUCCÈS !', 'BOLD'));
        console.log(border + '\n');
        
        console.log(colorize('📊 INFORMATIONS :', 'BOLD'));
        console.log(colorize('  ' + SYMBOLS.BULLET + ' Port: ' + PORT, 'GREEN'));
        console.log(colorize('  ' + SYMBOLS.BULLET + ' URL: http://localhost:' + PORT, 'CYAN'));
        console.log(colorize('  ' + SYMBOLS.BULLET + ' Health: http://localhost:' + PORT + '/health', 'BLUE'));
        console.log('');
        
        console.log(colorize('🔧 ENDPOINTS DISPONIBLES :', 'BOLD'));
        console.log(colorize('  ' + SYMBOLS.BULLET + ' GET  /health', 'GRAY'));
        console.log(colorize('  ' + SYMBOLS.BULLET + ' GET  /api/wallet/bitcoin/simple', 'GRAY'));
        console.log(colorize('  ' + SYMBOLS.BULLET + ' GET  /api/wallet/bitcoin/json?entropy=...', 'GRAY'));
        console.log(colorize('  ' + SYMBOLS.BULLET + ' POST /api/wallet/bitcoin/real', 'GRAY'));
        console.log(colorize('  ' + SYMBOLS.BULLET + ' POST /api/wallet/bitcoin/mock', 'GRAY'));
        console.log('');
        
        console.log(colorize('🌐 TESTS RAPIDES :', 'BOLD'));
        console.log(colorize('  1. curl http://localhost:' + PORT + '/health', 'WHITE'));
        console.log(colorize('  2. curl "http://localhost:' + PORT + '/api/wallet/bitcoin/simple"', 'WHITE'));
        console.log('');
        
        console.log(colorize('📍 DANS TON NAVIGATEUR :', 'BOLD'));
        console.log(colorize('  Ouvre: http://localhost:' + PORT + '/health', 'MAGENTA'));
        console.log('');
        
        console.log(colorize(SYMBOLS.WARNING + ' POUR ARRÊTER :', 'YELLOW'));
        console.log(colorize('  Appuie sur Ctrl+C dans ce terminal', 'WHITE'));
        console.log('\n' + border + '\n');
        
    } catch (error) {
        console.error('\n' + colorize(SYMBOLS.CROSS + ' ERREUR CRITIQUE :', 'RED'));
        console.error(colorize('  Message: ' + error.message, 'WHITE'));
        
        if (error.code === 'EADDRINUSE') {
            console.error('\n' + colorize('Le port 3001 a été pris entre-temps !', 'YELLOW'));
            console.error(colorize('  Recommence la vérification.', 'WHITE'));
        }
        
        process.exit(1);
    }
}

// ==================================================
// INITIALISATION WINDOWS
// ==================================================
if (process.platform === 'win32') {
    // Forcer les couleurs pour Windows
    process.env.FORCE_COLOR = '3';
    
    // Essayer d'activer l'UTF-8
    try {
        if (typeof process.stdout.setEncoding === 'function') {
            process.stdout.setEncoding('utf8');
        }
    } catch (e) {
        // Ignorer si ça échoue
    }
}

// ==================================================
// LANCEMENT
// ==================================================
startServer();