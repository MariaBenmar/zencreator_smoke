import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class AuthPage extends BasePage {
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly submitButton: Locator;
    readonly validationMessage: Locator;

    constructor(page: Page) {
        super(page);
        this.emailInput = page.locator('input[type="email"], input[name*="email" i]').first();
        this.passwordInput = page.locator('input[type="password"], input[name*="password" i]').first();
        this.submitButton = page
            .locator('button:has-text("Sign up"), button:has-text("Register"), button[type="submit"]')
            .first();
        this.validationMessage = page
            .locator('[role="alert"], .error, .text-red-500, [aria-live="polite"]')
            .first();
    }

    async openRegistration(): Promise<void> {
        await this.gotoAndValidateStatus('/register');
    }

    async register(email: string, password: string): Promise<void> {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.submitButton.click();
    }

    async expectValidationMessage(): Promise<void> {
        await expect(this.validationMessage).toBeVisible({ timeout: 10_000 });
    }
}
