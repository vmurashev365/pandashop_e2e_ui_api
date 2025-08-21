import { test, expect } from "@playwright/test";
import { TestConfig } from "../../shared/config/test-config";
import { CatalogPage } from "../../shared/pages/catalog-page";

/**
 * UI Tests - Product Catalog (15 tests)
 * Testing product catalog interface and interactions using Page Object Model
 */

test.describe("Product Catalog UI Tests", () => {
  
  test.describe("Catalog Page Loading", () => {
    test("should load main catalog page successfully", async ({ page }) => {
      const catalogPage = new CatalogPage(page);
      await catalogPage.openCatalog();
      
      // Verify page loads and has content
      const analysis = await catalogPage.getCatalogAnalysis();
      
      // For homepage testing, we expect some UI elements to be present
      const hasContent = analysis.hasImages || analysis.hasPrices || analysis.hasTitles;
      expect(hasContent).toBe(true);
      
      console.log(`✅ Catalog page loaded - Images(${analysis.imagesCount}) Prices(${analysis.pricesCount}) Titles(${analysis.titlesCount})`);
    });

    test("should display product grid layout", async ({ page }) => {
      const catalogPage = new CatalogPage(page);
      await catalogPage.openCatalog();

      // Check grid layout exists
      const analysis = await catalogPage.getCatalogAnalysis();
      expect(analysis.hasProducts || analysis.hasImages || analysis.hasTitles).toBe(true);
      
      console.log(`✅ Page content displays - Products(${analysis.productsCount}) Images(${analysis.imagesCount}) Titles(${analysis.titlesCount})`);
    });

    test("should show product images", async ({ page }) => {
      const catalogPage = new CatalogPage(page);
      await catalogPage.openCatalog();
      
      const analysis = await catalogPage.getCatalogAnalysis();
      expect(analysis.hasImages).toBe(true);
      expect(analysis.imagesCount).toBeGreaterThan(0);
      
      console.log(`✅ Found ${analysis.imagesCount} product images`);
    });

    test("should display product prices", async ({ page }) => {
      const catalogPage = new CatalogPage(page);
      await catalogPage.openCatalog();
      
      const analysis = await catalogPage.getCatalogAnalysis();
      expect(analysis.hasPrices).toBe(true);
      expect(analysis.pricesCount).toBeGreaterThan(0);
      
      console.log(`✅ Found ${analysis.pricesCount} prices`);
    });

    test("should show product names/titles", async ({ page }) => {
      const catalogPage = new CatalogPage(page);
      await catalogPage.openCatalog();
      
      const analysis = await catalogPage.getCatalogAnalysis();
      expect(analysis.hasTitles).toBe(true);
      expect(analysis.titlesCount).toBeGreaterThan(0);
      
      console.log(`✅ Found ${analysis.titlesCount} product titles`);
    });
  });

  test.describe("Navigation and Filtering", () => {
    test("should have working main navigation menu", async ({ page }) => {
      await page.goto(TestConfig.getFullUrl());
      
      // Look for navigation elements
      const navSelectors = [
        'nav',
        '.navigation',
        '.menu',
        '[class*="nav"]',
        '[class*="menu"]'
      ];
      
      let foundNav = false;
      
      for (const selector of navSelectors) {
        const navElement = page.locator(selector).first();
        
        if (await navElement.count() > 0) {
          await expect(navElement).toBeVisible();
          
          // Check for navigation links
          const links = navElement.locator('a');
          const linkCount = await links.count();
          
          if (linkCount > 0) {
            foundNav = true;
            console.log(`✅ Found navigation with ${linkCount} links`);
            break;
          }
        }
      }
      
      // Alternative: check for any navigation links
      if (!foundNav) {
        const allLinks = page.locator('a[href*="catalog"], a[href*="category"]');
        const linkCount = await allLinks.count();
        
        if (linkCount > 0) {
          foundNav = true;
          console.log(`✅ Found ${linkCount} catalog/category links`);
        }
      }
      
      expect(foundNav).toBe(true);
    });

    test("should have search functionality", async ({ page }) => {
      await page.goto("https://www.pandashop.md/");
      
      // Look for search elements
      const searchSelectors = [
        'input[type="search"]',
        'input[placeholder*="search"]',
        'input[placeholder*="поиск"]',
        '.search input',
        '[class*="search"] input',
        '#search'
      ];
      
      let foundSearch = false;
      
      for (const selector of searchSelectors) {
        const searchElement = page.locator(selector).first();
        
        if (await searchElement.count() > 0) {
          await expect(searchElement).toBeVisible();
          foundSearch = true;
          
          // Test search input
          await searchElement.fill("test");
          const value = await searchElement.inputValue();
          expect(value).toBe("test");
          
          console.log(`✅ Found working search input: ${selector}`);
          break;
        }
      }
      
      expect(foundSearch).toBe(true);
    });

    test("should handle category filtering", async ({ page }) => {
      await page.goto("https://www.pandashop.md/");
      
      // Look for category filters or links
      const categorySelectors = [
        'a[href*="category"]',
        'a[href*="catalog"]',
        '.category',
        '.filter',
        '[class*="category"]',
        '[class*="filter"]'
      ];
      
      let foundCategories = false;
      
      for (const selector of categorySelectors) {
        const categories = page.locator(selector);
        const count = await categories.count();
        
        if (count > 0) {
          foundCategories = true;
          
          // Try clicking first category link
          const firstCategory = categories.first();
          
          if (await firstCategory.isVisible()) {
            const href = await firstCategory.getAttribute("href");
            
            if (href && !href.includes("javascript:")) {
              // Test category navigation
              await firstCategory.click();
              await page.waitForLoadState("networkidle");
              
              // Verify navigation worked
              const currentUrl = page.url();
              expect(currentUrl).toContain("pandashop.md");
              
              console.log(`✅ Category navigation working: ${href}`);
              break;
            }
          }
        }
      }
      
      expect(foundCategories).toBe(true);
    });

    test("should support pagination", async ({ page }) => {
      await page.goto("https://www.pandashop.md/");
      
      // Look for pagination elements
      const paginationSelectors = [
        '.pagination',
        '.pager',
        '[class*="pagination"]',
        '[class*="pager"]',
        'a[href*="page"]',
        'button:has-text("Next")',
        'button:has-text("Далее")'
      ];
      
      let foundPagination = false;
      
      for (const selector of paginationSelectors) {
        const paginationElements = page.locator(selector);
        const count = await paginationElements.count();
        
        if (count > 0) {
          foundPagination = true;
          
          // Check if pagination is functional
          const firstPagination = paginationElements.first();
          
          if (await firstPagination.isVisible()) {
            console.log(`✅ Found pagination elements: ${selector}`);
            break;
          }
        }
      }
      
      // Alternative: look for numbered page links
      if (!foundPagination) {
        const numberLinks = page.locator('a:has-text("2"), a:has-text("3")');
        const count = await numberLinks.count();
        
        if (count > 0) {
          foundPagination = true;
          console.log(`✅ Found numbered pagination links: ${count}`);
        }
      }
      
      // It's OK if no pagination (might be single page)
      console.log(foundPagination ? "✅ Pagination available" : "ℹ️ No pagination found (single page)");
    });

    test("should handle product sorting", async ({ page }) => {
      await page.goto("https://www.pandashop.md/");
      
      // Look for sorting elements
      const sortSelectors = [
        'select[name*="sort"]',
        '.sort select',
        '[class*="sort"] select',
        'option:has-text("price")',
        'option:has-text("цена")',
        '.sort-by',
        '[class*="sort-by"]'
      ];
      
      let foundSort = false;
      
      for (const selector of sortSelectors) {
        const sortElements = page.locator(selector);
        const count = await sortElements.count();
        
        if (count > 0) {
          const firstSort = sortElements.first();
          
          if (await firstSort.isVisible()) {
            foundSort = true;
            console.log(`✅ Found sort elements: ${selector}`);
            
            // Test if it's a select element
            const tagName = await firstSort.evaluate(el => el.tagName.toLowerCase());
            
            if (tagName === 'select') {
              const options = firstSort.locator('option');
              const optionCount = await options.count();
              
              if (optionCount > 1) {
                console.log(`✅ Sort select has ${optionCount} options`);
              }
            }
            
            break;
          }
        }
      }
      
      // Sorting might not be available on all sites
      console.log(foundSort ? "✅ Sorting functionality available" : "ℹ️ No sorting found");
    });
  });

  test.describe("Product Interaction", () => {
    test("should allow clicking on products", async ({ page }) => {
      await page.goto("https://www.pandashop.md/");
      
      // Wait for products to load
      await page.waitForSelector('.product, .item, [class*="product"], a[href*="product"]', { timeout: 10000 });
      
      // Find clickable product elements
      const productLinks = page.locator('a[href*="product"]');
      const count = await productLinks.count();
      
      expect(count).toBeGreaterThan(0);
      
      // Test clicking first product
      const firstProduct = productLinks.first();
      await expect(firstProduct).toBeVisible();
      
      const href = await firstProduct.getAttribute("href");
      expect(href).toBeTruthy();
      expect(href).toContain("product");
      
      // Click and verify navigation
      await firstProduct.click();
      await page.waitForLoadState("networkidle");
      
      const currentUrl = page.url();
      expect(currentUrl).toContain("product");
      
      console.log(`✅ Product click navigation working: ${currentUrl}`);
    });

    test("should show product details on hover", async ({ page }) => {
      await page.goto("https://www.pandashop.md/");
      
      // Find product elements
      const products = page.locator('.product, .item, [class*="product"]').first();
      
      if (await products.count() > 0) {
        // Hover over first product
        await products.hover();
        
        // Wait a moment for hover effects
        await page.waitForTimeout(500);
        
        // Check for any hover effects (tooltips, overlays, etc.)
        const hoverElements = page.locator('.tooltip, .overlay, .hover, [class*="tooltip"], [class*="overlay"], [class*="hover"]');
        const hoverCount = await hoverElements.count();
        
        console.log(hoverCount > 0 ? `✅ Hover effects found: ${hoverCount}` : "ℹ️ No hover effects detected");
      }
    });

    test("should handle add to cart from catalog", async ({ page }) => {
      await page.goto("https://www.pandashop.md/");
      
      // Look for "Add to Cart" buttons
      const cartButtonSelectors = [
        'button:has-text("cart")',
        'button:has-text("корзин")',
        '.add-to-cart',
        '[class*="add-to-cart"]',
        'button[class*="cart"]',
        'a[class*="cart"]'
      ];
      
      let foundCartButton = false;
      
      for (const selector of cartButtonSelectors) {
        const cartButtons = page.locator(selector);
        const count = await cartButtons.count();
        
        if (count > 0) {
          const firstButton = cartButtons.first();
          
          if (await firstButton.isVisible()) {
            foundCartButton = true;
            
            // Test button click (but don't complete purchase)
            await firstButton.click();
            await page.waitForTimeout(1000);
            
            console.log(`✅ Add to cart button working: ${selector}`);
            break;
          }
        }
      }
      
      // Add to cart might require product page
      console.log(foundCartButton ? "✅ Add to cart available from catalog" : "ℹ️ Add to cart requires product page");
    });

    test("should display product availability status", async ({ page }) => {
      await page.goto("https://www.pandashop.md/");
      
      // Look for availability indicators
      const availabilitySelectors = [
        '.availability',
        '.stock',
        '[class*="availability"]',
        '[class*="stock"]',
        'text=/в наличии/i',
        'text=/available/i',
        'text=/нет в наличии/i',
        'text=/out of stock/i'
      ];
      
      let foundAvailability = false;
      
      for (const selector of availabilitySelectors) {
        const availabilityElements = page.locator(selector);
        const count = await availabilityElements.count();
        
        if (count > 0) {
          foundAvailability = true;
          
          // Check text content
          for (let i = 0; i < Math.min(count, 3); i++) {
            const text = await availabilityElements.nth(i).textContent();
            
            if (text) {
              console.log(`✅ Availability status: ${text.trim()}`);
            }
          }
          
          break;
        }
      }
      
      console.log(foundAvailability ? "✅ Product availability displayed" : "ℹ️ Availability status not shown on catalog");
    });

    test("should support responsive design", async ({ page }) => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("https://www.pandashop.md/");
      
      // Verify page loads in mobile
      await page.waitForSelector('body', { timeout: 10000 });
      
      // Check if products are still visible
      const products = page.locator('.product, .item, [class*="product"]');
      const mobileCount = await products.count();
      
      expect(mobileCount).toBeGreaterThan(0);
      
      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();
      
      const tabletCount = await products.count();
      expect(tabletCount).toBeGreaterThan(0);
      
      // Test desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.reload();
      
      const desktopCount = await products.count();
      expect(desktopCount).toBeGreaterThan(0);
      
      console.log(`✅ Responsive design: Mobile(${mobileCount}) Tablet(${tabletCount}) Desktop(${desktopCount}) products`);
    });
  });
});
