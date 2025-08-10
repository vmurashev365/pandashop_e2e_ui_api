# 🏗️ Test Pyramid Framework для Pandashop.md

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=flat&logo=playwright&logoColor=white)](https://playwright.dev/)
[![Cucumber](https://img.shields.io/badge/Cucumber-23D96C?style=flat&logo=cucumber&logoColor=white)](https://cucumber.io/)

**Современный фреймворк автоматизации тестирования с правильной архитектурой Test Pyramid**

## 📊 Архитектура тестов

```
        🔺 E2E (20 tests - 10%)
       🔷🔷 UI Components (40 tests - 20%)  
    🔳🔳🔳🔳 API Tests (140 tests - 70%)
```

## 🚀 Быстрый старт

```bash
# Клонирование репозитория
git clone <repo-url>
cd pandashop-test-pyramid

# Установка зависимостей
npm install

# Установка браузеров для Playwright
npm run install:browsers

# Запуск всех тестов (Test Pyramid)
npm test

# Запуск по типам
npm run test:api       # API тесты (BDD + Pure)
npm run test:ui        # UI компонентные тесты
npm run test:e2e       # E2E тесты
```

## 🛠️ Технологии

- **Playwright** - кроссплатформенное тестирование
- **TypeScript** - строгая типизация
- **Cucumber/Gherkin** - BDD сценарии на русском языке
- **Zod** - runtime валидация API схем
- **ESLint/Prettier** - качество кода

## 📁 Структура проекта

```
tests/
├── api/                    # 140 API тестов (70%)
│   ├── bdd/               # 40 BDD Gherkin сценариев
│   ├── pure/              # 100 чистых API тестов
│   ├── client/            # API клиент с валидацией
│   └── helpers/           # Утилиты для API тестов
├── ui/                     # 40 UI тестов (20%)
├── e2e/                    # 20 E2E тестов (10%)
└── shared/                 # Общие ресурсы
    ├── schemas/           # Zod схемы
    └── fixtures/          # Тестовые данные
```

## ⚡ Команды

```bash
# Тестирование
npm test                   # Вся Test Pyramid
npm run test:smoke         # Smoke тесты
npm run test:performance   # Нагрузочные тесты

# Разработка
npm run lint              # Проверка кода
npm run format            # Форматирование
npm run type-check        # Проверка типов

# Отчеты
npm run report            # Просмотр отчетов
```

## 🎯 Преимущества

✅ **Быстрое выполнение** - 70% тестов на API уровне  
✅ **Надежность** - типизированные API клиенты  
✅ **Читаемость** - BDD сценарии на русском  
✅ **Масштабируемость** - готовая архитектура для роста  
✅ **Качество** - ESLint, Prettier, строгие типы  

## 📋 Статус разработки

- ✅ Фреймворк создан и протестирован
- ✅ API client с Pandashop.md готов
- ✅ BDD scenarios структура готова
- ✅ Демо тесты работают
- 🔄 В разработке: имплементация 200 тестов

## 🤝 Команда

Готов к использованию командой для разработки 200 тестов согласно Test Pyramid архитектуре.

---

**[Документация](README.md) | [Статус проекта](PROJECT_STATUS.md) | [Отчет](SUCCESS_REPORT.md)**
