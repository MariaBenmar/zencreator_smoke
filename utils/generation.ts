import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { allure } from 'allure-playwright';

export type GenerationData = {
    prompt: string;
    temperature: number;
    seed: number;
    userEmail: string;
    creditsBefore: number;
    creditsAfter: number;
};

/**
 * Centralized waiting logic for generation completion to keep tests expressive and avoid duplicated retry loops.
 */
export async function waitForGenerationComplete(page: Page, loader: Locator, generatedImage: Locator): Promise<void> {
    // We allow the loader to be optional because some builds may render instantly with websocket updates.
    if (await loader.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await expect(loader).toBeVisible();
        await expect(loader).toBeHidden({ timeout: 120_000 });
    }

    await expect(generatedImage).toBeVisible({ timeout: 120_000 });

    // Sanity-check image render by ensuring source points to a real URL/path.
    const imageSrc = await generatedImage.getAttribute('src');
    expect(imageSrc).toBeTruthy();
    expect(imageSrc).not.toContain('undefined');

    // Also verify final network settled.
    await page.waitForLoadState('networkidle');
}

/**
 * Attaches generation metadata as JSON artifact for traceability in Allure reports.
 */
export function attachGenerationDataToAllure(data: GenerationData): void {
    allure.attachment('Generation Parameters', JSON.stringify(data, null, 2), 'application/json');
}
