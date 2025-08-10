import { chromium, FullConfig } from "@playwright/test";

/**
 * Global setup for Playwright tests
 * Runs once before all tests
 */
async function globalSetup(config: FullConfig) {
  console.log("🚀 Starting Pandashop.md Test Suite Global Setup");

  // Check if we can connect to the test environment
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log("🔍 Checking connectivity to Pandashop.md...");

    // Test basic connectivity
    const response = await page.goto("https://pandashop.md/", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    if (response && response.status() < 500) {
      console.log("✅ Pandashop.md is accessible");
      console.log(`📊 Response status: ${response.status()}`);
    } else {
      console.warn("⚠️  Pandashop.md returned an error status");
    }

    // Store environment info for tests
    process.env.PANDASHOP_BASE_URL = "https://pandashop.md";
    process.env.TEST_ENV = "production";

    console.log("🌍 Environment variables set:");
    console.log(`   PANDASHOP_BASE_URL: ${process.env.PANDASHOP_BASE_URL}`);
    console.log(`   TEST_ENV: ${process.env.TEST_ENV}`);
  } catch (error) {
    console.error("❌ Global setup failed:", error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }

  console.log("✅ Global setup completed successfully");
}

export default globalSetup;
