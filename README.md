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

Go to folder /test-data/
Update test.csv file with your From and To Urls  
Example

```
From,To,Null
https://from.this.website/page/,https://going.to.this.website/page/,
```

## Reporting

- To show port 9323
  `lsof -i :9323`

- Note the PID
  `kill -9 1234`

- To display report
  `npx playwright show-report`

## E2E Tests

### redirects301.spec.ts

Uses CSV file with "From" and "To" URLs.
Navigate to the source URL and let the browser follow redirects.
Compare final landed URL against expected destination from CSV.

### redirects301V2.spec.ts

Similar to `redirects301.spec.ts`. Alternative implementation for testing redirects with CSV data.

## Execution

- Make sure the CSV files contain the "From" and "To" URLs (for redirect tests)
- Do not run in parallel, assign only 1 worker so it does not detect "bots"

### Commands

`npx playwright test redirects301.spec.ts --workers=1 --project=chromium`

`npx playwright test redirects301V2.spec.ts --workers=1 --project=chromium`

## Updating Dependencies

`npx npm-check-updates -u`
This will update dependencies for example:

@playwright/test ^1.58.0 → ^1.59.1
@types/node ^22.15.19 → ^25.6.0
csv-parse ^5.6.0 → ^6.2.1
dotenv ^16.5.0 → ^17.4.2

Then run the following commands to install new versions.
A common issue after updating Playwright versions is that the browsers aren't automatically downloaded with the npm package.
`npm install`
`npx playwright install`
