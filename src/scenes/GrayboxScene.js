import Phaser from "phaser";
import { createFloorPlan, MAP_HEIGHT, MAP_WIDTH, TILE_SIZE, TILE_TYPES } from "../game/map.js";
import { createRoomObjects, objectAt } from "../game/objects.js";

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

    // Statische Platzhalter für 37 neutrale Personen auf der ganzen Etage.
    const neutralPositions = [
      // Teamzimmer: zwei Personen pro Team, drei in zwei grösseren Teams.
      { x: 4, y: 7 }, { x: 9, y: 9 },
      { x: 4, y: 16 }, { x: 8, y: 19 }, { x: 10, y: 16 },
      { x: 4, y: 28 }, { x: 9, y: 30 },
      { x: 4, y: 36 }, { x: 9, y: 38 },
      { x: 39, y: 7 }, { x: 44, y: 10 },
      { x: 39, y: 19 }, { x: 44, y: 22 },
      { x: 39, y: 31 }, { x: 44, y: 34 }, { x: 41, y: 33 },
      // Pausenraum: fünf Personen.
      { x: 19, y: 3 }, { x: 26, y: 3 }, { x: 19, y: 4 }, { x: 23, y: 4 }, { x: 26, y: 4 },
      // Fünf kleine Sitzungszimmer: je eine Person.
      { x: 24, y: 16 }, { x: 21, y: 26 }, { x: 30, y: 26 }, { x: 19, y: 37 }, { x: 28, y: 37 },
      // PI-Einführungsraum: fünf Personen.
      { x: 31, y: 42 }, { x: 40, y: 43 }, { x: 32, y: 50 }, { x: 40, y: 51 }, { x: 36, y: 48 },
      // Gänge und Quergänge: sechs Personen.
      { x: 14, y: 12 }, { x: 14, y: 31 }, { x: 34, y: 13 }, { x: 34, y: 36 }, { x: 24, y: 8 }, { x: 27, y: 32 },
    ];

    const occupied = new Set();
    this.neutralPeople = neutralPositions.map(position => {
      let { x, y } = position;
      const room = rooms.find(room => x >= room.x && x < room.x + room.width
        && y >= room.y && y < room.y + room.height);
      const bounds = room ?? (y >= 40 ? { x: 29, y: 40, width: 14, height: 12 } : null);
      if (objectAt(this.roomObjects, x, y, "blocksMovement")) {
        const candidates = [];
        for (let cy = bounds.y; cy < bounds.y + bounds.height; cy += 1) {
          for (let cx = bounds.x; cx < bounds.x + bounds.width; cx += 1) {
            if (grid[cy][cx] !== TILE_TYPES.DOOR && !occupied.has(`${cx},${cy}`)
              && !neutralPositions.some(p => p.x === cx && p.y === cy)
              && !objectAt(this.roomObjects, cx, cy, "blocksMovement")) {
              candidates.push({ x: cx, y: cy });
            }
          }
        }
        candidates.sort((a, b) => (Math.abs(a.x - x) + Math.abs(a.y - y)) - (Math.abs(b.x - x) + Math.abs(b.y - y)));
        ({ x, y } = candidates[0]);
      }
      occupied.add(`${x},${y}`);
      const person = this.add.container((x + 0.5) * TILE_SIZE, (y + 0.5) * TILE_SIZE);
      const body = this.add.rectangle(0, 1, 8, 9, 0x71837f);
      body.setStrokeStyle(1, 0x394744);
      const head = this.add.circle(0, -5, 3, 0xc8ad8e);
      const hair = this.add.rectangle(0, -8, 6, 2, 0x4d514d);
      person.add([body, head, hair]);
      person.setDepth(3);
      return person;
    });

    const playerX = (start.x + 0.5) * TILE_SIZE;
    const playerY = (start.y + 0.5) * TILE_SIZE;
    this.player = this.add.container(playerX, playerY);
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

  }

  update(time) {
    if (this.isMoving || time - this.lastMoveAt < 105) return;

    const direction = this.readDirection();
    if (!direction) return;

    const targetX = this.playerTile.x + direction.x;
    const targetY = this.playerTile.y + direction.y;
    if (this.grid[targetY]?.[targetX] === undefined || this.grid[targetY][targetX] === TILE_TYPES.WALL
      || objectAt(this.roomObjects, targetX, targetY, "blocksMovement")) {
      return;
    }

    this.isMoving = true;
    this.lastMoveAt = time;
    this.tweens.add({
      targets: this.player,
      x: (targetX + 0.5) * TILE_SIZE,
      y: (targetY + 0.5) * TILE_SIZE,
      duration: 105,
      ease: "Linear",
      onComplete: () => {
        this.playerTile = { x: targetX, y: targetY };
        this.isMoving = false;
      },
    });
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
        // Tischdetails sind Dekoration ohne eigene Kollisions- oder Sichtfläche.
        g.fillStyle(0x253c4b).fillRect(x + 3, y + 3, 10, 6);
        g.fillStyle(0x85b7c2).fillRect(x + 4, y + 4, 8, 3);
        g.fillStyle(0x6f8188).fillRect(x + 2, y + 9, 12, 2);
        g.fillStyle(0xf1e9d5).fillRect(x + 17, y + 3, 6, 7);
        g.fillStyle(0xaaa591).fillRect(x + 18, y + 5, 4, 1);
        g.fillStyle(0xf7ead1).fillRect(x + w - 7, y + 6, 4, 4);
        g.fillStyle(0x64442f).fillRect(x + w - 6, y + 6, 2, 1);
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
      } else {
        g.fillStyle(0x3a4751).fillRect(x, y + 1, w, h - 2);
        g.fillStyle(0xe5e9df).fillRect(x + 2, y + 3, w - 4, h - 6);
        g.fillStyle(0x90adb1).fillRect(x + 8, y + 6, w - 16, 2);
      }
    }
  }
}
