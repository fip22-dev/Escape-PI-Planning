import { bindDirectionPad } from "./directionPad.js";

export function bindTouchControls({ onPause, onRestart }) {
  const abort = new AbortController();
  const pad = bindDirectionPad(document.querySelector(".touch-dpad"));
  const listen = (target, event, callback) => target.addEventListener(event, callback, { signal: abort.signal });
  const clear = () => pad.clear();
  listen(document.querySelector('[data-action="pause"]'), 'click', () => { clear(); onPause(); });
  listen(document.querySelector('[data-action="restart"]'), 'click', () => { clear(); onRestart(); });
  return {
    readDirection: () => pad.readDirection(),
    clear,
    destroy() { pad.destroy(); abort.abort(); },
  };
}
