import { test, expect } from "@playwright/test";

test("live browser submission creates one labelled GitHub test issue", async ({
  page,
}) => {
  test.skip(
    process.env.FEEDBACK_LIVE_TEST !== "1",
    "Explicit opt-in: creates a public, clearly marked test issue.",
  );
  test.setTimeout(60000);
  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();
  await page
    .getByRole("button", { name: "Bug / Feature melden", exact: true })
    .click();
  await page.getByRole("button", { name: "Bug", exact: true }).click();
  await page
    .getByLabel("Titel", { exact: true })
    .fill("[TEST] Browser feedback acceptance");
  await page
    .getByLabel("Beschreibung", { exact: true })
    .fill(
      "Technical browser acceptance test only. No real bug. Verifies the complete HTML form to InsForge to GitHub path. Close after verification.",
    );
  await page.getByLabel("Ich habe den Hinweis").check();
  await page.getByRole("button", { name: "Bug senden", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Danke!" })).toBeVisible({
    timeout: 30000,
  });
  const link = page.getByRole("link", { name: "Issue auf GitHub öffnen" });
  console.log("Live test issue: " + (await link.getAttribute("href")));
  await expect(link).toHaveAttribute(
    "href",
    /^https:\/\/github\.com\/fip22-dev\/Escape-PI-Planning\/issues\/\d+$/,
  );
});
