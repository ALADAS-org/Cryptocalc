const fs = require('fs');
const path = require('path');

module.exports = async () => {
  console.log('⚡ Configuration globale des tests Electron');
  
  // Nettoyer les rapports précédents
  const reportDir = path.join(__dirname, '../playwright-report');
  if (fs.existsSync(reportDir)) {
    fs.rmSync(reportDir, { recursive: true });
  }
  
  // Créer le dossier pour les traces
  const tracesDir = path.join(__dirname, '../reports/traces');
  if (!fs.existsSync(tracesDir)) {
    fs.mkdirSync(tracesDir, { recursive: true });
  }
  
  // Variables d'environnement pour les tests
  process.env.TEST_MODE = 'e2e';
  process.env.ELECTRON_IS_TEST = 'true';
  
  return {
    // Données disponibles dans les tests via testInfo.project.config
    electronConfig: {
      appPath: path.join(__dirname, '../../../main.js'),
      isCI: !!process.env.CI
    }
  };
};