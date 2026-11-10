import Phaser from "phaser";
import { IntroScene } from "./scenes/IntroScene.js";
import { GrayboxScene } from "./scenes/GrayboxScene.js";
import { RENDER_SCALE, VIEW_WIDTH, VIEW_HEIGHT } from "./game/rendering.js";
import { bindFullscreen } from "./fullscreen.js";
import { bindRotatedLayout } from "./rotatedLayout.js";
import { bindGameSurface } from "./gameSurface.js";
import "./style.css";

window.addEventListener("game:mode", event => {
  document.querySelector(".page")?.classList.toggle("is-menu", event.detail?.mode === "menu");
  // Showing/hiding the page header moves the canvas without resizing the
  // viewport. Refresh its cached bounds before the next pointer interaction.
  requestAnimationFrame(refreshLayout);
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

function refreshLayout() {
  const container = document.querySelector("#game-container");
  const mobileExpanded = document.querySelector(".page").classList.contains("is-mobile-landscape");
  const height = VIEW_HEIGHT * RENDER_SCALE;
  const width = mobileExpanded && container.clientHeight
    ? Math.max(VIEW_WIDTH * RENDER_SCALE, Math.round(container.clientWidth / container.clientHeight * height))
    : VIEW_WIDTH * RENDER_SCALE;
  game.scale.getParentBounds();
  if (game.scale.width !== width) game.scale.setGameSize(width, height);
  else game.scale.refresh();
}

const rotatedLayout = bindRotatedLayout(game, document.querySelector(".page"));
const gameSurface = bindGameSurface(document.querySelector(".page"));

const fullscreen = bindFullscreen({
  target: document.querySelector(".page"),
  button: document.querySelector(".fullscreen-button"),
  status: document.querySelector(".display-status"),
  onLayoutChange() {
    for (const scene of game.scene.scenes) {
      scene.touchControls?.clear();
      scene.input?.keyboard?.resetKeys();
    }
    requestAnimationFrame(refreshLayout);
  },
});

window.addEventListener("beforeunload", () => { fullscreen.destroy(); gameSurface.destroy(); rotatedLayout.destroy(); game.destroy(true); });
