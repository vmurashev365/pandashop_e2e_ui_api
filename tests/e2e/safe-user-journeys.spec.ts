import { test, expect } from "@playwright/test";
import { PopupHandler } from "../shared/utils/popup-handler";
import { HomePage } from "../shared/pages/home-page";
import { TestConfig } from "../shared/config/test-config";

/**
 * E2E Tests - Safe User Journeys (No Real Orders)
 * ⚠️ КРИТИЧЕСКИ ВАЖНО: Тестируем полные пользовательские сценарии
 * НО НЕ создаем реальные заказы!
 */

test.describe("Safe E2E User Journeys", () => {
  
  test.beforeEach(async () => {
    console.log("🛡️ SAFE E2E MODE: Testing user journeys WITHOUT creating real orders");
  });

  test.afterEach(async ({ page }) => {
    // Clean up test state
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    console.log("🧹 Test cleanup completed");
  });

  test("E2E: Browse catalog → View product → Add to cart (Safe)", async ({ page }) => {
    console.log("🛡️ Starting safe E2E journey: Catalog → Product → Cart");
    
    // Step 1: Navigate to main page using Page Object
    const homePage = new HomePage(page);
    await homePage.open();
    await homePage.verifyHomepageLoaded();
    console.log(`✅ Step 1: Main page loaded using POM`);
    
    // Step 2: Browse catalog using Page Object methods
    const catalogCount = await homePage.getCatalogElementsCount();
    expect(catalogCount).toBeGreaterThan(0);
    console.log(`✅ Step 2: Catalog browsing available - ${catalogCount} clickable elements`);
    
    // Step 3: Search for products using Page Object
    const searchPerformed = await homePage.search(TestConfig.testData.searchTerms.phones);
    
    if (searchPerformed) {
      console.log(`✅ Step 3: Search functionality tested via POM`);
      console.log(`   Search URL: ${homePage.getCurrentUrl()}`);
    } else {
      console.log(`ℹ️ Step 3: Search not available, continuing journey`);
    }
    
    // Step 4: Check for product listings using Page Object
    const productCount = await homePage.getProductListingsCount();
    console.log(`✅ Step 4: Product listings visible - ${productCount} elements`);
    
    // Step 5: Test cart access using Page Object
    const cartAccessible = await homePage.isCartAccessible();
    
    if (cartAccessible) {
      const cartUrl = await homePage.accessCart();
      
      if (cartUrl) {
        console.log(`✅ Step 5: Cart access successful via POM - ${cartUrl}`);
        
        // Check cart interface
        const cartInterface = page.locator('body');
        const cartText = await cartInterface.textContent();
        
        const hasCartKeywords = cartText?.includes('корзина') || 
                               cartText?.includes('cart') || 
                               cartText?.includes('товар') ||
                               cartText?.includes('item');
        
        console.log(`✅ Cart interface confirmed: ${hasCartKeywords ? 'Cart-related content found' : 'Generic page'}`);
      }
    }
    
    console.log("🛡️ Safe E2E journey completed using POM - NO real transactions performed");
  });

  test("E2E: Search → Filter → Product view journey (Safe)", async ({ page }) => {
    console.log("🛡️ Starting safe E2E journey: Search → Filter → Product");
    
    // Step 1: Start at homepage using Page Object
    const homePage = new HomePage(page);
    await homePage.open();
    console.log(`✅ Step 1: Homepage loaded via POM`);
    
    // Step 2: Perform search using Page Object
    const searchPerformed = await homePage.search(TestConfig.testData.searchTerms.general);
    
    if (searchPerformed) {
      console.log(`✅ Step 2: Search performed via POM`);
      console.log(`   Search results URL: ${homePage.getCurrentUrl()}`);
    } else {
      console.log(`ℹ️ Step 2: Search not available, testing navigation instead`);
      
      // Try category navigation instead
      const categoryLinks = page.locator('a[href*="catalog"], a[href*="category"], nav a').first();
      
      if (await categoryLinks.count() > 0 && await categoryLinks.isVisible()) {
        await categoryLinks.click();
        await page.waitForLoadState("domcontentloaded");
        await page.waitForTimeout(1000); // Wait for category page
        console.log(`✅ Step 2: Category navigation performed instead`);
      }
    }
    
    // Step 3: Test filtering/sorting (if available)
    const filterSelectors = [
      'select[name*="sort"]',
      'select[name*="filter"]',
      '.filter select',
      '.sort select',
      'button:has-text("фильтр")',
      'button:has-text("сортир")'
    ];
    
    let filterTested = false;
    
    for (const selector of filterSelectors) {
      const filterElements = page.locator(selector);
      
      if (await filterElements.count() > 0) {
        const filterElement = filterElements.first();
        
        if (await filterElement.isVisible() && await filterElement.isEnabled()) {
          // Test filter interaction (but don't change results significantly)
          
          if (await filterElement.evaluate(el => el.tagName.toLowerCase()) === 'select') {
            const options = filterElement.locator('option');
            const optionCount = await options.count();
            
            if (optionCount > 1) {
              // Select second option to test functionality
              await filterElement.selectOption({ index: 1 });
              await page.waitForTimeout(1000);
              
              filterTested = true;
              console.log(`✅ Step 3: Filter/sort tested with ${optionCount} options`);
            }
          } else {
            // For button filters, just verify they're clickable
            console.log(`✅ Step 3: Filter button found: ${selector}`);
            filterTested = true;
          }
          
          break;
        }
      }
    }
    
    if (!filterTested) {
      console.log(`ℹ️ Step 3: No filters available to test`);
    }
    
    // Step 4: Test product interaction (without purchasing)
    const productElements = page.locator('img[src], .image, .photo, a[href]');
    const productCount = await productElements.count();
    
    if (productCount > 0) {
      console.log(`✅ Step 4: Product elements available for interaction - ${productCount} items`);
      
      // Test hover/interaction on first product (without clicking to purchase)
      const firstProduct = productElements.first();
      
      if (await firstProduct.isVisible()) {
        await firstProduct.hover();
        await page.waitForTimeout(500);
        
        console.log(`✅ Product interaction (hover) tested successfully`);
      }
    }
    
    console.log("🛡️ Safe search-filter-product journey completed");
  });

  test("E2E: Mobile responsive journey (Safe)", async ({ page }) => {
    console.log("🛡️ Starting safe E2E mobile journey");
    
    // Step 1: Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const homePage = new HomePage(page);
    await homePage.open();
    
    console.log(`✅ Step 1: Mobile viewport set (375x667) - POM used`);
    
    // Step 2: Test mobile navigation
    const mobileMenuSelectors = [
      '.hamburger',
      '.menu-toggle',
      '.mobile-menu-toggle',
      'button[class*="menu"]',
      '[class*="hamburger"]'
    ];
    
    let mobileMenuTested = false;
    
    for (const selector of mobileMenuSelectors) {
      const menuToggle = page.locator(selector).first();
      
      if (await menuToggle.count() > 0 && await menuToggle.isVisible()) {
        await menuToggle.click();
        await page.waitForTimeout(1000);
        
        // Check if menu opened
        const openMenus = page.locator('.menu.open, .nav.open, [class*="menu"][class*="open"]');
        const menuOpened = await openMenus.count() > 0;
        
        console.log(`✅ Step 2: Mobile menu tested - ${menuOpened ? 'Menu opens' : 'Menu toggle found'}`);
        mobileMenuTested = true;
        
        // Close menu if it opened
        if (menuOpened) {
          await menuToggle.click();
          await page.waitForTimeout(500);
        }
        
        break;
      }
    }
    
    if (!mobileMenuTested) {
      console.log(`ℹ️ Step 2: No mobile menu toggle found`);
    }
    
    // Step 3: Test touch interactions
    const touchableElements = page.locator('button, a, input, [onclick]');
    const touchCount = await touchableElements.count();
    
    if (touchCount > 0) {
      const firstTouchable = touchableElements.first();
      
      if (await firstTouchable.isVisible()) {
        // Test mobile interaction (using click instead of tap for browser compatibility)
        await firstTouchable.click();
        await page.waitForTimeout(500);
        
        console.log(`✅ Step 3: Mobile interaction tested on ${touchCount} touchable elements`);
      }
    }
    
    // Step 4: Test mobile content scrolling
    await page.evaluate(() => {
      window.scrollTo(0, window.innerHeight);
    });
    await page.waitForTimeout(500);
    
    const scrollPosition = await page.evaluate(() => window.pageYOffset);
    console.log(`✅ Step 4: Mobile scrolling tested - scroll position: ${scrollPosition}px`);
    
    // Step 5: Return to desktop view
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.waitForTimeout(500);
    
    console.log(`✅ Step 5: Returned to desktop viewport`);
    console.log("🛡️ Safe mobile E2E journey completed");
  });

  test("E2E: Form interaction journey (Safe - No Submission)", async ({ page }) => {
    console.log("🛡️ Starting safe form interaction journey");
    
    // Step 1: Navigate to site using Page Object
    const homePage = new HomePage(page);
    await homePage.open();
    
    // Step 2: Look for any forms on the site
    const formSelectors = [
      'form',
      'input[type="email"]',
      'input[type="text"]',
      'input[type="tel"]',
      'textarea',
      '.form',
      '.contact-form'
    ];
    
    let formsFound = 0;
    let testableFields = 0;
    
    for (const selector of formSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      if (count > 0) {
        formsFound += count;
        
        // Test first visible, enabled field
        for (let i = 0; i < Math.min(count, 3); i++) {
          const element = elements.nth(i);
          
          if (await element.isVisible() && await element.isEnabled()) {
            const tagName = await element.evaluate(el => el.tagName.toLowerCase());
            
            if (tagName === 'input' || tagName === 'textarea') {
              // Test field interaction without submission
              const testValue = tagName === 'input' ? TestConfig.testData.testEmail : TestConfig.testData.testMessage;
              
              await element.fill(testValue);
              const inputValue = await element.inputValue();
              
              if (inputValue === testValue) {
                testableFields++;
                console.log(`✅ Field interaction tested: ${selector}[${i}] - ${tagName}`);
                
                // Clear field after test
                await element.fill('');
              }
              
              break;
            }
          }
        }
      }
    }
    
    console.log(`✅ Step 2: Form analysis completed`);
    console.log(`   Total form elements found: ${formsFound}`);
    console.log(`   Successfully tested fields: ${testableFields}`);
    
    // Step 3: Test form validation (without submission)
    const requiredFields = page.locator('input[required], textarea[required], select[required]');
    const requiredCount = await requiredFields.count();
    
    if (requiredCount > 0) {
      const firstRequired = requiredFields.first();
      
      if (await firstRequired.isVisible() && await firstRequired.isEnabled()) {
        // Trigger validation by focusing then blurring empty field
        await firstRequired.focus();
        await firstRequired.blur();
        
        // Look for validation messages
        const validationMessages = page.locator('.error, .invalid, [class*="error"], [class*="invalid"]');
        const validationCount = await validationMessages.count();
        
        console.log(`✅ Step 3: Validation tested - ${validationCount} validation elements found`);
      }
    } else {
      console.log(`ℹ️ Step 3: No required fields found for validation testing`);
    }
    
    // Step 4: Verify we DON'T submit any forms
    const submitButtons = page.locator('button[type="submit"], input[type="submit"], .submit-button');
    const submitCount = await submitButtons.count();
    
    console.log(`⚠️ Step 4: Found ${submitCount} submit buttons - NONE will be clicked for safety`);
    console.log(`🛡️ SAFETY CONFIRMED: No forms submitted during testing`);
    
    console.log("🛡️ Safe form interaction journey completed");
  });

  test("E2E: Performance and loading journey (Safe)", async ({ page }) => {
    console.log("🛡️ Starting safe performance testing journey");
    
    // Step 1: Measure page load time using Page Object
    const startTime = Date.now();
    
    const homePage = new HomePage(page);
    await homePage.open();
    
    const loadTime = Date.now() - startTime;
    console.log(`✅ Step 1: Page load time measured via POM - ${loadTime}ms`);
    
    // Step 2: Check for performance indicators
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      };
    });
    
    console.log(`✅ Step 2: Performance metrics collected:`);
    console.log(`   DOM Content Loaded: ${performanceMetrics.domContentLoaded}ms`);
    console.log(`   Load Complete: ${performanceMetrics.loadComplete}ms`);
    console.log(`   First Paint: ${performanceMetrics.firstPaint}ms`);
    console.log(`   First Contentful Paint: ${performanceMetrics.firstContentfulPaint}ms`);
    
    // Step 3: Test image loading
    const images = page.locator('img[src]');
    const imageCount = await images.count();
    
    let loadedImages = 0;
    
    for (let i = 0; i < Math.min(imageCount, 10); i++) {
      const img = images.nth(i);
      
      if (await img.isVisible()) {
        const isLoaded = await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalHeight !== 0);
        
        if (isLoaded) {
          loadedImages++;
        }
      }
    }
    
    console.log(`✅ Step 3: Image loading tested - ${loadedImages}/${Math.min(imageCount, 10)} images loaded`);
    
    // Step 4: Test JavaScript execution
    const jsErrors: string[] = [];
    
    page.on('pageerror', (error) => {
      jsErrors.push(error.message);
    });
    
    // Trigger some JavaScript interactions
    await page.evaluate(() => {
      window.scrollTo(0, 100);
      return true;
    });
    
    await page.waitForTimeout(1000);
    
    console.log(`✅ Step 4: JavaScript execution tested - ${jsErrors.length} errors detected`);
    
    if (jsErrors.length > 0) {
      console.log(`   JS Errors: ${jsErrors.slice(0, 3).join(', ')}`);
    }
    
    // Step 5: Memory usage check
    const memoryInfo = await page.evaluate(() => {
      return (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize
      } : { usedJSHeapSize: 0, totalJSHeapSize: 0 };
    });
    
    console.log(`✅ Step 5: Memory usage checked - ${Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024)}MB used`);
    
    console.log("🛡️ Safe performance testing journey completed");
  });
});
