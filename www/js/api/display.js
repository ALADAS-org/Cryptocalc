// www/js/api/display.js
const supportsColor = require('supports-color');
const ansi = require('ansi-styles');

class Display {
    constructor() {
        // Force la détection pour CMD
        this.colorLevel = this.forceColorDetection();
        this.hasColors = this.colorLevel > 0;
        this.hasUnicode = this.checkUnicode();
        
        this.setupSymbols();
        this.setupColors();
    }
    
    forceColorDetection() {
        // STRATÉGIE AGGRESSIVE POUR WINDOWS
        if (process.platform === 'win32') {
            // 1. Vérifier les variables d'environnement standard
            if (process.env.FORCE_COLOR) {
                return parseInt(process.env.FORCE_COLOR) || 1;
            }
            
            // 2. Vérifier si CMD a été configuré
            if (process.env.TERM === 'xterm' || process.env.TERM === 'xterm-256color') {
                return 3;
            }
            
            // 3. Vérifier si on est dans VSCode ou autre terminal moderne
            if (process.env.TERM_PROGRAM === 'vscode' || 
                process.env.WT_SESSION ||  // Windows Terminal
                process.env.ConEmuANSI === 'ON') {
                return 3;
            }
            
            // 4. FORCER pour CMD moderne (Windows 10+)
            const version = process.version.match(/v(\d+)\.(\d+)\.(\d+)/);
            const major = version ? parseInt(version[1]) : 0;
            
            // Node 10+ sur Windows 10+ a un meilleur support
            if (major >= 10) {
                // Essayer d'activer les couleurs ANSI
                try {
                    // Code pour activer les séquences ANSI sur Windows
                    if (process.stdout._handle && 
                        process.stdout._handle.setMode) {
                        process.stdout._handle.setMode(1); // Mode ANSI
                    }
                } catch (e) {}
                return 1; // Au moins les couleurs basiques
            }
            
            // Fallback: utiliser supports-color
            return supportsColor.stdout ? supportsColor.stdout.level : 0;
        }
        
        // Pour Linux/Mac
        return supportsColor.stdout ? supportsColor.stdout.level : 0;
    }
    
    checkUnicode() {
        if (process.platform !== 'win32') return true;
        
        // Sur Windows, vérifier si on peut écrire Unicode
        try {
            // Tester avec un caractère simple
            const testChar = '✓';
            process.stdout.write(testChar);
            // Si on arrive ici, c'est probablement OK
            // On efface le test en reculant
            process.stdout.write('\b');
            return true;
        } catch (e) {
            return false;
        }
    }
    
    setupSymbols() {
        if (this.hasUnicode) {
            this.symbols = {
                check: '✓',
                cross: '✗',
                warning: '⚠️',
                rocket: '🚀',
                magnify: '🔍',
                info: '📊',
                wrench: '🔧',
                earth: '🌐',
                stop: '🛑',
                bullet: '•',
                success: '✅',
                error: '❌',
                hourglass: '⏳'
            };
        } else {
            this.symbols = {
                check: '[OK]',
                cross: '[ERR]',
                warning: '[!]',
                rocket: '[=>]',
                magnify: '[?]',
                info: '[i]',
                wrench: '[W]',
                earth: '[www]',
                stop: '[X]',
                bullet: '-',
                success: '[SUCCESS]',
                error: '[ERROR]',
                hourglass: '[...]'
            };
        }
    }
    
    setupColors() {
        if (this.hasColors && this.colorLevel >= 2) {
            // Couleurs 256/truecolor
            this.colors = {
                reset: ansi.reset.open,
                red: ansi.red.open,
                green: ansi.green.open,
                yellow: ansi.yellow.open,
                blue: ansi.blue.open,
                magenta: ansi.magenta.open,
                cyan: ansi.cyan.open,
                white: ansi.white.open,
                gray: ansi.gray.open,
                bold: ansi.bold.open
            };
        } else if (this.hasColors && this.colorLevel === 1) {
            // Couleurs basiques 16
            this.colors = {
                reset: '\x1b[0m',
                red: '\x1b[31m',
                green: '\x1b[32m',
                yellow: '\x1b[33m',
                blue: '\x1b[34m',
                magenta: '\x1b[35m',
                cyan: '\x1b[36m',
                white: '\x1b[37m',
                gray: '\x1b[90m',
                bold: '\x1b[1m'
            };
        } else {
            // Pas de couleurs
            this.colors = {
                reset: '', red: '', green: '', yellow: '', blue: '',
                magenta: '', cyan: '', white: '', gray: '', bold: ''
            };
        }
        
        // Fermetures pour chaque couleur
        this.colorClose = {
            reset: ansi.reset.close,
            red: ansi.red.close,
            green: ansi.green.close,
            yellow: ansi.yellow.close,
            blue: ansi.blue.close,
            magenta: ansi.magenta.close,
            cyan: ansi.cyan.close,
            white: ansi.white.close,
            gray: ansi.gray.close,
            bold: ansi.bold.close
        };
    }
    
    // Méthodes d'affichage
    colorize(text, colorName) {
        if (!this.colors[colorName]) return text;
        return this.colors[colorName] + text + this.colors.reset;
    }
    
    log(text, color) {
        console.log(color ? this.colorize(text, color) : text);
    }
    
    success(text) {
        const symbol = this.symbols.success;
        console.log(this.colorize(`${symbol} ${text}`, 'green'));
    }
    
    error(text) {
        const symbol = this.symbols.error;
        console.log(this.colorize(`${symbol} ${text}`, 'red'));
    }
    
    info(text) {
        const symbol = this.symbols.info;
        console.log(this.colorize(`${symbol} ${text}`, 'blue'));
    }
    
    warning(text) {
        const symbol = this.symbols.warning;
        console.log(this.colorize(`${symbol} ${text}`, 'yellow'));
    }
    
    progress(text) {
        const symbol = this.symbols.hourglass;
        console.log(this.colorize(`${symbol} ${text}`, 'cyan'));
    }
    
    title(text) {
        console.log(this.colorize(`\n${text}`, 'bold'));
    }
    
    line(length = 60, char = '=') {
        console.log(this.colorize(char.repeat(length), 'gray'));
    }
}

// Singleton
module.exports = new Display();