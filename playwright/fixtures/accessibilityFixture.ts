import { test as base } from "@playwright/test";
import type { Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

interface AccessibilityFixture {
  checkA11y: (page: Page) => Promise<void>;
}

// Extend the base test with accessibility testing capabilities
export const test = base.extend<AccessibilityFixture>({
  checkA11y: async (_crx, playwrightUse) => {
    await playwrightUse(async (page) => {
      const axeBuilder = new AxeBuilder({ page });
      const results = await axeBuilder.analyze();

      if (results.violations.length > 0) {
        throw new Error(`${results.violations.length} accessibility violations found`);
      }
    });
  },
});

export { expect } from "@playwright/test";
