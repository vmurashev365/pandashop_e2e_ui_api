import { Page } from '@playwright/test';
import { BasePage } from './base-page';
import { TestConfig } from '../config/test-config';

/**
 * Navigation Page Object - UI Component Testing
 * Focuses on navigation elements, menus, and navigation patterns
 */
export class NavigationPage extends BasePage {
  
  // Page selectors specific to navigation
  private readonly selectors = {
    mainNavigation: 'nav, .navigation, .main-nav, .navbar, header nav',
    menuItems: 'nav a, .menu a, .nav-item, .menu-item',
    mobileMenuToggle: '.menu-toggle, .hamburger, .mobile-menu, button[aria-label*="menu"]',
    mobileMenu: '.mobile-menu, .mobile-nav, .nav-mobile',
    breadcrumbs: '.breadcrumb, .breadcrumbs, nav[aria-label*="breadcrumb"]',
    logo: '.logo, .brand, .site-title, .header-logo',
    searchBox: 'input[type="search"], .search, .search-input',
    searchButton: 'button[type="submit"], .search-button, .search-btn',
    userMenu: '.user-menu, .account-menu, .profile-menu',
    cartIcon: '.cart-icon, .basket-icon, .cart-link',
    languageSelector: '.language, .lang-selector, .locale',
    footer: 'footer, .footer, .site-footer',
    footerLinks: 'footer a, .footer a, .footer-links a',
    socialLinks: '.social, .social-links, .social-media',
    categoryMenu: '.categories, .category-menu, .cat-nav',
    dropdownMenus: '.dropdown, .submenu, .nav-dropdown'
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to home page for navigation testing
   */
  async openForNavigationTesting(): Promise<void> {
    await this.navigateTo(TestConfig.pages.home);
    await this.waitForPageReady();
    console.log('✅ Page loaded for navigation testing');
  }

  /**
   * Check if main navigation is displayed
   */
  async isMainNavigationDisplayed(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.mainNavigation);
  }

  /**
   * Get navigation menu items count
   */
  async getMenuItemsCount(): Promise<number> {
    return await this.getElementCount(this.selectors.menuItems);
  }

  /**
   * Check if mobile menu toggle is available
   */
  async isMobileMenuToggleAvailable(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.mobileMenuToggle);
  }

  /**
   * Check if mobile menu is displayed
   */
  async isMobileMenuDisplayed(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.mobileMenu);
  }

  /**
   * Check if breadcrumbs are displayed
   */
  async areBreadcrumbsDisplayed(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.breadcrumbs);
  }

  /**
   * Check if logo is displayed
   */
  async isLogoDisplayed(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.logo);
  }

  /**
   * Check if search box is available
   */
  async isSearchBoxAvailable(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.searchBox);
  }

  /**
   * Check if search button is available
   */
  async isSearchButtonAvailable(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.searchButton);
  }

  /**
   * Check if user menu is available
   */
  async isUserMenuAvailable(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.userMenu);
  }

  /**
   * Check if cart icon is displayed
   */
  async isCartIconDisplayed(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.cartIcon);
  }

  /**
   * Check if language selector is available
   */
  async isLanguageSelectorAvailable(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.languageSelector);
  }

  /**
   * Check if footer is displayed
   */
  async isFooterDisplayed(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.footer);
  }

  /**
   * Get footer links count
   */
  async getFooterLinksCount(): Promise<number> {
    return await this.getElementCount(this.selectors.footerLinks);
  }

  /**
   * Check if social links are available
   */
  async areSocialLinksAvailable(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.socialLinks);
  }

  /**
   * Check if category menu is available
   */
  async isCategoryMenuAvailable(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.categoryMenu);
  }

  /**
   * Check if dropdown menus are available
   */
  async areDropdownMenusAvailable(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.dropdownMenus);
  }

  /**
   * Get menu items details
   */
  async getMenuItemsDetails(): Promise<Array<{
    text: string | null;
    href: string | null;
    isVisible: boolean;
  }>> {
    const menuItems = this.page.locator(this.selectors.menuItems);
    const count = await menuItems.count();
    const items = [];
    
    for (let i = 0; i < Math.min(count, 10); i++) { // Limit to 10 items for performance
      const item = menuItems.nth(i);
      
      items.push({
        text: await item.textContent(),
        href: await item.getAttribute('href'),
        isVisible: await item.isVisible()
      });
    }
    
    return items;
  }

  /**
   * Get comprehensive navigation analysis
   */
  async getNavigationAnalysis(): Promise<{
    mainNav: boolean;
    menuItemsCount: number;
    mobileToggle: boolean;
    mobileMenu: boolean;
    breadcrumbs: boolean;
    logo: boolean;
    search: boolean;
    searchButton: boolean;
    userMenu: boolean;
    cartIcon: boolean;
    language: boolean;
    footer: boolean;
    footerLinksCount: number;
    socialLinks: boolean;
    categoryMenu: boolean;
    dropdownMenus: boolean;
    menuItems: Array<{
      text: string | null;
      href: string | null;
      isVisible: boolean;
    }>;
  }> {
    const analysis = {
      mainNav: await this.isMainNavigationDisplayed(),
      menuItemsCount: await this.getMenuItemsCount(),
      mobileToggle: await this.isMobileMenuToggleAvailable(),
      mobileMenu: await this.isMobileMenuDisplayed(),
      breadcrumbs: await this.areBreadcrumbsDisplayed(),
      logo: await this.isLogoDisplayed(),
      search: await this.isSearchBoxAvailable(),
      searchButton: await this.isSearchButtonAvailable(),
      userMenu: await this.isUserMenuAvailable(),
      cartIcon: await this.isCartIconDisplayed(),
      language: await this.isLanguageSelectorAvailable(),
      footer: await this.isFooterDisplayed(),
      footerLinksCount: await this.getFooterLinksCount(),
      socialLinks: await this.areSocialLinksAvailable(),
      categoryMenu: await this.isCategoryMenuAvailable(),
      dropdownMenus: await this.areDropdownMenusAvailable(),
      menuItems: await this.getMenuItemsDetails()
    };

    console.log(`🧭 Navigation analysis:`, {
      mainNav: analysis.mainNav,
      menuItems: analysis.menuItemsCount,
      logo: analysis.logo,
      footer: analysis.footer
    });

    return analysis;
  }

  /**
   * Test navigation interactions (UI only - no real navigation)
   */
  async testNavigationInteractions(): Promise<{
    logoClickable: boolean;
    menuItemsClickable: number;
    searchInteractive: boolean;
    cartInteractive: boolean;
    mobileToggleInteractive: boolean;
  }> {
    let logoClickable = false;
    let menuItemsClickable = 0;
    let searchInteractive = false;
    let cartInteractive = false;
    let mobileToggleInteractive = false;

    // Test logo clickability
    if (await this.isLogoDisplayed()) {
      const logo = this.page.locator(this.selectors.logo).first();
      logoClickable = await logo.isEnabled();
    }

    // Test menu items clickability
    const menuItems = this.page.locator(this.selectors.menuItems);
    const menuCount = await menuItems.count();
    
    for (let i = 0; i < Math.min(menuCount, 5); i++) {
      const item = menuItems.nth(i);
      if (await item.isVisible() && await item.isEnabled()) {
        menuItemsClickable++;
      }
    }

    // Test search interactivity
    if (await this.isSearchBoxAvailable()) {
      const searchBox = this.page.locator(this.selectors.searchBox).first();
      searchInteractive = await searchBox.isEnabled();
    }

    // Test cart interactivity
    if (await this.isCartIconDisplayed()) {
      const cartIcon = this.page.locator(this.selectors.cartIcon).first();
      cartInteractive = await cartIcon.isEnabled();
    }

    // Test mobile toggle interactivity
    if (await this.isMobileMenuToggleAvailable()) {
      const toggle = this.page.locator(this.selectors.mobileMenuToggle).first();
      mobileToggleInteractive = await toggle.isEnabled();
    }

    console.log(`🔧 Navigation interactions: Logo(${logoClickable}) MenuItems(${menuItemsClickable}) Search(${searchInteractive}) Cart(${cartInteractive}) Mobile(${mobileToggleInteractive})`);

    return {
      logoClickable,
      menuItemsClickable,
      searchInteractive,
      cartInteractive,
      mobileToggleInteractive
    };
  }

  /**
   * Test navigation responsiveness across different viewports
   */
  async testNavigationResponsive(): Promise<{
    mobile: {
      mainNav: boolean;
      mobileToggle: boolean;
      logo: boolean;
    };
    tablet: {
      mainNav: boolean;
      mobileToggle: boolean;
      logo: boolean;
    };
    desktop: {
      mainNav: boolean;
      mobileToggle: boolean;
      logo: boolean;
    };
  }> {
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1200, height: 800 }
    ];

    const results = {
      mobile: { mainNav: false, mobileToggle: false, logo: false },
      tablet: { mainNav: false, mobileToggle: false, logo: false },
      desktop: { mainNav: false, mobileToggle: false, logo: false }
    };

    for (const viewport of viewports) {
      await this.page.setViewportSize({ width: viewport.width, height: viewport.height });
      await this.page.waitForTimeout(1000); // Allow responsive adjustments
      
      const viewportResults = {
        mainNav: await this.isMainNavigationDisplayed(),
        mobileToggle: await this.isMobileMenuToggleAvailable(),
        logo: await this.isLogoDisplayed()
      };
      
      results[viewport.name as keyof typeof results] = viewportResults;
      console.log(`📱 Navigation responsive ${viewport.name} (${viewport.width}x${viewport.height}):`, viewportResults);
    }

    // Reset to desktop view
    await this.page.setViewportSize({ width: 1200, height: 800 });

    return results;
  }

  /**
   * Test mobile menu functionality (UI visibility only)
   */
  async testMobileMenu(): Promise<{
    toggleExists: boolean;
    menuExists: boolean;
    canToggle: boolean;
  }> {
    // Set mobile viewport
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.page.waitForTimeout(1000);

    const toggleExists = await this.isMobileMenuToggleAvailable();
    const menuExists = await this.isMobileMenuDisplayed();
    let canToggle = false;

    if (toggleExists) {
      try {
        const toggle = this.page.locator(this.selectors.mobileMenuToggle).first();
        canToggle = await toggle.isEnabled();
        
        // Try to click toggle (just test, don't verify state change)
        if (canToggle) {
          await toggle.click({ timeout: 2000 });
          await this.page.waitForTimeout(500);
          console.log('📱 Mobile menu toggle clicked successfully');
        }
      } catch (error) {
        console.log('⚠️ Mobile menu toggle interaction failed');
      }
    }

    // Reset to desktop view
    await this.page.setViewportSize({ width: 1200, height: 800 });

    console.log(`📱 Mobile menu test: Toggle(${toggleExists}) Menu(${menuExists}) CanToggle(${canToggle})`);

    return {
      toggleExists,
      menuExists,
      canToggle
    };
  }
}
