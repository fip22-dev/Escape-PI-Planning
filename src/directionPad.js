// Fixed four-way hit regions, with a neutral centre. Diagonal gaps keep the
// previous axis until the finger clearly enters another direction.
export function directionPadState(dx, dy, size, rotated = false, previous = null) {
  const x = rotated ? dy : dx;
  const y = rotated ? -dx : dy;
  if (size <= 0 || Math.abs(x) > size / 2 || Math.abs(y) > size / 2) return null;
  const centre = size / 6;
  if (Math.abs(x) <= centre && Math.abs(y) <= centre) return null;
  let horizontal = Math.abs(x) > Math.abs(y);
  if (previous?.x && Math.abs(y) < Math.abs(x) * 1.15) horizontal = true;
  if (previous?.y && Math.abs(x) < Math.abs(y) * 1.15) horizontal = false;
  return horizontal ? { x: Math.sign(x), y: 0 } : { x: 0, y: Math.sign(y) };
}

export function bindDirectionPad(element) {
  const abort = new AbortController();
  let active = null;
  let direction = null;
  const listen = (target, type, callback, options = {}) => target.addEventListener(type, callback, { ...options, signal: abort.signal });
  const zones = [...element.querySelectorAll('[data-pad-direction]')];
  const paint = () => {
    const name = direction?.x ? (direction.x > 0 ? 'right' : 'left')
      : direction?.y ? (direction.y > 0 ? 'down' : 'up') : null;
    for (const zone of zones) zone.classList.toggle('is-active', zone.dataset.padDirection === name);
  };
  const clear = () => {
    const previous = active;
    active = null; direction = null; paint();
    if (previous?.kind === "pointer" && element.hasPointerCapture?.(previous.id)) {
      element.releasePointerCapture(previous.id);
    }
  };
  const update = (clientX, clientY) => {
    const rect = element.getBoundingClientRect();
    const rotated = element.closest(".page")?.classList.contains("is-rotated") ?? false;
    direction = directionPadState(clientX - rect.left - rect.width / 2,
      clientY - rect.top - rect.height / 2, Math.min(rect.width, rect.height), rotated, direction);
    paint();
  };
  listen(element, "pointerdown", event => {
    if (event.button !== 0 || active) return;
    event.preventDefault(); active = { kind: "pointer", id: event.pointerId };
    try { element.setPointerCapture?.(event.pointerId); } catch { /* Window release remains a fallback. */ }
    update(event.clientX, event.clientY);
  });
  listen(window, "pointermove", event => {
    if (active?.kind !== "pointer" || active.id !== event.pointerId) return;
    event.preventDefault(); update(event.clientX, event.clientY);
  }, { passive: false });
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) {
    listen(type === "lostpointercapture" ? element : window, type, event => {
      if (active?.kind === "pointer" && active.id === event.pointerId) clear();
    });
  }
  // TouchEvents cover Safari and provide a fallback without double-processing
  // browsers that have already begun a PointerEvent gesture.
  listen(element, "touchstart", event => {
    if (active || !event.changedTouches.length) return;
    event.preventDefault();
    const touch = event.changedTouches[0];
    active = { kind: "touch", id: touch.identifier }; update(touch.clientX, touch.clientY);
  }, { passive: false });
  listen(element, "touchmove", event => {
    if (active?.kind !== "touch") return;
    const touch = [...event.changedTouches].find(t => t.identifier === active.id);
    if (touch) { event.preventDefault(); update(touch.clientX, touch.clientY); }
  }, { passive: false });
  for (const type of ["touchend", "touchcancel"]) {
    listen(element, type, event => {
      if (active?.kind === "touch" && [...event.changedTouches].some(t => t.identifier === active.id)) {
        event.preventDefault(); clear();
      }
    }, { passive: false });
  }
  listen(window, "blur", clear);
  listen(document, "visibilitychange", clear);
  paint();
  return { readDirection: () => direction, clear, destroy() { clear(); abort.abort(); } };
}
