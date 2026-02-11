const { defineConfig } = require('@playwright/test');
const path = require('path');

module.exports = defineConfig({
  testDir: '../e2e',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Pour Electron, mieux vaut 1 worker
  reporter: 'html',
  
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  
  projects: [
    {
      name: 'electron',
      use: {
        // Configuration spécifique pour Electron
        electron: {
          // Chemin vers le fichier main de votre app Electron
          args: [path.join(__dirname, '..', 'www', 'js', '_main', 'electron_main.js')],
          // Autres options
          launchOptions: {
            // Pour le debug
            // headless: false,
            // devtools: true
          }
        }
      }
    }
  ]
});