import test from "node:test";
import assert from "node:assert/strict";
import { createNeutralSpeech, updateNeutralSpeech, shiftNeutralSpeechTime, NEUTRAL_SAYINGS } from "./neutralSpeech.js";

test("nearby eligible people speak concurrently for exactly 1.5 seconds with independent cooldowns", () => {
  const state = createNeutralSpeech(0);
  const people = [{ tile: { x: 3, y: 0 } }, { tile: { x: 1, y: 0 } }];
  const player = { x: 0, y: 0 };
  updateNeutralSpeech(state, 1499, people, player);
  assert.equal(state.active.length, 0);
  people[0].tile.x = 2;
  updateNeutralSpeech(state, 1500, people, player, () => false);
  assert.equal(state.active.length, 0);
  updateNeutralSpeech(state, 1500, people, player, () => true, () => 0);
  assert.equal(state.active.length, 2);
  assert.equal(state.active.find(b => b.personIndex === 0).text, NEUTRAL_SAYINGS[0]);
  updateNeutralSpeech(state, 2999, people, player);
  assert.equal(state.active.length, 2);
  updateNeutralSpeech(state, 3000, people, player);
  assert.equal(state.active.length, 0);
  people.push({ tile: { x: 0, y: 1 } });
  updateNeutralSpeech(state, 3001, people, player);
  assert.deepEqual(state.active.map(b => b.personIndex), [2]);
  updateNeutralSpeech(state, 16499, people, player);
  assert.equal(state.active.length, 0);
  updateNeutralSpeech(state, 16500, people, player, () => true, () => 1);
  assert.equal(state.active.length, 2);
  assert.equal(state.active.find(b => b.personIndex === 0).text, NEUTRAL_SAYINGS[7]);
});

test("pause shifts every bubble deadline and a new attempt resets all state", () => {
  const state = createNeutralSpeech(1000);
  const people = [{ tile: { x: 1, y: 1 } }, { tile: { x: 1, y: 2 } }];
  updateNeutralSpeech(state, 2500, people, people[0].tile);
  shiftNeutralSpeechTime(state, 5000);
  assert.deepEqual(state.active.map(b => b.expiresAt), [9000, 9000]);
  assert.equal(state.personReadyAt[0], 22500);
  updateNeutralSpeech(state, 8999, people, people[0].tile);
  assert.equal(state.active.length, 2);
  updateNeutralSpeech(state, 9000, people, people[0].tile);
  assert.equal(state.active.length, 0);
  assert.deepEqual(createNeutralSpeech(50000), { active: [], readyAt: 51500, personReadyAt: {} });
});

test("named rooms allow one speaker each while hall and PI allow concurrent speech", () => {
  const room = { label: "Team", x: 1, y: 1 };
  const otherRoom = { label: "Meeting", x: 10, y: 1 };
  const people = [
    { tile: { x: 1, y: 0 }, bounds: room },
    { tile: { x: 2, y: 0 }, bounds: { ...room } },
    { tile: { x: 0, y: 1 }, bounds: otherRoom },
    { tile: { x: 1, y: 1 }, bounds: { area: "hall" } },
    { tile: { x: 1, y: 1 }, bounds: { area: "hall" } },
    { tile: { x: 1, y: 1 }, bounds: { x: 29, y: 40, width: 14, height: 12 } },
    { tile: { x: 1, y: 1 }, bounds: { x: 29, y: 40, width: 14, height: 12 } },
  ];
  const state = createNeutralSpeech(0);
  updateNeutralSpeech(state, 1500, people, { x: 0, y: 0 });
  assert.deepEqual(state.active.map(b => b.personIndex).sort(), [0, 2, 3, 4, 5, 6]);
  assert.equal(state.personReadyAt[1], undefined);
  updateNeutralSpeech(state, 2999, people, { x: 0, y: 0 });
  assert.equal(state.active.some(b => b.personIndex === 1), false);
  updateNeutralSpeech(state, 3000, people, { x: 0, y: 0 });
  assert.deepEqual(state.active.map(b => b.personIndex), [1]);
});
