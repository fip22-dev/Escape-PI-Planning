import Phaser from "phaser";
import { IntroScene } from "./scenes/IntroScene.js";
import { GrayboxScene } from "./scenes/GrayboxScene.js";
import "./style.css";

window.addEventListener("game:mode", event => {
  document.querySelector(".page")?.classList.toggle("is-menu", event.detail?.mode === "menu");
});

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game-container",
  width: 320,
  height: 240,
  backgroundColor: "#172326",
  pixelArt: true,
  antialias: false,
  scene: [IntroScene, GrayboxScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});

window.addEventListener("beforeunload", () => game.destroy(true));
