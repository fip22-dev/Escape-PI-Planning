import { TILE_TYPES } from "./map.js";
import { PIXEL_PALETTE } from "./pixelArt.js";

export const DOOR_CLOSE_DELAY_MS = 250;

export function createDoors(grid) {
  const visited = new Set();
  const doors = [];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const terrain = grid[y][x];
      if (![TILE_TYPES.DOOR, TILE_TYPES.EXIT].includes(terrain) || visited.has(`${x},${y}`)) continue;
      const tiles = [{ x, y }];
      visited.add(`${x},${y}`);
      for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i];
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const next = { x: tile.x + dx, y: tile.y + dy };
          const key = `${next.x},${next.y}`;
          if (grid[next.y]?.[next.x] === terrain && !visited.has(key)) {
            visited.add(key);
            tiles.push(next);
          }
        }
      }
      const width = Math.max(...tiles.map(t => t.x)) - x + 1;
      const height = Math.max(...tiles.map(t => t.y)) - y + 1;
      const vertical = height > width;
      let dx = 0;
      let dy = 0;
      // Room DOOR markers describe the inner threshold. The adjacent HALL
      // tile cuts through the surrounding wall and is the physical doorway.
      // PI already occupies its wall opening; EXIT already marks the end wall.
      if (terrain === TILE_TYPES.DOOR) {
        if (vertical) {
          if (grid[y]?.[x - 1] === TILE_TYPES.FLOOR && grid[y]?.[x + width] === TILE_TYPES.HALL) dx = 1;
          else if (grid[y]?.[x - 1] === TILE_TYPES.HALL && grid[y]?.[x + width] === TILE_TYPES.FLOOR) dx = -1;
        } else {
          if (grid[y - 1]?.[x] === TILE_TYPES.FLOOR && grid[y + height]?.[x] === TILE_TYPES.HALL) dy = 1;
          else if (grid[y - 1]?.[x] === TILE_TYPES.HALL && grid[y + height]?.[x] === TILE_TYPES.FLOOR) dy = -1;
        }
      }
      const doorwayTiles = tiles.map(tile => ({ x: tile.x + dx, y: tile.y + dy }));
      doors.push({ x: x + dx, y: y + dy, width, height, tiles: doorwayTiles, vertical,
        exit: terrain === TILE_TYPES.EXIT, open: false, closeAt: null });
    }
  }
  return doors;
}

export function doorAt(doors, tile) {
  return tile && doors.find(door => door.tiles.some(t => t.x === tile.x && t.y === tile.y));
}

export function doorBlocksSight(doors, x, y) {
  const door = doorAt(doors, { x, y });
  return Boolean(door && !door.open);
}

export function updateDoors(doors, actors, now, exitUnlocked = true) {
  let changed = false;
  const occupied = new Set(actors.flatMap(actor => [actor.tile, actor.nextTile])
    .filter(Boolean).map(tile => `${tile.x},${tile.y}`));
  for (const door of doors) {
    const wasOpen = door.open;
    if (door.exit && !exitUnlocked) {
      door.open = false;
      door.closeAt = null;
    } else if (door.tiles.some(tile => occupied.has(`${tile.x},${tile.y}`))) {
      door.open = true;
      door.closeAt = null;
    } else if (door.open) {
      door.closeAt ??= now + DOOR_CLOSE_DELAY_MS;
      if (now >= door.closeAt) {
        door.open = false;
        door.closeAt = null;
      }
    }
    changed ||= door.open !== wasOpen;
  }
  return changed;
}

export function shiftDoorTime(doors, pausedFor) {
  for (const door of doors) if (door.closeAt !== null) door.closeAt += pausedFor;
}

export function drawDoors(graphics, doors, size) {
  graphics.clear();
  for (const door of doors) {
    const x = door.x * size;
    const y = door.y * size;
    const length = (door.vertical ? door.height : door.width) * size;
    const leaf = door.exit ? 0x7d8f61 : 0x7c8b7b;
    const highlight = door.exit ? 0xa0af7d : 0xa3af9c;
    // Draw along the opening, transposing the same frame for side walls.
    const rect = (a, b, width, height, color) => {
      graphics.fillStyle(color);
      if (door.vertical) graphics.fillRect(x + b, y + a, height, width);
      else graphics.fillRect(x + a, y + b, width, height);
    };
    rect(0, 3, 2, 10, PIXEL_PALETTE.wall);
    rect(length - 2, 3, 2, 10, PIXEL_PALETTE.wall);
    rect(0, 3, 2, 2, PIXEL_PALETTE.wallLight);
    rect(length - 2, 3, 2, 2, PIXEL_PALETTE.wallLight);
    if (door.open) {
      rect(0, 3, 3, 10, leaf);
      rect(length - 3, 3, 3, 10, leaf);
      rect(0, 3, 1, 10, highlight);
      rect(length - 1, 3, 1, 10, PIXEL_PALETTE.inkLight);
    } else {
      rect(2, 4, length - 4, 8, PIXEL_PALETTE.inkLight);
      rect(2, 5, length - 4, 6, leaf);
      rect(2, 5, length - 4, 1, highlight);
      rect(2, 10, length - 4, 1, PIXEL_PALETTE.wall);
      rect(Math.floor(length / 2), 6, 1, 4, PIXEL_PALETTE.wall);
      rect(Math.floor(length / 2) - 3, 7, 2, 1, PIXEL_PALETTE.paper);
    }
  }
}
