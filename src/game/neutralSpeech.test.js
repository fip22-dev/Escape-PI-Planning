import test from "node:test";
import assert from "node:assert/strict";
import { createNeutralSpeech, updateNeutralSpeech, shiftNeutralSpeechTime, NEUTRAL_SAYINGS } from "./neutralSpeech.js";

test("speech requires proximity and eligibility, allows one bubble and respects global and person cooldowns", () => {
  const state = createNeutralSpeech(0);
  const people = [{ tile: { x: 3, y: 0 } }];
  const player = { x: 0, y: 0 };
  updateNeutralSpeech(state, 1500, people, player);
  assert.equal(state.active, null);
  people[0].tile.x = 2;
  updateNeutralSpeech(state, 1500, people, player, () => false);
  assert.equal(state.active, null);
  updateNeutralSpeech(state, 1500, people, player, () => true, () => 0);
  assert.equal(state.active.text, NEUTRAL_SAYINGS[0]);
  const active = state.active;
  updateNeutralSpeech(state, 3999, people, player);
  assert.equal(state.active, active);
  updateNeutralSpeech(state, 4000, people, player);
  assert.equal(state.active, null);
  people.push({ tile: { x: 1, y: 0 } });
  updateNeutralSpeech(state, 7999, people, player);
  assert.equal(state.active, null);
  updateNeutralSpeech(state, 8000, people, player);
  assert.equal(state.active.personIndex, 1);
  updateNeutralSpeech(state, 10_500, people, player);
  updateNeutralSpeech(state, 14_500, people, player);
  assert.equal(state.active, null);
  updateNeutralSpeech(state, 16_500, people, player, () => true, () => 1);
  assert.equal(state.active.personIndex, 0);
  assert.equal(state.active.text, NEUTRAL_SAYINGS[7]);
});

test("pause shifts speech deadlines and a new attempt resets all bubble state", () => {
  const state = createNeutralSpeech(1000);
  const people = [{ tile: { x: 1, y: 1 } }];
  updateNeutralSpeech(state, 2500, people, people[0].tile);
  shiftNeutralSpeechTime(state, 5000);
  assert.equal(state.active.expiresAt, 10_000);
  assert.equal(state.personReadyAt[0], 22_500);
  updateNeutralSpeech(state, 9999, people, people[0].tile);
  assert.ok(state.active);
  assert.deepEqual(createNeutralSpeech(50_000), { active: null, readyAt: 51_500, personReadyAt: {} });
});
