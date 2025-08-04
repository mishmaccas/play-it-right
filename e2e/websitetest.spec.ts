import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("https://www.website.com.au/", {
    waitUntil: "domcontentloaded",
    timeout: 15000, // optional shorter timeout
  });
  await expect(page).toHaveTitle(/Website/);
});
