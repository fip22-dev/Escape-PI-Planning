import { createHash, createHmac, sign } from "node:crypto";
import { Buffer } from "node:buffer";

const REPOSITORY = "fip22-dev/Escape-PI-Planning";
const MAX_BODY = 24 * 1024;
const plainObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value);
const clean = (text) =>
  text
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .replace(/@/g, "@\u200b");
export function validatePayload(body, now = Date.now()) {
  if (
    !plainObject(body) ||
    Object.keys(body).some(
      (k) =>
        ![
          "schemaVersion",
          "submissionId",
          "kind",
          "title",
          "description",
          "consent",
          "technical",
          "website",
        ].includes(k),
    )
  )
    throw Error("invalid");
  if (
    body.schemaVersion !== 1 ||
    body.consent !== true ||
    !["bug", "feature"].includes(body.kind) ||
    (body.website != null && body.website !== "")
  )
    throw Error("invalid");
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      body.submissionId,
    )
  )
    throw Error("invalid");
  const issued = parseInt(
    body.submissionId.replaceAll("-", "").slice(0, 12),
    16,
  );
  if (issued > now + 300_000) throw Error("invalid");
  if (issued < now - 7 * 86400_000) throw Error("expired");
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  if (
    title.length < 5 ||
    title.length > 120 ||
    description.length < 10 ||
    description.length > 5000 ||
    /[\r\n]/.test(title)
  )
    throw Error("invalid");
  const normalized = {
    schemaVersion: 1,
    submissionId: body.submissionId.toLowerCase(),
    kind: body.kind,
    title,
    description,
    consent: true,
  };
  if (body.technical !== undefined) {
    const fields = [
      "build",
      "browser",
      "os",
      "viewport",
      "orientation",
      "input",
      "view",
      "room",
      "position",
      "remainingSeconds",
      "keys",
    ];
    if (
      !plainObject(body.technical) ||
      Object.keys(body.technical).some((k) => !fields.includes(k))
    )
      throw Error("invalid");
    normalized.technical = {};
    for (const k of fields)
      if (body.technical[k] !== undefined) {
        const v = body.technical[k];
        if (
          !["string", "number"].includes(typeof v) ||
          String(v).length > 160 ||
          (typeof v === "number" && !Number.isFinite(v))
        )
          throw Error("invalid");
        normalized.technical[k] = v;
      }
  }
  return normalized;
}

export function issueContent(payload) {
  const marker = `<!-- escape-feedback:${payload.submissionId} -->`;
  const technical = payload.technical
    ? "\n\n### Technische Angaben\n" +
      Object.entries(payload.technical)
        .map(([k, v]) => `- ${k}: ${clean(String(v))}`)
        .join("\n")
    : "";
  return {
    title: `[${payload.kind === "bug" ? "Bug" : "Feature"}] ${clean(payload.title)}`,
    body: `### Meldung aus dem Spiel\n\n${clean(payload.description)}${technical}\n\nschemaVersion: 1\n${marker}`,
    labels: [
      "feedback:game",
      "triage:pending",
      payload.kind === "bug" ? "bug" : "enhancement",
    ],
  };
}

export async function reconcile({ github, rpc, env }, id, createdAt) {
  const marker = `<!-- escape-feedback:${id} -->`;
  for (let page = 1; page <= 3; page++) {
    const issues = await github(
      `/repos/${REPOSITORY}/issues?state=all&since=${encodeURIComponent(createdAt)}&per_page=100&page=${page}`,
    );
    const issue = issues.find(
      (i) =>
        !i.pull_request &&
        i.body?.includes(marker) &&
        i.user?.login === env("GITHUB_APP_BOT_LOGIN"),
    );
    if (issue) {
      await rpc("feedback_complete", {
        p_id: id,
        p_number: issue.number,
        p_url: issue.html_url,
      });
      return issue;
    }
    if (issues.length < 100) break;
  }
  return null;
}

export function createHandler({ env, rpc, github, clock = () => Date.now() }) {
  return async (request) => {
    const origin = request.headers.get("origin");
    const allowed = (env("FEEDBACK_ALLOWED_ORIGINS") || "")
      .split(",")
      .map((s) => s.trim());
    const headers = {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      Vary: "Origin",
    };
    if (origin && allowed.includes(origin))
      Object.assign(headers, {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
        "Access-Control-Expose-Headers": "Retry-After",
      });
    const reply = (status, body, retryAfter) =>
      new Response(JSON.stringify(body), {
        status,
        headers: {
          ...headers,
          ...(retryAfter ? { "Retry-After": String(retryAfter) } : {}),
        },
      });
    if (!origin || !allowed.includes(origin))
      return reply(403, {
        error: "Diese Spieladresse ist nicht freigeschaltet.",
      });
    if (request.method === "OPTIONS")
      return new Response(null, { status: 204, headers });
    if (request.method !== "POST")
      return reply(405, { error: "Nur POST ist erlaubt." });
    if (env("FEEDBACK_ENABLED") !== "true")
      return reply(503, { error: "Meldungen sind vorübergehend deaktiviert." });
    if (!request.headers.get("content-type")?.startsWith("application/json"))
      return reply(400, { error: "JSON erwartet." });
    let payload;
    try {
      if (Number(request.headers.get("content-length")) > MAX_BODY)
        return reply(413, { error: "Meldung zu gross." });
      const reader = request.body?.getReader();
      let size = 0;
      const chunks = [];
      if (!reader) throw Error("invalid");
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > MAX_BODY) {
          await reader.cancel();
          return reply(413, { error: "Meldung zu gross." });
        }
        chunks.push(value);
      }
      const bytes = new Uint8Array(size);
      let offset = 0;
      for (const c of chunks) {
        bytes.set(c, offset);
        offset += c.length;
      }
      payload = validatePayload(
        JSON.parse(new TextDecoder().decode(bytes)),
        clock(),
      );
    } catch (e) {
      return reply(e.message === "expired" ? 409 : 400, {
        error:
          e.message === "expired"
            ? "Diese Meldungs-ID ist abgelaufen. Bitte den Dialog neu öffnen."
            : "Bitte Titel, Beschreibung und Hinweisbestätigung prüfen.",
      });
    }
    const hash = createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex");
    // Until a trusted gateway IP signal is documented, use one conservative
    // shared bucket. Caller-supplied forwarding headers cannot bypass this limit.
    // No IP is processed or persisted.
    const client = createHmac("sha256", env("FEEDBACK_RATE_SECRET"))
      .update(new Date(clock()).toISOString().slice(0, 10) + "|public-feedback")
      .digest("hex");
    let claimed;
    try {
      claimed = await rpc("feedback_claim", {
        p_id: payload.submissionId,
        p_hash: hash,
        p_client: client,
      });
    } catch {
      return reply(503, {
        error:
          "Speicherung vorübergehend nicht verfügbar. Bitte erneut versuchen.",
      });
    }
    if (claimed.status === 503)
      return reply(503, { error: "Meldungen sind vorübergehend deaktiviert." });
    if (claimed.status === 200)
      return reply(200, { ...claimed, submissionId: payload.submissionId });
    if ([409, 429].includes(claimed.status))
      return reply(
        claimed.status,
        {
          error:
            claimed.status === 409
              ? "Diese Meldungs-ID gehört zu einem anderen oder abgelaufenen Entwurf."
              : "Zu viele Anfragen. Bitte später erneut versuchen.",
        },
        claimed.retryAfter,
      );
    const complete = (issue) =>
      rpc("feedback_complete", {
        p_id: payload.submissionId,
        p_number: issue.number,
        p_url: issue.html_url,
      });
    if (!claimed.dispatch) {
      try {
        // List, rather than search: avoids relying on GitHub's delayed search index.
        const issue = await reconcile(
          { github, rpc, env },
          payload.submissionId,
          claimed.createdAt,
        );
        if (issue)
          return reply(200, {
            submissionId: payload.submissionId,
            issueNumber: issue.number,
            issueUrl: issue.html_url,
          });
      } catch {
        /* Remain uncertain; never dispatch a second POST. */
      }
      return reply(
        202,
        {
          submissionId: payload.submissionId,
          error:
            "Die Anlage wird noch abgeglichen. Bitte später erneut versuchen.",
        },
        30,
      );
    }
    let postStarted = false;
    try {
      const content = issueContent(payload);
      // Resolve authentication before entering the potentially ambiguous POST.
      await github("/installation/repositories?per_page=1");
      postStarted = true;
      const issue = await github(
        `/repos/${REPOSITORY}/issues`,
        "POST",
        content,
      );
      await complete(issue);
      return reply(201, {
        submissionId: payload.submissionId,
        issueNumber: issue.number,
        issueUrl: issue.html_url,
      });
    } catch (error) {
      console.error(
        "feedback_delivery",
        postStarted ? "uncertain" : "before_post",
        /^github:\d+$/.test(error.message) ? error.message : error.name,
      );
      if (!postStarted) {
        try {
          await rpc("feedback_complete", { p_id: payload.submissionId });
        } catch {}
      }
      return reply(
        postStarted ? 202 : 503,
        {
          submissionId: payload.submissionId,
          error: postStarted
            ? "Die Zustellung ist noch unbestätigt. Bitte mit derselben Meldung erneut versuchen."
            : "GitHub ist vorübergehend nicht erreichbar. Bitte erneut versuchen.",
        },
        30,
      );
    }
  };
}

export default async function (request) {
  const env = (name) => Deno.env.get(name);
  try {
    const { createAdminClient } = await import("npm:@insforge/sdk@1.5.2");
    const admin = createAdminClient({
      baseUrl: env("INSFORGE_BASE_URL"),
      apiKey: env("API_KEY"),
    });
    const rpc = async (name, args) => {
      const { data, error } = await admin.database.rpc(name, args);
      if (error) throw Error("database");
      return data;
    };
    let token;
    const github = async (route, method = "GET", body) => {
      const call = async (path, auth, verb = "GET", data) => {
        const r = await fetch("https://api.github.com" + path, {
          method: verb,
          signal: AbortSignal.timeout(12_000),
          headers: {
            Authorization: "Bearer " + auth,
            Accept: "application/vnd.github+json",
            "User-Agent": "escape-pi-planning-feedback",
            "X-GitHub-Api-Version": "2022-11-28",
          },
          body: data ? JSON.stringify(data) : undefined,
        });
        if (!r.ok) throw Error(`github:${r.status}`);
        return r.json();
      };
      if (!token) {
        const now = Math.floor(Date.now() / 1000),
          enc = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
        const input =
          enc({ alg: "RS256", typ: "JWT" }) +
          "." +
          enc({ iat: now - 60, exp: now + 540, iss: env("GITHUB_APP_ID") });
        const storedKey = env("GITHUB_APP_PRIVATE_KEY");
        const pem = storedKey.startsWith("-----BEGIN")
          ? storedKey
          : Buffer.from(storedKey, "base64").toString("utf8");
        const jwt =
          input +
          "." +
          sign("RSA-SHA256", Buffer.from(input), pem).toString("base64url");
        token = (
          await call(
            `/app/installations/${env("GITHUB_INSTALLATION_ID")}/access_tokens`,
            jwt,
            "POST",
            {
              repositories: ["Escape-PI-Planning"],
              permissions: { issues: "write", metadata: "read" },
            },
          )
        ).token;
      }
      return call(route, token, method, body);
    };
    const maintenanceSecret = env("FEEDBACK_MAINTENANCE_SECRET");
    if (
      maintenanceSecret &&
      request.method === "POST" &&
      request.headers.get("Authorization") === `Bearer ${maintenanceSecret}`
    ) {
      const rows = await rpc("feedback_maintenance", {});
      let reconciled = 0;
      for (const row of rows) {
        try {
          if (await reconcile({ github, rpc, env }, row.id, row.createdAt))
            reconciled++;
        } catch {
          /* Leave unresolved rows for retry/manual review. */
        }
      }
      return new Response(
        JSON.stringify({ checked: rows.length, reconciled }),
        {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        },
      );
    }
    return await createHandler({ env, rpc, github })(request);
  } catch {
    return new Response(
      JSON.stringify({ error: "Feedback vorübergehend nicht verfügbar." }),
      {
        status: 503,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
