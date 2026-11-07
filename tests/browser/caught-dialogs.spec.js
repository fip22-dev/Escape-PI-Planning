import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // Test-only instrumentation: the shipped app exposes no game/debug globals.
  await page.addInitScript(() => {
    window.__snapshot = scene => ({
      player: scene.playerTile,
      people: [...scene.neutralPeople, ...scene.searchers].map(person => ({
        tile: { ...person.tile }, nextTile: person.nextTile,
        routeIndex: person.routeIndex, route: person.patrol?.route ?? person.route,
        delay: Math.round(person.nextMoveAt - scene.time.now),
        facing: person.facing, visibleSince: person.visibleSince,
        detourRoute: person.detourRoute, blockedAttempts: person.blockedAttempts,
      })),
    });
  });
  await page.route("**/src/main.js", async route => {
    const response = await route.fetch();
    const body = (await response.text()).replace("scene: [GrayboxScene],", `scene: [class extends GrayboxScene {
      create() {
        super.create();
        window.__initialState = window.__snapshot(this);
        window.__generation = (window.__generation ?? 0) + 1;
      }
    }],`) + "\nwindow.__game = game;";
    await route.fulfill({ response, body });
  });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  page.__errors = errors;
  await page.goto("/");
  await page.waitForFunction(() => window.__generation === 1);
  await page.clock.install();
});

test.afterEach(async ({ page }) => {
  expect(page.__errors).toEqual([]);
});

async function sceneState(page) {
  return page.evaluate(() => {
    const s = window.__game.scene.getScene("graybox");
    return {
      result: s.gameResult, timer: s.timerText.text,
      dialog: s.caughtDialog, heading: s.dialogHeading.text,
      snapshot: window.__snapshot(s), initial: window.__initialState,
      generation: window.__generation, now: s.time.now,
    };
  });
}

async function catchRole(page, role) {
  await page.evaluate(role => {
    const s = window.__game.scene.getScene("graybox");
    s.finishGame("caught", role);
  }, role);
  await page.clock.runFor(250);
  const fits = await page.evaluate(() => {
    const s = window.__game.scene.getScene("graybox");
    const panel = s.dialogPanel.getBounds();
    const body = s.dialogBody.getBounds();
    const heading = s.dialogHeading.getBounds();
    const hint = s.dialogHint.getBounds();
    return s.dialogPanel.visible && heading.bottom < body.top && body.bottom < hint.top && body.right <= panel.right
      && heading.right <= panel.right && hint.bottom <= panel.bottom;
  });
  expect(fits).toBe(true);
}

async function confirm(page, input) {
  if (input === "tap") {
    const canvas = page.locator("canvas");
    await canvas.tap({ position: { x: 100, y: 100 } });
  } else if (input === "click") {
    await page.locator("canvas").click({ position: { x: 100, y: 100 } });
  } else await page.keyboard.press(input);
  await page.clock.runFor(250);
}

test("every searcher shows first and repeat dialogue, with complete reproducible restarts", async ({ page }, testInfo) => {
  const roles = await page.evaluate(() => window.__game.scene.getScene("graybox").searchers.map(s => s.role));
  expect(roles).toHaveLength(15);
  const baseline = (await sceneState(page)).initial;
  const seen = new Set();
  for (const [index, role] of roles.entries()) {
    const family = role.startsWith("PO · ") ? "PO" : role;
    await catchRole(page, role);
    let state = await sceneState(page);
    const fullNames = {
      RTE: "Release Train Engineer", "P&T": "People & Transformation",
      BO: "Business Owner", PM: "Product Manager", PO: "Product Owner", "Scrum Master": "Scrum Master",
    };
    expect(state.heading).toBe(`ERWISCHT! – ${fullNames[family]}${family === "PO" ? ` · ${role.slice(5)}` : ""}`);
    expect(state.dialog.repeated).toBe(seen.has(family));
    const generation = state.generation;
    const input = testInfo.project.name.startsWith("mobile") ? "tap" : index % 2 ? "Space" : "Enter";
    while (state.dialog) {
      await confirm(page, input);
      state = await sceneState(page);
    }
    expect(state.generation).toBe(generation + 1);
    expect(state.initial).toEqual(baseline);
    expect(state.result).toBeNull();
    expect(state.timer).toBe("03:00");
    seen.add(family);
    await catchRole(page, role);
    expect((await sceneState(page)).dialog.repeated).toBe(true);
    await confirm(page, testInfo.project.name.startsWith("mobile") ? "tap" : "click");
    expect((await sceneState(page)).generation).toBe(generation + 2);
    expect((await sceneState(page)).initial).toEqual(baseline);
  }
});

test("real sight detection catches during movement; world and timer stay frozen until restart", async ({ page }, testInfo) => {
  await page.clock.runFor(2100);
  await page.evaluate(() => {
    const s = window.__game.scene.getScene("graybox");
    s.escapeStartedAt = s.time.now - 20_000;
    const rte = s.searchers[0];
    // Hold the observer at a known tile; neutral movement continues normally.
    s.tweens.killTweensOf(rte.sprite);
    rte.nextTile = null;
    rte.nextMoveAt = s.time.now + 1000;
    s.playerTile = { x: rte.tile.x, y: rte.tile.y + 1 };
    s.player.setPosition((s.playerTile.x + 0.5) * 16, (s.playerTile.y + 0.5) * 16);
    rte.visibleSince = s.time.now - 600;
  });
  await page.clock.runFor(100);
  const frozen = await sceneState(page);
  expect(frozen.result).toBe("caught");
  expect(frozen.dialog.role).toBe("RTE");
  const positions = await page.evaluate(() => {
    const s = window.__game.scene.getScene("graybox");
    return [...s.neutralPeople, ...s.searchers].map(p => [p.sprite.x, p.sprite.y]);
  });
  await page.keyboard.press("Escape");
  await page.clock.runFor(5000);
  const after = await sceneState(page);
  expect(after.timer).toBe(frozen.timer);
  expect(after.now - frozen.now).toBeGreaterThanOrEqual(5000);
  expect(after.snapshot).toEqual({ ...frozen.snapshot, people: frozen.snapshot.people.map(p => ({
    ...p, delay: p.delay - (after.now - frozen.now),
  })) });
  expect(await page.evaluate(() => {
    const s = window.__game.scene.getScene("graybox");
    return [...s.neutralPeople, ...s.searchers].map(p => [p.sprite.x, p.sprite.y]);
  })).toEqual(positions);
  await page.screenshot({ path: testInfo.outputPath("caught-dialog.png"), fullPage: true });
  await confirm(page, "Enter");
  const reset = await sceneState(page);
  expect(reset.result).toBeNull();
  expect(reset.initial).toEqual(frozen.initial);
  await page.clock.runFor(2100);
  expect(await page.evaluate(() => window.__game.scene.getScene("graybox").neutralPeople.some(p => p.nextTile !== null))).toBe(true);
});

test("pause, touch restart, win and timeout still work across repeated scene restarts", async ({ page }) => {
  await page.locator('[data-action="pause"]').click();
  await page.clock.runFor(1000);
  expect(await page.evaluate(() => window.__game.scene.getScene("graybox").isPaused)).toBe(true);
  await page.keyboard.press("Escape");
  expect(await page.evaluate(() => window.__game.scene.getScene("graybox").isPaused)).toBe(false);
  for (let i = 0; i < 3; i++) {
    await page.locator('[data-action="restart"]').click();
    await page.clock.runFor(250);
  }
  expect((await sceneState(page)).generation).toBe(4);
  await page.evaluate(() => window.__game.scene.getScene("graybox").finishGame("win"));
  await confirm(page, "Enter");
  expect((await sceneState(page)).generation).toBe(5);
  await page.evaluate(() => {
    const s = window.__game.scene.getScene("graybox");
    s.escapeStartedAt = s.time.now - 180_000;
  });
  await page.clock.runFor(100);
  expect((await sceneState(page)).result).toBe("timeout");
  await page.keyboard.press("ArrowLeft");
  await confirm(page, "Enter");
  expect((await sceneState(page)).generation).toBe(6);
  expect((await sceneState(page)).timer).toBe("03:00");
});
