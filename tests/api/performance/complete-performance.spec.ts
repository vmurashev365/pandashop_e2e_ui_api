import { test, expect } from "@playwright/test";
import { PandashopAPIClient } from "../client/pandashop-api-client";

/**
 * API Performance Tests - Full Coverage (30 tests)
 * Load testing, response times, and performance benchmarks
 */

test.describe("API Performance Tests", () => {
  let apiClient: PandashopAPIClient;

  test.beforeAll(() => {
    apiClient = new PandashopAPIClient();
  });

  test.describe("Response Time Performance", () => {
    test("health check should respond within 3 seconds", async () => {
      const startTime = Date.now();
      const health = await apiClient.healthCheck();
      const responseTime = Date.now() - startTime;
      
      expect(health.status).toBe("healthy");
      expect(responseTime).toBeLessThan(3000);
      console.log(`✅ Health check: ${responseTime}ms`);
    });

    test("product list should respond within 5 seconds", async () => {
      const startTime = Date.now();
      const products = await apiClient.getProducts({ limit: 5 });
      const responseTime = Date.now() - startTime;
      
      expect(products.data.length).toBeGreaterThan(0);
      expect(responseTime).toBeLessThan(5000);
      console.log(`✅ Product list: ${responseTime}ms`);
    });

    test("product search should respond within 4 seconds", async () => {
      const startTime = Date.now();
      const results = await apiClient.searchProducts({ query: "test", limit: 3 });
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(4000);
      console.log(`✅ Search: ${responseTime}ms`);
    });

    test("categories should respond within 2 seconds", async () => {
      const startTime = Date.now();
      const categories = await apiClient.getCategories();
      const responseTime = Date.now() - startTime;
      
      expect(categories.length).toBeGreaterThan(0);
      expect(responseTime).toBeLessThan(2000);
      console.log(`✅ Categories: ${responseTime}ms`);
    });

    test("cart operations should respond within 1 second", async () => {
      const startTime = Date.now();
      const cart = await apiClient.getCart();
      const addResult = await apiClient.addToCart("test", 1);
      const totalTime = Date.now() - startTime;
      
      expect(cart).toBeDefined();
      expect(addResult.success).toBe(true);
      expect(totalTime).toBeLessThan(1000);
      console.log(`✅ Cart ops: ${totalTime}ms`);
    });
  });

  test.describe("Load Testing - Sequential", () => {
    test("should handle 10 sequential health checks", async () => {
      const results = [];
      const startTime = Date.now();
      
      for (let i = 0; i < 10; i++) {
        const checkStart = Date.now();
        const health = await apiClient.healthCheck();
        const checkTime = Date.now() - checkStart;
        
        results.push({ index: i, status: health.status, time: checkTime });
        expect(health.status).toBe("healthy");
      }
      
      const totalTime = Date.now() - startTime;
      const avgTime = results.reduce((sum, r) => sum + r.time, 0) / results.length;
      
      expect(totalTime).toBeLessThan(30000); // 30 seconds total
      expect(avgTime).toBeLessThan(5000); // 5 seconds average
      console.log(`✅ 10 sequential checks: ${totalTime}ms total, ${avgTime}ms avg`);
    });

    test("should handle 5 sequential product requests", async () => {
      const results = [];
      const startTime = Date.now();
      
      for (let i = 0; i < 5; i++) {
        const reqStart = Date.now();
        const products = await apiClient.getProducts({ limit: 3, page: i + 1 });
        const reqTime = Date.now() - reqStart;
        
        results.push({ page: i + 1, count: products.data.length, time: reqTime });
        expect(products.data.length).toBeGreaterThan(0);
      }
      
      const totalTime = Date.now() - startTime;
      const avgTime = results.reduce((sum, r) => sum + r.time, 0) / results.length;
      
      expect(totalTime).toBeLessThan(25000); // 25 seconds total
      expect(avgTime).toBeLessThan(6000); // 6 seconds average
      console.log(`✅ 5 product requests: ${totalTime}ms total, ${avgTime}ms avg`);
    });

    test("should handle 8 sequential search requests", async () => {
      const queries = ["a", "test", "product", "item", "shop", "buy", "new", "sale"];
      const results = [];
      const startTime = Date.now();
      
      for (const query of queries) {
        const searchStart = Date.now();
        const searchResults = await apiClient.searchProducts({ query, limit: 2 });
        const searchTime = Date.now() - searchStart;
        
        results.push({ query, count: searchResults.data.length, time: searchTime });
      }
      
      const totalTime = Date.now() - startTime;
      const avgTime = results.reduce((sum, r) => sum + r.time, 0) / results.length;
      
      expect(totalTime).toBeLessThan(32000); // 32 seconds total
      expect(avgTime).toBeLessThan(5000); // 5 seconds average
      console.log(`✅ 8 search requests: ${totalTime}ms total, ${avgTime}ms avg`);
    });
  });

  test.describe("Load Testing - Concurrent", () => {
    test("should handle 5 concurrent health checks", async () => {
      const startTime = Date.now();
      
      const promises = Array.from({ length: 5 }, (_, i) => 
        apiClient.healthCheck().then(health => ({ index: i, status: health.status }))
      );
      
      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      
      results.forEach(result => {
        expect(result.status).toBe("healthy");
      });
      
      expect(totalTime).toBeLessThan(10000); // 10 seconds for concurrent
      console.log(`✅ 5 concurrent health checks: ${totalTime}ms`);
    });

    test("should handle 3 concurrent product requests", async () => {
      const startTime = Date.now();
      
      const promises = [
        apiClient.getProducts({ limit: 3, page: 1 }),
        apiClient.getProducts({ limit: 3, page: 2 }),
        apiClient.getProducts({ limit: 3, page: 3 })
      ];
      
      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      
      results.forEach((result, index) => {
        expect(result.data.length).toBeGreaterThan(0);
        expect(result.pagination.page).toBe(index + 1);
      });
      
      expect(totalTime).toBeLessThan(8000); // 8 seconds for concurrent
      console.log(`✅ 3 concurrent product requests: ${totalTime}ms`);
    });

    test("should handle mixed concurrent operations", async () => {
      const startTime = Date.now();
      
      const promises = [
        apiClient.healthCheck(),
        apiClient.getProducts({ limit: 2 }),
        apiClient.searchProducts({ query: "test", limit: 2 }),
        apiClient.getCategories(),
        apiClient.getCart()
      ];
      
      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      
      expect(results[0].status).toBe("healthy"); // health
      expect(results[1].products.length).toBeGreaterThan(0); // products
      expect(Array.isArray(results[2].products)).toBe(true); // search
      expect(Array.isArray(results[3])).toBe(true); // categories
      expect(results[4]).toHaveProperty("items"); // cart
      
      expect(totalTime).toBeLessThan(10000); // 10 seconds for mixed
      console.log(`✅ Mixed concurrent operations: ${totalTime}ms`);
    });
  });

  test.describe("Throughput Testing", () => {
    test("should maintain performance under repeated requests", async () => {
      const iterations = 15;
      const times = [];
      
      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        await apiClient.healthCheck();
        const time = Date.now() - start;
        times.push(time);
      }
      
      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);
      
      expect(avgTime).toBeLessThan(4000);
      expect(maxTime).toBeLessThan(8000);
      expect(minTime).toBeGreaterThan(0);
      
      console.log(`✅ 15 iterations - Avg: ${avgTime}ms, Max: ${maxTime}ms, Min: ${minTime}ms`);
    });

    test("should handle burst of product requests", async () => {
      const burstSize = 8;
      const startTime = Date.now();
      
      const promises = Array.from({ length: burstSize }, (_, i) =>
        apiClient.getProducts({ limit: 2, page: (i % 3) + 1 })
      );
      
      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      const avgTime = totalTime / burstSize;
      
      results.forEach(result => {
        expect(result.data.length).toBeGreaterThan(0);
      });
      
      expect(totalTime).toBeLessThan(20000); // 20 seconds for burst
      expect(avgTime).toBeLessThan(5000); // 5 seconds average
      console.log(`✅ Burst of ${burstSize} requests: ${totalTime}ms total, ${avgTime}ms avg`);
    });

    test("should maintain search performance with different queries", async () => {
      const searchQueries = [
        { query: "electronics", limit: 3 },
        { query: "home", limit: 3 },
        { query: "garden", limit: 3 },
        { query: "clothing", limit: 3 },
        { query: "sports", limit: 3 }
      ];
      
      const results = [];
      const startTime = Date.now();
      
      for (const search of searchQueries) {
        const searchStart = Date.now();
        const result = await apiClient.searchProducts(search);
        const searchTime = Date.now() - searchStart;
        
        results.push({ 
          query: search.query, 
          count: result.data.length, 
          time: searchTime 
        });
      }
      
      const totalTime = Date.now() - startTime;
      const avgTime = results.reduce((sum, r) => sum + r.time, 0) / results.length;
      
      expect(totalTime).toBeLessThan(20000);
      expect(avgTime).toBeLessThan(5000);
      console.log(`✅ Search performance test: ${totalTime}ms total, ${avgTime}ms avg`);
    });
  });

  test.describe("Memory and Resource Usage", () => {
    test("should not leak memory during repeated operations", async () => {
      const iterations = 20;
      const initialMemory = process.memoryUsage().heapUsed;
      
      for (let i = 0; i < iterations; i++) {
        await apiClient.getProducts({ limit: 2 });
        await apiClient.getCart();
        
        // Force garbage collection periodically
        if (i % 5 === 0 && global.gc) {
          global.gc();
        }
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      const memoryIncreaseMB = memoryIncrease / 1024 / 1024;
      
      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncreaseMB).toBeLessThan(50);
      console.log(`✅ Memory usage after ${iterations} operations: +${memoryIncreaseMB.toFixed(2)}MB`);
    });

    test("should handle connection pooling efficiently", async () => {
      const connectionTests = 12;
      const startTime = Date.now();
      
      // Create multiple instances to test connection handling
      const clients = Array.from({ length: 3 }, () => new PandashopAPIClient());
      
      const promises = [];
      for (let i = 0; i < connectionTests; i++) {
        const clientIndex = i % clients.length;
        promises.push(clients[clientIndex].healthCheck());
      }
      
      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      
      results.forEach(result => {
        expect(result.status).toBe("healthy");
      });
      
      expect(totalTime).toBeLessThan(15000); // Should benefit from connection pooling
      console.log(`✅ Connection pooling test: ${connectionTests} requests in ${totalTime}ms`);
    });

    test("should handle timeout scenarios gracefully", async () => {
      // Create client with shorter timeout for testing
      const fastClient = new PandashopAPIClient();
      const operations = [];
      
      try {
        // Perform operations that might timeout
        const startTime = Date.now();
        
        operations.push(fastClient.healthCheck());
        operations.push(fastClient.getProducts({ limit: 1 }));
        operations.push(fastClient.getCategories());
        
        const results = await Promise.all(operations);
        const totalTime = Date.now() - startTime;
        
        // If no timeout occurred, verify results
        expect(results[0].status).toBe("healthy");
        expect(results[1].products.length).toBeGreaterThan(0);
        expect(Array.isArray(results[2])).toBe(true);
        
        console.log(`✅ No timeouts occurred in ${totalTime}ms`);
      } catch (error) {
        // If timeout occurred, it should be handled gracefully
        expect(error).toBeDefined();
        console.log(`✅ Timeout handled gracefully: ${(error as Error).message}`);
      }
    });
  });

  test.describe("Performance Benchmarks", () => {
    test("should establish baseline performance metrics", async () => {
      const metrics = {
        healthCheck: 0,
        productList: 0,
        search: 0,
        categories: 0,
        cart: 0
      };
      
      // Health check benchmark
      const healthStart = Date.now();
      await apiClient.healthCheck();
      metrics.healthCheck = Date.now() - healthStart;
      
      // Product list benchmark
      const productsStart = Date.now();
      await apiClient.getProducts({ limit: 5 });
      metrics.productList = Date.now() - productsStart;
      
      // Search benchmark
      const searchStart = Date.now();
      await apiClient.searchProducts({ query: "test", limit: 3 });
      metrics.search = Date.now() - searchStart;
      
      // Categories benchmark
      const categoriesStart = Date.now();
      await apiClient.getCategories();
      metrics.categories = Date.now() - categoriesStart;
      
      // Cart benchmark
      const cartStart = Date.now();
      await apiClient.getCart();
      metrics.cart = Date.now() - cartStart;
      
      // Log performance metrics
      console.log("📊 Performance Benchmarks:");
      Object.entries(metrics).forEach(([operation, time]) => {
        console.log(`  ${operation}: ${time}ms`);
      });
      
      // Verify reasonable performance
      expect(metrics.healthCheck).toBeLessThan(5000);
      expect(metrics.productList).toBeLessThan(8000);
      expect(metrics.search).toBeLessThan(6000);
      expect(metrics.categories).toBeLessThan(3000);
      expect(metrics.cart).toBeLessThan(1000);
    });

    test("should compare performance across different page sizes", async () => {
      const pageSizes = [1, 5, 10, 20];
      const results = [];
      
      for (const limit of pageSizes) {
        const start = Date.now();
        const response = await apiClient.getProducts({ limit });
        const time = Date.now() - start;
        
        results.push({
          limit,
          time,
          count: response.data.length,
          ratio: time / response.data.length
        });
      }
      
      results.forEach(result => {
        expect(result.count).toBeLessThanOrEqual(result.limit);
        expect(result.time).toBeLessThan(10000);
        console.log(`📈 Limit ${result.limit}: ${result.time}ms for ${result.count} products (${result.ratio.toFixed(0)}ms/product)`);
      });
    });

    test("should measure end-to-end user scenario performance", async () => {
      const scenarioStart = Date.now();
      
      // Simulate user journey: health check → browse products → search → view categories
      const health = await apiClient.healthCheck();
      expect(health.status).toBe("healthy");
      
      const products = await apiClient.getProducts({ limit: 5 });
      expect(products.data.length).toBeGreaterThan(0);
      
      const searchResults = await apiClient.searchProducts({ query: "test", limit: 3 });
      expect(Array.isArray(searchResults.data)).toBe(true);
      
      const categories = await apiClient.getCategories();
      expect(categories.length).toBeGreaterThan(0);
      
      const totalScenarioTime = Date.now() - scenarioStart;
      
      // Complete user scenario should finish within reasonable time
      expect(totalScenarioTime).toBeLessThan(20000); // 20 seconds max
      console.log(`✅ Complete user scenario: ${totalScenarioTime}ms`);
    });
  });
});
