import { TILE_TYPES } from "./map.js";
import { objectAt } from "./objects.js";
import { sameTile } from "./neutralMovement.js";

export const RTE_START = { x: 34, y: 38 };
export const RTE_SIGHT_RANGE = 5;
export const SEARCHER_RED_WARNING_DELAY_MS = 300;
export const SEARCHER_DETECTION_DELAY_MS = 600;
export const RTE_STEP_DURATION_MS = 420;
export const RTE_STEP_PAUSE_MS = 380;
export const RTE_RETRY_PAUSE_MS = 400;

export function searcherDetectionPhase(visibleForMs) {
  if (visibleForMs >= SEARCHER_DETECTION_DELAY_MS) return "caught";
  if (visibleForMs >= SEARCHER_RED_WARNING_DELAY_MS) return "red";
  return "yellow";
}

const PRODUCT_OWNER_PATROLS = [
  {
    team: "WCL", roomLabel: "Windows\nClient Team", start: { x: 10, y: 8 },
    visits: [{ x: 12, y: 8 }, { x: 14, y: 8 }, { x: 20, y: 8 }, { x: 24, y: 8 }],
  },
  {
    team: "WSW", roomLabel: "Windows Software\nTeam", start: { x: 38, y: 8 },
    visits: [{ x: 36, y: 8 }, { x: 34, y: 8 }, { x: 28, y: 8 }, { x: 24, y: 8 }],
  },
  {
    team: "WDPS", roomLabel: "Workplace Device\n& Print Solutions\nTeam", start: { x: 10, y: 18 },
    visits: [{ x: 12, y: 18 }, { x: 14, y: 18 }, { x: 18, y: 20 }, { x: 24, y: 20 }],
  },
  {
    team: "EMS", roomLabel: "Enterprise Mobile\nServices Team", start: { x: 38, y: 20 },
    visits: [{ x: 36, y: 20 }, { x: 34, y: 20 }, { x: 28, y: 20 }, { x: 24, y: 20 }],
  },
  {
    team: "MAC", roomLabel: "Mac Workplace\nTeam", start: { x: 10, y: 29 },
    visits: [{ x: 12, y: 29 }, { x: 14, y: 29 }, { x: 18, y: 32 }, { x: 24, y: 32 }],
  },
  {
    team: "M365", roomLabel: "M365 Tenant &\nCollaboration Team", start: { x: 10, y: 37 },
    visits: [{ x: 12, y: 37 }, { x: 14, y: 37 }, { x: 14, y: 35 }, { x: 14, y: 33 }],
  },
  {
    team: "CMS", roomLabel: "Communication &\nMeetingroom\nSolutions Team", start: { x: 38, y: 32 },
    visits: [{ x: 36, y: 32 }, { x: 34, y: 32 }, { x: 28, y: 32 }, { x: 24, y: 32 }],
  },
].map((config, index) => ({
  ...config,
  role: `PO · ${config.team}`,
  group: "Product Owner",
  homeRoomLabel: config.roomLabel,
  delayMs: 18_000 + index * 2_500,
  waitMs: 4_000,
  homeWaitMs: 2_500,
}));

const SCRUM_MASTER_STOPS = [
  { x: 12, y: 29 }, { x: 24, y: 32 }, { x: 36, y: 32 }, { x: 12, y: 37 }, { x: 24, y: 20 },
];
const SCRUM_MASTER_STARTS = [
  { x: 14, y: 30 }, { x: 34, y: 30 }, { x: 14, y: 37 }, { x: 34, y: 20 },
];

const SCRUM_MASTER_PATROLS = Array.from({ length: 4 }, (_, index) => {
  const visits = [...SCRUM_MASTER_STOPS.slice(index), ...SCRUM_MASTER_STOPS.slice(0, index)];
  return {
    role: "Scrum Master",
    group: "Scrum Master",
    start: { ...SCRUM_MASTER_STARTS[index] },
    delayMs: 9_000 + index * 2_500,
    waitMs: 3_000,
    visits,
  };
});

export const SEARCHER_ROLES = [
  {
    role: "P&T",
    start: { x: 14, y: 8 },
    delayMs: 1_500,
    waitMs: 5_000,
    visits: [{ x: 12, y: 8 }, { x: 36, y: 20 }, { x: 36, y: 32 }],
  },
  {
    role: "BO",
    start: { x: 14, y: 9 },
    delayMs: 6_000,
    waitMs: 4_000,
    visits: [
      { x: 12, y: 9 }, { x: 36, y: 8 }, { x: 12, y: 18 }, { x: 36, y: 20 },
      { x: 12, y: 29 }, { x: 12, y: 37 }, { x: 36, y: 32 },
    ],
  },
  {
    role: "PM",
    start: { x: 34, y: 33 },
    delayMs: 12_000,
    waitMs: 4_000,
    visits: [
      { x: 36, y: 32 }, { x: 12, y: 37 }, { x: 12, y: 29 }, { x: 36, y: 20 },
      { x: 12, y: 18 }, { x: 36, y: 8 }, { x: 12, y: 8 },
    ],
  },
  ...PRODUCT_OWNER_PATROLS,
  ...SCRUM_MASTER_PATROLS,
];

const SEARCHER_COLORS = [
  0x417f87, 0x9a7843, 0x6b7198, 0x7d8d52, 0x925f75,
  0x7e687e, 0x56827b, 0x9b6d52, 0x647b99, 0x8a8050, 0x6c8c63,
  0x927180, 0x5a858a, 0xa17e55, 0x727d9a,
];

const RTE_TURN_PAUSE_MS = 2_000;
const RTE_EXIT_PAUSE_MS = 4_000;
const RTE_WAYPOINTS = [
  { x: 34, y: 32, waitMs: RTE_TURN_PAUSE_MS },
  { x: 14, y: 32, waitMs: RTE_TURN_PAUSE_MS },
  { x: 34, y: 32, waitMs: RTE_TURN_PAUSE_MS },
  { x: 34, y: 8, waitMs: RTE_TURN_PAUSE_MS },
  { x: 14, y: 8, waitMs: RTE_TURN_PAUSE_MS },
  { x: 34, y: 8, waitMs: RTE_TURN_PAUSE_MS },
  { x: 34, y: 2, waitMs: RTE_EXIT_PAUSE_MS },
  { x: RTE_START.x, y: RTE_START.y, waitMs: RTE_TURN_PAUSE_MS },
];

export function createRtePatrolRoute(start = RTE_START) {
  const route = [];
  let current = { ...start };

  for (const waypoint of RTE_WAYPOINTS) {
    const deltaX = Math.sign(waypoint.x - current.x);
    const deltaY = Math.sign(waypoint.y - current.y);
    while (current.x !== waypoint.x || current.y !== waypoint.y) {
      current = { x: current.x + deltaX, y: current.y + deltaY };
      const isWaypoint = current.x === waypoint.x && current.y === waypoint.y;
      route.push({ ...current, waitMs: isWaypoint ? waypoint.waitMs : 0 });
    }
  }

  return route;
}

export function createHallwayPatrolRoute(start, visits, { grid, objects, waitMs }) {
  return createPatrolRoute(start, visits, { grid, objects, waitMs });
}

function createTeamPatrolRoute(start, visits, { grid, objects, homeRoom, waitMs, homeWaitMs }) {
  return createPatrolRoute(start, visits, { grid, objects, allowedRoom: homeRoom, waitMs, homeWaitMs });
}

function createPatrolRoute(start, visits, { grid, objects, allowedRoom = null, waitMs, homeWaitMs = 0 }) {
  const checkpoints = [...visits.map(tile => ({ ...tile, waitMs })), { ...start, waitMs: homeWaitMs }];
  const route = [];
  let current = start;

  for (const checkpoint of checkpoints) {
    const path = findPatrolPath(current, checkpoint, { grid, objects, allowedRoom });
    if (!path) throw new Error(`No patrol route from ${current.x},${current.y} to ${checkpoint.x},${checkpoint.y}`);
    route.push(...path.slice(1).map(tile => ({ ...tile, waitMs: 0 })));
    if (route.length > 0) route[route.length - 1].waitMs = checkpoint.waitMs;
    current = checkpoint;
  }

  return route;
}

export function createSearcherPatrols({ grid, objects, rooms }) {
  const rte = {
    role: "RTE",
    start: RTE_START,
    delayMs: 1_500,
    color: 0x865d47,
    route: createRtePatrolRoute(),
  };
  return [rte, ...SEARCHER_ROLES.map((config, index) => {
    const homeRoom = config.homeRoomLabel && rooms?.find(room => room.label === config.homeRoomLabel);
    if (config.homeRoomLabel && !homeRoom) throw new Error(`Missing PO home room: ${config.homeRoomLabel}`);
    const routeOptions = { grid, objects, waitMs: config.waitMs };
    return {
      ...config,
      homeRoom,
      color: SEARCHER_COLORS[index],
      route: homeRoom
        ? createTeamPatrolRoute(config.start, config.visits, { ...routeOptions, homeRoom, homeWaitMs: config.homeWaitMs })
        : createHallwayPatrolRoute(config.start, config.visits, routeOptions),
    };
  })];
}

function findPatrolPath(start, destination, { grid, objects, allowedRoom }) {
  const keyFor = ({ x, y }) => `${x},${y}`;
  const startKey = keyFor(start);
  const destinationKey = keyFor(destination);
  const queue = [start];
  const previous = new Map([[startKey, null]]);
  const tiles = new Map([[startKey, start]]);
  const directions = [
    { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 },
  ];

  for (let cursor = 0; cursor < queue.length && !previous.has(destinationKey); cursor += 1) {
    const current = queue[cursor];
    for (const direction of directions) {
      const next = { x: current.x + direction.x, y: current.y + direction.y };
      const key = keyFor(next);
      const terrain = grid[next.y]?.[next.x];
      const isAllowedRoomFloor = allowedRoom && terrain === TILE_TYPES.FLOOR
        && next.x >= allowedRoom.x && next.x < allowedRoom.x + allowedRoom.width
        && next.y >= allowedRoom.y && next.y < allowedRoom.y + allowedRoom.height;
      const isTraversable = terrain === TILE_TYPES.HALL || terrain === TILE_TYPES.EXIT
        || (allowedRoom && terrain === TILE_TYPES.DOOR) || isAllowedRoomFloor;
      if (previous.has(key) || !isTraversable
        || objectAt(objects, next.x, next.y, "blocksMovement")) continue;
      previous.set(key, keyFor(current));
      tiles.set(key, next);
      queue.push(next);
    }
  }

  if (!previous.has(destinationKey)) return null;
  const path = [];
  let key = destinationKey;
  while (key !== null) {
    path.push(tiles.get(key));
    key = previous.get(key);
  }
  return path.reverse();
}

export function canSearcherSeePlayer({
  observerTile,
  facing,
  playerTile,
  grid,
  objects,
  neutralPeople,
  maxRange = RTE_SIGHT_RANGE,
}) {
  const deltaX = playerTile.x - observerTile.x;
  const deltaY = playerTile.y - observerTile.y;
  const distance = Math.abs(deltaX) + Math.abs(deltaY);

  if (distance === 0) return true;
  if (distance === 1) return true;
  if (distance > maxRange) return false;
  if (deltaX !== facing.x * distance || deltaY !== facing.y * distance) return false;

  const stepX = Math.sign(deltaX);
  const stepY = Math.sign(deltaY);
  for (let step = 1; step < distance; step += 1) {
    const x = observerTile.x + stepX * step;
    const y = observerTile.y + stepY * step;
    const tile = grid[y]?.[x];

    // Doors are open floor openings in the current graybox and remain transparent.
    if (tile === undefined || tile === TILE_TYPES.WALL || objectAt(objects, x, y, "blocksSight")) {
      return false;
    }
    if (neutralPeople.some(person => sameTile({ x, y }, person.tile) || sameTile({ x, y }, person.nextTile))) {
      return false;
    }
  }

  return true;
}

export function canSearcherMoveToTile(tile, { grid, objects, otherPeople, playerTiles, homeRoom = null }) {
  const terrain = grid[tile.y]?.[tile.x];
  const isInsideHomeRoom = homeRoom && tile.x >= homeRoom.x && tile.x < homeRoom.x + homeRoom.width
    && tile.y >= homeRoom.y && tile.y < homeRoom.y + homeRoom.height;
  const isHomeRoomTile = homeRoom && (terrain === TILE_TYPES.DOOR
    || (terrain === TILE_TYPES.FLOOR && isInsideHomeRoom));
  if (terrain !== TILE_TYPES.HALL && terrain !== TILE_TYPES.EXIT && !isHomeRoomTile) return false;
  if (objectAt(objects, tile.x, tile.y, "blocksMovement")) return false;
  if (otherPeople.some(person => sameTile(tile, person.tile) || sameTile(tile, person.nextTile))) return false;
  return !playerTiles.some(playerTile => sameTile(tile, playerTile));
}
