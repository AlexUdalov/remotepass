
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
    readonly mobileMenuBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.logo = page.locator('a.w-nav-brand');

        // Mobile menu toggle
        this.mobileMenuBtn = page.locator('.menu-button.w-nav-button, [aria-label="menu"]');

        // resilient selector for the 'Platform' dropdown
        this.navPlatform = page.locator('nav').getByText(/Platform/i).locator('visible=true');

        // resilient selector for 'Pricing' link
        this.navPricing = page.locator('a[href*="/pricing"]:visible').filter({ hasText: /^Pricing$/i }).first();

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
        if (await this.mobileMenuBtn.isVisible()) {
            await this.mobileMenuBtn.click();
            await expect(this.navPlatform.first()).toBeVisible();
        }
        await this.navPlatform.click();

        // On mobile, dropdown might be different, but content should be visible
        // We use a robust wait
        await this.platformDropdownContent.first().waitFor({ state: 'visible' });
    }

    /**
     * Navigates to the Pricing page via the navigation menu.
     */
    async navigateToPricing() {
        let pricingLink = this.page.locator('a[href*="/pricing"]:visible').filter({ hasText: /^Pricing$/i }).first();

        if (!(await pricingLink.isVisible()) && await this.mobileMenuBtn.isVisible()) {
            await this.mobileMenuBtn.click();
            await expect(pricingLink).toBeVisible();
            pricingLink = this.page.locator('a[href*="/pricing"]:visible').filter({ hasText: /^Pricing$/i }).first();
        }

        await expect(pricingLink).toBeVisible();
        await pricingLink.scrollIntoViewIfNeeded();
        await pricingLink.click();
        await this.page.waitForURL(/\/pricing(?:[/?#]|$)/);
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
