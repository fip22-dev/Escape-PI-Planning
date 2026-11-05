# Escape PI Planning – Game Design

## Ziel

Ein humorvolles 2D-Browserspiel in Draufsicht und Retro-Pixeloptik. Die Spielfigur versucht, während des PI Plannings das Gebäude zu verlassen.

## Vereinbarte Eckpunkte

- Start ist der Raum PI-Einführung, in dem die Einführung zum PI stattfindet.
- Es gibt sieben Team-Sitzungszimmer mit den Namen Windows Client Team, Windows Software Team, Workplace Device & Print Solutions Team, Enterprise Mobile Services Team, Mac Workplace Team, M365 Tenant & Collaboration Team sowie Communication & Meetingroom Solutions Team.
- Die Karte hat einen Hauptgang, einen parallelen Westgang und drei Quergänge als Abkürzungen und Ausweichwege.
- Teamzimmer sind Seitenräume. Keines muss durchquert werden, um vom Start zum Ausgang zu gelangen.
- Ziel ist, den Ausgang innerhalb eines Timers zu erreichen.
- Entdeckt eine der sechs Hauptfiguren die Spielfigur, erscheint ein Dialog. Danach beginnt der Versuch im Raum PI-Einführung neu.
- Siebenunddreissig neutrale Personen verteilen sich auf Teamzimmer, Nebenräume, PI-Einführungsraum und Gänge. Sie lösen allein keinen Neustart aus.
- P&T bedeutet People & Transformation.
- Für Version 0.1 übernehmen wir als Vorschlag: Pfeiltasten und WASD, 180 Sekunden Spielzeit, überspringbare Wiederholungsdialoge, pixelige Retro-Grafik und eine dezente Chiptune-Atmosphäre.

## Kartenprinzip

Der PI-Einführungsraum liegt am südlichen Ende und führt direkt in den Hauptgang. Der Ausgang liegt am nördlichen Ende des Hauptgangs. Der Westgang verläuft parallel dazu; drei Quergänge verbinden die beiden Gänge. Die Teamzimmer liegen mit Türen seitlich an den Gängen und sind keine Durchgangsräume.

Vorgeschlagene Zimmerverteilung:

- Westgang: Windows Client Team im oberen Bereich, Workplace Device & Print Solutions Team im mittleren Bereich, Mac Workplace Team weiter unten und M365 Tenant & Collaboration Team im unteren Bereich. Die Zimmer haben leicht unterschiedliche Höhen und bleiben durch kurze Wandabschnitte voneinander getrennt.
- Hauptgang: Windows Software Team im oberen Bereich, Enterprise Mobile Services Team mittig und Communication & Meetingroom Solutions Team im unteren Bereich.
- Quergang Q1 liegt oben, Q2 in der Mitte und Q3 unten. Der Pausenraum zweigt nördlich von Q1 ab. Fünf kleine Sitzungszimmer liegen als Seitenräume rund um Q2 und Q3; die Quergänge bleiben frei begehbar.
- Der PI-Einführungsraum verbindet sich direkt mit dem unteren Ende des Hauptgangs. Er ist vertikal angelegt, durchgehend vierzehn Kacheln breit und zwölf Kacheln lang; die zwei zusätzlichen Kacheln liegen auf der rechten Seite.

Schematisch:

```text
                         AUSGANG
                            │
WESTGANG ═══════ Q1 ═════ HAUPTGANG
   │                         │
   ├──────────── Q2 ═════════┤
   │                         │
   └──────────── Q3 ═════════┤
                             │
                       PI-START
```

Teamzimmer sind seitliche Abzweigungen an den Gängen. Ihre genaue Grundfläche und Türpositionen werden beim Kartenentwurf festgelegt. Communication & Meetingroom Solutions Team ist kein Durchgangszimmer. Die Figurenrouten nennen die Teamzimmer direkt beim Namen.

## Perspektive und Kamera

- Die Spielwelt wird in fester Draufsicht von oben dargestellt.
- Die Kamera folgt der Spielfigur durch die Etage; sie dreht oder kippt sich nicht.
- Als Startwert verwenden wir 16×16-Pixel-Kacheln und einen sichtbaren Ausschnitt von ungefähr 20×15 Kacheln. Diese Masse können wir im Karten-Prototyp anpassen.

## Figuren und Bewegung – Vorschlag für Version 0.1

Die sechs Hauptfiguren können die Spielfigur entdecken. Die Laufwege sind fest und wiederholen sich, damit sie erlernbar sind. Die Figuren bewegen sich mit ungefähr ein bis zwei Kacheln pro Sekunde und bleiben an Teamzimmern oder Kreuzungen kurz stehen.

| Figur | Laufweg | Halt |
|---|---|---|
| RTE | Patrouilliert zwischen PI-Einführungsraum und Ausgang auf dem Hauptgang. Wechselt bei Q1 oder Q3 in den Westgang und zurück. | 2 Sekunden an Kreuzungen, 4 Sekunden beim Ausgang |
| P&T | Macht ausgewählte Check-ins: Windows Client Team → Enterprise Mobile Services Team → Communication & Meetingroom Solutions Team → zurück. Muss nicht jedes Teamzimmer besuchen. | 5 Sekunden pro Check-in |
| BO | Besucht alle sieben Teams in der Reihenfolge der obigen Liste und beginnt danach wieder beim Windows Client Team. | 4 Sekunden pro Team |
| PM | Besucht alle sieben Teams in umgekehrter Reihenfolge und beginnt danach wieder beim Communication & Meetingroom Solutions Team. | 4 Sekunden pro Team |
| PO | Besucht die Teams in einer abweichenden Runde: Enterprise Mobile Services Team → Windows Client Team → Mac Workplace Team → Windows Software Team → M365 Tenant & Collaboration Team → Workplace Device & Print Solutions Team → Communication & Meetingroom Solutions Team → zurück zum Enterprise Mobile Services Team. | 4 Sekunden pro Team |
| SM | Kontrolliert den unteren Bereich: Mac Workplace Team → Q3 → Communication & Meetingroom Solutions Team → M365 Tenant & Collaboration Team → Q2 → zurück. | 3 Sekunden an Türen und Kreuzungen |

Die drei Rundgänge von BO, PM und PO starten zeitversetzt, damit sie sich nicht gleichzeitig an einem Ort sammeln. Beim Neustart werden alle Figuren auf ihre festen Startpositionen und Zeitversätze zurückgesetzt. Die Wegpunkte führen über die Gänge; die Zimmer selbst sind Besuche mit einem kurzen Halt an der Tür oder im Zimmer.

## Sicht und Entdeckung – Vorschlag für Version 0.1

- Eine Hauptfigur sieht nur in Blickrichtung, nicht rundherum.
- Die Sicht reicht ungefähr fünf Kacheln weit und wird durch Wände und geschlossene Türen blockiert.
- Wer direkt neben einer Hauptfigur steht, wird auch ausserhalb ihrer Blickrichtung entdeckt.
- Ein gelbes Ausrufezeichen warnt kurz, bevor die Entdeckung ausgelöst wird.
- Bleibt die Spielfigur ungefähr 0,7 Sekunden im Sichtbereich, wird sie entdeckt. Danach erscheint der Dialog.
- Neutrale Personen entdecken den Spieler nicht.

## Timer, Dialog und Neustart – Vorschlag für Version 0.1

- Timer: 180 Sekunden.
- Der Timer startet, sobald der Spieler nach der PI-Einführung die Flucht beginnt.
- Während eines Dialogs steht die Uhr still.
- Der erste Dialog einer Figur wird vollständig angezeigt. Bei Wiederholungen kann man mit Enter, Leertaste oder Mausklick überspringen.
- Nach dem Dialog startet der Versuch im Raum PI-Einführung mit vollem Timer und zurückgesetzten Figuren.

## Neutrale Personen – Vorschlag für Version 0.1

Insgesamt siebenunddreissig neutrale Personen, verteilt über die ganze Etage:

- vierzehn Personen in den Teamzimmern: zwei pro Team; Workplace Device & Print Solutions Team und Communication & Meetingroom Solutions Team erhalten je eine dritte Person
- fünf Personen in den kleinen Sitzungszimmern: je eine pro Raum
- fünf Personen im Pausenraum
- fünf Personen im PI-Einführungsraum
- sechs Personen in den Gängen und Quergängen

Im Graybox sind die siebenunddreissig neutralen Personen als statische Platzhalter sichtbar; ihre Laufwege und Sprechblasen werden später ergänzt. Sie blockieren den Spieler nicht und lösen keinen Alarm aus. Ihre Laufwege sollen nicht alle gleichzeitig durch denselben Gang führen.

## Neutrale Sprechblasen – Vorschläge für Version 0.1

Neutrale Personen können kurze, zufällig ausgewählte Sprüche sagen, wenn die Spielfigur in ihre Nähe kommt.

- Die Sprechblase bleibt ungefähr 2–3 Sekunden sichtbar.
- Zwischen Sprechblasen gilt eine kurze globale Pause, damit nicht mehrere Figuren gleichzeitig reden.
- Die Blasen sind nicht modal: Sie halten den Timer nicht an, blockieren keine Bewegung und lösen keinen Alarm aus.
- Jede neutrale Figur erhält ein oder zwei Zeilen aus diesem Sprüche-Pool.

1. „Ach, nicht schon wieder PI Planning. Ich hatte gerade eine freie Kalenderlücke gefunden.“
2. „Juhu, endlich Stories schätzen! Ich wollte schon immer Fibonacci-Karten nach Gefühl werfen.“
3. „Die Kaffeemaschine hat mein Geld genommen. Der Kaffee ist jetzt wohl ein offenes Item.“
4. „Ich habe meine Kapazität berechnet. Die Kaffeepausen sind optimistisch eingepreist.“
5. „Die Story ist klein. Sie hat nur drei Teams, zwei Abhängigkeiten und einen eigenen Kalender.“
6. „Sind wir schon aligned? Ich weiss nur noch nicht, wohin.“
7. „Bitte keine neuen Post-its. Mein Laptop hat schon Angst vor dem Board.“
8. „Ich habe die Risiken dokumentiert. Jetzt ist das Dokument selbst ein Risiko.“
9. „Fünf Story Points. Oder vier? Ich frage kurz den Kaffee.“
10. „Mein Team ist hochmotiviert. Drei von uns suchen gerade die Kaffeemaschine.“
11. „Gleich fertig – sobald wir uns auf die Definition von ‹gleich› geeinigt haben.“
12. „Ich mache Notizen. Noch weiss ich nicht wozu, aber sie sind sehr präzise.“
13. „Die Kaffeemaschine funktioniert. Sie liefert nur keinen Kaffee.“
14. „Mein Kaffee-Token ist aufgebraucht. Ist das ein Impediment?“
15. „Ich wollte nur kurz Wasser holen. Jetzt bin ich Teil einer Abhängigkeit.“

## Grafik und Sound – Vorschlag für Version 0.1

- Eigene Pixelgrafiken mit 16×16-Kacheln und einer reduzierten Farbpalette.
- Spielfigur und Hauptfiguren erhalten klare Silhouetten; Accessoires und Namensschilder helfen, die sechs Entdecker zu erkennen.
- Die Entdecker müssen auf den ersten Blick von neutralen Personen unterscheidbar sein: starke Kontur und Akzentfarbe plus ein dauerhaft sichtbares Rollen-Symbol oder Namensschild. Die Unterscheidung darf nicht allein von der Farbe abhängen.
- Neutrale Personen erhalten eine zurückhaltendere Gestaltung und kein Entdecker-Symbol.
- Eine heitere, leicht heimliche Chiptune-Schleife, ungefähr 30 bis 45 Sekunden lang, als Hintergrundmusik.
- Wenige Soundeffekte für Schritte, Türen, Warnzeichen und Dialoge; eine Stummschaltung ist verfügbar.
- Der Retro-Look ist eine Stil-Inspiration. Pokémon-Figuren, Grafiken, Musik oder Markenzeichen werden nicht übernommen; alle Inhalte werden selbst erstellt oder passend lizenziert.

## Dialoge bei Entdeckung – Vorschläge für Version 0.1

Beim ersten Erwischtwerden bekommt jede Rolle einen eigenen Einstiegsdialog. Bei späteren Versuchen verwendet sie einen kurzen Running-Gag darüber, dass die Flucht noch als offener Punkt gilt. Wiederholungsdialoge sind überspringbar.

| Rolle | Erstes Erwischtwerden | Späterer Versuch |
|---|---|---|
| RTE | „Erwischt! Ich wollte deinen Abgang gerade als ungeplante Abhängigkeit ins ART-Board aufnehmen.“ | „Ich sehe: ‹Flucht aus dem PI› ist noch offen. Der Ausgang wird freigegeben, sobald alle Abhängigkeiten geklärt sind. Ich bin leider eine davon.“ |
| P&T | „Kurzer Check-in: Wie fühlst du dich auf dem Weg zum Ausgang – und was brauchst du, um weiterzugehen?“ | „Dein Check-out ist wohl noch offen. Dafür braucht es jetzt vermutlich ein Bila oder ein Gespräch. Ich verspreche: diesmal wirklich kurz.“ |
| BO | „Ich sehe Potenzial in diesem Exit. Kannst du den Business Value noch kurz quantifizieren?“ | „Der Business Case fürs Weggehen ist noch offen. Sobald der Mehrwert fürs Parkieren belegt ist, gebe ich den Ausgang frei.“ |
| PM | „Du gehst schon? Ich nehme ‹Heimweg› in die Roadmap auf. Zieltermin: nach dem nächsten PI.“ | „Dein Heimweg steht auf der Roadmap, aber noch ohne Liefertermin. Ich schaue ihn mir im nächsten PI an.“ |
| PO | „Ich habe deinen Flucht-Backlog priorisiert. Eine kleine Akzeptanzkriterien-Frage hätte ich noch.“ | „Das Ticket ‹Ausgang benutzen› ist noch offen. Akzeptanzkriterium: Du bist draussen. Status: fast.“ |
| SM | „Erwischt! Ich wollte gerade eine kurze Retrospektive über deinen Fluchtversuch machen.“ | „Sind die DoR für deinen Abgang schon ready? Der Ausgang ist erst ready, wenn deine Flucht ready ist. Ich hätte dazu nur noch ein kleines Refinement.“ |

## Noch beim Kartenentwurf festzulegen

- genaue Kachelmasse und Grundfläche der Teamzimmer
- genaue Türpositionen, Möbel und Deckungsmöglichkeiten
- finale Routenlängen und Startpositionen nach einem ersten spielbaren Prototyp
- Dialogtexte der sechs Hauptfiguren
