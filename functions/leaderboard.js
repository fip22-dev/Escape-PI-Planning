export const RULESET = "team-keys-v1";

export function validateScore(body) {
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body) ||
    Object.keys(body).some(
      (k) => !["runId", "name", "elapsedMs", "ruleset"].includes(k),
    )
  )
    throw Error("invalid");
  if (
    typeof body.runId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[47][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      body.runId,
    )
  )
    throw Error("invalid");
  if (typeof body.name !== "string") throw Error("invalid");
  const name = body.name.normalize("NFC").trim().replace(/ +/g, " ");
  if (!/^[\p{L}\p{N} ._-]{2,24}$/u.test(name)) throw Error("invalid");
  if (
    body.ruleset !== RULESET ||
    !Number.isInteger(body.elapsedMs) ||
    body.elapsedMs < 1 ||
    body.elapsedMs > 180000
  )
    throw Error("invalid");
  return {
    runId: body.runId.toLowerCase(),
    name,
    elapsedMs: body.elapsedMs,
    ruleset: RULESET,
  };
}

export function createLeaderboardHandler({ env, rpc }) {
  return async (request) => {
    const origin = request.headers.get("Origin");
    const allowed = (env("LEADERBOARD_ALLOWED_ORIGINS") || "")
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
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Expose-Headers": "Retry-After",
      });
    const reply = (status, body, retry) =>
      new Response(JSON.stringify(body), {
        status,
        headers: {
          ...headers,
          ...(retry ? { "Retry-After": String(retry) } : {}),
        },
      });
    if (!origin || !allowed.includes(origin))
      return reply(403, {
        error: "Diese Spieladresse ist nicht freigeschaltet.",
      });
    if (request.method === "OPTIONS")
      return new Response(null, { status: 204, headers });
    if (request.method === "GET") {
      try {
        const runId = new URL(request.url).searchParams.get("runId");
        if (
          runId &&
          !/^[0-9a-f]{8}-[0-9a-f]{4}-[47][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            runId,
          )
        )
          return reply(400, { error: "Ungültige Run-ID." });
        return reply(
          200,
          await rpc("leaderboard_read", runId ? { p_run: runId } : {}),
        );
      } catch {
        return reply(503, {
          error: "Die Bestenliste ist gerade nicht erreichbar.",
        });
      }
    }
    if (request.method !== "POST")
      return reply(405, { error: "Nur GET und POST sind erlaubt." });
    if (!request.headers.get("content-type")?.startsWith("application/json"))
      return reply(400, { error: "JSON erwartet." });
    let score;
    try {
      const reader = request.body?.getReader();
      if (!reader) throw Error("invalid");
      let size = 0;
      const chunks = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > 2048) {
          await reader.cancel();
          return reply(413, { error: "Eintrag zu gross." });
        }
        chunks.push(value);
      }
      const bytes = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.length;
      }
      score = validateScore(JSON.parse(new TextDecoder().decode(bytes)));
    } catch {
      return reply(400, {
        error:
          "Bitte einen Namen mit 2–24 Buchstaben, Ziffern, Leerzeichen, Punkt, Bindestrich oder Unterstrich eingeben.",
      });
    }
    try {
      const data = await rpc("leaderboard_submit", {
        p_id: score.runId,
        p_name: score.name,
        p_elapsed: score.elapsedMs,
      });
      if ([200, 201].includes(data.status)) return reply(data.status, data);
      const errors = {
        400: "Dieser Eintrag ist ungültig.",
        409: "Dieser Run wurde bereits mit einem anderen Namen gespeichert.",
        429: "Gerade werden zu viele Zeiten eingetragen. Bitte später erneut versuchen.",
        503: "Neue Einträge sind vorübergehend deaktiviert.",
      };
      return reply(
        data.status in errors ? data.status : 503,
        { error: errors[data.status] || "Speichern gerade nicht möglich." },
        data.retryAfter,
      );
    } catch {
      return reply(503, {
        error:
          "Keine sichere Speicherbestätigung. Bitte denselben Eintrag erneut versuchen.",
      });
    }
  };
}

export default async function (request) {
  const env = (key) => Deno.env.get(key);
  // The factory owns CORS and safe error messages, including database failures.
  let admin;
  const rpc = async (name, args) => {
    if (!admin) {
      const { createAdminClient } = await import("npm:@insforge/sdk@1.5.2");
      admin = createAdminClient({
        baseUrl: env("INSFORGE_BASE_URL"),
        apiKey: env("API_KEY"),
      });
    }
    const { data, error } = await admin.database.rpc(name, args);
    if (error) throw Error("database");
    return data;
  };
  return createLeaderboardHandler({ env, rpc })(request);
}
