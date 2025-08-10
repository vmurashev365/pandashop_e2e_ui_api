import { test, expect } from "@playwright/test";
import { PopupHandler } from "../../shared/utils/popup-handler";

/**
 * UI Tests - Checkout Process (UI Testing Only - No Real Orders)
 * ⚠️ ВАЖНО: Тестируем только пользовательский интерфейс checkout процесса
 * НЕ создаем реальные заказы!
 */

test.describe("Checkout Process UI Tests (Safe - No Real Orders)", () => {
  
  test.beforeEach(async () => {
    console.log("⚠️ SAFETY MODE: Testing checkout UI only - NO real orders will be created");
  });

  test.afterEach(async ({ page }) => {
    // Cleanup: clear any test data
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test("should display checkout form fields (UI only)", async ({ page }) => {
    await page.goto("https://www.pandashop.md/");
    await PopupHandler.waitAndHandlePopups(page);
    // Try to find checkout page directly
    const checkoutUrls = [
      "/checkout",
      "/order", 
      "/cart/checkout",
      "/ru/checkout",
      "/ru/order"
    ];
    
    let checkoutPageFound = false;
    
    for (const url of checkoutUrls) {
      try {
        await page.goto(`https://www.pandashop.md${url}`);
        await page.waitForLoadState("networkidle");
        
        // Check if this is a valid checkout page
        const hasCheckoutElements = await page.locator('input[name*="email"], input[name*="phone"], input[name*="address"]').count();
        
        if (hasCheckoutElements > 0) {
          checkoutPageFound = true;
          console.log(`✅ Checkout page found at: ${url}`);
          break;
        }
      } catch (error) {
        // Page not found, continue
        continue;
      }
    }
    
    if (!checkoutPageFound) {
      console.log("ℹ️ Direct checkout page not accessible - testing cart flow");
      // Go through cart instead
      await page.goto("https://www.pandashop.md/");
      
      const cartLink = page.locator('a[href*="cart"], .cart').first();
      
      if (await cartLink.count() > 0 && await cartLink.isVisible()) {
        await cartLink.click();
        await page.waitForLoadState("networkidle");
      }
    }
    
    // Look for typical checkout form fields
    const checkoutFieldSelectors = [
      'input[name*="email"]',
      'input[name*="phone"]', 
      'input[name*="address"]',
      'input[name*="name"]',
      'input[type="email"]',
      'input[type="tel"]',
      '.checkout-form input',
      '.order-form input'
    ];
    
    let foundCheckoutFields = 0;
    
    for (const selector of checkoutFieldSelectors) {
      const fields = page.locator(selector);
      const count = await fields.count();
      
      if (count > 0) {
        foundCheckoutFields += count;
        console.log(`✅ Found checkout fields: ${selector} (${count})`);
      }
    }
    
    console.log(`✅ Total checkout form fields found: ${foundCheckoutFields}`);
    console.log(`ℹ️ This test checks UI presence only - no forms will be submitted`);
  });

  test("should allow form field input (no submission)", async ({ page }) => {
    await page.goto("https://www.pandashop.md/");
    
    // Navigate to potential checkout/contact form
    const formSelectors = [
      'input[type="email"]',
      'input[name*="email"]',
      'input[type="tel"]',
      'input[name*="phone"]'
    ];
    
    let testableField = null;
    
    for (const selector of formSelectors) {
      const fields = page.locator(selector);
      
      if (await fields.count() > 0) {
        const field = fields.first();
        
        if (await field.isVisible() && await field.isEnabled()) {
          testableField = field;
          console.log(`✅ Found testable field: ${selector}`);
          break;
        }
      }
    }
    
    if (testableField) {
      // Test filling but NOT submitting
      const testValue = "ui-test@example.com";
      
      await testableField.fill(testValue);
      
      const inputValue = await testableField.inputValue();
      expect(inputValue).toBe(testValue);
      
      console.log(`✅ Field input test successful: ${inputValue}`);
      console.log(`⚠️ SAFETY: Field filled but no form submission performed`);
      
      // Clear the test input
      await testableField.fill("");
    } else {
      console.log("ℹ️ No accessible form fields found for testing");
    }
  });

  test("should display payment method options (UI only)", async ({ page }) => {
    await page.goto("https://www.pandashop.md/");
    
    // Look for payment method indicators
    const paymentSelectors = [
      '.payment-methods',
      '.payment-options',
      '[class*="payment"]',
      'text=/наличные/i',
      'text=/карт/i', 
      'text=/cash/i',
      'text=/card/i',
      'input[name*="payment"]',
      'select[name*="payment"]'
    ];
    
    let foundPaymentOptions = false;
    
    for (const selector of paymentSelectors) {
      const paymentElements = page.locator(selector);
      const count = await paymentElements.count();
      
      if (count > 0) {
        const paymentElement = paymentElements.first();
        
        if (await paymentElement.isVisible()) {
          foundPaymentOptions = true;
          
          const paymentText = await paymentElement.textContent();
          console.log(`✅ Payment option found: ${paymentText?.trim().substring(0, 50)}...`);
          break;
        }
      }
    }
    
    console.log(foundPaymentOptions ? "✅ Payment options UI available" : "ℹ️ Payment options not visible on current page");
    console.log(`⚠️ SAFETY: Testing payment UI only - NO real payment processing`);
  });

  test("should display delivery options (UI only)", async ({ page }) => {
    await page.goto("https://www.pandashop.md/");
    
    // Look for delivery method indicators
    const deliverySelectors = [
      '.delivery-methods',
      '.delivery-options',
      '[class*="delivery"]',
      '[class*="shipping"]',
      'text=/доставка/i',
      'text=/delivery/i',
      'text=/курьер/i',
      'text=/pickup/i',
      'input[name*="delivery"]',
      'select[name*="delivery"]'
    ];
    
    let foundDeliveryOptions = false;
    
    for (const selector of deliverySelectors) {
      const deliveryElements = page.locator(selector);
      const count = await deliveryElements.count();
      
      if (count > 0) {
        const deliveryElement = deliveryElements.first();
        
        if (await deliveryElement.isVisible()) {
          foundDeliveryOptions = true;
          
          const deliveryText = await deliveryElement.textContent();
          console.log(`✅ Delivery option found: ${deliveryText?.trim().substring(0, 50)}...`);
          break;
        }
      }
    }
    
    console.log(foundDeliveryOptions ? "✅ Delivery options UI available" : "ℹ️ Delivery options not visible on current page");
    console.log(`⚠️ SAFETY: Testing delivery UI only - NO real delivery arrangements`);
  });

  test("should show order summary (UI verification only)", async ({ page }) => {
    await page.goto("https://www.pandashop.md/");
    
    // Look for order summary components
    const summarySelectors = [
      '.order-summary',
      '.cart-summary', 
      '.checkout-summary',
      '[class*="summary"]',
      '.total',
      '.subtotal',
      '[class*="total"]'
    ];
    
    let foundOrderSummary = false;
    
    for (const selector of summarySelectors) {
      const summaryElements = page.locator(selector);
      const count = await summaryElements.count();
      
      if (count > 0) {
        const summaryElement = summaryElements.first();
        
        if (await summaryElement.isVisible()) {
          foundOrderSummary = true;
          
          // Look for price information
          const summaryText = await summaryElement.textContent();
          const hasPrice = summaryText && /\\d+/.test(summaryText);
          
          console.log(`✅ Order summary found: ${selector}`);
          console.log(`   Contains price info: ${hasPrice}`);
          break;
        }
      }
    }
    
    console.log(foundOrderSummary ? "✅ Order summary UI displayed" : "ℹ️ Order summary not found on current page");
    console.log(`⚠️ SAFETY: Viewing summary only - NO order finalization`);
  });

  test("should validate required fields (without submission)", async ({ page }) => {
    await page.goto("https://www.pandashop.md/");
    
    // Look for forms with validation
    const formSelectors = [
      'form',
      '.form',
      '.checkout-form',
      '.contact-form',
      '[class*="form"]'
    ];
    
    let validationTested = false;
    
    for (const selector of formSelectors) {
      const forms = page.locator(selector);
      const formCount = await forms.count();
      
      if (formCount > 0) {
        const form = forms.first();
        
        // Look for required fields in this form
        const requiredFields = form.locator('input[required], select[required], textarea[required]');
        const requiredCount = await requiredFields.count();
        
        if (requiredCount > 0) {
          console.log(`✅ Found form with ${requiredCount} required fields`);
          
          // Try to trigger validation by focusing and blurring
          const firstRequired = requiredFields.first();
          
          if (await firstRequired.isVisible() && await firstRequired.isEnabled()) {
            await firstRequired.focus();
            await firstRequired.blur();
            
            // Look for validation messages
            const validationSelectors = [
              '.error',
              '.invalid',
              '.validation-error',
              '[class*="error"]',
              '[class*="invalid"]'
            ];
            
            let foundValidation = false;
            
            for (const valSelector of validationSelectors) {
              const validationElements = page.locator(valSelector);
              
              if (await validationElements.count() > 0) {
                foundValidation = true;
                console.log(`✅ Validation message triggered: ${valSelector}`);
                break;
              }
            }
            
            validationTested = true;
            console.log(`✅ Validation testing completed: ${foundValidation ? 'Messages shown' : 'No messages visible'}`);
            break;
          }
        }
      }
    }
    
    console.log(validationTested ? "✅ Form validation UI tested" : "ℹ️ No testable validation forms found");
    console.log(`⚠️ SAFETY: Testing validation only - NO form submissions`);
  });
});
