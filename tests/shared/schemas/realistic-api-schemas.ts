import { z } from "zod";

/**
 * Realistic API schemas for Pandashop.md
 * Based on actual API capabilities and sitemap data
 */

// Pagination schema
export const PaginationSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});
export type Pagination = z.infer<typeof PaginationSchema>;

// Realistic Product Schema based on sitemap data
export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().positive(),
  currency: z.string().default("MDL"),
  availability: z.enum(["available", "out_of_stock", "pre_order"]),
  category: z.string().optional(),
  brand: z.string().optional(),
  url: z.string().optional(),
});
export type Product = z.infer<typeof ProductSchema>;

// Product List Response Schema - matches actual API response
export const ProductListResponseSchema = z.object({
  data: z.array(ProductSchema),
  pagination: PaginationSchema,
});
export type ProductListResponse = z.infer<typeof ProductListResponseSchema>;

// Search Response Schema
export const SearchResponseSchema = z.object({
  data: z.array(ProductSchema),
  pagination: PaginationSchema,
  searchQuery: z.string().optional(),
});
export type SearchResponse = z.infer<typeof SearchResponseSchema>;

// Health Check Schema
export const HealthCheckSchema = z.object({
  status: z.enum(["healthy", "unhealthy"]),
  responseTime: z.number().positive(),
  timestamp: z.string(),
});
export type HealthCheck = z.infer<typeof HealthCheckSchema>;

// Cart Schema (simplified)
export const CartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
  name: z.string(),
});

export const CartSchema = z.object({
  id: z.string().optional(),
  items: z.array(CartItemSchema),
  total: z.number().min(0),
  currency: z.string().default("MDL"),
});
export type Cart = z.infer<typeof CartSchema>;

// Search Filters Schema
export const SearchFiltersSchema = z.object({
  query: z.string().optional(),
  page: z.number().int().positive().default(1).optional(),
  limit: z.number().int().positive().max(100).default(20).optional(),
  categoryId: z.string().optional(),
  brand: z.string().optional(),
  availability: z.enum(["available", "out_of_stock", "pre_order"]).optional(),
  priceMin: z.number().positive().optional(),
  priceMax: z.number().positive().optional(),
});
export type SearchFilters = z.infer<typeof SearchFiltersSchema>;

// Error Response Schema
export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  code: z.number().optional(),
  timestamp: z.string(),
});
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
