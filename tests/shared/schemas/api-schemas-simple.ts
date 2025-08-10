import { z } from "zod";

/**
 * Simplified API Schemas for Pandashop.md API Tests
 * These schemas match our test usage patterns
 */

// Currency enum
export const CurrencySchema = z.enum(["MDL", "EUR", "USD"]);
export type Currency = z.infer<typeof CurrencySchema>;

// Base pagination schema
export const PaginationSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive().max(100),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().positive(),
});
export type Pagination = z.infer<typeof PaginationSchema>;

// Simplified Product Schema for tests
export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number().positive(),
  originalPrice: z.number().positive().optional(),
  currency: CurrencySchema.default("MDL"),
  category: z.string(),
  categoryId: z.string(),
  brand: z.string().optional(),
  sku: z.string(),
  availability: z.enum(["available", "out_of_stock", "pre_order"]),
  stock: z.number().int().nonnegative().optional(),
  images: z.array(z.string()),
  tags: z.array(z.string()).optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().nonnegative().optional(),
  specifications: z.record(z.string()).optional(),
  variants: z.array(z.any()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Product = z.infer<typeof ProductSchema>;

// Search Filters Schema - simplified
export const SearchFiltersSchema = z.object({
  query: z.string().optional(),
  categoryId: z.string().optional(),
  priceMin: z.number().positive().optional(),
  priceMax: z.number().positive().optional(),
  brand: z.string().optional(),
  availability: z.enum(["available", "out_of_stock", "pre_order"]).optional(),
  page: z.number().int().positive().default(1).optional(),
  limit: z.number().int().positive().max(100).default(20).optional(),
});
export type SearchFilters = z.infer<typeof SearchFiltersSchema>;

// Product List Response Schema
export const ProductListResponseSchema = z.object({
  data: z.array(ProductSchema),
  pagination: PaginationSchema,
});
export type ProductListResponse = z.infer<typeof ProductListResponseSchema>;

// Search Response Schema
export const SearchResponseSchema = z.object({
  data: z.array(ProductSchema),
  pagination: PaginationSchema,
  searchQuery: z.string(),
  filters: z.record(z.any()).optional(),
});
export type SearchResponse = z.infer<typeof SearchResponseSchema>;

// User Address Schema - simplified
export const AddressSchema = z.object({
  id: z.string(),
  type: z.enum(["billing", "shipping"]),
  firstName: z.string(),
  lastName: z.string(),
  company: z.string().optional(),
  address1: z.string(),
  city: z.string(),
  postalCode: z.string(),
  country: z.string(),
  phone: z.string().optional(),
  isDefault: z.boolean(),
});
export type Address = z.infer<typeof AddressSchema>;

// User Schema - simplified
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  addresses: z.array(AddressSchema),
  preferences: z.object({
    language: z.string(),
    currency: CurrencySchema,
    notifications: z.object({
      email: z.boolean(),
      sms: z.boolean(),
      push: z.boolean(),
    }),
  }),
  isVerified: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type User = z.infer<typeof UserSchema>;

// Cart Item Schema - simplified
export const CartItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  variantId: z.string().optional(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
  product: ProductSchema,
});
export type CartItem = z.infer<typeof CartItemSchema>;

// Cart Schema - simplified
export const CartSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  items: z.array(CartItemSchema),
  subtotal: z.number().nonnegative(),
  shipping: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  total: z.number().nonnegative(),
  currency: CurrencySchema.default("MDL"),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Cart = z.infer<typeof CartSchema>;

// Order Schema - simplified
export const OrderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  userId: z.string(),
  status: z.enum([
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ]),
  items: z.array(
    z.object({
      id: z.string(),
      productId: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().positive(),
      product: ProductSchema,
    }),
  ),
  billingAddress: AddressSchema,
  shippingAddress: AddressSchema,
  subtotal: z.number().nonnegative(),
  shipping: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  total: z.number().nonnegative(),
  currency: CurrencySchema,
  paymentMethod: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Order = z.infer<typeof OrderSchema>;
