import { test, expect } from "@playwright/test";
import { apiClient } from "../client/pandashop-api-client";

/**
 * API Performance Tests
 * Tests to verify API performance meets SLA requirements
 */

test.describe("API Performance Tests", () => {
  const PERFORMANCE_THRESHOLDS = {
    FAST: 500, // Fast operations (health checks, simple gets)
    NORMAL: 2000, // Normal operations (product lists, searches)
    SLOW: 5000, // Slow operations (complex searches, reports)
  };

  test.describe("Response Time SLA Tests", () => {
    test("health check should respond under 500ms", async () => {
      const startTime = Date.now();

      await apiClient.healthCheck();

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.FAST);
    });

    test("product list should respond under 2s", async () => {
      const startTime = Date.now();

      await apiClient.getProducts({ limit: 20 });

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.NORMAL);
    });

    test("single product should respond under 1s", async () => {
      // Get a product ID first
      const products = await apiClient.getProducts({ limit: 1 });
      if (products.data.length === 0) {
        test.skip("No products available");
      }

      const productId = products.data[0].id;
      const startTime = Date.now();

      await apiClient.getProduct(productId);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1000);
    });

    test("search should respond under 3s", async () => {
      const startTime = Date.now();

      await apiClient.searchProducts({
        query: "телефон",
        limit: 20,
      });

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(3000);
    });

    test("categories should respond under 1s", async () => {
      const startTime = Date.now();

      await apiClient.getCategories();

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1000);
    });

    test("cart operations should respond under 2s", async () => {
      const products = await apiClient.getProducts({ limit: 1 });
      if (products.data.length === 0) {
        test.skip("No products available");
      }

      const productId = products.data[0].id;

      // Test cart creation
      let startTime = Date.now();
      const cart = await apiClient.getCart();
      let responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.NORMAL);

      // Test add to cart
      startTime = Date.now();
      await apiClient.addToCart(productId, 1);
      responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.NORMAL);
    });
  });

  test.describe("Load Testing", () => {
    test("should handle 10 concurrent product requests", async () => {
      const startTime = Date.now();

      const promises = Array.from({ length: 10 }, () =>
        apiClient.getProducts({ limit: 10 }),
      );

      const results = await Promise.all(promises);

      const totalTime = Date.now() - startTime;
      const avgTime = totalTime / 10;

      // All requests should succeed
      expect(results.length).toBe(10);
      results.forEach((result) => {
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
      });

      // Average response time should be reasonable
      expect(avgTime).toBeLessThan(PERFORMANCE_THRESHOLDS.NORMAL);
    });

    test("should handle 5 concurrent search requests", async () => {
      const searchQueries = [
        "телефон",
        "ноутбук",
        "планшет",
        "наушники",
        "клавиатура",
      ];

      const startTime = Date.now();

      const promises = searchQueries.map((query) =>
        apiClient.searchProducts({ query, limit: 10 }),
      );

      const results = await Promise.all(promises);

      const totalTime = Date.now() - startTime;
      const avgTime = totalTime / searchQueries.length;

      // All searches should succeed
      expect(results.length).toBe(searchQueries.length);
      results.forEach((result, index) => {
        expect(result.searchQuery).toBe(searchQueries[index]);
        expect(result.data).toBeDefined();
      });

      // Average response time should be acceptable
      expect(avgTime).toBeLessThan(4000); // Slightly higher for search
    });

    test("should handle concurrent cart operations", async () => {
      const products = await apiClient.getProducts({ limit: 3 });
      if (products.data.length < 3) {
        test.skip("Need at least 3 products for concurrent cart test");
      }

      const startTime = Date.now();

      // Simulate concurrent cart operations
      const promises = products.data.map((product) =>
        apiClient.addToCart(product.id, 1),
      );

      const results = await Promise.all(promises);

      const totalTime = Date.now() - startTime;

      // All operations should succeed
      expect(results.length).toBe(3);
      results.forEach((cart) => {
        expect(cart.items.length).toBeGreaterThan(0);
      });

      // Total time should be reasonable
      expect(totalTime).toBeLessThan(6000);
    });
  });

  test.describe("Scalability Tests", () => {
    test("should handle large product list requests", async () => {
      const startTime = Date.now();

      const result = await apiClient.getProducts({
        limit: 100,
        page: 1,
      });

      const responseTime = Date.now() - startTime;

      expect(result.data.length).toBeLessThanOrEqual(100);
      expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.SLOW);
    });

    test("should handle complex search with filters", async () => {
      const startTime = Date.now();

      await apiClient.searchProducts({
        query: "смартфон",
        priceMin: 100,
        priceMax: 1000,
        categoryId: "electronics",
        availability: "available",
        limit: 50,
      });

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.SLOW);
    });

    test("should handle deep pagination efficiently", async () => {
      const pageTests = [1, 5, 10, 20];

      for (const page of pageTests) {
        const startTime = Date.now();

        const result = await apiClient.getProducts({
          page,
          limit: 20,
        });

        const responseTime = Date.now() - startTime;

        expect(result.pagination.page).toBe(page);
        expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.NORMAL);

        // Performance shouldn't degrade significantly with deeper pages
        if (page <= 10) {
          expect(responseTime).toBeLessThan(3000);
        }
      }
    });
  });

  test.describe("Memory and Resource Tests", () => {
    test("should handle rapid sequential requests", async () => {
      const requestCount = 20;
      const results: number[] = [];

      for (let i = 0; i < requestCount; i++) {
        const startTime = Date.now();

        await apiClient.getProducts({ limit: 10 });

        const responseTime = Date.now() - startTime;
        results.push(responseTime);

        // Small delay to prevent overwhelming
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      // Calculate statistics
      const avgTime =
        results.reduce((sum, time) => sum + time, 0) / results.length;
      const maxTime = Math.max(...results);
      const minTime = Math.min(...results);

      // Performance should remain consistent
      expect(avgTime).toBeLessThan(PERFORMANCE_THRESHOLDS.NORMAL);
      expect(maxTime).toBeLessThan(PERFORMANCE_THRESHOLDS.SLOW);

      // No significant performance degradation
      const variance =
        results.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) /
        results.length;
      const stdDev = Math.sqrt(variance);
      expect(stdDev).toBeLessThan(avgTime * 0.5); // Standard deviation < 50% of average
    });

    test("should handle large response payloads", async () => {
      const startTime = Date.now();

      // Request maximum allowed items
      const result = await apiClient.getProducts({
        limit: 100,
        includeDetails: true, // If API supports detailed responses
      });

      const responseTime = Date.now() - startTime;

      expect(result.data.length).toBeGreaterThan(0);
      expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.SLOW);

      // Verify response size is reasonable
      const responseSize = JSON.stringify(result).length;
      expect(responseSize).toBeLessThan(5 * 1024 * 1024); // < 5MB
    });
  });

  test.describe("Edge Case Performance", () => {
    test("should handle empty search results quickly", async () => {
      const startTime = Date.now();

      await apiClient.searchProducts({
        query: "nonexistentproductxyz123",
      });

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1000); // Should be faster than normal search
    });

    test("should handle invalid requests efficiently", async () => {
      const invalidRequests = [
        () => apiClient.getProduct("invalid-id"),
        () => apiClient.getProducts({ page: -1 }),
        () => apiClient.searchProducts({ query: "" }),
      ];

      for (const request of invalidRequests) {
        const startTime = Date.now();

        try {
          await request();
        } catch (error) {
          // Expected to fail
        }

        const responseTime = Date.now() - startTime;
        expect(responseTime).toBeLessThan(2000); // Error responses should be fast
      }
    });

    test("should handle timeout scenarios gracefully", async () => {
      // Test with very short timeout to simulate slow network
      const originalTimeout = apiClient["client"].defaults.timeout;

      try {
        // Set very short timeout
        apiClient["client"].defaults.timeout = 100;

        const startTime = Date.now();

        try {
          await apiClient.getProducts();
        } catch (error) {
          const responseTime = Date.now() - startTime;

          // Should timeout quickly and not hang
          expect(responseTime).toBeLessThan(1000);
          expect(error.code || error.message).toContain("timeout");
        }
      } finally {
        // Restore original timeout
        apiClient["client"].defaults.timeout = originalTimeout;
      }
    });
  });

  test.describe("Performance Monitoring", () => {
    test("should track and report performance metrics", async () => {
      const operations = [
        { name: "health", fn: () => apiClient.healthCheck() },
        { name: "products", fn: () => apiClient.getProducts({ limit: 20 }) },
        {
          name: "search",
          fn: () => apiClient.searchProducts({ query: "test" }),
        },
        { name: "categories", fn: () => apiClient.getCategories() },
      ];

      const metrics: Record<
        string,
        { min: number; max: number; avg: number; count: number }
      > = {};

      // Run each operation multiple times
      for (const operation of operations) {
        const times: number[] = [];

        for (let i = 0; i < 5; i++) {
          const startTime = Date.now();

          try {
            await operation.fn();
            times.push(Date.now() - startTime);
          } catch (error) {
            // Skip failed requests for performance measurement
          }

          // Small delay between requests
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        if (times.length > 0) {
          metrics[operation.name] = {
            min: Math.min(...times),
            max: Math.max(...times),
            avg: times.reduce((sum, time) => sum + time, 0) / times.length,
            count: times.length,
          };
        }
      }

      // Log performance metrics for monitoring
      console.log("Performance Metrics:", JSON.stringify(metrics, null, 2));

      // Verify all operations meet performance requirements
      Object.entries(metrics).forEach(([operation, metric]) => {
        expect(metric.avg).toBeLessThan(PERFORMANCE_THRESHOLDS.NORMAL);
        expect(metric.max).toBeLessThan(PERFORMANCE_THRESHOLDS.SLOW);
      });
    });
  });
});
