import { test, expect } from "@playwright/test";
import { navigateToShop } from "./testSetUp";

test.skip("mind your language", async ({ page }) => {
  await navigateToShop(page, "fr", "", "");
  await expect(page).toHaveTitle(/Aesop/);
  expect(page.url()).toContain("shop-uat.aesop.com/fr/fr/");

  await expect(
    page.locator('[data-test-ref="FOOTER_SHIPPING_TO_LANGUAGE_SELECTOR"]').filter({ hasText: "Français" }),
  ).toHaveText("Français");
});

test("test hrefs", async ({ page, request }) => {
  test.setTimeout(120000);
  await page.goto("https://www.aesop.com/stores/gb/london");

  const links = page.locator('a[aria-label*="See details for store"]');
  const count = await links.count();

  for (let i = 0; i < count; i++) {
    const url = await links.nth(i).getAttribute("href");
    const label = await links.nth(i).getAttribute("aria-label");
    if (!url) continue;

    const response = await request.get(url);
    console.log(`${url} -> ${response.status()} -> ${label}`);
  }
});

test.skip("maintenance page", async ({ page }) => {
  await page.goto("https://shop-uat.aesop.com/fr/es/");
  await expect(page).toHaveTitle(/Aesop/);
  expect(page.url()).toContain("shop-uat.aesop.com/fr/es/");
  await expect(page.locator("h1")).toContainText("Une courte pause");
});

// const scriptContent = await page.locator('script[type="application/ld+json"]').first().textContent();
//   const jsonData = JSON.parse(scriptContent);
//   expect(jsonData['@context']).toBe('https://schema.org');
//   expect(jsonData['@type']).toBe('WebSite');
//   expect(jsonData.inLanguage).toBe('fr');
//   expect(jsonData.url).toContain('https://www.aesop.ca/fr');

// test("has title", async ({ page }) => {
//   await navigateToShop(page, "fr", "en", "p/home/room-sprays/cythera-aromatique-room-spray/");
//   await expect(page).toHaveTitle(/Cythera/);
// });

// test("another test", async ({ page }) => {
//   await navigateToShop(page, "fr", "en", "c/skin/toners");

//   // setup runs automatically before this too
//   await expect(page).toHaveTitle(/Toners/);
// });
