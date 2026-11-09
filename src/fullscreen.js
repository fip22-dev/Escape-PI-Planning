export function bindFullscreen({ target, button, status, onLayoutChange }) {
  const abort = new AbortController();
  let expanded = false;
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
  const toggle = async () => {
    if (pending) return;
    pending = true;
    button.disabled = true;
    try {
      if (document.fullscreenElement === target) await document.exitFullscreen();
      else if (expanded) expanded = false;
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
  sync();
  return { destroy() { abort.abort(); } };
}
