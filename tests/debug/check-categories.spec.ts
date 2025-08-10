import { test, expect } from "@playwright/test";

test("Check Pandashop categories sitemap", async ({ request }) => {
  console.log("🔍 Checking categories sitemap...");
  
  try {
    const response = await request.get("https://www.pandashop.md/SitemapsCategories.ashx?lng=ru");
    const xmlContent = await response.text();
    
    console.log("✅ Categories sitemap status:", response.status());
    console.log("✅ Content length:", xmlContent.length);
    console.log("✅ First 500 characters:");
    console.log(xmlContent.substring(0, 500));
    
    // Check if it's actually a sitemap
    if (xmlContent.includes("</urlset>")) {
      const urlMatches = xmlContent.match(/<loc>(.*?)<\/loc>/g) || [];
      console.log("✅ Found URLs:", urlMatches.length);
      
      if (urlMatches.length > 0) {
        console.log("✅ Sample URLs:", urlMatches.slice(0, 5));
      }
    } else {
      console.log("⚠️ Not a standard XML sitemap format");
    }
    
  } catch (error) {
    console.error("🔴 Error:", error);
  }
});
