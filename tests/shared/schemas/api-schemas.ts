import { z } from "zod";

/**
 * Zod schemas for Pandashop.md API responses
 * Used for runtime validation and TypeScript typing
 */

// Base schemas
export const IdSchema = z.string().min(1);
export const UrlSchema = z.string().url();
export const TimestampSchema = z.string().datetime();
export const MoneySchema = z.number().positive();
export const QuantitySchema = z.number().int().min(0);

// Pagination schema
export const PaginationSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});

// Language and localization
export const LanguageSchema = z.enum(["ru", "ro", "en"]);
export const CurrencySchema = z.enum(["MDL", "EUR", "USD"]);

// Product schemas
export const ProductImageSchema = z.object({
  id: IdSchema,
  url: UrlSchema,
  alt: z.string().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  isPrimary: z.boolean().default(false),
});

export const ProductCategorySchema = z.object({
  id: IdSchema,
  name: z.string().min(1),
  slug: z.string().min(1),
  parentId: IdSchema.optional(),
  description: z.string().optional(),
  imageUrl: UrlSchema.optional(),
  isActive: z.boolean().default(true),
});

export const ProductVariantSchema = z.object({
  id: IdSchema,
  name: z.string().min(1),
  sku: z.string().min(1),
  price: MoneySchema,
  comparePrice: MoneySchema.optional(),
  inStock: z.boolean(),
  stockQuantity: QuantitySchema.optional(),
  attributes: z.record(z.string()).optional(),
});

export const ProductSchema = z.object({
  id: IdSchema,
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  sku: z.string().min(1),
  price: MoneySchema,
  comparePrice: MoneySchema.optional(),
  currency: CurrencySchema,
  inStock: z.boolean(),
  stockQuantity: QuantitySchema.optional(),
  category: ProductCategorySchema,
  images: z.array(ProductImageSchema).min(1),
  variants: z.array(ProductVariantSchema).optional(),
  tags: z.array(z.string()).default([]),
  attributes: z.record(z.string()).optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewsCount: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

// Product list response
export const ProductListResponseSchema = z.object({
  products: z.array(ProductSchema),
  pagination: PaginationSchema,
  filters: z
    .object({
      categories: z.array(ProductCategorySchema),
      priceRange: z.object({
        min: MoneySchema,
        max: MoneySchema,
      }),
      brands: z.array(z.string()),
      attributes: z.record(z.array(z.string())),
    })
    .optional(),
});

// Search schemas
export const SearchFiltersSchema = z.object({
  query: z.string().optional(),
  categoryId: IdSchema.optional(),
  minPrice: MoneySchema.optional(),
  maxPrice: MoneySchema.optional(),
  inStock: z.boolean().optional(),
  brand: z.string().optional(),
  attributes: z.record(z.string()).optional(),
  sortBy: z.enum(["price", "name", "rating", "created"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const SearchResponseSchema = z.object({
  query: z.string(),
  results: z.array(ProductSchema),
  totalResults: z.number().int().min(0),
  pagination: PaginationSchema,
  suggestions: z.array(z.string()).optional(),
  facets: z.record(z.array(z.string())).optional(),
});

// Cart schemas
export const CartItemSchema = z.object({
  id: IdSchema,
  productId: IdSchema,
  variantId: IdSchema.optional(),
  quantity: QuantitySchema.min(1),
  price: MoneySchema,
  totalPrice: MoneySchema,
  product: ProductSchema,
});

export const CartSchema = z.object({
  id: IdSchema,
  items: z.array(CartItemSchema),
  itemsCount: z.number().int().min(0),
  subtotal: MoneySchema,
  tax: MoneySchema.optional(),
  shipping: MoneySchema.optional(),
  discount: MoneySchema.optional(),
  total: MoneySchema,
  currency: CurrencySchema,
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

// User schemas
export const UserAddressSchema = z.object({
  id: IdSchema,
  type: z.enum(["billing", "shipping"]),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  company: z.string().optional(),
  address1: z.string().min(1),
  address2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().optional(),
  postalCode: z.string().min(1),
  country: z.string().min(2),
  phone: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export const UserSchema = z.object({
  id: IdSchema,
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  dateOfBirth: z.string().date().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  addresses: z.array(UserAddressSchema).default([]),
  isEmailVerified: z.boolean().default(false),
  isPhoneVerified: z.boolean().default(false),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

// Order schemas
export const OrderStatusSchema = z.enum([
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]);

export const OrderItemSchema = z.object({
  id: IdSchema,
  productId: IdSchema,
  variantId: IdSchema.optional(),
  quantity: QuantitySchema.min(1),
  price: MoneySchema,
  totalPrice: MoneySchema,
  productName: z.string().min(1),
  productImage: UrlSchema.optional(),
});

export const OrderSchema = z.object({
  id: IdSchema,
  orderNumber: z.string().min(1),
  status: OrderStatusSchema,
  items: z.array(OrderItemSchema).min(1),
  customer: UserSchema,
  billingAddress: UserAddressSchema,
  shippingAddress: UserAddressSchema,
  subtotal: MoneySchema,
  tax: MoneySchema.optional(),
  shipping: MoneySchema.optional(),
  discount: MoneySchema.optional(),
  total: MoneySchema,
  currency: CurrencySchema,
  paymentMethod: z.string().optional(),
  paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
  notes: z.string().optional(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

// API Response wrappers
export const ApiSuccessResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    message: z.string().optional(),
    timestamp: TimestampSchema,
  });

export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.any()).optional(),
  }),
  timestamp: TimestampSchema,
});

export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.union([ApiSuccessResponseSchema(dataSchema), ApiErrorResponseSchema]);

// Type exports for TypeScript
export type Product = z.infer<typeof ProductSchema>;
export type ProductCategory = z.infer<typeof ProductCategorySchema>;
export type ProductListResponse = z.infer<typeof ProductListResponseSchema>;
export type SearchFilters = z.infer<typeof SearchFiltersSchema>;
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
export type Cart = z.infer<typeof CartSchema>;
export type CartItem = z.infer<typeof CartItemSchema>;
export type User = z.infer<typeof UserSchema>;
export type UserAddress = z.infer<typeof UserAddressSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type ApiSuccessResponse<T> = z.infer<
  ReturnType<typeof ApiSuccessResponseSchema<z.ZodType<T>>>
>;
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;
export type ApiResponse<T> = z.infer<
  ReturnType<typeof ApiResponseSchema<z.ZodType<T>>>
>;
