import { test, expect } from "@playwright/test";
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
  const records: { Url: string }[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  records.forEach(({ Url }, index) => {
    test(`${fileName} - ${index + 1}: Page ${Url} `, async ({ browser }) => {
      const context = await browser.newContext({
        httpCredentials: {
          username: "username",
          password: "password",
        },
      });
      const page = await context.newPage();
      let response = await page.goto(Url);
      const generationTime = await page.evaluate(
        () => new Date(window.__NEXT_DATA__.props.pageProps.__GENERATION_TIME__),
      );
      if (response?.status() === 500) console.log(Url + generationTime);
      expect(response?.status()).toBe(200);
      // await page.click("#onetrust-accept-btn-handler");

      response = await page.goto(Url);
      const generationTime2 = await page.evaluate(
        () => new Date(window.__NEXT_DATA__.props.pageProps.__GENERATION_TIME__),
      );
      if (response?.status() === 500) console.log(Url + generationTime2);
      expect(response?.status()).toBe(200);
      // await page.click("#onetrust-accept-btn-handler");
    });
  });
});
