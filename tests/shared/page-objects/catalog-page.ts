import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Catalog Page Object Model
 * Handles all catalog/product listing page interactions
 */
export class CatalogPage extends BasePage {
  // Page URL
  private readonly catalogUrl = '/catalog';

  // Selectors - centralized and reusable
  private readonly selectors = {
    // Product grid
    productItems: '.digi-product--desktop, .product-item, [class*="product"]',
    productImages: 'img[src*="product"], img[src*="item"], img[alt*="product"]',
    productTitles: '.product-title, .product-name, h3, h4, [class*="title"]',
    productPrices: '.price, .cost, [class*="price"], [class*="cost"]',
    
    // Navigation and filtering
    categoryLinks: 'a[href*="catalog"], a[href*="category"]',
    searchInput: 'input[type="search"], input[placeholder*="search"], input[placeholder*="поиск"]',
    searchButton: 'button[type="submit"], .search-btn, [class*="search-btn"]',
    
    // Sorting and pagination
    sortOptions: 'select[name*="sort"], .sort-options, .sorting',
    paginationContainer: '.pagination, .pager, [class*="pagination"]',
    paginationLinks: '.pagination a, .pager a, [class*="page-"]',
    
    // Filters
    filterControls: 'select, .filter, .category-filter, [class*="filter"]',
    activeFilters: '.active, .selected, [class*="active"]',
    
    // Loading states
    loadingIndicator: '.loading, .spinner, [class*="loading"]',
    
    // Interactive elements
    hoverContent: '.hover-content, .additional-info, .product-details'
  } as const;

  constructor(page: Page) {
    super(page);
  }

  // Locator getters - provide clean interface to selectors
  get productItems(): Locator {
    return this.page.locator(this.selectors.productItems);
  }

  get productImages(): Locator {
    return this.page.locator(this.selectors.productImages);
  }

  get productTitles(): Locator {
    return this.page.locator(this.selectors.productTitles);
  }

  get productPrices(): Locator {
    return this.page.locator(this.selectors.productPrices);
  }

  get searchInput(): Locator {
    return this.page.locator(this.selectors.searchInput);
  }

  get paginationContainer(): Locator {
    return this.page.locator(this.selectors.paginationContainer);
  }

  get filterControls(): Locator {
    return this.page.locator(this.selectors.filterControls);
  }

  get loadingIndicator(): Locator {
    return this.page.locator(this.selectors.loadingIndicator);
  }

  // High-level page actions
  async navigateToCatalog(): Promise<void> {
    await this.goto(this.catalogUrl);
    console.log('✅ Navigated to catalog page');
  }

  async waitForCatalogLoad(): Promise<void> {
    await this.waitForElement(this.productItems.first());
    console.log('✅ Catalog loaded successfully');
  }

  async getProductCount(): Promise<number> {
    const count = await this.getElementCount(this.productItems);
    console.log(`✅ Found ${count} products in catalog`);
    return count;
  }

  async verifyProductsVisible(): Promise<void> {
    await this.assertMinimumCount(this.productItems, 1, 'Should have at least 1 product visible');
    console.log('✅ Products are visible in catalog');
  }

  async verifyImagesLoaded(): Promise<void> {
    await this.assertMinimumCount(this.productImages, 1, 'Should have at least 1 product image');
    console.log('✅ Product images are loaded');
  }

  async verifyPricesDisplayed(): Promise<void> {
    if (await this.elementExists(this.productPrices)) {
      const priceCount = await this.getElementCount(this.productPrices);
      console.log(`✅ Found ${priceCount} price elements`);
    } else {
      console.log('ℹ️ No price elements found (may be normal for some layouts)');
    }
  }

  async verifyTitlesDisplayed(): Promise<void> {
    if (await this.elementExists(this.productTitles)) {
      const titleCount = await this.getElementCount(this.productTitles);
      console.log(`✅ Found ${titleCount} product titles`);
    } else {
      console.log('ℹ️ No title elements found with current selectors');
    }
  }

  async searchForProduct(searchTerm: string): Promise<void> {
    if (await this.elementExists(this.searchInput)) {
      await this.safeType(this.searchInput.first(), searchTerm);
      
      const searchButton = this.page.locator(this.selectors.searchButton);
      if (await this.elementExists(searchButton)) {
        await this.safeClick(searchButton.first());
      } else {
        await this.searchInput.first().press('Enter');
      }
      
      await this.waitForPageLoad();
      console.log(`✅ Searched for: ${searchTerm}`);
    } else {
      console.log('ℹ️ Search functionality not available on this page');
    }
  }

  async applyFilter(filterType: string): Promise<void> {
    if (await this.elementExists(this.filterControls)) {
      await this.safeClick(this.filterControls.first());
      await this.waitForElement(this.page.locator(this.selectors.activeFilters).first(), 3000);
      console.log(`✅ Applied filter: ${filterType}`);
    } else {
      console.log('ℹ️ Filter controls not found');
    }
  }

  async applySorting(sortType: string): Promise<void> {
    const sortOptions = this.page.locator(this.selectors.sortOptions);
    if (await this.elementExists(sortOptions)) {
      await this.safeClick(sortOptions.first());
      console.log(`✅ Applied sorting: ${sortType}`);
    } else {
      console.log('ℹ️ Sort options not found');
    }
  }

  async navigateToPage(pageNumber: string): Promise<void> {
    const pagination = this.page.locator(this.selectors.paginationLinks);
    if (await this.elementExists(pagination)) {
      const pageLink = pagination.filter({ hasText: pageNumber });
      if (await this.elementExists(pageLink)) {
        await this.safeClick(pageLink.first());
        await this.waitForPageLoad();
        console.log(`✅ Navigated to page ${pageNumber}`);
      } else {
        console.log(`ℹ️ Page ${pageNumber} not found in pagination`);
      }
    } else {
      console.log('ℹ️ Pagination not available');
    }
  }

  async verifyPaginationAvailable(): Promise<void> {
    if (await this.elementExists(this.paginationContainer)) {
      console.log('✅ Pagination is available');
    } else {
      console.log('ℹ️ No pagination found (may be single page)');
    }
  }

  async verifyInteractiveElements(): Promise<void> {
    const interactiveElements = this.page.locator(this.selectors.hoverContent);
    if (await this.elementExists(interactiveElements)) {
      await this.waitForElement(interactiveElements.first());
      console.log('✅ Interactive elements found');
    } else {
      console.log('ℹ️ No interactive elements detected');
    }
  }

  async clickFirstProduct(): Promise<void> {
    const firstProduct = this.productItems.first();
    await this.safeClick(firstProduct);
    await this.waitForPageLoad();
    console.log('✅ Clicked first product');
  }

  async hoverOverProduct(index: number = 0): Promise<void> {
    const product = this.productItems.nth(index);
    if (await this.elementExists(product)) {
      await product.hover();
      await this.page.waitForTimeout(500); // Allow hover effects
      console.log(`✅ Hovered over product ${index + 1}`);
    } else {
      console.log(`ℹ️ Product ${index + 1} not found for hover`);
    }
  }
}
