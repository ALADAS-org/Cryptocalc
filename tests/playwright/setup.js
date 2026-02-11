/**
 * ============================================================================
 * Configuration globale pour les tests Playwright
 * ============================================================================
 * Ce fichier configure l'environnement de test Electron
 * ============================================================================
 */

const { test: base, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

// ==========================================================================
// CONFIGURATION DES CHEMINS
// ==========================================================================

const ELECTRON_PATH = require('electron');
const MAIN_PATH = path.join(__dirname, '../../www/js/_main/electron_main.js');
const COVERAGE_DIR = path.join(__dirname, '../coverage/playwright');

// Créer le dossier coverage s'il n'existe pas
if (!fs.existsSync(COVERAGE_DIR)) {
  fs.mkdirSync(COVERAGE_DIR, { recursive: true });
}

// ==========================================================================
// FIXTURES PERSONNALISÉES
// ==========================================================================

/**
 * Fixture Electron personnalisée
 */
const test = base.extend({
  
  /**
   * Lance l'application Electron
   */
  electronApp: async ({ }, use) => {
    const { _electron: electron } = require('@playwright/test');
    
    console.log('🚀 Lancement de l\'application Electron...');
    
    const app = await electron.launch({
      args: [MAIN_PATH],
      executablePath: ELECTRON_PATH,
      env: {
        ...process.env,
        NODE_ENV: 'test',
        ELECTRON_ENABLE_LOGGING: true,
        TEST_MODE: true
      },
      timeout: 30000
    });

    console.log('✅ Application Electron lancée');

    await use(app);
    
    console.log('🛑 Fermeture de l\'application Electron...');
    await app.close();
  },

  /**
   * Récupère la fenêtre principale
   */
  page: async ({ electronApp }, use) => {
    const page = await electronApp.firstWindow();
    
    // Attendre que la page soit chargée
    await page.waitForLoadState('domcontentloaded');
    
    // Configuration de la page
    page.setDefaultTimeout(10000);
    
    await use(page);
  },

  /**
   * Helper pour les captures d'écran
   */
  screenshot: async ({ page }, use, testInfo) => {
    const takeScreenshot = async (name) => {
      const screenshotPath = path.join(
        __dirname, 
        'test-results', 
        testInfo.title.replace(/\s+/g, '-'),
        `${name}.png`
      );
      
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      
      console.log(`📸 Capture d'écran: ${screenshotPath}`);
      return screenshotPath;
    };
    
    await use(takeScreenshot);
  }
});

// ==========================================================================
// HELPERS GLOBAUX
// ==========================================================================

/**
 * Attendre que l'application soit prête
 */
async function waitForAppReady(page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000); // Délai de sécurité
}

/**
 * Charger une fixture
 */
function loadFixture(filename) {
  const fixturePath = path.join(__dirname, 'fixtures', filename);
  return JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
}

// ==========================================================================
// EXPORT
// ==========================================================================

module.exports = { 
  test, 
  expect,
  waitForAppReady,
  loadFixture,
  COVERAGE_DIR
};