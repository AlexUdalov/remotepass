
import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class DemoPage extends BasePage {
    readonly firstNameInput: Locator;
    readonly emailInput: Locator;
    readonly submitButton: Locator;
    readonly validationMessage: Locator;

    constructor(page: Page) {
        super(page);
        // Dynamic selectors as HubSpot IDs often change
        this.firstNameInput = page.locator('input[id^="firstname-"]');
        this.emailInput = page.locator('input[id^="email-"]');
        this.submitButton = page.locator('input[type="submit"].hs-button.primary');

        // Generic validation message locator, often scoped within .hs-error-msgs
        this.validationMessage = page.locator('.hs-error-msgs label');
    }

    async fillForm(firstName: string, email: string) {
        await this.firstNameInput.fill(firstName);
        await this.emailInput.fill(email);
    }

    async submit() {
        await this.submitButton.click();
    }

    async verifyValidationErrors() {
        // Expect error messages to be visible
        await expect(this.validationMessage.first()).toBeVisible();

        // Check for specific error text if possible
        const errorText = await this.validationMessage.first().textContent();
        expect(errorText).not.toBeNull();
    }
}
