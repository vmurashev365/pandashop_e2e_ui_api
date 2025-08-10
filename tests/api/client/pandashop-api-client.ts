import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { 
  Product, 
  ProductListResponse, 
  SearchFilters, 
  SearchResponse,
  Cart,
  User,
  Order,
  ProductListResponseSchema,
  SearchResponseSchema,
  CartSchema,
  UserSchema,
  OrderSchema
} from '../../shared/schemas/api-schemas-simple';

/**
 * API Client for Pandashop.md
 * Provides typed methods for all API endpoints
 */
export class PandashopAPIClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = 'https://pandashop.md') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL: `${baseURL}/api/v1`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': 'ru-RU,ru;q=0.9,ro;q=0.8,en;q=0.7',
        'User-Agent': 'Pandashop-Test-Suite/1.0'
      }
    });

    // Request interceptor for logging and auth
    this.client.interceptors.request.use(
      (config) => {
        if (process.env.DEBUG === 'true') {
          console.log(`🔵 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
      },
      (error) => {
        console.error('❌ API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging and error handling
    this.client.interceptors.response.use(
      (response) => {
        if (process.env.DEBUG === 'true') {
          console.log(`🟢 API Response: ${response.status} ${response.config.url}`);
        }
        return response;
      },
      (error) => {
        const status = error.response?.status;
        const url = error.config?.url;
        console.error(`🔴 API Error: ${status} ${url}`);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Set authorization token
   */
  setAuthToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Remove authorization token
   */
  removeAuthToken(): void {
    delete this.client.defaults.headers.common['Authorization'];
  }

  // CATALOG ENDPOINTS

  /**
   * Get products list with optional filters
   */
  async getProducts(filters?: Partial<SearchFilters>): Promise<ProductListResponse> {
    const response = await this.client.get('/products', { params: filters });
    return ProductListResponseSchema.parse(response.data);
  }

  /**
   * Get single product by ID
   */
  async getProduct(productId: string): Promise<Product> {
    const response = await this.client.get(`/products/${productId}`);
    return response.data;
  }

  /**
   * Search products
   */
  async searchProducts(filters: SearchFilters): Promise<SearchResponse> {
    const response = await this.client.get('/products/search', { params: filters });
    return SearchResponseSchema.parse(response.data);
  }

  /**
   * Get product categories
   */
  async getCategories(): Promise<any[]> {
    const response = await this.client.get('/categories');
    return response.data;
  }

  /**
   * Get category by ID
   */
  async getCategory(categoryId: string): Promise<any> {
    const response = await this.client.get(`/categories/${categoryId}`);
    return response.data;
  }

  // CART ENDPOINTS

  /**
   * Get cart contents
   */
  async getCart(cartId?: string): Promise<Cart> {
    const url = cartId ? `/cart/${cartId}` : '/cart';
    const response = await this.client.get(url);
    return CartSchema.parse(response.data);
  }

  /**
   * Add item to cart
   */
  async addToCart(productId: string, quantity: number, variantId?: string): Promise<Cart> {
    const response = await this.client.post('/cart/items', {
      productId,
      quantity,
      variantId
    });
    return CartSchema.parse(response.data);
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(itemId: string, quantity: number): Promise<Cart> {
    const response = await this.client.put(`/cart/items/${itemId}`, { quantity });
    return CartSchema.parse(response.data);
  }

  /**
   * Remove item from cart
   */
  async removeCartItem(itemId: string): Promise<Cart> {
    const response = await this.client.delete(`/cart/items/${itemId}`);
    return CartSchema.parse(response.data);
  }

  /**
   * Clear cart
   */
  async clearCart(): Promise<Cart> {
    const response = await this.client.delete('/cart/items');
    return CartSchema.parse(response.data);
  }

  // USER ENDPOINTS

  /**
   * Register new user
   */
  async registerUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<User> {
    const response = await this.client.post('/auth/register', userData);
    return UserSchema.parse(response.data);
  }

  /**
   * Login user
   */
  async loginUser(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  /**
   * Get current user profile
   */
  async getUserProfile(): Promise<User> {
    const response = await this.client.get('/auth/profile');
    return UserSchema.parse(response.data);
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userData: Partial<User>): Promise<User> {
    const response = await this.client.put('/auth/profile', userData);
    return UserSchema.parse(response.data);
  }

  // ORDER ENDPOINTS

  /**
   * Create new order
   */
  async createOrder(orderData: {
    cartId: string;
    billingAddress: any;
    shippingAddress: any;
    paymentMethod: string;
    notes?: string;
  }): Promise<Order> {
    const response = await this.client.post('/orders', orderData);
    return OrderSchema.parse(response.data);
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string): Promise<Order> {
    const response = await this.client.get(`/orders/${orderId}`);
    return OrderSchema.parse(response.data);
  }

  /**
   * Get user orders
   */
  async getUserOrders(page: number = 1, limit: number = 20): Promise<{ orders: Order[]; pagination: any }> {
    const response = await this.client.get('/orders', { 
      params: { page, limit } 
    });
    return response.data;
  }

  /**
   * Update order status (admin only)
   */
  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    const response = await this.client.put(`/orders/${orderId}/status`, { status });
    return OrderSchema.parse(response.data);
  }

  // UTILITY METHODS

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }

  /**
   * Get API version info
   */
  async getApiInfo(): Promise<{ version: string; environment: string }> {
    const response = await this.client.get('/info');
    return response.data;
  }

  /**
   * Raw HTTP request for custom endpoints
   */
  async request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.request<T>(config);
  }

  /**
   * Set custom headers
   */
  setHeaders(headers: Record<string, string>): void {
    Object.assign(this.client.defaults.headers, headers);
  }

  /**
   * Get current base URL
   */
  getBaseURL(): string {
    return this.baseURL;
  }
}

// Export singleton instance
export const apiClient = new PandashopAPIClient();

// Export factory function for tests
export const createAPIClient = (baseURL?: string): PandashopAPIClient => {
  return new PandashopAPIClient(baseURL);
};
