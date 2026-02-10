class BasePage {
  constructor(window) {
    this.window = window;
  }

  async waitForSelector(selector, options = {}) {
    return await this.window.waitForSelector(selector, {
      timeout: 10000,
      ...options
    });
  }

  async getText(selector) {
    const element = await this.waitForSelector(selector);
    return await element.textContent();
  }

  async click(selector) {
    const element = await this.waitForSelector(selector);
    await element.click();
  }

  async fill(selector, text) {
    const element = await this.waitForSelector(selector);
    await element.fill(text);
  }

  async screenshot(name) {
    const screenshotPath = `tests/playwright/reports/screenshots/${name}-${Date.now()}.png`;
    await this.window.screenshot({ path: screenshotPath });
    return screenshotPath;
  }
}

module.exports = BasePage;