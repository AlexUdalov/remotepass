
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { PricingPage } from '../pages/pricing.page';
import { DemoPage } from '../pages/demo.page';

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

        // Check navigation items
        await expect(homePage.navPricing).toBeVisible();
    });

    test('TC02: Verify Platform Dropdown Navigation', async () => {
        await homePage.navPlatform.waitFor({ state: 'visible' });
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

    test('TC03: Pricing Page Navigation and Plan Display', async () => {
        await homePage.navigateToPricing();

        // Verify URL
        await expect(homePage.page).toHaveURL(/.*pricing/);

        // Verify specific plan titles exist
        // Actual titles found: Contractors, Employer of Record, etc.
        await pricingPage.verifyPlanTextVisible(/Contractors/i);
        await pricingPage.verifyPlanTextVisible(/Employer of Record/i);

        // Check for cards
        await pricingPage.verifyPlansLoaded();

        // Ensuring pricing components are mounted
        await expect(pricingPage.priceDisplay.first()).toBeVisible();
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

        // Wait for form to hydrate (HubSpot forms can be slow)
        // Attempt to submit empty form
        // If submit button is disabled initially, we might need to fill partial valid data
        // Assuming standard behavior where submit triggers validation
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
            await homePage.page.goBack();
        }
    });

    test('TC07: Verify Footer Links Stability', async () => {
        // Scroll to bottom
        await homePage.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

        // Assert visibility using Page Object locators
        await expect(homePage.footerTerms.first()).toBeVisible();
        await expect(homePage.footerPrivacy.first()).toBeVisible();
    });

});
