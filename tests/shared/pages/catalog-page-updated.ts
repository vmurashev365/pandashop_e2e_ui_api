import { Page } from '@playwright/test';
import { BasePage } from './base-page';
import { TestConfig } from '../config/test-config';

/**
 * Catalog Page Object - UI Component Testing
 * Focuses on product catalog interface and interactions
 */
export class CatalogPage extends BasePage {
  
  // Page selectors specific to catalog/product listing
  private readonly selectors = {
    productGrid: '.digi-product--desktop, .product-item, [class*="product"]',
    productImages: 'img[src*="product"], img[src*="item"], img[alt*="product"]',
    productPrices: '.price, [class*="price"], .cost, [class*="cost"]',
    productTitles: '.title, .name, [class*="title"], [class*="name"], h2, h3',
    productLinks: 'a[href*="/"], .digi-product--desktop a, [class*="product"] a',
    addToCartButtons: 'button:has-text("корзин"), button:has-text("cart"), .add-to-cart',
    categoryMenu: '.categories, .category-menu, .cat-nav',
    filterOptions: '.filter, .filters, .facet',
    sortOptions: '.sort, .sorting, .order-by',
    pagination: '.pagination, .pager, .page-nav',
    searchResults: '.search-results, .results-count',
    breadcrumbs: '.breadcrumb, .breadcrumbs, nav[aria-label*="breadcrumb"]'
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to catalog page
   */
  async openCatalog(): Promise<void> {
    await this.navigateTo(TestConfig.pages.home);
    await this.waitForPageReady();
    console.log('✅ Catalog page opened');
  }

  /**
   * Check if products are displayed
   */
  async hasProducts(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.productGrid);
  }

  /**
   * Get products count
   */
  async getProductsCount(): Promise<number> {
    return await this.getElementCount(this.selectors.productGrid);
  }

  /**
   * Check if product images are displayed
   */
  async hasProductImages(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.productImages);
  }

  /**
   * Get product images count
   */
  async getProductImagesCount(): Promise<number> {
    return await this.getElementCount(this.selectors.productImages);
  }

  /**
   * Check if product prices are displayed
   */
  async hasProductPrices(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.productPrices);
  }

  /**
   * Get product prices count
   */
  async getProductPricesCount(): Promise<number> {
    return await this.getElementCount(this.selectors.productPrices);
  }

  /**
   * Check if product titles are displayed
   */
  async hasProductTitles(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.productTitles);
  }

  /**
   * Get product titles count
   */
  async getProductTitlesCount(): Promise<number> {
    return await this.getElementCount(this.selectors.productTitles);
  }

  /**
   * Check if add to cart buttons are available
   */
  async hasAddToCartButtons(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.addToCartButtons);
  }

  /**
   * Check if category menu is available
   */
  async hasCategoryMenu(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.categoryMenu);
  }

  /**
   * Check if filter options are available
   */
  async hasFilterOptions(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.filterOptions);
  }

  /**
   * Check if sort options are available
   */
  async hasSortOptions(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.sortOptions);
  }

  /**
   * Check if pagination is available
   */
  async hasPagination(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.pagination);
  }

  /**
   * Get comprehensive catalog analysis
   */
  async getCatalogAnalysis(): Promise<{
    hasProducts: boolean;
    productsCount: number;
    hasImages: boolean;
    imagesCount: number;
    hasPrices: boolean;
    pricesCount: number;
    hasTitles: boolean;
    titlesCount: number;
    hasAddToCart: boolean;
    hasCategories: boolean;
    hasFilters: boolean;
    hasSort: boolean;
    hasPagination: boolean;
  }> {
    const analysis = {
      hasProducts: await this.hasProducts(),
      productsCount: await this.getProductsCount(),
      hasImages: await this.hasProductImages(),
      imagesCount: await this.getProductImagesCount(),
      hasPrices: await this.hasProductPrices(),
      pricesCount: await this.getProductPricesCount(),
      hasTitles: await this.hasProductTitles(),
      titlesCount: await this.getProductTitlesCount(),
      hasAddToCart: await this.hasAddToCartButtons(),
      hasCategories: await this.hasCategoryMenu(),
      hasFilters: await this.hasFilterOptions(),
      hasSort: await this.hasSortOptions(),
      hasPagination: await this.hasPagination()
    };

    console.log(`📊 Catalog analysis:`, {
      products: analysis.productsCount,
      images: analysis.imagesCount,
      prices: analysis.pricesCount,
      titles: analysis.titlesCount
    });

    return analysis;
  }

  /**
   * Validate product data integrity
   */
  async validateProductData(): Promise<{
    validProducts: number;
    invalidProducts: number;
    validationResults: Array<{
      index: number;
      hasImage: boolean;
      hasPrice: boolean;
      hasTitle: boolean;
      hasLink: boolean;
    }>;
  }> {
    const productsCount = await this.getProductsCount();
    const validationResults = [];
    let validProducts = 0;
    let invalidProducts = 0;

    for (let i = 0; i < Math.min(productsCount, 10); i++) { // Limit to 10 for performance
      const product = this.page.locator(this.selectors.productGrid).nth(i);
      
      const hasImage = await product.locator(this.selectors.productImages).count() > 0;
      const hasPrice = await product.locator(this.selectors.productPrices).count() > 0;
      const hasTitle = await product.locator(this.selectors.productTitles).count() > 0;
      const hasLink = await product.locator(this.selectors.productLinks).count() > 0;
      
      const result = { index: i, hasImage, hasPrice, hasTitle, hasLink };
      validationResults.push(result);
      
      if (hasImage && hasPrice && hasTitle) {
        validProducts++;
      } else {
        invalidProducts++;
      }
    }

    console.log(`🔍 Product validation: ${validProducts} valid, ${invalidProducts} invalid`);

    return {
      validProducts,
      invalidProducts,
      validationResults
    };
  }

  /**
   * Test catalog responsiveness
   */
  async testCatalogResponsive(): Promise<{
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
  }> {
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1200, height: 800 }
    ];

    const results = { mobile: false, tablet: false, desktop: false };

    for (const viewport of viewports) {
      await this.page.setViewportSize({ width: viewport.width, height: viewport.height });
      await this.page.waitForTimeout(1000); // Allow responsive adjustments
      
      const hasProducts = await this.hasProducts();
      results[viewport.name as keyof typeof results] = hasProducts;
      
      console.log(`📱 Catalog responsive ${viewport.name} (${viewport.width}x${viewport.height}): ${hasProducts}`);
    }

    // Reset to desktop view
    await this.page.setViewportSize({ width: 1200, height: 800 });

    return results;
  }

  /**
   * Search for products (if search functionality exists)
   */
  async searchProducts(searchTerm: string): Promise<{
    searchExecuted: boolean;
    resultsFound: boolean;
    resultsCount: number;
  }> {
    let searchExecuted = false;
    let resultsFound = false;
    let resultsCount = 0;

    try {
      // Look for search input
      const searchInput = this.page.locator('input[type="search"], .search-input, input[placeholder*="поиск"]').first();
      
      if (await searchInput.count() > 0 && await searchInput.isVisible()) {
        await searchInput.fill(searchTerm);
        await searchInput.press('Enter');
        await this.page.waitForTimeout(2000);
        searchExecuted = true;
        
        // Check for search results
        resultsFound = await this.hasProducts();
        resultsCount = await this.getProductsCount();
        
        console.log(`🔍 Search for "${searchTerm}": executed(${searchExecuted}) found(${resultsFound}) count(${resultsCount})`);
      }
    } catch (error) {
      console.log(`⚠️ Search functionality not available or failed`);
    }

    return {
      searchExecuted,
      resultsFound,
      resultsCount
    };
  }
}
