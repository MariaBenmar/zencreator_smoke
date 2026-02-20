/**
 * Returns a unique and deterministic email value suitable for re-runnable E2E registration.
 */
export function generateRandomEmail(prefix = 'qa.zencreator'): string {
    return `${prefix}.${Date.now()}@examplemail.dev`;
}
