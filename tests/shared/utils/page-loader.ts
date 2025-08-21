/**
 * DRY-compliant page loading utilities
 * Centralized solution for reliable page loading without networkidle timeouts
 */

import { Page } from '@playwright/test';

export class PageLoader {
  /**
   * Safe page navigation with reliable loading strategy
   * Replaces unreliable waitForLoadState('networkidle') with deterministic approach
   */
  static async safeGoto(page: Page, url: string, options?: {
    waitTime?: number;
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
  }): Promise<void> {
    const waitTime = options?.waitTime || 2000;
    const waitUntil = options?.waitUntil || 'domcontentloaded';
    
    await page.goto(url, { waitUntil });
    await page.waitForTimeout(waitTime);
  }

  /**
   * Safe wait for page state change after navigation
   * Use after clicks, form submissions, etc.
   */
  static async safeWaitForNavigation(page: Page, options?: {
    waitTime?: number;
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
  }): Promise<void> {
    const waitTime = options?.waitTime || 1500;
    const waitUntil = options?.waitUntil || 'domcontentloaded';
    
    await page.waitForLoadState(waitUntil);
    await page.waitForTimeout(waitTime);
  }

  /**
   * Safe wait for dynamic content loading
   * Use for AJAX content, search results, etc.
   */
  static async waitForDynamicContent(page: Page, waitTime: number = 1000): Promise<void> {
    await page.waitForTimeout(waitTime);
  }

  /**
   * Safe click with navigation wait
   * Use for links that navigate to new pages
   */
  static async safeClickAndWait(page: Page, locatorOrSelector: string | any, options?: {
    waitTime?: number;
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
  }): Promise<void> {
    if (typeof locatorOrSelector === 'string') {
      await page.click(locatorOrSelector);
    } else {
      await locatorOrSelector.click();
    }
    await this.safeWaitForNavigation(page, options);
  }

  /**
   * Performance-aware page loading for critical scenarios
   * Uses shorter timeouts for better test performance
   */
  static async fastGoto(page: Page, url: string): Promise<void> {
    await this.safeGoto(page, url, { waitTime: 1000 });
  }

  /**
   * Patient loading for heavy pages (e.g., product catalogs)
   * Uses longer timeouts for content-heavy pages
   */
  static async patientGoto(page: Page, url: string): Promise<void> {
    await this.safeGoto(page, url, { waitTime: 3000 });
  }
}

/**
 * Legacy networkidle replacement - for migration purposes
 * @deprecated Use PageLoader.safeWaitForNavigation() instead
 */
export async function replaceNetworkIdle(page: Page): Promise<void> {
  await PageLoader.safeWaitForNavigation(page);
}
