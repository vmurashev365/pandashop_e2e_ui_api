import { Page, Locator, expect } from '@playwright/test';

/**
 * Base Page Object Model class
 * Contains common functionality shared across all pages
 */
export abstract class BasePage {
  protected page: Page;
  protected baseUrl: string;

  constructor(page: Page, baseUrl: string = 'https://pandashop.md') {
    this.page = page;
    this.baseUrl = baseUrl;
  }

  /**
   * Navigate to a specific path
   */
  async goto(path: string = ''): Promise<void> {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    await this.page.goto(url);
    await this.waitForPageLoad();
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for element to be visible with safe timeout
   */
  async waitForElement(locator: Locator, timeout: number = 5000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Safe click with optional wait
   */
  async safeClick(locator: Locator, timeout: number = 5000): Promise<void> {
    await this.waitForElement(locator, timeout);
    await locator.click();
  }

  /**
   * Check if element exists (count > 0)
   */
  async elementExists(locator: Locator): Promise<boolean> {
    return await locator.count() > 0;
  }

  /**
   * Get element count safely
   */
  async getElementCount(locator: Locator): Promise<number> {
    return await locator.count();
  }

  /**
   * Safe text input with clearing
   */
  async safeType(locator: Locator, text: string): Promise<void> {
    await this.waitForElement(locator);
    await locator.clear();
    await locator.fill(text);
  }

  /**
   * Assert element visibility
   */
  async assertVisible(locator: Locator, message?: string): Promise<void> {
    await expect(locator, message).toBeVisible();
  }

  /**
   * Assert element count
   */
  async assertCount(locator: Locator, expectedCount: number, message?: string): Promise<void> {
    await expect(locator, message).toHaveCount(expectedCount);
  }

  /**
   * Assert minimum count
   */
  async assertMinimumCount(locator: Locator, minCount: number, message?: string): Promise<void> {
    const actualCount = await this.getElementCount(locator);
    expect(actualCount, message).toBeGreaterThanOrEqual(minCount);
  }
}
