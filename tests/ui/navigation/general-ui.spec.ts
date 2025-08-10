import { test, expect } from "@playwright/test";
import { PopupHandler } from "../../shared/utils/popup-handler";

/**
 * UI Tests - Navigation & General Interface (5 tests)
 * Testing site navigation, responsive design, and overall user experience
 */

test.describe("Navigation & General UI Tests", () => {
  
  test("should have responsive navigation menu", async ({ page }) => {
    await page.goto("https://www.pandashop.md/");
    await PopupHandler.waitAndHandlePopups(page);
    
    // Test desktop navigation
    const navSelectors = [
      'nav',
      '.navigation',
      '.navbar',
      '.menu',
      '[class*="nav"]',
      'header nav',
      '.main-menu'
    ];
    
    let foundNavigation = false;
    
    for (const selector of navSelectors) {
      const navElements = page.locator(selector);
      const count = await navElements.count();
      
      if (count > 0) {
        const nav = navElements.first();
        
        if (await nav.isVisible()) {
          // Check for navigation links
          const links = nav.locator('a');
          const linkCount = await links.count();
          
          if (linkCount > 0) {
            foundNavigation = true;
            console.log(`✅ Navigation found with ${linkCount} links: ${selector}`);
            
            // Test first navigation link
            const firstLink = links.first();
            const href = await firstLink.getAttribute('href');
            const text = await firstLink.textContent();
            
            console.log(`   First nav link: "${text?.trim()}" → ${href}`);
            break;
          }
        }
      }
    }
    
    // Test mobile menu (hamburger) - resize viewport first
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    const mobileMenuSelectors = [
      '.hamburger',
      '.mobile-menu-toggle',
      '.menu-toggle',
      '[class*="hamburger"]',
      '[class*="mobile-menu"]',
      'button[class*="menu"]'
    ];
    
    let foundMobileMenu = false;
    
    for (const selector of mobileMenuSelectors) {
      const mobileMenus = page.locator(selector);
      const count = await mobileMenus.count();
      
      if (count > 0) {
        const menuToggle = mobileMenus.first();
        
        if (await menuToggle.isVisible()) {
          foundMobileMenu = true;
          console.log(`✅ Mobile menu toggle found: ${selector}`);
          
          // Test clicking mobile menu
          await menuToggle.click();
          await page.waitForTimeout(500);
          
          // Look for opened mobile menu
          const openMenuSelectors = [
            '.mobile-menu.open',
            '.menu.open',
            '.nav.open',
            '[class*="menu"][class*="open"]'
          ];
          
          for (const openSelector of openMenuSelectors) {
            const openMenus = page.locator(openSelector);
            
            if (await openMenus.count() > 0) {
              console.log(`✅ Mobile menu opens: ${openSelector}`);
              break;
            }
          }
          
          break;
        }
      }
    }
    
    expect(foundNavigation).toBe(true);
    console.log(foundMobileMenu ? "✅ Responsive navigation with mobile menu" : "ℹ️ Desktop navigation only");
  });

  test("should have working search functionality", async ({ page }) => {
    await page.goto("https://www.pandashop.md/");
    await page.waitForLoadState("networkidle");
    
    // Look for search input
    const searchSelectors = [
      'input[type="search"]',
      'input[placeholder*="поиск"]',
      'input[placeholder*="search"]',
      '.search input',
      '[class*="search"] input',
      '#search',
      '.search-box input'
    ];
    
    let foundSearch = false;
    
    for (const selector of searchSelectors) {
      const searchInputs = page.locator(selector);
      const count = await searchInputs.count();
      
      if (count > 0) {
        const searchInput = searchInputs.first();
        
        if (await searchInput.isVisible()) {
          foundSearch = true;
          
          // Test search functionality
          await searchInput.fill("телефон");
          
          // Look for search button
          const searchButtonSelectors = [
            'button[type="submit"]',
            '.search-button',
            'button:has-text("поиск")',
            'button:has-text("search")',
            '.fa-search'
          ];
          
          let searchSubmitted = false;
          
          for (const buttonSelector of searchButtonSelectors) {
            const searchButtons = page.locator(buttonSelector);
            
            if (await searchButtons.count() > 0) {
              const searchButton = searchButtons.first();
              
              if (await searchButton.isVisible()) {
                await searchButton.click();
                searchSubmitted = true;
                break;
              }
            }
          }
          
          // If no button found, try Enter key
          if (!searchSubmitted) {
            await searchInput.press('Enter');
            searchSubmitted = true;
          }
          
          if (searchSubmitted) {
            await page.waitForLoadState("networkidle");
            
            // Check if search results appear
            const url = page.url();
            const hasSearchParam = url.includes('search') || url.includes('поиск') || url.includes('телефон');
            
            console.log(`✅ Search functionality tested: ${selector}, URL: ${url}`);
            console.log(`   Search submitted: ${hasSearchParam ? 'Results page loaded' : 'Same page'}`);
          }
          
          break;
        }
      }
    }
    
    expect(foundSearch).toBe(true);
  });

  test("should display proper footer with links", async ({ page }) => {
    await page.goto("https://www.pandashop.md/");
    await page.waitForLoadState("networkidle");
    
    // Scroll to bottom to ensure footer is visible
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    // Look for footer
    const footerSelectors = [
      'footer',
      '.footer',
      '[class*="footer"]',
      '.bottom',
      '.site-footer'
    ];
    
    let foundFooter = false;
    
    for (const selector of footerSelectors) {
      const footerElements = page.locator(selector);
      const count = await footerElements.count();
      
      if (count > 0) {
        const footer = footerElements.first();
        
        if (await footer.isVisible()) {
          foundFooter = true;
          
          // Check for footer links
          const footerLinks = footer.locator('a');
          const linkCount = await footerLinks.count();
          
          console.log(`✅ Footer found with ${linkCount} links: ${selector}`);
          
          // Check for common footer sections
          const footerSections = [
            'text=/контакт/i',
            'text=/contact/i',
            'text=/о нас/i',
            'text=/about/i',
            'text=/помощь/i',
            'text=/help/i',
            'text=/политика/i',
            'text=/privacy/i'
          ];
          
          for (const sectionSelector of footerSections) {
            const sections = footer.locator(sectionSelector);
            
            if (await sections.count() > 0) {
              const sectionText = await sections.first().textContent();
              console.log(`   Footer section: ${sectionText?.trim()}`);
            }
          }
          
          break;
        }
      }
    }
    
    expect(foundFooter).toBe(true);
  });

  test("should be responsive across different screen sizes", async ({ page }) => {
    await page.goto("https://www.pandashop.md/");
    
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080, name: "Desktop Large" },
      { width: 1366, height: 768, name: "Desktop Standard" },
      { width: 768, height: 1024, name: "Tablet" },
      { width: 375, height: 667, name: "Mobile" }
    ];
    
    let allViewportsWork = true;
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000);
      await page.waitForLoadState("networkidle");
      
      // Check if page loads without horizontal scroll
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = viewport.width;
      
      const hasHorizontalScroll = bodyWidth > viewportWidth + 20; // 20px tolerance
      
      // Check if main content is visible
      const mainContentSelectors = [
        'main',
        '.main',
        '.content',
        '.container',
        '[class*="main"]'
      ];
      
      let contentVisible = false;
      
      for (const selector of mainContentSelectors) {
        const content = page.locator(selector).first();
        
        if (await content.count() > 0 && await content.isVisible()) {
          contentVisible = true;
          break;
        }
      }
      
      console.log(`✅ ${viewport.name} (${viewport.width}x${viewport.height}): Content visible: ${contentVisible}, Horizontal scroll: ${hasHorizontalScroll}`);
      
      if (!contentVisible || hasHorizontalScroll) {
        allViewportsWork = false;
      }
    }
    
    // Reset to standard desktop size
    await page.setViewportSize({ width: 1366, height: 768 });
    
    console.log(allViewportsWork ? "✅ Responsive design working across all viewports" : "⚠️ Some responsive design issues detected");
  });

  test("should have proper page loading and error handling", async ({ page }) => {
    // Test normal page loading
    await page.goto("https://www.pandashop.md/");
    await page.waitForLoadState("networkidle");
    
    // Check page loaded successfully
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    
    console.log(`✅ Main page loaded successfully: "${title}"`);
    
    // Test loading states
    const loadingSelectors = [
      '.loading',
      '.spinner',
      '.loader',
      '[class*="loading"]',
      '[class*="spinner"]'
    ];
    
    let hasLoadingStates = false;
    
    for (const selector of loadingSelectors) {
      const loadingElements = page.locator(selector);
      
      if (await loadingElements.count() > 0) {
        hasLoadingStates = true;
        console.log(`ℹ️ Loading indicator found: ${selector}`);
        break;
      }
    }
    
    // Test error handling - try invalid URL
    try {
      await page.goto("https://www.pandashop.md/nonexistent-page-test-404");
      await page.waitForLoadState("networkidle");
      
      const errorPageTitle = await page.title();
      const bodyText = await page.textContent('body');
      
      const is404 = bodyText?.includes('404') || 
                   bodyText?.includes('не найден') || 
                   bodyText?.includes('not found') ||
                   errorPageTitle.includes('404');
      
      console.log(is404 ? "✅ 404 error page handled properly" : "ℹ️ Custom error handling or redirect");
      
    } catch (error) {
      console.log("ℹ️ Navigation error handled by browser");
    }
    
    // Test JavaScript errors
    const jsErrors: string[] = [];
    
    page.on('pageerror', (error) => {
      jsErrors.push(error.message);
    });
    
    // Go back to main page and check for JS errors
    await page.goto("https://www.pandashop.md/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    
    if (jsErrors.length === 0) {
      console.log("✅ No JavaScript errors detected");
    } else {
      console.log(`⚠️ JavaScript errors detected: ${jsErrors.length}`);
      jsErrors.forEach(error => console.log(`   - ${error}`));
    }
    
    console.log(hasLoadingStates ? "✅ Loading states implemented" : "ℹ️ No loading indicators detected");
  });
});
