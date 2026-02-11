const { defineConfig } = require('@playwright/test');
const path = require('path');

module.exports = defineConfig({
  // Dossier des tests
  testDir: './e2e',
  
  // Timeouts
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  
  // Exécution en parallèle
  fullyParallel: true,
  workers: 1, // Peut être augmenté si vos tests sont indépendants
  
  // Rapport
  reporter: [
    ['list'], // Sortie console
    ['html', { outputFolder: '../playwright-report', open: 'never' }]
  ],
  
  // Configuration partagée (ne pas utiliser pour Electron)
  use: {
    // Vide - on utilisera electron.launch() directement
  },
  
  // Définir un projet Electron
  projects: [
    {
      name: 'electron',
      metadata: {
        description: 'Tests E2E pour application Electron'
      }
    }
  ],
  
  // Output directory pour les artefacts
  outputDir: '../test-results/',
});