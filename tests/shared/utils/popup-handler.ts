import { Page } from "@playwright/test";

/**
 * Utility functions for handling popups and modals
 */

export class PopupHandler {
  
  /**
   * Close any popups that might appear on the page
   */
  static async closePopups(page: Page): Promise<void> {
    try {
      // Handle subscription popup
      await PopupHandler.closeSubscriptionPopup(page);
      
      // Handle cookie consent
      await PopupHandler.closeCookieConsent(page);
      
      // Handle any generic modals
      await PopupHandler.closeGenericModals(page);
      
    } catch (error) {
      console.log(`ℹ️ Popup handling: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Close subscription popup (100 лей bonus popup)
   */
  static async closeSubscriptionPopup(page: Page): Promise<void> {
    const subscriptionPopupSelectors = [
      'button:has-text("✕")',
      'button[aria-label="Close"]',
      '.close',
      '.modal-close',
      '[class*="close"]',
      'button:has-text("×")',
      '.popup-close',
      '[data-dismiss="modal"]'
    ];

    for (const selector of subscriptionPopupSelectors) {
      const closeButton = page.locator(selector);
      
      if (await closeButton.count() > 0 && await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(500);
        console.log(`✅ Subscription popup closed with: ${selector}`);
        return;
      }
    }

    // Try pressing Escape key as fallback
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }

  /**
   * Close cookie consent popup
   */
  static async closeCookieConsent(page: Page): Promise<void> {
    const cookieSelectors = [
      'button:has-text("Ok")',
      'button:has-text("Принять")',
      'button:has-text("Accept")',
      'button:has-text("Согласен")',
      '.cookie-accept',
      '.accept-cookies',
      '[class*="cookie"] button'
    ];

    for (const selector of cookieSelectors) {
      const acceptButton = page.locator(selector);
      
      if (await acceptButton.count() > 0 && await acceptButton.isVisible()) {
        await acceptButton.click();
        await page.waitForTimeout(300);
        console.log(`✅ Cookie consent accepted with: ${selector}`);
        return;
      }
    }
  }

  /**
   * Close any generic modals or overlays
   */
  static async closeGenericModals(page: Page): Promise<void> {
    const modalSelectors = [
      '.modal.show',
      '.overlay.visible',
      '.popup.open',
      '[class*="modal"][class*="show"]',
      '[class*="popup"][class*="open"]',
      '.dialog[open]'
    ];

    for (const selector of modalSelectors) {
      const modal = page.locator(selector);
      
      if (await modal.count() > 0 && await modal.isVisible()) {
        // Look for close button within modal
        const closeButton = modal.locator('button:has-text("✕"), button:has-text("×"), .close, [aria-label="Close"]').first();
        
        if (await closeButton.count() > 0) {
          await closeButton.click();
          await page.waitForTimeout(300);
          console.log(`✅ Generic modal closed`);
          return;
        }
        
        // Try clicking outside modal
        await page.click('body', { position: { x: 10, y: 10 } });
        await page.waitForTimeout(300);
      }
    }
  }

  /**
   * Wait for page to load and handle all popups
   */
  static async waitAndHandlePopups(page: Page): Promise<void> {
    // Use shorter timeout for faster execution
    try {
      await page.waitForLoadState("domcontentloaded", { timeout: 15000 });
      await page.waitForTimeout(2000); // Give popups time to appear
      await PopupHandler.closePopups(page);
      await page.waitForTimeout(500); // Give time for popups to close
    } catch (error) {
      console.log(`ℹ️ Page loading timeout, proceeding with popup handling`);
      await PopupHandler.closePopups(page);
    }
  }

  /**
   * Check if any popups are still visible
   */
  static async hasVisiblePopups(page: Page): Promise<boolean> {
    const popupSelectors = [
      '.modal.show',
      '.popup.open',
      '.overlay.visible',
      '[class*="modal"]:visible',
      '[class*="popup"]:visible'
    ];

    for (const selector of popupSelectors) {
      const popup = page.locator(selector);
      if (await popup.count() > 0 && await popup.isVisible()) {
        return true;
      }
    }

    return false;
  }
}
