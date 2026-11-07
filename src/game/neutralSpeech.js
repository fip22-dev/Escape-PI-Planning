export const SPEECH_DURATION_MS = 2500;
export const SPEECH_GLOBAL_PAUSE_MS = 4000;
export const SPEECH_PERSON_COOLDOWN_MS = 15_000;
export const NEUTRAL_SAYINGS = [
  "Ach, nicht schon wieder PI Planning. Ich hatte gerade eine freie Kalenderlücke gefunden.",
  "Juhu, endlich Stories schätzen! Ich wollte schon immer Fibonacci-Karten nach Gefühl werfen.",
  "Die Kaffeemaschine hat mein Geld genommen. Der Kaffee ist jetzt wohl ein offenes Item.",
  "Ich habe meine Kapazität berechnet. Die Kaffeepausen sind optimistisch eingepreist.",
  "Die Story ist klein. Sie hat nur drei Teams, zwei Abhängigkeiten und einen eigenen Kalender.",
  "Sind wir schon aligned? Ich weiss nur noch nicht, wohin.",
  "Bitte keine neuen Post-its. Mein Laptop hat schon Angst vor dem Board.",
  "Ich habe die Risiken dokumentiert. Jetzt ist das Dokument selbst ein Risiko.",
  "Fünf Story Points. Oder vier? Ich frage kurz den Kaffee.",
  "Mein Team ist hochmotiviert. Drei von uns suchen gerade die Kaffeemaschine.",
  "Gleich fertig – sobald wir uns auf die Definition von ‹gleich› geeinigt haben.",
  "Ich mache Notizen. Noch weiss ich nicht wozu, aber sie sind sehr präzise.",
  "Die Kaffeemaschine funktioniert. Sie liefert nur keinen Kaffee.",
  "Mein Kaffee-Token ist aufgebraucht. Ist das ein Impediment?",
  "Ich wollte nur kurz Wasser holen. Jetzt bin ich Teil einer Abhängigkeit.",
];

export function createNeutralSpeech(now) {
  return { active: null, readyAt: now + 1500, personReadyAt: {} };
}

export function updateNeutralSpeech(state, now, people, playerTile, eligible = () => true, random = Math.random) {
  if (state.active) {
    if (now < state.active.expiresAt) return;
    state.active = null;
    state.readyAt = now + SPEECH_GLOBAL_PAUSE_MS;
    return;
  }
  if (now < state.readyAt) return;
  const candidates = people.map((person, index) => ({
    person, index, distance: Math.abs(person.tile.x - playerTile.x) + Math.abs(person.tile.y - playerTile.y),
  })).filter(({ person, index, distance }) => distance <= 2 && now >= (state.personReadyAt[index] ?? 0) && eligible(person));
  candidates.sort((a, b) => a.distance - b.distance || a.index - b.index);
  if (!candidates.length) return;
  const { index } = candidates[0];
  const sayingIndex = (index + (random() < 0.5 ? 0 : 7)) % NEUTRAL_SAYINGS.length;
  state.active = { personIndex: index, text: NEUTRAL_SAYINGS[sayingIndex], expiresAt: now + SPEECH_DURATION_MS };
  state.personReadyAt[index] = now + SPEECH_PERSON_COOLDOWN_MS;
}

export function shiftNeutralSpeechTime(state, pausedFor) {
  state.readyAt += pausedFor;
  if (state.active) state.active.expiresAt += pausedFor;
  for (const index of Object.keys(state.personReadyAt)) state.personReadyAt[index] += pausedFor;
}
