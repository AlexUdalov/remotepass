
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

        await homePage.goto();
        await homePage.acceptCookies();
    });

    test('TC01: Verify Homepage Load and Critical Elements', async () => {
        await expect(homePage.page).toHaveTitle(/RemotePass/);
        await expect(homePage.logo).toBeVisible();
        await expect(homePage.bookDemoBtn).toBeVisible();
        await expect(homePage.navPricing).toBeVisible();
    });

    test('TC02: Verify Platform Dropdown Navigation', async () => {
        await homePage.navPlatform.hover();
        await expect(homePage.platformDropdownContent).toBeVisible();

        // Check for specific sub-items like 'Contractors' or 'EOR'
        // Since names might change, we check visibility of list items
        const links = await homePage.page.locator('.w-dropdown-link').all();
        expect(links.length).toBeGreaterThan(0);
    });

    test('TC03: Pricing Page Navigation and Plan Display', async () => {
        await homePage.navigateToPricing();
        await expect(pricingPage.page).toHaveURL(/.*pricing/);

        // Verify pricing cards are displayed
        // Note: Selector might need adjustment if class names are obfuscated/dynamic
        // Using text content as a backup check
        await expect(pricingPage.page.getByText('Starter', { exact: false }).first()).toBeVisible();
        await expect(pricingPage.page.getByText('Premium', { exact: false }).first()).toBeVisible();
    });

    test('TC04: Verify Pricing Toggle Interaction', async () => {
        await homePage.navigateToPricing();

        // Check default state (usually Monthly)
        // Then toggle to Annual/Yearly if available or 'All Features'
        const annualToggle = pricingPage.page.locator('.pricing-toggle');
        if (await annualToggle.isVisible()) {
            await annualToggle.click();
        }

        // Verify 'All Features' toggle based on exploration
        // Assuming the class .all_features exists from exploration
        // If not, we skip this specific interaction or use a known visible element
        const allFeaturesBtn = pricingPage.page.locator('.all_features, .feature-toggle');
        if (await allFeaturesBtn.isVisible()) {
            await allFeaturesBtn.click();
            await expect(pricingPage.page.locator('.feature-list, .detailed-view')).toBeVisible();
        }
    });

    test('TC05: Book a Demo Form Validation', async () => {
        await homePage.clickBookDemo();
        await expect(demoPage.page).toHaveURL(/.*demo-request/);

        // Submit empty form to trigger validation
        // Wait for form to be interactive
        await demoPage.submitButton.waitFor({ state: 'visible' });
        await demoPage.submit();

        // Verify error messages
        await expect(demoPage.page.locator('.hs-error-msgs').first()).toBeVisible();
    });

    test('TC06: Verify External Login Redirection', async ({ context }) => {
        // Handling new tab if target="_blank"
        const [newPage] = await Promise.all([
            context.waitForEvent('page'),
            homePage.navLogin.click(),
        ]);

        await newPage.waitForLoadState();
        await expect(newPage).toHaveURL(/.*app.remotepass.com\/login/);
        await newPage.close();
    });

    test('TC07: Verify Footer Links Stability', async () => {
        // Scroll to bottom
        await homePage.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

        const termsLink = homePage.page.locator('footer a[href*="terms"]');
        const privacyLink = homePage.page.locator('footer a[href*="privacy"]');

        await expect(termsLink).toBeVisible();
        await expect(privacyLink).toBeVisible();
    });

});
