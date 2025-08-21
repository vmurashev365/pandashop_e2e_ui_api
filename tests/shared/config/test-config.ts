/**
 * Centralized Test Configuration
 * Single source of truth for all test constants
 * Follows DRY principle and makes maintenance easier
 */

export const TestConfig = {
  // Base URLs for different environments
  baseUrl: process.env.BASE_URL || 'https://www.pandashop.md',
  apiBaseUrl: process.env.API_BASE_URL || 'https://www.pandashop.md',
  
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
    category: '/category',
    products: '/products'
  },
  
  // API endpoints
  api: {
    sitemapProducts: '/SitemapsProducts.ashx?lng=ru',
    health: '/',
    search: '/search',
    products: '/api/products'
  },
  
  // Timeouts and performance
  timeouts: {
    navigation: 30000,
    element: 10000,
    short: 2000,
    api: 30000,
    pageLoad: 10000
  },
  
  performance: {
    fastResponse: 1000,
    normalResponse: 3000,
    slowResponse: 5000
  },
  
  // Test data constants
  testData: {
    searchTerms: {
      phones: 'телефон',
      general: 'товары',
      laptop: 'laptop',
      mouse: 'mouse'
    },
    testEmail: 'test@example.com',
    testMessage: 'Тестовое сообщение',
    currency: 'MDL',
    availability: ['available', 'out_of_stock', 'pre_order'] as const,
    priceRanges: {
      low: { min: 50, max: 200 },
      medium: { min: 200, max: 500 },
      high: { min: 500, max: 1000 }
    }
  },
  
  // Browser settings
  browser: {
    userAgent: 'Mozilla/5.0 (compatible; Test-Framework/1.0)',
    viewport: {
      width: 1280,
      height: 720
    }
  },
  
  // API defaults
  apiDefaults: {
    timeout: 30000,
    retryCount: 2,
    defaultLimit: 20,
    maxLimit: 100,
    defaultPage: 1
  },
  
  // Helper methods
  getFullUrl: (path: string = '') => {
    const config = TestConfig;
    return `${config.baseUrl}${path}`;
  },
  
  getApiUrl: (endpoint: string) => {
    const config = TestConfig;
    return `${config.apiBaseUrl}${endpoint}`;
  },
  
  getSitemapUrl: (page: number = 1) => {
    const config = TestConfig;
    return config.getApiUrl(`${config.api.sitemapProducts}&page=${page}`);
  }
} as const;

export type TestConfigType = typeof TestConfig;
