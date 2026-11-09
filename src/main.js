import Phaser from "phaser";
import { IntroScene } from "./scenes/IntroScene.js";
import { GrayboxScene } from "./scenes/GrayboxScene.js";
import { RENDER_SCALE, VIEW_WIDTH, VIEW_HEIGHT } from "./game/rendering.js";
import { bindFullscreen } from "./fullscreen.js";
import "./style.css";

window.addEventListener("game:mode", event => {
  document.querySelector(".page")?.classList.toggle("is-menu", event.detail?.mode === "menu");
  // Showing/hiding the page header moves the canvas without resizing the
  // viewport. Refresh its cached bounds before the next pointer interaction.
  requestAnimationFrame(() => game.scale.refresh());
});

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game-container",
  width: VIEW_WIDTH * RENDER_SCALE,
  height: VIEW_HEIGHT * RENDER_SCALE,
  backgroundColor: "#172326",
  pixelArt: false,
  antialias: true,
  scene: [IntroScene, GrayboxScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});

const fullscreen = bindFullscreen({
  target: document.querySelector(".page"),
  button: document.querySelector(".fullscreen-button"),
  status: document.querySelector(".display-status"),
  onLayoutChange() {
    for (const scene of game.scene.scenes) {
      scene.touchControls?.clear();
      scene.input?.keyboard?.resetKeys();
    }
    requestAnimationFrame(() => game.scale.refresh());
  },
});

window.addEventListener("beforeunload", () => { fullscreen.destroy(); game.destroy(true); });
