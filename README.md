# Project Name

Playwright Demo Project
Michelle Macdonald

## 🚀 Features

- Migration redirect script

## 📦 Installation

```npm install``` 

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
```lsof -i :9323```

- Note the PID
```kill -9 1234```

- To display report
```npx playwright show-report```

## Execution

- Make sure the 2 csv files contain the "From" and "To" URLs
- This can use 2 datasets. 
- Then execute the test for redirects in Chromium
- Do not run in parallel, assign only 1 worker so it does not detect "bots"

### Command
```npx playwright test redirects301.spec.ts --workers=1 --project=chromium```