export const LEADERBOARD_RULESET = "team-keys-v1";

export function createRunId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const h = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export function winningRun(scene) {
  if (
    scene.gameResult !== "win" ||
    scene.escapeStartedAt === null ||
    scene.collectedTeamKeys.size !== 7
  )
    return null;
  const elapsedMs = Math.round(scene.time.now - scene.escapeStartedAt);
  if (elapsedMs < 1 || elapsedMs > 180000) return null;
  return Object.freeze({
    runId: scene.leaderboardRunId,
    elapsedMs,
    ruleset: LEADERBOARD_RULESET,
  });
}

export function formatRunTime(elapsedMs) {
  if (!Number.isInteger(elapsedMs) || elapsedMs < 0) return "–";
  const minutes = Math.floor(elapsedMs / 60000),
    seconds = Math.floor(elapsedMs / 1000) % 60,
    ms = elapsedMs % 1000;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
}
