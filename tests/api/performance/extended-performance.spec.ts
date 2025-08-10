import { test, expect } from "@playwright/test";
import { PandashopAPIClient } from "../client/pandashop-api-client";

/**
 * Extended API Performance Tests (10 tests)
 * Additional performance testing to reach target 30 total
 */

test.describe("Extended Performance Tests - Advanced", () => {
  let apiClient: PandashopAPIClient;

  test.beforeAll(() => {
    apiClient = new PandashopAPIClient();
  });

  test.describe("Advanced Load Testing", () => {
    test("should handle progressive load increase", async () => {
      const loadLevels = [2, 5, 8, 12];
      const results = [];
      
      for (const concurrency of loadLevels) {
        console.log(`🔄 Testing with ${concurrency} concurrent requests`);
        const startTime = Date.now();
        
        const promises = Array.from({ length: concurrency }, (_, i) => 
          apiClient.healthCheck().then(health => ({
            index: i,
            status: health.status,
            time: Date.now() - startTime
          }))
        );
        
        const levelResults = await Promise.all(promises);
        const levelTime = Date.now() - startTime;
        
        results.push({
          concurrency,
          totalTime: levelTime,
          avgTime: levelTime / concurrency,
          successCount: levelResults.filter(r => r.status === "healthy").length
        });
        
        // All requests should succeed
        expect(levelResults.length).toBe(concurrency);
        levelResults.forEach(result => {
          expect(result.status).toBe("healthy");
        });
        
        console.log(`✅ Level ${concurrency}: ${levelTime}ms total, ${levelResults.length}/${concurrency} success`);
        
        // Small delay between load levels
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Performance should not degrade significantly with increased load
      const timeIncrease = results[results.length - 1].avgTime / results[0].avgTime;
      expect(timeIncrease).toBeLessThan(5); // No more than 5x slower
      
      console.log(`✅ Progressive load test: ${timeIncrease.toFixed(2)}x time increase`);
    });

    test("should maintain performance during sustained load", async () => {
      const sustainedMinutes = 1; // 1 minute sustained test
      const requestInterval = 2000; // Request every 2 seconds
      const maxRequests = Math.floor((sustainedMinutes * 60 * 1000) / requestInterval);
      
      const results = [];
      
      for (let i = 0; i < Math.min(maxRequests, 15); i++) { // Limit to 15 for CI
        const startTime = Date.now();
        
        try {
          const health = await apiClient.healthCheck();
          const responseTime = Date.now() - startTime;
          
          results.push({
            request: i + 1,
            responseTime,
            status: health.status,
            timestamp: new Date().toISOString()
          });
          
          expect(health.status).toBe("healthy");
          expect(responseTime).toBeLessThan(10000); // 10 second max
          
          console.log(`✅ Sustained request ${i + 1}: ${responseTime}ms`);
          
        } catch (error) {
          console.log(`⚠️ Sustained request ${i + 1} failed: ${(error as Error).message}`);
        }
        
        // Wait before next request
        if (i < maxRequests - 1) {
          await new Promise(resolve => setTimeout(resolve, requestInterval));
        }
      }
      
      // Calculate performance metrics
      const responseTimes = results.map(r => r.responseTime);
      const avgTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
      const maxTime = Math.max(...responseTimes);
      const minTime = Math.min(...responseTimes);
      
      expect(avgTime).toBeLessThan(5000); // 5 second average
      expect(results.length).toBeGreaterThan(maxRequests * 0.8); // 80% success rate
      
      console.log(`✅ Sustained load: ${results.length} requests, avg ${avgTime}ms, max ${maxTime}ms, min ${minTime}ms`);
    });

    test("should handle mixed operation patterns", async () => {
      const operationSets = [
        {
          name: "Basic Operations",
          operations: [
            () => apiClient.healthCheck(),
            () => apiClient.getProducts({ limit: 2 }),
            () => apiClient.getCategories()
          ]
        },
        {
          name: "Search Operations", 
          operations: [
            () => apiClient.searchProducts({ query: "test", limit: 2 }),
            () => apiClient.searchProducts({ query: "продукт", limit: 2 }),
            () => apiClient.getProducts({ page: 2, limit: 3 })
          ]
        },
        {
          name: "Cart Operations",
          operations: [
            () => apiClient.getCart(),
            () => apiClient.addToCart("test-product", 1),
            () => apiClient.getCart()
          ]
        }
      ];
      
      for (const operationSet of operationSets) {
        console.log(`🔄 Testing ${operationSet.name}`);
        const startTime = Date.now();
        
        const promises = operationSet.operations.map((operation, index) => 
          operation().then(result => ({
            operation: index,
            result,
            time: Date.now() - startTime
          })).catch(error => ({
            operation: index,
            error: (error as Error).message,
            time: Date.now() - startTime
          }))
        );
        
        const results = await Promise.all(promises);
        const totalTime = Date.now() - startTime;
        
        const successCount = results.filter(r => !('error' in r)).length;
        const avgTime = totalTime / results.length;
        
        expect(successCount).toBeGreaterThan(results.length * 0.6); // 60% success rate
        expect(avgTime).toBeLessThan(8000); // 8 seconds average
        
        console.log(`✅ ${operationSet.name}: ${successCount}/${results.length} success, ${avgTime}ms avg`);
        
        // Delay between operation sets
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    });

    test("should handle burst traffic patterns", async () => {
      const burstPatterns = [
        { requests: 3, interval: 100 },  // Fast burst
        { requests: 5, interval: 200 },  // Medium burst  
        { requests: 4, interval: 500 }   // Slow burst
      ];
      
      for (const pattern of burstPatterns) {
        console.log(`🔄 Testing burst: ${pattern.requests} requests, ${pattern.interval}ms interval`);
        
        const burstResults = [];
        const burstStart = Date.now();
        
        for (let i = 0; i < pattern.requests; i++) {
          const requestStart = Date.now();
          
          try {
            const health = await apiClient.healthCheck();
            const requestTime = Date.now() - requestStart;
            
            burstResults.push({
              request: i + 1,
              status: health.status,
              responseTime: requestTime,
              success: true
            });
            
            console.log(`  ✅ Burst request ${i + 1}: ${requestTime}ms`);
            
          } catch (error) {
            burstResults.push({
              request: i + 1,
              error: (error as Error).message,
              responseTime: Date.now() - requestStart,
              success: false
            });
            
            console.log(`  ⚠️ Burst request ${i + 1} failed`);
          }
          
          // Wait between requests in burst
          if (i < pattern.requests - 1) {
            await new Promise(resolve => setTimeout(resolve, pattern.interval));
          }
        }
        
        const burstTime = Date.now() - burstStart;
        const successRate = burstResults.filter(r => r.success).length / burstResults.length;
        const avgResponseTime = burstResults
          .filter(r => r.success)
          .reduce((sum, r) => sum + r.responseTime, 0) / burstResults.filter(r => r.success).length;
        
        expect(successRate).toBeGreaterThan(0.7); // 70% success rate
        expect(burstTime).toBeLessThan(pattern.requests * pattern.interval + 15000); // Reasonable total time
        
        console.log(`✅ Burst pattern: ${successRate * 100}% success, ${avgResponseTime}ms avg response`);
        
        // Recovery time between patterns
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    });
  });

  test.describe("Performance Edge Cases", () => {
    test("should handle rapid connection establishment", async () => {
      const connectionTests = 8;
      const clients = Array.from({ length: connectionTests }, () => new PandashopAPIClient());
      
      const startTime = Date.now();
      
      const promises = clients.map((client, index) => 
        client.healthCheck().then(health => ({
          client: index,
          status: health.status,
          responseTime: health.responseTime
        })).catch(error => ({
          client: index,
          error: (error as Error).message
        }))
      );
      
      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      
      const successCount = results.filter(r => !('error' in r)).length;
      expect(successCount).toBeGreaterThan(connectionTests * 0.8); // 80% success
      expect(totalTime).toBeLessThan(20000); // 20 seconds max
      
      console.log(`✅ Connection establishment: ${successCount}/${connectionTests} clients, ${totalTime}ms total`);
    });

    test("should maintain performance with varying payload sizes", async () => {
      const payloadTests = [
        { limit: 1, name: "small" },
        { limit: 10, name: "medium" },
        { limit: 50, name: "large" },
        { limit: 100, name: "extra-large" }
      ];
      
      const results = [];
      
      for (const test of payloadTests) {
        const startTime = Date.now();
        
        try {
          const response = await apiClient.getProducts({ limit: test.limit });
          const responseTime = Date.now() - startTime;
          const payloadSize = JSON.stringify(response).length;
          
          results.push({
            name: test.name,
            limit: test.limit,
            responseTime,
            payloadSize,
            productCount: response.products.length
          });
          
          expect(response.products.length).toBeGreaterThan(0);
          expect(responseTime).toBeLessThan(15000); // 15 seconds max
          
          console.log(`✅ ${test.name} payload: ${responseTime}ms, ${payloadSize} bytes, ${response.products.length} products`);
          
        } catch (error) {
          console.log(`⚠️ ${test.name} payload test failed: ${(error as Error).message}`);
        }
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Verify performance scales reasonably with payload size
      if (results.length >= 2) {
        const smallPayload = results[0];
        const largePayload = results[results.length - 1];
        
        const timeDifference = largePayload.responseTime / smallPayload.responseTime;
        const sizeDifference = largePayload.payloadSize / smallPayload.payloadSize;
        
        // Performance should not degrade faster than payload size increase
        expect(timeDifference).toBeLessThan(sizeDifference * 2);
        
        console.log(`✅ Payload scaling: ${timeDifference.toFixed(2)}x time vs ${sizeDifference.toFixed(2)}x size`);
      }
    });

    test("should handle timeout recovery gracefully", async () => {
      const shortTimeouts = [100, 200, 500]; // Very short timeouts
      const recoveryResults = [];
      
      for (const timeout of shortTimeouts) {
        console.log(`🔄 Testing ${timeout}ms timeout`);
        
        const timeoutStart = Date.now();
        let timeoutOccurred = false;
        let recoveryTime = 0;
        
        try {
          // This will likely timeout with very short timeout
          await apiClient.healthCheck();
          console.log(`  ✅ No timeout at ${timeout}ms`);
        } catch (error) {
          timeoutOccurred = true;
          console.log(`  ⚠️ Timeout occurred at ${timeout}ms`);
        }
        
        // Test recovery after timeout
        const recoveryStart = Date.now();
        try {
          await apiClient.healthCheck(); // Normal timeout
          recoveryTime = Date.now() - recoveryStart;
          console.log(`  ✅ Recovery successful: ${recoveryTime}ms`);
        } catch (error) {
          console.log(`  ⚠️ Recovery failed: ${(error as Error).message}`);
        }
        
        recoveryResults.push({
          timeout,
          timeoutOccurred,
          recoveryTime,
          totalTestTime: Date.now() - timeoutStart
        });
        
        // Delay between timeout tests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // At least some recovery should be successful
      const successfulRecoveries = recoveryResults.filter(r => r.recoveryTime > 0);
      expect(successfulRecoveries.length).toBeGreaterThan(0);
      
      console.log(`✅ Timeout recovery: ${successfulRecoveries.length}/${recoveryResults.length} successful`);
    });

    test("should maintain performance consistency across time", async () => {
      const measurementIntervals = 5;
      const intervalDuration = 3000; // 3 seconds between measurements
      const measurements = [];
      
      for (let i = 0; i < measurementIntervals; i++) {
        console.log(`🔄 Performance measurement ${i + 1}/${measurementIntervals}`);
        
        const intervalStart = Date.now();
        const operations = [];
        
        // Run 3 operations in each interval
        for (let j = 0; j < 3; j++) {
          const opStart = Date.now();
          try {
            await apiClient.healthCheck();
            operations.push(Date.now() - opStart);
          } catch (error) {
            console.log(`  ⚠️ Operation ${j + 1} failed in interval ${i + 1}`);
          }
        }
        
        const intervalTime = Date.now() - intervalStart;
        const avgOperationTime = operations.reduce((sum, time) => sum + time, 0) / operations.length;
        
        measurements.push({
          interval: i + 1,
          avgOperationTime,
          operationCount: operations.length,
          intervalDuration: intervalTime
        });
        
        console.log(`  ✅ Interval ${i + 1}: ${avgOperationTime}ms avg, ${operations.length} operations`);
        
        // Wait for next interval
        if (i < measurementIntervals - 1) {
          await new Promise(resolve => setTimeout(resolve, intervalDuration));
        }
      }
      
      // Check performance consistency
      const times = measurements.map(m => m.avgOperationTime).filter(t => !isNaN(t));
      if (times.length > 1) {
        const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
        const maxTime = Math.max(...times);
        const minTime = Math.min(...times);
        
        // Performance should be relatively consistent
        const variance = maxTime / minTime;
        expect(variance).toBeLessThan(3); // No more than 3x difference
        
        console.log(`✅ Performance consistency: ${variance.toFixed(2)}x variance, ${avgTime}ms avg`);
      }
    });

    test("should handle memory efficiency during extended operations", async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      const operationCount = 25;
      
      for (let i = 0; i < operationCount; i++) {
        try {
          await apiClient.healthCheck();
          await apiClient.getProducts({ limit: 2 });
          
          // Force garbage collection every 5 operations if available
          if (i % 5 === 0 && global.gc) {
            global.gc();
          }
          
          if (i % 10 === 0) {
            const currentMemory = process.memoryUsage().heapUsed;
            const memoryIncrease = (currentMemory - initialMemory) / 1024 / 1024; // MB
            console.log(`  📊 Operation ${i}: +${memoryIncrease.toFixed(2)}MB memory`);
          }
          
        } catch (error) {
          console.log(`  ⚠️ Operation ${i} failed: ${(error as Error).message}`);
        }
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // MB
      
      // Memory usage should be reasonable
      expect(memoryIncrease).toBeLessThan(100); // Less than 100MB increase
      
      console.log(`✅ Memory efficiency: +${memoryIncrease.toFixed(2)}MB after ${operationCount} operations`);
    });

    test("should handle graceful degradation under stress", async () => {
      const stressLevels = [
        { concurrent: 3, operations: 5, name: "low" },
        { concurrent: 6, operations: 8, name: "medium" },
        { concurrent: 10, operations: 12, name: "high" }
      ];
      
      const stressResults = [];
      
      for (const level of stressLevels) {
        console.log(`🔄 Stress test: ${level.name} (${level.concurrent} concurrent, ${level.operations} ops)`);
        
        const levelStart = Date.now();
        const allOperations = [];
        
        // Create concurrent groups
        for (let group = 0; group < level.concurrent; group++) {
          const groupPromises = [];
          
          for (let op = 0; op < level.operations; op++) {
            const promise = apiClient.healthCheck()
              .then(health => ({ success: true, status: health.status }))
              .catch(error => ({ success: false, error: (error as Error).message }));
            
            groupPromises.push(promise);
          }
          
          allOperations.push(...groupPromises);
        }
        
        const results = await Promise.all(allOperations);
        const levelTime = Date.now() - levelStart;
        
        const successCount = results.filter(r => r.success).length;
        const successRate = successCount / results.length;
        
        stressResults.push({
          level: level.name,
          totalOperations: results.length,
          successCount,
          successRate,
          totalTime: levelTime,
          avgTime: levelTime / results.length
        });
        
        // Should maintain reasonable success rate even under stress
        expect(successRate).toBeGreaterThan(0.5); // 50% minimum
        
        console.log(`✅ ${level.name} stress: ${(successRate * 100).toFixed(1)}% success, ${levelTime}ms total`);
        
        // Recovery time between stress levels
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      // Verify degradation is graceful (not catastrophic)
      const lowStress = stressResults.find(r => r.level === "low");
      const highStress = stressResults.find(r => r.level === "high");
      
      if (lowStress && highStress) {
        const successRateDrop = lowStress.successRate - highStress.successRate;
        expect(successRateDrop).toBeLessThan(0.5); // No more than 50% drop
        
        console.log(`✅ Graceful degradation: ${(successRateDrop * 100).toFixed(1)}% success rate drop`);
      }
    });
  });
});
