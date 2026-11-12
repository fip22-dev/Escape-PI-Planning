import test from "node:test";
import assert from "node:assert/strict";
import { bindGameSurface } from "../gameSurface.js";

test("game surface dismisses game selection and context menus while preserving outside selection", () => {
  const previousWindow = globalThis.window, previousDocument = globalThis.document;
  const inside = {}, outside = {};
  const selection = { rangeCount: 1, anchorNode: inside, focusNode: inside,
    removeAllRanges() { this.rangeCount = 0; } };
  globalThis.window = { getSelection: () => selection };
  globalThis.document = Object.assign(new EventTarget(), { querySelector: () => null });
  const target = new EventTarget();
  target.closest = () => null;
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
    selection.getRangeAt = () => ({ intersectsNode: node => node === target });
    document.dispatchEvent(new Event("selectionchange"));
    assert.equal(selection.rangeCount, 0, "a body-level range enclosing the game must be cleared");
    binding.destroy();
    const event = new Event("contextmenu", { cancelable: true });
    target.dispatchEvent(event);
    assert.equal(event.defaultPrevented, false);
  } finally {
    binding?.destroy(); globalThis.window = previousWindow; globalThis.document = previousDocument;
  }
});


test("touch buttons cancel native gestures and activate once without ghost-click duplication", () => {
  const previousWindow = globalThis.window, previousDocument = globalThis.document;
  const target = new EventTarget();
  let clicks = 0, cancellations = 0;
  const button = { dataset: {}, disabled: false, closest: selector => selector === '.feedback-dialog' ? null : button, click: () => { clicks++; } };
  target.closest = selector => selector === '.feedback-dialog' ? null : button;
  target.contains = () => false;
  globalThis.window = { getSelection: () => ({ rangeCount: 0 }) };
  globalThis.document = Object.assign(new EventTarget(), { elementFromPoint: () => button, querySelector: () => null });
  const binding = bindGameSurface(target, { onCancel: () => { cancellations++; } });
  const touch = (type, x = 5) => {
    const event = new Event(type, { cancelable: true });
    Object.defineProperty(event, "changedTouches", { value: [{ identifier: 1, target: button, clientX: x, clientY: 5 }] });
    target.dispatchEvent(event);
    return event;
  };
  try {
    assert.equal(touch("touchstart").defaultPrevented, true);
    assert.equal(touch("touchend").defaultPrevented, true);
    assert.equal(clicks, 1);
    const ghost = new Event("click", { cancelable: true });
    Object.defineProperty(ghost, "detail", { value: 1 });
    target.dispatchEvent(ghost);
    assert.equal(ghost.defaultPrevented, true);
    touch("touchstart"); touch("touchmove", 40); touch("touchend", 40);
    assert.equal(clicks, 1, "dragging away must not activate a button");
    touch("touchstart"); touch("touchcancel"); touch("touchend");
    assert.equal(clicks, 1);
    assert.equal(cancellations, 1);
    const keyboardClick = new Event("click", { cancelable: true });
    Object.defineProperty(keyboardClick, "detail", { value: 0 });
    target.dispatchEvent(keyboardClick);
    assert.equal(keyboardClick.defaultPrevented, false);
  } finally { binding.destroy(); globalThis.window = previousWindow; globalThis.document = previousDocument; }
});
