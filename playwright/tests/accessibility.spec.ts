import { test, expect } from '../fixtures/accessibilityFixture';

test.describe('Accessibility Tests', () => {
  test('homepage should not have accessibility violations', async ({ page, checkA11y }) => {
    // Navigate to homepage
    await page.goto('/');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Run accessibility tests
    await checkA11y(page, { detailedReport: true });
  });

  test('UI components should not have accessibility violations', async ({ page, checkA11y }) => {
    // This is a sample test that navigates to a components page if it exists
    // You would need to create a page that displays all components for testing
    await page.goto('/components');

    // Check if the page exists
    if (await page.getByText('Page not found').isVisible()) {
      test.skip();
      return;
    }

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Run accessibility tests
    await checkA11y(page);
  });
}); 