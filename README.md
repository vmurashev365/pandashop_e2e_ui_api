# Pandashop.md Test Automation Framework 🏗️

Comprehensive test automation framework for Pandashop.md implementing **Test Pyramid** principles with proper test distribution across different levels.

## 📊 Test Pyramid Architecture

```
        🔺 E2E Tests (20 tests - 10%)
       🔷🔷 UI Component Tests (40 tests - 20%)  
    🔳🔳🔳🔳 API Tests (140 tests - 70%)
```

### Test Distribution:
- **API Tests: 140 tests (70%)** - Business logic, contracts, and performance
- **UI Component Tests: 40 tests (20%)** - Component interactions and behavior  
- **E2E Tests: 20 tests (10%)** - Complete user journeys and critical flows

## 🛠️ Technology Stack

- **Playwright + TypeScript** - Unified platform for all testing levels
- **Cucumber/Gherkin** - BDD scenarios for API tests (40 tests)
- **Zod** - API schema validation and runtime type checking
- **Faker.js** - Test data generation
- **Allure** - Advanced reporting (optional)

## 📁 Project Structure

```
tests/
├── api/                     # API Tests (140 tests)
│   ├── bdd/                 # Gherkin BDD scenarios (40 tests)
│   │   ├── features/        # .feature files
│   │   ├── step-definitions/ # Cucumber step definitions
│   │   └── support/         # Cucumber support files
│   ├── pure/                # Pure API tests (60 tests)
│   ├── contracts/           # API contract tests (20 tests)
│   ├── performance/         # Performance tests (20 tests)
│   ├── client/              # API client implementation
│   └── helpers/             # Test utilities
├── ui/                      # UI Tests (40 tests)
│   ├── components/          # Component tests
│   ├── pages/               # Page Object Model
│   └── shared/              # Shared UI utilities
├── e2e/                     # E2E Tests (20 tests)
│   ├── journeys/            # User journey scenarios
│   └── flows/               # Business process flows
├── shared/                  # Shared resources
│   ├── schemas/             # Zod schemas
│   ├── fixtures/            # Test data fixtures
│   └── utils/               # Common utilities
└── demo/                    # Demo and connectivity tests
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
npx playwright install
```

### 2. Run Demo Tests
```bash
# Connectivity and architecture demonstration
npm run test:demo

# Or using Playwright CLI
npx playwright test tests/demo --reporter=line
```

### 3. Run Tests by Level

```bash
# API tests (all 140)
npm run test:api

# BDD API tests only (40)
npm run test:api:bdd

# Pure API tests only (100)
npm run test:api:pure

# UI component tests (40)
npm run test:ui

# E2E tests (20)
npm run test:e2e

# Complete pyramid (200 tests)
npm run test:pyramid
```

## 📋 Available Scripts

```json
{
  "test:pyramid": "Run all 200 pyramid tests",
  "test:api": "All API tests (140)",
  "test:api:bdd": "BDD API tests with Cucumber (40)",
  "test:api:pure": "Pure API tests (100)", 
  "test:api:contracts": "API contract tests",
  "test:api:performance": "API performance tests",
  "test:ui": "UI component tests (40)",
  "test:e2e": "E2E tests (20)",
  "test:demo": "Demo and connectivity tests",
  "cucumber:api": "BDD API tests via Cucumber"
}
```

## 🔧 Configuration

### Playwright Configuration
- **Projects**: Separate configurations for each test type
- **Browsers**: Chrome, Firefox, Safari for E2E/UI
- **Timeouts**: Different settings for each testing level
- **Reports**: HTML, JSON, JUnit, Line reporters

### Environment Variables
```bash
PANDASHOP_BASE_URL=https://pandashop.md
TEST_ENV=production
DEBUG=false
```

## 📊 API Testing

### BDD API Tests (40 tests)
```gherkin
# Example: tests/api/bdd/features/catalog-api.feature
Feature: Product Catalog API
  Scenario: Retrieve product list
    When I send GET request to "/api/v1/products"
    Then response status should be 200
    And response body contains product list
```

### Pure API Tests (100 tests)
```typescript
// Example: tests/api/pure/cart-api.spec.ts
test('should add item to cart', async () => {
  const cart = await apiClient.addToCart(productId, 2);
  expect(cart.items).toHaveLength(1);
  expect(cart.total).toBeGreaterThan(0);
});
```

### API Client
Type-safe client with automatic Zod validation:
```typescript
const products = await apiClient.getProducts({ limit: 20 });
// products are automatically validated by ProductListResponseSchema
```

## 🎯 UI Component Testing

Testing interface components in isolation:
```typescript
test('product card should display correctly', async ({ page }) => {
  await page.goto('/catalog');
  await expect(page.locator('.product-card')).toBeVisible();
});
```

## 🛤️ E2E Testing

Complete user journey scenarios:
```typescript
test('complete purchase journey', async ({ page }) => {
  await page.goto('/');
  // Full purchase flow from search to payment
});
```

## 📈 Reporting

### HTML Reports
```bash
npx playwright show-report
```

### Allure Reports (optional)
```bash
npm run allure:generate
npm run allure:open
```

## 🔍 Debugging

### Debug Mode
```bash
DEBUG=true npx playwright test --debug
```

### VS Code Extensions
- Playwright Test for VS Code
- Cucumber (Gherkin) Full Support

## 📝 Best Practices

### 1. Test Pyramid Principles
- **70% API** - Fast, reliable, business logic coverage
- **20% UI** - Component and integration testing  
- **10% E2E** - Critical user scenarios

### 2. Test Naming Conventions
- API: `test('should validate product schema', ...)`
- UI: `test('product filter should work correctly', ...)`  
- E2E: `test('user can complete purchase journey', ...)`

### 3. Test Data Management
- Generation via Faker.js
- Validation through Zod schemas
- Cleanup after test execution

### 4. Page Object Model
UI and E2E tests use POM pattern:
```typescript
class ProductPage {
  async addToCart(productId: string) { /* ... */ }
  async getPrice() { /* ... */ }
}
```

## 🚦 CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run Test Pyramid
  run: |
    npm run test:api          # 70% - fast execution
    npm run test:ui           # 20% - medium speed  
    npm run test:e2e:critical # 10% - slow but critical
```

### Parallel Execution
- API tests: parallel by projects
- UI tests: parallel by browsers
- E2E tests: sequential (critical scenarios)

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Cucumber.js Documentation](https://cucumber.io/docs/cucumber/)
- [Zod Documentation](https://zod.dev/)
- [Test Pyramid Concept](https://martinfowler.com/articles/practical-test-pyramid.html)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Follow Test Pyramid principles
4. Add tests for new functionality
5. Ensure all tests pass
6. Create Pull Request

---

**🎯 Goal**: Create a reliable, scalable and maintainable testing framework that follows industry best practices and provides rapid feedback during development.
