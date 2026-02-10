// ===============================================================================================
// ==================================   color_console.js   ======================================
// ===============================================================================================

const colors = {
    // Texte coloré
    red: '\x1b[1;31m',
    redHigh: '\x1b[0;91m',
    green: '\x1b[0;92m',
    yellow: '\x1b[0;93m',
    orange: '\x1b[38;2;220;160;0m',  // Orange (RGB)
    blue: '\x1b[0;94m',
    purple: '\x1b[0;95m',
    cyan: '\x1b[0;96m',
    white: '\x1b[0;97m',
    
    // Styles
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    italic: '\x1b[3m',
    underline: '\x1b[4m',
    blink: '\x1b[5m',
    reverse: '\x1b[7m',
    hidden: '\x1b[8m',
    
    // Arrière-plans
    bgBlack: '\x1b[40m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m',
    bgWhite: '\x1b[47m',
    
    // Combinaisons prédéfinies
    whiteOnRed: '\x1b[0;47m\x1b[41m',
    blackOnYellow: '\x1b[0;30m\x1b[43m',
    blackOnCyan: '\x1b[0;30m\x1b[0;104m',
    blackOnPurple: '\x1b[0;30m\x1b[0;105m',
    
    // Reset
    reset: '\x1b[0m',
    end: '\x1b[0m'
};

// Méthodes utilitaires
colors.log = {
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    info: (msg) => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`),
    debug: (msg) => console.log(`${colors.dim}🔍 ${msg}${colors.reset}`),
    
    // Pour les tests
    testPass: (name, details = '') => console.log(`   ${colors.green}✅ ${name}${details ? `: ${colors.dim}${details}` : ''}${colors.reset}`),
    testFail: (name, error = '') => console.log(`   ${colors.red}❌ ${name}${error ? `: ${colors.yellow}${error}` : ''}${colors.reset}`),
    testTitle: (title) => console.log(`${colors.cyan}${colors.bright}▶️  ${title}${colors.reset}`),
    section: (title) => console.log(`\n${colors.magenta}${colors.bright}${title}${colors.reset}\n${colors.dim}${'─'.repeat(60)}${colors.reset}`)
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = colors;
}