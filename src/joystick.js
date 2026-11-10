// Keep grid movement cardinal. A small dead zone and axis hysteresis avoid
// accidental steps at the centre and direction chatter near a diagonal.
export function joystickState(dx, dy, radius, rotated = false, previous = null) {
  const x = rotated ? dy : dx;
  const y = rotated ? -dx : dy;
  const distance = Math.hypot(x, y);
  const factor = distance > radius && distance > 0 ? radius / distance : 1;
  let direction = null;
  if (radius > 0 && distance >= radius * 0.22) {
    let horizontal = Math.abs(x) > Math.abs(y);
    if (previous?.x && Math.abs(y) < Math.abs(x) * 1.2) horizontal = true;
    if (previous?.y && Math.abs(x) < Math.abs(y) * 1.2) horizontal = false;
    direction = horizontal ? { x: Math.sign(x), y: 0 } : { x: 0, y: Math.sign(y) };
  }
  return { x: x * factor, y: y * factor, direction };
}

export function bindJoystick(element) {
  const abort = new AbortController();
  let active = null;
  let direction = null;
  const listen = (target, type, callback, options = {}) => target.addEventListener(type, callback, { ...options, signal: abort.signal });
  const paint = (x, y) => {
    element.style.setProperty("--stick-x", `${x}px`);
    element.style.setProperty("--stick-y", `${y}px`);
    element.classList.toggle("held", active !== null);
  };
  const clear = () => {
    const previous = active;
    active = null; direction = null; paint(0, 0);
    if (previous?.kind === "pointer" && element.hasPointerCapture?.(previous.id)) {
      element.releasePointerCapture(previous.id);
    }
  };
  const update = (clientX, clientY) => {
    const rect = element.getBoundingClientRect();
    const rotated = element.closest(".page")?.classList.contains("is-rotated") ?? false;
    const state = joystickState(clientX - rect.left - rect.width / 2,
      clientY - rect.top - rect.height / 2, Math.min(rect.width, rect.height) * 0.3, rotated, direction);
    direction = state.direction; paint(state.x, state.y);
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
  paint(0, 0);
  return { readDirection: () => direction, clear, destroy() { clear(); abort.abort(); } };
}
