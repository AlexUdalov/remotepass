
import { type Page, type Locator, expect } from '@playwright/test';

export class BasePage {
    readonly page: Page;
    readonly cookieAcceptButton: Locator;

    constructor(page: Page) {
        this.page = page;
        // Common selector for cookie consent if present
        this.cookieAcceptButton = page.locator('#items-center #accept-btn');
    }

    async goto(path: string = '/') {
        await this.page.goto(path);
    }

    async acceptCookies() {
        // Try to click if visible, but don't fail if not found
        try {
            const acceptBtn = this.page.locator('.btn.cookie-btn.accept-btn, [id*="accept"], .cc-btn.cc-dismiss, button:contains("Accept")').first();
            if (await acceptBtn.isVisible({ timeout: 2000 })) {
                await acceptBtn.click();
            }
        } catch (e) {
            console.log('Cookie banner not found or already accepted');
        }
    }

    async getPageTitle() {
        return await this.page.title();
    }

    async waitForUrl(urlPattern: string | RegExp) {
        await this.page.waitForURL(urlPattern);
    }
}
