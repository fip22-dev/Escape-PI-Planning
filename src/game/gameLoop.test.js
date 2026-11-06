import test from "node:test";
import assert from "node:assert/strict";
import { timerWarningPresentation } from "./gameLoop.js";

test("timer turns red during the last 30 seconds", () => {
  assert.deepEqual(timerWarningPresentation(30_000, 0), { color: "#ff514d", alpha: 1 });
  assert.deepEqual(timerWarningPresentation(30_001, 0), { color: "#f5f0dc", alpha: 1 });
});

test("timer blinks red during the last 15 seconds", () => {
  assert.deepEqual(timerWarningPresentation(15_000, 0), { color: "#ff514d", alpha: 1 });
  assert.deepEqual(timerWarningPresentation(14_999, 350), { color: "#ff514d", alpha: 0.25 });
});
