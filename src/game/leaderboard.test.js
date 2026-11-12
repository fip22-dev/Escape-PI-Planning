import test from "node:test";
import assert from "node:assert/strict";
import { createRunId, winningRun, formatRunTime } from "./leaderboard.js";
import {
  validateScore,
  createLeaderboardHandler,
} from "../../functions/leaderboard.js";

const score = () => ({
  runId: createRunId(),
  name: "Test Spieler",
  elapsedMs: 65432,
  ruleset: "team-keys-v1",
});
const env = (key) =>
  key === "LEADERBOARD_ALLOWED_ORIGINS" ? "http://localhost:5173" : undefined;
const request = (body, origin = "http://localhost:5173") =>
  new Request("https://test.invalid", {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

test("winning run freezes exact active time and requires a win, started timer and all keys", () => {
  const s = {
    gameResult: "win",
    escapeStartedAt: 1000,
    time: { now: 66432 },
    collectedTeamKeys: new Set([1, 2, 3, 4, 5, 6, 7]),
    leaderboardRunId: createRunId(),
  };
  const before = winningRun(s);
  assert.equal(before.elapsedMs, 65432);
  assert.ok(Object.isFrozen(before));
  s.time.now += 5000;
  s.escapeStartedAt += 5000;
  assert.equal(winningRun(s).elapsedMs, 65432);
  s.time.now += 1000;
  assert.equal(before.elapsedMs, 65432);
  for (const change of [
    { gameResult: "caught" },
    { gameResult: "timeout" },
    { escapeStartedAt: null },
    { collectedTeamKeys: new Set([1, 2, 3]) },
    { escapeStartedAt: s.time.now },
  ])
    assert.equal(winningRun({ ...s, ...change }), null);
  assert.equal(formatRunTime(65432), "01:05.432");
  assert.equal(formatRunTime(180000), "03:00.000");
  assert.equal(formatRunTime(NaN), "–");
});
test("score validation normalizes names and refuses markup, control characters and forged fields", () => {
  const p = score();
  assert.equal(validateScore({ ...p, name: "  Zoë   22  " }).name, "Zoë 22");
  for (const change of [
    { elapsedMs: 0 },
    { elapsedMs: 180001 },
    { elapsedMs: 1.1 },
    { elapsedMs: "65432" },
    { name: "<script>" },
    { name: "@someone" },
    { name: "a" },
    { name: "A\nB" },
    { name: "x".repeat(25) },
    { ruleset: "other" },
    { rank: 1 },
    { runId: "wrong" },
  ])
    assert.throws(() => validateScore({ ...p, ...change }));
});
test("leaderboard GET reads only through server RPC; CORS and oversized data are rejected", async () => {
  const calls = [];
  const h = createLeaderboardHandler({
    env,
    rpc: async (name, args) => {
      calls.push([name, args]);
      return { entries: [], ruleset: "team-keys-v1" };
    },
  });
  assert.equal(
    (
      await h(
        new Request("https://test.invalid", {
          headers: { Origin: "http://localhost:5173" },
        }),
      )
    ).status,
    200,
  );
  assert.deepEqual(calls, [["leaderboard_read", {}]]);
  assert.equal((await h(request(score(), "https://evil.invalid"))).status, 403);
  assert.equal(
    (await h(request({ ...score(), name: "x".repeat(2500) }))).status,
    413,
  );
  assert.equal((await h(request({ ...score(), elapsedMs: 0 }))).status, 400);
  assert.equal(calls.length, 1);
  const ownId = createRunId();
  assert.equal(
    (
      await h(
        new Request(`https://test.invalid?runId=${ownId}`, {
          headers: { Origin: "http://localhost:5173" },
        }),
      )
    ).status,
    200,
  );
  assert.deepEqual(calls.at(-1), ["leaderboard_read", { p_run: ownId }]);
  assert.equal(
    (
      await h(
        new Request("https://test.invalid?runId=invalid", {
          headers: { Origin: "http://localhost:5173" },
        }),
      )
    ).status,
    400,
  );
  assert.equal(calls.length, 2);
});
test("same run retries without a duplicate; changed name is a conflict", async () => {
  const stored = new Map();
  const h = createLeaderboardHandler({
    env,
    rpc: async (name, args) => {
      const old = stored.get(args.p_id);
      if (old && old.p_name !== args.p_name) return { status: 409 };
      stored.set(args.p_id, args);
      return {
        status: old ? 200 : 201,
        rank: 1,
        entries: [],
        runId: args.p_id,
      };
    },
  });
  const p = score();
  assert.equal((await h(request(p))).status, 201);
  assert.equal((await h(request(p))).status, 200);
  assert.equal((await h(request({ ...p, name: "Other Name" }))).status, 409);
  assert.equal(stored.size, 1);
});
test("runtime disable, quota and uncertain database errors remain explicit failures", async () => {
  for (const status of [429, 503]) {
    const r = await createLeaderboardHandler({
      env,
      rpc: async () => ({ status, retryAfter: 600 }),
    })(request(score()));
    assert.equal(r.status, status);
    assert.equal(r.headers.get("Retry-After"), "600");
  }
  const r = await createLeaderboardHandler({
    env,
    rpc: async () => {
      throw Error("private database details");
    },
  })(request(score()));
  assert.equal(r.status, 503);
  assert.ok(!(await r.text()).includes("private database"));
});
