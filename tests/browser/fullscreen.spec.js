import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  page.__errors = [];
  page.on("pageerror", error => page.__errors.push(error.message));
  await page.route("**/src/main.js", async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: await response.text() + "\nwindow.__game = game;" });
  });
});

test.afterEach(async ({ page }) => expect(page.__errors).toEqual([]));

async function boot(page) {
  await page.goto("/");
  await page.waitForFunction(() => window.__game?.scene.isActive("intro"));
}

async function startGame(page) {
  await page.locator(".fullscreen-button").evaluate(button => button.blur());
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => window.__game.scene.isActive("graybox"));
}

async function expectFits(page) {
  await expect.poll(() => page.locator("canvas").evaluate(canvas => {
    const rect = canvas.getBoundingClientRect();
    return rect.left >= 0 && rect.top >= 0 && rect.right <= innerWidth + 1 && rect.bottom <= innerHeight + 1;
  })).toBe(true);
}

test("native fullscreen supports button, keyboard, gameplay and Escape without pausing", async ({ page }, testInfo) => {
  await boot(page);
  const button = page.locator(".fullscreen-button");
  const native = await page.evaluate(() => Boolean(document.fullscreenEnabled && document.querySelector(".page").requestFullscreen));
  await button.click();
  await expect(button).toHaveAttribute("aria-pressed", "true");
  if (native) expect(await page.evaluate(() => document.fullscreenElement?.classList.contains("page"))).toBe(true);
  await expectFits(page);
  // Enter on the focused HTML button toggles the view, not the intro selection.
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(button).toHaveAttribute("aria-pressed", "false");
  expect(await page.evaluate(() => window.__game.scene.isActive("intro"))).toBe(true);
  await button.evaluate(element => element.blur());
  await page.keyboard.press("f");
  await expect(button).toHaveAttribute("aria-pressed", "true");
  await startGame(page);
  await expectFits(page);
  await page.keyboard.down("ArrowRight");
  await page.waitForFunction(() => window.__game.scene.getScene("graybox").playerTile.x > 34);
  await page.keyboard.up("ArrowRight");
  await page.screenshot({ path: testInfo.outputPath("fullscreen-game.png") });
  await page.keyboard.press("Escape");
  await expect(button).toHaveAttribute("aria-pressed", "false");
  expect(await page.evaluate(() => window.__game.scene.getScene("graybox").isPaused)).toBe(false);
  expect(await page.evaluate(() => window.__game.scene.getScene("graybox").cameras.main.worldView.width)).toBe(320);
  await page.locator('[data-action="pause"]').click();
  expect(await page.evaluate(() => window.__game.scene.getScene("graybox").isPaused)).toBe(true);
  await button.evaluate(element => element.blur());
  await page.keyboard.press("f");
  await expect(button).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Escape");
  await expect(button).toHaveAttribute("aria-pressed", "false");
  expect(await page.evaluate(() => window.__game.scene.getScene("graybox").isPaused)).toBe(true);
  await expect.poll(() => page.locator("canvas").evaluate(canvas => {
    const rect = canvas.getBoundingClientRect();
    const parent = canvas.parentElement.getBoundingClientRect();
    return Math.abs(rect.left + rect.width / 2 - parent.left - parent.width / 2);
  })).toBeLessThan(1.5);
});

for (const reason of ["unavailable", "denied"]) {
  test(`expanded view remains usable when fullscreen is ${reason}`, async ({ page }, testInfo) => {
    await page.addInitScript(reason => {
      Object.defineProperty(document, "fullscreenEnabled", { configurable: true, value: reason === "denied" });
      Element.prototype.requestFullscreen = () => Promise.reject(new DOMException("Blocked by browser", "NotAllowedError"));
    }, reason);
    await boot(page);
    const button = page.locator(".fullscreen-button");
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".page")).toHaveAttribute("data-display-mode", "expanded");
    await expect(page.locator(".display-status")).toContainText("Grossansicht");
    expect(await page.evaluate(() => document.fullscreenElement)).toBeNull();
    await startGame(page);
    for (const [name, width, height] of [["portrait", 390, 844], ["landscape", 844, 390]]) {
      await page.setViewportSize({ width, height });
      await expectFits(page);
      await expect(button).toBeVisible();
      await page.screenshot({ path: testInfo.outputPath(`${name}-expanded.png`) });
    }
    if (testInfo.project.name.startsWith("mobile")) {
      await page.locator('[data-action="pause"]').tap();
      expect(await page.evaluate(() => window.__game.scene.getScene("graybox").isPaused)).toBe(true);
      await page.locator('[data-action="pause"]').tap();
    }
    await page.keyboard.press("Escape");
    await expect(button).toHaveAttribute("aria-pressed", "false");
    expect(await page.evaluate(() => window.__game.scene.getScene("graybox").isPaused)).toBe(false);
  });
}

test("mobile expanded view rotates portrait, maps touch input and survives orientation changes", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"), "Phone touch layout");
  await page.addInitScript(() => Object.defineProperty(document, "fullscreenEnabled", { configurable: true, value: false }));
  await page.setViewportSize({ width: 390, height: 844 });
  await boot(page);
  const stage = page.locator(".page");
  const button = page.locator(".fullscreen-button");
  await button.tap();
  await expect(stage).toHaveClass(/is-rotated/);
  await expectFits(page);
  const tapCanvas = async (x, y) => {
    const point = await page.locator("canvas").evaluate((canvas, { x, y }) => {
      const r = canvas.getBoundingClientRect();
      return { x: r.right - y / 240 * r.width, y: r.top + x / 320 * r.height };
    }, { x, y });
    await page.touchscreen.tap(point.x, point.y);
  };
  await tapCanvas(160, 171);
  await page.waitForFunction(() => window.__game.scene.getScene("intro").view === "help");
  await tapCanvas(160, 194);
  await page.waitForFunction(() => window.__game.scene.getScene("intro").view === "home");
  await tapCanvas(160, 151);
  await page.waitForFunction(() => window.__game.scene.isActive("graybox"));
  await expectFits(page);
  await page.locator('[data-direction="right"]').tap();
  await page.waitForFunction(() => window.__game.scene.getScene("graybox").playerTile.x > 34);
  await page.locator('[data-action="pause"]').tap();
  expect(await page.evaluate(() => window.__game.scene.getScene("graybox").isPaused)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("portrait-rotated-pause.png") });
  await tapCanvas(160, 124);
  await page.waitForFunction(() => window.__game.scene.isActive("intro"));
  await tapCanvas(160, 151);
  await page.waitForFunction(() => window.__game.scene.isActive("graybox"));
  await page.locator('[data-action="pause"]').tap();
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(stage).not.toHaveClass(/is-rotated/);
  await expect(stage).toHaveClass(/is-expanded/);
  await expectFits(page);
  expect(await page.evaluate(() => window.__game.scene.getScene("graybox").isPaused)).toBe(true);
  await page.setViewportSize({ width: 390, height: 700 });
  await expect(stage).toHaveClass(/is-rotated/);
  await expectFits(page);
  await page.locator('[data-action="restart"]').tap();
  await page.waitForFunction(() => !window.__game.scene.getScene("graybox").isPaused);
  await button.tap();
  await expect(stage).not.toHaveClass(/is-rotated|is-expanded/);
});

test("mobile landscape exit stays closed during browser viewport resize", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"), "Phone touch layout");
  await page.setViewportSize({ width: 844, height: 390 });
  await boot(page);
  await expect(page.locator(".page")).toHaveClass(/is-expanded/);
  await page.locator(".fullscreen-button").tap();
  await page.setViewportSize({ width: 844, height: 360 });
  await expect(page.locator(".page")).not.toHaveClass(/is-expanded/);
});
