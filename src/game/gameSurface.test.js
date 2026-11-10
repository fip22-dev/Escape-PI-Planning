import test from "node:test";
import assert from "node:assert/strict";
import { bindGameSurface } from "../gameSurface.js";

test("game surface dismisses game selection and context menus while preserving outside selection", () => {
  const previousWindow = globalThis.window, previousDocument = globalThis.document;
  const inside = {}, outside = {};
  const selection = { rangeCount: 1, anchorNode: inside, focusNode: inside,
    removeAllRanges() { this.rangeCount = 0; } };
  globalThis.window = { getSelection: () => selection };
  globalThis.document = new EventTarget();
  const target = new EventTarget();
  target.contains = node => node === inside;
  let binding;
  try {
    binding = bindGameSurface(target);
    assert.equal(selection.rangeCount, 0);
    for (const type of ["selectstart", "contextmenu", "dragstart"]) {
      const event = new Event(type, { cancelable: true });
      target.dispatchEvent(event);
      assert.equal(event.defaultPrevented, true);
    }
    selection.rangeCount = 1;
    document.dispatchEvent(new Event("selectionchange"));
    assert.equal(selection.rangeCount, 0);
    selection.rangeCount = 1; selection.anchorNode = selection.focusNode = outside;
    document.dispatchEvent(new Event("selectionchange"));
    assert.equal(selection.rangeCount, 1);
    binding.destroy();
    const event = new Event("contextmenu", { cancelable: true });
    target.dispatchEvent(event);
    assert.equal(event.defaultPrevented, false);
  } finally {
    binding?.destroy(); globalThis.window = previousWindow; globalThis.document = previousDocument;
  }
});
