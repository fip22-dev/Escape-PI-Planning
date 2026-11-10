import test from "node:test";
import assert from "node:assert/strict";
import { createNeutralSpeech, updateNeutralSpeech, shiftNeutralSpeechTime, NEUTRAL_SAYINGS } from "./neutralSpeech.js";

test("nearby eligible people speak concurrently for exactly 2 seconds with independent cooldowns", () => {
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
  people[0].tile = { x: 20, y: 20 };
  updateNeutralSpeech(state, 2000, people, { x: 15, y: 15 });
  assert.deepEqual(state.active.find(b => b.personIndex === 0).anchor, { x: 328, y: 318 });
  people[0].tile = { x: 2, y: 0 };
  updateNeutralSpeech(state, 3499, people, player);
  assert.equal(state.active.length, 2);
  updateNeutralSpeech(state, 3500, people, player);
  assert.equal(state.active.length, 0);
  people.push({ tile: { x: 0, y: 1 } });
  updateNeutralSpeech(state, 3501, people, player);
  assert.deepEqual(state.active.map(b => b.personIndex), [2]);
  updateNeutralSpeech(state, 16499, people, player);
  assert.equal(state.active.length, 0);
  updateNeutralSpeech(state, 16500, people, player, () => true, () => 1);
  assert.equal(state.active.length, 2);
  assert.equal(state.active.find(b => b.personIndex === 0).text, NEUTRAL_SAYINGS[7]);
});

test("active speech follows fractional sprite movement without renewing its text, expiry or cooldown", () => {
  const state = createNeutralSpeech(0);
  const speaker = { tile: { x: 4, y: 5 }, sprite: { x: 72, y: 88 } };
  updateNeutralSpeech(state, 1500, [speaker], speaker.tile, () => true, () => 0);
  const bubble = state.active[0];
  const text = bubble.text, expiry = bubble.expiresAt, cooldown = state.personReadyAt[0];
  speaker.sprite.x += 6.25; speaker.sprite.y -= 2.5;
  updateNeutralSpeech(state, 1700, [speaker], { x: 30, y: 30 }, () => false);
  assert.deepEqual(bubble.anchor, { x: 78.25, y: 75.5 });
  assert.equal(bubble.text, text);
  assert.equal(bubble.expiresAt, expiry);
  assert.equal(state.personReadyAt[0], cooldown);
  updateNeutralSpeech(state, 3500, [speaker], { x: 30, y: 30 });
  assert.deepEqual(state.active, []);
});

test("pause shifts every bubble deadline and a new attempt resets all state", () => {
  const state = createNeutralSpeech(1000);
  const people = [{ tile: { x: 1, y: 1 } }, { tile: { x: 1, y: 2 } }];
  updateNeutralSpeech(state, 2500, people, people[0].tile);
  shiftNeutralSpeechTime(state, 5000);
  assert.deepEqual(state.active.map(b => b.expiresAt), [9500, 9500]);
  assert.equal(state.personReadyAt[0], 22500);
  updateNeutralSpeech(state, 9499, people, people[0].tile);
  assert.equal(state.active.length, 2);
  updateNeutralSpeech(state, 9500, people, people[0].tile);
  assert.equal(state.active.length, 0);
  assert.deepEqual(createNeutralSpeech(50000), { active: [], readyAt: 51500, personReadyAt: {} });
});

test("named rooms keep one speaker per room within the global two-bubble limit", () => {
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
  assert.deepEqual(state.active.map(b => b.personIndex).sort(), [0, 2]);
  assert.equal(state.personReadyAt[1], undefined);
  updateNeutralSpeech(state, 3499, people, { x: 0, y: 0 });
  assert.equal(state.active.some(b => b.personIndex === 1), false);
  updateNeutralSpeech(state, 3500, people, { x: 0, y: 0 });
  assert.deepEqual(state.active.map(b => b.personIndex), [1, 3]);
});


test("visible meeting speakers do not require player proximity and never exceed two active bubbles", () => {
  const people = [
    { tile: { x: 10, y: 10 }, bounds: { label: "Meeting 1", x: 10, y: 10 } },
    { tile: { x: 11, y: 10 }, bounds: { label: "Meeting 1", x: 10, y: 10 } },
    { tile: { x: 20, y: 10 }, bounds: { label: "Meeting 2", x: 20, y: 10 } },
    { tile: { x: 30, y: 10 }, bounds: { label: "Meeting 3", x: 30, y: 10 } },
    { tile: { x: 8, y: 8 }, bounds: { label: "Meeting 4", x: 8, y: 8 } },
    { tile: { x: 3, y: 3 }, bounds: { label: "Team", x: 3, y: 3 } },
  ];
  const state = createNeutralSpeech(0);
  const visible = person => person !== people[4];
  updateNeutralSpeech(state, 1500, people, { x: 0, y: 0 }, visible);
  assert.deepEqual(state.active.map(b => b.personIndex), [0, 2]);
  for (const index of [1, 3, 4, 5]) assert.equal(state.personReadyAt[index], undefined);
  updateNeutralSpeech(state, 3499, people, { x: 0, y: 0 }, visible);
  assert.equal(state.active.length, 2);
  updateNeutralSpeech(state, 3500, people, { x: 0, y: 0 }, visible);
  assert.deepEqual(state.active.map(b => b.personIndex), [1, 3]);
});

test("the two-bubble limit also applies to simultaneous hall and PI speakers", () => {
  for (const bounds of [{ area: "hall" }, { x: 29, y: 40, width: 14, height: 12 }]) {
    const people = Array.from({ length: 4 }, () => ({ tile: { x: 1, y: 1 }, bounds }));
    const state = createNeutralSpeech(0);
    updateNeutralSpeech(state, 1500, people, { x: 1, y: 1 });
    assert.deepEqual(state.active.map(b => b.personIndex), [0, 1]);
    assert.equal(state.personReadyAt[2], undefined);
    updateNeutralSpeech(state, 3500, people, { x: 1, y: 1 });
    assert.deepEqual(state.active.map(b => b.personIndex), [2, 3]);
  }
});
