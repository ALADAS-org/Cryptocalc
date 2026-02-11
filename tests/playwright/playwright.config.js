const { defineConfig } = require('@playwright/test');
const path = require('path');

module.exports = defineConfig({
  
  // Tests dans tests/playwright/e2e/
  testDir: './e2e',
  
  // Sorties dans tests/playwright/
  outputDir: path.join(__dirname, 'test-results'),
  
  // Rapports dans tests/playwright/playwright-report/
  reporter: [
    ['html', { 
      outputFolder: path.join(__dirname, 'playwright-report'),
      open: 'never' 
    }],
    ['list'],
    ['json', { 
      outputFile: path.join(__dirname, 'playwright-report/results.json') 
    }]
  ],
  
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    
    // Dossier pour les traces
    actionTimeout: 10000,
    navigationTimeout: 30000
  },
  
  timeout: 30000,
  
  expect: {
    timeout: 5000
  },
  
  // Important pour Electron - pas de parallélisation
  workers: 1,
  fullyParallel: false,
  
  // Retry sur échec
  retries: 2,
  
  // Configuration globale
  globalSetup: require.resolve('./setup.js'),
  
  // Metadata
  metadata: {
    project: 'Cryptocalc',
    testType: 'E2E GUI Tests',
    framework: 'Playwright + Electron'
  }
});