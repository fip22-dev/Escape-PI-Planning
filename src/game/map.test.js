import assert from "node:assert/strict";
import test from "node:test";
import { createFloorPlan, TILE_TYPES } from "./map.js";

function reachableFrom(grid, start, blocked = new Set()) {
  const seen = new Set();
  const queue = [start];
  for (let i = 0; i < queue.length; i += 1) {
    const { x, y } = queue[i];
    const key = `${x},${y}`;
    if (seen.has(key) || blocked.has(key)) continue;
    seen.add(key);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nextX = x + dx;
      const nextY = y + dy;
      const tile = grid[nextY]?.[nextX];
      if (tile !== undefined && tile !== TILE_TYPES.WALL && !seen.has(`${nextX},${nextY}`)) {
        queue.push({ x: nextX, y: nextY });
      }
    }
  }
  return seen;
}

function doorTiles(room) {
  const doors = [];
  for (let dy = 0; dy < (room.doorHeight ?? 1); dy += 1) {
    for (let dx = 0; dx < (room.doorWidth ?? 1); dx += 1) {
      doors.push(`${room.doorX + dx},${room.doorY + dy}`);
    }
  }
  doors.push(...(room.additionalDoors ?? []).map(door => `${door.x},${door.y}`));
  return doors;
}

test("every side room is reachable only through its designated entrances", () => {
  const { grid, rooms, start } = createFloorPlan();
  const reachable = reachableFrom(grid, start);
  for (const room of rooms) {
    const interior = `${room.x + 1},${room.y + 1}`;
    const door = `${room.doorX},${room.doorY}`;
    assert.equal(grid[room.doorY][room.doorX], TILE_TYPES.DOOR, room.label);
    assert.ok(reachable.has(door) && reachable.has(interior), room.label);
    assert.ok(!reachableFrom(grid, start, new Set(doorTiles(room))).has(interior), room.label);
  }
});

test("exit and all crossings remain connected without passing through side rooms", () => {
  const { grid, rooms, start } = createFloorPlan();
  const blocked = new Set(rooms.flatMap(doorTiles));
  const reachable = reachableFrom(grid, start, blocked);
  assert.ok(reachable.has("34,2"), "exit");
  for (const y of [8, 20, 32]) {
    for (const x of [14, 24, 34]) assert.ok(reachable.has(`${x},${y}`), `crossing ${x},${y}`);
  }
  assert.ok(!reachableFrom(grid, start, new Set(["34,39", "35,39"])).has("34,2"), "PI room has one exit");
});

test("Meeting 1 remains accessible through either entrance independently", () => {
  const { grid, start } = createFloorPlan();
  assert.equal(grid[13][21], TILE_TYPES.DOOR);
  assert.equal(grid[17][21], TILE_TYPES.DOOR);
  for (const blockedDoor of ["21,13", "21,17"]) {
    assert.ok(reachableFrom(grid, start, new Set([blockedDoor])).has("22,15"));
  }
});

test("team rooms, break room, PI room and exit have two adjacent traversable lanes", () => {
  const { grid, start } = createFloorPlan();
  const reachable = reachableFrom(grid, start);
  const teamDoors = [
    [11, 8], [11, 18], [11, 29], [11, 37], [37, 8], [37, 20], [37, 32],
  ];
  for (const [x, y] of teamDoors) {
    for (const offset of [0, 1]) {
      assert.equal(grid[y + offset][x], TILE_TYPES.DOOR);
      assert.ok(reachable.has(`${x},${y + offset}`));
    }
  }
  for (const [x, y, tile] of [[22, 5, TILE_TYPES.DOOR], [34, 39, TILE_TYPES.DOOR], [33, 2, TILE_TYPES.EXIT]]) {
    for (const offset of [0, 1]) {
      assert.equal(grid[y][x + offset], tile);
      assert.ok(reachable.has(`${x + offset},${y}`));
      assert.notEqual(grid[y + 1][x + offset], TILE_TYPES.WALL);
      if (tile === TILE_TYPES.DOOR) assert.notEqual(grid[y - 1][x + offset], TILE_TYPES.WALL);
    }
    assert.notEqual(grid[y][x - 1], tile);
    assert.notEqual(grid[y][x + 2], tile);
  }
});
