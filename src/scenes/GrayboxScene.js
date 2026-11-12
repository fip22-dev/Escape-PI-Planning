import Phaser from "phaser";
import { getAudioEngine } from "../game/audio.js";
import { createDoors, updateDoors, drawDoors, shiftDoorTime } from "../game/doors.js";
import { configureRendering, routeRenderLayers, RENDER_SCALE } from "../game/rendering.js";
import { drawPixelPerson, drawPixelTile, drawPixelFurniture } from "../game/pixelArt.js";
import { advanceCaughtDialog, createCaughtDialog } from "../game/caughtDialog.js";
import { createNeutralSpeech, updateNeutralSpeech, shiftNeutralSpeechTime, isMeetingSpeaker } from "../game/neutralSpeech.js";
import { chooseTouchStep } from "../game/touchMovement.js";
import { bindTouchControls } from "../touchControls.js";
import { createFloorPlan, MAP_HEIGHT, MAP_WIDTH, TILE_SIZE, TILE_TYPES } from "../game/map.js";
import { createRoomObjects, objectAt } from "../game/objects.js";
import { timerWarningPresentation } from "../game/gameLoop.js";
import { createTeamKeys, collectTeamKey, hasAllTeamKeys, teamKeyProgress, LOCKED_EXIT_MESSAGE } from "../game/teamKeys.js";
import {
  canSearcherMoveToTile,
  canSearcherSeePlayer,
  createSearcherPatrols,
  RTE_RETRY_PAUSE_MS,
  RTE_SIGHT_RANGE,
  RTE_STEP_DURATION_MS,
  RTE_STEP_PAUSE_MS,
  searcherDetectionPhase,
} from "../game/searcherDetection.js";
import {
  canNeutralMoveToTile,
  createNeutralPatrol,
  findPatrolDetour,
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

  init(data = {}) {
    this.startGuideRequested = Boolean(data.showStartGuide);
    // Phaser retains scene data on restart; consume this one-time request.
    data.showStartGuide = false;
  }

  create() {
    configureRendering(this, true);
    document.querySelector(".page")?.classList.remove("is-menu");
    window.dispatchEvent(new CustomEvent("game:mode", { detail: { mode: "play" } }));
    this.audio = getAudioEngine();
    this.audio.startMusic();
    this.speakingPeople = new Set();
    this.seenDialogRoles ??= new Set();
    this.repeatDialogCounts ??= new Map();
    this.caughtDialog = null;
    this.neutralSpeech = createNeutralSpeech(this.time.now);
    const { grid, rooms, start } = createFloorPlan();
    this.grid = grid;
    this.doors = createDoors(grid);
    this.doorGraphics = this.add.graphics().setDepth(2);
    this.rooms = rooms;
    this.roomObjects = createRoomObjects(rooms);
    this.collectedTeamKeys = new Set();
    this.teamKeys = createTeamKeys({ grid, rooms, start, objects: this.roomObjects }, Math.random, this.teamKeys);
    this.exitHintUntil = 0;
    this.exitHintNearby = false;
    this.teamKeyGraphics = this.add.graphics().setDepth(2);
    this.drawTeamKeys();
    this.playerTile = { ...start };
    this.isMoving = false;
    this.lastMoveAt = 0;
    this.touchHeading = null;
    this.escapeStartedAt = null;
    this.gameResult = null;
    this.isPaused = false;
    this.pauseChoiceYes = false;
    this.resultChoiceYes = false;
    this.pauseStartedAt = null;
    this.pauseTransitionPending = false;

    const graphics = this.add.graphics();
    const doorTiles = new Set(this.doors.filter(door => !door.exit)
      .flatMap(door => door.tiles.map(tile => `${tile.x},${tile.y}`)));
    for (let y = 0; y < MAP_HEIGHT; y += 1) {
      for (let x = 0; x < MAP_WIDTH; x += 1) {
        const tile = grid[y][x];
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;
        const kind = doorTiles.has(`${x},${y}`) ? "door" : tile === TILE_TYPES.WALL ? "wall"
          : tile === TILE_TYPES.HALL ? "hall"
            : tile === TILE_TYPES.START ? "start"
              : tile === TILE_TYPES.EXIT ? "exit"
                : "room";
        drawPixelTile(graphics, kind, px, py, TILE_SIZE, x, y);
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
            resolution: RENDER_SCALE, fontFamily: "Arial, sans-serif",
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
        resolution: RENDER_SCALE, fontFamily: "Arial, sans-serif",
        fontSize: "9px",
        fontStyle: "bold",
        color: COLORS.text,
        backgroundColor: "#24332b",
        padding: { x: 3, y: 2 },
      })
      .setOrigin(0.5, 0);

    this.add
      .text(38 * TILE_SIZE, 40 * TILE_SIZE - 2, "PI-Einführung", {
        resolution: RENDER_SCALE, fontFamily: "Arial, sans-serif",
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
      const shirts = [0x71837f, 0x796c8b, 0x9a805d, 0x537f86, 0xa3634c];
      drawPixelPerson(this, 0, 0, shirts[personIndex % shirts.length], personIndex, person);
      person.setDepth(3);
      return {
        sprite: person,
        tile: { x, y },
        bounds,
        nextTile: null,
        patrol: null,
        routeIndex: 0,
        detourRoute: null,
        detourResumeIndex: null,
        blockedAttempts: 0,
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
      person.nextMoveAt = this.time.now + 1800 + personIndex * 230;
    });

    const playerX = (start.x + 0.5) * TILE_SIZE;
    const playerY = (start.y + 0.5) * TILE_SIZE;
    this.player = this.add.container(playerX, playerY);
    this.playerNextTile = null;
    drawPixelPerson(this, 0, 0, 0x5793a0, 0, this.player);
    this.player.setDepth(5);
    this.createSearchers();

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
    this.input.keyboard.resetKeys();
    this.touchControls = bindTouchControls({
      onClear: () => { this.touchHeading = null; },
      onPause: () => this.onEscapePressed(),
      onRestart: () => {
        if (!this.startGuideVisible) this.caughtDialog ? this.advanceDialog() : this.scene.restart();
      },
    });
    this.input.on("pointerdown", this.restartIfFinished, this);
    this.handleWindowEscape = (event) => {
      if (document.querySelector('.feedback-dialog[open]')) return;
      const audioSetting = event.code === "KeyM" ? "music"
        : event.code === "KeyT" ? "sounds" : null;
      if (this.isPaused && audioSetting) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (!event.repeat) this.togglePauseAudioSetting(audioSetting);
        return;
      }
      if (this.isPaused && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyS", "KeyA", "KeyD"].includes(event.code)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        this.onMenuDirection(event);
        return;
      }
      if ((event.key === "Enter" || event.key === " " || event.code === "Space")
        && (this.startGuideVisible || this.caughtDialog || this.isPaused || this.gameResult)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        this.onConfirmPressed(event);
        return;
      }
      if ((event.key !== "Escape" && event.keyCode !== Phaser.Input.Keyboard.KeyCodes.ESC) || event.repeat) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      this.onEscapePressed();
    };
    window.addEventListener("keydown", this.handleWindowEscape, true);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener("keydown", this.handleWindowEscape, true);
      this.touchControls.destroy();
      this.input.off("pointerdown", this.restartIfFinished, this);
      this.input.keyboard.off("keydown-LEFT", this.onMenuDirection, this);
      this.input.keyboard.off("keydown-RIGHT", this.onMenuDirection, this);
      this.input.keyboard.off("keydown-UP", this.onMenuDirection, this);
      this.input.keyboard.off("keydown-DOWN", this.onMenuDirection, this);
      this.input.keyboard.off("keydown-ENTER", this.onConfirmPressed, this);
      this.input.keyboard.off("keydown-SPACE", this.onConfirmPressed, this);
    });
    this.input.keyboard.on("keydown-LEFT", this.onMenuDirection, this);
    this.input.keyboard.on("keydown-RIGHT", this.onMenuDirection, this);
    this.input.keyboard.on("keydown-DOWN", this.onMenuDirection, this);
    this.input.keyboard.on("keydown-UP", this.onMenuDirection, this);
    this.input.keyboard.on("keydown-ENTER", this.onConfirmPressed, this);
    this.input.keyboard.on("keydown-SPACE", this.onConfirmPressed, this);

    this.createGameHud();
    this.createStartGuide();
    this.updateDoors(this.time.now, true);
    routeRenderLayers(this);
  }

  update(time) {
    if (this.gameResult) {
      return;
    }
    if (this.isPaused || this.startGuideVisible) return;

    this.updateGameTimer(time);
    if (this.gameResult) return;
    this.updateExitHint(time);

    this.updateNeutralPeople(time);
    this.updateSearchers(time);
    if (this.gameResult) return;
    this.updateSpeechBubble(time);
    if (this.isMoving || time - this.lastMoveAt < 105) return;

    const touchRequest = this.touchControls.readDirection();
    const direction = touchRequest
      ? chooseTouchStep(touchRequest, this.touchHeading, candidate => this.canPlayerStep(candidate))
      : this.readDirection();
    if (!direction || !this.canPlayerStep(direction)) return;
    this.touchHeading = touchRequest ? direction : null;
    const targetX = this.playerTile.x + direction.x;
    const targetY = this.playerTile.y + direction.y;

    this.isMoving = true;
    this.lastMoveAt = time;
    this.playerNextTile = { x: targetX, y: targetY };
    this.updateExitHint(time);
    this.updateDoors(time);
    this.tweens.add({
      targets: this.player,
      x: (targetX + 0.5) * TILE_SIZE,
      y: (targetY + 0.5) * TILE_SIZE,
      duration: 105,
      ease: "Linear",
      onComplete: () => {
        this.audio.play("step");
        this.playerTile = { x: targetX, y: targetY };
        this.playerNextTile = null;
        this.isMoving = false;
        this.onPlayerTileChanged(this.time.now, targetX, targetY);
      },
    });
  }

  restartIfFinished() {
    if (this.startGuideVisible) {
      this.dismissStartGuide();
      return;
    }
    if (this.caughtDialog) this.advanceDialog();
    else if (this.gameResult === "win") this.scene.restart();
  }

  onEscapePressed() {
    if (this.startGuideVisible) return;
    if (this.gameResult === "timeout") {
      this.resultChoiceYes = false;
      this.updateResultChoice();
      return;
    }
    if (this.gameResult) return;
    if (this.isPaused) this.resumeGame();
    else this.pauseGame();
  }

  onMenuDirection(event) {
    if (event?.repeat) return;
    if (this.isPaused) {
      if (["ArrowDown", "KeyS"].includes(event?.code)) this.pauseRow = (this.pauseRow + 1) % 3;
      else if (["ArrowUp", "KeyW"].includes(event?.code)) this.pauseRow = (this.pauseRow + 2) % 3;
      else if (this.pauseRow === 0) this.pauseChoiceYes = !this.pauseChoiceYes;
      else if (this.pauseRow === 2) this.pauseAudioChoice = 1 - this.pauseAudioChoice;
      this.updatePauseChoice();
    } else if (this.gameResult === "timeout") {
      this.resultChoiceYes = !this.resultChoiceYes;
      this.updateResultChoice();
    }
  }

  onConfirmPressed(event) {
    if (this.startGuideVisible) {
      event?.preventDefault?.();
      if (!event?.repeat) this.dismissStartGuide();
      return;
    }
    // The same Enter/Space must not also click a focused HTML control.
    if (this.caughtDialog || this.isPaused || this.gameResult) event?.preventDefault?.();
    if (event?.repeat) return;
    if (this.caughtDialog) {
      this.advanceDialog();
      return;
    }
    if (this.isPaused) {
      this.confirmPauseChoice();
    } else if (this.gameResult === "timeout") {
      if (this.resultChoiceYes) this.scene.restart();
    } else if (this.gameResult === "win") {
      this.scene.restart();
    }
  }

  createStartGuide() {
    this.startGuideVisible = this.startGuideRequested;
    this.startGuideRequested = false;
    this.startGuideOpenedAt = this.time.now;
    const style = { resolution: RENDER_SCALE, fontFamily: "Arial, sans-serif", color: "#f5f0dc" };
    this.startGuidePanel = this.add.rectangle(160, 120, 296, 192, 0x172326, 0.98)
      .setStrokeStyle(2, 0xd8b868).setScrollFactor(0).setDepth(130);
    this.startGuideTitle = this.add.text(160, 42, "Entkomme dem PI Planning", {
      ...style, fontSize: "13px", fontStyle: "bold", color: "#ffe066",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(131);
    this.startGuideBody = this.add.text(28, 62,
      "Entkomme in 180 Sekunden und gehe den Suchenden aus dem Weg.\nSammle dafür in jedem der sieben Teamzimmer einen Schlüssel – laufe einfach darüber.\nHast du alle sieben Schlüssel, ist der Ausgang frei.\nWirst du erwischt, musst du am PI Planning teilnehmen.", {
        ...style, fontSize: "10px", wordWrap: { width: 264 }, lineSpacing: 1,
      }).setScrollFactor(0).setDepth(131);
    this.startGuideButton = this.add.text(160, 196, "Zum Starten irgendwo tippen · Enter / Leertaste", {
      ...style, fontSize: "9px", backgroundColor: "#364a3b", padding: { x: 8, y: 7 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(132).setInteractive({ useHandCursor: true });
    this.startGuideButton.on("pointerdown", () => this.dismissStartGuide());
    this.startGuideObjects = [this.startGuidePanel, this.startGuideTitle, this.startGuideBody, this.startGuideButton];
    this.startGuideObjects.forEach(object => object.setVisible(this.startGuideVisible));
  }

  dismissStartGuide() {
    // Ignore the input that selected Spiel starten in the previous scene.
    if (!this.startGuideVisible || this.time.now - this.startGuideOpenedAt < 200) return;
    const elapsed = this.time.now - this.startGuideOpenedAt;
    for (const person of [...this.neutralPeople, ...this.searchers]) person.nextMoveAt += elapsed;
    shiftNeutralSpeechTime(this.neutralSpeech, elapsed);
    this.input.keyboard.resetKeys();
    this.touchControls.clear();
    this.touchHeading = null;
    this.startGuideVisible = false;
    this.startGuideObjects.forEach(object => object.setVisible(false));
  }

  advanceDialog() {
    if (!this.caughtDialog) return;
    // A held key must not dismiss multiple pages or restart several attempts.
    if (this.time.now - this.dialogLastAdvancedAt < 200) return;
    this.dialogLastAdvancedAt = this.time.now;
    if (advanceCaughtDialog(this.caughtDialog, this.seenDialogRoles, this.repeatDialogCounts)) this.scene.restart();
    else this.updateDialogText();
  }

  updateDialogText() {
    const dialog = this.caughtDialog;
    this.dialogHeading.setText(`ERWISCHT! – ${dialog.roleName}`);
    this.dialogBody.setText(dialog.pages[dialog.pageIndex]);
    this.dialogHint.setText(dialog.repeated
      ? "Enter / Leertaste / Tippen: überspringen & neu starten"
      : `${dialog.pageIndex + 1}/${dialog.pages.length} · Enter / Leertaste / Tippen: ${dialog.pageIndex < dialog.pages.length - 1 ? "weiter" : "neu starten"}`);
  }

  createSearchers() {
    this.searchers = createSearcherPatrols({ grid: this.grid, objects: this.roomObjects, rooms: this.rooms }).map(config => {
      const sprite = this.add.container((config.start.x + 0.5) * TILE_SIZE, (config.start.y + 0.5) * TILE_SIZE);
      drawPixelPerson(this, 0, 0, config.color, config.color % 7, sprite, config.role);
      const facingMarker = this.add.rectangle(0, -7, 2, 2, 0x273438);
      const roleTag = this.add.text(0, -16, config.role, {
        resolution: RENDER_SCALE, fontFamily: "Arial, sans-serif",
        fontSize: "7px",
        fontStyle: "bold",
        color: "#fff0a8",
        backgroundColor: "#50372e",
        padding: { x: 1, y: 1 },
      }).setOrigin(0.5);
      const warningIcon = this.add.text(0, -24, "!", {
        resolution: RENDER_SCALE, fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        fontStyle: "bold",
        color: "#ffe066",
        backgroundColor: "#50372e",
        padding: { x: 2, y: 0 },
      }).setOrigin(0.5).setVisible(false);
      sprite.add([facingMarker, roleTag, warningIcon]);
      sprite.setDepth(4);

      return {
        ...config,
        sprite,
        warningIcon,
        facingMarker,
        tile: { ...config.start },
        nextTile: null,
        routeIndex: 0,
        facing: { x: 0, y: -1 },
        visibleSince: null,
        detourRoute: null,
        detourResumeIndex: null,
        blockedAttempts: 0,
        nextMoveAt: this.time.now + config.delayMs,
      };
    });
    this.rte = this.searchers[0];
  }

  updateSearcherFacingMarker(searcher) {
    const positions = {
      "0,-1": [0, -7],
      "1,0": [2, -6],
      "0,1": [0, -4],
      "-1,0": [-2, -6],
    };
    searcher.facingMarker.setPosition(...positions[`${searcher.facing.x},${searcher.facing.y}`]);
  }

  updateSearchers(time) {
    this.searchers.forEach(searcher => this.updateSearcherPatrol(searcher, time));
    this.updateDoors(time);
    for (const searcher of this.searchers) {
      if (this.updateSearcherDetection(searcher, time)) return;
    }
  }

  updateDoors(time, force = false) {
    const actors = [{ tile: this.playerTile, nextTile: this.playerNextTile },
      ...this.neutralPeople, ...this.searchers];
    const changed = updateDoors(this.doors, actors, time, hasAllTeamKeys(this.collectedTeamKeys));
    if (force || changed) drawDoors(this.doorGraphics, this.doors, TILE_SIZE);
  }

  updateSearcherPatrol(searcher, time) {
    const target = searcher.detourRoute?.[0] ?? searcher.route[searcher.routeIndex];
    if (!target || searcher.nextTile || time < searcher.nextMoveAt) return;

    const canMoveToTile = tile => canSearcherMoveToTile(tile, {
      grid: this.grid,
      objects: this.roomObjects,
      homeRoom: searcher.homeRoom,
      otherPeople: [
        ...this.neutralPeople,
        ...this.searchers.filter(other => other !== searcher),
      ],
      playerTiles: [this.playerTile, this.playerNextTile].filter(Boolean),
    });
    if (!canMoveToTile(target)) {
      searcher.blockedAttempts += 1;
      if (searcher.blockedAttempts >= 2) {
        const detour = findPatrolDetour({
          start: searcher.tile,
          route: searcher.route,
          routeIndex: searcher.routeIndex,
          canMoveToTile,
        });
        if (detour) {
          searcher.detourRoute = detour.path;
          searcher.detourResumeIndex = detour.resumeIndex;
          searcher.blockedAttempts = 0;
        }
      }
      searcher.nextMoveAt = time + RTE_RETRY_PAUSE_MS;
      return;
    }

    searcher.blockedAttempts = 0;
    searcher.facing = {
      x: Math.sign(target.x - searcher.tile.x),
      y: Math.sign(target.y - searcher.tile.y),
    };
    this.updateSearcherFacingMarker(searcher);
    searcher.nextTile = { x: target.x, y: target.y };
    this.tweens.add({
      targets: searcher.sprite,
      x: (target.x + 0.5) * TILE_SIZE,
      y: (target.y + 0.5) * TILE_SIZE,
      duration: RTE_STEP_DURATION_MS,
      ease: "Linear",
      onComplete: () => {
        searcher.tile = { x: target.x, y: target.y };
        searcher.nextTile = null;
        if (searcher.detourRoute) {
          searcher.detourRoute.shift();
          if (searcher.detourRoute.length === 0) {
            searcher.routeIndex = searcher.detourResumeIndex;
            searcher.detourRoute = null;
            searcher.detourResumeIndex = null;
          }
        } else {
          searcher.routeIndex = (searcher.routeIndex + 1) % searcher.route.length;
        }
        searcher.nextMoveAt = this.time.now + RTE_STEP_PAUSE_MS + (target.waitMs ?? 0);
      },
    });
  }

  updateSearcherDetection(searcher, time) {
    const playerTiles = [this.playerTile, this.playerNextTile].filter(Boolean);
    const observerTiles = [searcher.tile, searcher.nextTile].filter(Boolean);
    const visible = observerTiles.some(observerTile => playerTiles.some(playerTile =>
      canSearcherSeePlayer({
        observerTile,
        facing: searcher.facing,
        playerTile,
        grid: this.grid,
        objects: this.roomObjects,
        neutralPeople: this.neutralPeople,
        doors: this.doors,
        maxRange: RTE_SIGHT_RANGE,
      })));

    if (!visible) {
      searcher.visibleSince = null;
      searcher.warningIcon.setVisible(false);
      searcher.warningIcon.setColor("#ffe066");
      return false;
    }

    if (searcher.visibleSince === null) {
      searcher.visibleSince = time;
      this.audio.play("warning");
    }
    searcher.warningIcon.setVisible(true);
    const phase = searcherDetectionPhase(time - searcher.visibleSince);
    searcher.warningIcon.setColor(phase === "yellow" ? "#ffe066" : "#ff4d4f");
    if (phase === "caught") {
      this.finishGame("caught", searcher.role);
      return true;
    }
    return false;
  }

  pauseGame() {
    this.touchControls.clear();
    this.hideSpeechBubbles();
    this.isPaused = true;
    this.pauseChoiceYes = false;
    this.pauseRow = 0;
    this.pauseAudioChoice = 0;
    this.pauseStartedAt = this.time.now;
    this.tweens.pauseAll();
    this.updatePauseChoice();
    this.pausePanel.setVisible(true);
    this.pauseHeading.setVisible(true);
    this.pausePrompt.setVisible(true);
    this.pauseYes.setVisible(true);
    this.pauseNo.setVisible(true);
    this.pauseHint.setVisible(true);
    this.pauseAudioHintBackground.setVisible(true);
    this.pauseAudioHint.setVisible(true);
    this.pauseMenu.setVisible(true);
    this.pauseMusicButton.setVisible(true);
    this.pauseMusicText.setVisible(true);
    this.pauseSoundsButton.setVisible(true);
    this.pauseSoundsText.setVisible(true);
    this.updatePauseAudioButtons();
  }

  resumeGame() {
    if (!this.isPaused) return;
    const pausedFor = Math.max(0, this.time.now - this.pauseStartedAt);
    shiftNeutralSpeechTime(this.neutralSpeech, pausedFor);
    shiftDoorTime(this.doors, pausedFor);
    if (this.exitHintUntil) this.exitHintUntil += pausedFor;
    if (this.escapeStartedAt !== null) this.escapeStartedAt += pausedFor;
    for (const person of [...this.neutralPeople, ...this.searchers]) {
      person.nextMoveAt += pausedFor;
      if (person.visibleSince != null) person.visibleSince += pausedFor;
    }
    this.isPaused = false;
    this.pauseStartedAt = null;
    this.pausePanel.setVisible(false);
    this.pauseHeading.setVisible(false);
    this.pausePrompt.setVisible(false);
    this.pauseYes.setVisible(false);
    this.pauseNo.setVisible(false);
    this.pauseHint.setVisible(false);
    this.pauseAudioHintBackground.setVisible(false);
    this.pauseAudioHint.setVisible(false);
    this.pauseMenu.setVisible(false);
    this.pauseMusicButton.setVisible(false);
    this.pauseMusicText.setVisible(false);
    this.pauseSoundsButton.setVisible(false);
    this.pauseSoundsText.setVisible(false);
    this.tweens.resumeAll();
  }

  updatePauseAudioButtons() {
    if (!this.pauseMusicText || !this.pauseSoundsText) return;
    const settings = this.audio.getSettings();
    this.pauseMusicText.setText(`MUSIK: ${settings.music ? "AN" : "AUS"}`);
    this.pauseSoundsText.setText(`TÖNE: ${settings.sounds ? "AN" : "AUS"}`);
    this.pauseMusicText.setColor(settings.music ? "#f5f0dc" : "#b5c4ad");
    this.pauseSoundsText.setColor(settings.sounds ? "#f5f0dc" : "#b5c4ad");
    this.pauseMusicButton.setStrokeStyle(1, this.pauseRow === 2 && this.pauseAudioChoice === 0 ? 0xffe066 : 0x718573);
    this.pauseSoundsButton.setStrokeStyle(1, this.pauseRow === 2 && this.pauseAudioChoice === 1 ? 0xffe066 : 0x718573);
  }

  togglePauseAudioSetting(key) {
    this.audio.toggle(key);
    this.updatePauseAudioButtons();
  }

  updatePauseChoice() {
    if (!this.pauseYes || !this.pauseNo) return;
    const choices = this.pauseRow === 0;
    this.pauseYes.setText(`${choices && this.pauseChoiceYes ? "> " : "  "}Ja`);
    this.pauseNo.setText(`${choices && !this.pauseChoiceYes ? "> " : "  "}Nein`);
    this.pauseYes.setColor(choices && this.pauseChoiceYes ? "#ffe066" : "#b5c4ad");
    this.pauseNo.setColor(choices && !this.pauseChoiceYes ? "#ffe066" : "#b5c4ad");
    this.pauseMenu.setText(`${this.pauseRow === 1 ? "> " : ""}ZURÜCK ZUM STARTMENÜ`);
    this.pauseMenu.setColor(this.pauseRow === 1 ? "#ffe066" : "#d8b868");
    this.updatePauseAudioButtons();
  }

  requestMainMenu() {
    if (this.pauseTransitionPending) return;
    this.pauseTransitionPending = true;
    this.touchControls.clear();
    this.input.keyboard.resetKeys();
    // Defer until the current input finishes, so Enter cannot start a new game.
    this.time.delayedCall(0, () => this.scene.start("intro"));
  }

  confirmPauseChoice() {
    if (this.pauseTransitionPending) return;
    if (this.pauseRow === 1) this.requestMainMenu();
    else if (this.pauseRow === 2) this.togglePauseAudioSetting(this.pauseAudioChoice === 0 ? "music" : "sounds");
    else if (this.pauseChoiceYes) this.scene.restart();
    else this.resumeGame();
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
    this.speechBubbles = this.neutralPeople.map(() => ({
      tail: this.add.graphics().setScrollFactor(1).setDepth(89).setVisible(false),
      shape: this.add.graphics().setScrollFactor(1).setDepth(90).setVisible(false),
      text: this.add.text(0, 0, "", {
        resolution: RENDER_SCALE, fontFamily: "Arial, sans-serif", fontSize: "8px", color: "#20292a",
        padding: { x: 6, y: 5 }, wordWrap: { width: 124 }, lineSpacing: 2,
      }).setScrollFactor(1).setDepth(91).setVisible(false),
    }));
    this.dialogPanel = this.add.rectangle(160, 120, 288, 152, 0x172326, 0.98)
      .setStrokeStyle(2, 0xd8b868).setScrollFactor(0).setDepth(120).setVisible(false);
    this.dialogHeading = this.add.text(28, 57, "", {
      resolution: RENDER_SCALE, fontFamily: "Arial, sans-serif", fontSize: "11px", fontStyle: "bold", color: "#ffe066",
    }).setScrollFactor(0).setDepth(121).setVisible(false);
    this.dialogBody = this.add.text(28, 82, "", {
      resolution: RENDER_SCALE, fontFamily: "Arial, sans-serif", fontSize: "11px", color: "#f5f0dc",
      wordWrap: { width: 264 }, lineSpacing: 4,
    }).setScrollFactor(0).setDepth(121).setVisible(false);
    this.dialogHint = this.add.text(160, 178, "", {
      resolution: RENDER_SCALE, fontFamily: "Arial, sans-serif", fontSize: "8px", color: "#b5c4ad",
      wordWrap: { width: 264 }, align: "center",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(121).setVisible(false);
    this.hudPanel = this.add.rectangle(8, 8, 76, 30, 0x24332b, 0.96)
      .setOrigin(0).setScrollFactor(0).setDepth(100);
    this.keyHudText = this.add.text(312, 8, teamKeyProgress(this.collectedTeamKeys), {
      resolution: RENDER_SCALE, fontFamily: "Arial, sans-serif", fontSize: "8px",
      backgroundColor: "#24332b", padding: { x: 4, y: 3 },
      color: "#ded8bd", shadow: { offsetX: 0, offsetY: 1, color: "#172326", blur: 2, fill: true },
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(101);
    this.exitHintPanel = this.add.rectangle(160, 66, 272, 48, 0x24332b, 0.97)
      .setStrokeStyle(1, 0xd8b868).setScrollFactor(0).setDepth(102).setVisible(false);
    this.exitHintText = this.add.text(160, 66, LOCKED_EXIT_MESSAGE, {
      resolution: RENDER_SCALE, fontFamily: "Arial, sans-serif", fontSize: "10px",
      color: "#ffe066", align: "center", lineSpacing: 2,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(103).setVisible(false);
    this.hudLabel = this.add.text(14, 11, "ZEIT", {
      resolution: RENDER_SCALE, fontFamily: "Arial, sans-serif",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#b5c4ad",
    }).setScrollFactor(0).setDepth(101);
    this.timerText = this.add.text(14, 20, "03:00", {
      resolution: RENDER_SCALE, fontFamily: "Arial, sans-serif",
      fontSize: "12px",
      fontStyle: "bold",
      color: "#f5f0dc",
    }).setScrollFactor(0).setDepth(101);
    this.resultPanel = this.add.rectangle(160, 120, 272, 88, 0x172326, 0.96)
      .setStrokeStyle(2, 0xd8b868).setScrollFactor(0).setDepth(110).setVisible(false);
    this.resultText = this.add.text(160, 103, "", {
      resolution: RENDER_SCALE, fontFamily: "Arial, sans-serif",
      fontSize: "11px",
      fontStyle: "bold",
      color: "#f5f0dc",
      align: "center",
      lineSpacing: 5,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(111).setVisible(false);
    this.resultYes = this.add.text(122, 145, "Ja", {
      resolution: RENDER_SCALE, fontFamily: "Arial, sans-serif", fontSize: "11px", fontStyle: "bold", color: "#b5c4ad",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(111).setVisible(false).setInteractive({ useHandCursor: true });
    this.resultNo = this.add.text(198, 145, "Nein", {
      resolution: RENDER_SCALE, fontFamily: "Arial, sans-serif", fontSize: "11px", fontStyle: "bold", color: "#f5f0dc",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(111).setVisible(false).setInteractive({ useHandCursor: true });
    this.resultYes.on("pointerdown", () => this.confirmResultChoice(true));
    this.resultNo.on("pointerdown", () => this.confirmResultChoice(false));

    this.pausePanel = this.add.rectangle(160, 120, 272, 176, 0x172326, 0.97)
      .setStrokeStyle(2, 0xd8b868).setScrollFactor(0).setDepth(110).setVisible(false);
    this.pauseHeading = this.add.text(160, 52, "PAUSE", {
      resolution: RENDER_SCALE, fontFamily: "Arial, sans-serif", fontSize: "12px", fontStyle: "bold", color: "#f5f0dc",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(111).setVisible(false);
    this.pausePrompt = this.add.text(160, 75, "Versuch neu starten?", {
      resolution: RENDER_SCALE, fontFamily: "Arial, sans-serif", fontSize: "11px", color: "#f5f0dc",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(111).setVisible(false);
    this.pauseYes = this.add.text(122, 100, "Ja", {
      resolution: RENDER_SCALE, fontFamily: "Arial, sans-serif", fontSize: "11px", fontStyle: "bold", color: "#b5c4ad",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(111).setVisible(false).setInteractive({ useHandCursor: true });
    this.pauseNo = this.add.text(198, 100, "Nein", {
      resolution: RENDER_SCALE, fontFamily: "Arial, sans-serif", fontSize: "11px", fontStyle: "bold", color: "#f5f0dc",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(111).setVisible(false).setInteractive({ useHandCursor: true });
    this.pauseMenu = this.add.text(160, 124, "ZURÜCK ZUM STARTMENÜ", {
      resolution: RENDER_SCALE, fontFamily: "Arial, sans-serif", fontSize: "8px", fontStyle: "bold", color: "#d8b868",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(111).setVisible(false).setInteractive({ useHandCursor: true });
    this.pauseMusicButton = this.add.rectangle(95, 153, 122, 22, 0x30413a, 1)
      .setStrokeStyle(1, 0x718573).setScrollFactor(0).setDepth(111).setVisible(false)
      .setInteractive({ useHandCursor: true });
    this.pauseMusicText = this.add.text(95, 153, "MUSIK: AN", {
      resolution: RENDER_SCALE, fontFamily: "Arial, sans-serif", fontSize: "8px", fontStyle: "bold", color: "#f5f0dc",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(112).setVisible(false);
    this.pauseSoundsButton = this.add.rectangle(225, 153, 122, 22, 0x30413a, 1)
      .setStrokeStyle(1, 0x718573).setScrollFactor(0).setDepth(111).setVisible(false)
      .setInteractive({ useHandCursor: true });
    this.pauseSoundsText = this.add.text(225, 153, "TÖNE: AN", {
      resolution: RENDER_SCALE, fontFamily: "Arial, sans-serif", fontSize: "8px", fontStyle: "bold", color: "#f5f0dc",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(112).setVisible(false);
    this.pauseHint = this.add.text(160, 176, "↑↓ Auswahl · ←→ wechseln · Enter wählen · Esc weiter", {
      resolution: RENDER_SCALE, fontFamily: "Arial, sans-serif", fontSize: "8px", color: "#f5f0dc", align: "center",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(111).setVisible(false);
    this.pauseAudioHintBackground = this.add.rectangle(160, 194, 154, 17, 0x30413a, 1)
      .setStrokeStyle(1, 0xd8b868).setScrollFactor(0).setDepth(111).setVisible(false);
    this.pauseAudioHint = this.add.text(160, 194, "M: MUSIK  ·  T: TÖNE", {
      resolution: RENDER_SCALE, fontFamily: "Arial, sans-serif", fontSize: "9px", fontStyle: "bold", color: "#ffe066", align: "center",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(112).setVisible(false);
    this.pauseMenu.on("pointerdown", () => this.requestMainMenu());
    this.pauseMenu.on("pointerover", () => { this.pauseRow = 1; this.updatePauseChoice(); });
    this.pauseYes.on("pointerover", () => { this.pauseRow = 0; this.pauseChoiceYes = true; this.updatePauseChoice(); });
    this.pauseNo.on("pointerover", () => { this.pauseRow = 0; this.pauseChoiceYes = false; this.updatePauseChoice(); });
    this.pauseMusicButton.on("pointerover", () => { this.pauseRow = 2; this.pauseAudioChoice = 0; this.updatePauseChoice(); });
    this.pauseSoundsButton.on("pointerover", () => { this.pauseRow = 2; this.pauseAudioChoice = 1; this.updatePauseChoice(); });
    this.pauseMusicButton.on("pointerdown", () => this.togglePauseAudioSetting("music"));
    this.pauseSoundsButton.on("pointerdown", () => this.togglePauseAudioSetting("sounds"));
    this.pauseYes.on("pointerdown", () => {
      this.pauseRow = 0;
      this.pauseChoiceYes = true;
      this.updatePauseChoice();
      this.confirmPauseChoice();
    });
    this.pauseNo.on("pointerdown", () => {
      this.pauseRow = 0;
      this.pauseChoiceYes = false;
      this.updatePauseChoice();
      this.confirmPauseChoice();
    });
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
    if (this.isPaused || this.gameResult) return;
    if (collectTeamKey(this.collectedTeamKeys, { x, y }, this.teamKeys)) {
      this.drawTeamKeys();
      this.keyHudText.setText(teamKeyProgress(this.collectedTeamKeys));
      this.updateDoors(time, true);
    }
    const tileType = this.grid[y]?.[x];
    if (this.escapeStartedAt === null && tileType !== TILE_TYPES.START) {
      this.escapeStartedAt = time;
      this.hudLabel.setText("ZEIT ÜBRIG");
    }
    if (tileType === TILE_TYPES.EXIT && hasAllTeamKeys(this.collectedTeamKeys)) this.finishGame("win");
  }

  finishGame(result, caughtRole = null) {
    if (this.gameResult) return;
    this.gameResult = result;
    this.exitHintPanel.setVisible(false);
    this.exitHintText.setVisible(false);
    this.audio.play(result === "caught" ? "caught" : result === "win" ? "win" : "timeout");
    this.neutralSpeech.active = [];
    this.hideSpeechBubbles();
    this.caughtRole = caughtRole;
    this.isMoving = false;
    this.playerNextTile = null;
    this.tweens.killAll();
    this.touchControls.clear();
    if (result === "caught") {
      this.caughtDialog = createCaughtDialog(caughtRole, this.seenDialogRoles, this.repeatDialogCounts);
      this.dialogLastAdvancedAt = this.time.now;
      this.updateDialogText();
      this.dialogPanel.setVisible(true);
      this.dialogHeading.setVisible(true);
      this.dialogBody.setVisible(true);
      this.dialogHint.setVisible(true);
      return;
    }
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

      const target = person.detourRoute?.[0] ?? person.patrol.route[person.routeIndex];
      const canMoveToTile = tile => canNeutralMoveToTile(tile, {
        bounds: person.patrol.bounds,
        grid: this.grid,
        objects: this.roomObjects,
        otherPeople: [...this.neutralPeople.filter(other => other !== person), ...this.searchers],
        playerTiles: [this.playerTile, this.playerNextTile].filter(Boolean),
      });
      if (!canMoveToTile(target)) {
        person.blockedAttempts += 1;
        if (person.blockedAttempts >= 2) {
          const detour = findPatrolDetour({
            start: person.tile,
            route: person.patrol.route,
            routeIndex: person.routeIndex,
            canMoveToTile,
          });
          if (detour) {
            person.detourRoute = detour.path;
            person.detourResumeIndex = detour.resumeIndex;
            person.blockedAttempts = 0;
          }
        }
        person.nextMoveAt = time + NEUTRAL_RETRY_PAUSE_MS;
        continue;
      }

      person.blockedAttempts = 0;
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
          if (person.detourRoute) {
            person.detourRoute.shift();
            if (person.detourRoute.length === 0) {
              person.routeIndex = person.detourResumeIndex;
              person.detourRoute = null;
              person.detourResumeIndex = null;
            }
          } else {
            person.routeIndex = (person.routeIndex + 1) % person.patrol.route.length;
          }
          person.nextMoveAt = time + NEUTRAL_STEP_DURATION_MS + NEUTRAL_STEP_PAUSE_MS;
        },
      });
    }
  }

  updateSpeechBubble(time) {
    const camera = this.cameras.main;
    updateNeutralSpeech(this.neutralSpeech, time, this.neutralPeople, this.playerTile, person => {
      const bounds = person.bounds;
      const sameArea = bounds.area === "hall"
        ? [TILE_TYPES.HALL, TILE_TYPES.DOOR].includes(this.grid[this.playerTile.y]?.[this.playerTile.x])
        : this.playerTile.x >= bounds.x && this.playerTile.x < bounds.x + bounds.width
          && this.playerTile.y >= bounds.y && this.playerTile.y < bounds.y + bounds.height;
      return (sameArea || isMeetingSpeaker(person)) && camera.worldView.contains(person.sprite.x, person.sprite.y);
    });
    const speakingNow = new Set(this.neutralSpeech.active.map(item => item.personIndex));
    for (const personIndex of speakingNow) {
      if (!this.speakingPeople?.has(personIndex)) this.audio.play("speech");
    }
    this.speakingPeople = speakingNow;
    this.hideSpeechBubbles();
    const placed = [];
    for (const active of this.neutralSpeech.active) {
      if (!camera.worldView.contains(active.anchor.x, active.anchor.y)) continue;
      const { text, shape, tail } = this.speechBubbles[active.personIndex];
      if (text.text !== active.text) text.setText(active.text);
      const tipX = active.anchor.x;
      const tipY = active.anchor.y;
      const width = text.width;
      const height = text.height;
      if (!active.offset) {
        const x = tipX - width / 2;
        let y = tipY - height - 8;
        // Choose a speaker-relative offset once. Camera/player movement must
        // never reposition the bubble in the world.
        for (let attempt = 0; attempt < 2; attempt++) {
          if (placed.every(box => x + width + 4 <= box.x || x >= box.x + box.width + 4
            || y + height + 4 <= box.y || y >= box.y + box.height + 4)) break;
          y -= height + 6;
        }
        active.offset = { x: x - tipX, y: y - tipY };
      }
      const x = tipX + active.offset.x, y = tipY + active.offset.y;
      placed.push({ x, y, width, height });
      const tailX = Math.max(x + 10, Math.min(x + width - 10, tipX));
      const tailTipX = Math.max(tailX - 8, Math.min(tailX + 8, tipX));
      const tailTipY = Math.min(tipY, y + height + 10);
      shape.clear().fillStyle(0xf5f0dc, 1).lineStyle(1, 0x394744, 1)
        .fillRoundedRect(x, y, width, height, 6).strokeRoundedRect(x, y, width, height, 6).setVisible(true);
      // Tails sit behind every bubble body so they cannot cross another text.
      tail.clear().fillStyle(0xf5f0dc, 1).lineStyle(1, 0x394744, 1)
        .fillTriangle(tailX - 4, y + height - 1, tailX + 4, y + height - 1, tailTipX, tailTipY);
      tail.beginPath().moveTo(tailX - 4, y + height).lineTo(tailTipX, tailTipY)
        .lineTo(tailX + 4, y + height).strokePath().setVisible(true);
      text.setPosition(x, y).setVisible(true);
    }
  }

  hideSpeechBubbles() {
    for (const bubble of this.speechBubbles) {
      bubble.tail.setVisible(false);
      bubble.shape.setVisible(false);
      bubble.text.setVisible(false);
    }
  }

  canPlayerStep(direction) {
    const x = this.playerTile.x + direction.x;
    const y = this.playerTile.y + direction.y;
    return this.grid[y]?.[x] !== undefined && this.grid[y][x] !== TILE_TYPES.WALL
      && (this.grid[y][x] !== TILE_TYPES.EXIT || hasAllTeamKeys(this.collectedTeamKeys))
      && !objectAt(this.roomObjects, x, y, "blocksMovement")
      && !isTileOccupiedByPeople({ x, y }, [...this.neutralPeople, ...this.searchers]);
  }

  readDirection() {
    const touchDirection = this.touchControls.readDirection();
    if (touchDirection) return touchDirection;
    if (this.cursors.left.isDown || this.inputKeys.leftA.isDown) return { x: -1, y: 0 };
    if (this.cursors.right.isDown || this.inputKeys.rightD.isDown) return { x: 1, y: 0 };
    if (this.cursors.up.isDown || this.inputKeys.upW.isDown) return { x: 0, y: -1 };
    if (this.cursors.down.isDown || this.inputKeys.downS.isDown) return { x: 0, y: 1 };
    return null;
  }

  updateExitHint(time) {
    const playerTile = this.playerNextTile ?? this.playerTile;
    const nearby = this.doors.some(door => door.exit && door.tiles.some(tile =>
      Math.abs(tile.x - playerTile.x) + Math.abs(tile.y - playerTile.y) <= 1));
    if (nearby && !this.exitHintNearby && !hasAllTeamKeys(this.collectedTeamKeys)) {
      this.exitHintUntil = time + 4000;
    }
    this.exitHintNearby = nearby;
    if (!nearby) this.exitHintUntil = 0;
    const visible = nearby && !hasAllTeamKeys(this.collectedTeamKeys) && time < this.exitHintUntil;
    this.exitHintPanel.setVisible(visible);
    this.exitHintText.setVisible(visible);
  }

  drawTeamKeys() {
    const g = this.teamKeyGraphics;
    g.clear();
    for (const key of this.teamKeys) {
      if (this.collectedTeamKeys.has(key.team)) continue;
      const x = key.x * TILE_SIZE;
      const y = key.y * TILE_SIZE;
      g.fillStyle(0x24332b).fillRect(x + 1, y + 4, 14, 9);
      g.lineStyle(2, 0xffdf70).strokeRect(x + 3, y + 6, 4, 4);
      g.fillStyle(0xffdf70).fillRect(x + 7, y + 7, 7, 2);
      g.fillRect(x + 11, y + 9, 2, 3);
      g.fillStyle(0xfff3be).fillRect(x + 3, y + 5, 4, 1);
    }
  }

  drawRoomObjects() {
    drawPixelFurniture(this, this.roomObjects, TILE_SIZE);
  }
}
