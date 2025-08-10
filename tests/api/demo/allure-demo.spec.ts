import { test, expect } from "@playwright/test";
import { PandashopAPIClient } from "../client/pandashop-api-client";
import AllureReporter from "../../shared/utils/allure-reporter";

/**
 * Example API Test with Beautiful Allure Reporting
 * Demonstrates comprehensive reporting features
 */

test.describe("API Tests with Allure Reporting", () => {
  let apiClient: PandashopAPIClient;

  test.beforeAll(() => {
    apiClient = new PandashopAPIClient();
  });

  test.beforeEach(async () => {
    // Setup Allure metadata for each test
    AllureReporter.pyramidLevel('API');
    AllureReporter.productionSafe();
    AllureReporter.owner('Test Pyramid Framework');
    AllureReporter.environment('Target Site', 'https://pandashop.md');
    AllureReporter.environment('Test Framework', 'Playwright + TypeScript');
  });

  test("Health Check with Performance Metrics", async () => {
    AllureReporter.epic('API Health Monitoring');
    AllureReporter.feature('System Health');
    AllureReporter.story('Health check endpoint validation');
    AllureReporter.severity('critical');
    AllureReporter.tag('smoke');
    AllureReporter.tag('health-check');
    AllureReporter.description('Validates API health endpoint and measures performance metrics');
    
    await AllureReporter.step('Perform health check request', async () => {
      const startTime = Date.now();
      
      const healthResponse = await apiClient.healthCheck();
      
      const responseTime = Date.now() - startTime;
      
      // Add performance metrics to report
      await AllureReporter.apiMetrics('/health', responseTime, 200);
      
      // Validate response
      expect(healthResponse).toHaveProperty('status', 'healthy');
      expect(healthResponse).toHaveProperty('timestamp');
      expect(responseTime).toBeLessThan(3000);
      
      // Add detailed response to report
      await AllureReporter.attachment(
        'Health Check Response',
        JSON.stringify(healthResponse, null, 2),
        'application/json'
      );

      console.log(`✅ Health check completed in ${responseTime}ms`);
    });
  });

  test("Product Catalog with Data Validation", async () => {
    AllureReporter.epic('Product Management');
    AllureReporter.feature('Product Catalog');
    AllureReporter.story('Product list retrieval and validation');
    AllureReporter.severity('critical');
    AllureReporter.tag('products');
    AllureReporter.tag('catalog');
    AllureReporter.description('Retrieves product catalog and validates data structure and content');
    
    await AllureReporter.step('Request product catalog', async () => {
      const startTime = Date.now();
      
      const productsResponse = await apiClient.getProducts({ limit: 10 });
      
      const responseTime = Date.now() - startTime;
      
      // Add API metrics
      await AllureReporter.apiMetrics('/api/v1/products', responseTime, 200);
      
      // Validate response structure
      expect(productsResponse).toHaveProperty('products');
      expect(Array.isArray(productsResponse.products)).toBe(true);
      expect(productsResponse.products.length).toBeGreaterThan(0);
      expect(productsResponse.products.length).toBeLessThanOrEqual(10);
      
      console.log(`✅ Retrieved ${productsResponse.products.length} products in ${responseTime}ms`);
    });

    await AllureReporter.step('Validate product data structure', async () => {
      const products = await apiClient.getProducts({ limit: 5 });
      
      // Validate each product structure
      for (const product of products.products) {
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('price');
        expect(product).toHaveProperty('currency');
        expect(product).toHaveProperty('availability');
        
        // Validate data types
        expect(typeof product.id).toBe('string');
        expect(typeof product.name).toBe('string');
        expect(typeof product.price).toBe('number');
        expect(typeof product.currency).toBe('string');
        expect(typeof product.availability).toBe('string');
        
        // Validate business rules
        expect(product.price).toBeGreaterThan(0);
        expect(product.currency).toBe('MDL');
        
        // Allow various availability statuses (expanded list)
        const validStatuses = ['available', 'unavailable', 'limited', 'out_of_stock', 'in_stock'];
        expect(validStatuses).toContain(product.availability);
      }
      
      // Add sample product data to report
      await AllureReporter.attachment(
        'Sample Product Data',
        JSON.stringify(products.products[0], null, 2),
        'application/json'
      );
      
      console.log(`✅ Validated data structure for ${products.products.length} products`);
    });
  });

  test("Search Functionality with Edge Cases", async () => {
    AllureReporter.epic('Search & Discovery');
    AllureReporter.feature('Product Search');
    AllureReporter.story('Search functionality with various inputs');
    AllureReporter.severity('normal');
    AllureReporter.tag('search');
    AllureReporter.tag('edge-cases');
    AllureReporter.description('Tests product search with various input scenarios including edge cases');
    
    await AllureReporter.step('Test basic search functionality', async () => {
      const searchParams = { query: 'test', limit: 5 };
      const startTime = Date.now();
      
      const searchResults = await apiClient.searchProducts(searchParams);
      
      const responseTime = Date.now() - startTime;
      
      // Add search metrics
      await AllureReporter.apiMetrics(`/search?q=${searchParams.query}`, responseTime, 200);
      
      // Validate search results
      expect(searchResults).toHaveProperty('products');
      expect(Array.isArray(searchResults.products)).toBe(true);
      expect(searchResults.products.length).toBeLessThanOrEqual(5);
      
      console.log(`✅ Search for "${searchParams.query}" returned ${searchResults.products.length} results in ${responseTime}ms`);
    });

    await AllureReporter.step('Test empty search handling', async () => {
      const emptyResults = await apiClient.searchProducts({ query: 'nonexistentproduct12345', limit: 10 });
      
      expect(emptyResults).toHaveProperty('products');
      expect(emptyResults.products).toHaveLength(0);
      
      await AllureReporter.attachment(
        'Empty Search Results',
        JSON.stringify(emptyResults, null, 2),
        'application/json'
      );
      
      console.log('✅ Empty search handled correctly');
    });

    await AllureReporter.step('Test special characters in search', async () => {
      const specialChars = ['@', '#', '$', '%'];
      
      for (const char of specialChars) {
        const results = await apiClient.searchProducts({ query: char, limit: 3 });
        
        // Should handle gracefully without errors
        expect(results).toHaveProperty('products');
        expect(Array.isArray(results.products)).toBe(true);
        
        console.log(`✅ Special character "${char}" handled safely`);
      }
      
      await AllureReporter.attachment(
        'Special Character Test Results',
        `Tested characters: ${specialChars.join(', ')}\nAll handled safely without errors`,
        'text/plain'
      );
    });
  });

  test("Performance Benchmark Test", async () => {
    AllureReporter.epic('Performance Monitoring');
    AllureReporter.feature('API Performance');
    AllureReporter.story('Performance benchmarking across multiple endpoints');
    AllureReporter.severity('normal');
    AllureReporter.tag('performance');
    AllureReporter.tag('benchmark');
    AllureReporter.description('Measures and validates API performance across multiple endpoints');
    
    const performanceResults: any[] = [];
    
    await AllureReporter.step('Benchmark health check endpoint', async () => {
      const iterations = 5;
      let totalTime = 0;
      
      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        await apiClient.healthCheck();
        const responseTime = Date.now() - startTime;
        totalTime += responseTime;
      }
      
      const averageTime = totalTime / iterations;
      performanceResults.push({
        endpoint: '/health',
        averageResponseTime: averageTime,
        iterations,
        target: '< 2000ms'
      });
      
      expect(averageTime).toBeLessThan(2000);
      console.log(`✅ Health check average: ${averageTime.toFixed(2)}ms`);
    });

    await AllureReporter.step('Benchmark products endpoint', async () => {
      const iterations = 3;
      let totalTime = 0;
      
      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        await apiClient.getProducts({ limit: 10 });
        const responseTime = Date.now() - startTime;
        totalTime += responseTime;
      }
      
      const averageTime = totalTime / iterations;
      performanceResults.push({
        endpoint: '/api/v1/products',
        averageResponseTime: averageTime,
        iterations,
        target: '< 4000ms'
      });
      
      expect(averageTime).toBeLessThan(4000);
      console.log(`✅ Products endpoint average: ${averageTime.toFixed(2)}ms`);
    });

    await AllureReporter.step('Generate performance report', async () => {
      await AllureReporter.attachment(
        'Performance Benchmark Results',
        JSON.stringify(performanceResults, null, 2),
        'application/json'
      );
      
      // Create performance summary
      const summary = performanceResults.map(result => 
        `${result.endpoint}: ${result.averageResponseTime.toFixed(2)}ms (target: ${result.target})`
      ).join('\n');
      
      await AllureReporter.attachment(
        'Performance Summary',
        summary,
        'text/plain'
      );
      
      console.log('✅ Performance benchmark completed');
    });
  });
});
