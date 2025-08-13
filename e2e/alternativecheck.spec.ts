import { test, expect } from "@playwright/test";

//"load" – waits for the load event (includes images, styles)
// "domcontentloaded" – waits for the DOMContentLoaded event (faster, but may miss late-loading assets)
// "networkidle" – waits for all network activity to settle (DO NOT USE)

test('List all alt text from images and elements with role="img"', async ({ page }) => {
  await page.goto("https://www.website.com.au/", {
    waitUntil: "load",
    timeout: 30000,
  });

  const altTexts = await page.evaluate(() => {
    const results: string[] = [];

    const elements = document.body.querySelectorAll('button, img, [role="img"], [role="button"]');

    elements.forEach((el) => {
      if (el.getAttribute("aria-hidden") === "true") return;

      // Skip if hidden by ancestor aria-hidden
      let parent = el.parentElement;
      while (parent) {
        if (parent.getAttribute("aria-hidden") === "true") return;
        parent = parent.parentElement;
      }

      const tag = el.tagName.toLowerCase();
      const role = el.getAttribute("role");
      const alt = (el as HTMLImageElement).alt || el.getAttribute("aria-label") || "";
      const description = alt.trim() || "[NO ALT TEXT]";
      const text = el.textContent?.trim() || "[NO INNER TEXT]";

      results.push(`<${tag}${role ? ` role="${role}"` : ""}> — ALT: "${description}" — TEXT: "${text}"`);
    });

    return results;
  });

  console.log("📝 Alt and inner text found on page:\n");
  altTexts.forEach((text) => console.log(text));

  // Optional: Expect at least one alt text to be found
  expect(altTexts.length).toBeGreaterThan(0);
});
