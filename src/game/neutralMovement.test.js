import assert from "node:assert/strict";
import test from "node:test";
import { createFloorPlan, TILE_TYPES } from "./map.js";
import { createRoomObjects } from "./objects.js";
import {
  canNeutralMoveToTile,
  createNeutralPatrol,
  BREAK_ROOM_ROUTES,
  isTileOccupiedByPeople,
  MEETING_TWO_ROUTE,
  NEUTRAL_PATROL_RADIUS,
  NEUTRAL_RETRY_PAUSE_MS,
  NEUTRAL_START_POSITIONS,
  NEUTRAL_STEP_DURATION_MS,
  NEUTRAL_STEP_PAUSE_MS,
  resolveNeutralStartPositions,
} from "./neutralMovement.js";

function setup() {
  const { grid, rooms } = createFloorPlan();
  const objects = createRoomObjects(rooms);
  const starts = resolveNeutralStartPositions(NEUTRAL_START_POSITIONS, { rooms, grid, objects });
  const patrols = starts.map((start, index) => {
    const original = NEUTRAL_START_POSITIONS[index];
    const breakRoomRoute = BREAK_ROOM_ROUTES[`${original.x},${original.y}`];
    if (breakRoomRoute) {
      return {
        route: breakRoomRoute,
        bounds: start.bounds,
        radius: Math.max(...breakRoomRoute.map(tile =>
          Math.abs(tile.x - start.x) + Math.abs(tile.y - start.y))),
      };
    }
    if (original.x === 21 && original.y === 26) {
      return { route: MEETING_TWO_ROUTE, bounds: start.bounds, radius: 5 };
    }
    return createNeutralPatrol(start, {
      bounds: start.bounds,
      grid,
      objects,
      otherStarts: starts.filter((_, otherIndex) => otherIndex !== index),
      directionOffset: index % 4,
    });
  });
  return { grid, rooms, objects, starts, patrols };
}

test("all 37 people have a unique legal start and a room- or hall-bound patrol", () => {
  const { grid, objects, starts, patrols } = setup();

  assert.equal(starts.length, 37);
  assert.equal(patrols.length, 37);
  assert.equal(new Set(starts.map(({ x, y }) => `${x},${y}`)).size, 37);
  patrols.forEach((patrol, index) => {
    assert.ok(patrol, `person ${index + 1} patrol`);
    assert.ok(patrol.route.length > 1, `person ${index + 1} has a movement route`);
    assert.ok(!objectAtBlocking(objects, starts[index]), `person ${index + 1} starts on a free tile`);
    assert.ok(canNeutralMoveToTile(starts[index], { bounds: patrol.bounds, grid, objects }));
  });
});

test("every patrol stays within its area, avoids doors and solids, and uses adjacent steps", () => {
  const { grid, objects, starts, patrols } = setup();

  patrols.forEach((patrol, index) => {
    const start = starts[index];
    for (let routeIndex = 0; routeIndex < patrol.route.length; routeIndex += 1) {
      const tile = patrol.route[routeIndex];
      const next = patrol.route[(routeIndex + 1) % patrol.route.length];
      assert.ok(canNeutralMoveToTile(tile, { bounds: patrol.bounds, grid, objects }), `person ${index + 1}`);
      assert.notEqual(grid[tile.y][tile.x], TILE_TYPES.DOOR);
      assert.equal(objectAtBlocking(objects, tile), false);
      assert.equal(Math.abs(tile.x - next.x) + Math.abs(tile.y - next.y), 1, `person ${index + 1}`);
      const distance = Math.abs(tile.x - start.x) + Math.abs(tile.y - start.y);
      assert.ok(distance <= patrol.radius, `person ${index + 1} exceeds its declared radius`);
    }
  });
});

test("patrols expand their movement area up to four tiles where the room allows it", () => {
  const { patrols } = setup();
  const expanded = patrols.filter((patrol, index) => index !== 22 && patrol.radius >= 3);

  assert.equal(NEUTRAL_PATROL_RADIUS, 4);
  assert.ok(expanded.length >= 28, `${expanded.length} routes cover at least three tiles`);
  assert.ok(patrols[22].radius >= 4, "Meeting 2 keeps its table loop");
});

test("Meeting 2 route circles the table and reaches all four sides", () => {
  const { grid, objects, rooms, patrols } = setup();
  const patrol = patrols[22];
  const room = rooms.find(candidate => candidate.label === "Meeting 2");
  const table = objects.find(object => object.type === "table" && object.x === 19 && object.y === 25);

  assert.ok(table);
  for (const tile of patrol.route) {
    assert.ok(canNeutralMoveToTile(tile, { bounds: room, grid, objects }));
    assert.ok(tile.x < table.x || tile.x >= table.x + table.width
      || tile.y < table.y || tile.y >= table.y + table.height);
  }
  assert.ok(patrol.route.some(tile => tile.y < table.y), "route above table");
  assert.ok(patrol.route.some(tile => tile.y >= table.y + table.height), "route below table");
  assert.ok(patrol.route.some(tile => tile.x < table.x), "route left of table");
  assert.ok(patrol.route.some(tile => tile.x >= table.x + table.width), "route right of table");
});

test("the five break-room routes avoid one another and never stall at shared bottlenecks", () => {
  const { grid, objects, rooms, starts, patrols } = setup();
  const breakRoom = rooms.find(room => room.label === "Pausenraum");
  const breakPeople = NEUTRAL_START_POSITIONS
    .map((position, index) => ({ position, start: starts[index], patrol: patrols[index] }))
    .filter(person => person.start.bounds.label === "Pausenraum");

  assert.equal(breakPeople.length, 5);
  const routeTiles = breakPeople.map(({ patrol }) => new Set(patrol.route.map(tile => `${tile.x},${tile.y}`)));
  for (let first = 0; first < routeTiles.length; first += 1) {
    for (let second = first + 1; second < routeTiles.length; second += 1) {
      assert.equal([...routeTiles[first]].some(tile => routeTiles[second].has(tile)), false,
        `break-room routes ${first + 1} and ${second + 1} must not intersect`);
    }
  }
  for (const { start, patrol } of breakPeople) {
    for (let index = 0; index < patrol.route.length; index += 1) {
      const tile = patrol.route[index];
      const next = patrol.route[(index + 1) % patrol.route.length];
      assert.ok(canNeutralMoveToTile(tile, { bounds: breakRoom, grid, objects }));
      assert.equal(Math.abs(tile.x - next.x) + Math.abs(tile.y - next.y), 1);
      assert.ok(Math.abs(tile.x - start.x) + Math.abs(tile.y - start.y) <= patrol.radius);
    }
  }
});

test("all people move slowly and pause after each tile", () => {
  assert.equal(NEUTRAL_STEP_DURATION_MS, 650);
  assert.equal(NEUTRAL_STEP_PAUSE_MS, 700);
  assert.equal(NEUTRAL_RETRY_PAUSE_MS, 500);
});

test("all routes keep reserved person tiles collision-free during concurrent movement", () => {
  const { grid, objects, starts, patrols } = setup();
  const people = starts.map((start, index) => ({
    tile: { x: start.x, y: start.y },
    nextTile: null,
    patrol: patrols[index],
    routeIndex: patrols[index].route.length > 1 ? 1 : 0,
    nextMoveAt: 1800 + index * 230,
    movingUntil: null,
    moves: 0,
  }));
  const playerTile = { x: 34, y: 47 };

  for (let time = 0; time <= 45000; time += 50) {
    for (const person of people) {
      if (person.movingUntil === time) {
        person.tile = person.nextTile;
        person.nextTile = null;
        person.routeIndex = (person.routeIndex + 1) % person.patrol.route.length;
        person.moves += 1;
        person.nextMoveAt = time + NEUTRAL_STEP_PAUSE_MS;
        person.movingUntil = null;
      }
    }
    for (const person of people) {
      if (person.movingUntil || time < person.nextMoveAt) continue;
      const target = person.patrol.route[person.routeIndex];
      if (!canNeutralMoveToTile(target, {
        bounds: person.patrol.bounds,
        grid,
        objects,
        otherPeople: people.filter(other => other !== person),
        playerTiles: [playerTile],
      })) {
        person.nextMoveAt = time + NEUTRAL_RETRY_PAUSE_MS;
        continue;
      }
      person.nextTile = target;
      person.movingUntil = time + NEUTRAL_STEP_DURATION_MS;
    }
    const reserved = people.flatMap(person => [person.tile, person.nextTile].filter(Boolean));
    assert.equal(new Set(reserved.map(tile => `${tile.x},${tile.y}`)).size, reserved.length,
      `no person may share a current or reserved tile at ${time}ms`);
  }

  assert.ok(people.every(person => person.moves > 0), "all people move without a collision deadlock");
  assert.ok(people.slice(16, 21).every(person => person.moves >= 15),
    "all five break-room occupants keep moving throughout the simulation");
});

test("neutral people occupy their current and reserved next tile", () => {
  const person = { tile: { x: 8, y: 20 }, nextTile: { x: 9, y: 20 } };

  assert.ok(isTileOccupiedByPeople({ x: 8, y: 20 }, [person]));
  assert.ok(isTileOccupiedByPeople({ x: 9, y: 20 }, [person]));
  assert.ok(!isTileOccupiedByPeople({ x: 10, y: 20 }, [person]));
});

test("neutral movement rejects bounds, doors, solids, people and player tiles", () => {
  const { grid, rooms, objects } = setup();
  const teamRoom = rooms.find(room => room.label === "Windows\nClient Team");
  const routeTile = { x: 5, y: 7 };
  const blockedDoor = { x: teamRoom.doorX, y: teamRoom.doorY };
  const solidFurniture = objects.find(object => object.blocksMovement);

  assert.ok(!canNeutralMoveToTile({ x: 1, y: 7 }, { bounds: teamRoom, grid, objects }));
  assert.ok(!canNeutralMoveToTile(blockedDoor, { bounds: teamRoom, grid, objects }));
  assert.ok(!canNeutralMoveToTile(
    { x: solidFurniture.x, y: solidFurniture.y }, { bounds: teamRoom, grid, objects },
  ));
  assert.ok(!canNeutralMoveToTile(routeTile, {
    bounds: teamRoom, grid, objects, otherPeople: [{ tile: routeTile }],
  }));
  assert.ok(!canNeutralMoveToTile(routeTile, { bounds: teamRoom, grid, objects, playerTiles: [routeTile] }));
});

function objectAtBlocking(objects, tile) {
  return objects.some(object => object.blocksMovement && tile.x >= object.x && tile.x < object.x + object.width
    && tile.y >= object.y && tile.y < object.y + object.height);
}
