
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { PricingPage } from '../pages/pricing.page';
import { DemoPage } from '../pages/demo.page';
import { CountryGuidePage } from '../pages/country-guide.page';

test.describe('RemotePass Automation Suite', () => {
    let homePage: HomePage;
    let pricingPage: PricingPage;
    let demoPage: DemoPage;

    test.beforeEach(async ({ page }) => {
        homePage = new HomePage(page);
        pricingPage = new PricingPage(page);
        demoPage = new DemoPage(page);

        // Navigate and handle cookies once
        await homePage.goto('/');
        await homePage.acceptCookies();
    });

    test('TC01: Verify Homepage Load and Critical Elements', async () => {
        // Sanity check
        await expect(homePage.page).toHaveTitle(/RemotePass/i);
        await expect(homePage.logo.first()).toBeVisible();

        // Check navigation items (responsive handling)
        if (await homePage.mobileMenuBtn.isVisible()) {
            await expect(homePage.mobileMenuBtn).toBeVisible();
        } else {
            await expect(homePage.navPricing).toBeVisible();
        }
    });

    test('TC02: Verify Platform Dropdown Navigation @desktopOnly', async ({ isMobile }) => {
        // Skip on mobile due to different menu interaction behavior requiring visual debug
        test.skip(isMobile, 'Platform dropdown interaction is different on mobile');
        // Wait for potential mobile menu toggle or desktop nav
        if (await homePage.mobileMenuBtn.isVisible()) {
            await homePage.mobileMenuBtn.waitFor({ state: 'visible' });
        } else {
            await homePage.navPlatform.waitFor({ state: 'visible' });
        }

        await homePage.togglePlatformMenu();

        // Verify dropdown content visible
        await homePage.platformDropdownContent.first().waitFor({ state: 'visible' });

        // Functional Check: Click the first link and verify navigation
        const firstLink = homePage.platformDropdownContent.locator('a').first();
        const href = await firstLink.getAttribute('href');

        if (href) {
            await firstLink.click();
            await expect(homePage.page).toHaveURL(new RegExp(href));
            // Go back to restore state for other tests if needed, though beforeEach handles resets
        }
    });

    test('TC03: Pricing Page Navigation and Interaction', async () => {
        await homePage.navigateToPricing();
        await expect(homePage.page).toHaveURL(/.*pricing/);
        await pricingPage.verifyPlansLoaded();

        // Functional Check: Verify "Get Started" or similar button on a plan functions
        const ctaButton = pricingPage.getStartedCtas.first();
        await expect(ctaButton).toBeVisible();
        const href = await ctaButton.getAttribute('href');
        expect(href).toBeTruthy();
        expect(href).toMatch(/signup|login|demo-request|contact/i);
    });

    test('TC04: Verify Pricing Feature Toggle Interaction', async () => {
        await homePage.navigateToPricing();

        // Verify "Key Features" vs "All Features" toggle interaction
        await pricingPage.verifyToggleInteraction();
    });

    test('TC05: Book a Demo Form Validation', async () => {
        // Navigate via button
        await homePage.clickBookDemo();
        await expect(demoPage.page).toHaveURL(/.*demo-request/);

        await expect(demoPage.formIframe).toBeVisible({ timeout: 15000 });
        await demoPage.submitButton.waitFor({ state: 'visible' });
        await demoPage.submit();

        // Verify validation error
        await demoPage.verifyValidationErrors();
    });

    test('TC06: Verify External Login Redirection', async ({ context }) => {
        const loginBtn = homePage.navLogin.first(); // Be specific
        await loginBtn.waitFor({ state: 'visible' });

        // Check if target is _blank
        const target = await loginBtn.getAttribute('target');

        if (target === '_blank') {
            const [newPage] = await Promise.all([
                context.waitForEvent('page'),
                loginBtn.click(),
            ]);
            await newPage.waitForLoadState();
            await expect(newPage).toHaveURL(/.*app.remotepass.com.*\/login/);
            await newPage.close();
        } else {
            // If same tab navigation
            await loginBtn.click();
            await expect(homePage.page).toHaveURL(/.*app.remotepass.com.*\/login/);
        }
    });

    test('TC07: Verify Footer Links Stability', async () => {
        // Scroll to bottom
        await homePage.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

        // Assert visibility using Page Object locators
        await expect(homePage.footerTerms.first()).toBeVisible();
        await expect(homePage.footerPrivacy.first()).toBeVisible();
    });

    test('TC08: Verify Critical Network Resources', async ({ page }) => {
        // Intercept network requests to ensure critical assets load successfully
        const failedRequests: string[] = [];

        page.on('response', response => {
            const url = response.url();
            const status = response.status();
            // Check for failures on main domain resources, ignoring potential third-party tracking blocks
            if (url.includes('remotepass.com') && status >= 400) {
                failedRequests.push(`${url} (${status})`);
            }
        });

        await homePage.goto('/');

        // Wait for network to be idle-ish to catch any late loads
        await page.waitForLoadState('networkidle');

        const ignoredHosts = [
            'googletagmanager.com',
            'google-analytics.com',
            'doubleclick.net',
            'facebook.net',
            'hotjar.com',
            'clarity.ms'
        ];
        const criticalFailures = failedRequests.filter((entry) => !ignoredHosts.some((host) => entry.includes(host)));
        expect(criticalFailures, `Failed critical network requests: ${criticalFailures.join(', ')}`).toHaveLength(0);
    });

    test('TC09: Verify Country Guide Data Explorer', async () => {
        const guidePage = new CountryGuidePage(homePage.page);
        // Correct URL is /countryguide
        await homePage.page.goto('/countryguide');
        await expect(homePage.page).toHaveURL(/.*countryguide/);

        // 1. Search for a specific country
        const targetCountry = 'Germany';
        await guidePage.searchForCountry(targetCountry);

        // 2. Select the country from results
        // Use a robust selector that finds the country link within the grid, ensuring we don't click a footer link
        const countryCard = homePage.page.locator('.w-dyn-item a').filter({ hasText: targetCountry }).first();
        await expect(countryCard).toBeVisible();
        await countryCard.click();

        // 3. functional check: Verify URL and Content
        await expect(homePage.page).toHaveURL(/.*germany/i);
        await expect(guidePage.countryNameHeader).toContainText(targetCountry);

        // 4. Data Integrity: Check if key data points are visible
        // These are critical for an EOR guide
        await expect(guidePage.currencyLabel.first()).toBeVisible();
        // Population might not be on every page, but Currency usually is
    });

});
