import { test } from '@playwright/test';
import { allure } from 'allure-playwright';
import { AuthPage } from '../../pages/AuthPage';

test.describe('Email validation', () => {
    const invalidEmails = ['plainaddress', '', 'qa@invalid_domain', 'qa<>@mail.com'];

    for (const email of invalidEmails) {
        test(`Reject invalid email input: "${email || 'empty'}"`, async ({ page }) => {
            allure.epic('Authentication');
            allure.feature('Email validation');
            allure.severity('critical');

            const authPage = new AuthPage(page);

            await test.step('Open registration page', async () => {
                await authPage.openRegistration();
            });

            await test.step('Submit form with invalid email and expect validation feedback', async () => {
                await authPage.register(email, 'Qa!123456789');
                await authPage.expectValidationMessage();
            });
        });
    }
});

test.describe('Password validation', () => {
    test('Password policy and fallback strategy during registration', async ({ page }) => {
        allure.epic('Authentication');
        allure.feature('Password validation');
        allure.severity('critical');

        const authPage = new AuthPage(page);

        await test.step('Try registration with first candidate password QA123456', async () => {
            await authPage.openRegistration();
            await authPage.register(`pwtest.${Date.now()}@examplemail.dev`, 'QA123456');
        });

        await test.step('If first password is rejected, retry with stronger password', async () => {
            const hasError = await authPage.validationMessage.isVisible({ timeout: 5_000 }).catch(() => false);
            if (hasError) {
                await authPage.register(`pwtest.strong.${Date.now()}@examplemail.dev`, 'Qa!123456789');
            }
        });
    });

    test('Reject too short and empty password and show policy message', async ({ page }) => {
        allure.epic('Authentication');
        allure.feature('Password validation');
        allure.severity('normal');

        const authPage = new AuthPage(page);

        await test.step('Reject too short password', async () => {
            await authPage.openRegistration();
            await authPage.register(`short.${Date.now()}@examplemail.dev`, 'Qa!1');
            await authPage.expectValidationMessage();
        });

        await test.step('Reject empty password and keep policy visible', async () => {
            await authPage.passwordInput.fill('');
            await authPage.submitButton.click();
            await authPage.expectValidationMessage();
        });
    });
});
