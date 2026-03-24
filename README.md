# Project Name

Playwright Demo Project
Michelle Macdonald

## 🚀 Features

- Migration redirect script

## 📦 Installation

`npm install`

## Environment

Create .env file into root directory
(This test uses http auth on the test "origin" URL)
Ensure you close VS code and reopen your project for the env file to be used.

```
USERNAME=<http auth username>
PASSWORD=<http auth PW>
BASE_URL=https://example.com
```

## Data

Create a folder /test-data/
Add two CSV files "redirects1.csv" and "redirects2.csv"
Add the From and To Urls into each CSV file.

```
IsLive,FromStatus,From,To
FALSE,301 Permanent,https://from/,https://to/
```

## Reporting

- To show port 9323
  `lsof -i :9323`

- Note the PID
  `kill -9 1234`

- To display report
  `npx playwright show-report`

## E2E Tests

### alternativecheck.spec.ts

Tests and lists all alternative text (`alt` attributes) from images and elements with `role="img"`. Skips elements with `aria-hidden="true"`.

### httpAuth.spec.ts

Tests HTTP authentication at the context level. Validates that auth credentials are properly applied and accepts cookies on the authenticated page.

### loraNG.spec.ts

Currently empty.

### redirects301.spec.ts

Tests 301 redirects using Playwright's request API. Checks the `Location` header without loading the final ("To") page. Uses CSV file with "From" and "To" URLs.

### redirects301V2.spec.ts

Similar to `redirects301.spec.ts`. Alternative implementation for testing redirects with CSV data.

### responseProduction.spec.ts

Tests page response status for URLs from CSV. Logs the Next.js `__GENERATION_TIME__` when response status is 500, helping identify server-side issues.

### websitetest.spec.ts

Tests website features:

- Language selector functionality
- Validates store href links and their HTTP response codes
- Checks store details page accessibility

### testSetUp.ts

Helper file containing setup functions like `navigateToShop()` used across multiple tests.

## Execution

- Make sure the CSV files contain the "From" and "To" URLs (for redirect tests)
- Do not run in parallel, assign only 1 worker so it does not detect "bots"

### Commands

`npx playwright test redirects301.spec.ts --workers=1 --project=chromium`

`npx playwright test redirects301V2.spec.ts --workers=1 --project=chromium`

`npx playwright test responseProduction.spec.ts --workers=1 --project=chromium`

`npx playwright test websitetest.spec.ts --workers=1 --project=chromium`

`npx playwright test alternativecheck.spec.ts --workers=1 --project=chromium`
