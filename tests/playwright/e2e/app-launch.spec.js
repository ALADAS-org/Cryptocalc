const { test, expect } = require('@playwright/test');
const { launchElectronApp } = require('../config/electron-launch');
const MainWindow = require('../pages/main-window');

let electronApp;
let mainWindow;

test.describe('Lancement de l\'application', () => {
  test.beforeEach(async () => {
    electronApp = await launchElectronApp();
    const window = await electronApp.firstWindow();
    await window.waitForLoadState('domcontentloaded');
    mainWindow = new MainWindow(window);
  });

  test.afterEach(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  test('L\'application se lance avec le bon titre', async () => {
    const title = await mainWindow.getTitle();
    expect(title).toBe('Mon Application Electron');
  });

  test('La version de l\'application est visible', async () => {
    const version = await mainWindow.getAppVersion();
    expect(version).toMatch(/\d+\.\d+\.\d+/);
  });

  test('Tous les menus principaux sont présents', async () => {
    const menus = ['Fichier', 'Édition', 'Affichage', 'Aide'];
    
    for (const menu of menus) {
      const isVisible = await mainWindow.isMenuItemVisible(menu);
      expect(isVisible).toBeTruthy();
    }
  });
});