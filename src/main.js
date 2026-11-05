import Phaser from "phaser";
import { GrayboxScene } from "./scenes/GrayboxScene.js";
import "./style.css";

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game-container",
  width: 320,
  height: 240,
  backgroundColor: "#172326",
  pixelArt: true,
  antialias: false,
  scene: [GrayboxScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});

window.addEventListener("beforeunload", () => game.destroy(true));
