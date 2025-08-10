# Pandashop.md Test Automation Framework 🏗️

Комплексный фреймворк автоматизации тестирования для Pandashop.md, реализующий принципы **Test Pyramid** с правильным распределением тестов по уровням.

## 📊 Архитектура Test Pyramid

```
        🔺 E2E Tests (20 tests - 10%)
       🔷🔷 UI Component Tests (40 tests - 20%)  
    🔳🔳🔳🔳 API Tests (140 tests - 70%)
```

### Распределение тестов:
- **API Tests: 140 тестов (70%)** - Бизнес-логика, контракты, производительность
- **UI Component Tests: 40 тестов (20%)** - Компоненты и взаимодействия  
- **E2E Tests: 20 тестов (10%)** - Полные пользовательские сценарии

## 🛠️ Технологический стек

- **Playwright + TypeScript** - Единая платформа для всех уровней тестирования
- **Cucumber/Gherkin** - BDD сценарии для части API тестов (40 тестов)
- **Zod** - Валидация схем API и типизация во время выполнения
- **Faker.js** - Генерация тестовых данных
- **Allure** - Отчетность (опционально)

## 📁 Структура проекта

```
tests/
├── api/                     # API Tests (140 тестов)
│   ├── bdd/                 # Gherkin BDD сценарии (40 тестов)
│   │   ├── features/        # .feature файлы
│   │   ├── step-definitions/ # Шаги для Cucumber
│   │   └── support/         # Поддержка Cucumber
│   ├── pure/                # Чистые API тесты (60 тестов)
│   ├── contracts/           # Тесты контрактов API (20 тестов)
│   ├── performance/         # Тесты производительности (20 тестов)
│   ├── client/              # API клиент
│   └── helpers/             # Вспомогательные утилиты
├── ui/                      # UI Tests (40 тестов)
│   ├── components/          # Тесты компонентов
│   ├── pages/               # Page Object Model
│   └── shared/              # Общие UI утилиты
├── e2e/                     # E2E Tests (20 тестов)
│   ├── journeys/            # Пользовательские сценарии
│   └── flows/               # Бизнес-процессы
├── shared/                  # Общие ресурсы
│   ├── schemas/             # Zod схемы
│   ├── fixtures/            # Тестовые данные
│   └── utils/               # Общие утилиты
└── demo/                    # Демонстрационные тесты
```

## 🚀 Быстрый старт

### 1. Установка зависимостей
```bash
npm install
npx playwright install
```

### 2. Запуск демо-тестов
```bash
# Демонстрация коннективности и архитектуры
npm run test:demo

# Или через Playwright CLI
npx playwright test tests/demo --reporter=line
```

### 3. Запуск тестов по уровням

```bash
# API тесты (все 140)
npm run test:api

# Только BDD API тесты (40)
npm run test:api:bdd

# Только чистые API тесты (100)
npm run test:api:pure

# UI компонентные тесты (40)
npm run test:ui

# E2E тесты (20)
npm run test:e2e

# Вся пирамида (200 тестов)
npm run test:pyramid
```

## 📋 Доступные скрипты

```json
{
  "test:pyramid": "Запуск всех 200 тестов пирамиды",
  "test:api": "Все API тесты (140)",
  "test:api:bdd": "BDD API тесты с Cucumber (40)",
  "test:api:pure": "Чистые API тесты (100)", 
  "test:api:contracts": "Тесты контрактов API",
  "test:api:performance": "Тесты производительности API",
  "test:ui": "UI компонентные тесты (40)",
  "test:e2e": "E2E тесты (20)",
  "test:demo": "Демонстрационные тесты",
  "cucumber:api": "BDD API тесты через Cucumber"
}
```

## 🔧 Конфигурация

### Playwright Configuration
- **Проекты**: Отдельные конфигурации для каждого типа тестов
- **Браузеры**: Chrome, Firefox, Safari для E2E/UI
- **Таймауты**: Различные для разных уровней тестирования
- **Отчеты**: HTML, JSON, JUnit, Line reporters

### Environment Variables
```bash
PANDASHOP_BASE_URL=https://pandashop.md
TEST_ENV=production
DEBUG=false
```

## 📊 API Testing

### BDD API Tests (40 тестов)
```gherkin
# Пример: tests/api/bdd/features/catalog-api.feature
Функция: API Каталога товаров
  Сценарий: Получение списка товаров
    Когда я отправляю GET запрос на "/api/v1/products"
    Тогда код ответа должен быть 200
    И тело ответа содержит список товаров
```

### Pure API Tests (100 тестов)
```typescript
// Пример: tests/api/pure/cart-api.spec.ts
test('should add item to cart', async () => {
  const cart = await apiClient.addToCart(productId, 2);
  expect(cart.items).toHaveLength(1);
  expect(cart.total).toBeGreaterThan(0);
});
```

### API Client
Типизированный клиент с автоматической валидацией через Zod:
```typescript
const products = await apiClient.getProducts({ limit: 20 });
// products автоматически валидируется ProductListResponseSchema
```

## 🎯 UI Component Testing

Тестирование компонентов интерфейса в изоляции:
```typescript
test('product card should display correctly', async ({ page }) => {
  await page.goto('/catalog');
  await expect(page.locator('.product-card')).toBeVisible();
});
```

## 🛤️ E2E Testing

Полные пользовательские сценарии:
```typescript
test('complete purchase journey', async ({ page }) => {
  await page.goto('/');
  // Полный флоу покупки от поиска до оплаты
});
```

## 📈 Отчетность

### HTML Reports
```bash
npx playwright show-report
```

### Allure Reports (опционально)
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

### 1. Test Pyramid Принципы
- **70% API** - быстрые, надежные, покрывают бизнес-логику
- **20% UI** - компоненты и интеграции  
- **10% E2E** - критические пользовательские сценарии

### 2. Именование тестов
- API: `test('should validate product schema', ...)`
- UI: `test('product filter should work correctly', ...)`  
- E2E: `test('user can complete purchase journey', ...)`

### 3. Данные для тестов
- Генерация через Faker.js
- Валидация через Zod схемы
- Очистка после тестов

### 4. Page Object Model
Для UI и E2E тестов используется POM паттерн:
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
    npm run test:api          # 70% - быстро
    npm run test:ui           # 20% - средне  
    npm run test:e2e:critical # 10% - медленно
```

### Parallel Execution
- API тесты: параллельно по проектам
- UI тесты: параллельно по браузерам
- E2E тесты: последовательно (критические)

## 📚 Дополнительные ресурсы

- [Playwright Documentation](https://playwright.dev/)
- [Cucumber.js Documentation](https://cucumber.io/docs/cucumber/)
- [Zod Documentation](https://zod.dev/)
- [Test Pyramid Concept](https://martinfowler.com/articles/practical-test-pyramid.html)

## 🤝 Contributing

1. Fork репозиторий
2. Создайте feature branch
3. Следуйте принципам Test Pyramid
4. Добавьте тесты для нового функционала
5. Убедитесь что все тесты проходят
6. Создайте Pull Request

---

**🎯 Цель**: Создать надежный, масштабируемый и поддерживаемый фреймворк тестирования, который следует лучшим практикам индустрии и обеспечивает быструю обратную связь при разработке.
