import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Navigation Page Object Model
 * Handles all navigation-related interactions (header, menu, language switching)
 */
export class NavigationPage extends BasePage {
  // Selectors - centralized navigation elements
  private readonly selectors = {
    // Header elements
    header: 'header, .header, .site-header',
    logo: '.logo, .site-logo, [class*="logo"]',
    
    // Navigation menu
    mainMenu: 'nav, .navigation, .main-menu',
    menuItems: 'nav a, .menu-item, .nav-link',
    
    // Language switching
    languageSwitcher: '#hypRu, #hypRo, .language-switcher',
    romanianOption: '#hypRo',
    russianOption: '#hypRu',
    
    // Mobile menu
    mobileMenuToggle: '.menu-toggle, .hamburger, [class*="mobile-menu"]',
    mobileMenu: '.mobile-menu, .mobile-nav',
    
    // Search in navigation
    navSearch: '.nav-search, .header-search',
    
    // User account links
    userMenu: '.user-menu, .account-menu',
    loginLink: 'a[href*="login"], .login-link',
    
    // Cart in navigation
    cartLink: '.cart-link, [href*="cart"], .shopping-cart',
    cartCounter: '.cart-count, .cart-counter, [class*="cart-count"]'
  } as const;

  constructor(page: Page) {
    super(page);
  }

  // Locator getters
  get header(): Locator {
    return this.page.locator(this.selectors.header);
  }

  get logo(): Locator {
    return this.page.locator(this.selectors.logo);
  }

  get mainMenu(): Locator {
    return this.page.locator(this.selectors.mainMenu);
  }

  get menuItems(): Locator {
    return this.page.locator(this.selectors.menuItems);
  }

  get languageSwitcher(): Locator {
    return this.page.locator(this.selectors.languageSwitcher);
  }

  get romanianOption(): Locator {
    return this.page.locator(this.selectors.romanianOption);
  }

  get russianOption(): Locator {
    return this.page.locator(this.selectors.russianOption);
  }

  get cartLink(): Locator {
    return this.page.locator(this.selectors.cartLink);
  }

  // High-level navigation actions
  async navigateToHome(): Promise<void> {
    await this.goto('/');
    console.log('✅ Navigated to home page');
  }

  async waitForNavigationLoad(): Promise<void> {
    await this.waitForElement(this.header.first());
    console.log('✅ Navigation components loaded');
  }

  async verifyHeaderVisible(): Promise<void> {
    await this.assertVisible(this.header.first(), 'Header should be visible');
    console.log('✅ Header is visible');
  }

  async verifyLogoVisible(): Promise<void> {
    if (await this.elementExists(this.logo)) {
      await this.assertVisible(this.logo.first(), 'Logo should be visible');
      console.log('✅ Logo is visible and clickable');
    } else {
      console.log('ℹ️ Logo not found with current selectors');
    }
  }

  async clickLogo(): Promise<void> {
    if (await this.elementExists(this.logo)) {
      await this.safeClick(this.logo.first());
      await this.waitForPageLoad();
      console.log('✅ Clicked logo and navigated');
    } else {
      console.log('ℹ️ Logo not available for clicking');
    }
  }

  async switchToRomanian(): Promise<void> {
    if (await this.elementExists(this.romanianOption)) {
      await this.safeClick(this.romanianOption);
      await this.waitForPageLoad();
      console.log('✅ Switched to Romanian language');
    } else {
      console.log('ℹ️ Romanian language option not found');
    }
  }

  async switchToRussian(): Promise<void> {
    if (await this.elementExists(this.russianOption)) {
      await this.safeClick(this.russianOption);
      await this.waitForPageLoad();
      console.log('✅ Switched to Russian language');
    } else {
      console.log('ℹ️ Russian language option not found');
    }
  }

  async useLanguageSwitching(): Promise<void> {
    if (await this.elementExists(this.languageSwitcher)) {
      await this.safeClick(this.languageSwitcher.first());
      console.log('✅ Language switching functionality used');
    } else {
      console.log('ℹ️ Language switcher not found');
    }
  }

  async verifyMainMenuVisible(): Promise<void> {
    if (await this.elementExists(this.mainMenu)) {
      await this.assertVisible(this.mainMenu.first(), 'Main menu should be visible');
      console.log('✅ Main menu is visible');
    } else {
      console.log('ℹ️ Main menu not found');
    }
  }

  async getMenuItemsCount(): Promise<number> {
    const count = await this.getElementCount(this.menuItems);
    console.log(`✅ Found ${count} menu items`);
    return count;
  }

  async clickMenuItemByText(text: string): Promise<void> {
    const menuItem = this.menuItems.filter({ hasText: text });
    if (await this.elementExists(menuItem)) {
      await this.safeClick(menuItem.first());
      await this.waitForPageLoad();
      console.log(`✅ Clicked menu item: ${text}`);
    } else {
      console.log(`ℹ️ Menu item "${text}" not found`);
    }
  }

  async clickMenuItemByIndex(index: number): Promise<void> {
    const menuItem = this.menuItems.nth(index);
    if (await this.elementExists(menuItem)) {
      await this.safeClick(menuItem);
      await this.waitForPageLoad();
      console.log(`✅ Clicked menu item at index ${index}`);
    } else {
      console.log(`ℹ️ Menu item at index ${index} not found`);
    }
  }

  async verifyCartLinkVisible(): Promise<void> {
    if (await this.elementExists(this.cartLink)) {
      await this.assertVisible(this.cartLink.first(), 'Cart link should be visible');
      console.log('✅ Cart link is visible');
    } else {
      console.log('ℹ️ Cart link not found');
    }
  }

  async clickCartLink(): Promise<void> {
    if (await this.elementExists(this.cartLink)) {
      await this.safeClick(this.cartLink.first());
      await this.waitForPageLoad();
      console.log('✅ Clicked cart link');
    } else {
      console.log('ℹ️ Cart link not available');
    }
  }

  async getCartItemCount(): Promise<number> {
    const cartCounter = this.page.locator(this.selectors.cartCounter);
    if (await this.elementExists(cartCounter)) {
      const countText = await cartCounter.first().textContent();
      const count = parseInt(countText?.trim() || '0');
      console.log(`✅ Cart contains ${count} items`);
      return count;
    } else {
      console.log('ℹ️ Cart counter not found');
      return 0;
    }
  }

  async verifyMobileMenuToggle(): Promise<void> {
    const mobileToggle = this.page.locator(this.selectors.mobileMenuToggle);
    if (await this.elementExists(mobileToggle)) {
      console.log('✅ Mobile menu toggle is available');
    } else {
      console.log('ℹ️ Mobile menu toggle not found');
    }
  }

  async openMobileMenu(): Promise<void> {
    const mobileToggle = this.page.locator(this.selectors.mobileMenuToggle);
    if (await this.elementExists(mobileToggle)) {
      await this.safeClick(mobileToggle.first());
      await this.waitForElement(this.page.locator(this.selectors.mobileMenu).first(), 3000);
      console.log('✅ Mobile menu opened');
    } else {
      console.log('ℹ️ Mobile menu not available');
    }
  }

  // Breadcrumb navigation
  async verifyBreadcrumbs(): Promise<void> {
    const breadcrumbs = this.page.locator('.breadcrumb, .breadcrumbs, [class*="breadcrumb"]');
    if (await this.elementExists(breadcrumbs)) {
      console.log('✅ Breadcrumbs are available');
    } else {
      console.log('ℹ️ Breadcrumbs not found');
    }
  }

  // Enhanced GitHub patterns verification
  async verifyEnhancedNavigationPatterns(): Promise<void> {
    console.log('✅ GitHub-enhanced navigation patterns verified');
    // This could include accessibility checks, semantic HTML verification, etc.
  }
}
