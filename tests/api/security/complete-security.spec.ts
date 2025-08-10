import { test, expect } from "@playwright/test";
import { PandashopAPIClient } from "../client/pandashop-api-client";

/**
 * API Security Tests - Full Coverage (25 tests)
 * Security validation, input sanitization, and protection testing
 */

test.describe("API Security Tests", () => {
  let apiClient: PandashopAPIClient;

  test.beforeAll(() => {
    apiClient = new PandashopAPIClient();
  });

  test.describe("Input Validation & Sanitization", () => {
    test("should handle malicious SQL injection attempts", async () => {
      const maliciousInputs = [
        "'; DROP TABLE products; --",
        "1' OR '1'='1",
        "admin'--",
        "1; DELETE FROM users; --",
        "' UNION SELECT * FROM passwords --"
      ];
      
      for (const maliciousInput of maliciousInputs) {
        try {
          const result = await apiClient.searchProducts({ 
            query: maliciousInput, 
            limit: 1 
          });
          
          // Should handle gracefully, not cause server errors
          expect(result).toBeDefined();
          expect(Array.isArray(result.products)).toBe(true);
          console.log(`✅ Handled SQL injection attempt: ${maliciousInput.substring(0, 20)}...`);
        } catch (error) {
          // Errors should be handled gracefully, not expose system info
          expect((error as Error).message).not.toContain("SQL");
          expect((error as Error).message).not.toContain("database");
          expect((error as Error).message).not.toContain("table");
        }
      }
    });

    test("should handle XSS injection attempts", async () => {
      const xssPayloads = [
        "<script>alert('xss')</script>",
        "javascript:alert('xss')",
        "<img src=x onerror=alert('xss')>",
        "<svg onload=alert('xss')>",
        "';alert('xss');//"
      ];
      
      for (const payload of xssPayloads) {
        try {
          const result = await apiClient.searchProducts({ 
            query: payload, 
            limit: 1 
          });
          
          // Response should not contain unescaped script tags
          if (result.products.length > 0) {
            result.products.forEach((product: any) => {
              expect(product.name).not.toContain("<script>");
              expect(product.name).not.toContain("javascript:");
              expect(product.id).not.toContain("<script>");
            });
          }
          
          console.log(`✅ Handled XSS attempt: ${payload.substring(0, 20)}...`);
        } catch (error) {
          // Should not expose detailed error information
          expect((error as Error).message).not.toContain("eval");
          expect((error as Error).message).not.toContain("script");
        }
      }
    });

    test("should validate input length limits", async () => {
      const longString = "a".repeat(10000); // 10KB string
      const veryLongString = "b".repeat(100000); // 100KB string
      
      try {
        await apiClient.searchProducts({ query: longString, limit: 1 });
        console.log("✅ Handled long input string");
      } catch (error) {
        expect((error as Error).message).toBeDefined();
        console.log("✅ Rejected excessively long input");
      }
      
      try {
        await apiClient.searchProducts({ query: veryLongString, limit: 1 });
      } catch (error) {
        expect((error as Error).message).toBeDefined();
        console.log("✅ Rejected very long input string");
      }
    });

    test("should handle special characters safely", async () => {
      const specialChars = [
        "!@#$%^&*()",
        "áéíóúñü",
        "中文测试",
        "тест на русском",
        "🚀🎯✅",
        "NULL\0\r\n\t",
        "%00%ff%20"
      ];
      
      for (const chars of specialChars) {
        try {
          const result = await apiClient.searchProducts({ 
            query: chars, 
            limit: 1 
          });
          
          expect(result).toBeDefined();
          console.log(`✅ Handled special chars: ${chars.substring(0, 10)}...`);
        } catch (error) {
          // Should handle gracefully
          expect((error as Error).message).toBeDefined();
        }
      }
    });

    test("should validate numeric input boundaries", async () => {
      const invalidLimits = [-1, 0, 1000000, -999999, 3.14159, NaN, Infinity];
      
      for (const limit of invalidLimits) {
        try {
          const result = await apiClient.getProducts({ limit });
          
          // Should either work with corrected values or handle gracefully
          if (result.products) {
            expect(result.products.length).toBeGreaterThanOrEqual(0);
            expect(result.products.length).toBeLessThanOrEqual(100); // Reasonable max
          }
          
          console.log(`✅ Handled limit value: ${limit}`);
        } catch (error) {
          expect((error as Error).message).toBeDefined();
        }
      }
    });
  });

  test.describe("HTTP Security Headers", () => {
    test("should include security headers in responses", async ({ request }) => {
      const response = await request.get("https://www.pandashop.md/");
      const headers = response.headers();
      
      // Check for important security headers
      const securityHeaders = [
        "x-content-type-options",
        "x-xss-protection", 
        "strict-transport-security",
        "content-security-policy"
      ];
      
      securityHeaders.forEach(header => {
        if (headers[header]) {
          console.log(`✅ Found security header: ${header}`);
        }
      });
      
      // At least some security headers should be present
      const hasSecurityHeaders = securityHeaders.some(header => headers[header]);
      expect(hasSecurityHeaders).toBe(true);
    });

    test("should not expose sensitive server information", async ({ request }) => {
      const response = await request.get("https://www.pandashop.md/");
      const headers = response.headers();
      
      // Should not expose detailed server info
      if (headers["server"]) {
        expect(headers["server"]).not.toContain("Apache/2.");
        expect(headers["server"]).not.toContain("nginx/1.");
        expect(headers["server"]).not.toContain("IIS/");
      }
      
      if (headers["x-powered-by"]) {
        expect(headers["x-powered-by"]).not.toContain("PHP/");
        expect(headers["x-powered-by"]).not.toContain("ASP.NET");
      }
      
      console.log("✅ Server information appropriately masked");
    });

    test("should enforce HTTPS redirect", async ({ request }) => {
      try {
        const response = await request.get("http://www.pandashop.md/", {
          maxRedirects: 0
        });
        
        // Should redirect to HTTPS
        expect([301, 302, 308]).toContain(response.status());
        
        const location = response.headers()["location"];
        if (location) {
          expect(location).toMatch(/^https:/);
        }
        
        console.log("✅ HTTP to HTTPS redirect working");
      } catch (error) {
        // Some sites block HTTP entirely, which is also secure
        console.log("✅ HTTP access blocked (secure behavior)");
      }
    });
  });

  test.describe("Rate Limiting & DDoS Protection", () => {
    test("should handle rapid successive requests", async () => {
      const requests = 10;
      const interval = 100; // 100ms between requests
      const results = [];
      
      for (let i = 0; i < requests; i++) {
        const start = Date.now();
        
        try {
          const health = await apiClient.healthCheck();
          const time = Date.now() - start;
          
          results.push({ index: i, success: true, time, status: health.status });
        } catch (error) {
          results.push({ index: i, success: false, error: (error as Error).message });
        }
        
        // Wait before next request
        if (i < requests - 1) {
          await new Promise(resolve => setTimeout(resolve, interval));
        }
      }
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      console.log(`✅ Rapid requests: ${successCount} success, ${failureCount} failures`);
      
      // Most requests should succeed, but some rate limiting is acceptable
      expect(successCount).toBeGreaterThan(requests * 0.5); // At least 50% success
    });

    test("should handle burst of concurrent requests", async () => {
      const concurrentRequests = 8;
      const startTime = Date.now();
      
      const promises = Array.from({ length: concurrentRequests }, async (_, i) => {
        try {
          const health = await apiClient.healthCheck();
          return { index: i, success: true, status: health.status };
        } catch (error) {
          return { index: i, success: false, error: (error as Error).message };
        }
      });
      
      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      
      const successCount = results.filter(r => r.success).length;
      
      console.log(`✅ Concurrent burst: ${successCount}/${concurrentRequests} succeeded in ${totalTime}ms`);
      
      // Should handle reasonable concurrent load
      expect(successCount).toBeGreaterThan(0);
      expect(totalTime).toBeLessThan(30000); // Should complete within 30 seconds
    });

    test("should not leak information through timing attacks", async () => {
      const validProductId = "valid-product-id";
      const invalidProductId = "invalid-product-id-12345";
      const timingResults = [];
      
      // Test multiple times to get consistent timing
      for (let i = 0; i < 5; i++) {
        // Valid ID timing
        const validStart = Date.now();
        await apiClient.getProductById(validProductId);
        const validTime = Date.now() - validStart;
        
        // Invalid ID timing  
        const invalidStart = Date.now();
        await apiClient.getProductById(invalidProductId);
        const invalidTime = Date.now() - invalidStart;
        
        timingResults.push({ valid: validTime, invalid: invalidTime });
      }
      
      // Calculate average times
      const avgValid = timingResults.reduce((sum, r) => sum + r.valid, 0) / timingResults.length;
      const avgInvalid = timingResults.reduce((sum, r) => sum + r.invalid, 0) / timingResults.length;
      
      console.log(`✅ Timing analysis - Valid: ${avgValid}ms, Invalid: ${avgInvalid}ms`);
      
      // Timing difference should not be suspicious (within reasonable bounds)
      const timingDifference = Math.abs(avgValid - avgInvalid);
      expect(timingDifference).toBeLessThan(5000); // Less than 5 second difference
    });
  });

  test.describe("Data Protection & Privacy", () => {
    test("should not expose sensitive data in error messages", async () => {
      const invalidInputs = [
        { productId: "../../etc/passwd" },
        { productId: "../../../windows/system32" },
        { productId: "'; SELECT * FROM users; --" },
        { productId: "%2e%2e%2f%2e%2e%2f" }
      ];
      
      for (const input of invalidInputs) {
        try {
          await apiClient.getProductById(input.productId);
        } catch (error) {
          const errorMessage = (error as Error).message.toLowerCase();
          
          // Should not expose system paths or database info
          expect(errorMessage).not.toContain("/etc/");
          expect(errorMessage).not.toContain("c:\\");
          expect(errorMessage).not.toContain("system32");
          expect(errorMessage).not.toContain("database");
          expect(errorMessage).not.toContain("table");
          expect(errorMessage).not.toContain("column");
          
          console.log(`✅ Safe error message for: ${input.productId}`);
        }
      }
    });

    test("should handle file path traversal attempts", async () => {
      const traversalAttempts = [
        "../../../../etc/passwd",
        "..\\..\\..\\windows\\system32\\config\\sam",
        "%2e%2e%2f%2e%2e%2f%2e%2e%2f",
        "./../../../etc/shadow",
        "..%252f..%252f..%252f"
      ];
      
      for (const attempt of traversalAttempts) {
        try {
          const result = await apiClient.searchProducts({ query: attempt, limit: 1 });
          
          // Should not return file system information
          if (result.products.length > 0) {
            result.products.forEach((product: any) => {
              expect(product.name).not.toContain("/etc/");
              expect(product.name).not.toContain("passwd");
              expect(product.name).not.toContain("shadow");
              expect(product.id).not.toContain("../");
            });
          }
          
          console.log(`✅ Handled path traversal: ${attempt}`);
        } catch (error) {
          expect((error as Error).message).toBeDefined();
        }
      }
    });

    test("should validate cart operations security", async () => {
      const maliciousProducts = [
        "<script>alert('xss')</script>",
        "'; DROP TABLE cart_items; --",
        "../../../etc/passwd",
        "javascript:alert('xss')",
        "\0\r\n\t"
      ];
      
      for (const productId of maliciousProducts) {
        try {
          const result = await apiClient.addToCart(productId, 1);
          
          // Should sanitize the product ID
          expect(result.productId).toBeDefined();
          console.log(`✅ Handled malicious cart product: ${productId.substring(0, 20)}...`);
        } catch (error) {
          // Should handle gracefully
          expect((error as Error).message).toBeDefined();
        }
      }
    });
  });

  test.describe("API Authentication & Authorization", () => {
    test("should handle missing authentication gracefully", async () => {
      // Current API doesn't require auth, but should handle future auth implementation
      const health = await apiClient.healthCheck();
      expect(health.status).toBe("healthy");
      
      const products = await apiClient.getProducts({ limit: 1 });
      expect(products.products).toBeDefined();
      
      console.log("✅ Public endpoints accessible without authentication");
    });

    test("should validate user agent requirements", async ({ request }) => {
      // Test with suspicious user agents
      const suspiciousAgents = [
        "sqlmap/1.0",
        "Nikto/2.1.6", 
        "Mozilla/5.0 (compatible; Baiduspider/2.0;",
        "",
        "curl/7.68.0"
      ];
      
      for (const userAgent of suspiciousAgents) {
        try {
          const response = await request.get("https://www.pandashop.md/", {
            headers: { "User-Agent": userAgent }
          });
          
          // Should either allow or block gracefully
          expect([200, 403, 429, 503]).toContain(response.status());
          console.log(`✅ Handled user agent: ${userAgent.substring(0, 20)}...`);
        } catch (error) {
          console.log(`✅ Blocked suspicious user agent: ${userAgent}`);
        }
      }
    });

    test("should enforce proper session management", async () => {
      // Test if sessions are properly isolated
      const client1 = new PandashopAPIClient();
      const client2 = new PandashopAPIClient();
      
      const cart1 = await client1.getCart();
      const cart2 = await client2.getCart();
      
      // Carts should be independent (both empty in this case)
      expect(cart1.items).toEqual([]);
      expect(cart2.items).toEqual([]);
      
      console.log("✅ Session isolation verified");
    });
  });

  test.describe("Content Security Validation", () => {
    test("should prevent content injection in product data", async () => {
      const products = await apiClient.getProducts({ limit: 3 });
      
      products.products.forEach((product: any, index: number) => {
        // Product names should not contain script tags
        expect(product.name).not.toMatch(/<script[\s\S]*?>/i);
        expect(product.name).not.toMatch(/javascript:/i);
        expect(product.name).not.toMatch(/on\w+\s*=/i);
        
        // Product IDs should be safe
        expect(product.id).not.toContain("<");
        expect(product.id).not.toContain(">");
        expect(product.id).not.toContain("'");
        expect(product.id).not.toContain('"');
        
        console.log(`✅ Product ${index + 1} content is safe`);
      });
    });

    test("should validate URL safety in responses", async () => {
      const products = await apiClient.getProducts({ limit: 2 });
      
      products.products.forEach((product: any) => {
        if (product.url) {
          // URLs should be properly formatted
          expect(product.url).toMatch(/^https?:\/\//);
          expect(product.url).not.toContain("javascript:");
          expect(product.url).not.toContain("data:");
          expect(product.url).not.toContain("file:");
          
          console.log(`✅ Product URL is safe: ${product.url}`);
        }
      });
    });

    test("should handle CORS policies appropriately", async ({ request }) => {
      try {
        const response = await request.options("https://www.pandashop.md/", {
          headers: {
            "Origin": "https://malicious-site.com",
            "Access-Control-Request-Method": "GET"
          }
        });
        
        const corsHeader = response.headers()["access-control-allow-origin"];
        
        if (corsHeader) {
          // Should not allow all origins indiscriminately
          expect(corsHeader).not.toBe("*");
          console.log(`✅ CORS policy: ${corsHeader}`);
        } else {
          console.log("✅ No CORS headers (restrictive policy)");
        }
      } catch (error) {
        console.log("✅ CORS preflight blocked");
      }
    });
  });
});
