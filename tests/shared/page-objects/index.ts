// Centralized export of all Page Object Models
export { BasePage } from './base-page';
export { CatalogPage } from './catalog-page';
export { NavigationPage } from './navigation-page';
export { ProductDetailsPage } from './product-details-page';
export { CartPage } from './cart-page';

// Type definitions for common page object patterns
export interface PageObjectConfig {
  baseUrl?: string;
  timeout?: number;
}

export interface SelectorMap {
  readonly [key: string]: string;
}

// Common page object utilities
export class PageObjectUtils {
  /**
   * Helper to create multiple similar selectors
   */
  static createSelectorVariants(baseSelectors: string[]): string {
    return baseSelectors.join(', ');
  }

  /**
   * Helper to create responsive selectors
   */
  static createResponsiveSelector(desktop: string, mobile: string): string {
    return `${desktop}, ${mobile}`;
  }

  /**
   * Helper to create fallback selectors
   */
  static createFallbackSelector(primary: string, ...fallbacks: string[]): string {
    return [primary, ...fallbacks].join(', ');
  }
}
