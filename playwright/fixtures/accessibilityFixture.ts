import { test as base } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

type AccessibilityFixture = {
  checkA11y: (
    page: Page, 
    options?: {
      detailedReport?: boolean;
    }
  ) => Promise<void>;
};

// Extend the base test with accessibility testing capabilities
export const test = base.extend<AccessibilityFixture>({
  checkA11y: async ({}, use) => {
    await use(async (page, options = {}) => {
      const axeBuilder = new AxeBuilder({ page });
      const results = await axeBuilder.analyze();
      
      if (results.violations.length > 0) {
        console.error('Accessibility violations found:', 
          results.violations.map(v => ({
            id: v.id,
            impact: v.impact,
            description: v.description,
            nodes: v.nodes.length
          }))
        );
        
        if (options.detailedReport) {
          console.error('Detailed report:', JSON.stringify(results.violations, null, 2));
        }
        
        throw new Error(`${results.violations.length} accessibility violations found`);
      }
    });
  },
});

export { expect } from '@playwright/test'; 