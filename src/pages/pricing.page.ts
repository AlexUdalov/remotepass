
import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class PricingPage extends BasePage {
    readonly planCards: Locator;
    readonly allFeaturesToggle: Locator;
    readonly keyFeaturesToggle: Locator;
    readonly detailedTable: Locator;
    readonly monthlyToggle: Locator;
    readonly yearlyToggle: Locator;

    constructor(page: Page) {
        super(page);
        this.planCards = page.locator('.pricing-card'); // Generalized selector
        this.allFeaturesToggle = page.locator('.all_features');
        this.keyFeaturesToggle = page.locator('.key_features');
        this.detailedTable = page.locator('#w-tabs-0-data-w-pane-1'); // Adjusted based on common Webflow tabs, might need refinement

        // Toggles for billing cycle - usually these are radio buttons or div switches
        this.monthlyToggle = page.locator('div[w-tab="Monthly"]');
        this.yearlyToggle = page.locator('div[w-tab="Yearly"]');
    }

    async verifyPlansLoaded() {
        // Assert at least one plan is visible
        await expect(this.planCards.first()).toBeVisible();
        const count = await this.planCards.count();
        expect(count).toBeGreaterThan(0);
    }

    async toggleAllFeatures() {
        await this.allFeaturesToggle.click();
        // Verify detailed view is visible
        // This selector might be dynamic, so we check using text
        // Assuming 'Payroll' or deeper feature list appears
        await expect(this.page.getByText('Payroll Processing')).toBeVisible();
    }
}
