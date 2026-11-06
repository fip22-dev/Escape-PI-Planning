const directions = {
  up: { x: 0, y: -1 }, down: { x: 0, y: 1 },
  left: { x: -1, y: 0 }, right: { x: 1, y: 0 },
};

export function bindTouchControls({ onPause, onRestart }) {
  const abort = new AbortController();
  const active = new Map();
  let pending = null;
  const buttons = [...document.querySelectorAll('[data-direction]')];
  const listen = (target, event, callback) => target.addEventListener(event, callback, { signal: abort.signal });
  const paint = () => buttons.forEach(button => button.classList.toggle('held', [...active.values()].includes(button.dataset.direction)));
  const clear = () => { active.clear(); pending = null; paint(); };
  for (const button of buttons) {
    listen(button, 'pointerdown', event => {
      if (event.button !== 0) return;
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      active.set(event.pointerId, button.dataset.direction);
      pending = button.dataset.direction;
      paint();
    });
    listen(button, 'pointerup', event => { active.delete(event.pointerId); paint(); });
    listen(button, 'pointercancel', clear);
    listen(button, 'lostpointercapture', event => { active.delete(event.pointerId); paint(); });
    listen(button, 'keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); pending = button.dataset.direction; }
    });
  }
  listen(window, 'blur', clear);
  listen(document, 'visibilitychange', clear);
  listen(document.querySelector('[data-action="pause"]'), 'click', () => { clear(); onPause(); });
  listen(document.querySelector('[data-action="restart"]'), 'click', () => { clear(); onRestart(); });
  return {
    readDirection() {
      const direction = pending ?? [...active.values()].at(-1);
      pending = null;
      return directions[direction] ?? null;
    },
    clear,
    destroy() { clear(); abort.abort(); },
  };
}
