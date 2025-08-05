import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

//
// List your CSV files here
//
const csvFiles = ["test.csv"];

csvFiles.forEach((fileName) => {
  const csvFilePath = path.resolve("./test-data/", fileName);
  const fileContent = fs.readFileSync(csvFilePath, "utf8");
  const records: { From: string; To: string; Redirect: string }[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  // In process.env.USERNAME!,  "!"" tells the TypeScript compiler:
  // “I know process.env.USERNAME is not undefined or null, so don’t complain about it.”

  records.forEach(({ From, To, Redirect }, index) => {
    test(`${fileName} - ${index + 1}: redirect from ${From} to ${To} with ${Redirect}`, async ({ browser }) => {
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

      await page.goto(From, {
        waitUntil: "domcontentloaded",
        timeout: 15000, // optional shorter timeout
      });
      const finalUrl = page.url();

      // Expected redirect URL and Status code = 301
      // for asian characters
      //https://www.site.co.jp/stores/jp/北海道/札幌市/8793.html
      //   → human-readable form (unencoded).
      // https://www.site.co.jp/stores/jp/%E5%8C%97%E6%B5%B7%E9%81%93/%E6%9C%AD%E5%B9%8C%E5%B8%82/8793.html
      //  → percent-encoded form, what browsers and most automation tools actually use internally.
      expect(decodeURIComponent(finalUrl)).toBe(To);
      expect(String(statusCode)).toBe(String(Redirect));
    });
  });
});
