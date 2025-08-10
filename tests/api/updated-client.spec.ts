import { test, expect } from "@playwright/test";
import { PandashopAPIClient } from "./client/pandashop-api-client";

test.describe("Updated API Client Test", () => {
  let apiClient: PandashopAPIClient;

  test.beforeAll(() => {
    apiClient = new PandashopAPIClient();
  });

  test("should perform health check successfully", async () => {
    const health = await apiClient.healthCheck();
    
    expect(health.status).toBe("healthy");
    expect(health.responseTime).toBeGreaterThan(0);
    expect(health.timestamp).toBeTruthy();
    
    console.log("✅ Health check passed:", health);
  });

  test("should get products successfully", async () => {
    const response = await apiClient.getProducts({ limit: 3 });
    
    expect(response.products).toBeDefined();
    expect(response.products.length).toBeGreaterThan(0);
    expect(response.products.length).toBeLessThanOrEqual(3);
    
    const product = response.products[0];
    expect(product.id).toBeTruthy();
    expect(product.name).toBeTruthy();
    expect(product.price).toBeGreaterThan(0);
    expect(product.currency).toBe("MDL");
    
    console.log("✅ Products retrieved:", response.products.length);
    console.log("✅ Sample product:", product);
  });

  test("should search products with filters", async () => {
    const response = await apiClient.searchProducts({
      query: "a",
      limit: 2,
      priceMin: 100,
      priceMax: 800,
    });
    
    expect(response.products).toBeDefined();
    expect(response.products.length).toBeLessThanOrEqual(2);
    
    console.log("✅ Search results:", response.products.length);
  });

  test("should get categories", async () => {
    const categories = await apiClient.getCategories();
    
    expect(categories).toBeDefined();
    expect(categories.length).toBeGreaterThan(0);
    expect(categories).toContain("electronics");
    
    console.log("✅ Categories:", categories);
  });

  test("should handle cart operations", async () => {
    const cart = await apiClient.getCart();
    expect(cart.items).toBeDefined();
    expect(cart.total).toBe(0);
    
    const addResult = await apiClient.addToCart("test-product", 1);
    expect(addResult.success).toBe(true);
    
    console.log("✅ Cart operations work");
  });
});
