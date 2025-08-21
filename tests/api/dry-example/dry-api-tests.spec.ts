import { test, expect } from "@playwright/test";
import { DRYHelper, SEARCH_TERMS, PERFORMANCE_SLA } from "../../shared/utils/dry-helper";
import { TestConfig } from "../../shared/config/test-config";

/**
 * DRY-compliant API test example
 * Shows how to eliminate hardcoded values
 */

test.describe("DRY API Tests - No Hardcodes", () => {
  let apiClient: any;

  test.beforeEach(async () => {
    // Use DRY helper instead of hardcoded client creation
    apiClient = DRYHelper.getApiClient();
    
    // Log configuration for transparency
    DRYHelper.logConfigurationUsage();
  });

  test("Health check using centralized config", async () => {
    const startTime = Date.now();
    const healthCheck = await apiClient.healthCheck();
    const responseTime = Date.now() - startTime;
    
    // Use centralized performance validation
    DRYHelper.validateNormalResponse(responseTime);
    
    expect(healthCheck.status).toBe("healthy");
    expect(healthCheck.responseTime).toBeGreaterThan(0);
    
    console.log(`✅ Health check: ${responseTime}ms`);
  });

  test("Product fetching with DRY configuration", async () => {
    const limit = TestConfig.apiDefaults.defaultLimit;
    const response = await apiClient.getProducts({ limit });
    
    expect(response.data).toBeDefined();
    expect(response.data.length).toBeLessThanOrEqual(limit);
    
    // Validate using centralized currency
    response.data.forEach((product: any) => {
      expect(product.currency).toBe(TestConfig.testData.currency);
      expect(TestConfig.testData.availability).toContain(product.availability);
    });
    
    console.log(`✅ Fetched ${response.data.length} products`);
  });

  test("Search with centralized search terms", async () => {
    // Use predefined search term instead of hardcoded
    const searchTerm = SEARCH_TERMS.phones;
    
    const startTime = Date.now();
    const response = await apiClient.searchProducts({ 
      query: searchTerm,
      limit: TestConfig.apiDefaults.defaultLimit 
    });
    const responseTime = Date.now() - startTime;
    
    // Use centralized performance SLA
    expect(responseTime).toBeLessThan(PERFORMANCE_SLA.normalResponse);
    
    expect(response.data).toBeDefined();
    
    console.log(`✅ Search for "${searchTerm}": ${response.data.length} results in ${responseTime}ms`);
  });

  test("Price filtering with centralized ranges", async () => {
    // Use predefined price range instead of hardcoded values
    const priceRange = DRYHelper.getPriceRange('medium');
    
    const response = await apiClient.searchProducts({
      priceMin: priceRange.min,
      priceMax: priceRange.max,
      limit: 10
    });
    
    response.data.forEach((product: any) => {
      expect(product.price).toBeGreaterThanOrEqual(priceRange.min);
      expect(product.price).toBeLessThanOrEqual(priceRange.max);
    });
    
    console.log(`✅ Price filtering for ${priceRange.min}-${priceRange.max} ${DRYHelper.getCurrency()}`);
  });

  test("URL validation with DRY helpers", async () => {
    const response = await apiClient.getProducts({ limit: 5 });
    
    response.data.forEach((product: any) => {
      if (product.url) {
        // Use centralized URL validation instead of hardcoded domain
        expect(DRYHelper.validateUrlContainsDomain(product.url)).toBe(true);
        expect(DRYHelper.isProductUrl(product.url)).toBe(true);
      }
    });
    
    console.log("✅ URL validation passed");
  });

  test("Environment-aware testing", async () => {
    console.log(`🎯 Running on: ${DRYHelper.getCurrentEnvironment()}`);
    
    if (DRYHelper.isProduction()) {
      console.log("🔒 Production mode: Using stricter SLAs");
      // Stricter expectations for production
      expect(TestConfig.timeouts.api).toBeLessThanOrEqual(30000);
    } else {
      console.log("🔧 Development mode: Relaxed timeouts");
    }
    
    expect(TestConfig.baseUrl).toBeTruthy();
    console.log(`✅ Environment configuration valid`);
  });
});
