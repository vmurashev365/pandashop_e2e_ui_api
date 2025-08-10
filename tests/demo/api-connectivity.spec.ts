import { test, expect } from "@playwright/test";

/**
 * API Demo Test - Basic connectivity test for Pandashop.md
 * Demonstrates that the test pyramid framework is working
 */

test.describe("API Connectivity Demo", () => {
  test("should connect to Pandashop.md API and get response", async ({
    request,
  }) => {
    const startTime = Date.now();

    // Make a basic request to the homepage to verify connectivity
    const response = await request.get("https://pandashop.md/");

    const responseTime = Date.now() - startTime;

    // Basic connectivity assertions
    expect(response.status()).toBeLessThan(500); // Should not be server error
    expect(responseTime).toBeLessThan(10000); // Should respond within 10 seconds

    console.log(`✅ Pandashop.md connectivity test passed`);
    console.log(`📊 Response status: ${response.status()}`);
    console.log(`⏱️ Response time: ${responseTime}ms`);
  });

  test("should handle API request structure", async ({ request }) => {
    // Test basic request structure for future API calls
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "Pandashop-Test-Suite/1.0",
    };

    const response = await request.get("https://pandashop.md/", { headers });

    // Verify we can make requests with proper headers
    expect(response.status()).toBeLessThan(500);

    const responseHeaders = response.headers();
    expect(responseHeaders["server"]).toBeDefined();

    console.log(`✅ API request structure test passed`);
    console.log(`📋 Response headers include server info`);
  });

  test("should demonstrate test pyramid architecture", async () => {
    // This test demonstrates the different layers of our test pyramid

    console.log("🏗️  Test Pyramid Architecture Demo:");
    console.log("");
    console.log("📊 Test Distribution (200 total tests):");
    console.log("   🔺 E2E Tests: 20 tests (10%) - Full user journeys");
    console.log(
      "   🔷 UI Component Tests: 40 tests (20%) - Component interactions",
    );
    console.log(
      "   🔳 API Tests: 140 tests (70%) - Business logic & contracts",
    );
    console.log("");
    console.log("🛠️  Technologies Used:");
    console.log("   • Playwright + TypeScript for all test levels");
    console.log("   • Gherkin/Cucumber for BDD scenarios (40 API tests)");
    console.log(
      "   • Pure API tests for performance & contracts (100 API tests)",
    );
    console.log("   • Zod schemas for runtime validation");
    console.log("");
    console.log("📁 Project Structure:");
    console.log("   tests/api/bdd/         - Gherkin BDD API tests");
    console.log("   tests/api/pure/        - Pure API tests");
    console.log("   tests/api/contracts/   - API contract tests");
    console.log("   tests/api/performance/ - API performance tests");
    console.log("   tests/ui/components/   - UI component tests");
    console.log("   tests/e2e/            - End-to-end tests");
    console.log("");

    // This test always passes - it's just for demonstration
    expect(true).toBe(true);
  });
});
