import { expect, type Locator, type Page, type Response } from '@playwright/test';

export class BasePage {
    constructor(protected readonly page: Page) {}

    /**
     * Navigates to any relative route and validates the HTTP status to fail fast on server issues.
     */
    async gotoAndValidateStatus(path = '/'): Promise<Response> {
        const response = await this.page.goto(path, { waitUntil: 'domcontentloaded' });
        expect(response, `Expected response object while navigating to: ${path}`).not.toBeNull();
        expect(response?.status(), `Expected success status code for path: ${path}`).toBeLessThan(400);
        return response as Response;
    }

    /**
     * Helper wrapper for click actions with visibility guard.
     */
    async click(locator: Locator): Promise<void> {
        await expect(locator).toBeVisible();
        await locator.click();
    }
}
