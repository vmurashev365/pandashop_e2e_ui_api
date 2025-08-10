import { Given, When, Then, Before, After } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { apiClient } from "../../client/pandashop-api-client";
import {
  APITestHelpers,
  TestDataGenerator,
} from "../../helpers/api-test-helpers";
import { World } from "../support/world";

// Extend World type for this step definitions
declare module "../support/world" {
  interface World {
    response?: any;
    responseTime?: number;
    startTime?: number;
    testData?: any;
    headers?: Record<string, string>;
  }
}

/**
 * Background Steps - Common setup for all scenarios
 */

Given("API Pandashop.md доступно", async function (this: World) {
  // Verify API health
  try {
    const health = await apiClient.healthCheck();
    expect(health.status).toBe("healthy");
    this.testData = { apiHealthy: true };
  } catch (error) {
    throw new Error(`API недоступно: ${error}`);
  }
});

Given(
  "заголовки запроса содержат {string}",
  async function (this: World, headerString: string) {
    const [key, value] = headerString.split(": ");
    this.headers = { ...this.headers, [key]: value };
    apiClient.setHeaders(this.headers);
  },
);

/**
 * Action Steps - When steps that perform actions
 */

When(
  "я отправляю GET запрос на {string}",
  async function (this: World, endpoint: string) {
    this.startTime = Date.now();

    try {
      this.response = await apiClient.request({
        method: "GET",
        url: endpoint,
      });
      this.responseTime = Date.now() - this.startTime;
    } catch (error: any) {
      this.response = error.response;
      this.responseTime = Date.now() - this.startTime;
    }
  },
);

When(
  "я отправляю GET запрос на {string} с параметрами:",
  async function (this: World, endpoint: string, dataTable) {
    this.startTime = Date.now();

    // Convert data table to params object
    const params: Record<string, any> = {};
    dataTable.hashes().forEach((row: any) => {
      params[row.параметр] = row.значение;
    });

    try {
      this.response = await apiClient.request({
        method: "GET",
        url: endpoint,
        params,
      });
      this.responseTime = Date.now() - this.startTime;
    } catch (error: any) {
      this.response = error.response;
      this.responseTime = Date.now() - this.startTime;
    }
  },
);

When(
  "я отправляю OPTIONS запрос на {string}",
  async function (this: World, endpoint: string) {
    this.startTime = Date.now();

    try {
      this.response = await apiClient.request({
        method: "OPTIONS",
        url: endpoint,
      });
      this.responseTime = Date.now() - this.startTime;
    } catch (error: any) {
      this.response = error.response;
      this.responseTime = Date.now() - this.startTime;
    }
  },
);

/**
 * Assertion Steps - Then steps that verify results
 */

Then(
  "код ответа должен быть {int}",
  async function (this: World, expectedStatus: number) {
    expect(this.response.status).toBe(expectedStatus);
  },
);

Then("тело ответа содержит список товаров", async function (this: World) {
  const data = this.response.data;
  expect(data).toBeDefined();
  expect(data.data).toBeDefined();
  expect(Array.isArray(data.data)).toBe(true);
  expect(data.pagination).toBeDefined();
});

Then(
  "каждый товар содержит обязательные поля:",
  async function (this: World, dataTable) {
    const products = this.response.data.data;
    const requiredFields = dataTable.hashes();

    expect(products.length).toBeGreaterThan(0);

    products.forEach((product: any) => {
      requiredFields.forEach((field: any) => {
        expect(product[field.поле]).toBeDefined();

        // Validate field type
        switch (field.тип) {
          case "string":
            expect(typeof product[field.поле]).toBe("string");
            break;
          case "number":
            expect(typeof product[field.поле]).toBe("number");
            break;
          case "boolean":
            expect(typeof product[field.поле]).toBe("boolean");
            break;
        }
      });
    });
  },
);

Then(
  "время ответа не превышает {int} мс",
  async function (this: World, maxTime: number) {
    expect(this.responseTime).toBeLessThanOrEqual(maxTime);
  },
);

Then(
  "тело ответа содержит товар с ID {string}",
  async function (this: World, productId: string) {
    const product = this.response.data;
    expect(product.id).toBe(productId);
  },
);

Then(
  "товар содержит полную информацию:",
  async function (this: World, dataTable) {
    const product = this.response.data;
    const requiredFields = dataTable.hashes();

    requiredFields.forEach((field: any) => {
      if (field.обязательно === "да") {
        expect(product[field.поле]).toBeDefined();
        expect(product[field.поле]).not.toBeNull();

        if (typeof product[field.поле] === "string") {
          expect(product[field.поле].length).toBeGreaterThan(0);
        }
      }
    });
  },
);

Then("тело ответа содержит сообщение об ошибке", async function (this: World) {
  const data = this.response.data;
  expect(data.error || data.message).toBeDefined();
});

Then(
  "заголовок {string} содержит {string}",
  async function (this: World, headerName: string, expectedValue: string) {
    const headerValue = this.response.headers[headerName.toLowerCase()];
    expect(headerValue).toContain(expectedValue);
  },
);

Then("тело ответа содержит результаты поиска", async function (this: World) {
  const data = this.response.data;
  expect(data.data).toBeDefined();
  expect(Array.isArray(data.data)).toBe(true);
  expect(data.searchQuery).toBeDefined();
  expect(data.pagination).toBeDefined();
});

Then(
  "найденные товары содержат слово {string} в названии или описании",
  async function (this: World, searchTerm: string) {
    const products = this.response.data.data;

    products.forEach((product: any) => {
      const productText =
        `${product.name} ${product.description}`.toLowerCase();
      expect(productText).toContain(searchTerm.toLowerCase());
    });
  },
);

Then(
  "количество результатов не превышает {int}",
  async function (this: World, maxCount: number) {
    const products = this.response.data.data;
    expect(products.length).toBeLessThanOrEqual(maxCount);
  },
);

Then(
  "тело ответа содержит пустой список товаров",
  async function (this: World) {
    const data = this.response.data;
    expect(data.data).toEqual([]);
  },
);

Then(
  "общее количество результатов равно {int}",
  async function (this: World, expectedTotal: number) {
    const pagination = this.response.data.pagination;
    expect(pagination.total).toBe(expectedTotal);
  },
);

Then(
  "все товары в ответе принадлежат категории {string}",
  async function (this: World, categoryId: string) {
    const products = this.response.data.data;

    products.forEach((product: any) => {
      expect(product.categoryId).toBe(categoryId);
    });
  },
);

Then(
  "все товары в ответе имеют цену от {int} до {int} MDL",
  async function (this: World, minPrice: number, maxPrice: number) {
    const products = this.response.data.data;

    products.forEach((product: any) => {
      expect(product.price).toBeGreaterThanOrEqual(minPrice);
      expect(product.price).toBeLessThanOrEqual(maxPrice);
      expect(product.currency).toBe("MDL");
    });
  },
);

Then(
  "в ответе содержится информация о пагинации:",
  async function (this: World, dataTable) {
    const pagination = this.response.data.pagination;
    const expectedValues = dataTable.hashes()[0];

    Object.keys(expectedValues).forEach((field) => {
      const expectedValue = expectedValues[field];
      const actualValue = pagination[field];

      if (expectedValue.startsWith(">=")) {
        const minValue = parseInt(expectedValue.substring(2));
        expect(actualValue).toBeGreaterThanOrEqual(minValue);
      } else {
        expect(actualValue).toBe(parseInt(expectedValue) || expectedValue);
      }
    });
  },
);

Then(
  "тело ответа содержит сообщение об ошибке валидации",
  async function (this: World) {
    const data = this.response.data;
    expect(data.error || data.message).toBeDefined();
    expect(data.error || data.message).toContain("validation" || "валидация");
  },
);

Then("тело ответа содержит список категорий", async function (this: World) {
  const categories = this.response.data;
  expect(Array.isArray(categories)).toBe(true);
});

Then(
  "каждая категория содержит поля:",
  async function (this: World, dataTable) {
    const categories = this.response.data;
    const requiredFields = dataTable.hashes();

    expect(categories.length).toBeGreaterThan(0);

    categories.forEach((category: any) => {
      requiredFields.forEach((field: any) => {
        expect(category[field.поле]).toBeDefined();
        expect(typeof category[field.поле]).toBe(field.тип);
      });
    });
  },
);

Then("тело ответа содержит:", async function (this: World, dataTable) {
  const data = this.response.data;
  const expectedFields = dataTable.hashes()[0];

  Object.keys(expectedFields).forEach((field) => {
    const expectedValue = expectedFields[field];

    if (expectedValue === "present") {
      expect(data[field]).toBeDefined();
    } else {
      expect(data[field]).toBe(expectedValue);
    }
  });
});

Then("заголовки ответа содержат:", async function (this: World, dataTable) {
  const expectedHeaders = dataTable.hashes()[0];

  Object.keys(expectedHeaders).forEach((headerName) => {
    const expectedValue = expectedHeaders[headerName];
    const actualValue = this.response.headers[headerName.toLowerCase()];

    if (expectedValue === "да") {
      expect(actualValue).toBeDefined();
    } else {
      expect(actualValue).toBe(expectedValue);
    }
  });
});

/**
 * Given Steps with setup data
 */

Given(
  "существует товар с ID {string}",
  async function (this: World, productId: string) {
    // For tests, we'll assume the product exists or create test data
    this.testData = { ...this.testData, productId };
  },
);

Given(
  "существует категория {string} с ID {string}",
  async function (this: World, categoryName: string, categoryId: string) {
    // For tests, we'll assume the category exists or create test data
    this.testData = { ...this.testData, categoryName, categoryId };
  },
);

Given(
  "я отправил более {int} запросов за последнюю минуту",
  async function (this: World, requestCount: number) {
    // This would typically be set up in a test environment
    // For now, we'll mark it as a precondition
    this.testData = { ...this.testData, rateLimitExceeded: true };
  },
);

/**
 * Before/After hooks for test setup and cleanup
 */

Before(async function (this: World) {
  // Reset state for each scenario
  this.response = undefined;
  this.responseTime = undefined;
  this.startTime = undefined;
  this.testData = {};
  this.headers = {};
});

After(async function (this: World) {
  // Cleanup after each scenario
  if (this.testData?.cleanupRequired) {
    // Perform any necessary cleanup
    console.log("Cleaning up test data...");
  }
});
