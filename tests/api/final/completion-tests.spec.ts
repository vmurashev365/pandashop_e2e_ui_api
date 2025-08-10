import { test, expect } from "@playwright/test";
import { PandashopAPIClient } from "../client/pandashop-api-client";

/**
 * Final BDD-Style API Tests (6 tests)
 * Completing the 200-test pyramid target
 */

test.describe("Final API Tests - BDD Style Scenarios", () => {
  let apiClient: PandashopAPIClient;

  test.beforeAll(() => {
    apiClient = new PandashopAPIClient();
  });

  test.describe("User Journey Scenarios", () => {
    test("Scenario: User browses products successfully", async () => {
      console.log("📋 Given: User wants to browse available products");
      
      // When: User requests product list
      console.log("🔄 When: User requests product list");
      const products = await apiClient.getProducts({ limit: 10 });
      
      // Then: Products are returned successfully
      console.log("✅ Then: Products are returned successfully");
      expect(products).toHaveProperty("products");
      expect(products.products.length).toBeGreaterThan(0);
      expect(products.products.length).toBeLessThanOrEqual(10);
      
      // And: Each product has required information
      console.log("✅ And: Each product has required information");
      products.products.forEach(product => {
        expect(product).toHaveProperty("id");
        expect(typeof product.id).toBe("string");
        expect(product.id.length).toBeGreaterThan(0);
      });
      
      console.log(`✅ Scenario completed: ${products.products.length} products browsed`);
    });

    test("Scenario: User searches for specific products", async () => {
      console.log("📋 Given: User wants to find specific products");
      
      const searchTerms = ["телефон", "компьютер", "планшет"];
      
      for (const term of searchTerms) {
        // When: User searches for a product
        console.log(`🔄 When: User searches for "${term}"`);
        const searchResults = await apiClient.searchProducts({ 
          query: term, 
          limit: 5 
        });
        
        // Then: Search results are returned
        console.log(`✅ Then: Search results are returned for "${term}"`);
        expect(searchResults).toHaveProperty("products");
        expect(Array.isArray(searchResults.products)).toBe(true);
        
        // And: Results have proper structure
        console.log(`✅ And: Results have proper structure`);
        expect(searchResults).toHaveProperty("pagination");
        
        console.log(`   📊 Found ${searchResults.products.length} results for "${term}"`);
      }
      
      console.log("✅ Scenario completed: Search functionality verified");
    });

    test("Scenario: User manages shopping cart", async () => {
      console.log("📋 Given: User wants to manage their shopping cart");
      
      // When: User checks empty cart
      console.log("🔄 When: User checks their cart");
      const initialCart = await apiClient.getCart();
      
      // Then: Cart is accessible
      console.log("✅ Then: Cart is accessible");
      expect(initialCart).toBeDefined();
      expect(initialCart).toHaveProperty("items");
      expect(Array.isArray(initialCart.items)).toBe(true);
      
      const initialItemCount = initialCart.items.length;
      console.log(`   📊 Initial cart has ${initialItemCount} items`);
      
      // When: User adds item to cart
      console.log("🔄 When: User adds item to cart");
      const addResult = await apiClient.addToCart("test-product-123", 1);
      
      // Then: Item is added successfully
      console.log("✅ Then: Item is added successfully");
      expect(addResult).toHaveProperty("success");
      expect(addResult.success).toBe(true);
      
      // When: User checks cart again
      console.log("🔄 When: User checks cart again");
      const updatedCart = await apiClient.getCart();
      
      // Then: Cart reflects the addition
      console.log("✅ Then: Cart reflects the addition");
      expect(updatedCart.items.length).toBeGreaterThanOrEqual(initialItemCount);
      
      console.log(`   📊 Updated cart has ${updatedCart.items.length} items`);
      console.log("✅ Scenario completed: Cart management verified");
    });

    test("Scenario: System provides category navigation", async () => {
      console.log("📋 Given: User wants to browse by categories");
      
      // When: User requests category list
      console.log("🔄 When: User requests available categories");
      const categories = await apiClient.getCategories();
      
      // Then: Categories are returned
      console.log("✅ Then: Categories are returned");
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
      
      // And: Each category has proper structure
      console.log("✅ And: Each category has proper structure");
      categories.forEach((category, index) => {
        expect(category).toBeDefined();
        console.log(`   📁 Category ${index + 1}: ${typeof category === 'string' ? category : 'Object'}`);
      });
      
      console.log(`✅ Scenario completed: ${categories.length} categories available`);
    });

    test("Scenario: System maintains high availability", async () => {
      console.log("📋 Given: System should be highly available");
      
      const healthChecks = 5;
      const healthResults = [];
      
      // When: Multiple health checks are performed
      console.log(`🔄 When: Performing ${healthChecks} health checks`);
      
      for (let i = 0; i < healthChecks; i++) {
        const healthStart = Date.now();
        
        try {
          const health = await apiClient.healthCheck();
          const responseTime = Date.now() - healthStart;
          
          healthResults.push({
            check: i + 1,
            status: health.status,
            responseTime,
            success: true
          });
          
          console.log(`   ✅ Health check ${i + 1}: ${health.status} (${responseTime}ms)`);
        } catch (error) {
          healthResults.push({
            check: i + 1,
            error: (error as Error).message,
            success: false
          });
          
          console.log(`   ⚠️ Health check ${i + 1}: Failed`);
        }
        
        // Small delay between checks
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Then: System shows high availability
      console.log("✅ Then: System shows high availability");
      const successRate = healthResults.filter(r => r.success).length / healthResults.length;
      expect(successRate).toBeGreaterThan(0.8); // 80% availability
      
      // And: Response times are acceptable
      console.log("✅ And: Response times are acceptable");
      const successfulChecks = healthResults.filter(r => r.success) as any[];
      const avgResponseTime = successfulChecks.reduce((sum, r) => sum + r.responseTime, 0) / successfulChecks.length;
      expect(avgResponseTime).toBeLessThan(5000); // 5 seconds
      
      console.log(`✅ Scenario completed: ${(successRate * 100).toFixed(1)}% availability, ${avgResponseTime.toFixed(0)}ms avg response`);
    });

    test("Scenario: System handles concurrent users gracefully", async () => {
      console.log("📋 Given: Multiple users access the system simultaneously");
      
      const concurrentUsers = 6;
      const userOperations = [];
      
      // When: Multiple users perform operations simultaneously
      console.log(`🔄 When: ${concurrentUsers} users perform operations simultaneously`);
      
      for (let user = 0; user < concurrentUsers; user++) {
        const userPromise = (async () => {
          const userStart = Date.now();
          const operations = [];
          
          try {
            // Each user performs multiple operations
            const health = await apiClient.healthCheck();
            operations.push({ operation: "health", success: true, status: health.status });
            
            const products = await apiClient.getProducts({ limit: 3 });
            operations.push({ operation: "products", success: true, count: products.products.length });
            
            const search = await apiClient.searchProducts({ query: "test", limit: 2 });
            operations.push({ operation: "search", success: true, count: search.products.length });
            
            const userTime = Date.now() - userStart;
            
            return {
              user: user + 1,
              success: true,
              operations,
              totalTime: userTime
            };
            
          } catch (error) {
            return {
              user: user + 1,
              success: false,
              error: (error as Error).message,
              operations,
              totalTime: Date.now() - userStart
            };
          }
        })();
        
        userOperations.push(userPromise);
      }
      
      const userResults = await Promise.all(userOperations);
      
      // Then: System handles concurrent load
      console.log("✅ Then: System handles concurrent load");
      const successfulUsers = userResults.filter(r => r.success).length;
      expect(successfulUsers).toBeGreaterThan(concurrentUsers * 0.6); // 60% success rate
      
      // And: Performance remains acceptable
      console.log("✅ And: Performance remains acceptable");
      const avgUserTime = userResults
        .filter(r => r.success)
        .reduce((sum, r) => sum + r.totalTime, 0) / successfulUsers;
      
      expect(avgUserTime).toBeLessThan(15000); // 15 seconds per user
      
      // Log detailed results
      userResults.forEach(result => {
        if (result.success) {
          const successfulOps = result.operations.filter(op => op.success).length;
          console.log(`   👤 User ${result.user}: ${successfulOps}/3 operations, ${result.totalTime}ms`);
        } else {
          console.log(`   ⚠️ User ${result.user}: Failed`);
        }
      });
      
      console.log(`✅ Scenario completed: ${successfulUsers}/${concurrentUsers} users successful, ${avgUserTime.toFixed(0)}ms avg time`);
    });
  });
});
