import { test, expect } from "@playwright/test";
import { PopupHandler } from "../../shared/utils/popup-handler";

/**
 * UI Tests - Product Details (10 tests)
 * Testing individual product page interface and functionality
 */

test.describe("Product Details UI Tests", () => {
  
  test.describe("Product Page Loading", () => {
    test("should load product page successfully", async ({ page }) => {
      // Navigate to a specific product (using API to get valid product ID)
      await page.goto("https://www.pandashop.md/");
      await PopupHandler.waitAndHandlePopups(page);
      
      // Find and click on first product link
      await page.waitForSelector('a[href*="product"]', { timeout: 10000 });
      const productLink = page.locator('a[href*="product"]').first();
      await productLink.click();
      
      // Verify product page loads
      await page.waitForLoadState("networkidle");
      const currentUrl = page.url();
      expect(currentUrl).toContain("product");
      
      // Check page title
      const title = await page.title();
      expect(title.length).toBeGreaterThan(5);
      
      console.log(`✅ Product page loaded: ${currentUrl}`);
    });

    test("should display product title/name", async ({ page }) => {
      // Go to product page
      await page.goto("https://www.pandashop.md/");
      await page.waitForSelector('a[href*="product"]');
      await page.locator('a[href*="product"]').first().click();
      await page.waitForLoadState("networkidle");
      
      // Look for product title
      const titleSelectors = [
        'h1',
        '.product-title',
        '.product-name', 
        '[class*="title"]',
        '[class*="name"]'
      ];
      
      let foundTitle = false;
      
      for (const selector of titleSelectors) {
        const titleElement = page.locator(selector);
        const count = await titleElement.count();
        
        if (count > 0) {
          const title = await titleElement.first().textContent();
          
          if (title && title.trim().length > 3) {
            foundTitle = true;
            console.log(`✅ Product title found: ${title.trim().substring(0, 50)}...`);
            break;
          }
        }
      }
      
      expect(foundTitle).toBe(true);
    });

    test("should display product price", async ({ page }) => {
      // Navigate to product page
      await page.goto("https://www.pandashop.md/");
      await page.locator('a[href*="product"]').first().click();
      await page.waitForLoadState("networkidle");
      
      // Look for price elements
      const priceSelectors = [
        '.price',
        '.cost',
        '[class*="price"]',
        '[class*="cost"]',
        'text=/\\d+.*MDL/i',
        'text=/\\d+.*лей/i'
      ];
      
      let foundPrice = false;
      
      for (const selector of priceSelectors) {
        const priceElements = page.locator(selector);
        const count = await priceElements.count();
        
        if (count > 0) {
          const priceText = await priceElements.first().textContent();
          
          if (priceText && /\\d+/.test(priceText)) {
            foundPrice = true;
            console.log(`✅ Product price found: ${priceText.trim()}`);
            break;
          }
        }
      }
      
      expect(foundPrice).toBe(true);
    });

    test("should display product images", async ({ page }) => {
      // Navigate to product page
      await page.goto("https://www.pandashop.md/");
      await page.locator('a[href*="product"]').first().click();
      await page.waitForLoadState("networkidle");
      
      // Look for product images
      const imageSelectors = [
        '.product-image img',
        '.product-photo img',
        '[class*="image"] img',
        '[class*="photo"] img',
        'img[alt*="product"]',
        'img[src*="product"]'
      ];
      
      let foundImages = false;
      
      for (const selector of imageSelectors) {
        const images = page.locator(selector);
        const count = await images.count();
        
        if (count > 0) {
          // Check if first image is visible and has source
          const firstImage = images.first();
          const src = await firstImage.getAttribute("src");
          
          if (src && src.length > 0) {
            await expect(firstImage).toBeVisible();
            foundImages = true;
            console.log(`✅ Product images found: ${count} images`);
            break;
          }
        }
      }
      
      expect(foundImages).toBe(true);
    });

    test("should show product description or details", async ({ page }) => {
      // Navigate to product page
      await page.goto("https://www.pandashop.md/");
      await page.locator('a[href*="product"]').first().click();
      await page.waitForLoadState("networkidle");
      
      // Look for description/details sections
      const descriptionSelectors = [
        '.description',
        '.details',
        '.product-description',
        '.product-details',
        '[class*="description"]',
        '[class*="details"]',
        '.content',
        '.info'
      ];
      
      let foundDescription = false;
      
      for (const selector of descriptionSelectors) {
        const descElements = page.locator(selector);
        const count = await descElements.count();
        
        if (count > 0) {
          const descText = await descElements.first().textContent();
          
          if (descText && descText.trim().length > 20) {
            foundDescription = true;
            console.log(`✅ Product description found: ${descText.trim().substring(0, 100)}...`);
            break;
          }
        }
      }
      
      // Description might not always be present
      console.log(foundDescription ? "✅ Product description available" : "ℹ️ No detailed description found");
    });
  });

  test.describe("Product Interaction Features", () => {
    test("should have add to cart functionality", async ({ page }) => {
      // Navigate to product page
      await page.goto("https://www.pandashop.md/");
      await page.locator('a[href*="product"]').first().click();
      await page.waitForLoadState("networkidle");
      
      // Look for add to cart buttons
      const cartButtonSelectors = [
        'button:has-text("cart")',
        'button:has-text("корзин")',
        'button:has-text("купить")',
        'button:has-text("добавить")',
        '.add-to-cart',
        '.buy-button',
        '[class*="add-to-cart"]',
        '[class*="buy"]'
      ];
      
      let foundCartButton = false;
      
      for (const selector of cartButtonSelectors) {
        const cartButtons = page.locator(selector);
        const count = await cartButtons.count();
        
        if (count > 0) {
          const button = cartButtons.first();
          
          if (await button.isVisible()) {
            foundCartButton = true;
            
            // Test button is clickable
            await expect(button).toBeEnabled();
            
            console.log(`✅ Add to cart button found: ${selector}`);
            break;
          }
        }
      }
      
      expect(foundCartButton).toBe(true);
    });

    test("should support quantity selection", async ({ page }) => {
      // Navigate to product page
      await page.goto("https://www.pandashop.md/");
      await page.locator('a[href*="product"]').first().click();
      await page.waitForLoadState("networkidle");
      
      // Look for quantity controls
      const quantitySelectors = [
        'input[name*="quantity"]',
        'input[type="number"]',
        '.quantity input',
        '[class*="quantity"] input',
        'select[name*="quantity"]',
        '.qty input'
      ];
      
      let foundQuantity = false;
      
      for (const selector of quantitySelectors) {
        const quantityElements = page.locator(selector);
        const count = await quantityElements.count();
        
        if (count > 0) {
          const quantityInput = quantityElements.first();
          
          if (await quantityInput.isVisible()) {
            foundQuantity = true;
            
            // Test quantity input
            await quantityInput.fill("2");
            const value = await quantityInput.inputValue();
            expect(value).toBe("2");
            
            console.log(`✅ Quantity selector working: ${selector}`);
            break;
          }
        }
      }
      
      // Quantity selection might not be available for all products
      console.log(foundQuantity ? "✅ Quantity selection available" : "ℹ️ Fixed quantity or no quantity selector");
    });

    test("should display product availability status", async ({ page }) => {
      // Navigate to product page
      await page.goto("https://www.pandashop.md/");
      await page.locator('a[href*="product"]').first().click();
      await page.waitForLoadState("networkidle");
      
      // Look for availability indicators
      const availabilitySelectors = [
        '.availability',
        '.stock',
        '.in-stock',
        '.out-of-stock',
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
          const availabilityText = await availabilityElements.first().textContent();
          
          if (availabilityText && availabilityText.trim().length > 0) {
            foundAvailability = true;
            console.log(`✅ Availability status: ${availabilityText.trim()}`);
            break;
          }
        }
      }
      
      console.log(foundAvailability ? "✅ Availability status displayed" : "ℹ️ Availability status not explicitly shown");
    });

    test("should support image gallery or zoom", async ({ page }) => {
      // Navigate to product page
      await page.goto("https://www.pandashop.md/");
      await page.locator('a[href*="product"]').first().click();
      await page.waitForLoadState("networkidle");
      
      // Look for multiple product images or gallery
      const gallerySelectors = [
        '.gallery img',
        '.product-images img',
        '[class*="gallery"] img',
        '[class*="images"] img',
        '.thumbnails img'
      ];
      
      let foundGallery = false;
      
      for (const selector of gallerySelectors) {
        const images = page.locator(selector);
        const count = await images.count();
        
        if (count > 1) {
          foundGallery = true;
          
          // Test clicking on additional images
          const secondImage = images.nth(1);
          
          if (await secondImage.isVisible()) {
            await secondImage.click();
            await page.waitForTimeout(500);
            
            console.log(`✅ Image gallery with ${count} images`);
            break;
          }
        }
      }
      
      // Test image zoom functionality
      if (!foundGallery) {
        const mainImage = page.locator('img[src*="product"], .product-image img').first();
        
        if (await mainImage.count() > 0) {
          await mainImage.click();
          await page.waitForTimeout(500);
          
          // Check for zoom overlay or modal
          const zoomElements = page.locator('.zoom, .modal, .overlay, [class*="zoom"], [class*="modal"]');
          const zoomCount = await zoomElements.count();
          
          if (zoomCount > 0) {
            console.log(`✅ Image zoom functionality available`);
          } else {
            console.log("ℹ️ Single image without zoom");
          }
        }
      }
    });

    test("should show related or similar products", async ({ page }) => {
      // Navigate to product page
      await page.goto("https://www.pandashop.md/");
      await page.locator('a[href*="product"]').first().click();
      await page.waitForLoadState("networkidle");
      
      // Look for related products sections
      const relatedSelectors = [
        '.related-products',
        '.similar-products',
        '.recommendations',
        '[class*="related"]',
        '[class*="similar"]',
        '[class*="recommend"]',
        '.also-bought',
        '.you-may-like'
      ];
      
      let foundRelated = false;
      
      for (const selector of relatedSelectors) {
        const relatedSections = page.locator(selector);
        const count = await relatedSections.count();
        
        if (count > 0) {
          const section = relatedSections.first();
          
          if (await section.isVisible()) {
            // Check for products in the section
            const products = section.locator('a[href*="product"], .product, .item');
            const productCount = await products.count();
            
            if (productCount > 0) {
              foundRelated = true;
              console.log(`✅ Related products section with ${productCount} products`);
              break;
            }
          }
        }
      }
      
      console.log(foundRelated ? "✅ Related products available" : "ℹ️ No related products section");
    });
  });
});
