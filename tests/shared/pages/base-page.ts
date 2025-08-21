import { Page } from '@playwright/test';
import { TestConfig } from '../config/test-config';
import { PageLoader } from '../utils/page-loader';
import { PopupHandler } from '../utils/popup-handler';

/**
 * Base Page Object following POM principles
 * Encapsulates common page functionality
 */
export abstract class BasePage {
  protected page: Page;
  protected baseUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.baseUrl = TestConfig.baseUrl;
  }

  /**
   * Navigate to specific page path
   */
  async navigateTo(path: string = '/'): Promise<void> {
    const fullUrl = `${this.baseUrl}${path}`;
    await PageLoader.safeGoto(this.page, fullUrl);
    await PopupHandler.waitAndHandlePopups(this.page);
  }

  /**
   * Get current page URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Wait for page to be ready
   */
  async waitForPageReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(TestConfig.timeouts.short);
  }

  /**
   * Check if element exists and is visible
   */
  async isElementVisible(selector: string): Promise<boolean> {
    try {
      const element = this.page.locator(selector).first();
      return await element.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Get element count
   */
  async getElementCount(selector: string): Promise<number> {
    return await this.page.locator(selector).count();
  }
}
