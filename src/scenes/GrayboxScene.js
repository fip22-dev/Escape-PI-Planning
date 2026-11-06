import Phaser from "phaser";
import { createFloorPlan, MAP_HEIGHT, MAP_WIDTH, TILE_SIZE, TILE_TYPES } from "../game/map.js";
import { createRoomObjects, objectAt } from "../game/objects.js";
import { timerWarningPresentation } from "../game/gameLoop.js";
import {
  canNeutralMoveToTile,
  createNeutralPatrol,
  BREAK_ROOM_ROUTES,
  isTileOccupiedByPeople,
  MEETING_TWO_ROUTE,
  NEUTRAL_RETRY_PAUSE_MS,
  NEUTRAL_START_POSITIONS,
  NEUTRAL_STEP_DURATION_MS,
  NEUTRAL_STEP_PAUSE_MS,
  resolveNeutralStartPositions,
} from "../game/neutralMovement.js";

const COLORS = {
  wall: 0x303a3b,
  wallEdge: 0x3d4947,
  room: 0xc7b995,
  roomAlt: 0xc0b08f,
  hall: 0x82918c,
  hallAlt: 0x788781,
  start: 0x788d7b,
  startAlt: 0x718573,
  door: 0xd8b868,
  exit: 0x90b66f,
  ink: "#20292a",
  text: "#f5f0dc",
  accent: "#e8794e",
};

const ESCAPE_TIME_MS = 180_000;

export class GrayboxScene extends Phaser.Scene {
  constructor() {
    super("graybox");
  }

  create() {
    const { grid, rooms, start } = createFloorPlan();
    this.grid = grid;
    this.roomObjects = createRoomObjects(rooms);
    this.playerTile = { ...start };
    this.isMoving = false;
    this.lastMoveAt = 0;
    this.escapeStartedAt = null;
    this.gameResult = null;
    this.isPaused = false;
    this.pauseChoiceYes = false;
    this.resultChoiceYes = false;
    this.pauseStartedAt = null;

    const graphics = this.add.graphics();
    for (let y = 0; y < MAP_HEIGHT; y += 1) {
      for (let x = 0; x < MAP_WIDTH; x += 1) {
        const tile = grid[y][x];
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;
        const alternate = (x + y) % 2 === 0;

        if (tile === TILE_TYPES.WALL) {
          graphics.fillStyle(COLORS.wall, 1);
          graphics.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          graphics.fillStyle(COLORS.wallEdge, 0.6);
          graphics.fillRect(px + 1, py + 1, TILE_SIZE - 2, 1);
          continue;
        }

        const color =
          tile === TILE_TYPES.HALL
            ? alternate ? COLORS.hall : COLORS.hallAlt
            : tile === TILE_TYPES.START
              ? alternate ? COLORS.start : COLORS.startAlt
              : tile === TILE_TYPES.EXIT
                ? COLORS.exit
                : tile === TILE_TYPES.DOOR
                  ? COLORS.door
                  : alternate ? COLORS.room : COLORS.roomAlt;

        graphics.fillStyle(color, 1);
        graphics.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        graphics.lineStyle(1, COLORS.ink, 0.12);
        graphics.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
      }
    }

    this.drawRoomObjects();

    for (const room of rooms) {
      // Der knappe Abstand zum Mac-Raum reicht oberhalb von M365 nicht aus.
      const below = room.label.startsWith("M365");
      const leftAligned = /^Meeting [1-5]$/.test(room.label);
      this.add
        .text(
          (leftAligned ? room.x - 1 : room.x + room.width / 2) * TILE_SIZE,
          below ? (room.y + room.height) * TILE_SIZE + 2 : room.y * TILE_SIZE - 2,
          room.label,
          {
            fontFamily: "Arial, sans-serif",
            fontSize: "9px",
            fontStyle: "bold",
            color: COLORS.text,
            backgroundColor: "#24332b",
            align: leftAligned ? "left" : "center",
            padding: { x: 2, y: 1 },
          },
        )
        .setOrigin(leftAligned ? 0 : 0.5, below ? 0 : 1)
        .setDepth(4);
    }

    this.add
      .text(34 * TILE_SIZE, 0, "AUSGANG", {
        fontFamily: "Arial, sans-serif",
        fontSize: "9px",
        fontStyle: "bold",
        color: COLORS.text,
        backgroundColor: "#24332b",
        padding: { x: 3, y: 2 },
      })
      .setOrigin(0.5, 0);

    this.add
      .text(38 * TILE_SIZE, 40 * TILE_SIZE - 2, "PI-Einführung", {
        fontFamily: "Arial, sans-serif",
        fontSize: "9px",
        fontStyle: "bold",
        color: COLORS.text,
        backgroundColor: "#364a3b",
        padding: { x: 2, y: 1 },
      })
      .setOrigin(0, 1);

    // Alle 37 neutralen Personen erhalten eine raum- oder ganggebundene Route.
    const neutralPositions = NEUTRAL_START_POSITIONS;
    const resolvedStarts = resolveNeutralStartPositions(neutralPositions, {
      rooms, grid, objects: this.roomObjects,
    });
    this.neutralPeople = resolvedStarts.map(({ x, y, bounds }, personIndex) => {
      const person = this.add.container((x + 0.5) * TILE_SIZE, (y + 0.5) * TILE_SIZE);
      const body = this.add.rectangle(0, 1, 8, 9, 0x71837f);
      body.setStrokeStyle(1, 0x394744);
      const head = this.add.circle(0, -5, 3, 0xc8ad8e);
      const hair = this.add.rectangle(0, -8, 6, 2, 0x4d514d);
      person.add([body, head, hair]);
      person.setDepth(3);
      return {
        sprite: person,
        tile: { x, y },
        bounds,
        nextTile: null,
        patrol: null,
        routeIndex: 0,
        nextMoveAt: 0,
      };
    });

    this.neutralPeople.forEach((person, personIndex) => {
      const originalStart = neutralPositions[personIndex];
      const breakRoomRoute = BREAK_ROOM_ROUTES[`${originalStart.x},${originalStart.y}`];
      if (breakRoomRoute) {
        person.patrol = {
          route: breakRoomRoute,
          bounds: person.bounds,
          radius: Math.max(...breakRoomRoute.map(tile =>
            Math.abs(tile.x - person.tile.x) + Math.abs(tile.y - person.tile.y))),
        };
      } else if (originalStart.x === 21 && originalStart.y === 26) {
        person.patrol = { route: MEETING_TWO_ROUTE, bounds: person.bounds, radius: 5 };
      } else {
        person.patrol = createNeutralPatrol(person.tile, {
          bounds: person.bounds,
          grid,
          objects: this.roomObjects,
          otherStarts: this.neutralPeople.filter(other => other !== person).map(other => other.tile),
          directionOffset: personIndex % 4,
        });
      }
      person.routeIndex = person.patrol?.route.length > 1 ? 1 : 0;
      person.nextMoveAt = 1800 + personIndex * 230;
    });

    const playerX = (start.x + 0.5) * TILE_SIZE;
    const playerY = (start.y + 0.5) * TILE_SIZE;
    this.player = this.add.container(playerX, playerY);
    this.playerNextTile = null;
    const body = this.add.rectangle(0, 0, 10, 13, 0x3e7d9b);
    body.setStrokeStyle(2, 0xf4e5b8);
    const face = this.add.rectangle(0, -5, 5, 4, 0xf1c89b);
    this.player.add([body, face]);
    this.player.setDepth(5);

    const worldWidth = MAP_WIDTH * TILE_SIZE;
    const worldHeight = MAP_HEIGHT * TILE_SIZE;
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.roundPixels = true;
    this.cameras.main.startFollow(this.player, false, 0.2, 0.2);

    this.inputKeys = this.input.keyboard.addKeys({
      upW: Phaser.Input.Keyboard.KeyCodes.W,
      downS: Phaser.Input.Keyboard.KeyCodes.S,
      leftA: Phaser.Input.Keyboard.KeyCodes.A,
      rightD: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.on("pointerdown", this.restartIfFinished, this);
    this.handleWindowEscape = (event) => {
      if ((event.key !== "Escape" && event.keyCode !== Phaser.Input.Keyboard.KeyCodes.ESC) || event.repeat) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      this.onEscapePressed();
    };
    window.addEventListener("keydown", this.handleWindowEscape, true);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener("keydown", this.handleWindowEscape, true);
    });
    this.input.keyboard.on("keydown-LEFT", this.onMenuDirection, this);
    this.input.keyboard.on("keydown-RIGHT", this.onMenuDirection, this);
    this.input.keyboard.on("keydown-ENTER", this.onConfirmPressed, this);
    this.input.keyboard.on("keydown-SPACE", this.onConfirmPressed, this);

    this.createGameHud();

  }

  update(time) {
    if (this.gameResult) {
      return;
    }
    if (this.isPaused) return;

    this.updateGameTimer(time);
    if (this.gameResult) return;

    this.updateNeutralPeople(time);
    if (this.isMoving || time - this.lastMoveAt < 105) return;

    const direction = this.readDirection();
    if (!direction) return;

    const targetX = this.playerTile.x + direction.x;
    const targetY = this.playerTile.y + direction.y;
    if (this.grid[targetY]?.[targetX] === undefined || this.grid[targetY][targetX] === TILE_TYPES.WALL
      || objectAt(this.roomObjects, targetX, targetY, "blocksMovement")
      || isTileOccupiedByPeople({ x: targetX, y: targetY }, this.neutralPeople)) {
      return;
    }

    this.isMoving = true;
    this.lastMoveAt = time;
    this.playerNextTile = { x: targetX, y: targetY };
    this.tweens.add({
      targets: this.player,
      x: (targetX + 0.5) * TILE_SIZE,
      y: (targetY + 0.5) * TILE_SIZE,
      duration: 105,
      ease: "Linear",
      onComplete: () => {
        this.playerTile = { x: targetX, y: targetY };
        this.playerNextTile = null;
        this.isMoving = false;
        this.onPlayerTileChanged(this.time.now, targetX, targetY);
      },
    });
  }

  restartIfFinished() {
    if (this.gameResult === "win") this.scene.restart();
  }

  onEscapePressed() {
    if (this.gameResult === "timeout") {
      this.resultChoiceYes = false;
      this.updateResultChoice();
      return;
    }
    if (this.gameResult) return;
    if (this.isPaused) this.resumeGame();
    else this.pauseGame();
  }

  onMenuDirection() {
    if (this.isPaused) {
      this.pauseChoiceYes = !this.pauseChoiceYes;
      this.updatePauseChoice();
    } else if (this.gameResult === "timeout") {
      this.resultChoiceYes = !this.resultChoiceYes;
      this.updateResultChoice();
    }
  }

  onConfirmPressed() {
    if (this.isPaused) {
      if (this.pauseChoiceYes) this.scene.restart();
      else this.resumeGame();
    } else if (this.gameResult === "timeout") {
      if (this.resultChoiceYes) this.scene.restart();
    } else if (this.gameResult === "win") {
      this.scene.restart();
    }
  }

  pauseGame() {
    this.isPaused = true;
    this.pauseChoiceYes = false;
    this.pauseStartedAt = this.time.now;
    this.tweens.pauseAll();
    this.updatePauseChoice();
    this.pausePanel.setVisible(true);
    this.pauseHeading.setVisible(true);
    this.pausePrompt.setVisible(true);
    this.pauseYes.setVisible(true);
    this.pauseNo.setVisible(true);
    this.pauseHint.setVisible(true);
  }

  resumeGame() {
    if (!this.isPaused) return;
    const pausedFor = Math.max(0, this.time.now - this.pauseStartedAt);
    if (this.escapeStartedAt !== null) this.escapeStartedAt += pausedFor;
    this.isPaused = false;
    this.pauseStartedAt = null;
    this.pausePanel.setVisible(false);
    this.pauseHeading.setVisible(false);
    this.pausePrompt.setVisible(false);
    this.pauseYes.setVisible(false);
    this.pauseNo.setVisible(false);
    this.pauseHint.setVisible(false);
    this.tweens.resumeAll();
  }

  updatePauseChoice() {
    if (!this.pauseYes || !this.pauseNo) return;
    this.pauseYes.setText(`${this.pauseChoiceYes ? "> " : "  "}Ja`);
    this.pauseNo.setText(`${this.pauseChoiceYes ? "  " : "> "}Nein`);
    this.pauseYes.setColor(this.pauseChoiceYes ? "#f5f0dc" : "#b5c4ad");
    this.pauseNo.setColor(this.pauseChoiceYes ? "#b5c4ad" : "#f5f0dc");
  }

  updateResultChoice() {
    if (!this.resultYes || !this.resultNo) return;
    this.resultYes.setText(`${this.resultChoiceYes ? "> " : "  "}Ja`);
    this.resultNo.setText(`${this.resultChoiceYes ? "  " : "> "}Nein`);
    this.resultYes.setColor(this.resultChoiceYes ? "#f5f0dc" : "#b5c4ad");
    this.resultNo.setColor(this.resultChoiceYes ? "#b5c4ad" : "#f5f0dc");
  }

  confirmResultChoice(yes) {
    this.resultChoiceYes = yes;
    this.updateResultChoice();
    if (yes) this.scene.restart();
  }

  createGameHud() {
    this.hudPanel = this.add.rectangle(8, 8, 76, 30, 0x24332b, 0.96)
      .setOrigin(0).setScrollFactor(0).setDepth(100);
    this.hudLabel = this.add.text(14, 11, "ZEIT", {
      fontFamily: "Arial, sans-serif",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#b5c4ad",
    }).setScrollFactor(0).setDepth(101);
    this.timerText = this.add.text(14, 20, "03:00", {
      fontFamily: "Arial, sans-serif",
      fontSize: "12px",
      fontStyle: "bold",
      color: "#f5f0dc",
    }).setScrollFactor(0).setDepth(101);
    this.resultPanel = this.add.rectangle(160, 120, 272, 88, 0x172326, 0.96)
      .setStrokeStyle(2, 0xd8b868).setScrollFactor(0).setDepth(110).setVisible(false);
    this.resultText = this.add.text(160, 103, "", {
      fontFamily: "Arial, sans-serif",
      fontSize: "11px",
      fontStyle: "bold",
      color: "#f5f0dc",
      align: "center",
      lineSpacing: 5,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(111).setVisible(false);
    this.resultYes = this.add.text(122, 145, "Ja", {
      fontFamily: "Arial, sans-serif", fontSize: "11px", fontStyle: "bold", color: "#b5c4ad",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(111).setVisible(false).setInteractive({ useHandCursor: true });
    this.resultNo = this.add.text(198, 145, "Nein", {
      fontFamily: "Arial, sans-serif", fontSize: "11px", fontStyle: "bold", color: "#f5f0dc",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(111).setVisible(false).setInteractive({ useHandCursor: true });
    this.resultYes.on("pointerdown", () => this.confirmResultChoice(true));
    this.resultNo.on("pointerdown", () => this.confirmResultChoice(false));

    this.pausePanel = this.add.rectangle(160, 120, 272, 100, 0x172326, 0.97)
      .setStrokeStyle(2, 0xd8b868).setScrollFactor(0).setDepth(110).setVisible(false);
    this.pauseHeading = this.add.text(160, 84, "PAUSE", {
      fontFamily: "Arial, sans-serif", fontSize: "12px", fontStyle: "bold", color: "#f5f0dc",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(111).setVisible(false);
    this.pausePrompt = this.add.text(160, 106, "Versuch neu starten?", {
      fontFamily: "Arial, sans-serif", fontSize: "11px", color: "#f5f0dc",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(111).setVisible(false);
    this.pauseYes = this.add.text(122, 132, "Ja", {
      fontFamily: "Arial, sans-serif", fontSize: "11px", fontStyle: "bold", color: "#b5c4ad",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(111).setVisible(false).setInteractive({ useHandCursor: true });
    this.pauseNo = this.add.text(198, 132, "Nein", {
      fontFamily: "Arial, sans-serif", fontSize: "11px", fontStyle: "bold", color: "#f5f0dc",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(111).setVisible(false).setInteractive({ useHandCursor: true });
    this.pauseHint = this.add.text(160, 154, "← / → wählen · Enter bestätigen · Esc weiter", {
      fontFamily: "Arial, sans-serif", fontSize: "7px", color: "#b5c4ad", align: "center",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(111).setVisible(false);
    this.pauseYes.on("pointerdown", () => {
      this.pauseChoiceYes = true;
      this.updatePauseChoice();
      this.scene.restart();
    });
    this.pauseNo.on("pointerdown", () => this.resumeGame());
  }

  updateGameTimer(time) {
    if (this.escapeStartedAt === null) {
      this.hudLabel.setText("BEREIT");
      this.timerText.setText("03:00");
      return;
    }

    const remaining = Math.max(0, ESCAPE_TIME_MS - (time - this.escapeStartedAt));
    const seconds = Math.ceil(remaining / 1000);
    this.timerText.setText(`${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`);
    const warning = timerWarningPresentation(remaining, time);
    this.timerText.setColor(warning.color).setAlpha(warning.alpha);
    if (remaining === 0) this.finishGame("timeout");
  }

  onPlayerTileChanged(time, x, y) {
    const tileType = this.grid[y]?.[x];
    if (this.escapeStartedAt === null && tileType !== TILE_TYPES.START) {
      this.escapeStartedAt = time;
      this.hudLabel.setText("ZEIT ÜBRIG");
    }
    if (tileType === TILE_TYPES.EXIT) this.finishGame("win");
  }

  finishGame(result) {
    if (this.gameResult) return;
    this.gameResult = result;
    this.isMoving = false;
    this.playerNextTile = null;
    this.tweens.killAll();
    this.resultText.setText(result === "win"
      ? "GESCHAFFT!\nDu hast das PI Planning verlassen.\nEnter zum Neustart"
      : "Pech gehabt – Zeit abgelaufen.\nVersuch neu starten?");
    this.resultPanel.setVisible(true);
    this.resultText.setVisible(true);
    if (result === "timeout") {
      this.resultChoiceYes = false;
      this.updateResultChoice();
      this.resultYes.setVisible(true);
      this.resultNo.setVisible(true);
    }
  }

  updateNeutralPeople(time) {
    for (const person of this.neutralPeople) {
      if (!person.patrol || person.patrol.route.length < 2 || person.nextTile || time < person.nextMoveAt) continue;

      const target = person.patrol.route[person.routeIndex];
      if (!canNeutralMoveToTile(target, {
        bounds: person.patrol.bounds,
        grid: this.grid,
        objects: this.roomObjects,
        otherPeople: this.neutralPeople.filter(other => other !== person),
        playerTiles: [this.playerTile, this.playerNextTile].filter(Boolean),
      })) {
        person.nextMoveAt = time + NEUTRAL_RETRY_PAUSE_MS;
        continue;
      }

      person.nextTile = target;
      this.tweens.add({
        targets: person.sprite,
        x: (target.x + 0.5) * TILE_SIZE,
        y: (target.y + 0.5) * TILE_SIZE,
        duration: NEUTRAL_STEP_DURATION_MS,
        ease: "Linear",
        onComplete: () => {
          person.tile = target;
          person.nextTile = null;
          person.routeIndex = (person.routeIndex + 1) % person.patrol.route.length;
          person.nextMoveAt = time + NEUTRAL_STEP_DURATION_MS + NEUTRAL_STEP_PAUSE_MS;
        },
      });
    }
  }

  readDirection() {
    if (this.cursors.left.isDown || this.inputKeys.leftA.isDown) return { x: -1, y: 0 };
    if (this.cursors.right.isDown || this.inputKeys.rightD.isDown) return { x: 1, y: 0 };
    if (this.cursors.up.isDown || this.inputKeys.upW.isDown) return { x: 0, y: -1 };
    if (this.cursors.down.isDown || this.inputKeys.downS.isDown) return { x: 0, y: 1 };
    return null;
  }

  drawRoomObjects() {
    const g = this.add.graphics().setDepth(1);
    for (const object of this.roomObjects) {
      const x = object.x * TILE_SIZE;
      const y = object.y * TILE_SIZE;
      const w = object.width * TILE_SIZE;
      const h = object.height * TILE_SIZE;
      if (object.type === "table") {
        g.fillStyle(0x493626).fillRect(x + 1, y + 3, w - 2, h - 3);
        g.fillStyle(0xb88651).fillRect(x + 1, y + 1, w - 2, h - 4);
        g.lineStyle(1, 0xe0b67a).strokeRect(x + 2, y + 2, w - 4, h - 6);
        if (object.surface === "break") {
          // Pausentische erhalten Essen und Kaffeetassen statt Arbeitsmaterial.
          g.fillStyle(0xe9e3cf).fillEllipse(x + 9, y + 8, 9, 5);
          g.fillStyle(0xb85f45).fillRect(x + 6, y + 6, 3, 3);
          g.fillStyle(0x78904f).fillRect(x + 10, y + 7, 3, 2);
          g.fillStyle(0xf1e9d5).fillRect(x + 20, y + 4, 4, 5);
          g.fillStyle(0x6f8188).fillRect(x + 19, y + 4, 1, 3);
          g.fillStyle(0x6f8188).fillRect(x + 24, y + 5, 2, 2);
          g.fillStyle(0xe9e3cf).fillEllipse(x + 29, y + 8, 4, 3);
        } else if (object.surface === "pi-snack") {
          // Der kleine PI-Tisch zeigt Obst, Gemüse und Gipfeli.
          g.fillStyle(0xd94f45).fillCircle(x + 8, y + 8, 3);
          g.fillStyle(0x78a64b).fillCircle(x + 8, y + 24, 3);
          g.fillStyle(0xe3b84f).fillEllipse(x + 8, y + 40, 6, 3);
          g.fillStyle(0xf5d98b).fillRect(x + 5, y + 39, 5, 1);
        } else {
          // Arbeitsmaterial ist Dekoration ohne eigene Kollisions- oder Sichtfläche.
          g.fillStyle(0x253c4b).fillRect(x + 3, y + 3, 10, 6);
          g.fillStyle(0x85b7c2).fillRect(x + 4, y + 4, 8, 3);
          g.fillStyle(0x6f8188).fillRect(x + 2, y + 9, 12, 2);
          g.fillStyle(0xf1e9d5).fillRect(x + 17, y + 3, 6, 7);
          g.fillStyle(0xaaa591).fillRect(x + 18, y + 5, 4, 1);
          g.fillStyle(0xf7ead1).fillRect(x + w - 7, y + 6, 4, 4);
          g.fillStyle(0x64442f).fillRect(x + w - 6, y + 6, 2, 1);
        }
      } else if (object.type === "chair") {
        g.fillStyle(0x374b56).fillRect(x + 4, y + 4, 8, 9);
        g.fillStyle(0x6a91a0).fillRect(x + 3, y + 2, 10, 4);
        g.fillStyle(0x517585).fillRect(x + 4, y + 7, 8, 5);
      } else if (object.type === "plant") {
        g.fillStyle(0x9b6145).fillRect(x + 5, y + 10, 7, 5);
        g.fillStyle(0x355c3e).fillCircle(x + 8, y + 7, 6);
        g.fillStyle(0x6f9a50).fillCircle(x + 6, y + 5, 3);
      } else if (object.type === "coffee") {
        g.fillStyle(0x28343c).fillRect(x + 2, y + 1, 12, 14);
        g.fillStyle(0x80999b).fillRect(x + 3, y + 2, 10, 4);
        g.fillStyle(0xf2e0bc).fillRect(x + 6, y + 9, 5, 4);
        g.fillStyle(0xd5a355).fillRect(x + 11, y + 7, 2, 2);
      } else if (object.type === "whiteboard") {
        g.fillStyle(0x5b6d72).fillRect(x, y + 1, w, h - 2);
        g.fillStyle(0xe9eddf).fillRect(x + 1, y + 2, w - 2, h - 4);
        for (let i = 0; i < 5; i += 1) {
          g.fillStyle(i % 2 ? 0xe6b66c : 0x8bb9ac).fillRect(x + 4 + i * 8, y + 5, 5, 5);
        }
      } else if (object.type === "sideboard") {
        g.fillStyle(0x5c4936).fillRect(x + 1, y + 1, w - 2, h - 2);
        g.fillStyle(0xa68c65).fillRect(x + 2, y + 2, w - 4, 3);
        g.lineStyle(1, 0xceb78c).strokeRect(x + 3, y + 7, w / 2 - 4, 6);
        g.fillStyle(0xceb78c).fillRect(x + w - 7, y + 9, 2, 2);
      } else if (object.type === "printer") {
        g.fillStyle(0x3c4a52).fillRect(x + 2, y + 5, 12, 10);
        g.fillStyle(0xb2bdb8).fillRect(x + 1, y + 4, 14, 6);
        g.fillStyle(0xf3ecd9).fillRect(x + 4, y + 1, 8, 5);
        g.fillStyle(0x72af87).fillRect(x + 11, y + 6, 2, 2);
        g.fillStyle(0x1c2c33).fillRect(x + 4, y + 11, 8, 2);
      } else if (object.type === "bin") {
        g.fillStyle(0x4c6261).fillRect(x + 4, y + 5, 8, 10);
        g.fillStyle(0x91a6a0).fillRect(x + 3, y + 3, 10, 3);
        g.fillStyle(0x263c3b).fillRect(x + 5, y + 4, 6, 1);
      } else if (object.type === "screen") {
        g.fillStyle(0x3a4751).fillRect(x, y + 1, w, h - 2);
        g.fillStyle(0xe5e9df).fillRect(x + 2, y + 3, w - 4, h - 6);
        g.fillStyle(0x90adb1);
        if (h > w) g.fillRect(x + Math.floor(w / 2) - 1, y + 8, 2, h - 16);
        else g.fillRect(x + 8, y + 6, w - 16, 2);
      }
    }
  }
}
