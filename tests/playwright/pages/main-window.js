const BasePage = require('./base-page');

class MainWindow extends BasePage {
  constructor(window) {
    super(window);
  }

  async getTitle() {
    return await this.window.title();
  }

  async navigateToSettings() {
    await this.click('a[href="#settings"]');
    await this.window.waitForSelector('.settings-panel');
  }

  async isMenuItemVisible(menuText) {
    const menuItem = await this.window.$(`text=${menuText}`);
    return menuItem ? await menuItem.isVisible() : false;
  }

  async executeInRenderer(code) {
    return await this.window.evaluate(code);
  }

  async getAppVersion() {
    return await this.window.evaluate(() => {
      // Via l'API exposée par preload.js
      if (window.electronAPI) {
        return window.electronAPI.getVersion();
      }
      return 'unknown';
    });
  }
}

module.exports = MainWindow;