import { test, expect } from '@playwright/test';
import { allure } from 'allure-playwright';
import { HomePage } from '../../pages/HomePage';
import { assertNoBrokenImages, expectLinksHealthy, registerConsoleErrorCollector } from '../../utils/siteChecks';

test.describe('Smoke: Site availability and structure', () => {
    test('Homepage loads with HTTP 200 and no console errors', async ({ page, baseURL }) => {
        allure.epic('Smoke');
        allure.feature('Site Availability');
        allure.severity('critical');

        const getErrors = registerConsoleErrorCollector(page);
        const homePage = new HomePage(page);

        await test.step('Open homepage and validate HTTP status code', async () => {
            const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
            expect(response?.status()).toBe(200);
            await expect(page).toHaveURL(baseURL ?? 'https://zencreator.pro');
            await homePage.open();
        });

        await test.step('Validate no browser console errors are present', async () => {
            expect(getErrors(), 'Console errors should not be present on homepage').toEqual([]);
        });
    });

    test('Assets and navigation links are healthy', async ({ page, baseURL }) => {
        allure.epic('Smoke');
        allure.feature('Site Structure');
        allure.severity('normal');

        const homePage = new HomePage(page);

        await test.step('Open homepage and ensure no broken images exist', async () => {
            await homePage.open();
            await assertNoBrokenImages(page);
        });

        await test.step('Validate top navigation links return success statuses', async () => {
            const navHrefs = await homePage.navLinks.evaluateAll((anchors, origin) => {
                return anchors
                    .map((anchor) => anchor.getAttribute('href'))
                    .filter((href): href is string => Boolean(href))
                    .map((href) => new URL(href, origin as string).toString());
            }, baseURL ?? 'https://zencreator.pro');

            await expectLinksHealthy(page, [...new Set(navHrefs)]);
        });

        await test.step('Validate footer links and static resources are not returning 4xx/5xx', async () => {
            const footerHrefs = await homePage.footerLinks.evaluateAll((anchors, origin) => {
                return anchors
                    .map((anchor) => anchor.getAttribute('href'))
                    .filter((href): href is string => Boolean(href) && !href.startsWith('mailto:'))
                    .map((href) => new URL(href, origin as string).toString());
            }, baseURL ?? 'https://zencreator.pro');

            await expectLinksHealthy(page, [...new Set(footerHrefs)]);

            const staticResources = await page.evaluate((origin) => {
                const entries = performance
                    .getEntriesByType('resource')
                    .map((entry) => (entry as PerformanceResourceTiming).name)
                    .filter((name) => name.startsWith(origin as string));
                return [...new Set(entries)];
            }, baseURL ?? 'https://zencreator.pro');

            await expectLinksHealthy(page, staticResources.slice(0, 25));
        });
    });

    test('All public pages discovered from homepage are accessible', async ({ page, baseURL }) => {
        allure.epic('Smoke');
        allure.feature('Public Pages');
        allure.severity('critical');

        const homePage = new HomePage(page);

        await test.step('Discover relative public page links from homepage', async () => {
            await homePage.open();
        });

        const routes = await homePage.collectPublicPageLinks();

        await test.step('Navigate each discovered page and assert success status', async () => {
            for (const route of routes) {
                const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
                expect(response?.status(), `Public route is unavailable: ${route}`).toBeLessThan(400);
                await expect(page).toHaveURL(new RegExp(`${new URL(baseURL ?? 'https://zencreator.pro').origin}`));
            }
        });
    });
});
