// ===============================================================================================
// ==================================   color_console.js   ======================================
// ===============================================================================================

const colors = {
    // Couleurs de base
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m'
};

// Icônes (séparées)
colors.icon = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    search: '🔍',
    rocket: '🚀',
    test: '🧪',
    arrow: '▶️',
    repeat: '🔁',
    chart: '📊',
    trophy: '🎉',
    fire: '💥'
};

// Méthode utilitaire pour afficher les résultats
colors.showResults = function(passed, total) {
    const successRate = Math.round((passed / total) * 100);
    let rateColor = colors.green;
    if (successRate < 70) rateColor = colors.red;
    else if (successRate < 90) rateColor = colors.yellow;
    
    console.log(`\n${colors.bright}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.blue}${colors.icon.chart} RESULTS:${colors.reset}`);
    
    const passedColor = passed > 0 ? colors.green : colors.dim;
    const failedColor = (total - passed) > 0 ? colors.red : colors.dim;
    
    console.log(`${passedColor}${colors.icon.success} Passed: ${passed}${colors.reset}`);
    console.log(`${failedColor}${colors.icon.error} Failed: ${total - passed}${colors.reset}`);
    console.log(`${rateColor}${colors.icon.chart} Success Rate: ${successRate}%${colors.reset}`);
    console.log(`${colors.bright}${'='.repeat(60)}${colors.reset}`);
};

module.exports = colors;