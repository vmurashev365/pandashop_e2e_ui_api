import { Page } from "@playwright/test";

/**
 * Simple popup handler specifically for Pandashop.md
 */

export class SimplePopupHandler {
  
  /**
   * Handle popups on Pandashop.md quickly
   */
  static async handlePandashopPopups(page: Page): Promise<void> {
    try {
      // Wait a bit for popups to appear
      await page.waitForTimeout(1500);
      
      // Close sputnik popup specifically (seen in test error)
      await SimplePopupHandler.closeSputnikPopup(page);
      
      // Close subscription popup (the bonus popup we saw)
      await SimplePopupHandler.closeSubscriptionPopup(page);
      
      // Accept cookies if present
      await SimplePopupHandler.acceptCookies(page);
      
      // Final cleanup with multiple escape presses
      await SimplePopupHandler.finalCleanup(page);
      
    } catch (error) {
      // Ignore errors and continue
      console.log(`ℹ️ Popup handling completed`);
    }
  }

  /**
   * Close the specific sputnik popup that was intercepting clicks
   */
  static async closeSputnikPopup(page: Page): Promise<void> {
    try {
      // Target the specific popup that was causing issues
      const sputnikPopup = page.locator('.popup-outer.popup-outer-sputnik.active');
      
      if (await sputnikPopup.count() > 0) {
        console.log(`🎯 Closing sputnik popup`);
        
        // Try clicking close button inside popup
        const closeBtn = sputnikPopup.locator('.close, .btn-close, [aria-label="Close"]').first();
        if (await closeBtn.count() > 0) {
          await closeBtn.click();
        } else {
          // Use escape key if no close button
          await page.keyboard.press('Escape');
        }
        
        await page.waitForTimeout(500);
      }
      
    } catch (error) {
      // Ignore errors
    }
  }

  /**
   * Final cleanup with multiple escape presses
   */
  static async finalCleanup(page: Page): Promise<void> {
    try {
      // Multiple escape key presses to clear any remaining modals
      for (let i = 0; i < 3; i++) {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(200);
      }
      
      // Click away from any interfering elements
      await page.click('body', { position: { x: 100, y: 100 } });
      await page.waitForTimeout(300);
      
    } catch (error) {
      // Ignore errors
    }
  }

  /**
   * Close the bonus subscription popup
   */
  static async closeSubscriptionPopup(page: Page): Promise<void> {
    try {
      // Look for the X button in the popup
      const closeSelectors = [
        'button:has-text("✕")',
        'button:has-text("×")', 
        '.close',
        '[aria-label="Close"]',
        'button[class*="close"]'
      ];

      for (const selector of closeSelectors) {
        const closeBtn = page.locator(selector);
        
        if (await closeBtn.count() > 0) {
          const firstBtn = closeBtn.first();
          
          if (await firstBtn.isVisible()) {
            await firstBtn.click();
            await page.waitForTimeout(300);
            console.log(`✅ Popup closed with: ${selector}`);
            return;
          }
        }
      }

      // Try Escape key as backup
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
      
    } catch (error) {
      // Ignore errors
    }
  }

  /**
   * Accept cookies
   */
  static async acceptCookies(page: Page): Promise<void> {
    try {
      const cookieButtons = [
        'button:has-text("Ok")',
        'button:has-text("Принять")',
        'button:has-text("Accept")'
      ];

      for (const selector of cookieButtons) {
        const btn = page.locator(selector);
        
        if (await btn.count() > 0 && await btn.isVisible()) {
          await btn.click();
          await page.waitForTimeout(200);
          console.log(`✅ Cookies accepted`);
          return;
        }
      }
      
    } catch (error) {
      // Ignore errors
    }
  }
}
