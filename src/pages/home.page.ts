
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
    readonly footerTerms: Locator;
    readonly footerPrivacy: Locator;

    constructor(page: Page) {
        super(page);
        this.logo = page.locator('a.w-nav-brand');

        // resilient selector for the 'Platform' dropdown
        this.navPlatform = page.locator('#w-dropdown-toggle-0, .rp-dropdown-toggle, .w-dropdown-toggle').filter({ hasText: 'Platform' }).first();

        // resilient selector for 'Pricing' link
        this.navPricing = page.locator('nav a, .nav-menu a, a.nav-link').filter({ hasText: 'Pricing' }).first();

        // resilient selector for 'Book a Demo'
        // Using getByRole is often more reliable
        this.bookDemoBtn = page.getByRole('link', { name: /Book a Demo/i }).first();

        this.heroSection = page.locator('.hero-section, .w-header, #main-content, h1').first();

        // Dynamic dropdown content
        this.platformDropdownContent = page.locator('.w-dropdown-list');

        // Auth buttons
        this.navLogin = page.locator('a[href*="login"]').filter({ hasText: 'Login' }).first();
        this.navSignUp = page.locator('a').filter({ hasText: 'Sign up' }).first();

        // Footer
        this.footerTerms = page.locator('footer a[href*="/terms"], a.rp-footer-link[href*="/terms"]');
        this.footerPrivacy = page.locator('footer a[href*="/privacy"], a.rp-footer-link[href*="/privacy"]');
    }

    async verifyElementsVisible() {
        await expect(this.logo).toBeVisible();
        await expect(this.navPricing).toBeVisible();
    }

    /**
     * Toggles the Platform dropdown menu.
     * Uses a click action as hover is unreliable for this specific implementation.
     */
    async togglePlatformMenu() {
        await this.navPlatform.click();
        await this.platformDropdownContent.first().waitFor({ state: 'visible' });
    }

    /**
     * Navigates to the Pricing page via the navigation menu.
     */
    async navigateToPricing() {
        // Force click if needed or standard click
        await this.navPricing.click();
        await this.page.waitForURL(/.*pricing/);
    }

    /**
     * Clicks the 'Book a Demo' button and waits for the request page to load.
     */
    async clickBookDemo() {
        await this.bookDemoBtn.click();
        await this.page.waitForURL(/.*demo-request/);
    }

    /**
     * Retrieves the text of all links within the Platform dropdown.
     * @returns Array of link text strings.
     */
    async getPlatformSubLinks() {
        return await this.platformDropdownContent.locator('a.dropdown-link, a.w-dropdown-link').allInnerTexts();
    }
}
