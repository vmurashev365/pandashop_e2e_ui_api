import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration with Allure Reporting
 * Test Pyramid Framework with beautiful reporting
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test directory structure
  testDir: './tests',
  
  // Global test patterns
  testMatch: [
    'tests/api/**/*.spec.ts',
    'tests/ui/**/*.spec.ts', 
    'tests/e2e/**/*.spec.ts'
  ],

  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 4,
  
  // Timeouts
  timeout: 60000,
  expect: {
    timeout: 15000
  },

  // Reporter configuration with Allure
  reporter: [
    ['html', { 
      outputFolder: 'playwright-report',
      open: process.env.CI ? 'never' : 'on-failure'
    }],
    ['allure-playwright', {
      outputFolder: 'allure-results',
      suiteTitle: 'Pandashop Test Pyramid',
      categories: [
        {
          name: 'API Tests',
          matchedStatuses: ['failed', 'broken'],
          messageRegex: /.*api.*/i
        },
        {
          name: 'UI Tests', 
          matchedStatuses: ['failed', 'broken'],
          messageRegex: /.*ui.*/i
        },
        {
          name: 'E2E Tests',
          matchedStatuses: ['failed', 'broken'], 
          messageRegex: /.*e2e.*/i
        },
        {
          name: 'Performance Issues',
          matchedStatuses: ['failed', 'broken'],
          messageRegex: /.*timeout|performance|slow.*/i
        },
        {
          name: 'Security Issues',
          matchedStatuses: ['failed', 'broken'],
          messageRegex: /.*security|auth|cors.*/i
        }
      ],
      environmentInfo: {
        'Test Framework': 'Playwright + TypeScript',
        'BDD Framework': 'Cucumber/Gherkin',
        'API Client': 'Axios + Zod Validation', 
        'Target Site': 'https://pandashop.md',
        'Test Pyramid': '200 tests (70% API, 20% UI, 10% E2E)',
        'Safety Mode': 'Production-safe (no real orders)',
        'Browser Support': 'Chrome, Firefox, Edge',
        'Node Version': process.version,
        'OS': process.platform
      }
    }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['line']
  ],

  // Global setup and teardown
  globalSetup: require.resolve('./tests/shared/setup/global-setup.ts'),
  globalTeardown: require.resolve('./tests/shared/setup/global-teardown.ts'),

  // Test configuration
  use: {
    // Base URL for testing
    baseURL: 'https://pandashop.md',
    
    // Browser settings
    headless: process.env.HEADED !== 'true',
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
    
    // Screenshots and videos
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    
    // API testing
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'User-Agent': 'Pandashop-Test-Pyramid/1.0'
    },
    
    // Timeouts
    actionTimeout: 10000,
    navigationTimeout: 30000,
    
    // Test metadata
    testIdAttribute: 'data-testid'
  },

  // Project configurations for different test types
  projects: [
    // API Tests - Fast execution
    {
      name: 'api-tests',
      testMatch: 'tests/api/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        headless: true
      },
      timeout: 30000
    },

    // UI Component Tests - Chrome
    {
      name: 'ui-chrome',
      testMatch: 'tests/ui/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      }
    },

    // UI Component Tests - Firefox
    {
      name: 'ui-firefox',
      testMatch: 'tests/ui/**/*.spec.ts',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 }
      }
    },

    // UI Component Tests - Mobile
    {
      name: 'ui-mobile',
      testMatch: 'tests/ui/**/*.spec.ts',
      use: {
        ...devices['iPhone 13'],
      }
    },

    // E2E Tests - Chrome (Safe mode)
    {
      name: 'e2e-chrome',
      testMatch: 'tests/e2e/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
      timeout: 90000
    },

    // E2E Tests - Firefox (Safe mode)
    {
      name: 'e2e-firefox', 
      testMatch: 'tests/e2e/**/*.spec.ts',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 }
      },
      timeout: 90000
    },

    // Performance Tests
    {
      name: 'performance',
      testMatch: 'tests/api/performance/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        headless: true
      },
      timeout: 120000,
      retries: 0 // No retries for performance tests
    },

    // Security Tests
    {
      name: 'security',
      testMatch: 'tests/api/security/**/*.spec.ts', 
      use: {
        ...devices['Desktop Chrome'],
        headless: true
      },
      timeout: 60000
    }
  ],

  // Output directories
  outputDir: 'test-results/'
  
  // Note: Using live Pandashop.md site for testing
  // No local web server needed
});
