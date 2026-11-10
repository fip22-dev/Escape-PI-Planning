import test from "node:test";
import assert from "node:assert/strict";
import { bindRotatedLayout } from "../rotatedLayout.js";

test("clockwise canvas maps all four touch corners and centre back to game coordinates", () => {
  const previousWindow = globalThis.window;
  globalThis.window = { scrollX: 9, scrollY: 27 };
  let rotated = true;
  let delegated = false;
  const scale = {
    baseSize: { width: 1280, height: 960 },
    canvasBounds: { left: 20, top: 100 }, displayScale: { x: 4, y: 2.25 },
    getParentBounds() { delegated = true; }, updateCenter() {},
  };
  const transformPointer = function (pointer, x, y) {
    pointer.x = (x - scale.canvasBounds.left) * scale.displayScale.x;
    pointer.y = (y - scale.canvasBounds.top) * scale.displayScale.y;
  };
  const game = { scale, input: { transformPointer }, canvas: {
    getBoundingClientRect: () => ({ left: 20, top: 100, right: 340, width: 320, height: 1280 / 3 }),
  } };
  const binding = bindRotatedLayout(game, { classList: { contains: () => rotated } });
  try {
    for (const [clientX, clientY, expectedX, expectedY] of [
      [340, 100, 0, 0], [340, 100 + 1280 / 3, 1280, 0],
      [20, 100, 0, 960], [20, 100 + 1280 / 3, 1280, 960],
      [180, 100 + 640 / 3, 640, 480],
    ]) {
      const pointer = {};
      game.input.transformPointer(pointer, clientX + 9, clientY + 27, false);
      assert.ok(Math.abs(pointer.x - expectedX) < 1e-8);
      assert.ok(Math.abs(pointer.y - expectedY) < 1e-8);
    }
    rotated = false;
    scale.getParentBounds();
    assert.equal(delegated, true);
    const pointer = {};
    game.input.transformPointer(pointer, 100, 200, false);
    assert.deepEqual(pointer, { x: 320, y: 225 });
    binding.destroy();
    assert.equal(game.input.transformPointer, transformPointer);
  } finally { globalThis.window = previousWindow; }
});
