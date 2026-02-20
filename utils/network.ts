import type { Page } from '@playwright/test';

/**
 * Retrieves caller public IP from ipify service. Returns null when retrieval fails to avoid blocking core test flow.
 */
export async function getPublicIP(page: Page): Promise<string | null> {
    try {
        const response = await page.request.get('https://api.ipify.org?format=json');
        if (!response.ok()) return null;
        const payload = (await response.json()) as { ip?: string };
        return payload.ip ?? null;
    } catch {
        return null;
    }
}
