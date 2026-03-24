// testSetup.ts
import { Page, BrowserContext } from "@playwright/test";

export async function navigateToShop(page: Page, countryCode: string, language?: string, pageRoute?: string) {
  const localePath = language ? `${countryCode}/${language}` : countryCode;
  const fullPath = pageRoute ? `${localePath}/${pageRoute}` : localePath;

  const headers = await page.evaluate(() => navigator.userAgent);
  if (!headers.includes("Headless Chrome")) {
    await page.setExtraHTTPHeaders({
      "User-Agent": `${headers} HeadlessChrome`,
    });
  }

  await page.goto(`https://username:password@shop-uat.aesop.com/${fullPath}`, {
    waitUntil: "domcontentloaded",
    timeout: 15000,
  });
}
