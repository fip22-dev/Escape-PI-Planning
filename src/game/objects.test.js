import assert from "node:assert/strict";
import test from "node:test";
import { createFloorPlan, TILE_TYPES } from "./map.js";
import { createRoomObjects, objectAt, OBJECT_RULES } from "./objects.js";

test("furniture never overlaps walls, doors, other objects or the player spawn", () => {
  const { grid, rooms, start } = createFloorPlan();
  const objects = createRoomObjects(rooms);
  const occupied = new Set();
  for (const object of objects) {
    for (let y = object.y; y < object.y + object.height; y += 1) {
      for (let x = object.x; x < object.x + object.width; x += 1) {
        const allowed = ["plant", "printer"].includes(object.type)
          ? [TILE_TYPES.FLOOR, TILE_TYPES.START, TILE_TYPES.HALL]
          : [TILE_TYPES.FLOOR, TILE_TYPES.START];
        assert.ok(allowed.includes(grid[y]?.[x]), `${object.type} at ${x},${y}`);
        assert.ok(!occupied.has(`${x},${y}`), `overlap at ${x},${y}`);
        occupied.add(`${x},${y}`);
      }
    }
  }
  assert.ok(!objectAt(objects, start.x, start.y, "blocksMovement"));
});

test("every free floor tile remains accessible with solid furniture", () => {
  const { grid, rooms, start } = createFloorPlan();
  const objects = createRoomObjects(rooms);
  const seen = new Set();
  const queue = [start];
  for (let i = 0; i < queue.length; i += 1) {
    const { x, y } = queue[i];
    if (seen.has(`${x},${y}`)) continue;
    seen.add(`${x},${y}`);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (grid[ny]?.[nx] !== undefined && grid[ny][nx] !== TILE_TYPES.WALL
        && !objectAt(objects, nx, ny, "blocksMovement") && !seen.has(`${nx},${ny}`)) queue.push({ x: nx, y: ny });
    }
  }
  for (let y = 0; y < grid.length; y += 1) {
    for (let x = 0; x < grid[y].length; x += 1) {
      if (grid[y][x] !== TILE_TYPES.WALL && !objectAt(objects, x, y, "blocksMovement")) {
        assert.ok(seen.has(`${x},${y}`), `unreachable tile ${x},${y}`);
      }
    }
  }
});

test("object collision and sight properties follow the agreed rules", () => {
  for (const type of ["plant", "table", "coffee", "sideboard", "printer"]) {
    assert.deepEqual(OBJECT_RULES[type], { blocksMovement: true, blocksSight: true });
  }
  for (const type of ["chair", "screen", "whiteboard"]) {
    assert.deepEqual(OBJECT_RULES[type], { blocksMovement: false, blocksSight: false });
  }
  assert.deepEqual(OBJECT_RULES.bin, { blocksMovement: true, blocksSight: false });
});

test("team and meeting screens are smaller than the PI screen and avoid their doors", () => {
  const { rooms } = createFloorPlan();
  const objects = createRoomObjects(rooms);
  const screens = objects.filter(object => object.type === "screen");
  const piScreen = screens.find(object => object.y === 40);
  assert.equal(screens.length, 13);
  for (const room of rooms.filter(room => room.label !== "Pausenraum")) {
    const screen = screens.find(object => object.x >= room.x && object.x < room.x + room.width
      && object.y >= room.y && object.y < room.y + room.height);
    assert.ok(screen && screen.width < piScreen.width, room.label);
    assert.equal(screen.blocksMovement, false);
    assert.equal(screen.blocksSight, false);
  }
});
