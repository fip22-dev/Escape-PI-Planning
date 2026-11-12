export function bindGameSurface(target, { onCancel = () => {} } = {}) {
  const abort = new AbortController();
  const touches = new Map();
  let activating = false;
  let lastTouchButton = null;
  let ignoreClickUntil = 0;
  const clearSelection = () => {
    if (document.querySelector('.feedback-dialog[open]')) return;
    const selection = window.getSelection();
    const intersects = selection?.rangeCount && (target.contains(selection.anchorNode) || target.contains(selection.focusNode)
      || Array.from({ length: selection.rangeCount }, (_, i) => selection.getRangeAt?.(i))
        .some(range => range?.intersectsNode(target)));
    if (intersects) {
      selection.removeAllRanges();
      onCancel();
    }
  };
  for (const event of ["selectstart", "contextmenu", "dragstart"]) {
    target.addEventListener(event, event => { if (document.querySelector('.feedback-dialog[open]')) return; event.preventDefault(); clearSelection(); onCancel(); }, { signal: abort.signal });
  }
  // Cancel Safari's native long-press/double-tap handling after canvas listeners
  // have received the event. Buttons are activated explicitly on touch release.
  target.addEventListener("touchstart", event => {
    if (event.target.closest('.feedback-dialog')) return;
    if (!event.target.closest("canvas, button, .touch-controls, .game-toolbar")) return;
    if (event.cancelable) event.preventDefault();
    clearSelection();
    for (const touch of event.changedTouches) touches.set(touch.identifier, {
      button: touch.target.closest("button"), x: touch.clientX, y: touch.clientY, moved: false,
    });
  }, { passive: false, signal: abort.signal });
  target.addEventListener("touchmove", event => {
    for (const touch of event.changedTouches) {
      const start = touches.get(touch.identifier);
      if (!start) continue;
      if (event.cancelable) event.preventDefault();
      start.moved ||= Math.hypot(touch.clientX - start.x, touch.clientY - start.y) > 12;
    }
  }, { passive: false, signal: abort.signal });
  target.addEventListener("touchend", event => {
    for (const touch of event.changedTouches) {
      const start = touches.get(touch.identifier);
      touches.delete(touch.identifier);
      if (!start) continue;
      if (event.cancelable) event.preventDefault();
      const button = start.button;
      if (!button || button.disabled || button.dataset.direction || start.moved) continue;
      if (document.elementFromPoint(touch.clientX, touch.clientY)?.closest("button") !== button) continue;
      lastTouchButton = button; ignoreClickUntil = performance.now() + 700;
      activating = true;
      try { button.click(); } finally { activating = false; }
    }
  }, { passive: false, signal: abort.signal });
  target.addEventListener("touchcancel", () => { touches.clear(); clearSelection(); onCancel(); }, { signal: abort.signal });
  target.addEventListener("click", event => {
    if (!activating && event.detail > 0 && performance.now() < ignoreClickUntil
      && event.target.closest("button") === lastTouchButton) {
      event.preventDefault(); event.stopImmediatePropagation();
    }
  }, { capture: true, signal: abort.signal });
  target.addEventListener("pointerdown", clearSelection, { capture: true, signal: abort.signal });
  document.addEventListener("selectionchange", clearSelection, { signal: abort.signal });
  clearSelection();
  return { destroy() { touches.clear(); abort.abort(); } };
}
