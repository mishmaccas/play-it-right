# Project Name

Playwright Demo Project
Michelle Macdonald

## 🚀 Features

- Migration redirect script

## 📦 Installation

```npm install``` 

## Environment
Create .env file into root directory
```
USERNAME=<http auth username>
PASSWORD=<http auth PW>
BASE_URL=https://example.com
```

## Data
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

- Make sure the csv files contain the "From" and "To" URLs 
- Then execute the test for redirects in Chromium
- Do not run in parallel, assign only 1 worker

### Command
```npx playwright test redirects301.spec.ts --workers=1 --project=chromium```