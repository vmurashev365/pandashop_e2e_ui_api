import { Page } from '@playwright/test';
import { BasePage } from './base-page';
import { TestConfig } from '../config/test-config';

/**
 * Catalog Page Object - UI Component Testing
 * Focuses on catalog-specific UI elements and interactions
 */
export class CatalogPage extends BasePage {
  
  // Page selectors specific to catalog
  private readonly selectors = {
    productGrid: '.digi-product--desktop, .product-grid, [class*="product"]',
    productItems: '.product, .item, [class*="product"]:not(.grid)',
    productLinks: 'a[href*="/"], .product a, .item a',
    priceElements: '.price, [class*="price"], .cost',
    addToCartButtons: 'button:has-text("корзин"), button:has-text("cart"), .add-to-cart',
    filterElements: '.filter, .sort, select[name*="sort"]',
    categoryLinks: 'nav a, .category-link, [class*="category"]'
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to catalog page
   */
  async open(): Promise<void> {
    await this.navigateTo(TestConfig.pages.catalog);
    console.log(`✅ Catalog page opened: ${this.getCurrentUrl()}`);
  }

  /**
   * Navigate to main page and look for catalog elements
   */
  async openMainPageWithCatalog(): Promise<void> {
    await this.navigateTo(TestConfig.pages.home);
    await this.waitForPageReady();
    console.log(`✅ Main page opened for catalog testing: ${this.getCurrentUrl()}`);
  }

  /**
   * Get product grid elements count
   */
  async getProductGridCount(): Promise<number> {
    return await this.getElementCount(this.selectors.productGrid);
  }

  /**
   * Get individual product items count
   */
  async getProductItemsCount(): Promise<number> {
    return await this.getElementCount(this.selectors.productItems);
  }

  /**
   * Get product links count
   */
  async getProductLinksCount(): Promise<number> {
    return await this.getElementCount(this.selectors.productLinks);
  }

  /**
   * Get price elements count
   */
  async getPriceElementsCount(): Promise<number> {
    return await this.getElementCount(this.selectors.priceElements);
  }

  /**
   * Check if products are displayed
   */
  async areProductsDisplayed(): Promise<boolean> {
    const gridCount = await this.getProductGridCount();
    const itemsCount = await this.getProductItemsCount();
    return gridCount > 0 || itemsCount > 0;
  }

  /**
   * Check if prices are displayed
   */
  async arePricesDisplayed(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.priceElements);
  }

  /**
   * Check if add to cart buttons are available
   */
  async areAddToCartButtonsAvailable(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.addToCartButtons);
  }

  /**
   * Get sample product information
   */
  async getSampleProductInfo(): Promise<{
    gridCount: number;
    itemsCount: number;
    linksCount: number;
    pricesCount: number;
  }> {
    const gridCount = await this.getProductGridCount();
    const itemsCount = await this.getProductItemsCount();
    const linksCount = await this.getProductLinksCount();
    const pricesCount = await this.getPriceElementsCount();

    console.log(`📊 Catalog inventory: Grid(${gridCount}) Items(${itemsCount}) Links(${linksCount}) Prices(${pricesCount})`);

    return { gridCount, itemsCount, linksCount, pricesCount };
  }

  /**
   * Test filter functionality (UI only)
   */
  async testFiltersUI(): Promise<boolean> {
    const filterCount = await this.getElementCount(this.selectors.filterElements);
    
    if (filterCount > 0) {
      console.log(`✅ Found ${filterCount} filter elements`);
      return true;
    }
    
    console.log(`ℹ️ No filter elements found`);
    return false;
  }

  /**
   * Test category navigation (UI only)
   */
  async testCategoryNavigationUI(): Promise<boolean> {
    const categoryCount = await this.getElementCount(this.selectors.categoryLinks);
    
    if (categoryCount > 0) {
      console.log(`✅ Found ${categoryCount} category navigation elements`);
      return true;
    }
    
    console.log(`ℹ️ No category navigation found`);
    return false;
  }

  /**
   * Test responsive design by checking if elements adapt
   */
  async testResponsiveDesign(): Promise<{
    desktop: number;
    tablet: number;
    mobile: number;
  }> {
    // Desktop
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    await this.waitForPageReady();
    const desktopCount = await this.getProductItemsCount();

    // Tablet
    await this.page.setViewportSize({ width: 768, height: 1024 });
    await this.waitForPageReady();
    const tabletCount = await this.getProductItemsCount();

    // Mobile
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.waitForPageReady();
    const mobileCount = await this.getProductItemsCount();

    // Reset to desktop
    await this.page.setViewportSize({ width: 1366, height: 768 });

    console.log(`📱 Responsive test: Desktop(${desktopCount}) Tablet(${tabletCount}) Mobile(${mobileCount})`);

    return { desktop: desktopCount, tablet: tabletCount, mobile: mobileCount };
  }
}
