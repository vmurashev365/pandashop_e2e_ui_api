import { World, IWorldOptions, setWorldConstructor } from '@cucumber/cucumber';
import { Page, BrowserContext } from '@playwright/test';
import { PageObjectManager } from './page-manager';

/**
 * Custom World class with integrated Page Object Manager
 * Устраняет DRY нарушения через единый менеджер страниц
 */
export class CustomWorld extends World {
  public page!: Page;
  public context!: BrowserContext;
  public pageManager!: PageObjectManager;

  constructor(options: IWorldOptions) {
    super(options);
  }

  /**
   * Initialize page and page manager
   */
  async init(page: Page, context: BrowserContext): Promise<void> {
    this.page = page;
    this.context = context;
    this.pageManager = new PageObjectManager(page);
  }

  /**
   * Quick access to catalog page
   */
  get catalog() {
    return this.pageManager.catalogPage;
  }

  /**
   * Quick access to navigation page
   */
  get navigation() {
    return this.pageManager.navigationPage;
  }

  /**
   * Quick access to product details page
   */
  get productDetails() {
    return this.pageManager.productDetailsPage;
  }

  /**
   * Quick access to cart page
   */
  get cart() {
    return this.pageManager.cartPage;
  }

  /**
   * Clean up method
   */
  async cleanup(): Promise<void> {
    this.pageManager.reset();
  }
}

// Set the custom world constructor
setWorldConstructor(CustomWorld);
