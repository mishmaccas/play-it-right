import { test, expect, request } from "@playwright/test";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

const csvFiles = ["test.csv"];

// Because the target site doesn’t exist yet - Using page.goto()  fails, For testing redirect rules, I switched to using Playwright’s request API.

// This check redirects without loading the final page.

// Playwright just checks the Location header of the redirect, and won’t fetch the non-existent “To” URL.

csvFiles.forEach((fileName) => {
  const csvFilePath = path.resolve("./test-data/", fileName);
  const fileContent = fs.readFileSync(csvFilePath, "utf8"); //; Redirect: string
  const records: { From: string; To: string; Redirect: string }[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  records.forEach(({ From, To, Redirect }, index) => {
    test(`${fileName} - ${index + 1}: redirect from ${From} to ${To} `, async ({ browser }) => {
      const context = await request.newContext();
      const response = await context.get(From, { maxRedirects: 0 });

      // It only checks the immediate redirect response from From.
      // It does not follow redirects to confirm the final landed URL.
      // It does not currently assert status code.
      console.log(response.headers());
      // expect(response.status()).toBe(Redirect);
      expect(response.headers()["location"]).toBe(To);
    });
  });
});
