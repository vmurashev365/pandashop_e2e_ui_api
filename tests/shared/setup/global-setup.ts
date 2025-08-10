import { FullConfig } from '@playwright/test';

/**
 * Global setup for Test Pyramid Framework
 * Executes before all tests across all projects
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting Test Pyramid Framework - Global Setup');
  console.log('📊 Test Distribution: 70% API, 20% UI, 10% E2E');
  console.log('🛡️ Safety Mode: Enabled (No real orders)');
  console.log('🎯 Target: https://pandashop.md');
  
  // Setup Allure environment
  const allureResultsDir = 'allure-results';
  const fs = require('fs');
  const path = require('path');
  
  // Ensure allure-results directory exists
  if (!fs.existsSync(allureResultsDir)) {
    fs.mkdirSync(allureResultsDir, { recursive: true });
  }

  // Create environment.properties file for Allure
  const environmentProperties = `
Test.Framework=Playwright + TypeScript
BDD.Framework=Cucumber/Gherkin  
API.Client=Axios + Zod Validation
Target.Site=https://pandashop.md
Test.Pyramid=200 tests (70% API, 20% UI, 10% E2E)
Safety.Mode=Production-safe (no real orders)
Browser.Support=Chrome, Firefox, Edge
Node.Version=${process.version}
OS=${process.platform}
Execution.Date=${new Date().toISOString()}
Test.Environment=Pandashop.md Live Site
GitHub.Integration=vmurashev365/pandashop_md selectors
Popup.Handling=Advanced popup management system
`;

  fs.writeFileSync(
    path.join(allureResultsDir, 'environment.properties'), 
    environmentProperties.trim()
  );

  // Create categories.json for Allure
  const categories = [
    {
      "name": "API Tests",
      "matchedStatuses": ["failed", "broken"],
      "messageRegex": ".*api.*"
    },
    {
      "name": "UI Component Tests", 
      "matchedStatuses": ["failed", "broken"],
      "messageRegex": ".*ui.*"
    },
    {
      "name": "E2E Integration Tests",
      "matchedStatuses": ["failed", "broken"],
      "messageRegex": ".*e2e.*"
    },
    {
      "name": "Performance Issues",
      "matchedStatuses": ["failed", "broken"], 
      "messageRegex": ".*timeout|performance|slow.*"
    },
    {
      "name": "Security Validation",
      "matchedStatuses": ["failed", "broken"],
      "messageRegex": ".*security|auth|cors.*"
    },
    {
      "name": "Network Connectivity",
      "matchedStatuses": ["failed", "broken"],
      "messageRegex": ".*network|connection|fetch.*"
    },
    {
      "name": "GitHub Integration",
      "matchedStatuses": ["failed", "broken"],
      "messageRegex": ".*github|selector|digi-product.*"
    },
    {
      "name": "Popup Handling",
      "matchedStatuses": ["failed", "broken"],
      "messageRegex": ".*popup|modal|overlay.*"
    }
  ];

  fs.writeFileSync(
    path.join(allureResultsDir, 'categories.json'),
    JSON.stringify(categories, null, 2)
  );

  console.log('✅ Global setup completed');
  console.log('📁 Allure configuration created');
  console.log('🎨 Beautiful reporting ready');
}

export default globalSetup;
