import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class GenerationPage extends BasePage {
    readonly uploadInput: Locator;
    readonly promptInput: Locator;
    readonly generateButton: Locator;
    readonly loader: Locator;
    readonly generatedImage: Locator;
    readonly downloadButton: Locator;

    constructor(page: Page) {
        super(page);
        this.uploadInput = page.locator('input[type="file"]').first();
        this.promptInput = page.locator('textarea, input[name*="prompt" i]').first();
        this.generateButton = page.locator('button:has-text("Generate"), button:has-text("Create")').first();
        this.loader = page.locator('[data-testid="generation-loader"], .spinner, text=/generating/i').first();
        this.generatedImage = page.locator('[data-testid="generated-image"] img, img[alt*="generated" i]').first();
        this.downloadButton = page.locator('a[download], button:has-text("Download")').first();
    }

    async runGeneration(prompt: string, imagePath: string): Promise<void> {
        await this.uploadInput.setInputFiles(imagePath);
        await this.promptInput.fill(prompt);
        await this.generateButton.click();
    }

    async expectResultVisible(): Promise<void> {
        await expect(this.generatedImage).toBeVisible({ timeout: 120_000 });
    }
}
