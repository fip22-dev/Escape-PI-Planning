import Phaser from "phaser";
import { getAudioEngine } from "../game/audio.js";
import { configureRendering, RENDER_SCALE } from "../game/rendering.js";

const W = 320;
const H = 240;
const C = {
  bg: 0x203735,
  shadow: 0x142523,
  panel: 0x263d39,
  panelLight: 0x3c574c,
  cream: "#f2e6c8",
  muted: "#bac8ac",
  gold: 0xe6c477,
  orange: 0xe18455,
  dark: 0x243333,
  wall: 0x566258,
  floor: 0x9b8a68,
  blue: 0x5793a0,
};

export class IntroScene extends Phaser.Scene {
  constructor() {
    super("intro");
    this.audio = getAudioEngine();
  }

  create() {
    configureRendering(this);
    document.querySelector(".page")?.classList.add("is-menu");
    window.dispatchEvent(new CustomEvent("game:mode", { detail: { mode: "menu" } }));
    this.drawOffice();
    this.view = "home";
    this.selection = 0;
    this.startPending = false;
    this.buildHomeMenu();
    this.handleMenuKey = event => {
      if (event.repeat) return;
      const key = event.code || event.key;
      const keyCode = event.keyCode;
      const isUp = key === "ArrowUp" || key === "KeyW" || keyCode === 38 || keyCode === 87;
      const isDown = key === "ArrowDown" || key === "KeyS" || keyCode === 40 || keyCode === 83;
      if (isUp || isDown) {
        event.preventDefault();
        event.stopImmediatePropagation();
        void this.audio.unlock().catch(() => false);
        this.moveSelection({ code: isUp ? "ArrowUp" : "ArrowDown" });
      } else if (key === "Enter" || key === "NumpadEnter" || keyCode === 13
        || key === "Space" || key === " " || keyCode === 32) {
        event.preventDefault();
        event.stopImmediatePropagation();
        this.confirmSelection(event);
      } else if (key === "Escape" || keyCode === 27) {
        event.preventDefault();
        event.stopImmediatePropagation();
        this.goBack();
      }
    };
    window.addEventListener("keydown", this.handleMenuKey, true);
    this.input.on("wheel", this.handleHelpWheel, this);
    this.input.on("pointerdown", this.startHelpScroll, this);
    this.input.on("pointermove", this.dragHelpScroll, this);
    this.input.on("pointerup", this.stopHelpScroll, this);
    this.input.on("pointerupoutside", this.stopHelpScroll, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener("keydown", this.handleMenuKey, true);
      this.input.off("wheel", this.handleHelpWheel, this);
      this.input.off("pointerdown", this.startHelpScroll, this);
      this.input.off("pointermove", this.dragHelpScroll, this);
      this.input.off("pointerup", this.stopHelpScroll, this);
      this.input.off("pointerupoutside", this.stopHelpScroll, this);
    });
  }

  drawOffice() {
    this.cameras.main.setBackgroundColor(C.bg);
    this.officeBackdrop = this.add.graphics().setDepth(-1);
    this.drawWideBackdrop();
    const g = this.add.graphics();
    this.officeArt = g;
    g.fillStyle(C.wall).fillRect(0, 0, W, 140);
    g.fillStyle(0x657064).fillRect(0, 0, W, 5);
    for (let x = 8; x < W; x += 24) {
      g.fillStyle(0x48554d).fillRect(x, 14, 1, 116);
    }
    // Window, dark evening outside, and a small office plant.
    g.fillStyle(0x253b40).fillRect(19, 17, 69, 46);
    g.fillStyle(0x729092).fillRect(22, 20, 63, 40);
    g.fillStyle(0x273d46).fillRect(25, 23, 57, 34);
    g.fillStyle(0xd8bd73).fillRect(69, 28, 3, 3);
    g.fillStyle(0x80916b).fillRect(52, 32, 4, 4);
    g.fillStyle(0x31443e).fillRect(48, 37, 11, 20);
    g.fillStyle(0x78934f).fillRect(45, 35, 5, 7);
    g.fillStyle(0xa7b866).fillRect(53, 30, 5, 8);
    g.fillStyle(0x536644).fillRect(59, 37, 6, 5);
    g.fillStyle(0x89915f).fillRect(44, 56, 22, 3);
    // PI board with notes and the forever-open planning card.
    g.fillStyle(0x594936).fillRect(110, 19, 72, 40);
    g.fillStyle(0xd5c49e).fillRect(113, 22, 66, 34);
    g.fillStyle(0x6c7c6e).fillRect(119, 28, 14, 10);
    g.fillStyle(C.orange).fillRect(137, 27, 14, 13);
    g.fillStyle(0x7b98a0).fillRect(155, 31, 17, 9);
    g.fillStyle(0x4b6c58).fillRect(118, 42, 21, 9);
    g.fillStyle(0x725a3e).fillRect(143, 44, 29, 7);
    g.fillStyle(0xffedb4).fillRect(142, 30, 4, 2);
    // Desk, laptop, coffee and a waiting PI checklist.
    g.fillStyle(C.shadow).fillRect(11, 94, 298, 9);
    g.fillStyle(0x704f38).fillRect(11, 89, 298, 7);
    g.fillStyle(0xa67a4d).fillRect(16, 88, 287, 3);
    g.fillStyle(0x33464b).fillRect(42, 68, 54, 20);
    g.fillStyle(0x67909a).fillRect(45, 70, 48, 15);
    g.fillStyle(0x35454a).fillRect(39, 86, 61, 3);
    g.fillStyle(0xd5c49e).fillRect(127, 72, 34, 15);
    g.fillStyle(0x78934f).fillRect(131, 76, 9, 2);
    g.fillStyle(0xe18455).fillRect(144, 76, 12, 2);
    g.fillStyle(0x516d75).fillRect(207, 75, 18, 12);
    g.fillStyle(0xe6c477).fillRect(211, 72, 10, 4);
    g.fillStyle(0x3d3028).fillRect(225, 79, 2, 7);
    g.fillStyle(0xf2e6c8).fillRect(226, 86, 8, 2);
    g.fillStyle(0x81603e).fillRect(14, 103, 7, 28);
    g.fillStyle(0x81603e).fillRect(298, 103, 7, 28);
    g.fillStyle(0x9b8a68).fillRect(0, 132, W, 4);
    g.fillStyle(0x806f54).fillRect(0, 137, W, H - 137);
    for (let x = 0; x < W; x += 16) {
      g.fillStyle(0x6d624d, 0.5).fillRect(x, 138, 1, H - 138);
    }
    // Hero peeking from behind the desk.
    g.fillStyle(0x463b33).fillRect(267, 73, 12, 5);
    g.fillStyle(0xe9bd91).fillRect(269, 78, 8, 8);
    g.fillStyle(C.blue).fillRect(266, 86, 14, 14);
    g.fillStyle(0x354f56).fillRect(268, 98, 4, 5);
    g.fillStyle(0x354f56).fillRect(275, 98, 4, 5);
    // Vignette-like lower edge. The art sits below the title and subtitle band.
    g.fillStyle(C.shadow, 0.55).fillRect(0, 145, W, 95);
    g.setPosition(0, 52);
  }

  buildHomeMenu() {
    this.clearMenu();
    this.view = "home";
    this.selection = Math.min(this.selection, 3);
    this.add.text(160, 14, "ESCAPE PI PLANNING", {
      resolution: RENDER_SCALE, fontFamily: "Courier New, monospace", fontSize: "16px", fontStyle: "bold", color: C.cream,
      stroke: "#203735", strokeThickness: 3,
    }).setOrigin(0.5).setDepth(10);
    this.add.text(160, 42, "Schaffst du es, dich vor dem PI Planning zu drücken,\nohne erwischt zu werden?", {
      resolution: RENDER_SCALE, fontFamily: "Courier New, monospace", fontSize: "8px", color: C.cream,
      align: "center", lineSpacing: 1,
    }).setOrigin(0.5).setDepth(10);
    this.add.rectangle(160, 184, 198, 92, C.panel, 0.97).setStrokeStyle(2, C.gold).setDepth(10);
    this.homeItems = ["SPIEL STARTEN", "SO GEHT'S", "EINSTELLUNGEN", "INFOS & CREDITS"];
    this.homeRows = this.homeItems.map((label, index) => this.add.rectangle(160, 151 + index * 20, 180, 16, C.panel)
      .setDepth(11).setInteractive({ useHandCursor: true })
      .on("pointerover", () => { this.selection = index; this.updateHomeSelection(); })
      .on("pointerdown", () => { this.selection = index; this.confirmSelection(); }));
    this.homeLabels = this.homeItems.map((label, index) => this.add.text(160, 151 + index * 20, label, {
      resolution: RENDER_SCALE, fontFamily: "Courier New, monospace", fontSize: index === 0 ? "11px" : "10px",
      fontStyle: index === 0 ? "bold" : "normal", color: C.cream,
    }).setOrigin(0.5).setDepth(12));
    this.homeArrow = this.add.text(75, 151, "▶", {
      resolution: RENDER_SCALE, fontFamily: "monospace", fontSize: "8px", color: C.gold,
    }).setOrigin(0.5).setDepth(12);
    this.add.text(160, 235, "WASD / ↑↓ wählen · Enter starten · Esc zurück", {
      resolution: RENDER_SCALE, fontFamily: "Courier New, monospace", fontSize: "7px", color: C.muted,
    }).setOrigin(0.5).setDepth(10);
    this.updateHomeSelection();
  }

  clearMenu() {
    // Every view is rebuilt from the single persistent office illustration.
    this.helpMask?.destroy();
    this.helpMask = null;
    this.children.list.slice().forEach(child => {
      if (child !== this.officeArt && child !== this.officeBackdrop) child.destroy();
    });
  }

  drawWideBackdrop() {
    if (!this.officeBackdrop) return;
    const width = this.scale.width / RENDER_SCALE;
    const left = (W - width) / 2;
    this.officeBackdrop.clear().fillStyle(C.wall).fillRect(left, 0, width, 137)
      .fillStyle(0x806f54).fillRect(left, 137, width, H - 137);
    for (let x = Math.floor(left / 24) * 24; x < left + width; x += 24) {
      this.officeBackdrop.fillStyle(0x48554d).fillRect(x, 14, 1, 116);
    }
    for (let x = Math.floor(left / 16) * 16; x < left + width; x += 16) {
      this.officeBackdrop.fillStyle(0x6d624d, 0.5).fillRect(x, 138, 1, H - 138);
    }
  }

  markMenu(object) {
    object.setData("menuObject", true);
    return object;
  }

  updateHomeSelection() {
    this.homeRows?.forEach((row, index) => {
      row.setFillStyle(index === this.selection ? C.panelLight : C.panel, 1);
      row.setStrokeStyle(index === this.selection ? 1 : 0, index === this.selection ? C.gold : C.panel);
    });
    this.homeLabels?.forEach((label, index) => {
      label.setColor(index === this.selection ? "#ffe3a1" : C.cream);
      label.setScale(1);
    });
    this.homeArrow?.setY(151 + this.selection * 20);
  }

  moveSelection(event) {
    if (event?.repeat) return;
    if (this.view === "home") {
      const direction = event?.code === "ArrowUp" || event?.code === "KeyW" ? -1 : 1;
      this.selection = (this.selection + direction + this.homeItems.length) % this.homeItems.length;
      this.updateHomeSelection();
    } else if (this.view === "settings") {
      const direction = event?.code === "ArrowUp" || event?.code === "KeyW" ? -1 : 1;
      this.selection = (this.selection + direction + this.settingsRows.length) % this.settingsRows.length;
      this.updatePanelSelection();
    } else if (this.view === "help") {
      const direction = event?.code === "ArrowUp" || event?.code === "KeyW" ? -1 : 1;
      this.scrollHelp(direction * 20);
    }
  }

  confirmSelection(event) {
    if (event?.repeat) return;
    const audioReady = this.audio.unlock().catch(() => false);
    if (this.view === "home") {
      if (this.selection === 0) {
        if (this.startPending) return;
        this.startPending = true;
        audioReady.then(ready => { if (ready) this.audio.play("start"); });
        this.homeRows?.forEach(row => row.disableInteractive());
        // Let Phaser finish the current pointer/key event before switching scenes.
        this.time.delayedCall(0, () => this.scene.start("graybox", { showStartGuide: true }));
      } else if (this.selection === 1) this.showPanel("help");
      else if (this.selection === 2) this.showPanel("settings");
      else this.showPanel("credits");
    } else if (this.view === "settings") {
      if (this.selection < 2) {
        const setting = ["music", "sounds"][this.selection];
        this.audio.toggle(setting);
        this.updateSettingsText();
      } else this.buildHomeMenu();
    } else this.buildHomeMenu();
  }

  showPanel(view) {
    this.clearMenu();
    this.view = view;
    this.selection = 0;
    this.markMenu(this.add.rectangle(160, 128, 282, 164, C.panel, 0.99).setStrokeStyle(2, C.gold).setDepth(20));
    const headings = {
      help: "SO GEHT'S",
      settings: "EINSTELLUNGEN",
      credits: "INFOS & CREDITS",
    };
    this.markMenu(this.add.text(160, 58, headings[view], {
      resolution: RENDER_SCALE, fontFamily: "Courier New, monospace", fontSize: "12px", fontStyle: "bold", color: "#ffe3a1",
    }).setOrigin(0.5).setDepth(21));
    if (view === "help") {
      this.buildHelpPanel();
    } else if (view === "credits") {
      this.markMenu(this.add.text(31, 91,
        "Ein Fluchtspiel über Kaffee und den Versuch,\nsich elegant vor dem PI Planning zu drücken.\n\nGrafik und Musik: eigens für dieses Spiel\nTechnik: Phaser · Vite\n\nVersion 0.1.0", {
          resolution: RENDER_SCALE, fontFamily: "Courier New, monospace", fontSize: "8px", color: C.cream,
          lineSpacing: 4,
        }).setDepth(21));
      this.addBackButton();
    } else this.buildSettingsPanel();
  }

  buildHelpPanel() {
    const left = 25;
    const top = 76;
    const width = 260;
    const height = 82;
    const maskGraphics = this.markMenu(this.add.graphics().setDepth(21));
    maskGraphics.fillStyle(0xffffff).fillRect(left, top, width, height);
    maskGraphics.setVisible(false);
    this.helpMask = maskGraphics.createGeometryMask();
    const addHelpText = (y, text, style) => {
      const object = this.markMenu(this.add.text(left + 6, y, text, {
        resolution: RENDER_SCALE, fontFamily: "Courier New, monospace",
        fontSize: style.fontSize,
        fontStyle: style.fontStyle,
        color: style.color,
        lineSpacing: 2,
        wordWrap: { width: width - 12 },
      }).setDepth(22).setMask(this.helpMask));
      this.helpContent.push(object);
      return object;
    };
    this.helpContent = [];
    addHelpText(top + 2, "REGELN", { fontSize: "9px", fontStyle: "bold", color: "#ffe3a1" });
    const rulesText = addHelpText(top + 15,
      "Finde und sammle in jedem der sieben Teamzimmer einen Schlüssel. Erst mit allen sieben Team-Schlüsseln kannst du den Ausgang öffnen und entkommen.\nAufnahme: Laufe über den goldenen Schlüssel.\nBei jedem neuen Versuch liegen die Schlüssel an neuen zufälligen Orten im jeweiligen Teamzimmer.\nHUD: Zeigt nur Schlüssel 0/7 bis 7/7.\nZeit: 180 Sekunden ab Verlassen des PI-Raums.\nSteuerung: WASD/Pfeiltasten oder Touch.\nPause: ESC; Schlüssel bleiben erhalten.\nNeustart: Alle Schlüssel werden zurückgesetzt.\nTarnung: Nutze Wände, Möbel und Personen,\ndamit du nicht gesehen wirst.",
      { fontSize: "8px", color: C.cream });
    const rolesHeading = addHelpText(rulesText.y + rulesText.height + 4,
      "ROLLEN", { fontSize: "9px", fontStyle: "bold", color: "#ffe3a1" });
    const rolesText = addHelpText(rolesHeading.y + rolesHeading.height + 2,
      "RTE: plant deinen Abgang als Abhängigkeit.\nP&T: fragt, ob sich Flucht gut anfühlt.\nBO: prüft erst den Business Value.\nPM: schiebt deinen Heimweg aufs nächste PI.\nPO: hat noch eine Akzeptanzkriterien-Frage.\nScrum Master: lädt zur Flucht-Retrospektive.",
      { fontSize: "8px", color: C.cream });
    this.helpContentPositions = this.helpContent.map(object => object.y);
    const contentBottom = rolesText.y + rolesText.height;
    this.helpScrollTop = top;
    this.helpScrollHeight = height;
    this.helpScroll = 0;
    this.helpMaxScroll = Math.max(0, contentBottom - (top + height - 4));
    this.markMenu(this.add.rectangle(291, top + height / 2, 2, height, C.panelLight).setDepth(21));
    this.helpScrollThumb = this.markMenu(this.add.rectangle(291, top + 15, 4, 30, C.gold).setDepth(22));
    this.helpScrollHint = this.markMenu(this.add.text(160, 161, "Rad · Wischen · ↑↓ zum Scrollen", {
      resolution: RENDER_SCALE, fontFamily: "Courier New, monospace", fontSize: "7px", color: C.muted, align: "center",
    }).setOrigin(0.5).setDepth(22));
    this.updateHelpScroll();
    this.addBackButton();
  }

  updateHelpScroll() {
    if (!this.helpContent?.length || !this.helpScrollThumb) return;
    this.helpContent.forEach((object, index) => {
      object.setY(this.helpContentPositions[index] - this.helpScroll);
    });
    const viewportHeight = this.helpScrollHeight;
    const contentHeight = Math.max(viewportHeight, this.helpMaxScroll + viewportHeight - 4);
    const thumbHeight = Math.min(viewportHeight, Math.max(12, viewportHeight ** 2 / contentHeight));
    const thumbTravel = viewportHeight - thumbHeight;
    const progress = this.helpMaxScroll > 0 ? this.helpScroll / this.helpMaxScroll : 0;
    this.helpScrollThumb.setSize(4, thumbHeight)
      .setY(this.helpScrollTop + thumbHeight / 2 + thumbTravel * progress);
  }

  scrollHelp(amount) {
    if (this.view !== "help" || !this.helpContent?.length) return;
    this.helpScroll = Phaser.Math.Clamp(this.helpScroll + amount, 0, this.helpMaxScroll);
    this.updateHelpScroll();
  }

  handleHelpWheel(pointer, _currentlyOver, _deltaX, deltaY) {
    const { x, y } = pointer.positionToCamera(this.cameras.main);
    if (this.view !== "help" || x < 20 || x > 300
      || y < this.helpScrollTop || y > this.helpScrollTop + this.helpScrollHeight) return;
    pointer.event?.preventDefault?.();
    this.scrollHelp(deltaY * 0.7);
  }

  startHelpScroll(pointer) {
    const { x, y } = pointer.positionToCamera(this.cameras.main);
    if (this.view !== "help" || x < 20 || x > 300
      || y < this.helpScrollTop || y > this.helpScrollTop + this.helpScrollHeight) return;
    this.helpDragging = true;
    this.helpDragY = y;
    pointer.event?.preventDefault?.();
  }

  dragHelpScroll(pointer) {
    if (!this.helpDragging || this.view !== "help" || !pointer.isDown) return;
    const { y } = pointer.positionToCamera(this.cameras.main);
    this.scrollHelp(this.helpDragY - y);
    this.helpDragY = y;
  }

  stopHelpScroll() {
    this.helpDragging = false;
  }

  buildSettingsPanel() {
    this.settingsLabelNames = ["MUSIK", "TÖNE", "ZURÜCK"];
    this.settingsRows = this.settingsLabelNames.map((label, index) =>
      this.markMenu(this.add.rectangle(160, 74 + index * 18, 216, 17, C.panel)
        .setDepth(21).setInteractive({ useHandCursor: true })
        .on("pointerover", () => { this.selection = index; this.updatePanelSelection(); })
        .on("pointerdown", () => { this.selection = index; this.confirmSelection(); })));
    this.settingsLabels = this.settingsLabelNames.map((label, index) =>
      this.markMenu(this.add.text(160, 74 + index * 18, "", {
        resolution: RENDER_SCALE, fontFamily: "Courier New, monospace", fontSize: "8px", color: C.cream,
      }).setOrigin(0.5).setDepth(22)));
    this.updateSettingsText();
    this.markMenu(this.add.text(160, 180,
      "Spielgeräusche: Schritte, Warnung, Fang, Sieg\nMenünavigation bleibt stumm", {
      resolution: RENDER_SCALE, fontFamily: "Courier New, monospace", fontSize: "7px", color: C.muted,
      align: "center", lineSpacing: 2,
    }).setOrigin(0.5).setDepth(21));
  }

  updateSettingsText() {
    const settings = this.audio.getSettings();
    const states = [settings.music, settings.sounds];
    this.settingsRows?.forEach((row, index) => {
      row.setFillStyle(index === this.selection ? C.panelLight : C.panel, 1);
      row.setStrokeStyle(index === this.selection ? 1 : 0, index === this.selection ? C.gold : C.panel);
    });
    this.settingsLabels?.forEach((label, index) => {
      const labelName = this.settingsLabelNames[index];
      const text = index < states.length ? `${labelName}: ${states[index] ? "AN" : "AUS"}` : labelName;
      label.setText(`${index === this.selection ? "▶ " : "  "}${text}`);
      label.setColor(index === this.selection ? "#ffe3a1" : C.cream);
    });
  }

  updatePanelSelection() {
    if (this.view !== "settings") return;
    this.updateSettingsText();
  }

  addBackButton() {
    this.markMenu(this.add.rectangle(160, 194, 150, 22, C.panelLight)
      .setStrokeStyle(1, C.gold).setDepth(21).setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.buildHomeMenu()));
    this.markMenu(this.add.text(160, 194, "▶ ZURÜCK", {
      resolution: RENDER_SCALE, fontFamily: "Courier New, monospace", fontSize: "9px", color: "#ffe3a1",
    }).setOrigin(0.5).setDepth(22));
  }

  goBack() {
    if (this.view !== "home") {
      this.buildHomeMenu();
    }
  }
}
