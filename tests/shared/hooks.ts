import { Before, After, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { Browser, BrowserContext, chromium } from '@playwright/test';
import { CustomWorld } from '../shared/world';

let browser: Browser;
let context: BrowserContext;

BeforeAll(async function () {
  // Initialize browser once for all scenarios
  browser = await chromium.launch({
    headless: process.env.HEADLESS !== 'false',
    slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0,
  });
});

AfterAll(async function () {
  // Clean up browser
  if (browser) {
    await browser.close();
  }
});

Before(async function (this: CustomWorld) {
  // Create new context and page for each scenario
  context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  });
  
  const page = await context.newPage();
  
  // Initialize the custom world with page and context
  await this.init(page, context);
  
  console.log('✅ Test scenario initialized with POM Manager');
});

After(async function (this: CustomWorld) {
  // Clean up after each scenario
  if (this.pageManager) {
    await this.cleanup();
  }
  
  if (context) {
    await context.close();
  }
  
  console.log('✅ Test scenario cleaned up');
});
