import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import {
  createHandler,
  validatePayload,
  issueContent,
  reconcile,
} from "../../functions/feedback.js";

const id = () =>
  Date.now()
    .toString(16)
    .padStart(12, "0")
    .replace(/(.{8})(.{4})/, "$1-$2") +
  "-7abc-8abc-" +
  randomUUID().replaceAll("-", "").slice(0, 12);
const payload = () => ({
  schemaVersion: 1,
  submissionId: id(),
  kind: "bug",
  title: "Testmeldung",
  description: "Ein klarer Test ohne persönliche Angaben.",
  consent: true,
});
const env = (k) =>
  ({
    FEEDBACK_ALLOWED_ORIGINS: "http://localhost:5173",
    FEEDBACK_ENABLED: "true",
    FEEDBACK_RATE_SECRET: "test-only",
    GITHUB_APP_BOT_LOGIN: "escape-pi-planning-issue[bot]",
  })[k];
const request = (p, origin = "http://localhost:5173") =>
  new Request("https://test.invalid", {
    method: "POST",
    headers: { origin, "Content-Type": "application/json" },
    body: JSON.stringify(p),
  });
test("feedback validates schema, timestamps, consent, metadata and neutralizes mentions", () => {
  const p = payload();
  assert.equal(validatePayload(p).title, p.title);
  for (const change of [
    { consent: false },
    { repository: "other/repo" },
    { technical: { url: "https://secret" } },
    { title: "abc" },
    { kind: "other" },
    { website: "spam" },
  ])
    assert.throws(() => validatePayload({ ...p, ...change }));
  assert.throws(
    () =>
      validatePayload({
        ...p,
        submissionId: "00000000-0000-7000-8000-000000000000",
      }),
    /expired/,
  );
  const content = issueContent({ ...p, description: "@someone \u0000text" });
  assert.ok(content.body.includes("@\u200bsomeone"));
  assert.ok(!content.body.includes("\u0000"));
});
test("feedback refuses oversized, unknown origins and disabled service before database access", async () => {
  const h = createHandler({
    env,
    rpc: () => {
      throw Error("must not run");
    },
  });
  assert.equal(
    (await h(request(payload(), "https://evil.invalid"))).status,
    403,
  );
  assert.equal(
    (await h(request({ ...payload(), description: "x".repeat(25000) }))).status,
    413,
  );
  assert.equal(
    (
      await createHandler({
        env: (k) => (k === "FEEDBACK_ENABLED" ? "false" : env(k)),
      })(request(payload()))
    ).status,
    503,
  );
});
test("uncertain POST is reconciled on retry without a second issue", async () => {
  let stored = null,
    posts = 0,
    created = null;
  const p = payload();
  const rpc = async (name, args) => {
    if (name === "feedback_complete") {
      stored = {
        status: 200,
        issueNumber: args.p_number,
        issueUrl: args.p_url,
      };
      return;
    }
    if (stored) return stored;
    stored = { status: 202, createdAt: new Date().toISOString() };
    return { status: 201, dispatch: true };
  };
  const github = async (route, method) => {
    if (method === "POST") {
      posts++;
      created = {
        number: 123,
        html_url: "https://github.com/fip22-dev/Escape-PI-Planning/issues/123",
        body: issueContent(p).body,
        user: { login: env("GITHUB_APP_BOT_LOGIN") },
      };
      throw Error("network after create");
    }
    return route.includes("/issues?") ? [created] : {};
  };
  const h = createHandler({ env, rpc, github });
  assert.equal((await h(request(p))).status, 202);
  const retry = await h(request(p));
  assert.equal(retry.status, 200);
  assert.equal((await retry.json()).issueNumber, 123);
  assert.equal(posts, 1);
  assert.equal((await h(request(p))).status, 200);
  assert.equal(posts, 1);
});
test("authentication failure permits safe retry; uncertain empty reconciliation never reposts", async () => {
  let completed = 0,
    posts = 0;
  const p = payload();
  let h = createHandler({
    env,
    rpc: async (name) =>
      name === "feedback_claim"
        ? { status: 201, dispatch: true }
        : (completed++, null),
    github: async () => {
      throw Error("auth");
    },
  });
  assert.equal((await h(request(p))).status, 503);
  assert.equal(completed, 1);
  h = createHandler({
    env,
    rpc: async () => ({ status: 202, createdAt: new Date().toISOString() }),
    github: async (route, method) => {
      if (method === "POST") posts++;
      return [];
    },
  });
  assert.equal((await h(request(p))).status, 202);
  assert.equal(posts, 0);
});
test("database runtime switch stops dispatch immediately", async () => {
  let posts = 0;
  const h = createHandler({
    env,
    rpc: async () => ({ status: 503 }),
    github: async () => {
      posts++;
    },
  });
  assert.equal((await h(request(payload()))).status, 503);
  assert.equal(posts, 0);
});
test("reconciliation ignores copied markers from another issue author", async () => {
  const p = payload();
  let updates = 0;
  const issue = await reconcile(
    {
      env,
      rpc: async () => {
        updates++;
      },
      github: async () => [
        {
          number: 1,
          body: issueContent(p).body,
          user: { login: "someone-else" },
        },
      ],
    },
    p.submissionId,
    new Date().toISOString(),
  );
  assert.equal(issue, null);
  assert.equal(updates, 0);
});
