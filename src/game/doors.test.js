import test from "node:test";
import assert from "node:assert/strict";
import { createFloorPlan } from "./map.js";
import { createDoors, doorAt, updateDoors, shiftDoorTime, DOOR_CLOSE_DELAY_MS } from "./doors.js";
import { canSearcherSeePlayer } from "./searcherDetection.js";

test("all 16 entrances including double doors, both Meeting 1 doors and exit start closed", () => {
  const { grid } = createFloorPlan();
  const doors = createDoors(grid);
  assert.equal(doors.length, 16);
  assert.equal(doors.flatMap(d => d.tiles).length, 26);
  assert.ok(doors.every(d => !d.open));
  assert.equal(doorAt(doors, { x: 12, y: 8 }), doorAt(doors, { x: 12, y: 9 }));
  assert.notEqual(doorAt(doors, { x: 21, y: 12 }), doorAt(doors, { x: 21, y: 18 }));
  assert.equal(doorAt(doors, { x: 34, y: 39 }).width, 2);
  assert.equal(doorAt(doors, { x: 33, y: 2 }).exit, true);
});

test("every room door lies in the surrounding wall opening, not on the inner threshold", () => {
  const { grid } = createFloorPlan();
  const before = JSON.stringify(grid);
  const doors = createDoors(grid);
  const expected = [
    [12, 8, 1, 2], [12, 18, 1, 2], [12, 29, 1, 2], [12, 37, 1, 2],
    [36, 8, 1, 2], [36, 20, 1, 2], [36, 32, 1, 2], [22, 6, 2, 1],
    [21, 12, 1, 1], [21, 18, 1, 1], [20, 22, 1, 1], [28, 22, 1, 1],
    [20, 34, 1, 1], [27, 34, 1, 1], [34, 39, 2, 1], [33, 2, 2, 1],
  ];
  assert.deepEqual(doors.map(d => [d.x, d.y, d.width, d.height]).sort(), expected.sort());
  assert.equal(doorAt(doors, { x: 11, y: 8 }), undefined);
  assert.equal(doorAt(doors, { x: 20, y: 35 }), undefined);
  assert.equal(doorAt(doors, { x: 37, y: 8 }), undefined);
  assert.equal(JSON.stringify(grid), before);
  updateDoors(doors, [{ tile: { x: 11, y: 8 }, nextTile: null }], 0);
  assert.equal(doorAt(doors, { x: 12, y: 8 }).open, false);
  updateDoors(doors, [{ tile: { x: 11, y: 8 }, nextTile: { x: 12, y: 8 } }], 1);
  assert.equal(doorAt(doors, { x: 12, y: 8 }).open, true);
});

test("player and NPC reservations open doors until the last actor clears both halves", () => {
  const doors = createDoors(createFloorPlan().grid);
  const door = doorAt(doors, { x: 12, y: 8 });
  const player = { tile: { x: 13, y: 8 }, nextTile: { x: 12, y: 8 } };
  const npc = { tile: { x: 12, y: 9 }, nextTile: { x: 11, y: 9 } };
  updateDoors(doors, [player, npc], 0);
  assert.equal(door.open, true);
  player.nextTile = null;
  updateDoors(doors, [player, npc], 1000);
  assert.equal(door.closeAt, null);
  npc.tile = npc.nextTile; npc.nextTile = null;
  updateDoors(doors, [player, npc], 1100);
  assert.equal(door.closeAt, 1100 + DOOR_CLOSE_DELAY_MS);
  updateDoors(doors, [player, npc], 1349);
  assert.equal(door.open, true);
  npc.nextTile = { x: 12, y: 9 };
  updateDoors(doors, [player, npc], 1350);
  assert.equal(door.closeAt, null);
  npc.nextTile = null;
  updateDoors(doors, [player, npc], 1400);
  shiftDoorTime(doors, 5000);
  updateDoors(doors, [player, npc], 6649);
  assert.equal(door.open, true);
  updateDoors(doors, [player, npc], 6650);
  assert.equal(door.open, false);
});

test("a closed door blocks sight in both directions; a crossing NPC opens the entire double door", () => {
  const { grid } = createFloorPlan();
  const doors = createDoors(grid);
  const options = { grid, doors, objects: [], neutralPeople: [],
    observerTile: { x: 9, y: 9 }, playerTile: { x: 13, y: 9 }, facing: { x: 1, y: 0 } };
  assert.equal(canSearcherSeePlayer(options), false);
  assert.equal(canSearcherSeePlayer({ ...options, observerTile: options.playerTile,
    playerTile: options.observerTile, facing: { x: -1, y: 0 } }), false);
  updateDoors(doors, [{ tile: { x: 11, y: 8 }, nextTile: { x: 12, y: 8 } }], 0);
  assert.equal(canSearcherSeePlayer(options), true);
  updateDoors(doors, [], 10);
  updateDoors(doors, [], 260);
  assert.equal(canSearcherSeePlayer(options), false);
});
