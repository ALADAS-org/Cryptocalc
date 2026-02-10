// uuid: 7e2d4a5b-c6d8-4e9f-a1b2-c3d4e5f6a7b8
// www/js/api/api_start.js

const SimpleApiServer = require('./simple_api_server');
const net = require('net');

// ==================================================
// COULEURS ANSI POUR CMD
// ==================================================
const COLORS = {
    RESET: '\x1b[0m',
    BOLD: '\x1b[1m',
    RED: '\x1b[91m',
    GREEN: '\x1b[92m', 
    YELLOW: '\x1b[93m',
    BLUE: '\x1b[94m',
    MAGENTA: '\x1b[95m',
    CYAN: '\x1b[96m',
    WHITE: '\x1b[97m',
    GRAY: '\x1b[90m'
}; // end COLORS block

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
}; // end SYMBOLS block

function colorize(text, colorName) {
    return (COLORS[colorName] || COLORS.RESET) + text + COLORS.RESET;
} // end colorize function

function checkPort(port) {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.once('error', (err) => {
            if (err.code === 'EADDRINUSE') resolve(false);
        });
        server.once('listening', () => {
            server.close();
            resolve(true);
        });
        server.listen(port);
    });
} // end checkPort function

async function startServer() {
    const PORT = 3001;
    const border = colorize('═'.repeat(60), 'GRAY');

    console.log('\n' + border);
    console.log(colorize('  ' + SYMBOLS.ROCKET + ' INITIALISATION DU SERVEUR API CRYPTOCALC', 'BOLD'));
    console.log(border);

    try {
        process.stdout.write(colorize('  ' + SYMBOLS.HOURGLASS + ' Vérification du port ' + PORT + '... ', 'WHITE'));
        const isAvailable = await checkPort(PORT);

        if (!isAvailable) {
            console.log(colorize(SYMBOLS.CROSS + ' OCCUPÉ', 'RED'));
            process.exit(1);
        }
        console.log(colorize(SYMBOLS.CHECK + ' LIBRE', 'GREEN'));

        // 1. Initialisation de l'instance
        const serverInstance = new SimpleApiServer(PORT);
        
        // 2. RÉSOLUTION DU CONFLIT DE ROUTE (ALIAS)
        // SimpleApiServer utilise déjà '/api/wallet'.
        // On ajoute ici les routes sans le préfixe /api pour les tests runners.
        const walletRoutes = require('./routes/wallet');
        
        // Support pour les tests qui appellent /wallet/...
        serverInstance.app.use('/wallet', walletRoutes);
        
        // Support pour les tests qui appellent directement /hd/... ou /json/... à la racine
        serverInstance.app.use('/', walletRoutes);

        // 3. Démarrage
        await serverInstance.start();

        console.log('\n' + border);
        console.log(colorize('  ' + SYMBOLS.EARTH + ' SERVEUR OPÉRATIONNEL SUR : ', 'BOLD') + colorize('http://localhost:' + PORT, 'CYAN'));
        console.log(border);
        
        console.log(colorize('  ' + SYMBOLS.INFO + ' COMPATIBILITÉ ROUTES :', 'BOLD'));
        console.log(colorize('  • Standard : /api/wallet/hd/BITCOIN/json', 'GRAY'));
        console.log(colorize('  • Tests    : /wallet/hd/BITCOIN/json', 'MAGENTA'));
        console.log(colorize('  • Legacy   : /hd/BITCOIN/json', 'YELLOW'));
        console.log('\n' + border + '\n');
        
    } catch (error) {
        console.error('\n' + colorize(SYMBOLS.CROSS + ' ERREUR CRITIQUE :', 'RED'));
        console.error(colorize('  Message: ' + error.message, 'WHITE'));
        process.exit(1);
    } // end try-catch block
} // end startServer function

if (process.platform === 'win32') {
    process.env.FORCE_COLOR = '3';
    try {
        if (typeof process.stdout.setEncoding === 'function') {
            process.stdout.setEncoding('utf8');
        }
    } catch (e) {}
} // end win32 block

startServer();