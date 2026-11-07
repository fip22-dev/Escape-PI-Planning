import test from "node:test";
import assert from "node:assert/strict";
import { TILE_TYPES } from "./map.js";
import { canSearcherSeePlayer } from "./searcherDetection.js";
import { FURNITURE_SIGHT, furnitureSightLayout } from "../../tests/helpers/furnitureSight.js";

const clearGrid = () => Array.from({ length: 16 }, () => Array(16).fill(TILE_TYPES.HALL));

for (const [type, blocksSight] of Object.entries(FURNITURE_SIGHT)) {
  test(`${type}: all placed shapes obey sight rules from every face`, () => {
    const shapes = furnitureSightLayout().objects.filter(object => object.type === type);
    assert.ok(shapes.length > 0);
    for (const shape of shapes) {
      const object = { ...shape, x: 6, y: 6 };
      for (const [dx, dy] of [[1, 0], [0, 1]]) {
        for (let offset = 0; offset < (dx ? object.height : object.width); offset++) {
          const a = { x: 6 + (dx ? -1 : offset), y: 6 + (dy ? -1 : offset) };
          const b = { x: 6 + (dx ? object.width : offset), y: 6 + (dy ? object.height : offset) };
          for (const reverse of [false, true]) {
            const input = { grid: clearGrid(), objects: [object], neutralPeople: [],
              maxRange: Math.max(5, Math.abs(b.x - a.x) + Math.abs(b.y - a.y)),
              observerTile: reverse ? b : a, playerTile: reverse ? a : b,
              facing: { x: reverse ? -dx : dx, y: reverse ? -dy : dy } };
            assert.equal(canSearcherSeePlayer(input), !blocksSight);
            assert.equal(canSearcherSeePlayer({ ...input, objects: [] }), true,
              "removing the target restores an otherwise clear line");
          }
        }
      }
    }
  });
}

test("actual map: all physically usable furniture sightlines and reverse directions agree with design", t => {
  const { grid, objects, cases, summary } = furnitureSightLayout();
  assert.ok(summary.table.lanes > 0);
  for (const scenario of cases) {
    const input = { ...scenario, grid, objects, neutralPeople: [] };
    assert.equal(canSearcherSeePlayer(input), !FURNITURE_SIGHT[scenario.type]);
    assert.equal(canSearcherSeePlayer({ ...input,
      observerTile: input.playerTile, playerTile: input.observerTile,
      facing: { x: -input.facing.x, y: -input.facing.y } }), !FURNITURE_SIGHT[scenario.type]);
  }
  t.diagnostic(JSON.stringify(summary));
});

test("walls block sight, doors stay open, moving neutral people cover current and reserved tiles", () => {
  const grid = clearGrid();
  const input = { grid, observerTile: { x: 3, y: 6 }, playerTile: { x: 7, y: 6 },
    facing: { x: 1, y: 0 }, objects: [], neutralPeople: [] };
  grid[6][5] = TILE_TYPES.WALL;
  assert.equal(canSearcherSeePlayer(input), false);
  grid[6][5] = TILE_TYPES.DOOR;
  assert.equal(canSearcherSeePlayer(input), true);
  for (const person of [
    { tile: { x: 5, y: 6 }, nextTile: { x: 5, y: 5 } },
    { tile: { x: 5, y: 5 }, nextTile: { x: 5, y: 6 } },
  ]) assert.equal(canSearcherSeePlayer({ ...input, neutralPeople: [person] }), false);
  assert.equal(canSearcherSeePlayer({ ...input,
    neutralPeople: [{ tile: { x: 5, y: 5 }, nextTile: null }] }), true);
  assert.equal(canSearcherSeePlayer({ ...input, facing: { x: -1, y: 0 } }), false);
  assert.equal(canSearcherSeePlayer({ ...input, playerTile: { x: 9, y: 6 } }), false);
});
