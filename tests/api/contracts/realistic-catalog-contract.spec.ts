import { test, expect } from "@playwright/test";
import { PandashopAPIClient } from "../client/pandashop-api-client";
import { APITestHelpers } from "../helpers/api-test-helpers";
import {
  ProductListResponseSchema,
  HealthCheckSchema,
} from "../../shared/schemas/realistic-api-schemas";

/**
 * Realistic API Contract Tests - Products Catalog
 * Tests based on actual pandashop.md API capabilities
 */

test.describe("Realistic Products API Contract Tests", () => {
  let apiClient: PandashopAPIClient;

  test.beforeEach(async () => {
    apiClient = new PandashopAPIClient();
  });

  test("Health check should return valid response", async () => {
    const healthCheck = await apiClient.healthCheck();
    
    // Validate schema
    const validatedResponse = HealthCheckSchema.parse(healthCheck);
    
    expect(validatedResponse.status).toBe("healthy");
    expect(validatedResponse.responseTime).toBeGreaterThan(0);
    expect(validatedResponse.timestamp).toBeDefined();
    
    console.log("✅ Health check validated:", validatedResponse);
  });

  test("should return valid product list response schema", async () => {
    const startTime = Date.now();

    // Make API call
    const response = await apiClient.getProducts({ limit: 5 });

    // Validate response time
    APITestHelpers.validateResponseTime(startTime, 5000);

    // Validate schema compliance
    const validatedResponse = ProductListResponseSchema.parse(response);

    // Basic structure validations
    expect(validatedResponse.data).toBeDefined();
    expect(Array.isArray(validatedResponse.data)).toBe(true);
    expect(validatedResponse.pagination).toBeDefined();
    expect(validatedResponse.pagination.page).toBeGreaterThan(0);
    expect(validatedResponse.pagination.limit).toBeGreaterThan(0);
    expect(validatedResponse.pagination.total).toBeGreaterThanOrEqual(0);

    // Validate each product in response
    validatedResponse.data.forEach((product) => {
      expect(product.id).toBeTruthy();
      expect(product.name).toBeTruthy();
      expect(product.price).toBeGreaterThan(0);
      expect(product.currency).toBe("MDL");
      expect(["available", "out_of_stock", "pre_order"]).toContain(product.availability);
    });

    console.log(`✅ Validated ${validatedResponse.data.length} products`);
  });

  test("should handle pagination parameters correctly", async () => {
    const limit = 3;
    const page = 1;
    
    const response = await apiClient.getProducts({ limit, page });
    const validatedResponse = ProductListResponseSchema.parse(response);

    expect(validatedResponse.pagination.page).toBe(page);
    expect(validatedResponse.pagination.limit).toBe(limit);
    expect(validatedResponse.data.length).toBeLessThanOrEqual(limit);
  });

  test("should handle search functionality", async () => {
    const searchQuery = "a";
    const response = await apiClient.searchProducts({ 
      query: searchQuery,
      limit: 5 
    });
    
    const validatedResponse = ProductListResponseSchema.parse(response);
    
    expect(validatedResponse.data).toBeDefined();
    expect(Array.isArray(validatedResponse.data)).toBe(true);
    
    // Check that all products contain search query in name or id
    validatedResponse.data.forEach((product) => {
      const productText = `${product.name} ${product.id}`.toLowerCase();
      expect(productText).toContain(searchQuery.toLowerCase());
    });
    
    console.log(`✅ Search for "${searchQuery}" returned ${validatedResponse.data.length} results`);
  });

  test("should handle price filtering", async () => {
    const priceMin = 100;
    const priceMax = 500;
    
    const response = await apiClient.searchProducts({
      priceMin,
      priceMax,
      limit: 10
    });
    
    const validatedResponse = ProductListResponseSchema.parse(response);
    
    validatedResponse.data.forEach((product) => {
      expect(product.price).toBeGreaterThanOrEqual(priceMin);
      expect(product.price).toBeLessThanOrEqual(priceMax);
    });
    
    console.log(`✅ Price filtering validated for range ${priceMin}-${priceMax}`);
  });

  test.describe("Performance Tests", () => {
    test("product list should respond within SLA", async () => {
      const startTime = Date.now();
      
      const response = await apiClient.getProducts({ limit: 10 });
      const responseTime = Date.now() - startTime;
      
      const validatedResponse = ProductListResponseSchema.parse(response);
      
      expect(responseTime).toBeLessThan(3000); // 3 second SLA
      expect(validatedResponse.data.length).toBeGreaterThan(0);
      
      console.log(`✅ Response time: ${responseTime}ms`);
    });
  });

  test.describe("Data Consistency Tests", () => {
    test("products should have consistent data structure", async () => {
      const response = await apiClient.getProducts({ limit: 5 });
      const validatedResponse = ProductListResponseSchema.parse(response);
      
      validatedResponse.data.forEach((product) => {
        // All required fields must be present
        expect(product.id).toBeTruthy();
        expect(product.name).toBeTruthy(); 
        expect(product.price).toBeGreaterThan(0);
        expect(product.currency).toBeTruthy();
        expect(product.availability).toBeTruthy();
        
        // Optional fields should be consistent type if present
        if (product.category) {
          expect(typeof product.category).toBe('string');
        }
        if (product.brand) {
          expect(typeof product.brand).toBe('string');
        }
        if (product.url) {
          expect(typeof product.url).toBe('string');
          expect(product.url).toContain('pandashop.md');
        }
      });
      
      console.log("✅ Data consistency validated");
    });
  });
});
