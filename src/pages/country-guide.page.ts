import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class CountryGuidePage extends BasePage {
    readonly searchInput: Locator;
    readonly countryGrid: Locator;
    readonly countryCard: Locator;

    // Country Detail Elements
    readonly countryNameHeader: Locator;
    readonly currencyLabel: Locator;
    readonly populationLabel: Locator;

    constructor(page: Page) {
        super(page);
        this.searchInput = page.locator('#search');
        this.countryGrid = page.locator('.w-dyn-list, .countries-grid');
        this.countryCard = page.locator('.w-dyn-item a, a.w-inline-block').filter({ hasText: /View Guide|Learn More/i });

        this.countryNameHeader = page.locator('h1').first();
        // Selectors for data points might be tabular or grid-based
        this.currencyLabel = page.getByText('Currency', { exact: false });
        this.populationLabel = page.getByText('Population', { exact: false });
    }

    async searchForCountry(countryName: string) {
        await this.searchInput.fill(countryName);
        const resultCard = this.page.locator('.w-dyn-item a').filter({ hasText: countryName }).first();
        await expect(resultCard).toBeVisible({ timeout: 10000 });
    }

    async clickCountry(countryName: string) {
        // Click the card that contains the country name
        const card = this.page.locator('a').filter({ hasText: countryName }).first();
        await card.click();
        await this.page.waitForLoadState('domcontentloaded');
    }
}
