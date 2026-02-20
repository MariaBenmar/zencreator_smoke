import { expect, type Page } from '@playwright/test';

/**
 * Registers a console error collector and returns a getter for assertion later in the test.
 */
export function registerConsoleErrorCollector(page: Page): () => string[] {
    const errors: string[] = [];

    page.on('console', (message) => {
        if (message.type() === 'error') {
            errors.push(message.text());
        }
    });

    return () => errors;
}

/**
 * Checks image tags for broken source URLs (naturalWidth = 0 usually means failed render/load).
 */
export async function assertNoBrokenImages(page: Page): Promise<void> {
    const brokenImageCount = await page.evaluate(() => {
        const images = Array.from(document.images);
        return images.filter((image) => image.complete && image.naturalWidth === 0).length;
    });

    expect(brokenImageCount, 'Expected page to have no broken images').toBe(0);
}

/**
 * Performs lightweight health checks for links by requesting resources and asserting status codes.
 */
export async function expectLinksHealthy(page: Page, urls: string[]): Promise<void> {
    for (const url of urls) {
        const response = await page.request.get(url);
        expect(response.status(), `Expected healthy status for URL: ${url}`).toBeLessThan(400);
    }
}
