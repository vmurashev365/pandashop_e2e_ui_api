import { faker } from "@faker-js/faker/locale/ru";
import { Product, User, Cart } from "../../shared/schemas/api-schemas-simple";

/**
 * Test data generators for API tests
 */
export class TestDataGenerator {
  /**
   * Generate random product data
   */
  static generateProduct(overrides?: Partial<Product>): Product {
    return {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
      originalPrice: parseFloat(faker.commerce.price()),
      currency: "MDL",
      category: faker.commerce.department(),
      categoryId: faker.string.uuid(),
      brand: faker.company.name(),
      sku: faker.string.alphanumeric(8).toUpperCase(),
      availability: faker.helpers.arrayElement([
        "available",
        "out_of_stock",
        "pre_order",
      ]),
      stock: faker.number.int({ min: 0, max: 100 }),
      images: [faker.image.url(), faker.image.url()],
      tags: faker.helpers.arrayElements(
        ["новинка", "популярное", "скидка", "эксклюзив", "рекомендуем"],
        { min: 1, max: 3 },
      ),
      rating: parseFloat(
        faker.number.float({ min: 1, max: 5, fractionDigits: 1 }).toFixed(1),
      ),
      reviewCount: faker.number.int({ min: 0, max: 500 }),
      specifications: {
        weight: `${faker.number.float({ min: 0.1, max: 10, fractionDigits: 2 })} кг`,
        dimensions: `${faker.number.int({ min: 10, max: 100 })}x${faker.number.int({ min: 10, max: 100 })}x${faker.number.int({ min: 5, max: 50 })} см`,
        warranty: `${faker.number.int({ min: 6, max: 36 })} месяцев`,
      },
      variants: [],
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      ...overrides,
    };
  }

  /**
   * Generate random user data
   */
  static generateUser(overrides?: Partial<User>): User {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    return {
      id: faker.string.uuid(),
      email: faker.internet.email({ firstName, lastName }),
      firstName,
      lastName,
      phone: faker.phone.number("+373 ## ### ###"),
      dateOfBirth: faker.date
        .birthdate({ min: 18, max: 65, mode: "age" })
        .toISOString()
        .split("T")[0],
      gender: faker.helpers.arrayElement(["male", "female", "other"]),
      addresses: [
        {
          id: faker.string.uuid(),
          type: "shipping",
          firstName,
          lastName,
          company: faker.company.name(),
          address1: faker.location.streetAddress(),
          city: faker.helpers.arrayElement([
            "Кишинев",
            "Бельцы",
            "Тирасполь",
            "Бендеры",
            "Кагул",
          ]),
          postalCode: faker.location.zipCode("MD-####"),
          country: "Moldova",
          phone: faker.phone.number("+373 ## ### ###"),
          isDefault: true,
        },
      ],
      preferences: {
        language: "ru",
        currency: "MDL",
        notifications: {
          email: true,
          sms: false,
          push: true,
        },
      },
      isVerified: faker.datatype.boolean(),
      isActive: true,
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      ...overrides,
    };
  }

  /**
   * Generate random cart data
   */
  static generateCart(overrides?: Partial<Cart>): Cart {
    const items = Array.from(
      { length: faker.number.int({ min: 1, max: 5 }) },
      () => ({
        id: faker.string.uuid(),
        productId: faker.string.uuid(),
        variantId: faker.datatype.boolean() ? faker.string.uuid() : undefined,
        quantity: faker.number.int({ min: 1, max: 3 }),
        price: parseFloat(faker.commerce.price()),
        product: this.generateProduct(),
      }),
    );

    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const shipping = subtotal > 500 ? 0 : 50;
    const tax = subtotal * 0.2;
    const total = subtotal + shipping + tax;

    return {
      id: faker.string.uuid(),
      userId: faker.datatype.boolean() ? faker.string.uuid() : undefined,
      items,
      subtotal,
      shipping,
      tax,
      total,
      currency: "MDL",
      createdAt: faker.date.recent().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      ...overrides,
    };
  }

  /**
   * Generate email for testing
   */
  static generateTestEmail(prefix: string = "test"): string {
    return `${prefix}+${faker.string.alphanumeric(8)}@test.pandashop.md`;
  }

  /**
   * Generate phone number (Moldova format)
   */
  static generateMoldovaPhone(): string {
    return faker.phone.number("+373 ## ### ###");
  }

  /**
   * Generate SKU
   */
  static generateSKU(): string {
    return faker.string.alphanumeric(8).toUpperCase();
  }

  /**
   * Generate price in MDL
   */
  static generatePrice(min: number = 10, max: number = 1000): number {
    return parseFloat(faker.commerce.price({ min, max }));
  }
}

/**
 * API test assertions and validation helpers
 */
export class APITestHelpers {
  /**
   * Validate response time
   */
  static validateResponseTime(startTime: number, maxTime: number = 2000): void {
    const responseTime = Date.now() - startTime;
    if (responseTime > maxTime) {
      throw new Error(
        `Response time ${responseTime}ms exceeded maximum ${maxTime}ms`,
      );
    }
  }

  /**
   * Validate status code
   */
  static validateStatusCode(actual: number, expected: number): void {
    if (actual !== expected) {
      throw new Error(`Expected status ${expected}, but got ${actual}`);
    }
  }

  /**
   * Validate headers
   */
  static validateHeaders(
    headers: Record<string, string>,
    requiredHeaders: string[],
  ): void {
    const missingHeaders = requiredHeaders.filter((header) => !headers[header]);
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(", ")}`);
    }
  }

  /**
   * Validate content type
   */
  static validateContentType(
    contentType: string,
    expected: string = "application/json",
  ): void {
    if (!contentType.includes(expected)) {
      throw new Error(
        `Expected content type ${expected}, but got ${contentType}`,
      );
    }
  }

  /**
   * Validate pagination parameters
   */
  static validatePagination(pagination: any): void {
    const required = ["page", "limit", "total", "totalPages"];
    const missing = required.filter((field) => pagination[field] === undefined);
    if (missing.length > 0) {
      throw new Error(`Missing pagination fields: ${missing.join(", ")}`);
    }

    if (pagination.page < 1) {
      throw new Error("Page number must be greater than 0");
    }

    if (pagination.limit < 1) {
      throw new Error("Limit must be greater than 0");
    }

    if (pagination.total < 0) {
      throw new Error("Total must be non-negative");
    }
  }

  /**
   * Compare objects ignoring specified fields
   */
  static compareObjectsIgnoring(
    obj1: any,
    obj2: any,
    ignoreFields: string[] = [],
  ): boolean {
    const clean1 = { ...obj1 };
    const clean2 = { ...obj2 };

    ignoreFields.forEach((field) => {
      delete clean1[field];
      delete clean2[field];
    });

    return JSON.stringify(clean1) === JSON.stringify(clean2);
  }

  /**
   * Generate random search query
   */
  static generateSearchQuery(): string {
    const queries = [
      "телефон",
      "ноутбук",
      "планшет",
      "наушники",
      "клавиатура",
      "мышь",
      "монитор",
      "камера",
      "игра",
      "книга",
      "одежда",
    ];
    return faker.helpers.arrayElement(queries);
  }

  /**
   * Wait for specified time
   */
  static async wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Retry operation with exponential backoff
   */
  static async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000,
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }

        const delay = baseDelay * Math.pow(2, attempt - 1);
        await this.wait(delay);
      }
    }

    throw new Error("Should not reach here");
  }

  /**
   * Generate test environment URL
   */
  static getTestEnvironmentURL(): string {
    const env = process.env.TEST_ENV || "staging";
    const urls = {
      development: "https://dev.pandashop.md",
      staging: "https://staging.pandashop.md",
      production: "https://pandashop.md",
    };

    return urls[env as keyof typeof urls] || urls.staging;
  }

  /**
   * Clean up test data
   */
  static generateCleanupId(): string {
    return `test_${Date.now()}_${faker.string.alphanumeric(6)}`;
  }
}

/**
 * Constants for API testing
 */
export const API_TEST_CONSTANTS = {
  // Timeouts
  DEFAULT_TIMEOUT: 5000,
  SLOW_TIMEOUT: 10000,
  UPLOAD_TIMEOUT: 30000,

  // Response times (SLA)
  FAST_RESPONSE: 500,
  NORMAL_RESPONSE: 2000,
  SLOW_RESPONSE: 5000,

  // Common headers
  REQUIRED_HEADERS: ["content-type", "server", "date"],

  // Test data limits
  MAX_PRODUCTS_PER_PAGE: 100,
  MAX_SEARCH_QUERY_LENGTH: 255,
  MAX_CART_ITEMS: 50,

  // Moldovan specific
  MOLDOVA_PHONE_REGEX: /^\+373 \d{2} \d{3} \d{3}$/,
  MOLDOVA_POSTAL_CODE_REGEX: /^MD-\d{4}$/,

  // Common test emails
  TEST_EMAIL_DOMAIN: "test.pandashop.md",
};
