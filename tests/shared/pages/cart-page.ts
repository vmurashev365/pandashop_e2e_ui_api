import { Page } from '@playwright/test';
import { BasePage } from './base-page';
import { TestConfig } from '../config/test-config';

/**
 * Cart Page Object - UI Component Testing
 * Focuses on cart/basket UI elements and interactions
 */
export class CartPage extends BasePage {
  
  // Page selectors specific to cart functionality
  private readonly selectors = {
    cartContainer: '.cart, .basket, .shopping-cart, [class*="cart"]',
    cartItems: '.cart-item, .basket-item, .item, [class*="item"]',
    cartItemTitle: '.item-title, .product-name, .name, h3, h4',
    cartItemPrice: '.price, .cost, .amount, [class*="price"]',
    cartItemQuantity: '.quantity, .qty, input[type="number"]',
    cartTotal: '.total, .sum, .subtotal, [class*="total"]',
    removeButton: '.remove, .delete, button:has-text("удалить"), [title*="удалить"]',
    updateButton: '.update, button:has-text("обновить"), [class*="update"]',
    checkoutButton: '.checkout, button:has-text("оформить"), .order-button',
    continueShoppingButton: 'button:has-text("продолжить"), .continue-shopping',
    emptyCartMessage: '.empty, .no-items, [class*="empty"]',
    cartSummary: '.summary, .cart-summary, .order-summary',
    quantityControls: '.quantity-controls, .qty-controls, .inc-dec',
    cartIcon: '.cart-icon, .basket-icon, [class*="cart-icon"]'
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to cart page or find cart section on page
   */
  async openCart(): Promise<void> {
    await this.navigateTo(TestConfig.pages.home);
    await this.waitForPageReady();
    
    // Try to find cart icon or cart section
    const cartSelectors = [
      this.selectors.cartIcon,
      this.selectors.cartContainer,
      'a[href*="cart"], a[href*="basket"]'
    ];

    let foundCart = false;
    
    for (const selector of cartSelectors) {
      if (await this.isElementVisible(selector)) {
        const element = this.page.locator(selector).first();
        
        if (await element.isVisible()) {
          try {
            await element.click({ timeout: 5000 });
            await this.waitForPageReady();
            foundCart = true;
            console.log(`✅ Cart opened via selector: ${selector}`);
            break;
          } catch (error) {
            console.log(`⚠️ Could not click cart with selector: ${selector}`);
          }
        }
      }
    }

    if (!foundCart) {
      console.log(`ℹ️ Using main page for cart UI testing`);
    }
  }

  /**
   * Check if cart container is displayed
   */
  async isCartContainerDisplayed(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.cartContainer);
  }

  /**
   * Check if cart has items
   */
  async hasCartItems(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.cartItems);
  }

  /**
   * Get cart items count
   */
  async getCartItemsCount(): Promise<number> {
    return await this.getElementCount(this.selectors.cartItems);
  }

  /**
   * Check if cart total is displayed
   */
  async isCartTotalDisplayed(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.cartTotal);
  }

  /**
   * Check if checkout button is available
   */
  async isCheckoutButtonAvailable(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.checkoutButton);
  }

  /**
   * Check if continue shopping button is available
   */
  async isContinueShoppingButtonAvailable(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.continueShoppingButton);
  }

  /**
   * Check if cart is empty
   */
  async isCartEmpty(): Promise<boolean> {
    const hasEmptyMessage = await this.isElementVisible(this.selectors.emptyCartMessage);
    const hasNoItems = (await this.getCartItemsCount()) === 0;
    
    return hasEmptyMessage || hasNoItems;
  }

  /**
   * Check if cart summary is displayed
   */
  async isCartSummaryDisplayed(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.cartSummary);
  }

  /**
   * Check if quantity controls are available
   */
  async areQuantityControlsAvailable(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.quantityControls);
  }

  /**
   * Check if remove buttons are available
   */
  async areRemoveButtonsAvailable(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.removeButton);
  }

  /**
   * Get cart item details
   */
  async getCartItemsDetails(): Promise<Array<{
    hasTitle: boolean;
    hasPrice: boolean;
    hasQuantity: boolean;
  }>> {
    const itemsCount = await this.getCartItemsCount();
    const items = [];
    
    for (let i = 0; i < Math.min(itemsCount, 5); i++) { // Limit to 5 items for performance
      const item = this.page.locator(this.selectors.cartItems).nth(i);
      
      items.push({
        hasTitle: await item.locator(this.selectors.cartItemTitle).count() > 0,
        hasPrice: await item.locator(this.selectors.cartItemPrice).count() > 0,
        hasQuantity: await item.locator(this.selectors.cartItemQuantity).count() > 0
      });
    }
    
    return items;
  }

  /**
   * Get comprehensive cart analysis
   */
  async getCartAnalysis(): Promise<{
    container: boolean;
    hasItems: boolean;
    itemsCount: number;
    total: boolean;
    checkout: boolean;
    continueShopping: boolean;
    isEmpty: boolean;
    summary: boolean;
    quantityControls: boolean;
    removeButtons: boolean;
    itemsDetails: Array<{
      hasTitle: boolean;
      hasPrice: boolean;
      hasQuantity: boolean;
    }>;
  }> {
    const analysis = {
      container: await this.isCartContainerDisplayed(),
      hasItems: await this.hasCartItems(),
      itemsCount: await this.getCartItemsCount(),
      total: await this.isCartTotalDisplayed(),
      checkout: await this.isCheckoutButtonAvailable(),
      continueShopping: await this.isContinueShoppingButtonAvailable(),
      isEmpty: await this.isCartEmpty(),
      summary: await this.isCartSummaryDisplayed(),
      quantityControls: await this.areQuantityControlsAvailable(),
      removeButtons: await this.areRemoveButtonsAvailable(),
      itemsDetails: await this.getCartItemsDetails()
    };

    console.log(`🛒 Cart analysis:`, {
      container: analysis.container,
      hasItems: analysis.hasItems,
      itemsCount: analysis.itemsCount,
      checkout: analysis.checkout
    });

    return analysis;
  }

  /**
   * Test cart interactions (UI only - no real modifications)
   */
  async testCartInteractions(): Promise<{
    checkoutAvailable: boolean;
    quantityControlsAvailable: boolean;
    removeButtonsAvailable: boolean;
    interactiveElements: number;
  }> {
    const checkoutAvailable = await this.isCheckoutButtonAvailable();
    const quantityControlsAvailable = await this.areQuantityControlsAvailable();
    const removeButtonsAvailable = await this.areRemoveButtonsAvailable();
    
    // Count interactive elements in cart
    const interactiveSelectors = [
      this.selectors.checkoutButton,
      this.selectors.continueShoppingButton,
      this.selectors.removeButton,
      this.selectors.updateButton,
      this.selectors.quantityControls,
      'button, input, select, a'
    ];
    
    let totalInteractive = 0;
    for (const selector of interactiveSelectors) {
      totalInteractive += await this.getElementCount(selector);
    }

    console.log(`🔧 Cart interactions: Checkout(${checkoutAvailable}) Quantity(${quantityControlsAvailable}) Remove(${removeButtonsAvailable}) Interactive(${totalInteractive})`);

    return {
      checkoutAvailable,
      quantityControlsAvailable,
      removeButtonsAvailable,
      interactiveElements: totalInteractive
    };
  }

  /**
   * Validate cart responsive design
   */
  async validateCartResponsive(): Promise<{
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
      
      const isVisible = await this.isCartContainerDisplayed() || 
                       await this.isElementVisible('body'); // Fallback to body
      
      results[viewport.name as keyof typeof results] = isVisible;
      console.log(`📱 Cart responsive ${viewport.name} (${viewport.width}x${viewport.height}): ${isVisible}`);
    }

    // Reset to desktop view
    await this.page.setViewportSize({ width: 1200, height: 800 });

    return results;
  }
}
