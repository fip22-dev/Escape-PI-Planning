import { bindJoystick } from "./joystick.js";

export function bindTouchControls({ onPause, onRestart }) {
  const abort = new AbortController();
  const joystick = bindJoystick(document.querySelector(".touch-joystick"));
  const listen = (target, event, callback) => target.addEventListener(event, callback, { signal: abort.signal });
  const clear = () => joystick.clear();
  listen(document.querySelector('[data-action="pause"]'), 'click', () => { clear(); onPause(); });
  listen(document.querySelector('[data-action="restart"]'), 'click', () => { clear(); onRestart(); });
  return {
    readDirection: () => joystick.readDirection(),
    clear,
    destroy() { joystick.destroy(); abort.abort(); },
  };
}
