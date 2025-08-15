import { Page } from '@playwright/test';
import { CatalogPage, NavigationPage, ProductDetailsPage, CartPage } from './page-objects';

/**
 * Page Object Manager - Centralized POM management
 * Устраняет DRY нарушения в step definitions
 */
export class PageObjectManager {
  private page: Page;
  private _catalogPage: CatalogPage | undefined;
  private _navigationPage: NavigationPage | undefined;
  private _productDetailsPage: ProductDetailsPage | undefined;
  private _cartPage: CartPage | undefined;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Lazy-loaded CatalogPage instance
   */
  get catalogPage(): CatalogPage {
    if (!this._catalogPage) {
      this._catalogPage = new CatalogPage(this.page);
    }
    return this._catalogPage;
  }

  /**
   * Lazy-loaded NavigationPage instance
   */
  get navigationPage(): NavigationPage {
    if (!this._navigationPage) {
      this._navigationPage = new NavigationPage(this.page);
    }
    return this._navigationPage;
  }

  /**
   * Lazy-loaded ProductDetailsPage instance
   */
  get productDetailsPage(): ProductDetailsPage {
    if (!this._productDetailsPage) {
      this._productDetailsPage = new ProductDetailsPage(this.page);
    }
    return this._productDetailsPage;
  }

  /**
   * Lazy-loaded CartPage instance
   */
  get cartPage(): CartPage {
    if (!this._cartPage) {
      this._cartPage = new CartPage(this.page);
    }
    return this._cartPage;
  }

  /**
   * Reset all page objects (useful for test cleanup)
   */
  reset(): void {
    this._catalogPage = undefined;
    this._navigationPage = undefined;
    this._productDetailsPage = undefined;
    this._cartPage = undefined;
  }

  /**
   * Get all available page objects
   */
  getAllPages() {
    return {
      catalog: this.catalogPage,
      navigation: this.navigationPage,
      productDetails: this.productDetailsPage,
      cart: this.cartPage
    };
  }
}
