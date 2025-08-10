import axios, { AxiosInstance, AxiosResponse } from "axios";
import { z } from "zod";

/**
 * Real Pandashop.md API Client
 * Based on actual site structure investigation
 */

// Schemas based on real structure
const SitemapEntrySchema = z.object({
  url: z.string(),
  lastmod: z.string().optional(),
  changefreq: z.string().optional(),
  priority: z.string().optional(),
});

const ProductUrlSchema = z.object({
  id: z.string(),
  url: z.string(),
  title: z.string().optional(),
  category: z.string().optional(),
});

export type SitemapEntry = z.infer<typeof SitemapEntrySchema>;
export type ProductUrl = z.infer<typeof ProductUrlSchema>;

export interface SearchParams {
  query?: string;
  category?: string;
  brand?: string;
  priceMin?: number;
  priceMax?: number;
  page?: number;
  lng?: "ru" | "ro";
}

export class RealPandashopAPIClient {
  private client: AxiosInstance;
  private baseUrl = "https://www.pandashop.md";
  
  constructor(baseUrl?: string) {
    if (baseUrl) {
      this.baseUrl = baseUrl;
    }
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Test-Framework/1.0)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ru,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        "Connection": "keep-alive",
      },
    });
  }

  /**
   * Get product URLs from sitemap
   */
  async getProductsFromSitemap(language: "ru" | "ro" = "ru", page: number = 1): Promise<ProductUrl[]> {
    try {
      const response = await this.client.get(`/SitemapsProducts.ashx?lng=${language}&page=${page}`);
      const xmlContent = response.data;
      
      // Parse XML to extract URLs
      const urlMatches = xmlContent.match(/<loc>(.*?)<\/loc>/g);
      
      if (!urlMatches) {
        return [];
      }
      
      const products: ProductUrl[] = [];
      
      urlMatches.forEach((match: string) => {
        const url = match.replace(/<\/?loc>/g, "");
        
        // Extract product info from URL
        const productMatch = url.match(/\/([^\/]+)\/$/);
        if (productMatch) {
          const id = productMatch[1];
          
          products.push({
            id,
            url,
            title: id.replace(/-/g, " "), // Basic title from slug
          });
        }
      });
      
      return products;
    } catch (error) {
      console.error("Error fetching products from sitemap:", error);
      return [];
    }
  }

  /**
   * Get categories from sitemap
   */
  async getCategoriesFromSitemap(language: "ru" | "ro" = "ru"): Promise<SitemapEntry[]> {
    try {
      const response = await this.client.get(`/SitemapsCategories.ashx?lng=${language}`);
      const xmlContent = response.data;
      
      const urlMatches = xmlContent.match(/<loc>(.*?)<\/loc>/g);
      
      if (!urlMatches) {
        return [];
      }
      
      return urlMatches.map((match: string) => ({
        url: match.replace(/<\/?loc>/g, ""),
      }));
    } catch (error) {
      console.error("Error fetching categories from sitemap:", error);
      return [];
    }
  }

  /**
   * Get brands from sitemap
   */
  async getBrandsFromSitemap(language: "ru" | "ro" = "ru"): Promise<SitemapEntry[]> {
    try {
      const response = await this.client.get(`/SitemapsBrands.ashx?lng=${language}`);
      const xmlContent = response.data;
      
      const urlMatches = xmlContent.match(/<loc>(.*?)<\/loc>/g);
      
      if (!urlMatches) {
        return [];
      }
      
      return urlMatches.map((match: string) => ({
        url: match.replace(/<\/?loc>/g, ""),
      }));
    } catch (error) {
      console.error("Error fetching brands from sitemap:", error);
      return [];
    }
  }

  /**
   * Scrape product page for details
   */
  async getProductDetails(productUrl: string): Promise<any> {
    try {
      const response = await this.client.get(productUrl);
      const html = response.data;
      
      // Extract basic product info from HTML
      const titleMatch = html.match(/<title>(.*?)<\/title>/);
      const priceMatch = html.match(/(\d+(?:\.\d+)?)\s*(?:MDL|лей)/i);
      const descriptionMatch = html.match(/<meta name="description" content="(.*?)"/);
      
      return {
        title: titleMatch ? titleMatch[1].replace(/\s*-\s*Pandashop\.md.*$/i, "") : null,
        price: priceMatch ? parseFloat(priceMatch[1]) : null,
        currency: "MDL",
        description: descriptionMatch ? descriptionMatch[1] : null,
        url: productUrl,
        available: html.includes("в наличии") || html.includes("в стоке"),
      };
    } catch (error) {
      console.error("Error fetching product details:", error);
      return null;
    }
  }

  /**
   * Search by navigating to search page
   */
  async searchProducts(params: SearchParams): Promise<ProductUrl[]> {
    try {
      const language = params.lng || "ru";
      const searchUrl = `/${language}/search/`;
      
      // In real implementation, this would submit search form
      // For now, we'll return products from sitemap as fallback
      console.log(`Would search with params:`, params);
      
      return this.getProductsFromSitemap(language, params.page || 1);
    } catch (error) {
      console.error("Error searching products:", error);
      return [];
    }
  }

  /**
   * Get category products by navigating to category page
   */
  async getCategoryProducts(categoryPath: string, language: "ru" | "ro" = "ru"): Promise<any[]> {
    try {
      const response = await this.client.get(`/${language}${categoryPath}`);
      const html = response.data;
      
      // Extract product links from category page HTML
      const productLinkMatches = html.match(/href="([^"]*\/(?:product|item)\/[^"]*)/g);
      
      if (!productLinkMatches) {
        return [];
      }
      
      const products = [];
      
      for (const match of productLinkMatches.slice(0, 10)) { // Limit to first 10
        const url = match.replace('href="', "");
        const fullUrl = url.startsWith("http") ? url : `${this.baseUrl}${url}`;
        
        // Get basic product info
        const productId = url.split("/").filter(Boolean).pop() || "";
        
        products.push({
          id: productId,
          url: fullUrl,
          category: categoryPath,
        });
      }
      
      return products;
    } catch (error) {
      console.error("Error fetching category products:", error);
      return [];
    }
  }

  /**
   * Health check - just check if main page loads
   */
  async healthCheck(): Promise<{ status: string; responseTime: number }> {
    const startTime = Date.now();
    
    try {
      const response = await this.client.get("/");
      const responseTime = Date.now() - startTime;
      
      return {
        status: response.status === 200 ? "healthy" : "unhealthy",
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        status: "unhealthy", 
        responseTime,
      };
    }
  }

  /**
   * Get basic site statistics
   */
  async getSiteStats(): Promise<any> {
    try {
      const [products, categories, brands] = await Promise.all([
        this.getProductsFromSitemap("ru", 1),
        this.getCategoriesFromSitemap("ru"),
        this.getBrandsFromSitemap("ru"),
      ]);

      return {
        totalProducts: products.length,
        totalCategories: categories.length,
        totalBrands: brands.length,
        languages: ["ru", "ro"],
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error getting site stats:", error);
      return {
        totalProducts: 0,
        totalCategories: 0,
        totalBrands: 0,
        languages: ["ru", "ro"],
        lastUpdated: new Date().toISOString(),
      };
    }
  }
}
