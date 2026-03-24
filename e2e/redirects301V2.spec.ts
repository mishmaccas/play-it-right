import { test, expect, request } from "@playwright/test";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

const csvFiles = ["KR.csv"];

// Because the target site doesn’t exist yet - Using page.goto()  fails, For testing redirect rules, I switched to using Playwright’s request API.

// This check redirects without loading the final page.

// Playwright just checks the Location header of the redirect, and won’t fetch the non-existent “To” URL.

csvFiles.forEach((fileName) => {
  const csvFilePath = path.resolve("./test-data/", fileName);
  const fileContent = fs.readFileSync(csvFilePath, "utf8"); //; Redirect: string
  const records: { From: string; To: string }[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  records.forEach(({ From, To }, index) => {
    test(`${fileName} - ${index + 1}: redirect from ${From} to ${To} `, async ({ browser }) => {
      const context = await request.newContext();
      const response = await context.get(From, { maxRedirects: 0 });

      expect(response.status()).toBe(301); // or 302, depending on your setup
      expect(response.headers()["location"]).toBe(To);
    });
  });
});
