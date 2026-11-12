import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/src/main.js", async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      body: (await response.text()) + "\nwindow.__game = game;",
    });
  });
});
const open = async (page) => {
  await page
    .getByRole("button", { name: "Bug melden / Feature wünschen", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
};
test("feedback preserves drafts, text editing and game pause while success requires confirmation", async ({
  page,
}, info) => {
  let requests = [];
  await page.route("**/game-feedback", async (route) => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        issueNumber: 999,
        issueUrl: "https://github.com/fip22-dev/Escape-PI-Planning/issues/999",
      }),
    });
  });
  await page.goto("/");
  await page.waitForFunction(() => window.__game?.scene.isActive("intro"));
  await open(page);
  await page.getByRole("button", { name: "Bug", exact: true }).click();
  await page.getByLabel("Titel", { exact: true }).fill("WASD M T F Enter Test");
  await page
    .getByLabel("Beschreibung", { exact: true })
    .fill("Ein reproduzierbarer Test der Texteingabe.");
  await page.getByLabel("Titel", { exact: true }).press("Enter");
  expect(requests).toHaveLength(0);
  await page.getByRole("button", { name: "Zurück", exact: true }).click();
  await page.getByRole("button", { name: "Feature", exact: true }).click();
  await expect(page.getByLabel("Titel", { exact: true })).toHaveValue("");
  await page.getByRole("button", { name: "Zurück", exact: true }).click();
  await page.getByRole("button", { name: "Bug", exact: true }).click();
  await expect(page.getByLabel("Titel", { exact: true })).toHaveValue(
    "WASD M T F Enter Test",
  );
  await page.getByText("Technische Angaben", { exact: true }).click();
  await page.getByLabel("Technische Angaben mitsenden").uncheck();
  await page.getByLabel("Ich habe den Hinweis").check();
  await page.screenshot({ path: info.outputPath("feedback-form.png") });
  await page.getByRole("button", { name: "Bug senden", exact: true }).click();
  await expect(
    page.getByText("Deine Meldung wurde als Issue #999 gespeichert."),
  ).toBeVisible();
  expect(requests).toHaveLength(1);
  expect(requests[0].technical).toBeUndefined();
  await page.getByRole("button", { name: "Zurück", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.evaluate(() =>
    window.__game.scene
      .getScene("intro")
      .scene.start("graybox", { showStartGuide: false }),
  );
  await page.waitForFunction(() => window.__game.scene.isActive("graybox"));
  await open(page);
  const before = await page.evaluate(() => {
    const s = window.__game.scene.getScene("graybox");
    return {
      tile: s.playerTile,
      keys: [...s.collectedTeamKeys],
      timer: s.escapeStartedAt,
    };
  });
  await page.getByRole("button", { name: "Feature", exact: true }).click();
  await page.getByLabel("Titel", { exact: true }).fill("WASD F M T Test");
  await page.keyboard.press("Space");
  await page.keyboard.press("m");
  await page.keyboard.press("t");
  expect(
    await page.evaluate(() => window.__game.scene.getScene("graybox").isPaused),
  ).toBe(true);
  await page.getByRole("button", { name: "Abbrechen", exact: true }).click();
  await expect(
    page.getByText("Entwurf verwerfen?", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Weiter bearbeiten" }).click();
  await expect(page.getByLabel("Titel", { exact: true })).toHaveValue(
    /WASD F M T Test/,
  );
  await page.getByRole("button", { name: "Abbrechen", exact: true }).click();
  await page.getByRole("button", { name: "Verwerfen", exact: true }).click();
  const after = await page.evaluate(() => {
    const s = window.__game.scene.getScene("graybox");
    return {
      tile: s.playerTile,
      keys: [...s.collectedTeamKeys],
      timer: s.escapeStartedAt,
    };
  });
  expect(after).toEqual(before);
  expect(
    await page.evaluate(() => window.__game.scene.getScene("graybox").isPaused),
  ).toBe(true);
  await page.evaluate(() => {
    const s = window.__game.scene.getScene("graybox");
    s.pauseStartedAt = s.time.now - 5000;
    s.escapeStartedAt = s.pauseStartedAt - 10000;
  });
  await open(page);
  await page.getByRole("button", { name: "Bug", exact: true }).click();
  await page.getByText("Technische Angaben", { exact: true }).click();
  await expect(page.locator(".technical-preview")).toContainText(
    '"remainingSeconds": 170',
  );
});

test("feedback retries an uncertain result with same immutable submission and stays upright in expanded view", async ({
  page,
}, info) => {
  let requests = [];
  await page.route("**/game-feedback", async (route) => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({
      status: 202,
      contentType: "application/json",
      headers: { "Retry-After": "30" },
      body: JSON.stringify({ error: "Anlage wird abgeglichen." }),
    });
  });
  await page.goto("/");
  await page.waitForFunction(() => window.__game?.scene.isActive("intro"));
  await page.evaluate(() => {
    document.fullscreenEnabled = false;
  });
  await page.locator(".fullscreen-button").click();
  await open(page);
  await page.getByRole("button", { name: "Feature", exact: true }).click();
  await page
    .getByLabel("Titel", { exact: true })
    .fill("Ein neuer Feature-Wunsch");
  await page
    .getByLabel("Beschreibung", { exact: true })
    .fill("Eine klare Beschreibung für den Test.");
  await page.getByLabel("Ich habe den Hinweis").check();
  await page
    .getByRole("button", { name: "Feature senden", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Erneut versuchen" }),
  ).toBeVisible();
  await expect(page.getByLabel("Titel", { exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Erneut versuchen" }).click();
  await expect.poll(() => requests.length).toBe(2);
  expect(requests[0]).toEqual(requests[1]);
  const box = await page.getByRole("dialog").boundingBox();
  expect(box.width).toBeLessThanOrEqual(640);
  expect(box.x).toBeGreaterThanOrEqual(0);
  await page.screenshot({ path: info.outputPath("feedback-expanded.png") });
});
