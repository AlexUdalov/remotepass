
import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class HomePage extends BasePage {
    readonly logo: Locator;
    readonly navPlatform: Locator;
    readonly navPricing: Locator;
    readonly bookDemoBtn: Locator;
    readonly heroSection: Locator;
    readonly platformDropdownContent: Locator;
    readonly navLogin: Locator;
    readonly navSignUp: Locator;

    constructor(page: Page) {
        super(page);
        this.logo = page.locator('a.w-nav-brand');
        this.navPlatform = page.locator('.rp-dropdown-toggle:has-text("Platform")');
        this.navPricing = page.locator('.rp-nav-link[href="/pricing"]');
        this.bookDemoBtn = page.locator('a[id="header"][href="/demo-request"]');
        this.heroSection = page.locator('#main-content');

        // Dynamic dropdown content
        this.platformDropdownContent = page.locator('.w-dropdown-list.w--open');

        // Auth buttons
        this.navLogin = page.locator('a[href*="app.remotepass.com/login"]');
        this.navSignUp = page.locator('a[href*="app.remotepass.com/signup"]');
    }

    async verifyElementsVisible() {
        await expect(this.logo).toBeVisible();
        await expect(this.bookDemoBtn).toBeVisible();
        // Use first() if multiple elements match or refine selector
        await expect(this.heroSection.first()).toBeVisible();
    }

    async hoverPlatformMenu() {
        await this.navPlatform.hover();
    }

    async navigateToPricing() {
        await this.navPricing.click();
    }

    async clickBookDemo() {
        await this.bookDemoBtn.click();
    }

    async getPlatformSubLinks() {
        // Should be visible after hover
        return this.page.locator('.w-dropdown-link').allTextContents();
    }
}
