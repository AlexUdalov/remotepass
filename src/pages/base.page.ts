
import { type Page, type Locator } from '@playwright/test';

export class BasePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Navigates to a specific path on the website.
     * @param path The relative path to navigate to (default is root '/').
     */
    async goto(path: string = '/') {
        await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    }

    /**
     * Attempts to accept cookies using a list of known selectors.
     * Fails silently if no banner is found to prevent test interruption.
     */
    async acceptCookies() {
        // Multiple potential selectors for cookie banners
        const selectors = [
            '#items-center #accept-btn',
            '.btn.cookie-btn.accept-btn',
            '.cc-btn.cc-dismiss',
            '.osano-cm-accept-all',
            'button:has-text("Accept")',
            'button:has-text("Allow all")'
        ];

        for (const selector of selectors) {
            const btn = this.page.locator(selector).first();
            try {
                if (await btn.isVisible({ timeout: 700 })) {
                    await btn.click();
                    await btn.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => null);
                    return;
                }
            } catch {
                // Banner implementations vary; keep trying known selectors.
            }
        }
    }

    async waitForUrl(urlPattern: string | RegExp) {
        await this.page.waitForURL(urlPattern);
    }
}
