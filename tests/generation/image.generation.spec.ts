import path from 'node:path';
import { test, expect } from '@playwright/test';
import { allure } from 'allure-playwright';
import { DashboardPage } from '../../pages/DashboardPage';
import { GenerationPage } from '../../pages/GenerationPage';
import { attachGenerationDataToAllure, waitForGenerationComplete } from '../../utils/generation';

test.describe('Image generation', () => {
    test('Upload, generate, and validate generated artifact lifecycle', async ({ page }) => {
        allure.epic('Generation');
        allure.feature('Image generation flow');
        allure.severity('critical');

        const dashboard = new DashboardPage(page);
        const generationPage = new GenerationPage(page);

        const prompt = 'cinematic portrait in neon cyberpunk style';
        const userEmail = process.env.E2E_USER_EMAIL ?? 'runtime-user@not-set.local';
        const temperature = Number(process.env.GENERATION_TEMPERATURE ?? 0.7);
        const seed = Number(process.env.GENERATION_SEED ?? Date.now());

        let creditsBefore = 0;
        let creditsAfter = 0;

        await test.step('Open dashboard and capture credits before generation', async () => {
            await dashboard.gotoAndValidateStatus('/dashboard');
            creditsBefore = await dashboard.getCreditsValue();
        });

        await test.step('Upload fixture and start generation flow', async () => {
            const fixturePath = path.resolve(process.cwd(), 'tests/fixtures/sample-upload.png');
            await generationPage.runGeneration(prompt, fixturePath);
            await expect(generationPage.loader).toBeVisible({ timeout: 30_000 });
        });

        await test.step('Wait for generation completion and validate output image', async () => {
            await waitForGenerationComplete(page, generationPage.loader, generationPage.generatedImage);
            await generationPage.expectResultVisible();
            const isBroken = await generationPage.generatedImage.evaluate((img) => (img as HTMLImageElement).naturalWidth === 0);
            expect(isBroken).toBeFalsy();
        });

        await test.step('Verify credits deduction and successful download action', async () => {
            creditsAfter = await dashboard.getCreditsValue();
            expect(creditsAfter).toBeLessThan(creditsBefore);

            const downloadPromise = page.waitForEvent('download');
            await generationPage.downloadButton.click();
            const download = await downloadPromise;
            expect(download.suggestedFilename()).toBeTruthy();
        });

        attachGenerationDataToAllure({
            prompt,
            temperature,
            seed,
            userEmail,
            creditsBefore,
            creditsAfter
        });
    });
});
