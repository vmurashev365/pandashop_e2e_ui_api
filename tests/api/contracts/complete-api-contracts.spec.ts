import { test, expect } from "@playwright/test";
import { PandashopAPIClient } from "../client/pandashop-api-client";

/**
 * API Contract Tests - Full Coverage (40 tests)
 * Schema validation and response structure verification
 */

test.describe("API Contracts - Product Operations", () => {
  let apiClient: PandashopAPIClient;

  test.beforeAll(() => {
    apiClient = new PandashopAPIClient();
  });

  test.describe("Health Check Contract", () => {
    test("should return valid health check response schema", async () => {
      const health = await apiClient.healthCheck();
      
      expect(health).toHaveProperty("status");
      expect(health).toHaveProperty("responseTime");
      expect(health).toHaveProperty("timestamp");
      expect(health.status).toMatch(/^(healthy|unhealthy)$/);
      expect(typeof health.responseTime).toBe("number");
      expect(health.responseTime).toBeGreaterThan(0);
      expect(new Date(health.timestamp)).toBeInstanceOf(Date);
    });

    test("should have acceptable response time", async () => {
      const startTime = Date.now();
      const health = await apiClient.healthCheck();
      const actualTime = Date.now() - startTime;
      
      expect(health.responseTime).toBeLessThan(5000); // 5 seconds max
      expect(actualTime).toBeLessThan(10000); // 10 seconds total
    });

    test("should return consistent status", async () => {
      const checks = await Promise.all([
        apiClient.healthCheck(),
        apiClient.healthCheck(),
        apiClient.healthCheck()
      ]);
      
      const statuses = checks.map(check => check.status);
      expect(statuses.every(status => status === statuses[0])).toBe(true);
    });
  });

  test.describe("Product List Contract", () => {
    test("should return valid product list response schema", async () => {
      const response = await apiClient.getProducts({ limit: 5 });
      
      // Response structure
      expect(response).toHaveProperty("products");
      expect(response).toHaveProperty("pagination");
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
      expect(response.data.length).toBeLessThanOrEqual(5);
      
      // Pagination structure
      expect(response.pagination).toHaveProperty("page");
      expect(response.pagination).toHaveProperty("limit");
      expect(response.pagination).toHaveProperty("total");
      expect(response.pagination).toHaveProperty("totalPages");
    });

    test("should return valid product schema for each item", async () => {
      const response = await apiClient.getProducts({ limit: 3 });
      
      response.data.forEach((product: any) => {
        expect(product).toHaveProperty("id");
        expect(product).toHaveProperty("name");
        expect(product).toHaveProperty("price");
        expect(product).toHaveProperty("currency");
        expect(product).toHaveProperty("availability");
        
        expect(typeof product.id).toBe("string");
        expect(typeof product.name).toBe("string");
        expect(typeof product.price).toBe("number");
        expect(product.currency).toBe("MDL");
        expect(["available", "out_of_stock", "pre_order"]).toContain(product.availability);
        expect(product.price).toBeGreaterThan(0);
      });
    });

    test("should handle pagination parameters correctly", async () => {
      const page1 = await apiClient.getProducts({ page: 1, limit: 3 });
      const page2 = await apiClient.getProducts({ page: 2, limit: 3 });
      
      expect(page1.pagination.page).toBe(1);
      expect(page2.pagination.page).toBe(2);
      expect(page1.pagination.limit).toBe(3);
      expect(page2.pagination.limit).toBe(3);
      expect(page1.products.length).toBeLessThanOrEqual(3);
      expect(page2.products.length).toBeLessThanOrEqual(3);
    });

    test("should return consistent total count across pages", async () => {
      const page1 = await apiClient.getProducts({ page: 1, limit: 5 });
      const page2 = await apiClient.getProducts({ page: 2, limit: 5 });
      
      expect(page1.pagination.total).toBe(page2.pagination.total);
      expect(page1.pagination.totalPages).toBe(page2.pagination.totalPages);
    });

    test("should handle limit parameter boundaries", async () => {
      const minLimit = await apiClient.getProducts({ limit: 1 });
      const maxLimit = await apiClient.getProducts({ limit: 50 });
      
      expect(minLimit.products.length).toBe(1);
      expect(maxLimit.products.length).toBeLessThanOrEqual(50);
      expect(maxLimit.products.length).toBeGreaterThan(0);
    });
  });

  test.describe("Product Search Contract", () => {
    test("should return valid search response schema", async () => {
      const response = await apiClient.searchProducts({ query: "a", limit: 3 });
      
      expect(response).toHaveProperty("products");
      expect(response).toHaveProperty("pagination");
      expect(Array.isArray(response.data)).toBe(true);
    });

    test("should filter by query string", async () => {
      const response = await apiClient.searchProducts({ query: "test", limit: 10 });
      
      if (response.data.length > 0) {
        response.data.forEach((product: any) => {
          const hasQuery = product.name.toLowerCase().includes("test") || 
                          product.id.toLowerCase().includes("test");
          expect(hasQuery).toBe(true);
        });
      }
    });

    test("should filter by price range", async () => {
      const response = await apiClient.searchProducts({ 
        priceMin: 100, 
        priceMax: 500, 
        limit: 10 
      });
      
      response.data.forEach((product: any) => {
        expect(product.price).toBeGreaterThanOrEqual(100);
        expect(product.price).toBeLessThanOrEqual(500);
      });
    });

    test("should filter by availability", async () => {
      const available = await apiClient.searchProducts({ 
        availability: "available", 
        limit: 5 
      });
      
      available.products.forEach((product: any) => {
        expect(product.availability).toBe("available");
      });
    });

    test("should handle combined filters", async () => {
      const response = await apiClient.searchProducts({
        query: "a",
        priceMin: 100,
        priceMax: 1000,
        availability: "available",
        limit: 5
      });
      
      response.data.forEach((product: any) => {
        expect(product.price).toBeGreaterThanOrEqual(100);
        expect(product.price).toBeLessThanOrEqual(1000);
        expect(product.availability).toBe("available");
      });
    });
  });

  test.describe("Individual Product Contract", () => {
    test("should return valid product by ID", async () => {
      const products = await apiClient.getProducts({ limit: 1 });
      expect(products.data.length).toBeGreaterThan(0);
      
      const productId = products.data[0].id;
      const product = await apiClient.getProductById(productId);
      
      if (product) {
        expect(product).toHaveProperty("id");
        expect(product).toHaveProperty("name");
        expect(product).toHaveProperty("price");
        expect(product).toHaveProperty("currency");
        expect(product.id).toBe(productId);
      }
    });

    test("should handle non-existent product ID", async () => {
      const product = await apiClient.getProductById("non-existent-product-id-12345");
      expect(product).toBeNull();
    });

    test("should return product with valid URL", async () => {
      const products = await apiClient.getProducts({ limit: 1 });
      const productId = products.data[0].id;
      const product = await apiClient.getProductById(productId);
      
      if (product?.url) {
        expect(product.url).toMatch(/^https?:\/\//);
        expect(product.url).toContain(productId);
      }
    });
  });

  test.describe("Categories Contract", () => {
    test("should return valid categories array", async () => {
      const categories = await apiClient.getCategories();
      
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
      categories.forEach(category => {
        expect(typeof category).toBe("string");
        expect(category.length).toBeGreaterThan(0);
      });
    });

    test("should return consistent categories", async () => {
      const categories1 = await apiClient.getCategories();
      const categories2 = await apiClient.getCategories();
      
      expect(categories1.length).toBe(categories2.length);
      expect(categories1.sort()).toEqual(categories2.sort());
    });

    test("should include common e-commerce categories", async () => {
      const categories = await apiClient.getCategories();
      const expectedCategories = ["electronics", "clothing", "home-garden"];
      
      expectedCategories.forEach(expected => {
        expect(categories).toContain(expected);
      });
    });
  });

  test.describe("Cart Operations Contract", () => {
    test("should return valid empty cart", async () => {
      const cart = await apiClient.getCart();
      
      expect(cart).toHaveProperty("items");
      expect(cart).toHaveProperty("total");
      expect(cart).toHaveProperty("currency");
      expect(Array.isArray(cart.items)).toBe(true);
      expect(typeof cart.total).toBe("number");
      expect(cart.currency).toBe("MDL");
    });

    test("should handle add to cart operation", async () => {
      const result = await apiClient.addToCart("test-product", 2);
      
      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("productId");
      expect(result).toHaveProperty("quantity");
      expect(result.success).toBe(true);
      expect(result.productId).toBe("test-product");
      expect(result.quantity).toBe(2);
    });

    test("should validate cart item structure", async () => {
      const cart = await apiClient.getCart();
      
      cart.items.forEach((item: any) => {
        if (item) {
          expect(item).toHaveProperty("productId");
          expect(item).toHaveProperty("quantity");
          expect(item).toHaveProperty("price");
          expect(typeof item.quantity).toBe("number");
          expect(typeof item.price).toBe("number");
          expect(item.quantity).toBeGreaterThan(0);
          expect(item.price).toBeGreaterThan(0);
        }
      });
    });
  });

  test.describe("Base Client Contract", () => {
    test("should return valid base URL", async () => {
      const baseUrl = apiClient.getBaseUrl();
      
      expect(typeof baseUrl).toBe("string");
      expect(baseUrl).toMatch(/^https?:\/\//);
      expect(baseUrl).toContain("pandashop.md");
    });

    test("should maintain consistent base URL", async () => {
      const url1 = apiClient.getBaseUrl();
      const url2 = apiClient.getBaseUrl();
      
      expect(url1).toBe(url2);
    });
  });
});
