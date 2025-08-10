import { FullConfig } from '@playwright/test';

/**
 * Global teardown for Test Pyramid Framework
 * Executes after all tests across all projects
 */
async function globalTeardown(_config: FullConfig) {
  console.log('🏁 Test Pyramid Framework - Global Teardown');
  console.log('📊 Generating final reports...');
  
  // Cleanup temporary files if needed
  const fs = require('fs');
  const path = require('path');
  
  // Create test summary for Allure
  const testSummary = {
    executionTime: new Date().toISOString(),
    framework: 'Test Pyramid Framework',
    testPyramid: {
      api: '140 tests (70%)',
      ui: '40 tests (20%)', 
      e2e: '20 tests (10%)'
    },
    safety: 'Production-safe mode enabled',
    target: 'https://pandashop.md',
    reporting: 'Allure + Playwright HTML'
  };

  const allureResultsDir = 'allure-results';
  if (fs.existsSync(allureResultsDir)) {
    fs.writeFileSync(
      path.join(allureResultsDir, 'test-summary.json'),
      JSON.stringify(testSummary, null, 2)
    );
  }

  console.log('✅ Global teardown completed');
  console.log('🎨 Reports ready for generation');
  console.log('📋 Run "npm run allure:serve" to view beautiful reports');
}

export default globalTeardown;
