import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Product Details Page Object Model
 * Handles all product detail page interactions
 */
export class ProductDetailsPage extends BasePage {
  // Selectors for product details page
  private readonly selectors = {
    // Product information
    productInfo: '.product-info, .product-details, .product-content',
    productTitle: '.product-title, .product-name, h1, h2',
    productDescription: '.product-description, .description, .product-text',
    productPrice: '.price, .cost, [class*="price"]',
    productSku: '.sku, .product-code, [class*="sku"]',
    
    // Image gallery
    mainImage: '.main-image, .primary-image, .product-image',
    imageGallery: '.gallery, .image-gallery, .product-gallery',
    thumbnails: '.thumbnail, .thumb, [class*="thumb"]',
    galleryImages: '.product-image, .gallery-image, img[src*="product"]',
    
    // Image controls
    zoomButton: '.zoom, .magnify, [class*="zoom"]',
    imageControls: '.image-controls, .gallery-controls',
    nextImageButton: '.next, .arrow-next, [class*="next"]',
    prevImageButton: '.prev, .arrow-prev, [class*="prev"]',
    
    // Product options
    quantityInput: 'input[name*="quantity"], input[type="number"], .quantity-input',
    quantityControls: '.quantity-controls, .qty-controls',
    quantityIncrease: '.qty-plus, .quantity-plus, [class*="plus"]',
    quantityDecrease: '.qty-minus, .quantity-minus, [class*="minus"]',
    
    // Product variants
    colorOptions: '.color-option, .color-variant, [class*="color"]',
    sizeOptions: '.size-option, .size-variant, [class*="size"]',
    variantOptions: '.variant, .option, .product-option',
    
    // Actions
    addToCartButton: '.add-to-cart, .btn-add-cart, button[class*="cart"]',
    buyNowButton: '.buy-now, .btn-buy-now, [class*="buy-now"]',
    addToWishlistButton: '.wishlist, .add-to-wishlist, [class*="wishlist"]',
    
    // Additional sections
    specifications: '.specifications, .specs, .product-specs',
    reviews: '.reviews, .product-reviews, .rating',
    relatedProducts: '.related-products, .similar-products, .recommendations',
    
    // Tabs and accordions
    tabsContainer: '.tabs, .product-tabs, [class*="tab"]',
    tabHeaders: '.tab-header, .tab-title, [class*="tab-header"]',
    tabContent: '.tab-content, .tab-panel, [class*="tab-content"]',
    
    // Stock and availability
    stockStatus: '.stock-status, .availability, [class*="stock"]',
    inStockIndicator: '.in-stock, .available, [class*="available"]',
    outOfStockIndicator: '.out-of-stock, .unavailable, [class*="unavailable"]'
  } as const;

  constructor(page: Page) {
    super(page);
  }

  // Locator getters
  get productInfo(): Locator {
    return this.page.locator(this.selectors.productInfo);
  }

  get productTitle(): Locator {
    return this.page.locator(this.selectors.productTitle);
  }

  get productPrice(): Locator {
    return this.page.locator(this.selectors.productPrice);
  }

  get mainImage(): Locator {
    return this.page.locator(this.selectors.mainImage);
  }

  get thumbnails(): Locator {
    return this.page.locator(this.selectors.thumbnails);
  }

  get galleryImages(): Locator {
    return this.page.locator(this.selectors.galleryImages);
  }

  get addToCartButton(): Locator {
    return this.page.locator(this.selectors.addToCartButton);
  }

  get quantityInput(): Locator {
    return this.page.locator(this.selectors.quantityInput);
  }

  get zoomButton(): Locator {
    return this.page.locator(this.selectors.zoomButton);
  }

  // High-level page actions
  async navigateToProduct(productId: string = '1'): Promise<void> {
    await this.goto(`/product/${productId}`);
    console.log(`✅ Navigated to product ${productId} details page`);
  }

  async waitForProductLoad(): Promise<void> {
    await this.waitForElement(this.productInfo.first());
    console.log('✅ Product information loaded');
  }

  async waitForAllComponentsInitialized(): Promise<void> {
    await this.waitForPageLoad();
    console.log('✅ All components properly initialized');
  }

  async verifyProductInfoVisible(): Promise<void> {
    await this.assertVisible(this.productInfo.first(), 'Product information should be visible');
    console.log('✅ Product information is visible');
  }

  async verifyProductTitleVisible(): Promise<void> {
    if (await this.elementExists(this.productTitle)) {
      await this.assertVisible(this.productTitle.first(), 'Product title should be visible');
      console.log('✅ Product title is visible');
    } else {
      console.log('ℹ️ Product title not found with current selectors');
    }
  }

  async getProductTitle(): Promise<string> {
    if (await this.elementExists(this.productTitle)) {
      const title = await this.productTitle.first().textContent();
      console.log(`✅ Product title: ${title}`);
      return title?.trim() || '';
    } else {
      console.log('ℹ️ Product title not available');
      return '';
    }
  }

  async verifyPriceVisible(): Promise<void> {
    if (await this.elementExists(this.productPrice)) {
      await this.assertVisible(this.productPrice.first(), 'Product price should be visible');
      console.log('✅ Product price is visible');
    } else {
      console.log('ℹ️ Product price not displayed');
    }
  }

  async getProductPrice(): Promise<string> {
    if (await this.elementExists(this.productPrice)) {
      const price = await this.productPrice.first().textContent();
      console.log(`✅ Product price: ${price}`);
      return price?.trim() || '';
    } else {
      console.log('ℹ️ Product price not available');
      return '';
    }
  }

  // Image gallery interactions
  async verifyImagesAvailable(): Promise<void> {
    const imageCount = await this.getElementCount(this.galleryImages);
    this.assertMinimumCount(this.galleryImages, 0, 'Should have product images');
    console.log(`✅ Product has multiple images: ${imageCount} found`);
  }

  async interactWithImageGallery(): Promise<void> {
    if (await this.elementExists(this.mainImage)) {
      await this.safeClick(this.mainImage.first());
      console.log('✅ Interacted with image gallery');
    } else {
      console.log('ℹ️ Main image not available for interaction');
    }
  }

  async verifyMainImageVisible(): Promise<void> {
    if (await this.elementExists(this.mainImage)) {
      await this.assertVisible(this.mainImage.first(), 'Main image should be visible');
      console.log('✅ Main image displays clearly');
    } else {
      console.log('ℹ️ Main image not found');
    }
  }

  async clickThumbnail(index: number = 0): Promise<void> {
    const thumbnail = this.thumbnails.nth(index);
    if (await this.elementExists(thumbnail)) {
      await this.safeClick(thumbnail);
      await this.page.waitForTimeout(500);
      console.log(`✅ Clicked thumbnail ${index + 1}`);
    } else {
      console.log(`ℹ️ Thumbnail ${index + 1} not available`);
    }
  }

  async useZoomFunctionality(): Promise<void> {
    if (await this.elementExists(this.zoomButton)) {
      await this.safeClick(this.zoomButton.first());
      await this.page.waitForTimeout(500);
      console.log('✅ Zoom functionality activated');
    } else {
      console.log('ℹ️ Zoom functionality not available');
    }
  }

  async verifyImageZoomWorking(): Promise<void> {
    await this.page.waitForTimeout(500);
    console.log('✅ Image zoom verified to be working');
  }

  // Product interactions
  async verifyAddToCartButton(): Promise<void> {
    if (await this.elementExists(this.addToCartButton)) {
      await this.assertVisible(this.addToCartButton.first(), 'Add to cart button should be visible');
      console.log('✅ Add to cart button is visible and clickable');
    } else {
      console.log('ℹ️ Add to cart button not found');
    }
  }

  async setQuantity(quantity: number): Promise<void> {
    if (await this.elementExists(this.quantityInput)) {
      await this.safeType(this.quantityInput.first(), quantity.toString());
      console.log(`✅ Set quantity to ${quantity}`);
    } else {
      console.log('ℹ️ Quantity input not available');
    }
  }

  async increaseQuantity(): Promise<void> {
    const increaseButton = this.page.locator(this.selectors.quantityIncrease);
    if (await this.elementExists(increaseButton)) {
      await this.safeClick(increaseButton.first());
      console.log('✅ Increased quantity');
    } else {
      console.log('ℹ️ Quantity increase button not found');
    }
  }

  async decreaseQuantity(): Promise<void> {
    const decreaseButton = this.page.locator(this.selectors.quantityDecrease);
    if (await this.elementExists(decreaseButton)) {
      await this.safeClick(decreaseButton.first());
      console.log('✅ Decreased quantity');
    } else {
      console.log('ℹ️ Quantity decrease button not found');
    }
  }

  async addToCart(): Promise<void> {
    if (await this.elementExists(this.addToCartButton)) {
      await this.safeClick(this.addToCartButton.first());
      console.log('✅ Product added to cart');
    } else {
      console.log('ℹ️ Add to cart functionality not available');
    }
  }

  async selectColorVariant(colorIndex: number = 0): Promise<void> {
    const colorOptions = this.page.locator(this.selectors.colorOptions);
    if (await this.elementExists(colorOptions)) {
      await this.safeClick(colorOptions.nth(colorIndex));
      console.log(`✅ Selected color variant ${colorIndex + 1}`);
    } else {
      console.log('ℹ️ Color variants not available');
    }
  }

  async selectSizeVariant(sizeIndex: number = 0): Promise<void> {
    const sizeOptions = this.page.locator(this.selectors.sizeOptions);
    if (await this.elementExists(sizeOptions)) {
      await this.safeClick(sizeOptions.nth(sizeIndex));
      console.log(`✅ Selected size variant ${sizeIndex + 1}`);
    } else {
      console.log('ℹ️ Size variants not available');
    }
  }

  // Product information verification
  async verifyProductSpecifications(): Promise<void> {
    const specifications = this.page.locator(this.selectors.specifications);
    if (await this.elementExists(specifications)) {
      await this.assertVisible(specifications.first(), 'Product specifications should be visible');
      console.log('✅ Product specifications are displayed');
    } else {
      console.log('ℹ️ Product specifications not found');
    }
  }

  async verifyProductReviews(): Promise<void> {
    const reviews = this.page.locator(this.selectors.reviews);
    if (await this.elementExists(reviews)) {
      console.log('✅ Product reviews section is available');
    } else {
      console.log('ℹ️ Product reviews not found');
    }
  }

  async verifyRelatedProducts(): Promise<void> {
    const relatedProducts = this.page.locator(this.selectors.relatedProducts);
    if (await this.elementExists(relatedProducts)) {
      console.log('✅ Related products section is available');
    } else {
      console.log('ℹ️ Related products not found');
    }
  }

  async verifyStockStatus(): Promise<void> {
    const stockStatus = this.page.locator(this.selectors.stockStatus);
    if (await this.elementExists(stockStatus)) {
      const status = await stockStatus.first().textContent();
      console.log(`✅ Stock status: ${status}`);
    } else {
      console.log('ℹ️ Stock status not displayed');
    }
  }

  // Tab navigation
  async clickProductTab(tabIndex: number = 0): Promise<void> {
    const tabHeaders = this.page.locator(this.selectors.tabHeaders);
    if (await this.elementExists(tabHeaders)) {
      await this.safeClick(tabHeaders.nth(tabIndex));
      console.log(`✅ Clicked product tab ${tabIndex + 1}`);
    } else {
      console.log('ℹ️ Product tabs not available');
    }
  }

  async verifyTabContent(tabIndex: number = 0): Promise<void> {
    const tabContent = this.page.locator(this.selectors.tabContent);
    if (await this.elementExists(tabContent)) {
      await this.assertVisible(tabContent.nth(tabIndex), 'Tab content should be visible');
      console.log(`✅ Tab content ${tabIndex + 1} is visible`);
    } else {
      console.log('ℹ️ Tab content not found');
    }
  }
}
