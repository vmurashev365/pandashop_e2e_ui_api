import { test, expect } from "@playwright/test";
import { apiClient } from "../client/pandashop-api-client";
import { TestDataGenerator, APITestHelpers } from "../helpers/api-test-helpers";

/**
 * Pure API Tests - Cart Functionality
 * Tests cart operations without BDD layer for faster execution
 */

test.describe("Cart API Tests", () => {
  let testCartId: string;
  let testProductId: string;

  test.beforeAll(async () => {
    // Get a valid product for testing
    const products = await apiClient.getProducts({ limit: 1 });
    if (products.data.length > 0) {
      testProductId = products.data[0].id;
    }
  });

  test.beforeEach(async () => {
    // Create a fresh cart for each test
    const cart = await apiClient.getCart();
    testCartId = cart.id;
  });

  test("should create new cart", async () => {
    const startTime = Date.now();

    const cart = await apiClient.getCart();

    APITestHelpers.validateResponseTime(startTime, 1000);

    expect(cart.id).toBeDefined();
    expect(cart.items).toEqual([]);
    expect(cart.subtotal).toBe(0);
    expect(cart.total).toBe(0);
    expect(cart.currency).toBe("MDL");
  });

  test("should add item to cart", async () => {
    if (!testProductId) {
      test.skip("No test product available");
    }

    const quantity = 2;
    const startTime = Date.now();

    const cart = await apiClient.addToCart(testProductId, quantity);

    APITestHelpers.validateResponseTime(startTime, 2000);

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].productId).toBe(testProductId);
    expect(cart.items[0].quantity).toBe(quantity);
    expect(cart.subtotal).toBeGreaterThan(0);
    expect(cart.total).toBeGreaterThan(0);
  });

  test("should update cart item quantity", async () => {
    if (!testProductId) {
      test.skip("No test product available");
    }

    // First add item
    const cart = await apiClient.addToCart(testProductId, 1);
    const itemId = cart.items[0].id;

    // Then update quantity
    const newQuantity = 3;
    const startTime = Date.now();

    const updatedCart = await apiClient.updateCartItem(itemId, newQuantity);

    APITestHelpers.validateResponseTime(startTime, 1000);

    expect(updatedCart.items[0].quantity).toBe(newQuantity);
    expect(updatedCart.subtotal).toBeGreaterThan(cart.subtotal);
  });

  test("should remove item from cart", async () => {
    if (!testProductId) {
      test.skip("No test product available");
    }

    // Add item first
    const cart = await apiClient.addToCart(testProductId, 1);
    const itemId = cart.items[0].id;

    // Remove item
    const startTime = Date.now();

    const updatedCart = await apiClient.removeCartItem(itemId);

    APITestHelpers.validateResponseTime(startTime, 1000);

    expect(updatedCart.items).toHaveLength(0);
    expect(updatedCart.subtotal).toBe(0);
    expect(updatedCart.total).toBe(0);
  });

  test("should clear entire cart", async () => {
    if (!testProductId) {
      test.skip("No test product available");
    }

    // Add multiple items
    await apiClient.addToCart(testProductId, 2);

    // Clear cart
    const startTime = Date.now();

    const clearedCart = await apiClient.clearCart();

    APITestHelpers.validateResponseTime(startTime, 1000);

    expect(clearedCart.items).toHaveLength(0);
    expect(clearedCart.subtotal).toBe(0);
    expect(clearedCart.total).toBe(0);
  });

  test("should calculate cart totals correctly", async () => {
    if (!testProductId) {
      test.skip("No test product available");
    }

    const quantity = 2;
    const cart = await apiClient.addToCart(testProductId, quantity);

    const item = cart.items[0];
    const expectedSubtotal = item.price * quantity;

    expect(cart.subtotal).toBe(expectedSubtotal);

    // Verify shipping calculation
    if (cart.subtotal >= 500) {
      expect(cart.shipping).toBe(0); // Free shipping over 500 MDL
    } else {
      expect(cart.shipping).toBeGreaterThan(0);
    }

    // Verify total calculation
    const expectedTotal = cart.subtotal + cart.shipping + cart.tax;
    expect(cart.total).toBe(expectedTotal);
  });

  test("should handle adding same product multiple times", async () => {
    if (!testProductId) {
      test.skip("No test product available");
    }

    // Add same product twice
    await apiClient.addToCart(testProductId, 1);
    const cart = await apiClient.addToCart(testProductId, 2);

    // Should have one item with combined quantity
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(3);
  });

  test("should validate quantity limits", async () => {
    if (!testProductId) {
      test.skip("No test product available");
    }

    // Test negative quantity
    await expect(async () => {
      await apiClient.addToCart(testProductId, -1);
    }).rejects.toThrow();

    // Test zero quantity
    await expect(async () => {
      await apiClient.addToCart(testProductId, 0);
    }).rejects.toThrow();

    // Test excessive quantity
    await expect(async () => {
      await apiClient.addToCart(testProductId, 1000);
    }).rejects.toThrow();
  });

  test("should handle non-existent product", async () => {
    const fakeProductId = "non-existent-product-123";

    await expect(async () => {
      await apiClient.addToCart(fakeProductId, 1);
    }).rejects.toThrow();
  });

  test("should maintain cart state across sessions", async () => {
    if (!testProductId) {
      test.skip("No test product available");
    }

    // Add item to cart
    const cart1 = await apiClient.addToCart(testProductId, 1);
    const cartId = cart1.id;

    // Get cart by ID to simulate different session
    const cart2 = await apiClient.getCart(cartId);

    expect(cart2.id).toBe(cartId);
    expect(cart2.items).toHaveLength(1);
    expect(cart2.items[0].productId).toBe(testProductId);
  });

  test("should handle cart expiration", async () => {
    // This would test cart expiration logic if implemented
    // For now, just verify cart persistence
    const cart = await apiClient.getCart();
    expect(cart.createdAt).toBeDefined();
    expect(new Date(cart.createdAt)).toBeInstanceOf(Date);
  });
});

/**
 * Cart Edge Cases and Error Handling
 */
test.describe("Cart Edge Cases", () => {
  test("should handle concurrent cart modifications", async () => {
    const products = await apiClient.getProducts({ limit: 2 });
    if (products.data.length < 2) {
      test.skip("Need at least 2 products for concurrent test");
    }

    const [product1, product2] = products.data;

    // Simulate concurrent requests
    const promises = [
      apiClient.addToCart(product1.id, 1),
      apiClient.addToCart(product2.id, 1),
    ];

    const results = await Promise.all(promises);

    // Both requests should succeed
    expect(results[0].items.length).toBeGreaterThan(0);
    expect(results[1].items.length).toBeGreaterThan(0);

    // Final cart should have both items
    const finalCart = await apiClient.getCart();
    expect(finalCart.items.length).toBe(2);
  });

  test("should preserve cart during API errors", async () => {
    const products = await apiClient.getProducts({ limit: 1 });
    if (products.data.length === 0) {
      test.skip("No products available");
    }

    const productId = products.data[0].id;

    // Add valid item
    const cart = await apiClient.addToCart(productId, 1);

    // Try to add invalid item (should fail but not affect existing cart)
    try {
      await apiClient.addToCart("invalid-product-id", 1);
    } catch (error) {
      // Expected to fail
    }

    // Verify original cart is unchanged
    const currentCart = await apiClient.getCart();
    expect(currentCart.items).toHaveLength(1);
    expect(currentCart.items[0].productId).toBe(productId);
  });

  test("should handle cart size limits", async () => {
    // Test maximum number of items in cart
    const products = await apiClient.getProducts({ limit: 10 });

    if (products.data.length > 0) {
      const productId = products.data[0].id;

      // Try to add many items
      const addPromises = Array.from({ length: 55 }, () =>
        apiClient.addToCart(productId, 1).catch(() => null),
      );

      await Promise.all(addPromises);

      const cart = await apiClient.getCart();

      // Should not exceed maximum cart size
      expect(cart.items.length).toBeLessThanOrEqual(50);
    }
  });

  test("should calculate complex pricing scenarios", async () => {
    const products = await apiClient.getProducts({ limit: 3 });
    if (products.data.length < 3) {
      test.skip("Need at least 3 products for pricing test");
    }

    // Add products with different prices
    let cart = await apiClient.getCart();

    for (const product of products.data) {
      cart = await apiClient.addToCart(product.id, 1);
    }

    // Verify pricing calculations
    const itemsSubtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    expect(cart.subtotal).toBe(itemsSubtotal);

    // Verify currency consistency
    cart.items.forEach((item) => {
      expect(item.product.currency).toBe("MDL");
    });

    expect(cart.currency).toBe("MDL");
  });
});
