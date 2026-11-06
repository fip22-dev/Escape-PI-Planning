export function timerWarningPresentation(remainingMs, timeMs) {
  if (remainingMs <= 15_000) {
    return {
      color: "#ff514d",
      alpha: Math.floor(timeMs / 350) % 2 === 0 ? 1 : 0.25,
    };
  }
  if (remainingMs <= 30_000) return { color: "#ff514d", alpha: 1 };
  return { color: "#f5f0dc", alpha: 1 };
}
