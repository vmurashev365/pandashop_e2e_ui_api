import { test, expect } from "@playwright/test";
import { WorkingPandashopAPIClient } from "./client/working-pandashop-api-client";
import { TestConfig } from "../shared/config/test-config";

test.describe("Working Pandashop API Client", () => {
  let apiClient: WorkingPandashopAPIClient;

  test.beforeAll(() => {
    apiClient = new WorkingPandashopAPIClient();
  });

  test("Health check should return healthy status", async () => {
    const health = await apiClient.healthCheck();
    
    expect(health.status).toBe("healthy");
    expect(health.responseTime).toBeGreaterThan(0);
    expect(health.responseTime).toBeLessThan(10000); // Less than 10 seconds
    expect(health.timestamp).toBeTruthy();
    
    console.log("✅ Health check:", health);
  });

  test("Should get products from sitemap", async () => {
    const result = await apiClient.getProducts({ limit: 5 });
    
    expect(result.data).toBeDefined();
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data.length).toBeLessThanOrEqual(5);
    
    // Check product structure
    const product = result.data[0];
    expect(product.id).toBeTruthy();
    expect(product.name).toBeTruthy();
    expect(product.price).toBeGreaterThan(0);
    expect(product.currency).toBe("MDL");
    expect(["available", "out_of_stock", "pre_order"]).toContain(product.availability);
    
    // Check pagination
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.limit).toBe(5);
    expect(result.pagination.total).toBeGreaterThan(0);
    
    console.log("✅ Products found:", result.data.length);
    console.log("✅ Sample product:", product);
  });

  test("Should get categories from sitemap", async () => {
    const categories = await apiClient.getCategories();
    
    expect(categories).toBeDefined();
    expect(categories.length).toBeGreaterThan(0);
    expect(categories[0]).toBeTruthy();
    
    console.log("✅ Categories found:", categories.length);
    console.log("✅ Sample categories:", categories.slice(0, 5));
  });

  test("Should search products with filters", async () => {
    const result = await apiClient.searchProducts({
      query: "a",
      limit: 3,
      priceMin: 100,
      priceMax: 500,
    });
    
    expect(result.data).toBeDefined();
    expect(result.data.length).toBeLessThanOrEqual(3);
    
    // Check that all products match price filter
    result.data.forEach((product: any) => {
      expect(product.price).toBeGreaterThanOrEqual(100);
      expect(product.price).toBeLessThanOrEqual(500);
    });
    
    console.log("✅ Search results:", result.data.length);
  });

  test("Should handle cart operations", async () => {
    const cart = await apiClient.getCart();
    expect(cart.items).toBeDefined();
    expect(cart.total).toBe(0);
    expect(cart.currency).toBe("MDL");
    
    const addResult = await apiClient.addToCart("test-product", 1);
    expect(addResult.success).toBe(true);
    expect(addResult.productId).toBe("test-product");
    expect(addResult.quantity).toBe(1);
    
    console.log("✅ Cart operations working");
  });

  test("Should get base URL", async () => {
    const baseUrl = apiClient.getBaseUrl();
    expect(baseUrl).toBe(TestConfig.baseUrl);
    
    console.log("✅ Base URL:", baseUrl);
  });

  test("Performance test - should complete operations under 5 seconds", async () => {
    const startTime = Date.now();
    
    // Run multiple operations
    await Promise.all([
      apiClient.healthCheck(),
      apiClient.getProducts({ limit: 3 }),
      apiClient.getCategories(),
      apiClient.getCart(),
    ]);
    
    const totalTime = Date.now() - startTime;
    expect(totalTime).toBeLessThan(5000); // Less than 5 seconds
    
    console.log("✅ Performance test completed in:", totalTime, "ms");
  });
});
