import assert from "node:assert/strict";
import test from "node:test";
import { createFloorPlan, TILE_TYPES } from "./map.js";
import { createRoomObjects } from "./objects.js";
import { findPatrolDetour } from "./neutralMovement.js";
import {
  canSearcherMoveToTile,
  createSearcherPatrols,
  SEARCHER_ROLES,
  searcherDetectionPhase,
} from "./searcherDetection.js";

test("all fifteen searchers receive traversable role-appropriate patrols", () => {
  const { grid, rooms } = createFloorPlan();
  const objects = createRoomObjects(rooms);
  const searchers = createSearcherPatrols({ grid, objects, rooms });

  assert.equal(searchers.length, 15);
  assert.equal(searchers.filter(searcher => searcher.group === "Product Owner").length, 7);
  assert.equal(searchers.filter(searcher => searcher.role === "Scrum Master").length, 4);
  assert.equal(new Set(searchers.map(({ start }) => `${start.x},${start.y}`)).size, searchers.length,
    "every searcher has a unique starting tile");
  assert.deepEqual(searchers.slice(0, 4).map(searcher => searcher.role), ["RTE", "P&T", "BO", "PM"]);
  assert.deepEqual(searchers.filter(searcher => searcher.group === "Product Owner")
    .map(searcher => searcher.role), [
    "PO · WCL", "PO · WSW", "PO · WDPS", "PO · EMS", "PO · MAC", "PO · M365", "PO · CMS",
  ]);
  const productOwners = searchers.filter(searcher => searcher.group === "Product Owner");
  for (let index = 0; index < productOwners.length; index += 1) {
    for (const other of productOwners.slice(index + 1)) {
      const routeTiles = new Set(productOwners[index].route.map(({ x, y }) => `${x},${y}`));
      const otherRouteTiles = new Set(other.route.map(({ x, y }) => `${x},${y}`));
      const sharedTileCount = [...routeTiles].filter(tile => otherRouteTiles.has(tile)).length;
      assert.ok(sharedTileCount <= 1,
        `${productOwners[index].role} and ${other.role} should not share a long patrol segment`);
    }
  }
  for (const searcher of searchers.slice(1)) {
    assert.ok(searcher.route.length > 1, `${searcher.role} has a patrol`);
    for (let index = 0; index < searcher.route.length; index += 1) {
      const tile = searcher.route[index];
      const previous = index === 0 ? searcher.start : searcher.route[index - 1];
      assert.equal(Math.abs(tile.x - previous.x) + Math.abs(tile.y - previous.y), 1,
        `${searcher.role} uses adjacent steps`);
      const insideHomeRoom = searcher.homeRoom && tile.x >= searcher.homeRoom.x
        && tile.x < searcher.homeRoom.x + searcher.homeRoom.width
        && tile.y >= searcher.homeRoom.y && tile.y < searcher.homeRoom.y + searcher.homeRoom.height;
      const terrainAllowed = grid[tile.y][tile.x] === TILE_TYPES.HALL || grid[tile.y][tile.x] === TILE_TYPES.EXIT
        || (searcher.homeRoom && grid[tile.y][tile.x] === TILE_TYPES.DOOR)
        || (insideHomeRoom && grid[tile.y][tile.x] === TILE_TYPES.FLOOR);
      assert.ok(terrainAllowed, `${searcher.role} stays in hallways and its home room`);
      assert.equal(objects.some(object => object.blocksMovement && tile.x >= object.x
        && tile.x < object.x + object.width && tile.y >= object.y && tile.y < object.y + object.height), false,
      `${searcher.role} avoids solid objects`);
    }
    if (searcher.homeRoom) {
      assert.equal(grid[searcher.start.y][searcher.start.x], TILE_TYPES.FLOOR,
        `${searcher.role} starts inside its team room`);
      assert.deepEqual(searcher.route.at(-1), { ...searcher.start, waitMs: 2_500 },
        `${searcher.role} returns inside its team room`);
      assert.ok(searcher.route.some(tile => grid[tile.y][tile.x] === TILE_TYPES.DOOR),
        `${searcher.role} passes through its team's doorway`);
    }
  }

  for (const role of SEARCHER_ROLES) {
    const patrol = searchers.find(searcher => searcher === role || (searcher.role === role.role
      && searcher.start.x === role.start.x && searcher.start.y === role.start.y));
    for (const visit of role.visits) {
      assert.ok(patrol.route.some(tile => tile.x === visit.x && tile.y === visit.y),
        `${role.role} visits ${visit.x},${visit.y}`);
    }
  }
});

test("a patrol detours around occupied and reserved hallway tiles, then rejoins ahead", () => {
  const { grid, rooms } = createFloorPlan();
  const objects = createRoomObjects(rooms);
  const start = { x: 34, y: 37 };
  const route = [
    { x: 34, y: 36 }, { x: 34, y: 35 }, { x: 34, y: 34 }, { x: 34, y: 33 },
  ];
  const otherPerson = { tile: { x: 34, y: 36 }, nextTile: { x: 34, y: 35 } };
  const detour = findPatrolDetour({
    start,
    route,
    routeIndex: 0,
    canMoveToTile: tile => canSearcherMoveToTile(tile, {
      grid,
      objects,
      otherPeople: [otherPerson],
      playerTiles: [],
    }),
  });

  assert.ok(detour);
  assert.equal(detour.resumeIndex, 3);
  assert.deepEqual(detour.path.at(-1), { ...route[2], waitMs: 0 });
  let previous = start;
  for (const tile of detour.path) {
    assert.equal(Math.abs(tile.x - previous.x) + Math.abs(tile.y - previous.y), 1);
    assert.ok(canSearcherMoveToTile(tile, {
      grid,
      objects,
      otherPeople: [otherPerson],
      playerTiles: [],
    }));
    previous = tile;
  }
});

test("a product owner can detour around a blocked doorway without leaving its team area", () => {
  const { grid, rooms } = createFloorPlan();
  const objects = createRoomObjects(rooms);
  const searcher = createSearcherPatrols({ grid, objects, rooms })
    .find(person => person.role === "PO · WCL");
  const blockedDoorTile = searcher.route[0];
  const otherPerson = { tile: blockedDoorTile, nextTile: null };
  const detour = findPatrolDetour({
    start: searcher.start,
    route: searcher.route,
    routeIndex: 0,
    canMoveToTile: tile => canSearcherMoveToTile(tile, {
      grid,
      objects,
      homeRoom: searcher.homeRoom,
      otherPeople: [otherPerson],
      playerTiles: [],
    }),
  });

  assert.ok(detour);
  assert.ok(detour.path.some(tile => tile.x >= searcher.homeRoom.x && tile.x < searcher.homeRoom.x + searcher.homeRoom.width
    && tile.y >= searcher.homeRoom.y && tile.y < searcher.homeRoom.y + searcher.homeRoom.height));
  assert.ok(detour.path.every(tile => !(tile.x === blockedDoorTile.x && tile.y === blockedDoorTile.y)));
  for (const tile of detour.path) {
    assert.ok(canSearcherMoveToTile(tile, {
      grid,
      objects,
      homeRoom: searcher.homeRoom,
      otherPeople: [otherPerson],
      playerTiles: [],
    }));
  }
});

test("searcher warning turns red before the earlier catch threshold", () => {
  assert.equal(searcherDetectionPhase(0), "yellow");
  assert.equal(searcherDetectionPhase(299), "yellow");
  assert.equal(searcherDetectionPhase(300), "red");
  assert.equal(searcherDetectionPhase(599), "red");
  assert.equal(searcherDetectionPhase(600), "caught");
});
