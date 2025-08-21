import { test, expect } from "@playwright/test";
import { PandashopAPIClient } from "../client/pandashop-api-client";
import { APITestHelpers } from "../helpers/api-test-helpers";
import {
  ProductListResponseSchema,
  ProductSchema,
} from "../../shared/schemas/realistic-api-schemas";

/**
 * API Contract Tests - Products Catalog
 * Tests that verify API responses match expected schemas and contracts
 */

test.describe("Products API Contract Tests", () => {
  let apiClient: PandashopAPIClient;

  test.beforeAll(async () => {
    apiClient = new PandashopAPIClient();
    
    // Verify API is accessible
    const startTime = Date.now();
    const healthCheck = await apiClient.healthCheck();
    APITestHelpers.validateResponseTime(startTime, 2000);

    expect(healthCheck.status).toBe("healthy");
  });

  test.describe("GET /api/v1/products", () => {
    test("should return valid product list response schema", async () => {
      const startTime = Date.now();

      // Make API call
      const response = await apiClient.getProducts();

      // Validate response time
      APITestHelpers.validateResponseTime(startTime, 2000);

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
        expect(product.id).toBeDefined();
        expect(product.name).toBeDefined();
        expect(product.price).toBeGreaterThan(0);
        expect(product.currency).toBe("MDL");
        expect(["available", "out_of_stock", "pre_order"]).toContain(
          product.availability,
        );
      });
    });

    test("should handle pagination parameters correctly", async () => {
      const page = 2;
      const limit = 20;

      const response = await apiClient.getProducts({ page, limit });

      expect(response.pagination.page).toBe(page);
      expect(response.pagination.limit).toBe(limit);
      expect(response.data.length).toBeLessThanOrEqual(limit);
    });

    test("should filter by category correctly", async () => {
      const categories = await apiClient.getCategories();

      if (categories.length > 0) {
        const testCategory = categories[0];
        const response = await apiClient.getProducts({
          categoryId: testCategory.id,
        });

        // All products should belong to the specified category
        response.data.forEach((product) => {
          expect(product.categoryId).toBe(testCategory.id);
        });
      }
    });

    test("should filter by price range correctly", async () => {
      const minPrice = 100;
      const maxPrice = 500;

      const response = await apiClient.getProducts({
        priceMin: minPrice,
        priceMax: maxPrice,
      });

      response.data.forEach((product) => {
        expect(product.price).toBeGreaterThanOrEqual(minPrice);
        expect(product.price).toBeLessThanOrEqual(maxPrice);
      });
    });

    test("should handle availability filter correctly", async () => {
      const availability = "available";

      const response = await apiClient.getProducts({ availability });

      response.data.forEach((product) => {
        expect(product.availability).toBe(availability);
      });
    });

    test("should return 400 for invalid pagination parameters", async () => {
      await expect(async () => {
        await apiClient.getProducts({ page: 0 });
      }).rejects.toThrow();

      await expect(async () => {
        await apiClient.getProducts({ limit: 0 });
      }).rejects.toThrow();

      await expect(async () => {
        await apiClient.getProducts({ limit: 101 }); // Over max limit
      }).rejects.toThrow();
    });
  });

  test.describe("GET /api/v1/products/{id}", () => {
    test("should return valid single product schema", async () => {
      // First get a list to find a valid product ID
      const productList = await apiClient.getProducts({ limit: 1 });

      if (productList.data.length > 0) {
        const productId = productList.data[0].id;
        const startTime = Date.now();

        const product = await apiClient.getProduct(productId);

        APITestHelpers.validateResponseTime(startTime, 1000);

        // Validate schema
        const validatedProduct = ProductSchema.parse(product);

        expect(validatedProduct.id).toBe(productId);
        expect(validatedProduct.name).toBeDefined();
        expect(validatedProduct.price).toBeGreaterThan(0);
        expect(validatedProduct.currency).toBe("MDL");
        expect(validatedProduct.availability).toBeDefined();
      }
    });

    test("should return 404 for non-existent product", async () => {
      const fakeId = "non-existent-product-id";

      await expect(async () => {
        await apiClient.getProduct(fakeId);
      }).rejects.toThrow();
    });

    test("should return 400 for invalid product ID format", async () => {
      const invalidId = "invalid-id-format!@#";

      await expect(async () => {
        await apiClient.getProduct(invalidId);
      }).rejects.toThrow();
    });
  });

  test.describe("GET /api/v1/products/search", () => {
    test("should return valid search response schema", async () => {
      const searchQuery = "телефон";
      const startTime = Date.now();

      const response = await apiClient.searchProducts({
        query: searchQuery,
        page: 1,
        limit: 20,
      });

      APITestHelpers.validateResponseTime(startTime, 3000); // Search can be slower

      // Validate search response structure
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.pagination).toBeDefined();
      expect(response.filters).toBeDefined();
      expect(response.searchQuery).toBe(searchQuery);

      // Validate search relevance (products should contain search term)
      if (response.data.length > 0) {
        response.data.forEach((product) => {
          const productText =
            `${product.name} ${product.description}`.toLowerCase();
          expect(productText).toContain(searchQuery.toLowerCase());
        });
      }
    });

    test("should handle empty search results", async () => {
      const obscureQuery = "xyzabc123nonexistent";

      const response = await apiClient.searchProducts({
        query: obscureQuery,
        page: 1,
        limit: 20,
      });

      expect(response.data).toEqual([]);
      expect(response.pagination.total).toBe(0);
      expect(response.searchQuery).toBe(obscureQuery);
    });

    test("should validate search query length limit", async () => {
      const longQuery = "a".repeat(256); // Over 255 character limit

      await expect(async () => {
        await apiClient.searchProducts({ query: longQuery });
      }).rejects.toThrow();
    });

    test("should handle special characters in search", async () => {
      const specialQuery = 'телефон "samsung" & nokia';

      const response = await apiClient.searchProducts({ query: specialQuery });

      expect(response.searchQuery).toBe(specialQuery);
      // Should not throw errors and return valid response structure
      expect(response.data).toBeDefined();
      expect(response.pagination).toBeDefined();
    });
  });

  test.describe("Performance Tests", () => {
    test("product list should respond within SLA", async () => {
      const startTime = Date.now();

      await apiClient.getProducts({ limit: 50 });

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(2000); // 2 second SLA
    });

    test("search should respond within SLA", async () => {
      const startTime = Date.now();

      await apiClient.searchProducts({
        query: "популярный товар",
        limit: 20,
      });

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(3000); // 3 second SLA for search
    });

    test("single product should respond within SLA", async () => {
      // Get a product ID first
      const productList = await apiClient.getProducts({ limit: 1 });

      if (productList.data.length > 0) {
        const productId = productList.data[0].id;
        const startTime = Date.now();

        await apiClient.getProduct(productId);

        const responseTime = Date.now() - startTime;
        expect(responseTime).toBeLessThan(1000); // 1 second SLA
      }
    });
  });

  test.describe("Data Consistency Tests", () => {
    test("product in list should match detailed view", async () => {
      const productList = await apiClient.getProducts({ limit: 5 });

      if (productList.data.length > 0) {
        const listProduct = productList.data[0];
        const detailedProduct = await apiClient.getProduct(listProduct.id);

        // Core fields should match
        expect(detailedProduct.id).toBe(listProduct.id);
        expect(detailedProduct.name).toBe(listProduct.name);
        expect(detailedProduct.price).toBe(listProduct.price);
        expect(detailedProduct.currency).toBe(listProduct.currency);
        expect(detailedProduct.availability).toBe(listProduct.availability);
      }
    });

    test("search results should be consistent across requests", async () => {
      const searchQuery = "компьютер";

      const response1 = await apiClient.searchProducts({
        query: searchQuery,
        page: 1,
        limit: 20,
      });

      // Wait a bit and search again
      await new Promise((resolve) => setTimeout(resolve, 100));

      const response2 = await apiClient.searchProducts({
        query: searchQuery,
        page: 1,
        limit: 20,
      });

      // Results should be consistent (assuming no updates happened)
      expect(response1.pagination.total).toBe(response2.pagination.total);
      expect(response1.data.length).toBe(response2.data.length);

      if (response1.data.length > 0) {
        expect(response1.data[0].id).toBe(response2.data[0].id);
      }
    });
  });
});
