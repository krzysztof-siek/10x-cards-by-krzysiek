import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

/**
 * Base page class that all page objects should extend
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL
   */
  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Take a screenshot
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `./playwright/screenshots/${name}.png` });
  }

  /**
   * Assert page title
   */
  async assertTitle(title: string): Promise<void> {
    await expect(this.page).toHaveTitle(title);
  }

  /**
   * Check page accessibility
   */
  async checkAccessibility(): Promise<void> {
    // This requires @axe-core/playwright to be set up properly
    // Implementation will be added in a separate file
  }
} 