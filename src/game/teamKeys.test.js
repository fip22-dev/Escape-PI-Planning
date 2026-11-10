import test from "node:test";
import assert from "node:assert/strict";
import { TEAM_KEYS, createTeamKeys, collectTeamKey, hasAllTeamKeys, teamKeyProgress } from "./teamKeys.js";
import { createFloorPlan, TILE_TYPES } from "./map.js";
import { createRoomObjects, objectAt } from "./objects.js";
import { createDoors, updateDoors } from "./doors.js";

function keyPlan(random = () => 0, previous = []) {
  const plan = createFloorPlan();
  return createTeamKeys({ ...plan, objects: createRoomObjects(plan.rooms) }, random, previous);
}

test("seven unique keys, duplicate pickups and unknown teams cannot unlock the exit", () => {
  const collected = new Set(["unknown"]);
  const keys = keyPlan();
  assert.equal(collectTeamKey(collected, { x: 34, y: 47 }, keys), null);
  for (const [i, key] of keys.entries()) {
    assert.equal(hasAllTeamKeys(collected), false);
    assert.equal(collectTeamKey(collected, key, keys), key);
    assert.equal(collectTeamKey(collected, key, keys), null);
    assert.equal(collected.size, i + 2);
  }
  assert.equal(hasAllTeamKeys(collected), true);
  assert.equal(teamKeyProgress(collected), "Schlüssel 7/7");
  assert.equal(teamKeyProgress(new Set()), "Schlüssel 0/7");
});

test("exit stays closed for zero through six keys even with NPC occupancy and reservations", () => {
  const { grid } = createFloorPlan();
  const doors = createDoors(grid);
  const exit = doors.find(d => d.exit);
  const actors = [{ tile: { x: 34, y: 2 }, nextTile: { x: 33, y: 2 } }];
  const collected = new Set();
  const keys = keyPlan();
  for (const key of keys) {
    exit.open = true;
    updateDoors(doors, actors, 100, hasAllTeamKeys(collected));
    assert.equal(exit.open, false);
    assert.equal(exit.closeAt, null);
    collectTeamKey(collected, key, keys);
  }
  updateDoors(doors, actors, 200, hasAllTeamKeys(collected));
  assert.equal(exit.open, true);
  updateDoors(doors, actors, 300, hasAllTeamKeys(new Set()));
  assert.equal(exit.open, false);
});

test("all keys occupy separate team rooms on reachable free floor; collection route fits 180s geometrically", () => {
  const { grid, rooms, start } = createFloorPlan();
  const objects = createRoomObjects(rooms);
  const path = (from, to) => {
    const queue = [{ ...from, steps: 0 }];
    const seen = new Set([`${from.x},${from.y}`]);
    for (const p of queue) {
      if (p.x === to.x && p.y === to.y) return p.steps;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const x = p.x + dx, y = p.y + dy, id = `${x},${y}`;
        if (grid[y]?.[x] === undefined || grid[y][x] === TILE_TYPES.WALL || objectAt(objects, x, y, "blocksMovement") || seen.has(id)) continue;
        seen.add(id); queue.push({ x, y, steps: p.steps + 1 });
      }
    }
    assert.fail(`Unreachable ${to.x},${to.y}`);
  };
  const keys = keyPlan();
  const keyRooms = keys.map(key => {
    assert.equal(grid[key.y][key.x], TILE_TYPES.FLOOR);
    assert.equal(objectAt(objects, key.x, key.y, "blocksMovement"), false);
    return rooms.find(r => key.x >= r.x && key.x < r.x + r.width && key.y >= r.y && key.y < r.y + r.height);
  });
  assert.equal(new Set(keyRooms).size, 7);
  assert.ok(keyRooms.every(r => r?.label.includes("Team")));
  let steps = 0, previous = start;
  for (const next of [keys[3], keys[2], keys[1], keys[0], keys[4], keys[5], keys[6], { x: 34, y: 2 }]) {
    steps += path(previous, next); previous = next;
  }
  assert.ok(steps * 105 < 180_000, `${steps} steps`);
});

test("each new attempt randomizes all seven keys on bare floor within its own room", () => {
  const { rooms } = createFloorPlan();
  const objects = createRoomObjects(rooms);
  let previous = keyPlan();
  for (let i = 0; i < 100; i++) {
    const next = keyPlan(() => (i % 10) / 10, previous);
    for (const key of next) {
      const old = previous.find(p => p.team === key.team);
      assert.ok(key.x !== old.x || key.y !== old.y, key.team);
      const room = rooms.find(r => r.label === TEAM_KEYS.find(t => t.team === key.team).room);
      assert.ok(key.x > room.x && key.x < room.x + room.width - 1);
      assert.ok(key.y > room.y && key.y < room.y + room.height - 1);
      assert.ok(!objects.some(o => key.x >= o.x && key.x < o.x + o.width && key.y >= o.y && key.y < o.y + o.height));
    }
    previous = next;
  }
  assert.notDeepEqual(keyPlan(() => 0), keyPlan(() => .999));
});
