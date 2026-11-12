import { test, expect } from "@playwright/test";

test("menu, pixel furniture and audio work at desktop and mobile sizes", async ({ page }, testInfo) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  const expectCentered = async () => {
    await expect.poll(() => page.locator("canvas").evaluate(canvas => {
      const box = canvas.getBoundingClientRect();
      const parent = canvas.parentElement.getBoundingClientRect();
      return Math.abs(box.x + box.width / 2 - parent.x - parent.width / 2);
    })).toBeLessThan(1.5);
  };
  await page.route("**/src/main.js", async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: await response.text() + "\nwindow.__game = game;" });
  });
  await page.goto("/");
  await page.waitForFunction(() => window.__game?.scene.isActive("intro"));
  expect(await page.locator("canvas").getAttribute("width")).toBe("1280");
  expect(await page.evaluate(() => window.__game.scene.getScene("intro").homeLabels.every(label => label.style.resolution === 4))).toBe(true);
  const hint = await page.evaluate(() => {
    const text = window.__game.scene.getScene("intro").children.list.find(child => child.text?.startsWith("WASD /"));
    const bounds = text.getBounds();
    return { top: bounds.top, bottom: bounds.bottom };
  });
  expect(hint.top).toBeGreaterThan(230);
  expect(hint.bottom).toBeLessThanOrEqual(240);
  for (const [name, width, height] of [["desktop", 1280, 900], ["portrait", 390, 844], ["landscape", 844, 390]]) {
    await page.setViewportSize({ width, height });
    await expectCentered();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`${name}-menu.png`) });
  }
  const activate = async (x, y) => {
    const canvas = page.locator("canvas");
    const box = await canvas.boundingBox();
    const options = { position: { x: x * box.width / 320, y: y * box.height / 240 } };
    if (testInfo.project.name.startsWith("mobile")) await canvas.tap(options);
    else await canvas.click(options);
  };
  await activate(160, 171);
  await page.waitForFunction(() => window.__game.scene.getScene("intro").view === "help");
  const box = await page.locator("canvas").boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height * 145 / 240);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height * 90 / 240, { steps: 6 });
  await page.mouse.up();
  await page.waitForFunction(() => window.__game.scene.getScene("intro").helpScroll > 0);
  await page.screenshot({ path: testInfo.outputPath("help-scrolled.png") });
  await page.keyboard.press("Escape");
  await activate(160, 191);
  await page.waitForFunction(() => window.__game.scene.getScene("intro").view === "settings");
  await activate(160, 92);
  expect(await page.evaluate(() => window.__game.scene.getScene("intro").audio.getSettings().sounds)).toBe(false);
  await activate(160, 92);
  await page.keyboard.press("Escape");
  await activate(160, 151);
  await page.waitForFunction(() => window.__game.scene.isActive("graybox"));
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => !window.__game.scene.getScene("graybox").startGuideVisible);
  expect(await page.evaluate(() => window.__game.scene.getScene("graybox").cameras.main.worldView.width)).toBe(320);
  await page.keyboard.press("Escape");
  expect(await page.evaluate(() => window.__game.scene.getScene("graybox").isPaused)).toBe(true);
  await activate(95, 153);
  expect(await page.evaluate(() => window.__game.scene.getScene("graybox").audio.getSettings().music)).toBe(false);
  await activate(95, 153);
  await page.keyboard.press("m");
  await page.keyboard.press("t");
  expect(await page.evaluate(() => window.__game.scene.getScene("graybox").audio.getSettings()))
    .toEqual({ music: false, sounds: false });
  await page.keyboard.press("m");
  await page.keyboard.press("t");

  const audio = await page.evaluate(async () => {
    const { getAudioEngine } = await import("/src/game/audio.js");
    const engine = getAudioEngine();
    await engine.unlock();
    const samples = engine.musicBuffer.getChannelData(0);
    let peak = 0;
    for (const sample of samples) peak = Math.max(peak, Math.abs(sample));
    engine.setSetting("music", false);
    const stopped = engine.musicSource === null;
    engine.setSetting("sounds", false);
    const settings = engine.getSettings();
    engine.setSetting("music", true);
    const source = engine.musicSource;
    engine.startMusic();
    engine.setSetting("sounds", true);
    return { peak, duration: engine.musicBuffer.duration, stopped, settings,
      singleSource: source === engine.musicSource, state: engine.context.state };
  });
  expect(audio.peak).toBeGreaterThan(0);
  expect(audio.peak).toBeLessThan(1);
  expect(audio.duration).toBeGreaterThan(25);
  expect(audio.duration).toBeLessThan(27);
  expect(audio.stopped).toBe(true);
  expect(audio.settings).toEqual({ music: false, sounds: false });
  expect(audio.singleSource).toBe(true);
  expect(audio.state).toBe("running");
  const peaks = await page.evaluate(async () => {
    const { AudioEngine } = await import("/src/game/audio.js");
    const peaks = {};
    for (const name of ["step", "warning"]) {
      const engine = new AudioEngine();
      engine.settings.sounds = true;
      engine.context = new OfflineAudioContext(1, 24000, 48000);
      engine.play(name);
      const buffer = await engine.context.startRendering();
      let peak = 0;
      for (const sample of buffer.getChannelData(0)) peak = Math.max(peak, Math.abs(sample));
      peaks[name] = peak;
    }
    return peaks;
  });
  expect(peaks.step).toBeGreaterThan(0);
  expect(peaks.step).toBeLessThan(0.013);
  expect(peaks.step).toBeLessThan(peaks.warning / 4);

  for (const [name, width, height] of [["desktop", 1280, 900], ["portrait", 390, 844], ["landscape", 844, 390]]) {
    await page.setViewportSize({ width, height });
    await expectCentered();
    await expect(page.locator("canvas")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const canvas = await page.locator("canvas").boundingBox();
    expect(canvas.width).toBeGreaterThan(250);
    expect(canvas.x + canvas.width).toBeLessThanOrEqual(width);
    await page.screenshot({ path: testInfo.outputPath(`${name}-pause.png`) });
  }
  await page.keyboard.press("Escape");
  expect(await page.evaluate(() => window.__game.scene.getScene("graybox").isPaused)).toBe(false);
  await page.screenshot({ path: testInfo.outputPath("pixel-world.png") });
  await page.evaluate(async () => {
    const s = window.__game.scene.getScene("graybox");
    s.pauseGame();
    const { drawPixelFurniture, drawPixelPerson } = await import("/src/game/pixelArt.js");
    const { routeRenderLayers } = await import("/src/game/rendering.js");
    s.add.rectangle(160, 120, 320, 240, 0x203735).setScrollFactor(0).setDepth(200);
    const types = ["table", "chair", "plant", "coffee", "whiteboard", "sideboard", "printer", "bin", "screen"];
    const objects = types.map((type, i) => ({ type, x: 1 + (i % 3) * 6, y: 1 + Math.floor(i / 3) * 3,
      width: ["table", "whiteboard", "sideboard", "screen"].includes(type) ? 3 : 1, height: 1 }));
    drawPixelFurniture(s, objects, 16).setScrollFactor(0).setDepth(201);
    for (const [i, object] of objects.entries()) {
      s.add.text(object.x * 16, object.y * 16 + 19, types[i], { resolution: 4, fontSize: "8px", color: "#f2e6c8" })
        .setScrollFactor(0).setDepth(202);
    }
    for (const [i, role] of ["RTE", "P&T", "BO", "PM", "PO · WCL", "Scrum Master"].entries()) {
      drawPixelPerson(s, 25 + i * 51, 188, 0xe18455, i, null, role).setScrollFactor(0).setDepth(202);
      s.add.text(25 + i * 51, 204, role, { resolution: 4, fontSize: "7px", color: "#f2e6c8" })
        .setOrigin(0.5).setScrollFactor(0).setDepth(202);
    }
    routeRenderLayers(s);
  });
  await page.screenshot({ path: testInfo.outputPath("pixel-art-gallery.png") });
  await page.evaluate(async () => {
    const engine = (await import("/src/game/audio.js")).getAudioEngine();
    engine.setSetting("music", false);
    engine.setSetting("sounds", false);
  });
  await page.reload();
  await page.waitForFunction(() => window.__game?.scene.isActive("intro"));
  expect(await page.evaluate(async () => (await import("/src/game/audio.js")).getAudioEngine().getSettings()))
    .toEqual({ music: false, sounds: false });
  expect(errors).toEqual([]);
});
