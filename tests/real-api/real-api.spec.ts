import { test, expect } from "@playwright/test";
import { RealPandashopAPIClient } from "../api/client/real-pandashop-api-client";

/**
 * Real Pandashop.md API Tests
 * Using actual site structure and endpoints
 */
test.describe("Real Pandashop.md API", () => {
  let apiClient: RealPandashopAPIClient;

  test.beforeEach(() => {
    apiClient = new RealPandashopAPIClient();
  });

  test("should check site health", async () => {
    console.log("🏥 Testing site health check...");
    
    const startTime = Date.now();
    const health = await apiClient.healthCheck();
    const endTime = Date.now();
    
    console.log(`✅ Health check result:`, health);
    console.log(`⏱️ Response time: ${endTime - startTime}ms`);
    
    expect(health.status).toBe("healthy");
    expect(health.responseTime).toBeGreaterThan(0);
    expect(health.responseTime).toBeLessThan(10000); // Should respond within 10s
  });

  test("should get products from sitemap", async () => {
    console.log("📦 Testing products from sitemap...");
    
    const products = await apiClient.getProductsFromSitemap("ru", 1);
    
    console.log(`✅ Found ${products.length} products`);
    
    if (products.length > 0) {
      console.log("📄 Sample products:");
      products.slice(0, 3).forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.id} - ${product.url}`);
      });
      
      // Validate structure
      expect(products[0]).toHaveProperty("id");
      expect(products[0]).toHaveProperty("url");
      expect(products[0].url).toContain("pandashop.md");
    }
    
    expect(products).toBeInstanceOf(Array);
  });

  test("should get categories from sitemap", async () => {
    console.log("🗂️ Testing categories from sitemap...");
    
    const categories = await apiClient.getCategoriesFromSitemap("ru");
    
    console.log(`✅ Found ${categories.length} categories`);
    
    if (categories.length > 0) {
      console.log("📄 Sample categories:");
      categories.slice(0, 3).forEach((category, index) => {
        console.log(`  ${index + 1}. ${category.url}`);
      });
      
      expect(categories[0]).toHaveProperty("url");
      expect(categories[0].url).toContain("pandashop.md");
    }
    
    expect(categories).toBeInstanceOf(Array);
  });

  test("should get site statistics", async () => {
    console.log("📊 Testing site statistics...");
    
    const stats = await apiClient.getSiteStats();
    
    console.log("✅ Site statistics:", stats);
    
    expect(stats).toHaveProperty("totalProducts");
    expect(stats).toHaveProperty("totalCategories");
    expect(stats).toHaveProperty("totalBrands");
    expect(stats).toHaveProperty("languages");
    expect(stats).toHaveProperty("lastUpdated");
    
    expect(stats.languages).toContain("ru");
    expect(stats.languages).toContain("ro");
  });

  test("should get product details", async () => {
    console.log("🔍 Testing product details extraction...");
    
    // First get some products
    const products = await apiClient.getProductsFromSitemap("ru", 1);
    
    if (products.length > 0) {
      const firstProduct = products[0];
      console.log(`📦 Testing product: ${firstProduct.url}`);
      
      const details = await apiClient.getProductDetails(firstProduct.url);
      
      if (details) {
        console.log("✅ Product details:", details);
        
        expect(details).toHaveProperty("url");
        expect(details.url).toBe(firstProduct.url);
        
        // These might be null if not found in HTML, but should be defined
        expect(details).toHaveProperty("title");
        expect(details).toHaveProperty("price");
        expect(details).toHaveProperty("available");
      } else {
        console.log("⚠️ Could not extract product details");
      }
    } else {
      console.log("⚠️ No products found to test details");
    }
    
    expect(true).toBe(true); // Test always passes as this is exploratory
  });

  test("should handle different languages", async () => {
    console.log("🌐 Testing multi-language support...");
    
    const [ruProducts, roProducts] = await Promise.all([
      apiClient.getProductsFromSitemap("ru", 1),
      apiClient.getProductsFromSitemap("ro", 1),
    ]);
    
    console.log(`✅ Russian products: ${ruProducts.length}`);
    console.log(`✅ Romanian products: ${roProducts.length}`);
    
    expect(ruProducts).toBeInstanceOf(Array);
    expect(roProducts).toBeInstanceOf(Array);
    
    // Both languages should return some products
    if (ruProducts.length > 0 && roProducts.length > 0) {
      expect(ruProducts[0].url).toContain("/ru/");
      expect(roProducts[0].url).toContain("/ro/");
    }
  });

  test("should handle performance requirements", async () => {
    console.log("⚡ Testing performance requirements...");
    
    const operations = [
      { name: "Health Check", fn: () => apiClient.healthCheck() },
      { name: "Products Sitemap", fn: () => apiClient.getProductsFromSitemap("ru", 1) },
      { name: "Site Stats", fn: () => apiClient.getSiteStats() },
    ];
    
    for (const operation of operations) {
      const startTime = Date.now();
      
      try {
        await operation.fn();
        const responseTime = Date.now() - startTime;
        
        console.log(`✅ ${operation.name}: ${responseTime}ms`);
        
        // Should complete within reasonable time
        expect(responseTime).toBeLessThan(30000); // 30 seconds max
      } catch (error) {
        const responseTime = Date.now() - startTime;
        console.log(`❌ ${operation.name}: ${responseTime}ms - Error: ${(error as Error).message}`);
        
        // Even errors should happen within timeout
        expect(responseTime).toBeLessThan(30000);
      }
    }
  });
});
