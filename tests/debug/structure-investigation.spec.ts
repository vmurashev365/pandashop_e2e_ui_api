import { test, expect } from "@playwright/test";
import { SimplePopupHandler } from "../../shared/utils/simple-popup-handler";

/**
 * Quick investigation of Pandashop.md structure
 */

test.describe("Pandashop Structure Investigation", () => {
  
  test("investigate page structure", async ({ page }) => {
    await page.goto("https://www.pandashop.md/");
    await SimplePopupHandler.handlePandashopPopups(page);
    
    console.log("🔍 Investigating page structure...");
    
    // Check page title
    const title = await page.title();
    console.log(`Page title: "${title}"`);
    
    // Look for common element patterns
    const elementPatterns = [
      'div',
      'a',
      'img',
      'span',
      'section',
      'article',
      '[class*="product"]',
      '[class*="item"]',
      '[class*="card"]',
      '[class*="catalog"]',
      '[class*="list"]'
    ];
    
    for (const pattern of elementPatterns) {
      const count = await page.locator(pattern).count();
      if (count > 0) {
        console.log(`${pattern}: ${count} elements`);
      }
    }
    
    // Look for links that might be products
    const links = page.locator('a[href]');
    const linkCount = await links.count();
    console.log(`Total links: ${linkCount}`);
    
    // Sample some link hrefs
    for (let i = 0; i < Math.min(linkCount, 10); i++) {
      const link = links.nth(i);
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      console.log(`Link ${i}: "${text?.trim().substring(0, 30)}..." → ${href}`);
    }
    
    // Look for images
    const images = page.locator('img[src]');
    const imageCount = await images.count();
    console.log(`Total images: ${imageCount}`);
    
    // Sample some image sources
    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const img = images.nth(i);
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');
      console.log(`Image ${i}: alt="${alt}" src="${src?.substring(0, 50)}..."`);
    }
    
    // Look for specific class patterns
    const classPatterns = ['product', 'item', 'card', 'catalog', 'goods', 'товар'];
    
    for (const pattern of classPatterns) {
      const elements = page.locator(`[class*="${pattern}"]`);
      const count = await elements.count();
      
      if (count > 0) {
        console.log(`Class pattern "${pattern}": ${count} elements`);
        
        // Sample first element's classes
        const firstElement = elements.first();
        const className = await firstElement.getAttribute('class');
        console.log(`  First element classes: "${className}"`);
      }
    }
    
    // Check if we're on the right page
    const bodyText = await page.textContent('body');
    const hasShopKeywords = bodyText?.includes('товар') || 
                           bodyText?.includes('продукт') || 
                           bodyText?.includes('купить') ||
                           bodyText?.includes('цена') ||
                           bodyText?.includes('магазин');
    
    console.log(`Has shop-related keywords: ${hasShopKeywords}`);
    
    // Look for navigation elements
    const navElements = page.locator('nav, .nav, .menu, [class*="nav"], [class*="menu"]');
    const navCount = await navElements.count();
    console.log(`Navigation elements: ${navCount}`);
    
    if (navCount > 0) {
      const navText = await navElements.first().textContent();
      console.log(`Navigation content: "${navText?.trim().substring(0, 100)}..."`);
    }
    
    console.log("🔍 Investigation completed");
  });
});
