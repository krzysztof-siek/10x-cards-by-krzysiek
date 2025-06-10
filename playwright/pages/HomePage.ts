import { expect } from "@playwright/test";
import type { Page, Locator } from "@playwright/test";
import { BasePage } from "./basePage";

/**
 * HomePage page object for testing the home page
 */
export class HomePage extends BasePage {
  // Locators
  readonly heading: Locator;
  readonly loginButton: Locator;
  readonly signupButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole("heading", { name: /welcome to 10x cards/i }).first();
    this.loginButton = page.getByRole("button", { name: /login/i });
    this.signupButton = page.getByRole("button", { name: /sign up/i });
  }

  /**
   * Navigate to the home page
   */
  async goto(path = "/"): Promise<void> {
    await super.goto(path);
  }

  /**
   * Click the login button
   */
  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  /**
   * Click the signup button
   */
  async clickSignup(): Promise<void> {
    await this.signupButton.click();
  }

  /**
   * Verify the home page has loaded correctly
   */
  async verifyPageLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
  }
}
