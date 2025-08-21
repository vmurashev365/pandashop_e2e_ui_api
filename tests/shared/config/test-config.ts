/**
 * Centralized Test Configuration
 * Follows POM principles - no hardcoded URLs in tests
 */

export const TestConfig = {
  // Base URLs for different environments
  baseUrl: process.env.BASE_URL || 'https://www.pandashop.md',
  
  // Different environments
  environments: {
    production: 'https://www.pandashop.md',
    staging: 'https://staging.pandashop.md',
    local: 'http://localhost:3000'
  },
  
  // Page paths
  pages: {
    home: '/',
    catalog: '/catalog',
    cart: '/cart',
    search: '/search',
    category: '/category'
  },
  
  // Timeouts
  timeouts: {
    navigation: 30000,
    element: 10000,
    short: 2000
  },
  
  // Test data
  testData: {
    searchTerms: {
      phones: 'телефон',
      general: 'товары'
    },
    testEmail: 'test@example.com',
    testMessage: 'Тестовое сообщение'
  }
} as const;

export type TestConfigType = typeof TestConfig;
