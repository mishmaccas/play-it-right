import { test, expect, request } from "@playwright/test";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

const csvFiles = ["test.csv"];
const maxHops = 10;

type RedirectHop = {
  hop: number;
  from: string;
  status: number;
  to: string;
};

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

async function collectRedirectHops(startUrl: string) {
  const context = await request.newContext();
  const hops: RedirectHop[] = [];
  let currentUrl = startUrl;
  let finalStatus: number | null = null;

  try {
    for (let i = 1; i <= maxHops; i += 1) {
      const response = await context.get(currentUrl, { maxRedirects: 0 });
      const status = response.status();
      const location = response.headers()["location"];

      if (status >= 300 && status < 400 && location) {
        const resolvedTo = new URL(location, currentUrl).toString();
        hops.push({
          hop: i,
          from: normalizeUrl(currentUrl),
          status,
          to: normalizeUrl(resolvedTo),
        });
        currentUrl = resolvedTo;
      } else {
        finalStatus = status;
        break;
      }
    }
  } finally {
    await context.dispose();
  }

  return {
    hops,
    finalUrl: normalizeUrl(currentUrl),
    finalStatus,
  };
}

csvFiles.forEach((fileName) => {
  const csvFilePath = path.resolve("./test-data/", fileName);
  const fileContent = fs.readFileSync(csvFilePath, "utf8");
  const records: { From: string; To: string }[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  records.forEach(({ From, To }, index) => {
    test(`${fileName} - ${index + 1}: redirect from ${From} to ${To} `, async () => {
      const expectedFinalUrl = normalizeUrl(To, From);
      const { hops, finalUrl, finalStatus } = await collectRedirectHops(From);

      console.table(hops);
      console.log("Final URL:", finalUrl);
      console.log("Final Status:", finalStatus ?? "unknown");
      console.log("Expected Final URL:", expectedFinalUrl);

      expect(hops.length).toBeGreaterThan(0);
      expect(finalUrl).toBe(expectedFinalUrl);

      if (finalStatus !== null && finalStatus !== 200) {
        console.warn(`Final response status is ${finalStatus}, expected 200.`);
      }
    });
  });
});
