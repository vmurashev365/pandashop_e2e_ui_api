/**
 * Cucumber configuration for Test Pyramid Framework
 * Supports BDD scenarios for E2E, UI, and API tests
 */

const common = {
  requireModule: ['ts-node/register'],
  require: ['tests/**/*.ts'],
  format: [
    'progress-bar',
    'html:reports/cucumber-report.html',
    'json:reports/cucumber-report.json',
    'allure-cucumberjs/reporter:allure-results/cucumber',
    '@cucumber/pretty-formatter'
  ],
  formatOptions: {
    snippetInterface: 'async-await'
  },
  publishQuiet: true,
  dryRun: false,
  failFast: false,
  strict: true,
  worldParameters: {
    baseUrl: process.env.BASE_URL || 'https://pandashop.md',
    headless: process.env.HEADLESS !== 'false',
    slowMo: parseInt(process.env.SLOW_MO || '0'),
    timeout: parseInt(process.env.TIMEOUT || '30000')
  }
};

// E2E Tests Configuration
const e2eConfig = {
  ...common,
  paths: ['tests/e2e/features/**/*.feature'],
  require: [
    'tests/e2e/steps/**/*.ts',
    'tests/e2e/support/**/*.ts',
    'tests/shared/utils/**/*.ts'
  ],
  tags: process.env.TAGS || 'not @skip',
  parallel: parseInt(process.env.PARALLEL || '2')
};

// UI Component Tests Configuration  
const uiConfig = {
  ...common,
  paths: ['tests/ui/features/**/*.feature'],
  require: [
    'tests/ui/steps/**/*.ts',
    'tests/ui/components/**/*.ts',
    'tests/shared/utils/**/*.ts'
  ],
  tags: process.env.TAGS || 'not @skip',
  parallel: parseInt(process.env.PARALLEL || '4')
};

// API BDD Tests Configuration
const apiConfig = {
  ...common,
  paths: ['tests/api/bdd/features/**/*.feature'],
  require: [
    'tests/api/bdd/steps/**/*.ts',
    'tests/api/client/**/*.ts',
    'tests/shared/utils/**/*.ts'
  ],
  tags: process.env.TAGS || 'not @skip',
  parallel: parseInt(process.env.PARALLEL || '8')
};

module.exports = {
  default: e2eConfig,
  e2e: e2eConfig,
  ui: uiConfig,
  api: apiConfig
};
