import { test, expect, BrowserContext } from "@playwright/test";

test.describe("HTTP Authentication Tests", () => {
  test("should set HTTP auth at context level", async ({ browser }) => {
    const context = await browser.newContext({
      httpCredentials: {
        username: "username",
        password: "password",
      },
    });

    const page = await context.newPage();

    await page.goto("https://stg-global-aesop.dw-sites-intl.com/", {
      waitUntil: "domcontentloaded",
    });

    await expect(page).toHaveURL(/stg-global-aesop\.dw-sites-intl\.com/);

    await expect(page.locator("button#onetrust-accept-btn-handler")).toHaveText("Accept All Cookies");

    await page.locator("button#onetrust-accept-btn-handler").click();

    await expect(page.locator("button.c-modal__close")).toBeVisible();

    await page.locator("button.c-modal__close").click();

    await context.close();
  });
});
