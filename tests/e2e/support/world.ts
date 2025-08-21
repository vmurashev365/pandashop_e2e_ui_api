import { Before, After, setWorldConstructor } from '@cucumber/cucumber';
import { chromium, Browser, BrowserContext, Page } from '@playwright/test';

class E2EWorld {
  public browser!: Browser;
  public context!: BrowserContext;
  public page!: Page;

  async init() {
    console.log('🚀 Initializing E2E Browser for Cucumber tests');
    this.browser = await chromium.launch({ headless: true });
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    this.page = await this.context.newPage();
    
    // Set safety flags
    await this.page.evaluate(() => {
      (window as any).TESTING_MODE = true;
      (window as any).PREVENT_REAL_ORDERS = true;
    });
    
    console.log('✅ E2E Browser initialized for safe testing');
  }

  async cleanup() {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
    console.log('🧹 E2E Browser cleanup completed');
  }
}

setWorldConstructor(E2EWorld);

Before(async function() {
  await this.init();
});

After(async function() {
  await this.cleanup();
});
