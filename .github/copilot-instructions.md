# Test Pyramid Framework - Copilot Instructions

## Project Overview
Modern test automation framework for e-commerce testing implementing proper test pyramid architecture:
- **200 total tests**: 20 E2E, 40 UI Components, 140 API tests
- **BDD Approach**: All tests use Gherkin syntax with Cucumber
- **Tech Stack**: Playwright + TypeScript + Cucumber + Zod schemas

## Architecture Principles

### Test Distribution:
- **20 E2E Tests (10%)**: Critical user journeys, cross-browser scenarios
- **40 UI Tests (20%)**: Component testing, visual regression, responsive design  
- **140 API Tests (70%)**: 40 Gherkin BDD + 100 Pure API (contracts, performance, security)

### Technology Choices:
- **E2E & UI**: Playwright + TypeScript + Cucumber
- **API Gherkin**: Cucumber + Playwright HTTP
- **API Pure**: Playwright Test + Axios + Zod schemas + Joi validation

## Project Structure
```
tests/
├── e2e/                 # 20 E2E tests
│   ├── features/        # Gherkin .feature files
│   ├── steps/           # Step definitions
│   └── support/         # Hooks and utilities
├── ui/                  # 40 UI component tests  
│   ├── features/        # Component Gherkin scenarios
│   ├── steps/           # UI step definitions
│   └── components/      # Page objects
├── api/                 # 140 API tests
│   ├── bdd/             # 40 Gherkin BDD API tests
│   │   ├── features/
│   │   └── steps/
│   ├── contracts/       # 30 Schema validation tests
│   ├── performance/     # 20 Performance tests
│   ├── security/        # 25 Security tests
│   ├── edge-cases/      # 25 Edge case tests
│   └── client/          # API client wrapper
└── shared/
    ├── schemas/         # Zod schemas
    ├── fixtures/        # Test data
    └── utils/           # Common utilities
```

## Coding Standards
- TypeScript strict mode enabled
- ESLint + Prettier for code formatting
- Zod for runtime type validation
- Page Object Model for UI tests
- API Client pattern for HTTP requests
- Cucumber hooks for setup/teardown
