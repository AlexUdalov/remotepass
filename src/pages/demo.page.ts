
import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class DemoPage extends BasePage {
    readonly formIframe: Locator;
    readonly firstNameInput: Locator;
    readonly emailInput: Locator;
    readonly submitButton: Locator;
    readonly validationMessage: Locator;

    constructor(page: Page) {
        super(page);
        this.formIframe = page.locator('#hs-form-iframe-0, iframe[id^="hs-form-iframe"]').first();
        const formFrame = page.frameLocator('#hs-form-iframe-0, iframe[id^="hs-form-iframe"]').first();

        this.firstNameInput = formFrame.locator('input[name="firstname"], input[id^="firstname-"]');
        this.emailInput = formFrame.locator('input[name="email"], input[id^="email-"]');
        this.submitButton = formFrame.locator('input[type="submit"], button[type="submit"]');

        // HubSpot validation
        this.validationMessage = formFrame.locator('.hs-error-msg, .hs-error-msgs label');
    }

    async fillForm(firstName: string, email: string) {
        await expect(this.formIframe).toBeVisible({ timeout: 15000 });
        await expect(this.firstNameInput).toBeVisible({ timeout: 15000 });
        await this.firstNameInput.fill(firstName);
        await this.emailInput.fill(email);
    }

    async submit() {
        await this.submitButton.waitFor({ state: 'visible' });
        await this.submitButton.click();
    }

    async verifyValidationErrors() {
        // Expect error messages to be visible after submission
        // Increase timeout as validation might be slightly delayed
        await expect(this.validationMessage.first()).toBeVisible({ timeout: 10000 });
    }
}
