import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.__leaderboardErrors = errors;
  await page.route("**/src/main.js", async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      body: (await response.text()) + "\nwindow.__game=game;",
    });
  });
});
test.afterEach(async ({ page }) =>
  expect(page.__leaderboardErrors).toEqual([]),
);
const boot = async (page) => {
  await page.goto("/");
  await page.waitForFunction(() => window.__game?.scene.isActive("intro"));
};
const menuBoard = async (page) => {
  await page.evaluate(() => {
    const s = window.__game.scene.getScene("intro");
    s.selection = s.homeItems.indexOf("BESTENLISTE");
    s.updateHomeSelection();
  });
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("dialog", { name: "Bestenliste", exact: true }),
  ).toBeVisible();
};
const win = async (page) => {
  await page.evaluate(() =>
    window.__game.scene
      .getScene("intro")
      .scene.start("graybox", { showStartGuide: false }),
  );
  await page.waitForFunction(() => window.__game.scene.isActive("graybox"));
  await page.evaluate(() => {
    const s = window.__game.scene.getScene("graybox");
    s.updateSearcherDetection = () => false;
    s.escapeStartedAt = s.time.now - 65432;
    s.collectedTeamKeys = new Set(s.teamKeys.map((k) => k.team));
    s.onPlayerTileChanged(s.time.now, 34, 2);
  });
  await expect(
    page.getByRole("heading", { name: "Geschafft!", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => window.__game.scene.getScene("graybox").resultPanel.visible,
    ),
  ).toBe(false);
};

test("main menu shows fastest runs, supports keyboard selection and survives load errors", async ({
  page,
}, info) => {
  let fail = true;
  await page.route("**/game-leaderboard", async (route) =>
    route.fulfill({
      status: fail ? 503 : 200,
      contentType: "application/json",
      body: JSON.stringify(
        fail
          ? { error: "offline" }
          : {
              entries: [
                { id: "1", name: "Ada", elapsedMs: 42001, rank: 1 },
                { id: "2", name: "Lin", elapsedMs: 65432, rank: 2 },
              ],
              ruleset: "team-keys-v1",
            },
      ),
    }),
  );
  await boot(page);
  expect(
    await page.evaluate(() => window.__game.scene.getScene("intro").homeItems),
  ).toHaveLength(5);
  await page.screenshot({ path: info.outputPath("main-menu-leaderboard.png") });
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("Enter");
  await expect(
    page.getByText(
      "Die Bestenliste konnte nicht geladen werden. Bitte die Verbindung prüfen und erneut versuchen.",
    ),
  ).toBeVisible();
  fail = false;
  await page.getByRole("button", { name: "Erneut laden" }).click();
  await expect(
    page.getByRole("cell", { name: "Ada", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("cell", { name: "00:42.001" })).toBeVisible();
  await page.screenshot({ path: info.outputPath("leaderboard-menu.png") });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  expect(await page.evaluate(() => window.__game.scene.isActive("intro"))).toBe(
    true,
  );
  await menuBoard(page);
  await expect(
    page.getByRole("cell", { name: "Lin", exact: true }),
  ).toBeVisible();
});

test("only a win offers name entry; save shows own rank and retry preserves run and time", async ({
  page,
}, info) => {
  const posts = [];
  let attempt = 0;
  await page.route("**/game-leaderboard**", async (route) => {
    if (route.request().method() === "GET") {
      const own = posts.at(-1);
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          entries: own
            ? [
                { id: "faster", name: "Faster", elapsedMs: 20000, rank: 1 },
                {
                  id: own.runId,
                  name: own.name,
                  elapsedMs: own.elapsedMs,
                  rank: 2,
                },
              ]
            : [],
          rank: own ? 2 : null,
          ruleset: "team-keys-v1",
        }),
      });
      return;
    }
    const body = route.request().postDataJSON();
    posts.push(body);
    attempt++;
    if (attempt === 1) await route.abort("failed");
    else
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          rank: 1,
          runId: body.runId,
          entries: [
            {
              id: body.runId,
              name: body.name,
              elapsedMs: body.elapsedMs,
              rank: 1,
            },
          ],
          ruleset: body.ruleset,
        }),
      });
  });
  await boot(page);
  await win(page);
  await expect(
    page.getByText("Deine Zeit: 01:05.432", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Zeit eintragen", exact: true })
    .click();
  expect(posts).toHaveLength(0);
  await page.getByLabel("Name / Pseudonym", { exact: true }).fill("Ada Test");
  await page.getByLabel("Name / Pseudonym", { exact: true }).press("Enter");
  expect(posts).toHaveLength(0);
  await page.screenshot({ path: info.outputPath("leaderboard-name.png") });
  await page
    .getByRole("button", { name: "Zeit eintragen", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Erneut speichern" }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Name / Pseudonym", { exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Erneut speichern" }).click();
  await expect(
    page.getByText("Deine Zeit ist gespeichert.", { exact: true }),
  ).toBeVisible();
  expect(posts).toHaveLength(2);
  expect(posts[0]).toEqual(posts[1]);
  expect(posts[0].elapsedMs).toBe(65432);
  await expect(page.getByRole("row", { name: "Dein Run" })).toBeVisible();
  await page.screenshot({ path: info.outputPath("leaderboard-saved.png") });
  await page
    .getByRole("button", { name: "Aktualisieren", exact: true })
    .click();
  await expect(
    page.getByText("Dein Run: Platz 2 · 01:05.432", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Zum Hauptmenü", exact: true })
    .click();
  await page.waitForFunction(() => window.__game.scene.isActive("intro"));
  await page.evaluate(() =>
    window.__game.scene
      .getScene("intro")
      .scene.start("graybox", { showStartGuide: false }),
  );
  await page.waitForFunction(() => window.__game.scene.isActive("graybox"));
  await page.evaluate(() =>
    window.__game.scene.getScene("graybox").finishGame("caught", "PM"),
  );
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("winning score can be skipped and expanded portrait list remains upright", async ({
  page,
}, info) => {
  let posts = 0;
  await page.route("**/game-leaderboard", async (route) => {
    if (route.request().method() === "POST") posts++;
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ entries: [], ruleset: "team-keys-v1" }),
    });
  });
  await page.addInitScript(() => {
    Object.defineProperty(document, "fullscreenEnabled", {
      configurable: true,
      value: false,
    });
  });
  await boot(page);
  await page.locator(".fullscreen-button").click();
  await win(page);
  await page
    .getByRole("button", { name: "Ohne Eintrag zur Bestenliste" })
    .click();
  await expect(
    page.getByText(
      "Noch keine Zeiten eingetragen. Die erste Bestzeit wartet auf dich!",
    ),
  ).toBeVisible();
  expect(posts).toBe(0);
  const box = await page.getByRole("dialog").boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.width).toBeLessThanOrEqual(640);
  await page.screenshot({ path: info.outputPath("leaderboard-expanded.png") });
  await page
    .getByRole("button", { name: "Zum Hauptmenü", exact: true })
    .click();
  await page.waitForFunction(() => window.__game.scene.isActive("intro"));
});
