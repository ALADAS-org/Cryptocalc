const { _electron: electron } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

async function launchElectronApp(options = {}) {
  // Racine du projet
  const projectRoot = path.resolve(__dirname, '..', '..', '..');
  const mainFilePath = path.join(projectRoot, 'www', 'js', '_main', 'electron_main.js');
  const indexPath = path.join(projectRoot, 'www', 'index.html'); // Chemin direct
  
  console.log('=== Debug Electron Launch ===');
  console.log('Racine projet:', projectRoot);
  console.log('Chemin main.js:', mainFilePath);
  console.log('Chemin index.html:', indexPath);
  console.log('main.js existe?', fs.existsSync(mainFilePath));
  console.log('index.html existe?', fs.existsSync(indexPath));
  
  // Vérifier la structure du dossier www
  const wwwDir = path.join(projectRoot, 'www');
  if (fs.existsSync(wwwDir)) {
    console.log('Contenu de www/:');
    fs.readdirSync(wwwDir).forEach(file => {
      const fullPath = path.join(wwwDir, file);
      const stat = fs.statSync(fullPath);
      console.log(`  ${stat.isDirectory() ? '📁' : '📄'} ${file}`);
    });
  }
  
  const defaultOptions = {
    executablePath: require('electron'),
    args: [mainFilePath],
    timeout: 60000,
    env: {
      ...process.env,
      NODE_ENV: 'test',
      ELECTRON_ENABLE_LOGGING: '1',
      // Passer le chemin exact de index.html
      INDEX_HTML_PATH: indexPath,
      WWW_ROOT: wwwDir
    },
    cwd: projectRoot, // CRITIQUE: exécuter depuis la racine
    headless: false,
    slowMo: 500,
    // Capture des logs
    logger: {
      isEnabled: (name, severity) => true,
      log: (name, severity, message, args) => {
        console.log(`[${severity}] ${name}: ${message}`);
      }
    }
  };

  const launchOptions = { ...defaultOptions, ...options };
  
  console.log('Lancement de Electron depuis:', launchOptions.cwd);
  
  try {
    const electronApp = await electron.launch(launchOptions);
    console.log('✅ Electron lancé');
    
    // Attendre la fenêtre
    const window = await electronApp.firstWindow();
    console.log('Fenêtre obtenue, attente du chargement...');
    
    // Attendre plusieurs états de chargement
    await window.waitForLoadState('domcontentloaded', { timeout: 20000 });
    await window.waitForLoadState('load', { timeout: 10000 });
    await window.waitForTimeout(3000);
    
    // Debug: voir ce qui est chargé
    const currentUrl = await window.url();
    console.log('URL actuelle:', currentUrl);
    
    const title = await window.title();
    console.log('Titre de la page:', title);
    
    // Vérifier le contenu HTML
    const html = await window.content();
    console.log('Taille HTML:', html.length, 'caractères');
    
    if (html.length < 100) {
      console.warn('⚠️ HTML très court, probablement une page vide!');
      console.log('HTML:', html);
    }
    
    // Screenshot pour debug
    const screenshotPath = path.join(projectRoot, 'debug-load.png');
    await window.screenshot({ path: screenshotPath });
    console.log('📸 Screenshot:', screenshotPath);
    
    return electronApp;
  } catch (error) {
    console.error('❌ ERREUR de lancement:', error.message);
    throw error;
  }
}

module.exports = { launchElectronApp };