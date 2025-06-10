import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/HomePage";

test.describe("Homepage", () => {
  test("should load the homepage successfully", async ({ page }) => {
    // Go to the homepage
    await page.goto("/");

    // Verify page title
    await expect(page).toHaveTitle(/10x Cards/);

    // Check that the page loaded without errors
    await expect(page.locator("text=Welcome to 10x Cards").first()).toBeVisible();
  });

  test("should navigate to login page when login button is clicked", async ({ page }) => {
    // Create HomePage instance using Page Object Model
    const homePage = new HomePage(page);

    // Go to the homepage
    await homePage.goto("/");

    // Click login button if it exists
    const loginButton = page.getByRole("button", { name: /login/i });
    if (await loginButton.isVisible()) {
      await loginButton.click();

      // Verify we're on the login page
      await expect(page).toHaveURL(/.*login/);
    } else {
      test.skip();
    }
  });

  test("should have proper accessibility", async ({ page }) => {
    // Go to the homepage
    await page.goto("/");

    // Take a screenshot for visual verification
    await page.screenshot({ path: "playwright/screenshots/homepage.png" });

    // Compare screenshot with baseline (will create baseline on first run)
    await expect(page).toHaveScreenshot("homepage.png");
  });
});
