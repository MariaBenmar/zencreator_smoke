# ZenCreator QA Automation Framework (Playwright + TypeScript)

## Project overview
This repository contains a production-ready, CI/CD-focused Playwright framework for end-to-end validation of **https://zencreator.pro**. It is designed with:
- TypeScript strict typing
- Page Object Model (POM)
- Allure reporting + HTML fallback
- Failure artifacts (trace/video/screenshots)
- GitHub Actions automation
- Utilities for reusable QA workflows

## Project structure
```text
/tests
  /smoke
  /auth
  /validation
  /generation
  /fixtures
/pages
/utils
/.github/workflows
playwright.config.ts
package.json
README.md
.env.example
```

## Setup instructions
1. Clone repository.
2. Copy `.env.example` to `.env` and edit values.
3. Install dependencies.
4. Install browser binaries.

## Install dependencies
```bash
npm ci
npx playwright install --with-deps chromium
```

## Run locally
```bash
npm test
```

## Run smoke only
```bash
npm run test:smoke
```

## Run in headed mode
```bash
npm run test:headed
```

## Generate Allure report
```bash
npm run report:allure:generate
```

## Open Allure report
```bash
npm run report:allure:open
```

## View HTML report fallback
```bash
npm run report:html
```

## CI/CD integration steps
The workflow file `.github/workflows/playwright.yml` performs:
1. Node.js setup
2. Dependency install + npm cache
3. Playwright browser install
4. Test execution
5. Allure report generation
6. Artifact upload (`allure-results`, `allure-report`, `playwright-report`, `test-results`) for 7 days

## Environment variables
| Variable | Description |
|---|---|
| `BASE_URL` | Target test URL used by Playwright `baseURL`. |
| `DEFAULT_STRONG_PASSWORD` | Registration fallback password. |
| `E2E_USER_EMAIL` | Metadata value attached in generation report JSON. |
| `GENERATION_TEMPERATURE` | Prompt temperature attached to Allure JSON. |
| `GENERATION_SEED` | Seed attached to Allure JSON. |

## Debug with trace viewer
When a test fails, traces are collected automatically (`trace: retain-on-failure`).

Open trace locally with:
```bash
npx playwright show-trace test-results/<test-folder>/trace.zip
```

## How to update baseURL
Set `BASE_URL` in `.env`:
```env
BASE_URL=https://zencreator.pro
```
or inject in CI variables/secrets.

## How to scale this project
- Add more POM classes for new product modules.
- Split suites by tags (`@smoke`, `@regression`) and run matrix workflows.
- Add API contracts and component-level checks.
- Add custom fixtures for authentication/session reuse.
- Add visual regression checks for generated images.
