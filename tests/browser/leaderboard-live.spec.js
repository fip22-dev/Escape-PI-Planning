import { test, expect } from "@playwright/test";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

let ownRun;
test.afterEach(async () => {
  if (!ownRun) return;
  if (!/^[0-9a-f-]{36}$/.test(ownRun)) throw Error("Invalid QA run ID");
  const cli = path.join(
    path.dirname(process.execPath),
    "node_modules/npm/bin/npx-cli.js",
  );
  await promisify(execFile)(
    process.execPath,
    [
      cli,
      "-y",
      "@insforge/cli",
      "db",
      "query",
      `delete from public.leaderboard_runs where id='${ownRun}' and name='QA Browser Test'`,
      "--json",
    ],
    { windowsHide: true },
  );
  console.log("Own live QA score removed: " + ownRun);
  ownRun = null;
});

test("live winner form saves to InsForge and appears in the shared list", async ({
  page,
}) => {
  test.skip(
    process.env.LEADERBOARD_LIVE_TEST !== "1",
    "Explicit opt-in: writes one public QA score and removes it after testing.",
  );
  test.setTimeout(60000);
  await page.route("**/src/main.js", async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      body: (await response.text()) + "\nwindow.__game=game;",
    });
  });
  page.on("request", (request) => {
    if (
      request.url().endsWith("/game-leaderboard") &&
      request.method() === "POST"
    )
      ownRun = request.postDataJSON().runId;
  });
  await page.goto("/");
  await page.waitForFunction(() => window.__game?.scene.isActive("intro"));
  await page.evaluate(() =>
    window.__game.scene
      .getScene("intro")
      .scene.start("graybox", { showStartGuide: false }),
  );
  await page.waitForFunction(() => window.__game.scene.isActive("graybox"));
  await page.evaluate(() => {
    const s = window.__game.scene.getScene("graybox");
    s.escapeStartedAt = s.time.now - 76543;
    s.collectedTeamKeys = new Set(s.teamKeys.map((k) => k.team));
    s.onPlayerTileChanged(s.time.now, 34, 2);
  });
  await page
    .getByLabel("Name / Pseudonym", { exact: true })
    .fill("QA Browser Test");
  await page
    .getByRole("button", { name: "Zeit eintragen", exact: true })
    .click();
  await expect(
    page.getByText("Deine Zeit ist gespeichert.", { exact: true }),
  ).toBeVisible({ timeout: 30000 });
  await expect(page.getByRole("row", { name: "Dein Run" })).toContainText(
    "QA Browser Test",
  );
  await expect(page.getByRole("row", { name: "Dein Run" })).toContainText(
    "01:16.543",
  );
});
