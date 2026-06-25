import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

// CSV files containing redirect test cases with columns: From, To.
const csvFiles = ["test.csv"];

// Normalizes URLs so small formatting differences do not cause false failures.
// This keeps comparisons stable across encoded/unencoded characters
// and trailing slashes.
function normalizeUrl(urlValue: string, baseUrl?: string): string {
  const parsed = baseUrl ? new URL(urlValue, baseUrl) : new URL(urlValue);
  const host = parsed.host.toLowerCase();

  // Ignore trailing slash differences except for root (/).
  let pathname = decodeURIComponent(parsed.pathname);
  if (pathname.length > 1) {
    pathname = pathname.replace(/\/+$/, "");
  }

  const search = decodeURIComponent(parsed.search);
  const hash = decodeURIComponent(parsed.hash);
  return `${parsed.protocol}//${host}${pathname}${search}${hash}`;
}

csvFiles.forEach((fileName) => {
  // Load and parse one CSV file into redirect test rows.
  const csvFilePath = path.resolve("./test-data/", fileName);
  const fileContent = fs.readFileSync(csvFilePath, "utf8");

  const records: { From: string; To: string }[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  records.forEach(({ From, To }, index) => {
    // Create one Playwright test per CSV row.
    test(`${fileName} - ${index + 1}: redirect from ${From} to ${To} `, async ({ browser }) => {
      // Open an authenticated browser context for protected environments.
      const context = await browser.newContext({
        httpCredentials: {
          username: process.env.USERNAME!,
          password: process.env.PASSWORD!,
        },
      });

      const page = await context.newPage();

      // Navigate to the source URL and let the browser follow redirects.
      await page.goto(From, {
        waitUntil: "domcontentloaded",
        timeout: 20000,
      });

      // Compare final landed URL against expected destination from CSV.
      const actualFinalUrl = page.url();
      const expectedFinalUrl = To;
      const normalizedActualFinalUrl = normalizeUrl(actualFinalUrl);
      const normalizedExpectedFinalUrl = normalizeUrl(expectedFinalUrl, From);

      // Debug logs help when environment differences cause unexpected URL shapes.
      console.log("Actual final URL:", decodeURIComponent(actualFinalUrl));
      console.log("Expected final URL:", decodeURIComponent(new URL(To, From).toString()));
      console.log("Normalized actual:", normalizedActualFinalUrl);
      console.log("Normalized expected:", normalizedExpectedFinalUrl);

      // Expected redirect URL and Status code = 301
      // for asian characters
      //https://www.site.co.jp/stores/jp/北海道/札幌市/8793.html
      //   → human-readable form (unencoded).
      // https://www.site.co.jp/stores/jp/%E5%8C%97%E6%B5%B7%E9%81%93/%E6%9C%AD%E5%B9%8C%E5%B8%82/8793.html
      //  → percent-encoded form, what browsers and most automation tools actually use internally.

      // normalizedActualFinalUrl is where the browser actually ended up after redirects.
      // normalizedExpectedFinalUrl is the expected destination from your CSV (To), normalized the same way.
      // toBe(...) checks strict equality (===) between those two strings.
      expect(normalizedActualFinalUrl).toBe(normalizedExpectedFinalUrl);

      // Always close context to avoid leaking browser resources between tests.
      await context.close();
    });
  });
});
