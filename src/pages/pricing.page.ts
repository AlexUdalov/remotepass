
import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class PricingPage extends BasePage {
    readonly planCards: Locator;
    readonly keyFeaturesToggle: Locator;
    readonly allFeaturesToggle: Locator;
    readonly detailedTable: Locator;
    readonly priceDisplay: Locator;
    readonly getStartedCtas: Locator;

    constructor(page: Page) {
        super(page);
        // Generic pricing card selector
        this.planCards = page.locator('.pricing-col, .pricing-card');
        this.getStartedCtas = page.getByRole('link', { name: /^Get started$/i });

        // Feature Toggles
        this.keyFeaturesToggle = page.getByRole('link', { name: /^Key Features$/i }).first();
        this.allFeaturesToggle = page.getByRole('link', { name: /^All Features$/i }).first();

        this.detailedTable = page.locator('.detailed-view, .features-grid, .pricing-table');

        // Price display
        this.priceDisplay = page.locator('.price-text, .price-amount, .new_pricing_style_rp_h2_bold');
    }

    async verifyPlansLoaded() {
        await expect(this.page.getByRole('heading', { name: /^Pricing$/i })).toBeVisible();
        await expect(this.page.getByRole('heading', { name: /Contractors/i }).first()).toBeVisible();
        await expect(this.getStartedCtas.first()).toBeVisible();

        const ctaCount = await this.getStartedCtas.count();
        expect(ctaCount).toBeGreaterThan(2);
    }

    async toggleAllFeatures() {
        // Toggle from Key Features to All Features
        if (await this.allFeaturesToggle.isVisible()) {
            await this.allFeaturesToggle.click();
            // Verify state change if possible, e.g., class change
            await expect(this.allFeaturesToggle).toHaveClass(/active|current|selected/);
        }
    }

    async verifyToggleInteraction() {
        await expect(this.keyFeaturesToggle).toBeVisible();
        await expect(this.allFeaturesToggle).toBeVisible();

        await this.allFeaturesToggle.click();
        await expect(this.allFeaturesToggle).toHaveClass(/w--current|active|current|selected/);
        await expect(this.page.getByRole('heading', { name: /What’s included\?/i })).toBeVisible();

        await this.keyFeaturesToggle.click();
        await expect(this.keyFeaturesToggle).toHaveClass(/w--current|active|current|selected/);
    }

    async verifyPlanTextVisible(text: string | RegExp) {
        await expect(this.page.locator('h1, h2, h3, .pricing-col').getByText(text).first()).toBeVisible();
    }
}
