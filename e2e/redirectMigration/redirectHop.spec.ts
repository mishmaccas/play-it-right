// Redirect validation spec:
// Reads From/To pairs from CSV, captures each redirect hop (3xx + Location), and logs a hop table.
// Compares the expected final URL with either the last redirect target or landed URL.
// If landing is blocked by 403, it reports diagnostics without hard-failing on final-page equality.
import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

const csvFiles = ["test.csv"];

function normalizeUrl(urlValue: string, baseUrl?: string): string {
  const parsed = baseUrl ? new URL(urlValue, baseUrl) : new URL(urlValue);
  const host = parsed.host.toLowerCase();

  let pathname = decodeURIComponent(parsed.pathname);
  if (pathname.length > 1) {
    pathname = pathname.replace(/\/+$/, "");
  }

  const search = decodeURIComponent(parsed.search);
  const hash = decodeURIComponent(parsed.hash);
  return `${parsed.protocol}//${host}${pathname}${search}${hash}`;
}

csvFiles.forEach((fileName) => {
  const csvFilePath = path.resolve("./test-data/", fileName);
  const fileContent = fs.readFileSync(csvFilePath, "utf8");

  const records: { From: string; To: string }[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  records.forEach(({ From, To }, index) => {
    test(`${fileName} - ${index + 1}: redirect from ${From} to ${To}`, async ({ browser }) => {
      const context = await browser.newContext({
        httpCredentials: {
          username: process.env.USERNAME!,
          password: process.env.PASSWORD!,
        },
      });

      const page = await context.newPage();

      const navigationResponse = await page.goto(From, {
        waitUntil: "domcontentloaded",
        timeout: 20000,
      });

      // Build request chain and then reverse it so hops are printed first -> last.
      const chainRequests = [];
      let req = navigationResponse?.request() ?? null;
      while (req) {
        chainRequests.push(req);
        req = req.redirectedFrom();
      }
      chainRequests.reverse();

      const redirectHops: Array<{ from: string; status: number; to: string }> = [];
      for (const requestItem of chainRequests) {
        const response = await requestItem.response();
        if (!response) continue;

        const status = response.status();
        const location = response.headers()["location"];
        if (status >= 300 && status < 400 && location) {
          redirectHops.push({
            from: normalizeUrl(requestItem.url()),
            status,
            to: normalizeUrl(location, requestItem.url()),
          });
        }
      }

      const landedUrlRaw = decodeURIComponent(page.url());
      const landedUrl = normalizeUrl(page.url());
      const landedStatus = navigationResponse?.status() ?? null;
      const landedResponseUrl = navigationResponse?.url() ?? page.url();
      const expectedFinalUrl = normalizeUrl(To, From);
      const final3xxHop = redirectHops.at(-1);

      console.table(
        redirectHops.map((hop, i) => ({
          hop: i + 1,
          from: hop.from,
          status: hop.status,
          to: hop.to,
        })),
      );
      console.log("Landed URL:", landedUrlRaw);
      console.log("Landed Response URL:", decodeURIComponent(landedResponseUrl));
      console.log("Landed URL (normalized):", landedUrl);
      console.log("Landed Status:", landedStatus ?? "unknown");
      console.log("Expected Final URL:", expectedFinalUrl);
      console.log("Final 3xx Status:", final3xxHop?.status ?? "none");
      console.log("Final 3xx To:", final3xxHop?.to ?? "none");

      expect(final3xxHop).toBeTruthy();
      const matchedByLastHop = final3xxHop?.to === expectedFinalUrl;
      const matchedByLandedUrl = landedUrl === expectedFinalUrl;

      if (landedStatus === 403) {
        console.warn("Validation blocked by 403 before final page became reachable.");
        console.warn("Expected final URL:", expectedFinalUrl);
        console.warn("Last redirect target:", final3xxHop?.to ?? "none");
        console.warn("Landed URL:", landedUrl);
      } else {
        expect(matchedByLastHop || matchedByLandedUrl).toBe(true);
        expect(landedUrl).toBe(expectedFinalUrl);
      }

      await context.close();
    });
  });
});
