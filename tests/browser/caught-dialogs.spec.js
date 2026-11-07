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
  await page.clock.install();
  await page.goto("/");
  await page.waitForFunction(() => window.__generation === 1);
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

test("neutral speech is non-modal, follows the speaker, pauses and resets with the attempt", async ({ page }, testInfo) => {
  await page.evaluate(() => {
    const s = window.__game.scene.getScene("graybox");
    const person = s.neutralPeople[28];
    s.playerTile = { x: person.tile.x - 1, y: person.tile.y };
    s.player.setPosition((s.playerTile.x + 0.5) * 16, (s.playerTile.y + 0.5) * 16);
    s.cameras.main.stopFollow();
    s.cameras.main.centerOn(s.player.x, s.player.y);
    s.neutralSpeech.readyAt = s.time.now;
    s.escapeStartedAt = s.time.now - 10_000;
    person.nextMoveAt = s.time.now + 50;
    const other = s.neutralPeople[30];
    other.tile = { x: person.tile.x, y: person.tile.y - 1 };
    other.sprite.setPosition((other.tile.x + 0.5) * 16, (other.tile.y + 0.5) * 16);
    other.nextMoveAt = Infinity;
  });
  await page.clock.runFor(250);
  const readSpeech = () => page.evaluate(() => {
    const s = window.__game.scene.getScene("graybox");
    const bubble = s.speechBubbles[28];
    const bounds = bubble.text.getBounds();
    return {
      active: s.neutralSpeech.active, visible: bubble.text.visible && bubble.shape.visible, result: s.gameResult,
      visibleCount: s.speechBubbles.filter(b => b.text.visible && b.shape.visible).length,
      elapsed: s.time.now - s.escapeStartedAt,
      timer: s.timerText.text, player: s.playerTile,
      speakerX: s.neutralPeople[28].sprite.x, speakerY: s.neutralPeople[28].sprite.y,
      fits: bounds.left >= 8 && bounds.top >= 42 && bounds.right <= 312 && bounds.bottom <= 232,
    };
  });
  const first = await readSpeech();
  expect(first.active, JSON.stringify(await page.evaluate(() => {
    const s = window.__game.scene.getScene("graybox");
    const p = s.neutralPeople[28];
    return { time: s.time.now, state: s.neutralSpeech, tile: p.tile, bounds: p.bounds,
      player: s.playerTile, sprite: [p.sprite.x, p.sprite.y], camera: s.cameras.main.worldView,
      result: s.gameResult, paused: s.isPaused };
  }))).toHaveLength(2);
  expect(first.active.map(b => b.personIndex)).toEqual(expect.arrayContaining([28, 30]));
  expect(first.visibleCount).toBe(2);
  expect(first.visible).toBe(true);
  expect(first.fits).toBe(true);
  await page.clock.runFor(400);
  const moving = await readSpeech();
  expect(moving.elapsed).toBeGreaterThan(first.elapsed);
  expect([moving.speakerX, moving.speakerY]).not.toEqual([first.speakerX, first.speakerY]);
  await page.keyboard.down("ArrowRight");
  await page.clock.runFor(250);
  await page.keyboard.up("ArrowRight");
  expect((await readSpeech()).player).not.toEqual(first.player);
  await page.screenshot({ path: testInfo.outputPath("neutral-speech.png"), fullPage: true });
  await page.keyboard.press("Escape");
  await page.clock.runFor(1000);
  expect((await readSpeech()).visible).toBe(false);
  await page.keyboard.press("Escape");
  await page.clock.runFor(100);
  expect((await readSpeech()).visible).toBe(true);
  await page.clock.runFor(2000);
  expect((await readSpeech()).active).toEqual([]);
  await page.evaluate(() => window.__game.scene.getScene("graybox").finishGame("caught", "PM"));
  expect((await readSpeech()).visible).toBe(false);
  await page.clock.runFor(250);
  await confirm(page, "Enter");
  expect(await page.evaluate(() => {
    const state = window.__game.scene.getScene("graybox").neutralSpeech;
    return { active: state.active, cooldowns: state.personReadyAt };
  })).toEqual({ active: [], cooldowns: {} });
});

test("all side rooms show one speech bubble at a time; hall still allows two", async ({ page }) => {
  const rooms = await page.evaluate(() => window.__game.scene.getScene("graybox").rooms);
  expect(rooms).toHaveLength(13);
  for (const room of [...rooms, { x: 12, y: 10, width: 5, height: 8, area: "hall" }]) {
    await page.evaluate(room => {
      const s = window.__game.scene.getScene("graybox");
      // Controlled proximity setup; the actual speech and rendering code runs.
      s.tweens.killAll();
      s.updateSearchers = () => {};
      s.neutralSpeech = { active: [], readyAt: s.time.now, personReadyAt: {} };
      s.neutralPeople.forEach(p => { p.tile = { x: 0, y: 0 }; p.nextTile = null; p.nextMoveAt = Infinity; });
      s.playerTile = { x: room.x + 2, y: room.y + 2 };
      s.player.setPosition((s.playerTile.x + 0.5) * 16, (s.playerTile.y + 0.5) * 16);
      for (const [i, dx] of [-1, 1].entries()) {
        const p = s.neutralPeople[i];
        p.bounds = { ...room };
        p.tile = { x: s.playerTile.x + dx, y: s.playerTile.y };
        p.sprite.setPosition((p.tile.x + 0.5) * 16, (p.tile.y + 0.5) * 16);
      }
      s.cameras.main.stopFollow();
      s.cameras.main.centerOn(s.player.x, s.player.y);
    }, room);
    await page.clock.runFor(200);
    const read = () => page.evaluate(() => {
      const s = window.__game.scene.getScene("graybox");
      return { speakers: s.neutralSpeech.active.map(b => b.personIndex),
        visible: s.speechBubbles.filter(b => b.text.visible).length };
    });
    const first = await read();
    expect(first.speakers.length, room.label ?? "hall").toBe(room.label ? 1 : 2);
    expect(first.visible).toBe(room.label ? 1 : 2);
    if (room.label) {
      await page.clock.runFor(1500);
      const next = await read();
      expect(next.visible).toBe(1);
      expect(next.speakers).not.toEqual(first.speakers);
    }
  }
});

test("opening patrol keeps RTE, product manager and second scrum master apart", async ({ page }, testInfo) => {
  const opening = () => page.evaluate(() => {
    const s = window.__game.scene.getScene("graybox");
    const people = [s.searchers.find(p => p.role === "RTE"), s.searchers.find(p => p.role === "PM"),
      s.searchers.filter(p => p.role === "Scrum Master")[1]];
    return people.map(p => ({ x: p.sprite.x / 16, y: p.sprite.y / 16 }));
  });
  const verifySpacing = positions => {
    for (const [i, p] of positions.entries()) {
      for (const other of positions.slice(i + 1)) {
        expect(Math.abs(p.x - other.x) + Math.abs(p.y - other.y)).toBeGreaterThanOrEqual(6);
      }
    }
  };
  verifySpacing(await opening());
  await page.evaluate(() => {
    const camera = window.__game.scene.getScene("graybox").cameras.main;
    camera.stopFollow();
    camera.centerOn(34 * 16, 35 * 16);
  });
  for (let i = 0; i < 8; i++) {
    await page.clock.runFor(1000);
    verifySpacing(await opening());
  }
  await page.screenshot({ path: testInfo.outputPath("opening-patrol-spacing.png"), fullPage: true });
  await page.locator('[data-action="restart"]').click();
  await page.clock.runFor(100);
  const state = await sceneState(page);
  expect(state.generation).toBe(2);
  verifySpacing(await opening());
});
