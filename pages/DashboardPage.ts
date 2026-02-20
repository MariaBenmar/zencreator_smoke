import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
    readonly creditsBadge: Locator;
    readonly userMenu: Locator;

    constructor(page: Page) {
        super(page);
        this.creditsBadge = page.locator('[data-testid="credits"], text=/credits?/i').first();
        this.userMenu = page.locator('[data-testid="user-menu"], button[aria-label*="account" i], text=/dashboard/i').first();
    }

    async expectLoggedIn(): Promise<void> {
        await expect(this.userMenu).toBeVisible({ timeout: 20_000 });
    }

    async getCreditsValue(): Promise<number> {
        const text = (await this.creditsBadge.textContent()) ?? '';
        const parsed = Number(text.replace(/[^\d]/g, ''));
        expect(Number.isNaN(parsed)).toBeFalsy();
        return parsed;
    }
}
