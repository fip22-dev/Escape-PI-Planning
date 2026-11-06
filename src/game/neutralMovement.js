import { TILE_TYPES } from "./map.js";
import { objectAt } from "./objects.js";

export const NEUTRAL_STEP_DURATION_MS = 650;
export const NEUTRAL_STEP_PAUSE_MS = 700;
export const NEUTRAL_RETRY_PAUSE_MS = 500;
export const NEUTRAL_PATROL_RADIUS = 4;
export const MEETING_TWO_ROUTE = [
  { x: 21, y: 26 }, { x: 21, y: 25 }, { x: 21, y: 24 },
  { x: 20, y: 24 }, { x: 19, y: 24 }, { x: 18, y: 24 },
  { x: 18, y: 25 }, { x: 18, y: 26 }, { x: 18, y: 27 },
  { x: 19, y: 27 }, { x: 20, y: 27 }, { x: 21, y: 27 },
];
export const BREAK_ROOM_ROUTES = {
  "19,3": [
    { x: 19, y: 3 }, { x: 20, y: 3 }, { x: 21, y: 3 }, { x: 21, y: 2 },
    { x: 20, y: 2 }, { x: 19, y: 2 }, { x: 20, y: 2 }, { x: 21, y: 2 },
    { x: 21, y: 3 }, { x: 20, y: 3 },
  ],
  "26,3": [
    { x: 26, y: 3 }, { x: 26, y: 2 }, { x: 25, y: 2 }, { x: 24, y: 2 },
    { x: 24, y: 3 }, { x: 25, y: 3 }, { x: 24, y: 3 }, { x: 24, y: 2 },
    { x: 25, y: 2 }, { x: 26, y: 2 },
  ],
  "19,4": [{ x: 18, y: 4 }, { x: 18, y: 3 }],
  "23,4": [
    { x: 23, y: 4 }, { x: 22, y: 4 }, { x: 22, y: 3 }, { x: 22, y: 2 },
    { x: 23, y: 2 }, { x: 23, y: 3 }, { x: 23, y: 2 }, { x: 22, y: 2 },
    { x: 22, y: 3 }, { x: 22, y: 4 },
  ],
  "26,4": [{ x: 27, y: 4 }, { x: 27, y: 3 }, { x: 27, y: 2 }, { x: 27, y: 3 }],
};

export const NEUTRAL_START_POSITIONS = [
  // Teamzimmer: zwei Personen pro Team, drei in zwei grösseren Teams.
  { x: 4, y: 7 }, { x: 9, y: 9 },
  { x: 4, y: 16 }, { x: 8, y: 20 }, { x: 10, y: 16 },
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
  { x: 31, y: 42 }, { x: 37, y: 43 }, { x: 32, y: 50 }, { x: 40, y: 51 }, { x: 36, y: 49 },
  // Gänge und Quergänge: sechs Personen.
  { x: 14, y: 12 }, { x: 14, y: 31 }, { x: 34, y: 13 }, { x: 34, y: 36 }, { x: 24, y: 8 }, { x: 27, y: 32 },
];

export function sameTile(first, second) {
  return Boolean(first && second && first.x === second.x && first.y === second.y);
}

export function isTileOccupiedByPeople(tile, people) {
  return people.some(person => sameTile(tile, person.tile) || sameTile(tile, person.nextTile));
}

export function neutralBoundsForPosition(position, rooms) {
  const room = rooms.find(candidate => position.x >= candidate.x && position.x < candidate.x + candidate.width
    && position.y >= candidate.y && position.y < candidate.y + candidate.height);
  if (room) return room;
  if (position.y >= 40) return { x: 29, y: 40, width: 14, height: 12 };
  if (position.x >= 12 && position.x <= 16) return { x: 12, y: 2, width: 5, height: 38, area: "hall" };
  if (position.x >= 32 && position.x <= 36) return { x: 32, y: 2, width: 5, height: 38, area: "hall" };
  if (position.y >= 6 && position.y <= 10) return { x: 16, y: 6, width: 18, height: 5, area: "hall" };
  if (position.y >= 18 && position.y <= 22) return { x: 16, y: 18, width: 18, height: 5, area: "hall" };
  if (position.y >= 30 && position.y <= 34) return { x: 16, y: 30, width: 18, height: 5, area: "hall" };
  return null;
}

export function resolveNeutralStartPositions(positions, { rooms, grid, objects }) {
  const occupied = new Set();
  return positions.map(position => {
    const bounds = neutralBoundsForPosition(position, rooms);
    let start = { ...position };
    if (objectAt(objects, start.x, start.y, "blocksMovement") || occupied.has(`${start.x},${start.y}`)) {
      const candidates = [];
      for (let y = bounds.y; y < bounds.y + bounds.height; y += 1) {
        for (let x = bounds.x; x < bounds.x + bounds.width; x += 1) {
          const candidate = { x, y };
          if (grid[y]?.[x] !== TILE_TYPES.DOOR && !occupied.has(`${x},${y}`)
            && !positions.some(other => sameTile(candidate, other))
            && !objectAt(objects, x, y, "blocksMovement")) candidates.push(candidate);
        }
      }
      candidates.sort((first, second) => manhattanDistance(position, first) - manhattanDistance(position, second));
      if (candidates[0]) start = candidates[0];
    }
    occupied.add(`${start.x},${start.y}`);
    return { ...start, bounds: neutralBoundsForPosition(start, rooms) };
  });
}

export function canNeutralMoveToTile(tile, {
  bounds,
  grid,
  objects,
  otherPeople = [],
  playerTiles = [],
}) {
  const insideBounds = tile.x >= bounds.x && tile.x < bounds.x + bounds.width
    && tile.y >= bounds.y && tile.y < bounds.y + bounds.height;
  const terrain = grid[tile.y]?.[tile.x];
  if (!insideBounds || terrain === undefined || terrain === TILE_TYPES.WALL || terrain === TILE_TYPES.DOOR) {
    return false;
  }
  if (bounds.area === "hall" && terrain !== TILE_TYPES.HALL && terrain !== TILE_TYPES.EXIT) return false;
  if (objectAt(objects, tile.x, tile.y, "blocksMovement")) return false;
  return !isTileOccupiedByPeople(tile, otherPeople)
    && !playerTiles.some(playerTile => sameTile(tile, playerTile));
}

export function findPatrolDetour({ start, route, routeIndex, canMoveToTile }) {
  if (!start || !Array.isArray(route) || route.length < 2) return null;

  const directions = [
    { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 },
  ];
  const startKey = `${start.x},${start.y}`;
  const previous = new Map([[startKey, null]]);
  const tiles = new Map([[startKey, start]]);
  const queue = [start];

  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const current = queue[cursor];
    for (const direction of directions) {
      const next = { x: current.x + direction.x, y: current.y + direction.y };
      const key = `${next.x},${next.y}`;
      if (previous.has(key) || !canMoveToTile(next)) continue;
      previous.set(key, `${current.x},${current.y}`);
      tiles.set(key, next);
      queue.push(next);
    }
  }

  for (let offset = 0; offset < route.length; offset += 1) {
    const targetIndex = (routeIndex + offset) % route.length;
    let key = `${route[targetIndex].x},${route[targetIndex].y}`;
    if (key === startKey || !previous.has(key)) continue;

    const path = [];
    while (key !== startKey) {
      path.push(tiles.get(key));
      key = previous.get(key);
    }
    path.reverse();
    path[path.length - 1] = { ...path[path.length - 1], waitMs: route[targetIndex].waitMs ?? 0 };
    return { path, resumeIndex: (targetIndex + 1) % route.length };
  }

  return null;
}

function manhattanDistance(first, second) {
  return Math.abs(first.x - second.x) + Math.abs(first.y - second.y);
}

export function createNeutralPatrol(start, {
  bounds,
  grid,
  objects,
  otherStarts = [],
  radius = NEUTRAL_PATROL_RADIUS,
  directionOffset = 0,
}) {
  if (!bounds) return null;
  const directions = [
    { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 },
  ];
  const orderedDirections = directions.map((_, index) => directions[(index + directionOffset) % directions.length]);
  const queue = [start];
  const visited = new Map([[`${start.x},${start.y}`, null]]);
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const current = queue[cursor];
    for (const direction of orderedDirections) {
      const next = { x: current.x + direction.x, y: current.y + direction.y };
      const key = `${next.x},${next.y}`;
      if (visited.has(key) || manhattanDistance(start, next) > radius
        || otherStarts.some(other => sameTile(next, other))) continue;
      if (!canNeutralMoveToTile(next, { bounds, grid, objects })) continue;
      visited.set(key, `${current.x},${current.y}`);
      queue.push(next);
    }
  }

  const target = queue.slice(1).sort((first, second) =>
    manhattanDistance(start, second) - manhattanDistance(start, first)
      || second.y - first.y || second.x - first.x)[0];
  if (!target) return { route: [start], radius: 0, bounds };

  const path = [];
  let key = `${target.x},${target.y}`;
  while (key) {
    const [x, y] = key.split(",").map(Number);
    path.push({ x, y });
    key = visited.get(key);
  }
  path.reverse();
  const route = [...path, ...path.slice(1, -1).reverse()];
  return {
    route,
    bounds,
    radius: Math.max(...route.map(tile => manhattanDistance(start, tile))),
  };
}
