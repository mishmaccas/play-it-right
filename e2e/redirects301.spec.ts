import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

//
// List your CSV files here
//
// const csvFiles = ["redirects1.csv", "redirects2.csv"]; //For TESTING
const csvFiles = ["MigrationRedirectsAU.csv", "MigrationRedirectsNZ.csv"]; // Linsey's Spreadsheet Data

csvFiles.forEach((fileName) => {
  const csvFilePath = path.resolve("./test-data/", fileName);
  const fileContent = fs.readFileSync(csvFilePath);
  const records: { From: string; To: string }[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  // In process.env.USERNAME!,  "!"" tells the TypeScript compiler:
  // “I know process.env.USERNAME is not undefined or null, so don’t complain about it.”

  records.forEach(({ From, To }, index) => {
    test(`${fileName} - ${
      index + 1
    }: redirect from ${From} to ${To} with 301`, async ({ browser }) => {
      const context = await browser.newContext({
        httpCredentials: {
          username: process.env.USERNAME!,
          password: process.env.PASSWORD!,
        },
      });

      const page = await context.newPage();
      let statusCode: number | null = null;

      page.on("response", (response) => {
        if (response.url() === From) {
          statusCode = response.status();
        }
      });

      await page.goto(From);
      const finalUrl = page.url();

      // Expected redirect URL and Status code = 301
      expect(finalUrl).toBe(To);
      expect(statusCode).toBe(301);
    });
  });
});
