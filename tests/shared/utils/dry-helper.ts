/**
 * DRY Refactoring Utility
 * Tool to help eliminate hardcoded values across the test suite
 */

import { TestConfig } from "../config/test-config";

export class DRYHelper {
  /**
   * Navigation helper that uses centralized config
   */
  static async navigateToHome(page: any): Promise<void> {
    await page.goto(TestConfig.getFullUrl());
  }

  static async navigateToPage(page: any, path: string): Promise<void> {
    await page.goto(TestConfig.getFullUrl(path));
  }

  static async navigateToCatalog(page: any): Promise<void> {
    await page.goto(TestConfig.getFullUrl(TestConfig.pages.catalog));
  }

  static async navigateToCart(page: any): Promise<void> {
    await page.goto(TestConfig.getFullUrl(TestConfig.pages.cart));
  }

  /**
   * Search helpers with centralized search terms
   */
  static getRandomSearchTerm(): string {
    const terms = Object.values(TestConfig.testData.searchTerms);
    return terms[Math.floor(Math.random() * terms.length)];
  }

  static getPhoneSearchTerm(): string {
    return TestConfig.testData.searchTerms.phones;
  }

  static getGeneralSearchTerm(): string {
    return TestConfig.testData.searchTerms.general;
  }

  /**
   * Performance helpers with centralized SLAs
   */
  static validateFastResponse(responseTime: number): void {
    if (responseTime > TestConfig.performance.fastResponse) {
      console.warn(`⚠️ Slow response: ${responseTime}ms > ${TestConfig.performance.fastResponse}ms`);
    }
  }

  static validateNormalResponse(responseTime: number): void {
    if (responseTime > TestConfig.performance.normalResponse) {
      throw new Error(`❌ Response too slow: ${responseTime}ms > ${TestConfig.performance.normalResponse}ms`);
    }
  }

  /**
   * API helpers with centralized endpoints
   */
  static getApiClient(baseUrl?: string) {
    const { PandashopAPIClient } = require("../../api/client/pandashop-api-client");
    return new PandashopAPIClient(baseUrl || TestConfig.apiBaseUrl);
  }

  /**
   * Test data helpers
   */
  static getPriceRange(range: keyof typeof TestConfig.testData.priceRanges) {
    return TestConfig.testData.priceRanges[range];
  }

  static getRandomPrice(min: number = 100, max: number = 1000): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static getCurrency(): string {
    return TestConfig.testData.currency;
  }

  /**
   * URL validation helpers
   */
  static validateUrlContainsDomain(url: string): boolean {
    return url.includes(TestConfig.baseUrl.replace('https://', '').replace('http://', ''));
  }

  static isProductUrl(url: string): boolean {
    return url.includes('/product/') || url.includes('/products/');
  }

  /**
   * Environment helpers
   */
  static isProduction(): boolean {
    return TestConfig.baseUrl === TestConfig.environments.production;
  }

  static isStaging(): boolean {
    return TestConfig.baseUrl === TestConfig.environments.staging;
  }

  static getCurrentEnvironment(): string {
    if (this.isProduction()) return 'production';
    if (this.isStaging()) return 'staging';
    return 'local';
  }

  /**
   * Migration helpers for refactoring existing tests
   */
  static replaceHardcodedUrls(testCode: string): string {
    return testCode
      .replace(/https:\/\/www\.pandashop\.md\//g, 'TestConfig.getFullUrl()')
      .replace(/https:\/\/www\.pandashop\.md/g, 'TestConfig.baseUrl')
      .replace(/"MDL"/g, 'TestConfig.testData.currency')
      .replace(/'MDL'/g, 'TestConfig.testData.currency')
      .replace(/30000/g, 'TestConfig.timeouts.api')
      .replace(/10000/g, 'TestConfig.timeouts.element');
  }

  /**
   * Reporting helper
   */
  static logConfigurationUsage(): void {
    console.log("📊 DRY Configuration Usage:");
    console.log(`🌐 Base URL: ${TestConfig.baseUrl}`);
    console.log(`⏱️ API Timeout: ${TestConfig.timeouts.api}ms`);
    console.log(`💰 Currency: ${TestConfig.testData.currency}`);
    console.log(`🎯 Environment: ${this.getCurrentEnvironment()}`);
  }
}

// Export commonly used constants for easy access
export const URLs = {
  HOME: TestConfig.getFullUrl(),
  CATALOG: TestConfig.getFullUrl(TestConfig.pages.catalog),
  CART: TestConfig.getFullUrl(TestConfig.pages.cart),
  SEARCH: TestConfig.getFullUrl(TestConfig.pages.search),
} as const;

export const API_ENDPOINTS = {
  SITEMAP: TestConfig.getSitemapUrl(),
  HEALTH: TestConfig.getApiUrl(TestConfig.api.health),
} as const;

export const SEARCH_TERMS = TestConfig.testData.searchTerms;
export const PRICE_RANGES = TestConfig.testData.priceRanges;
export const TIMEOUTS = TestConfig.timeouts;
export const PERFORMANCE_SLA = TestConfig.performance;
