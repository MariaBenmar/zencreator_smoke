import { test, expect } from '@playwright/test';
import { allure } from 'allure-playwright';
import { AuthPage } from '../../pages/AuthPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { generateRandomEmail } from '../../utils/dataFactory';
import { getPublicIP } from '../../utils/network';
import { registerConsoleErrorCollector } from '../../utils/siteChecks';

test.describe('User registration', () => {
    test('Register new user and verify dashboard access', async ({ page }) => {
        allure.epic('Authentication');
        allure.feature('Registration');
        allure.severity('blocker');

        const authPage = new AuthPage(page);
        const dashboardPage = new DashboardPage(page);
        const getErrors = registerConsoleErrorCollector(page);
        const email = generateRandomEmail();

        await test.step('Register with a random timestamp-based email', async () => {
            await authPage.openRegistration();
            await authPage.register(email, process.env.DEFAULT_STRONG_PASSWORD ?? 'Qa!123456789');
        });

        await test.step('Verify redirect to dashboard and logged-in state', async () => {
            await expect(page).toHaveURL(/dashboard|app|workspace/i);
            await dashboardPage.expectLoggedIn();
        });

        await test.step('Verify no browser console errors after onboarding', async () => {
            expect(getErrors()).toEqual([]);
        });
    });
});

test.describe('Free credits verification', () => {
    test('Credits should be displayed and greater than zero', async ({ page }) => {
        allure.epic('Post Registration');
        allure.feature('Free credits verification');
        allure.severity('critical');

        const dashboardPage = new DashboardPage(page);

        await test.step('Navigate to dashboard and assert credits element', async () => {
            await dashboardPage.gotoAndValidateStatus('/dashboard');
            await expect(dashboardPage.creditsBadge).toBeVisible();
        });

        await test.step('Validate free credits are greater than zero', async () => {
            const credits = await dashboardPage.getCreditsValue();
            expect(credits).toBeGreaterThan(0);
        });
    });
});

test.describe('IP verification', () => {
    test('Capture and attach public IP, then compare with UI when available', async ({ page }) => {
        allure.epic('Post Registration');
        allure.feature('IP verification');
        allure.severity('minor');

        const publicIp = await getPublicIP(page);
        allure.attachment('Public IP', publicIp ?? 'IP unavailable', 'text/plain');

        await test.step('Open dashboard/profile page for potential registration IP visibility', async () => {
            await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
        });

        await test.step('Compare UI IP with public IP when field is visible', async () => {
            const uiIpLocator = page.locator('[data-testid="registration-ip"], text=/\b\d{1,3}(\.\d{1,3}){3}\b/').first();
            const visible = await uiIpLocator.isVisible({ timeout: 5_000 }).catch(() => false);
            if (visible && publicIp) {
                const uiIpText = (await uiIpLocator.textContent()) ?? '';
                expect(uiIpText).toContain(publicIp);
            } else {
                test.info().annotations.push({ type: 'debug', description: `UI IP not present or publicIp unavailable: ${publicIp}` });
            }
        });
    });
});
