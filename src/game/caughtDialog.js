const ROLE_NAMES = {
  RTE: "Release Train Engineer",
  "P&T": "People & Transformation",
  BO: "Business Owner",
  PM: "Product Manager",
  PO: "Product Owner",
  "Scrum Master": "Scrum Master",
};

const DIALOGS = {
  RTE: [
    "Erwischt! Ich wollte deinen Abgang gerade als ungeplante Abhängigkeit ins ART-Board aufnehmen.",
    "Ich sehe: ‹Flucht aus dem PI› ist noch offen. Der Ausgang wird freigegeben, sobald alle Abhängigkeiten geklärt sind. Ich bin leider eine davon.",
    "Dein Fluchtweg ist gut geplant. Leider fehlt noch das Alignment mit allen, die dich aufhalten.",
    "Du willst den Zug verlassen? Das besprechen wir zuerst im nächsten ART Sync.",
  ],
  "P&T": [
    "Kurzer Check-in: Wie fühlst du dich auf dem Weg zum Ausgang – und was brauchst du, um weiterzugehen?",
    "Dein Check-out ist wohl noch offen. Dafür braucht es jetzt vermutlich ein Bila oder ein Gespräch. Ich verspreche: diesmal wirklich kurz.",
    "Bevor du gehst: Auf einer Skala von eins bis zehn, wie sehr brauchst du diese Pause?",
    "Ich höre einen starken Wunsch nach Freiheit. Lass uns dazu einen Workshop machen.",
  ],
  BO: [
    "Ich sehe Potenzial in diesem Exit. Kannst du den Business Value noch kurz quantifizieren?",
    "Der Business Case fürs Weggehen ist noch offen. Sobald der Mehrwert fürs Parkieren belegt ist, gebe ich den Ausgang frei.",
    "Deine Flucht hat Potenzial. Wie hoch sind die Einsparungen pro vermiedenem Meeting?",
    "Ich unterstütze deinen Abgang. Sobald wir den Nutzen im Steering vorgestellt haben.",
  ],
  PM: [
    "Du gehst schon? Ich nehme ‹Heimweg› in die Roadmap auf. Zieltermin: nach dem nächsten PI.",
    "Dein Heimweg steht auf der Roadmap, aber noch ohne Liefertermin. Ich schaue ihn mir im nächsten PI an.",
    "Dein Wunsch nach Freiheit ist erfasst. Im nächsten PI priorisieren wir ihn gegen andere Wünsche.",
    "Wir liefern den Ausgang inkrementell. Heute gibt es schon mal die Türklinke.",
  ],
  PO: [
    "Ich habe deinen Flucht-Backlog priorisiert. Eine kleine Akzeptanzkriterien-Frage hätte ich noch.",
    "Das Ticket ‹Ausgang benutzen› ist noch offen. Akzeptanzkriterium: Du bist draussen. Status: fast.",
    "Du wolltest nur kurz raus? Klingt klein. Lass uns trotzdem erst die Story schätzen.",
    "Dein Fluchtticket ist fast fertig. Es fehlt nur noch die Abnahme durch alle Stakeholder.",
  ],
  "Scrum Master": [
    "Erwischt! Ich wollte gerade eine kurze Retrospektive über deinen Fluchtversuch machen.",
    "Sind die DoR für deinen Abgang schon ready? Der Ausgang ist erst ready, wenn deine Flucht ready ist. Ich hätte dazu nur noch ein kleines Refinement.",
    "Du läufst im Kreis. Perfekt, dann sind wir schon mitten im nächsten Sprint.",
    "Ich halte dich nur kurz auf. Wir müssen noch klären, warum unsere kurzen Meetings so lange dauern.",
  ],
};

export function createCaughtDialog(role, seenRoles, repeatCounts = new Map()) {
  const family = role.startsWith("PO · ") ? "PO" : role;
  if (!DIALOGS[family]) throw new Error(`Unknown dialogue role: ${role}`);
  const repeated = seenRoles.has(family);
  const repeatIndex = repeated ? (repeatCounts.get(family) ?? 0) % (DIALOGS[family].length - 1) : null;
  const text = DIALOGS[family][repeated ? repeatIndex + 1 : 0];
  const pages = [""];
  for (const word of text.split(" ")) {
    const index = pages.length - 1;
    if (pages[index].length + word.length + 1 > 100) pages.push(word);
    else pages[index] += `${pages[index] ? " " : ""}${word}`;
  }
  const roleName = family === "PO" ? `${ROLE_NAMES.PO} · ${role.slice(5)}` : ROLE_NAMES[family];
  return { role, roleName, family, repeated, repeatIndex, pages: repeated ? [text] : pages, pageIndex: 0 };
}

export function advanceCaughtDialog(dialog, seenRoles, repeatCounts = new Map()) {
  if (!dialog.repeated && dialog.pageIndex < dialog.pages.length - 1) {
    dialog.pageIndex += 1;
    return false;
  }
  seenRoles.add(dialog.family);
  if (dialog.repeated) {
    repeatCounts.set(dialog.family, (dialog.repeatIndex + 1) % (DIALOGS[dialog.family].length - 1));
  }
  return true;
}
