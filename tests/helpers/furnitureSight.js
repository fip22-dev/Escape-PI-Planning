import { createFloorPlan, TILE_TYPES } from "../../src/game/map.js";
import { createRoomObjects, objectAt } from "../../src/game/objects.js";
import { createSearcherPatrols, canSearcherMoveToTile } from "../../src/game/searcherDetection.js";

// Expectations from GAME_DESIGN, deliberately independent of OBJECT_RULES.
export const FURNITURE_SIGHT = {
  plant: true, table: true, sideboard: true, printer: true, coffee: true,
  chair: false, screen: false, whiteboard: false, bin: false,
};

export function furnitureSightLayout() {
  const { grid, rooms } = createFloorPlan();
  const objects = createRoomObjects(rooms);
  const searchers = createSearcherPatrols({ grid, rooms, objects });
  const cases = [];
  const summary = Object.fromEntries(Object.keys(FURNITURE_SIGHT).map(type => [type, { objects: 0, lanes: 0, legalSearcherLanes: 0 }]));
  for (const object of objects) {
    summary[object.type].objects++;
    for (const [dx, dy] of [[1, 0], [0, 1]]) {
      for (let offset = 0; offset < (dx ? object.height : object.width); offset++) {
        for (let before = 1; before <= 4; before++) {
          for (let after = 1; after <= 4; after++) {
            const observerTile = { x: object.x + (dx ? -before : offset), y: object.y + (dy ? -before : offset) };
            const playerTile = { x: object.x + (dx ? object.width - 1 + after : offset), y: object.y + (dy ? object.height - 1 + after : offset) };
            const distance = Math.abs(playerTile.x - observerTile.x) + Math.abs(playerTile.y - observerTile.y);
            if (distance > 5) continue;
            if ([observerTile, playerTile].some(p => grid[p.y]?.[p.x] === undefined
              || grid[p.y][p.x] === TILE_TYPES.WALL || objectAt(objects, p.x, p.y, "blocksMovement"))) continue;
            let clearApartFromTarget = true;
            for (let step = 1; step < distance; step++) {
              const x = observerTile.x + dx * step;
              const y = observerTile.y + dy * step;
              if (grid[y]?.[x] === TILE_TYPES.WALL
                || objectAt(objects.filter(other => other !== object), x, y, "blocksSight")) clearApartFromTarget = false;
            }
            if (clearApartFromTarget) {
              const legalSearcher = searchers.some(searcher => [observerTile, playerTile].some(tile =>
                canSearcherMoveToTile(tile, { grid, objects, homeRoom: searcher.homeRoom, otherPeople: [], playerTiles: [] })));
              cases.push({ type: object.type, object, observerTile, playerTile, facing: { x: dx, y: dy }, legalSearcher });
              summary[object.type].lanes++;
              if (legalSearcher) summary[object.type].legalSearcherLanes++;
            }
          }
        }
      }
    }
  }
  return { grid, objects, cases, summary };
}

export function isolatedFurnitureCases() {
  const { objects } = furnitureSightLayout();
  return Object.keys(FURNITURE_SIGHT).map(type => ({
    type, blocksSight: FURNITURE_SIGHT[type],
    object: { ...objects.find(object => object.type === type), x: 6, y: 6 },
  }));
}
