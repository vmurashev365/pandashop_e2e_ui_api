import { Page } from '@playwright/test';
import { BasePage } from './base-page';
import { TestConfig } from '../config/test-config';

/**
 * Product Details Page Object - UI Component Testing
 * Focuses on product detail page UI elements and interactions
 */
export class ProductDetailsPage extends BasePage {
  
  // Page selectors specific to product details
  private readonly selectors = {
    productTitle: 'h1, .product-title, .product-name, [class*="title"]',
    productPrice: '.price, [class*="price"], .cost, .amount',
    productImages: 'img, .product-image, .gallery img, [class*="image"]',
    productDescription: '.description, .details, .product-info, [class*="description"]',
    addToCartButton: 'button:has-text("корзин"), button:has-text("cart"), .add-to-cart',
    quantityInput: 'input[type="number"], .quantity-input, .qty',
    availabilityStatus: '.availability, .stock, .in-stock, .out-of-stock',
    productGallery: '.gallery, .product-gallery, .image-gallery',
    relatedProducts: '.related, .similar, .recommendations, [class*="related"]',
    breadcrumbs: '.breadcrumb, .breadcrumbs, nav[aria-label*="breadcrumb"]'
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to a specific product page (simulated - we'll use main page for now)
   */
  async openSampleProduct(): Promise<void> {
    await this.navigateTo(TestConfig.pages.home);
    await this.waitForPageReady();
    
    // Try to find and click on a product link
    const productSelectors = [
      'a[href*="/"], .product a, .item a',
      '.digi-product--desktop a',
      '[class*="product"] a'
    ];

    let foundProduct = false;
    
    for (const selector of productSelectors) {
      const links = this.page.locator(selector);
      const count = await links.count();
      
      if (count > 0) {
        const link = links.first();
        
        if (await link.isVisible()) {
          await link.click({ timeout: 5000 });
          await this.waitForPageReady();
          foundProduct = true;
          console.log(`✅ Product page opened via selector: ${selector}`);
          break;
        }
      }
    }

    if (!foundProduct) {
      console.log(`ℹ️ Using main page for product UI testing`);
    }
  }

  /**
   * Check if product title is displayed
   */
  async isProductTitleDisplayed(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.productTitle);
  }

  /**
   * Get product title text
   */
  async getProductTitle(): Promise<string | null> {
    const titleElement = this.page.locator(this.selectors.productTitle).first();
    
    if (await titleElement.count() > 0 && await titleElement.isVisible()) {
      return await titleElement.textContent();
    }
    
    return null;
  }

  /**
   * Check if product price is displayed
   */
  async isProductPriceDisplayed(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.productPrice);
  }

  /**
   * Get product price elements count
   */
  async getProductPriceCount(): Promise<number> {
    return await this.getElementCount(this.selectors.productPrice);
  }

  /**
   * Check if product images are displayed
   */
  async areProductImagesDisplayed(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.productImages);
  }

  /**
   * Get product images count
   */
  async getProductImagesCount(): Promise<number> {
    return await this.getElementCount(this.selectors.productImages);
  }

  /**
   * Check if product description is available
   */
  async isProductDescriptionAvailable(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.productDescription);
  }

  /**
   * Check if add to cart button is available
   */
  async isAddToCartButtonAvailable(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.addToCartButton);
  }

  /**
   * Check if quantity input is available
   */
  async isQuantityInputAvailable(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.quantityInput);
  }

  /**
   * Check if availability status is shown
   */
  async isAvailabilityStatusShown(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.availabilityStatus);
  }

  /**
   * Check if product gallery is available
   */
  async isProductGalleryAvailable(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.productGallery);
  }

  /**
   * Check if related products are shown
   */
  async areRelatedProductsShown(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.relatedProducts);
  }

  /**
   * Get comprehensive product page analysis
   */
  async getProductPageAnalysis(): Promise<{
    title: boolean;
    titleText: string | null;
    price: boolean;
    priceCount: number;
    images: boolean;
    imagesCount: number;
    description: boolean;
    addToCart: boolean;
    quantity: boolean;
    availability: boolean;
    gallery: boolean;
    related: boolean;
  }> {
    const analysis = {
      title: await this.isProductTitleDisplayed(),
      titleText: await this.getProductTitle(),
      price: await this.isProductPriceDisplayed(),
      priceCount: await this.getProductPriceCount(),
      images: await this.areProductImagesDisplayed(),
      imagesCount: await this.getProductImagesCount(),
      description: await this.isProductDescriptionAvailable(),
      addToCart: await this.isAddToCartButtonAvailable(),
      quantity: await this.isQuantityInputAvailable(),
      availability: await this.isAvailabilityStatusShown(),
      gallery: await this.isProductGalleryAvailable(),
      related: await this.areRelatedProductsShown()
    };

    console.log(`📋 Product page analysis:`, {
      title: analysis.title,
      price: analysis.price,
      images: analysis.images,
      addToCart: analysis.addToCart
    });

    return analysis;
  }

  /**
   * Test product page interactions (UI only - no real actions)
   */
  async testProductInteractions(): Promise<{
    addToCartAvailable: boolean;
    quantityAvailable: boolean;
    interactiveElements: number;
  }> {
    const addToCartAvailable = await this.isAddToCartButtonAvailable();
    const quantityAvailable = await this.isQuantityInputAvailable();
    
    // Count interactive elements
    const interactiveSelectors = [
      this.selectors.addToCartButton,
      this.selectors.quantityInput,
      'button, input, select, a'
    ];
    
    let totalInteractive = 0;
    for (const selector of interactiveSelectors) {
      totalInteractive += await this.getElementCount(selector);
    }

    console.log(`🔧 Product interactions: AddToCart(${addToCartAvailable}) Quantity(${quantityAvailable}) Interactive(${totalInteractive})`);

    return {
      addToCartAvailable,
      quantityAvailable,
      interactiveElements: totalInteractive
    };
  }
}
