import { test } from "@playwright/test";
import { PandashopAPIClient } from "./client/pandashop-api-client";

test.describe("Debug API Response", () => {
  let apiClient: PandashopAPIClient;

  test.beforeEach(async () => {
    apiClient = new PandashopAPIClient("https://pandashop.md");
  });

  test("Check real API response structure", async () => {
    try {
      const response = await apiClient.getProducts({ page: 1, limit: 1 });
      console.log("✅ API Response:", JSON.stringify(response, null, 2));
      
      // Log the structure
      if (response && response.data && response.data.length > 0) {
        const firstProduct = response.data[0];
        console.log("📦 First Product Keys:", Object.keys(firstProduct));
        console.log("📦 First Product:", JSON.stringify(firstProduct, null, 2));
      }
    } catch (error) {
      console.log("❌ API Error:", error);
    }
  });

  test("Check single product response", async () => {
    try {
      // First get a list to find a valid product ID
      const listResponse = await apiClient.getProducts({ page: 1, limit: 5 });
      
      if (listResponse?.data?.length > 0) {
        const productId = listResponse.data[0].id;
        console.log("🎯 Testing product ID:", productId);
        
        const productResponse = await apiClient.getProduct(productId);
        console.log("📦 Single Product Response:", JSON.stringify(productResponse, null, 2));
        console.log("📦 Single Product Keys:", Object.keys(productResponse || {}));
      }
    } catch (error) {
      console.log("❌ Single Product Error:", error);
    }
  });
});
