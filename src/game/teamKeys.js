import { TILE_TYPES } from "./map.js";
import { objectAt } from "./objects.js";

export const TEAM_KEYS = [
  { team: "WCL", room: "Windows\nClient Team" },
  { team: "WDPS", room: "Workplace Device\n& Print Solutions\nTeam" },
  { team: "MAC", room: "Mac Workplace\nTeam" },
  { team: "M365", room: "M365 Tenant &\nCollaboration Team" },
  { team: "WSW", room: "Windows Software\nTeam" },
  { team: "EMS", room: "Enterprise Mobile\nServices Team" },
  { team: "CMS", room: "Communication &\nMeetingroom\nSolutions Team" },
];

export function createTeamKeys({ grid, rooms, objects, start }, random = Math.random, previous = []) {
  const reachable = new Set([`${start.x},${start.y}`]);
  const queue = [start];
  for (const tile of queue) {
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const x = tile.x + dx, y = tile.y + dy, id = `${x},${y}`;
      if (reachable.has(id) || grid[y]?.[x] === undefined || grid[y][x] === TILE_TYPES.WALL
        || grid[y][x] === TILE_TYPES.EXIT || objectAt(objects, x, y, "blocksMovement")) continue;
      reachable.add(id); queue.push({ x, y });
    }
  }
  return TEAM_KEYS.map(({ team, room: label }) => {
    const room = rooms.find(room => room.label === label);
    const candidates = [];
    for (let y = room.y + 1; y < room.y + room.height - 1; y++) {
      for (let x = room.x + 1; x < room.x + room.width - 1; x++) {
        if (grid[y][x] !== TILE_TYPES.FLOOR || !reachable.has(`${x},${y}`)) continue;
        // Keep the key visibly on bare floor, including away from passable chairs.
        if (objects.some(o => x >= o.x && x < o.x + o.width && y >= o.y && y < o.y + o.height)) continue;
        candidates.push({ x, y });
      }
    }
    const old = previous.find(key => key.team === team);
    const fresh = candidates.filter(p => p.x !== old?.x || p.y !== old?.y);
    const choices = fresh.length ? fresh : candidates;
    if (!choices.length) throw new Error(`No reachable key position in ${label}`);
    return { team, ...choices[Math.floor(random() * choices.length)] };
  });
}

export function collectTeamKey(collected, tile, keys) {
  const key = keys.find(key => key.x === tile.x && key.y === tile.y);
  if (!key || collected.has(key.team)) return null;
  collected.add(key.team);
  return key;
}

export function hasAllTeamKeys(collected) {
  return TEAM_KEYS.every(key => collected.has(key.team));
}

export function teamKeyProgress(collected) {
  return `Schlüssel ${TEAM_KEYS.filter(key => collected.has(key.team)).length}/7`;
}

export const LOCKED_EXIT_MESSAGE = "Netter Fluchtversuch!\nOhne sieben Schlüssel gibt’s nur\nein weiteres Refinement.";
