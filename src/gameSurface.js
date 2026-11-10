export function bindGameSurface(target) {
  const abort = new AbortController();
  const clearSelection = () => {
    const selection = window.getSelection();
    if (selection?.rangeCount && (target.contains(selection.anchorNode) || target.contains(selection.focusNode))) {
      selection.removeAllRanges();
    }
  };
  for (const event of ["selectstart", "contextmenu", "dragstart"]) {
    target.addEventListener(event, event => { event.preventDefault(); clearSelection(); }, { signal: abort.signal });
  }
  target.addEventListener("pointerdown", clearSelection, { capture: true, signal: abort.signal });
  document.addEventListener("selectionchange", clearSelection, { signal: abort.signal });
  clearSelection();
  return { destroy() { abort.abort(); } };
}
