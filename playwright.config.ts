import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 2 : undefined,
    timeout: 120_000,
    expect: {
        timeout: 15_000
    },
    reporter: [
        ['list'],
        ['html', { open: 'never' }],
        ['allure-playwright']
    ],
    use: {
        baseURL: process.env.BASE_URL ?? 'https://zencreator.pro',
        trace: 'retain-on-failure',
        video: 'retain-on-failure',
        screenshot: 'only-on-failure',
        actionTimeout: 15_000,
        navigationTimeout: 30_000,
        testIdAttribute: 'data-testid'
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] }
        }
    ],
    outputDir: 'test-results'
});
