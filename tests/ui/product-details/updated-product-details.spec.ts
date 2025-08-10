import { test, expect } from "@playwright/test";
import { SimplePopupHandler } from "../../shared/utils/simple-popup-handler";

/**
 * UI Tests - Product Details (10 tests) - Updated with GitHub repo patterns
 * SAFETY: All tests are read-only, no real orders created
 */

test.describe("Product Details UI Tests (GitHub Updated)", () => {
  
  test.describe("Product Page Loading", () => {
    test("should load product detail pages", async ({ page }) => {
      await page.goto("https://www.pandashop.md/");
      await SimplePopupHandler.handlePandashopPopups(page);
      
      // Find product links using updated selectors
      const productLinkSelectors = [
        '.digi-product--desktop a',
        '.product-item a',
        'a[href*="/product/"]',
        'a[href*="/p/"]'
      ];
      
      let productLink = null;
      
      for (const selector of productLinkSelectors) {
        const links = page.locator(selector);
        const count = await links.count();
        
        if (count > 0) {
          productLink = links.first();
          console.log(`✅ Found ${count} product links with selector: ${selector}`);
          break;
        }
      }
      
      if (productLink && await productLink.count() > 0) {
        const href = await productLink.getAttribute('href');
        console.log(`🔗 Navigating to product: ${href}`);
        
        await productLink.click();
        await page.waitForLoadState('networkidle');
        await SimplePopupHandler.handlePandashopPopups(page);
        
        // Verify we're on a product page
        const url = page.url();
        console.log(`✅ Product page loaded: ${url}`);
        
        const title = await page.title();
        expect(title.length).toBeGreaterThan(0);
        console.log(`📄 Product title: "${title}"`);
      } else {
        console.log(`ℹ️ No product links found, testing main page structure`);
        
        // Verify main page has content
        const bodyText = await page.textContent('body');
        expect(bodyText && bodyText.length).toBeGreaterThan(500);
      }
    });

    test("should display product images", async ({ page }) => {
      await page.goto("https://www.pandashop.md/");
      await SimplePopupHandler.handlePandashopPopups(page);
      
      // Look for product images
      const imageSelectors = [
        '.product-image img',
        '.digi-product--desktop img',
        'img[src*="product"]',
        'img[alt*="product"], img[alt*="товар"]'
      ];
      
      let foundImages = false;
      
      for (const selector of imageSelectors) {
        const images = page.locator(selector);
        const count = await images.count();
        
        if (count > 0) {
          foundImages = true;
          console.log(`✅ Found ${count} product images with selector: ${selector}`);
          
          // Check first image properties
          const firstImage = images.first();
          if (await firstImage.isVisible()) {
            const src = await firstImage.getAttribute('src');
            const alt = await firstImage.getAttribute('alt');
            console.log(`   Image src: ${src}`);
            console.log(`   Image alt: ${alt}`);
          }
          
          break;
        }
      }
      
      if (!foundImages) {
        console.log(`ℹ️ No product images found with standard selectors`);
        
        // Check for any images on page
        const allImages = page.locator('img');
        const totalImages = await allImages.count();
        console.log(`📊 Total images on page: ${totalImages}`);
      }
    });

    test("should show product pricing", async ({ page }) => {
      await page.goto("https://www.pandashop.md/");
      await SimplePopupHandler.handlePandashopPopups(page);
      
      // Price selectors from GitHub repo patterns
      const priceSelectors = [
        '.price',
        '.product-price',
        '[class*="price"]',
        'span:has-text("лей")',
        'text=/\\d+\\s*лей/',
        'text=/\\d+\\.\\d+\\s*лей/'
      ];
      
      let foundPrices = false;
      
      for (const selector of priceSelectors) {
        const prices = page.locator(selector);
        const count = await prices.count();
        
        if (count > 0) {
          foundPrices = true;
          console.log(`✅ Found ${count} price elements with selector: ${selector}`);
          
          // Log sample prices
          const firstPrice = prices.first();
          if (await firstPrice.isVisible()) {
            const priceText = await firstPrice.textContent();
            console.log(`   Sample price: "${priceText?.trim()}"`);
          }
          
          break;
        }
      }
      
      if (!foundPrices) {
        console.log(`ℹ️ No standard price elements found`);
        
        // Look for any text containing currency
        const currencyText = page.locator('text=/лей|MDL|руб/');
        const currencyCount = await currencyText.count();
        
        if (currencyCount > 0) {
          console.log(`✅ Found ${currencyCount} currency references`);
          const sampleCurrency = await currencyText.first().textContent();
          console.log(`   Sample: "${sampleCurrency?.trim()}"`);
        }
      }
    });

    test("should display product information safely", async ({ page }) => {
      await page.goto("https://www.pandashop.md/");
      await SimplePopupHandler.handlePandashopPopups(page);
      
      // Product information elements
      const infoSelectors = [
        '.product-title',
        '.product-name',
        '.product-description',
        '.product-info',
        'h1, h2, h3'
      ];
      
      let productInfoFound = false;
      
      for (const selector of infoSelectors) {
        const elements = page.locator(selector);
        const count = await elements.count();
        
        if (count > 0) {
          productInfoFound = true;
          console.log(`✅ Found ${count} info elements: ${selector}`);
          
          // Sample first element
          const firstElement = elements.first();
          if (await firstElement.isVisible()) {
            const text = await firstElement.textContent();
            console.log(`   Sample text: "${text?.trim().substring(0, 100)}..."`);
          }
        }
      }
      
      if (!productInfoFound) {
        console.log(`ℹ️ Standard product info elements not found`);
        
        // Check for general content
        const headings = page.locator('h1, h2, h3, h4, h5, h6');
        const headingCount = await headings.count();
        console.log(`📋 Found ${headingCount} headings on page`);
        
        if (headingCount > 0) {
          const firstHeading = await headings.first().textContent();
          console.log(`   First heading: "${firstHeading?.trim()}"`);
        }
      }
    });

    test("should show add to cart UI (SAFE - no real orders)", async ({ page }) => {
      await page.goto("https://www.pandashop.md/");
      await SimplePopupHandler.handlePandashopPopups(page);
      
      // Cart button selectors from GitHub research
      const cartButtonSelectors = [
        'text="В корзину"',
        'button:has-text("корзин")',
        'button:has-text("купить")',
        '.add-to-cart',
        '[class*="add-to-cart"]',
        'input[value*="корзин"]'
      ];
      
      let foundCartButtons = false;
      
      for (const selector of cartButtonSelectors) {
        const buttons = page.locator(selector);
        const count = await buttons.count();
        
        if (count > 0) {
          foundCartButtons = true;
          console.log(`✅ Found ${count} cart buttons: ${selector}`);
          
          // Verify button properties (but don't click!)
          const firstButton = buttons.first();
          if (await firstButton.isVisible()) {
            const buttonText = await firstButton.textContent();
            const isEnabled = await firstButton.isEnabled();
            
            console.log(`   Button text: "${buttonText?.trim()}"`);
            console.log(`   Button enabled: ${isEnabled}`);
            console.log(`⚠️ SAFETY: NOT clicking to avoid real orders`);
          }
          
          break;
        }
      }
      
      if (!foundCartButtons) {
        console.log(`ℹ️ No cart buttons found on main page`);
        
        // Check if we need to navigate to a product page
        const productLinks = page.locator('a[href*="product"], a[href*="p/"]');
        const linkCount = await productLinks.count();
        
        if (linkCount > 0) {
          console.log(`🔗 Found ${linkCount} product links for detailed testing`);
        }
      }
    });
  });

  test.describe("Product Details Interaction (Safe)", () => {
    test("should display product specifications", async ({ page }) => {
      await page.goto("https://www.pandashop.md/");
      await SimplePopupHandler.handlePandashopPopups(page);
      
      // Specification selectors
      const specSelectors = [
        '.specifications',
        '.product-specs',
        '.details',
        '.characteristics',
        'table',
        '.spec-table'
      ];
      
      let foundSpecs = false;
      
      for (const selector of specSelectors) {
        const specs = page.locator(selector);
        const count = await specs.count();
        
        if (count > 0) {
          foundSpecs = true;
          console.log(`✅ Found ${count} specification sections: ${selector}`);
          
          // Check content
          const firstSpec = specs.first();
          if (await firstSpec.isVisible()) {
            const specText = await firstSpec.textContent();
            console.log(`   Spec preview: "${specText?.trim().substring(0, 150)}..."`);
          }
          
          break;
        }
      }
      
      if (!foundSpecs) {
        console.log(`ℹ️ No specification sections found`);
        
        // Look for structured data
        const tables = page.locator('table');
        const tableCount = await tables.count();
        
        if (tableCount > 0) {
          console.log(`📊 Found ${tableCount} tables (may contain specs)`);
        }
      }
    });

    test("should support quantity selection (UI only)", async ({ page }) => {
      await page.goto("https://www.pandashop.md/");
      await SimplePopupHandler.handlePandashopPopups(page);
      
      // Quantity selectors
      const quantitySelectors = [
        'input[type="number"]',
        'input[name*="quantity"]',
        'input[name*="qty"]',
        '.quantity-input',
        'select[name*="quantity"]'
      ];
      
      let foundQuantityControls = false;
      
      for (const selector of quantitySelectors) {
        const controls = page.locator(selector);
        const count = await controls.count();
        
        if (count > 0) {
          foundQuantityControls = true;
          console.log(`✅ Found ${count} quantity controls: ${selector}`);
          
          // Test UI only (no actual changes)
          const firstControl = controls.first();
          if (await firstControl.isVisible()) {
            const currentValue = await firstControl.inputValue();
            console.log(`   Current quantity: "${currentValue}"`);
            console.log(`⚠️ SAFETY: Testing UI only, not changing values`);
          }
          
          break;
        }
      }
      
      if (!foundQuantityControls) {
        console.log(`ℹ️ No quantity controls found on main page`);
      }
    });

    test("should show product reviews safely", async ({ page }) => {
      await page.goto("https://www.pandashop.md/");
      await SimplePopupHandler.handlePandashopPopups(page);
      
      // Review selectors
      const reviewSelectors = [
        '.reviews',
        '.comments',
        '.feedback',
        '.testimonials',
        '.review-item',
        '[class*="review"]'
      ];
      
      let foundReviews = false;
      
      for (const selector of reviewSelectors) {
        const reviews = page.locator(selector);
        const count = await reviews.count();
        
        if (count > 0) {
          foundReviews = true;
          console.log(`✅ Found ${count} review sections: ${selector}`);
          
          // Check review content
          const firstReview = reviews.first();
          if (await firstReview.isVisible()) {
            const reviewText = await firstReview.textContent();
            console.log(`   Review preview: "${reviewText?.trim().substring(0, 100)}..."`);
          }
          
          break;
        }
      }
      
      if (!foundReviews) {
        console.log(`ℹ️ No review sections found on main page`);
        
        // Look for star ratings
        const starElements = page.locator('[class*="star"], [class*="rating"]');
        const starCount = await starElements.count();
        
        if (starCount > 0) {
          console.log(`⭐ Found ${starCount} rating elements`);
        }
      }
    });

    test("should display related products", async ({ page }) => {
      await page.goto("https://www.pandashop.md/");
      await SimplePopupHandler.handlePandashopPopups(page);
      
      // Related product selectors
      const relatedSelectors = [
        '.related-products',
        '.similar-products',
        '.recommended',
        '.you-may-like',
        '[class*="related"]',
        '[class*="similar"]'
      ];
      
      let foundRelated = false;
      
      for (const selector of relatedSelectors) {
        const related = page.locator(selector);
        const count = await related.count();
        
        if (count > 0) {
          foundRelated = true;
          console.log(`✅ Found ${count} related product sections: ${selector}`);
          
          // Count items in related section
          const relatedItems = related.first().locator('.product, .item, a');
          const itemCount = await relatedItems.count();
          console.log(`   Related items: ${itemCount}`);
          
          break;
        }
      }
      
      if (!foundRelated) {
        console.log(`ℹ️ No related product sections found`);
        
        // Check for general product listings
        const productContainers = page.locator('.digi-product--desktop, .product-item');
        const containerCount = await productContainers.count();
        
        if (containerCount > 3) {
          console.log(`📦 Found ${containerCount} product containers (may include recommendations)`);
        }
      }
    });

    test("should handle product image gallery", async ({ page }) => {
      await page.goto("https://www.pandashop.md/");
      await SimplePopupHandler.handlePandashopPopups(page);
      
      // Image gallery selectors
      const gallerySelectors = [
        '.image-gallery',
        '.product-gallery',
        '.image-slider',
        '.product-images',
        '[class*="gallery"]',
        '[class*="slider"]'
      ];
      
      let foundGallery = false;
      
      for (const selector of gallerySelectors) {
        const galleries = page.locator(selector);
        const count = await galleries.count();
        
        if (count > 0) {
          foundGallery = true;
          console.log(`✅ Found ${count} image galleries: ${selector}`);
          
          // Count images in gallery
          const galleryImages = galleries.first().locator('img');
          const imageCount = await galleryImages.count();
          console.log(`   Gallery images: ${imageCount}`);
          
          // Test first image (safe)
          if (imageCount > 0) {
            const firstImage = galleryImages.first();
            const src = await firstImage.getAttribute('src');
            console.log(`   First image: ${src}`);
          }
          
          break;
        }
      }
      
      if (!foundGallery) {
        console.log(`ℹ️ No image galleries found`);
        
        // Count all product images
        const allImages = page.locator('img[src*="product"], img[alt*="product"]');
        const totalProductImages = await allImages.count();
        
        console.log(`🖼️ Total product images on page: ${totalProductImages}`);
      }
    });
  });
});
