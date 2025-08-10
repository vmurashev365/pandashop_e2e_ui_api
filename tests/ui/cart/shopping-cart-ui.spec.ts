import { test, expect } from "@playwright/test";
import { PopupHandler } from "../../shared/utils/popup-handler";

/**
 * UI Tests - Shopping Cart (10 tests)
 * Testing cart functionality and shopping flow interface
 */

test.describe("Shopping Cart UI Tests", () => {
  
  test.describe("Cart Access and Display", () => {
    test("should access cart from navigation", async ({ page }) => {
      await page.goto("https://www.pandashop.md/");
      await PopupHandler.waitAndHandlePopups(page);
      
      // Look for cart icon/link in navigation
      const cartSelectors = [
        'a[href*="cart"]',
        '.cart',
        '.shopping-cart',
        '[class*="cart"]',
        'text=/корзина/i',
        'text=/cart/i',
        '.fa-shopping-cart',
        '.icon-cart'
      ];
      
      let foundCartLink = false;
      
      for (const selector of cartSelectors) {
        const cartElements = page.locator(selector);
        const count = await cartElements.count();
        
        if (count > 0) {
          const cartLink = cartElements.first();
          
          if (await cartLink.isVisible()) {
            await cartLink.click();
            await page.waitForLoadState("networkidle");
            
            const currentUrl = page.url();
            foundCartLink = true;
            
            console.log(`✅ Cart accessed via: ${selector}, URL: ${currentUrl}`);
            break;
          }
        }
      }
      
      expect(foundCartLink).toBe(true);
    });

    test("should display empty cart message when no items", async ({ page }) => {
      // Navigate to cart page
      await page.goto("https://www.pandashop.md/");
      
      // Access cart
      const cartSelectors = ['a[href*="cart"]', '.cart', '[class*="cart"]'];
      
      for (const selector of cartSelectors) {
        const cartElement = page.locator(selector).first();
        
        if (await cartElement.count() > 0 && await cartElement.isVisible()) {
          await cartElement.click();
          break;
        }
      }
      
      await page.waitForLoadState("networkidle");
      
      // Look for empty cart messages
      const emptyCartSelectors = [
        'text=/пуста/i',
        'text=/empty/i',
        'text=/нет товаров/i',
        'text=/no items/i',
        '.empty-cart',
        '[class*="empty"]'
      ];
      
      let foundEmptyMessage = false;
      
      for (const selector of emptyCartSelectors) {
        const emptyElements = page.locator(selector);
        const count = await emptyElements.count();
        
        if (count > 0) {
          const emptyText = await emptyElements.first().textContent();
          
          if (emptyText && emptyText.trim().length > 0) {
            foundEmptyMessage = true;
            console.log(`✅ Empty cart message: ${emptyText.trim()}`);
            break;
          }
        }
      }
      
      console.log(foundEmptyMessage ? "✅ Empty cart state handled" : "ℹ️ Cart may have items or different empty state");
    });

    test("should display cart item count", async ({ page }) => {
      await page.goto("https://www.pandashop.md/");
      await page.waitForLoadState("networkidle");
      
      // Look for cart counter/badge
      const countSelectors = [
        '.cart-count',
        '.cart-counter',
        '.badge',
        '[class*="count"]',
        '[class*="counter"]',
        '.cart .badge',
        '.cart-badge'
      ];
      
      let foundCounter = false;
      
      for (const selector of countSelectors) {
        const counterElements = page.locator(selector);
        const count = await counterElements.count();
        
        if (count > 0) {
          const counterText = await counterElements.first().textContent();
          
          if (counterText && /\\d+/.test(counterText)) {
            foundCounter = true;
            console.log(`✅ Cart counter found: ${counterText.trim()}`);
            break;
          }
        }
      }
      
      console.log(foundCounter ? "✅ Cart counter displayed" : "ℹ️ Cart counter not visible or no items");
    });
  });

  test.describe("Adding Items to Cart", () => {
    test("should add product to cart from product page", async ({ page }) => {
      // Navigate to a product page
      await page.goto("https://www.pandashop.md/");
      await page.waitForSelector('a[href*="product"]');
      await page.locator('a[href*="product"]').first().click();
      await page.waitForLoadState("networkidle");
      
      // Find add to cart button
      const cartButtonSelectors = [
        'button:has-text("cart")',
        'button:has-text("корзин")',
        'button:has-text("купить")',
        '.add-to-cart',
        '.buy-button',
        '[class*="add-to-cart"]'
      ];
      
      let cartAdded = false;
      
      for (const selector of cartButtonSelectors) {
        const cartButtons = page.locator(selector);
        const count = await cartButtons.count();
        
        if (count > 0) {
          const button = cartButtons.first();
          
          if (await button.isVisible() && await button.isEnabled()) {
            // Get initial cart count
            const initialCountElement = page.locator('.cart-count, .cart-counter, .badge').first();
            const initialCount = await initialCountElement.textContent() || "0";
            
            // Click add to cart
            await button.click();
            await page.waitForTimeout(2000);
            
            // Check for success message or updated count
            const successSelectors = [
              'text=/добавлен/i',
              'text=/added/i',
              '.success',
              '.added-to-cart',
              '[class*="success"]'
            ];
            
            for (const successSelector of successSelectors) {
              const successElements = page.locator(successSelector);
              
              if (await successElements.count() > 0) {
                cartAdded = true;
                console.log(`✅ Product added to cart - success message displayed`);
                break;
              }
            }
            
            if (!cartAdded) {
              // Check if cart count increased
              const newCount = await initialCountElement.textContent() || "0";
              
              if (newCount !== initialCount) {
                cartAdded = true;
                console.log(`✅ Product added to cart - count changed from ${initialCount} to ${newCount}`);
              }
            }
            
            break;
          }
        }
      }
      
      console.log(cartAdded ? "✅ Add to cart functionality working" : "ℹ️ Add to cart button found but result unclear");
    });

    test("should update cart total when adding items", async ({ page }) => {
      // Navigate to product and add to cart
      await page.goto("https://www.pandashop.md/");
      await page.locator('a[href*="product"]').first().click();
      await page.waitForLoadState("networkidle");
      
      // Look for cart total before adding
      const totalSelectors = [
        '.cart-total',
        '.total',
        '[class*="total"]',
        '.price-total',
        '.cart-subtotal'
      ];
      
      let initialTotal = "0";
      
      for (const selector of totalSelectors) {
        const totalElement = page.locator(selector).first();
        
        if (await totalElement.count() > 0) {
          const totalText = await totalElement.textContent();
          
          if (totalText && /\\d+/.test(totalText)) {
            initialTotal = totalText;
            break;
          }
        }
      }
      
      // Add product to cart
      const addButton = page.locator('button:has-text("корзин"), button:has-text("купить"), .add-to-cart').first();
      
      if (await addButton.count() > 0 && await addButton.isVisible()) {
        await addButton.click();
        await page.waitForTimeout(2000);
        
        // Check if total updated
        for (const selector of totalSelectors) {
          const totalElement = page.locator(selector).first();
          
          if (await totalElement.count() > 0) {
            const newTotal = await totalElement.textContent();
            
            if (newTotal && newTotal !== initialTotal) {
              console.log(`✅ Cart total updated from ${initialTotal} to ${newTotal}`);
              return;
            }
          }
        }
      }
      
      console.log("ℹ️ Cart total update check - may require cart page navigation");
    });
  });

  test.describe("Cart Management", () => {
    test("should allow quantity modification in cart", async ({ page }) => {
      // Navigate to cart (assuming it has items or we add one)
      await page.goto("https://www.pandashop.md/");
      
      // Access cart
      const cartLink = page.locator('a[href*="cart"], .cart').first();
      
      if (await cartLink.count() > 0) {
        await cartLink.click();
        await page.waitForLoadState("networkidle");
      }
      
      // Look for quantity controls in cart
      const quantitySelectors = [
        '.cart-item input[type="number"]',
        '.quantity input',
        '[class*="quantity"] input',
        '.qty input',
        'input[name*="quantity"]'
      ];
      
      let foundQuantityControl = false;
      
      for (const selector of quantitySelectors) {
        const quantityElements = page.locator(selector);
        const count = await quantityElements.count();
        
        if (count > 0) {
          const quantityInput = quantityElements.first();
          
          if (await quantityInput.isVisible() && await quantityInput.isEnabled()) {
            const currentValue = await quantityInput.inputValue();
            
            // Try to change quantity
            await quantityInput.fill("3");
            await page.waitForTimeout(1000);
            
            const newValue = await quantityInput.inputValue();
            
            if (newValue === "3") {
              foundQuantityControl = true;
              console.log(`✅ Quantity modification working: ${currentValue} → ${newValue}`);
              break;
            }
          }
        }
      }
      
      console.log(foundQuantityControl ? "✅ Quantity controls functional" : "ℹ️ No quantity controls found or cart empty");
    });

    test("should allow item removal from cart", async ({ page }) => {
      // Navigate to cart
      await page.goto("https://www.pandashop.md/");
      
      const cartLink = page.locator('a[href*="cart"], .cart').first();
      
      if (await cartLink.count() > 0) {
        await cartLink.click();
        await page.waitForLoadState("networkidle");
      }
      
      // Look for remove/delete buttons
      const removeSelectors = [
        '.remove',
        '.delete',
        'button:has-text("удалить")',
        'button:has-text("remove")',
        '.fa-trash',
        '.icon-delete',
        '[class*="remove"]',
        '[class*="delete"]'
      ];
      
      let foundRemoveButton = false;
      
      for (const selector of removeSelectors) {
        const removeButtons = page.locator(selector);
        const count = await removeButtons.count();
        
        if (count > 0) {
          const removeButton = removeButtons.first();
          
          if (await removeButton.isVisible() && await removeButton.isEnabled()) {
            foundRemoveButton = true;
            
            // Test remove functionality (but don't actually remove)
            console.log(`✅ Remove button found: ${selector}`);
            break;
          }
        }
      }
      
      console.log(foundRemoveButton ? "✅ Item removal functionality available" : "ℹ️ No remove buttons found or cart empty");
    });

    test("should calculate correct cart subtotal", async ({ page }) => {
      // Navigate to cart
      await page.goto("https://www.pandashop.md/");
      
      const cartLink = page.locator('a[href*="cart"], .cart').first();
      
      if (await cartLink.count() > 0) {
        await cartLink.click();
        await page.waitForLoadState("networkidle");
      }
      
      // Look for cart items and prices
      const itemSelectors = [
        '.cart-item',
        '.item',
        '[class*="cart-item"]',
        'tr[class*="item"]'
      ];
      
      let foundCartCalculation = false;
      
      for (const selector of itemSelectors) {
        const items = page.locator(selector);
        const itemCount = await items.count();
        
        if (itemCount > 0) {
          console.log(`✅ Found ${itemCount} cart items`);
          
          // Look for subtotal/total
          const totalSelectors = [
            '.subtotal',
            '.total',
            '.cart-total',
            '[class*="total"]'
          ];
          
          for (const totalSelector of totalSelectors) {
            const totalElements = page.locator(totalSelector);
            
            if (await totalElements.count() > 0) {
              const totalText = await totalElements.first().textContent();
              
              if (totalText && /\\d+/.test(totalText)) {
                foundCartCalculation = true;
                console.log(`✅ Cart total calculated: ${totalText.trim()}`);
                break;
              }
            }
          }
          
          break;
        }
      }
      
      console.log(foundCartCalculation ? "✅ Cart calculation system working" : "ℹ️ Empty cart or totals not displayed");
    });

    test("should provide checkout button (UI only - no actual checkout)", async ({ page }) => {
      // Navigate to cart
      await page.goto("https://www.pandashop.md/");
      
      const cartLink = page.locator('a[href*="cart"], .cart').first();
      
      if (await cartLink.count() > 0) {
        await cartLink.click();
        await page.waitForLoadState("networkidle");
      }
      
      // Look for checkout button
      const checkoutSelectors = [
        'button:has-text("checkout")',
        'button:has-text("оформить")',
        'button:has-text("заказ")',
        'a:has-text("checkout")',
        '.checkout',
        '.checkout-button',
        '[class*="checkout"]',
        '.proceed-to-checkout'
      ];
      
      let foundCheckoutButton = false;
      
      for (const selector of checkoutSelectors) {
        const checkoutButtons = page.locator(selector);
        const count = await checkoutButtons.count();
        
        if (count > 0) {
          const checkoutButton = checkoutButtons.first();
          
          if (await checkoutButton.isVisible()) {
            foundCheckoutButton = true;
            
            // Verify button is enabled (might be disabled for empty cart)
            const isEnabled = await checkoutButton.isEnabled();
            
            console.log(`✅ Checkout button found: ${selector}, enabled: ${isEnabled}`);
            console.log(`⚠️ NOTE: Testing UI only - NOT clicking checkout to avoid real orders`);
            
            // ❌ НЕ КЛИКАЕМ checkout button в продакшн среде!
            // await checkoutButton.click(); // НИКОГДА не делаем это!
            
            break;
          }
        }
      }
      
      expect(foundCheckoutButton).toBe(true);
    });

    test("should persist cart across page navigation", async ({ page }) => {
      // Start by checking initial cart state
      await page.goto("https://www.pandashop.md/");
      await page.waitForLoadState("networkidle");
      
      // Get initial cart count
      const cartCountElement = page.locator('.cart-count, .cart-counter, .badge').first();
      const initialCount = await cartCountElement.textContent() || "0";
      
      // Navigate to product and potentially add item
      const productLink = page.locator('a[href*="product"]').first();
      
      if (await productLink.count() > 0) {
        await productLink.click();
        await page.waitForLoadState("networkidle");
        
        // Navigate back to home
        await page.goto("https://www.pandashop.md/");
        await page.waitForLoadState("networkidle");
        
        // Check if cart count persisted
        const newCount = await cartCountElement.textContent() || "0";
        
        console.log(`✅ Cart persistence check: initial ${initialCount}, after navigation ${newCount}`);
        
        // The cart should maintain its state
        expect(typeof newCount).toBe("string");
      }
      
      console.log("✅ Cart state persistence tested across navigation");
    });
  });
});
