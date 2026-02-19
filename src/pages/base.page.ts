
import { type Page, type Locator } from '@playwright/test';

export class BasePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async goto(path: string = '/') {
        await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    }

    async acceptCookies() {
        try {
            // Multiple potential selectors for cookie banners
            const selectors = [
                '#items-center #accept-btn',
                '.btn.cookie-btn.accept-btn',
                '[id*="accept"]',
                '.cc-btn.cc-dismiss',
                'button:has-text("Accept")',
                'button:has-text("Allow all")',
                '.osano-cm-accept-all' // Common cookie manager
            ];

            for (const selector of selectors) {
                const btn = this.page.locator(selector).first();
                if (await btn.isVisible({ timeout: 500 })) {
                    await btn.click({ force: true }); // Force click in case of overlay issues
                    console.log(`Cookie banner accepted using selector: ${selector}`);
                    return;
                }
            }
        } catch (e) {
            console.log('Cookie banner interaction failed or not needed');
        }
    }

    async waitForUrl(urlPattern: string | RegExp) {
        await this.page.waitForURL(urlPattern);
    }
}
