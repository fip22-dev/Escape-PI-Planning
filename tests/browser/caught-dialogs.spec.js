import { test, expect } from "@playwright/test";
import { isolatedFurnitureCases, furnitureSightLayout } from "../helpers/furnitureSight.js";

test("doors occupy the wall openings on every side of the floor", async ({ page }, testInfo) => {
  const positions = await page.evaluate(() => {
    const s = window.__game.scene.getScene("graybox");
    s.update = () => {};
    s.tweens.pauseAll();
    s.cameras.main.stopFollow();
    return s.doors.map(d => [d.x, d.y, d.width, d.height]);
  });
  expect(positions.sort()).toEqual([
    [12, 8, 1, 2], [12, 18, 1, 2], [12, 29, 1, 2], [12, 37, 1, 2],
    [36, 8, 1, 2], [36, 20, 1, 2], [36, 32, 1, 2], [22, 6, 2, 1],
    [21, 12, 1, 1], [21, 18, 1, 1], [20, 22, 1, 1], [28, 22, 1, 1],
    [20, 34, 1, 1], [27, 34, 1, 1], [34, 39, 2, 1], [33, 2, 2, 1],
  ].sort());
  for (const [name, x, y] of [["meeting-4-5", 24, 35], ["west", 12, 19], ["east", 36, 20],
    ["north", 23, 7], ["meeting-1-3", 24, 20]]) {
    await page.evaluate(({ x, y }) => window.__game.scene.getScene("graybox").cameras.main.centerOn(x * 16, y * 16), { x, y });
    await page.clock.runFor(32);
    await page.screenshot({ path: testInfo.outputPath(`${name}-wall-doors.png`) });
  }
  await page.evaluate(async () => {
    const s = window.__game.scene.getScene("graybox");
    for (const door of s.doors) door.open = true;
    const { drawDoors } = await import("/src/game/doors.js");
    drawDoors(s.doorGraphics, s.doors, 16);
  });
  for (const [name, x, y] of [["meeting-4-5", 24, 35], ["west", 12, 19], ["east", 36, 20]]) {
    await page.evaluate(({ x, y }) => window.__game.scene.getScene("graybox").cameras.main.centerOn(x * 16, y * 16), { x, y });
    await page.clock.runFor(32);
    await page.screenshot({ path: testInfo.outputPath(`${name}-open-doors.png`) });
  }
});

test("pause menu returns directly to the intro with keyboard and pointer", async ({ page }, testInfo) => {
  await page.keyboard.press("Escape");
  await page.keyboard.press("ArrowDown");
  expect(await page.evaluate(() => window.__game.scene.getScene("graybox").pauseRow)).toBe(1);
  await page.clock.runFor(32);
  await page.screenshot({ path: testInfo.outputPath("pause-main-menu-selected.png") });
  await page.keyboard.press("Enter");
  await page.clock.runFor(250);
  expect(await page.evaluate(() => window.__game.scene.isActive("intro"))).toBe(true);
  expect(await page.locator(".touch-controls").isVisible()).toBe(false);
  await page.clock.runFor(250);
  expect(await page.evaluate(() => window.__game.scene.isActive("graybox"))).toBe(false);
  await page.keyboard.press("Enter");
  await page.clock.runFor(250);
  expect(await page.evaluate(() => window.__game.scene.isActive("graybox"))).toBe(true);
  await page.keyboard.press("Escape");
  const canvas = page.locator("canvas");
  const box = await canvas.boundingBox();
  const options = { position: { x: box.width / 2, y: box.height * 124 / 240 } };
  if (testInfo.project.name.startsWith("mobile")) await canvas.tap(options);
  else await canvas.click(options);
  await page.clock.runFor(250);
  expect(await page.evaluate(() => window.__game.scene.isActive("intro")), JSON.stringify(await page.evaluate(() => {
    const s = window.__game.scene.getScene("graybox");
    return { paused: s.isPaused, row: s.pauseRow, pending: s.pauseTransitionPending,
      pointer: { x: s.input.activePointer.x, y: s.input.activePointer.y },
      menu: s.pauseMenu.getBounds(), cameras: s.cameras.cameras.map(c => ({ id: c.id, name: c.name, zoom: c.zoom })) };
  }))).toBe(true);
});

test("automatic doors stay open through player and PO passages, pause, then close and reset", async ({ page }, testInfo) => {
  await page.evaluate(() => {
    const s = window.__game.scene.getScene("graybox");
    s.updateSearcherDetection = () => false;
    s.tweens.killAll();
    for (const p of [...s.neutralPeople, ...s.searchers]) {
      p.tile = { x: 0, y: 0 }; p.nextTile = null; p.nextMoveAt = Infinity;
      p.sprite.setVisible(false);
    }
    s.playerTile = { x: 34, y: 40 }; s.playerNextTile = null; s.lastMoveAt = -Infinity;
    s.player.setPosition(34.5 * 16, 40.5 * 16);
    s.cameras.main.stopFollow(); s.cameras.main.centerOn(34.5 * 16, 39.5 * 16);
  });
  const piDoor = () => page.evaluate(() => {
    const s = window.__game.scene.getScene("graybox");
    return s.doors.find(d => d.x === 34 && d.y === 39).open;
  });
  expect(await piDoor()).toBe(false);
  await page.clock.runFor(32);
  await page.screenshot({ path: testInfo.outputPath("door-closed.png") });
  await page.keyboard.down("ArrowUp");
  await page.clock.runFor(32);
  await page.keyboard.up("ArrowUp");
  expect(await piDoor()).toBe(true);
  await page.keyboard.press("Escape");
  await page.clock.runFor(1000);
  expect(await piDoor()).toBe(true);
  await page.keyboard.press("Escape");
  await page.clock.runFor(150);
  expect((await sceneState(page)).snapshot.player).toEqual({ x: 34, y: 39 });
  await page.screenshot({ path: testInfo.outputPath("door-open.png") });
  await page.keyboard.down("ArrowUp");
  await page.clock.runFor(32);
  await page.keyboard.up("ArrowUp");
  await page.clock.runFor(150);
  expect((await sceneState(page)).snapshot.player).toEqual({ x: 34, y: 38 });
  await page.clock.runFor(300);
  expect(await piDoor()).toBe(false);

  await page.evaluate(() => {
    const s = window.__game.scene.getScene("graybox");
    s.playerTile = { x: 34, y: 47 }; s.player.setPosition(34.5 * 16, 47.5 * 16);
    const po = s.searchers.find(p => p.role.startsWith("PO"));
    po.tile = { x: 11, y: 8 }; po.nextTile = null;
    po.sprite.setPosition(11.5 * 16, 8.5 * 16).setVisible(true);
    po.route = [{ x: 12, y: 8 }, { x: 13, y: 8 }]; po.routeIndex = 0;
    po.nextMoveAt = s.time.now;
    s.cameras.main.centerOn(11.5 * 16, 8.5 * 16);
  });
  const teamDoor = () => page.evaluate(() => window.__game.scene.getScene("graybox").doors.find(d => d.x === 12 && d.y === 8).open);
  await page.clock.runFor(32);
  expect(await teamDoor()).toBe(true);
  await page.clock.runFor(450);
  expect(await teamDoor()).toBe(true);
  await page.clock.runFor(400);
  expect(await teamDoor()).toBe(true);
  await page.clock.runFor(700);
  expect(await teamDoor(), JSON.stringify(await page.evaluate(() => {
    const s = window.__game.scene.getScene("graybox");
    const po = s.searchers.find(p => p.role.startsWith("PO"));
    return { now: s.time.now, tile: po.tile, next: po.nextTile, nextMove: po.nextMoveAt,
      door: s.doors.find(d => d.x === 12 && d.y === 8), routeIndex: po.routeIndex, blocked: po.blockedAttempts };
  }))).toBe(false);
  await page.locator('[data-action="restart"]').click();
  await page.clock.runFor(100);
  expect(await page.evaluate(() => window.__game.scene.getScene("graybox").doors.every(d => !d.open))).toBe(true);
});

test("closed doors hide the player; an NPC reservation opens sight and closing clears the warning", async ({ page }) => {
  await page.evaluate(() => {
    const s = window.__game.scene.getScene("graybox");
    s.tweens.killAll();
    for (const p of [...s.neutralPeople, ...s.searchers]) {
      p.tile = { x: 0, y: 0 }; p.nextTile = null; p.nextMoveAt = Infinity;
    }
    const observer = s.searchers[0];
    observer.tile = { x: 10, y: 8 }; observer.facing = { x: 1, y: 0 }; observer.visibleSince = null;
    s.playerTile = { x: 13, y: 8 }; s.playerNextTile = null;
  });
  await page.clock.runFor(800);
  expect((await sceneState(page)).result).toBeNull();
  expect(await page.evaluate(() => window.__game.scene.getScene("graybox").searchers[0].warningIcon.visible)).toBe(false);
  await page.evaluate(() => {
    const npc = window.__game.scene.getScene("graybox").neutralPeople[0];
    npc.tile = { x: 11, y: 9 }; npc.nextTile = { x: 12, y: 9 };
  });
  await page.clock.runFor(100);
  expect(await page.evaluate(() => window.__game.scene.getScene("graybox").searchers[0].warningIcon.visible)).toBe(true);
  await page.evaluate(() => {
    window.__game.scene.getScene("graybox").neutralPeople[0].nextTile = null;
  });
  await page.clock.runFor(300);
  expect((await sceneState(page)).result).toBeNull();
  expect(await page.evaluate(() => window.__game.scene.getScene("graybox").searchers[0].warningIcon.visible)).toBe(false);
  expect(await page.evaluate(() => window.__game.scene.getScene("graybox").searchers[0].visibleSince)).toBeNull();
});

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
    const body = (await response.text()).replace("scene: [IntroScene, GrayboxScene],", `scene: [class extends GrayboxScene {
      create() {
        super.create();
        window.__initialState = window.__snapshot(this);
        window.__generation = (window.__generation ?? 0) + 1;
      }
    }, IntroScene],`) + "\nwindow.__game = game;";
    await route.fulfill({ response, body });
  });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  page.__errors = errors;
  // Keep simulation time frozen between explicit advances. High-resolution
  // screenshots must not consume the 300/600 ms detection deadlines.
  await page.clock.install({ time: new Date("2026-11-09T12:00:00Z") });
  await page.clock.pauseAt(new Date("2026-11-09T12:00:01Z"));
  await page.goto("/");
  await page.clock.runFor(100);
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
  // Thirty rendered scene restarts can exceed 30 s on software-rendered Firefox.
  test.setTimeout(60_000);
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
  // Scene time is sampled at frame boundaries, so leave a small frame margin
  // while still asserting at least five full seconds of frozen gameplay.
  await page.clock.runFor(5100);
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
  // The restart choice defaults to Nein, which resumes the attempt.
  await page.keyboard.press("Enter");
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

test("neutral speech follows its speaker, pauses and resets with the attempt", async ({ page }, testInfo) => {
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
      bubbleWorld: { x: bubble.text.x + s.cameras.main.worldView.x, y: bubble.text.y + s.cameras.main.worldView.y },
      bubbleScreen: { x: bubble.text.x, y: bubble.text.y },
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
  expect(moving.bubbleWorld).not.toEqual(first.bubbleWorld);
  const expectSpeakerAnchor = state => {
    const anchor = state.active.find(b => b.personIndex === 28).anchor;
    expect(anchor.x).toBeCloseTo(state.speakerX, 2);
    expect(anchor.y).toBeCloseTo(state.speakerY - 10, 2);
  };
  expectSpeakerAnchor(moving);
  await page.evaluate(() => {
    const scene = window.__game.scene.getScene("graybox");
    scene.tweens.killAll();
    for (const person of scene.neutralPeople) person.nextMoveAt = Infinity;
    const camera = scene.cameras.main;
    camera.setScroll(camera.scrollX + 16, camera.scrollY + 16);
  });
  await page.clock.runFor(50);
  expectSpeakerAnchor(await readSpeech());
  expect((await readSpeech()).bubbleScreen).not.toEqual(first.bubbleScreen);
  await page.keyboard.down("ArrowRight");
  await page.clock.runFor(250);
  await page.keyboard.up("ArrowRight");
  expect((await readSpeech()).player).not.toEqual(first.player);
  expectSpeakerAnchor(await readSpeech());
  expect((await readSpeech()).speakerX).toBe(moving.speakerX);
  await page.screenshot({ path: testInfo.outputPath("neutral-speech.png"), fullPage: true });
  await page.keyboard.press("Escape");
  await page.clock.runFor(1000);
  expect((await readSpeech()).visible).toBe(false);
  await page.keyboard.press("Enter");
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
  // Fourteen rendered room setups advance about 25 s of simulation time.
  test.setTimeout(60_000);
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
      await page.clock.runFor(2000);
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

test("furniture detection matrix covers all 15 searchers and moving tile reservations", async ({ page }) => {
  const count = await page.evaluate(cases => {
    const s = window.__game.scene.getScene("graybox");
    // The synchronous matrix changes observer positions; pause automatic patrols.
    s.scene.pause();
    s.tweens.killAll();
    const hall = s.grid[8][14];
    s.grid = Array.from({ length: 16 }, () => Array(20).fill(hall));
    s.neutralPeople = [];
    const caught = [];
    const finish = s.finishGame;
    s.finishGame = (result, role) => caught.push({ result, role });
    let checked = 0;
    for (const searcher of s.searchers) {
      for (const fixture of cases) {
        s.roomObjects = [fixture.object];
        searcher.tile = { x: 5, y: 6 };
        searcher.nextTile = null;
        searcher.facing = { x: 1, y: 0 };
        searcher.visibleSince = null;
        s.playerTile = { x: 6 + fixture.object.width, y: 6 };
        s.playerNextTile = null;
        const start = s.time.now;
        s.updateSearcherDetection(searcher, start);
        if (fixture.blocksSight) {
          s.updateSearcherDetection(searcher, start + 1000);
          if (searcher.warningIcon.visible || searcher.visibleSince !== null)
            throw new Error(`${searcher.role}/${fixture.type}: hidden player produced a warning`);
          searcher.facing = { x: -1, y: 0 };
          s.playerNextTile = { x: 3, y: 6 };
          s.updateSearcherDetection(searcher, start + 1100);
          if (!searcher.warningIcon.visible) throw new Error("visible reserved player tile must warn");
          s.playerNextTile = null;
          searcher.facing = { x: 1, y: 0 };
          searcher.nextTile = { x: s.playerTile.x + 1, y: 6 };
          searcher.visibleSince = null;
          s.updateSearcherDetection(searcher, start + 1200);
          if (!searcher.warningIcon.visible) throw new Error("visible reserved observer tile must warn");
          searcher.nextTile = null;
          s.playerTile = { x: 3, y: 6 };
          searcher.facing = { x: -1, y: 0 };
        }
        searcher.visibleSince = null;
        const before = caught.length;
        for (const [elapsed, color] of [[0, "#ffe066"], [299, "#ffe066"], [300, "#ff4d4f"], [599, "#ff4d4f"]]) {
          s.updateSearcherDetection(searcher, start + 2000 + elapsed);
          if (!searcher.warningIcon.visible || searcher.warningIcon.style.color !== color || caught.length !== before)
            throw new Error(`${searcher.role}/${fixture.type}: invalid warning timing at ${elapsed}`);
        }
        s.updateSearcherDetection(searcher, start + 2600);
        if (caught.length !== before + 1 || caught.at(-1).role !== searcher.role)
          throw new Error(`${searcher.role}/${fixture.type}: detection failed after clearing cover`);
        checked++;
      }
    }
    s.finishGame = finish;
    return checked;
  }, isolatedFurnitureCases());
  expect(count).toBe(15 * 9);
});

test("furniture cover in the rendered scene hides or reveals the player according to design", async ({ page }, testInfo) => {
  for (const fixture of isolatedFurnitureCases()) {
    await page.evaluate(fixture => {
      const s = window.__game.scene.getScene("graybox");
      s.tweens.killAll();
      for (const child of s.children.list) child.setVisible(false);
      s.add.rectangle(0, 0, 320, 240, 0x82918c).setOrigin(0).setDepth(0);
      const floor = s.grid[8][14];
      s.grid = Array.from({ length: 16 }, () => Array(20).fill(floor));
      s.roomObjects = [fixture.object];
      s.drawRoomObjects();
      for (const p of s.neutralPeople) p.sprite.setVisible(false);
      s.neutralPeople = [];
      const observer = s.searchers[0];
      s.searchers = [observer];
      observer.tile = { x: 5, y: 6 };
      observer.nextTile = null;
      observer.nextMoveAt = Infinity;
      observer.visibleSince = null;
      observer.facing = { x: 1, y: 0 };
      observer.sprite.setPosition(5.5 * 16, 6.5 * 16).setVisible(true);
      s.updateSearcherFacingMarker(observer);
      s.playerTile = { x: 6 + fixture.object.width, y: 6 };
      s.playerNextTile = null;
      s.player.setPosition((s.playerTile.x + 0.5) * 16, 6.5 * 16).setVisible(true);
      s.cameras.main.stopFollow();
      s.cameras.main.setBounds(0, 0, 320, 240).setScroll(0, 0);
      s.hudPanel.setVisible(true); s.hudLabel.setVisible(true); s.timerText.setVisible(true);
    }, fixture);
    if (fixture.blocksSight) {
      await page.clock.runFor(800);
      expect((await sceneState(page)).result, fixture.type).toBeNull();
      expect(await page.evaluate(() => window.__game.scene.getScene("graybox").searchers[0].warningIcon.visible)).toBe(false);
      await page.screenshot({ path: testInfo.outputPath(`${fixture.type}-hidden.png`) });
      await page.evaluate(() => {
        const s = window.__game.scene.getScene("graybox");
        s.playerTile = { x: 3, y: 6 };
        s.player.setPosition(3.5 * 16, 6.5 * 16);
        s.searchers[0].facing = { x: -1, y: 0 };
        s.updateSearcherFacingMarker(s.searchers[0]);
      });
    }
    await page.clock.runFor(100);
    expect(await page.evaluate(() => window.__game.scene.getScene("graybox").searchers[0].warningIcon.style.color)).toBe("#ffe066");
    await page.clock.runFor(300);
    expect((await sceneState(page)).result).toBeNull();
    expect(await page.evaluate(() => window.__game.scene.getScene("graybox").searchers[0].warningIcon.style.color)).toBe("#ff4d4f");
    await page.clock.runFor(300);
    expect((await sceneState(page)).result, fixture.type).toBe("caught");
    // Catching starts a 200 ms confirmation guard. Advancing time only after
    // pressing Enter can leave the old caught result in the next fixture.
    await page.clock.runFor(250);
    const beforeConfirm = await page.evaluate(() => {
      const s = window.__game.scene.getScene("graybox");
      return { generation: window.__generation, elapsed: s.time.now - s.dialogLastAdvancedAt };
    });
    expect(beforeConfirm.elapsed).toBeGreaterThanOrEqual(200);
    await confirm(page, "Enter");
    const restarted = await sceneState(page);
    expect(restarted.generation,
      `${fixture.type}: confirmation after ${beforeConfirm.elapsed} ms must restart before the next fixture`)
      .toBe(beforeConfirm.generation + 1);
    expect(restarted.result).toBeNull();
    expect(restarted.dialog).toBeNull();
  }
});

test("actual-map table cover blocks detection and clearing it restores warning and capture", async ({ page }, testInfo) => {
  const layout = furnitureSightLayout();
  const scenario = layout.cases.find(c => c.type === "table" && c.object.x === 5 && c.object.y === 7);
  expect(scenario).toBeTruthy();
  await testInfo.attach("furniture-map-sightlines", { body: JSON.stringify(layout.summary, null, 2), contentType: "application/json" });
  await page.evaluate(scenario => {
    const s = window.__game.scene.getScene("graybox");
    s.tweens.killAll();
    for (const p of [...s.neutralPeople, ...s.searchers]) p.sprite.setVisible(false);
    s.neutralPeople = [];
    const observer = s.searchers.find(p => p.role === "PO · WCL");
    s.searchers = [observer];
    observer.tile = scenario.observerTile;
    observer.nextTile = null; observer.nextMoveAt = Infinity; observer.visibleSince = null;
    observer.facing = scenario.facing;
    observer.sprite.setPosition((observer.tile.x + 0.5) * 16, (observer.tile.y + 0.5) * 16).setVisible(true);
    s.updateSearcherFacingMarker(observer);
    s.playerTile = scenario.playerTile; s.playerNextTile = null;
    s.player.setPosition((s.playerTile.x + 0.5) * 16, (s.playerTile.y + 0.5) * 16);
    s.cameras.main.stopFollow(); s.cameras.main.centerOn(7 * 16, 8 * 16);
  }, scenario);
  await page.clock.runFor(1000);
  expect((await sceneState(page)).result).toBeNull();
  expect(await page.evaluate(() => window.__game.scene.getScene("graybox").searchers[0].warningIcon.visible)).toBe(false);
  await page.screenshot({ path: testInfo.outputPath("actual-table-hidden.png"), fullPage: true });
  await page.evaluate(() => {
    const s = window.__game.scene.getScene("graybox");
    s.playerTile = { x: 4, y: 5 };
    s.player.setPosition(4.5 * 16, 5.5 * 16);
    s.searchers[0].facing = { x: 0, y: -1 };
    s.updateSearcherFacingMarker(s.searchers[0]);
  });
  await page.clock.runFor(400);
  expect((await sceneState(page)).result).toBeNull();
  expect(await page.evaluate(() => window.__game.scene.getScene("graybox").searchers[0].warningIcon.style.color)).toBe("#ff4d4f");
  await page.screenshot({ path: testInfo.outputPath("actual-table-revealed.png"), fullPage: true });
  await page.clock.runFor(300);
  expect((await sceneState(page)).result).toBe("caught");
});
