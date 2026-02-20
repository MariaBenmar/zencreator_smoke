import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
    readonly navLinks: Locator;
    readonly footerLinks: Locator;
    readonly images: Locator;

    constructor(page: Page) {
        super(page);
        this.navLinks = page.locator('header a[href]');
        this.footerLinks = page.locator('footer a[href]');
        this.images = page.locator('img');
    }

    async open(): Promise<void> {
        await this.gotoAndValidateStatus('/');
        await expect(this.page).toHaveTitle(/zencreator/i);
    }

    async collectPublicPageLinks(): Promise<string[]> {
        const hrefs = await this.page
            .locator('a[href^="/"]:not([href^="//"])')
            .evaluateAll((anchors) =>
                [...new Set(anchors.map((anchor) => anchor.getAttribute('href') || '').filter(Boolean))]
            );

        return hrefs.filter((link) => !link.includes('#'));
    }
}
