import { test, expect } from "@playwright/test";

/**
 * API Discovery Test Suite
 * Исследуем реальную структуру API Pandashop.md
 */
test.describe("API Discovery", () => {
  const baseUrl = "https://pandashop.md";
  
  test("explore main page and find API endpoints", async ({ page }) => {
    console.log("🔍 Exploring Pandashop.md structure...");
    
    // Переходим на главную страницу
    await page.goto(baseUrl);
    await expect(page).toHaveTitle(/.*PandaShop.*/i);
    
    console.log("✅ Main page loaded successfully");
    
    // Ищем AJAX запросы и API вызовы
    const apiCalls: string[] = [];
    
    page.on("request", (request) => {
      const url = request.url();
      if (url.includes("api") || url.includes("json") || url.includes("ajax")) {
        apiCalls.push(url);
        console.log("🌐 API Call detected:", url);
      }
    });
    
    // Взаимодействуем со страницей для обнаружения API вызовов
    await page.waitForTimeout(2000);
    
    // Пытаемся найти каталог товаров
    const catalogLinks = await page.locator('a[href*="catalog"], a[href*="produc"], a[href*="shop"]').all();
    
    if (catalogLinks.length > 0) {
      console.log(`📦 Found ${catalogLinks.length} potential catalog links`);
      
      for (let i = 0; i < Math.min(catalogLinks.length, 3); i++) {
        try {
          const href = await catalogLinks[i].getAttribute("href");
          console.log(`🔗 Catalog link ${i + 1}: ${href}`);
          
          if (href) {
            await catalogLinks[i].click();
            await page.waitForTimeout(1000);
            break;
          }
        } catch (error) {
          console.log(`⚠️ Could not click catalog link ${i + 1}`);
        }
      }
    }
    
    // Ищем формы поиска
    const searchInputs = await page.locator('input[type="search"], input[placeholder*="search"], input[placeholder*="поиск"]').all();
    
    if (searchInputs.length > 0) {
      console.log(`🔍 Found ${searchInputs.length} search inputs`);
      
      try {
        await searchInputs[0].fill("test");
        await searchInputs[0].press("Enter");
        await page.waitForTimeout(2000);
        console.log("✅ Search executed");
      } catch (error) {
        console.log("⚠️ Could not execute search");
      }
    }
    
    // Ждем и собираем все API вызовы
    await page.waitForTimeout(3000);
    
    console.log("\n📊 API Discovery Results:");
    console.log(`🌐 Total API calls detected: ${apiCalls.length}`);
    
    if (apiCalls.length > 0) {
      console.log("\n🔗 Detected API endpoints:");
      apiCalls.forEach((url, index) => {
        console.log(`  ${index + 1}. ${url}`);
      });
    } else {
      console.log("❌ No obvious API endpoints detected");
      console.log("💡 This might be a server-rendered site without AJAX APIs");
    }
    
    // Проверяем наличие JSON данных в исходном коде
    const content = await page.content();
    const jsonMatches = content.match(/\{[^{}]*"[^"]*":[^{}]*\}/g);
    
    if (jsonMatches && jsonMatches.length > 0) {
      console.log(`\n📋 Found ${jsonMatches.length} JSON-like structures in page source`);
      
      // Показываем первые несколько
      jsonMatches.slice(0, 3).forEach((json, index) => {
        if (json.length < 200) {
          console.log(`  ${index + 1}. ${json}`);
        }
      });
    }
    
    // Проверяем специфичные для e-commerce эндпоинты
    const commonEndpoints = [
      "/api/products",
      "/api/catalog", 
      "/api/search",
      "/products.json",
      "/catalog.json",
      "/api/v1/products",
      "/ajax/products",
      "/wp-json/wp/v2/product", // WordPress WooCommerce
    ];
    
    console.log("\n🔍 Testing common e-commerce endpoints:");
    
    for (const endpoint of commonEndpoints) {
      try {
        const response = await page.request.get(`${baseUrl}${endpoint}`);
        const status = response.status();
        
        if (status === 200) {
          console.log(`✅ ${endpoint} - Status: ${status} (FOUND!)`);
          
          // Проверяем, является ли ответ JSON
          const contentType = response.headers()["content-type"];
          if (contentType && contentType.includes("json")) {
            const data = await response.json();
            console.log(`📄 Content sample:`, JSON.stringify(data).substring(0, 100) + "...");
          }
        } else if (status === 404) {
          console.log(`❌ ${endpoint} - Status: ${status} (Not Found)`);
        } else {
          console.log(`⚠️ ${endpoint} - Status: ${status}`);
        }
      } catch (error) {
        console.log(`💥 ${endpoint} - Error: ${error.message}`);
      }
    }
    
    expect(true).toBe(true); // Тест всегда проходит, он для исследования
  });
  
  test("check robots.txt and sitemap for API hints", async ({ page }) => {
    console.log("\n🤖 Checking robots.txt for API hints...");
    
    try {
      await page.goto(`${baseUrl}/robots.txt`);
      const content = await page.textContent("body");
      
      if (content) {
        console.log("📄 robots.txt content:");
        console.log(content);
        
        // Ищем упоминания API
        if (content.includes("api")) {
          console.log("✅ Found API references in robots.txt");
        }
      }
    } catch (error) {
      console.log("❌ Could not fetch robots.txt");
    }
    
    console.log("\n🗺️ Checking sitemap for API hints...");
    
    const sitemapUrls = [
      "/sitemap.xml",
      "/sitemap_index.xml", 
      "/wp-sitemap.xml"
    ];
    
    for (const sitemapUrl of sitemapUrls) {
      try {
        await page.goto(`${baseUrl}${sitemapUrl}`);
        const content = await page.textContent("body");
        
        if (content && content.includes("<url")) {
          console.log(`✅ Found sitemap at: ${sitemapUrl}`);
          
          // Ищем API-подобные URLs
          const apiUrls = content.match(/https?:\/\/[^<]*api[^<]*/gi);
          if (apiUrls) {
            console.log("🔗 API-like URLs in sitemap:");
            apiUrls.slice(0, 5).forEach(url => console.log(`  - ${url}`));
          }
          break;
        }
      } catch (error) {
        console.log(`❌ Could not fetch ${sitemapUrl}`);
      }
    }
    
    expect(true).toBe(true);
  });
});
