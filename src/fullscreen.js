export function bindFullscreen({ target, button, status, onLayoutChange }) {
  const abort = new AbortController();
  let expanded = false;
  let dismissedLandscape = false;
  const landscapePhone = () => matchMedia("(orientation: landscape) and (pointer: coarse) and (max-height: 600px)").matches;
  let pending = false;
  let wasNative = false;
  let ignoreEscapeUntil = 0;
  const nativeAvailable = () => Boolean(document.fullscreenEnabled && target.requestFullscreen);
  const sync = () => {
    const native = document.fullscreenElement === target;
    // Some browsers deliver Escape only after they have already left fullscreen.
    if (wasNative && !native) ignoreEscapeUntil = performance.now() + 150;
    wasNative = native;
    const active = native || expanded;
    const viewport = window.visualViewport;
    const width = viewport?.width ?? innerWidth;
    const height = viewport?.height ?? innerHeight;
    const mobile = matchMedia("(pointer: coarse)").matches && Math.min(width, height) <= 600;
    target.style.setProperty("--mobile-width", `${width}px`);
    target.style.setProperty("--mobile-height", `${height}px`);
    target.classList.toggle("is-mobile-landscape", active && mobile);
    target.classList.toggle("is-rotated", active && mobile && height > width);
    target.classList.toggle("is-expanded", active);
    document.body.classList.toggle("has-expanded-game", active);
    target.dataset.displayMode = native ? "fullscreen" : expanded ? "expanded" : "normal";
    button.setAttribute("aria-pressed", String(active));
    button.textContent = native ? "Vollbild verlassen" : expanded ? "Ansicht verkleinern"
      : nativeAvailable() ? "Vollbild" : "Grossansicht";
    button.disabled = pending;
    if (!active) status.textContent = "";
    onLayoutChange();
  };
  const onOrientation = () => {
    const shouldExpand = landscapePhone();
    if (!shouldExpand) dismissedLandscape = false;
    if (shouldExpand && !dismissedLandscape && !expanded && document.fullscreenElement !== target) {
      expanded = true;
    }
    sync();
  };
  const toggle = async () => {
    if (pending) return;
    pending = true;
    button.disabled = true;
    try {
      if (document.fullscreenElement === target) {
        dismissedLandscape = landscapePhone();
        await document.exitFullscreen();
      }
      else if (expanded) { expanded = false; dismissedLandscape = landscapePhone(); }
      else if (nativeAvailable()) {
        try {
          await target.requestFullscreen();
        } catch {
          expanded = true;
          status.textContent = "Vollbild nicht verfügbar – Grossansicht aktiv.";
        }
      } else {
        expanded = true;
        status.textContent = "Grossansicht aktiv.";
      }
    } catch {
      status.textContent = "Vollbild bitte mit Esc verlassen.";
    } finally {
      pending = false;
      sync();
    }
  };
  const onKey = event => {
    const editable = event.target?.closest?.("input, textarea, select, [contenteditable=true]");
    if (editable || event.altKey || event.ctrlKey || event.metaKey) return;
    const fullscreenKey = event.code === "KeyF"
      || (event.target === button && ["Enter", "Space"].includes(event.code));
    const escape = event.code === "Escape" && (document.fullscreenElement === target || expanded);
    if (event.code === "Escape" && !escape && performance.now() < ignoreEscapeUntil) {
      event.preventDefault();
      event.stopImmediatePropagation();
    } else if (fullscreenKey || escape) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!event.repeat) void toggle();
    }
  };
  button.addEventListener("click", () => { void toggle(); }, { signal: abort.signal });
  document.addEventListener("fullscreenchange", sync, { signal: abort.signal });
  window.addEventListener("keydown", onKey, { capture: true, signal: abort.signal });
  window.addEventListener("orientationchange", onOrientation, { signal: abort.signal });
  window.addEventListener("resize", onOrientation, { signal: abort.signal });
  window.visualViewport?.addEventListener("resize", onOrientation, { signal: abort.signal });
  onOrientation();
  sync();
  return { destroy() { abort.abort(); } };
}
