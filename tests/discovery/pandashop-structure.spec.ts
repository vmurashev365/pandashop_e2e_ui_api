import { test, expect } from "@playwright/test";

/**
 * Pandashop.md Real API Structure Investigation
 * Based on robots.txt findings
 */
test.describe("Pandashop.md Real Structure", () => {
  const baseUrl = "https://www.pandashop.md";
  
  test("investigate sitemap handlers", async ({ page }) => {
    console.log("🔍 Investigating Pandashop.md sitemap handlers...");
    
    const sitemapUrls = [
      "/SitemapsProducts.ashx?lng=ru",
      "/SitemapsProducts.ashx?lng=ro", 
      "/SitemapsCategories.ashx?lng=ru",
      "/SitemapsCategories.ashx?lng=ro",
      "/SitemapsBrands.ashx?lng=ru",
      "/SitemapsBrands.ashx?lng=ro"
    ];
    
    for (const sitemapUrl of sitemapUrls) {
      try {
        console.log(`\n📋 Testing: ${sitemapUrl}`);
        
        const response = await page.request.get(`${baseUrl}${sitemapUrl}`);
        const status = response.status();
        const contentType = response.headers()["content-type"];
        
        console.log(`Status: ${status}, Content-Type: ${contentType}`);
        
        if (status === 200) {
          const content = await response.text();
          
          if (content.includes("<url>")) {
            // XML sitemap
            const urls = content.match(/<loc>(.*?)<\/loc>/g);
            console.log(`✅ Found ${urls?.length || 0} URLs in sitemap`);
            
            if (urls && urls.length > 0) {
              console.log("📄 Sample URLs:");
              urls.slice(0, 5).forEach((url, index) => {
                const cleanUrl = url.replace(/<\/?loc>/g, "");
                console.log(`  ${index + 1}. ${cleanUrl}`);
              });
            }
          } else {
            console.log("📄 Content sample:", content.substring(0, 200));
          }
        }
      } catch (error) {
        console.log(`❌ Error testing ${sitemapUrl}:`, (error as Error).message);
      }
    }
  });
  
  test("explore actual page structure", async ({ page }) => {
    console.log("🔍 Exploring actual page structure for API patterns...");
    
    // Идем на каталог электроники
    await page.goto(`${baseUrl}/ru/catalog/electronics/`);
    await page.waitForLoadState("networkidle");
    
    console.log("✅ Electronics catalog loaded");
    
    // Проверяем network requests
    const requests: string[] = [];
    
    page.on("request", (request) => {
      const url = request.url();
      requests.push(url);
      
      if (url.includes(".ashx") || url.includes("ajax") || url.includes("json")) {
        console.log("🌐 Interesting request:", url);
      }
    });
    
    // Ищем товары на странице
    const productLinks = await page.locator('a[href*="/product"], a[href*="/item"]').all();
    
    console.log(`📦 Found ${productLinks.length} product links`);
    
    if (productLinks.length > 0) {
      // Переходим на первый товар
      const firstProductHref = await productLinks[0].getAttribute("href");
      console.log(`🔗 First product: ${firstProductHref}`);
      
      if (firstProductHref) {
        await page.goto(`${baseUrl}${firstProductHref}`);
        await page.waitForLoadState("networkidle");
        console.log("✅ Product page loaded");
      }
    }
    
    // Ищем поиск
    const searchInput = page.locator('input[name*="search"], input[placeholder*="search"], input[placeholder*="поиск"]').first();
    
    if (await searchInput.count() > 0) {
      console.log("🔍 Found search input, testing search...");
      
      await searchInput.fill("телефон");
      await searchInput.press("Enter");
      
      await page.waitForLoadState("networkidle");
      console.log("✅ Search executed");
    }
    
    // Собираем все уникальные requests
    const uniqueRequests = [...new Set(requests)];
    
    console.log(`\n📊 Total unique requests: ${uniqueRequests.length}`);
    
    // Фильтруем интересные
    const interestingRequests = uniqueRequests.filter(url => 
      url.includes(".ashx") || 
      url.includes("ajax") || 
      url.includes("json") ||
      url.includes("api") ||
      url.includes("search") ||
      url.includes("catalog")
    );
    
    if (interestingRequests.length > 0) {
      console.log("\n🎯 Interesting requests found:");
      interestingRequests.forEach((url, index) => {
        console.log(`  ${index + 1}. ${url}`);
      });
    } else {
      console.log("\n❌ No interesting API-like requests found");
      console.log("💡 This appears to be a traditional server-rendered website");
    }
    
    expect(true).toBe(true);
  });
  
  test("check for common e-commerce handlers", async ({ page }) => {
    console.log("🔍 Testing common ASP.NET e-commerce handlers...");
    
    const commonHandlers = [
      "/handlers/search.ashx",
      "/handlers/products.ashx", 
      "/handlers/catalog.ashx",
      "/handlers/cart.ashx",
      "/handlers/autocomplete.ashx",
      "/search.ashx",
      "/products.ashx",
      "/catalog.ashx",
      "/api.ashx",
      "/ajax.ashx",
      "/data.ashx"
    ];
    
    for (const handler of commonHandlers) {
      try {
        console.log(`Testing: ${handler}`);
        
        const response = await page.request.get(`${baseUrl}${handler}`);
        const status = response.status();
        
        if (status !== 404) {
          console.log(`✅ ${handler} - Status: ${status}`);
          
          if (status === 200) {
            const content = await response.text();
            console.log(`📄 Content sample: ${content.substring(0, 100)}`);
          }
        } else {
          console.log(`❌ ${handler} - 404 Not Found`);
        }
      } catch (error) {
        console.log(`💥 ${handler} - Error: ${(error as Error).message}`);
      }
    }
    
    expect(true).toBe(true);
  });
});
