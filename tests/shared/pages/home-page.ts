import { Page } from '@playwright/test';
import { BasePage } from './base-page';
import { TestConfig } from '../config/test-config';

/**
 * Homepage Page Object
 * Follows POM principles - encapsulates homepage-specific functionality
 */
export class HomePage extends BasePage {
  
  // Page selectors
  private readonly selectors = {
    searchInput: 'input[type="search"], input[placeholder*="поиск"], input[placeholder*="search"]',
    searchButton: 'button[type="submit"], .search-button, button:has-text("поиск")',
    catalogElements: 'a, .category, .product, [class*="product"]',
    cartElements: 'a[href*="cart"], .cart, [class*="cart"]',
    productListings: 'img, .item, .card, [class*="product"]'
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to homepage
   */
  async open(): Promise<void> {
    await this.navigateTo(TestConfig.pages.home);
    console.log(`✅ Homepage opened: ${this.getCurrentUrl()}`);
  }

  /**
   * Perform search
   */
  async search(searchTerm: string): Promise<boolean> {
    const searchInput = this.page.locator(this.selectors.searchInput).first();
    
    if (await searchInput.count() > 0 && await searchInput.isVisible()) {
      await searchInput.fill(searchTerm);
      
      const searchButton = this.page.locator(this.selectors.searchButton).first();
      
      if (await searchButton.count() > 0 && await searchButton.isVisible()) {
        await searchButton.click();
      } else {
        await searchInput.press('Enter');
      }
      
      await this.waitForPageReady();
      console.log(`✅ Search performed: "${searchTerm}"`);
      return true;
    }
    
    console.log(`ℹ️ Search not available`);
    return false;
  }

  /**
   * Get catalog elements count
   */
  async getCatalogElementsCount(): Promise<number> {
    return await this.getElementCount(this.selectors.catalogElements);
  }

  /**
   * Get product listings count
   */
  async getProductListingsCount(): Promise<number> {
    return await this.getElementCount(this.selectors.productListings);
  }

  /**
   * Check if cart is accessible
   */
  async isCartAccessible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.cartElements);
  }

  /**
   * Access cart (UI navigation only)
   */
  async accessCart(): Promise<string | null> {
    const cartElements = this.page.locator(this.selectors.cartElements);
    
    if (await cartElements.count() > 0) {
      const cartLink = cartElements.first();
      
      if (await cartLink.isVisible()) {
        await cartLink.click();
        await this.waitForPageReady();
        
        const cartUrl = this.getCurrentUrl();
        console.log(`✅ Cart accessed: ${cartUrl}`);
        return cartUrl;
      }
    }
    
    return null;
  }

  /**
   * Verify homepage is loaded
   */
  async verifyHomepageLoaded(): Promise<void> {
    const title = await this.getTitle();
    if (title.length === 0) {
      throw new Error('Homepage title is empty');
    }
    console.log(`✅ Homepage verified: "${title}"`);
  }
}
