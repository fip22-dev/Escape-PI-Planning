# Escape PI Planning – Game Design

## Spielziel

Ein humorvolles 2D-Browserspiel in fester Draufsicht und eigener Retro-Pixeloptik. Die Spielfigur versucht, während des PI Plannings innerhalb des Zeitlimits den Ausgang zu erreichen. Sechs Hauptfiguren können sie entdecken; neutrale Personen beleben die Etage, lösen aber allein keinen Alarm aus.

## Festgelegte Eckpunkte für Version 0.1

- Start im Raum **PI-Einführung**; der Ausgang liegt am nördlichen Ende des Hauptgangs.
- Steuerung mit **Pfeiltasten oder WASD**.
- Vorgesehener Timer: **180 Sekunden**. Er startet, wenn die Spielfigur die Flucht beginnt.
- Wird die Spielfigur von einer der sechs Hauptfiguren entdeckt, erscheint ein rollenspezifischer Dialog. Danach startet der Versuch im PI-Einführungsraum neu.
- Wiederholungsdialoge können übersprungen werden; während eines Dialogs steht der Timer still.
- Die Karte enthält sieben benannte Teamzimmer, einen Pausenraum, fünf kleine Meeting-Räume, den PI-Einführungsraum und drei Quergänge.
- **37 neutrale Personen** verteilen sich über die gesamte Etage. Alle bewegen sich auf festen Routen innerhalb ihres jeweiligen Raums oder Gangs und blockieren einander sowie die Spielfigur. Neutrale Personen lösen selbst keinen Alarm aus. Ihre dynamische Sichtblockierung für Suchende ist noch nicht umgesetzt.
- P&T bedeutet **People & Transformation**.
- Kamera und Spielwelt bleiben in fester Draufsicht; die Kamera folgt der Spielfigur.

## Grundriss

Der aktuelle Graybox-Grundriss ist im Prototyp umgesetzt. Die offenen Raumränder wurden am 05.11.2026 durch Aussenwände geschlossen. Die Teamzimmer haben je einen zwei Kacheln breiten Türdurchgang; Nebenräume haben je einen Türdurchgang, Meeting 1 hat als Ausnahme zwei Eingänge. Kein Teamzimmer muss durchquert werden, um vom Start zum Ausgang zu gelangen. Gelbe Kacheln markieren die Türpositionen.

Pausenraum, PI-Einführungsraum und Ausgang haben jeweils eine zwei Kacheln breite Öffnung. Die Teamzimmer-Türen sind ebenfalls zwei Kacheln breit, entlang der jeweiligen Seitenwand. Die übrigen Türen sind eine Kachel breit. Der Pausenraum-Eingang liegt bei Spalten 22–23 (nullbasierte Kartenkoordinaten), eine Kachel links von seiner vorherigen Position. Bei den Seitenräumen führt vom gelben Türfeld am inneren Raumrand eine zusätzliche begehbare Kachel durch die neue Aussenwand zum Gang. Diese zusätzliche Tiefe erhält die vereinbarten Raumflächen; sie ist keine zweite Tür. Der Browser-Spieltest ist vom Nutzer bestätigt.

Der Ausgang wurde um eine Kachel nach links auf die Spalten 33–34 (Zeile 2, nullbasierte Kartenkoordinaten) verschoben; seine Beschriftung ist darüber zentriert.

### Teamzimmer und Lage

- **Westgang:** Windows Client Team im oberen Bereich, Workplace Device & Print Solutions Team mittig, Mac Workplace Team weiter unten und M365 Tenant & Collaboration Team im unteren Bereich.
- **Hauptgang:** Windows Software Team im oberen Bereich, Enterprise Mobile Services Team mittig und Communication & Meetingroom Solutions Team im unteren Bereich.
- Die offiziellen Teamnamen bleiben genau in der vorgegebenen Schreibweise, einschliesslich **Communication & Meetingroom Solutions Team**.
- Das Communication & Meetingroom Solutions Team hat eine Tür und ist kein Durchgangszimmer.

### Nebenräume und PI-Einführung

- Der Pausenraum zweigt nördlich von Q1 ab.
- Fünf kleine Räume mit den Kartenbeschriftungen **Meeting 1** bis **Meeting 5** liegen als Seitenräume rund um Q2 und Q3.
- Meeting 1 besitzt zwei Eingänge: oben mit kurzem Zugang von Q1 und unten zu Q2. Beide bleiben passierbar; die Beschriftung steht links neben der oberen Tür.
- Die Quergänge Q1, Q2 und Q3 bleiben frei begehbar und dienen als Abkürzungen und Ausweichwege.
- Der PI-Einführungsraum liegt am südlichen Ende und ist direkt mit dem Hauptgang verbunden. Er ist vertikal angelegt, **14 Kacheln breit und 12 Kacheln lang**; die zwei zusätzlichen Kacheln liegen auf der rechten Seite.
- Grundflächen und Türpositionen sind für den Graybox festgelegt. Nach dem Test können sie bei Bedarf angepasst werden.

Vereinfachte Darstellung der Gangverbindungen; die Teamzimmer und Nebenräume liegen seitlich daran:

```text
                         AUSGANG
                            │
WESTGANG ═══════ Q1 ═════ HAUPTGANG
   │                         │
   ├──────────── Q2 ═════════┤
   │                         │
   └──────────── Q3 ═════════┤
                             │
                       PI-EINFÜHRUNG
```

## Stand des Prototyps

Der aktuelle Prototyp ist ein **Graybox**: Die Räume und Figuren sind einfache Platzhalter, mit denen wir Grundriss, Wege und Kamera prüfen.

Bereits umgesetzt:

- Browser-Spielbasis mit Phaser und Vite.
- Bewegung mit WASD und Pfeiltasten; Wände halten die Spielfigur auf, die gelben Türfelder sind passierbar.
- Mitlaufende Kamera und 16×16-Pixel-Kacheln; der Grundausschnitt entspricht ungefähr 20×15 Kacheln.
- Raum- und Ausgangsbeschriftungen mit fetter 9-Pixel-Schrift und deckendem dunklem Hintergrund. Raumnamen stehen oberhalb der Raumfläche, bei M365 wegen des knappen Abstands unterhalb. Meeting 1–5 beginnen linksbündig am linken äusseren Wandrand; PI-Einführung steht auf der dunklen Fläche rechts neben dem Eingang und oberhalb des Raums. Der Steuerungshinweis steht ausschliesslich im Seitenfuss ausserhalb des Spielfelds. Die Kamera rundet auf ganze Pixel. Die Darstellung bleibt durch die 320×240-Spielauflösung pixelig; die Platzierung ist vom Nutzer bestätigt. Teilweise verschwommene Schrift bleibt als offener Darstellungsfehler bestehen.
- Sieben Teamzimmer, Pausenraum, fünf Meeting-Räume und PI-Einführungsraum.
- 37 neutrale Personen an den unten beschriebenen Stellen; alle bewegen sich auf festen, begrenzten Raum- oder Gangrouten.

Noch nicht im Spielcode umgesetzt: Timer, Sieg- und Ablaufzustand, sechs bewegliche Hauptfiguren, Sicht- und Entdeckungslogik, Dialoge, Sprechblasen und finale Pixelgrafik oder Audio.

## Hauptfiguren und Routen – Entwurf für Version 0.1

Die sechs Hauptfiguren sollen erkennbare Rollen haben und feste, wiederholbare Routen nutzen. Die nachfolgenden Wege und Haltezeiten sind Startwerte für den nächsten spielbaren Prototyp und müssen im Spiel geprüft werden.

| Figur | Vorgesehener Laufweg | Halt |
|---|---|---|
| RTE | Patrouilliert zwischen PI-Einführung und Ausgang auf dem Hauptgang. Wechselt bei Q1 oder Q3 in den Westgang und zurück. | 2 Sekunden an Kreuzungen, 4 Sekunden beim Ausgang |
| P&T | Ausgewählte Check-ins: Windows Client Team → Enterprise Mobile Services Team → Communication & Meetingroom Solutions Team → zurück. Besucht nicht alle Teams. | 5 Sekunden pro Check-in |
| BO | Besucht alle sieben Teams in der Reihenfolge der Teamliste oben und beginnt wieder beim Windows Client Team. | 4 Sekunden pro Team |
| PM | Besucht alle sieben Teams in umgekehrter Reihenfolge und beginnt wieder beim Communication & Meetingroom Solutions Team. | 4 Sekunden pro Team |
| PO | Enterprise Mobile Services Team → Windows Client Team → Mac Workplace Team → Windows Software Team → M365 Tenant & Collaboration Team → Workplace Device & Print Solutions Team → Communication & Meetingroom Solutions Team → zurück. | 4 Sekunden pro Team |
| SM | Kontrolliert den unteren Bereich: Mac Workplace Team → Q3 → Communication & Meetingroom Solutions Team → M365 Tenant & Collaboration Team → Q2 → zurück. | 3 Sekunden an Türen und Kreuzungen |

Die Routen von BO, PM und PO starten zeitversetzt. Die Figuren laufen durch die Gänge; ein Teamzimmerbesuch endet an der Tür oder führt kurz in den Raum. Beim Neustart werden Startpositionen und Zeitversätze zurückgesetzt. Die genaue Wegführung und die Positionen der 37 neutralen Personen bleiben Gegenstand des Spieltests.

## Sicht und Entdeckung – Regeln für Version 0.1

- Hauptfiguren entdecken nur in Blickrichtung, nicht rundherum.
- Die vorgesehene Sichtweite beträgt ungefähr fünf Kacheln. Wände, geschlossene Türen und neutrale Personen blockieren die Sicht. Neutrale Personen dienen damit auch als bewegliche Sichtdeckung; diese Funktion ist noch nicht implementiert.
- Direkt neben einer Hauptfigur wird die Spielfigur auch ausserhalb ihrer Blickrichtung entdeckt.
- Ein gelbes Ausrufezeichen warnt kurz vor der Entdeckung.
- Bleibt die Spielfigur ungefähr 0,7 Sekunden im Sichtbereich, gilt sie als entdeckt.
- Neutrale Personen entdecken die Spielfigur nicht.

Diese Werte werden beim Implementieren und Testen feinjustiert.

## Timer, Dialog und Neustart

- Timer: 180 Sekunden. Er beginnt, sobald die Flucht aus der PI-Einführung startet.
- Bei Sieg wird der Timer gestoppt und der Ausgang als geschafft angezeigt; bei null Sekunden endet der Versuch.
- Bei Entdeckung wird der Timer für den Dialog angehalten. Danach startet der Versuch im PI-Einführungsraum mit vollem Timer und zurückgesetzten Hauptfiguren neu.
- Der erste Dialog einer Rolle wird vollständig gezeigt. Wiederholungsdialoge können mit Enter, Leertaste oder Mausklick übersprungen werden.

Der Sieg- und Ablaufzustand sowie der Timer sind noch zu implementieren.

## Raumobjekte

Verbindliche Regeln:

| Objekt | Passierbar | Blockiert Sicht |
|---|---|---|
| Pflanze | Nein | Ja |
| Tisch | Nein | Ja |
| Kaffeemaschine | Nein | Ja |
| Stuhl | Ja | Nein |
| Leinwand | Ja | Nein |
| Whiteboard | Ja | Nein |
| Sideboard / Aktenschrank | Nein | Ja |
| Druckerstation | Nein | Ja |
| Abfalleimer | Nein | Nein |
| Laptop, Unterlagen und Becher auf Tischen | Keine zusätzliche Kollision | Keine zusätzliche Sichtwirkung |

Die Bewegungskollision ist implementiert. Die Sichtblockierung ist als Objekteigenschaft hinterlegt; ihre Wirkung wird erst mit der noch fehlenden Sichtlogik der Suchenden implementiert und geprüft.

Aktuelle, im Browser visuell abgenommene Platzierung auf `feature/room-objects`:

- Jeder der sieben Teamräume: ein Sitzungstisch mit acht Stühlen, zwei Pflanzen und ein zwei Kacheln breiter Eingang. In den vier links gelegenen Teamräumen hängt die drei Kacheln hohe Leinwand an der linken Wand; in Communication & Meetingroom Solutions, Windows Software und Enterprise Mobile hängt sie an der rechten Wand. Im Workplace Device & Print Solutions Team stehen Tisch und darunter platzierte neutrale Person je eine Kachel weiter südlich.
- Alle fünf Meeting-Räume erhalten hochkant an der rechten Wand platzierte Leinwände. Meeting 1 erhält eine drei Kacheln hohe, Meeting 2–5 je eine zwei Kacheln hohe Leinwand.
- PI-Einführung: 30 Stühle in fünf Reihen mit je einer Leerreihe dazwischen. Jede Reihe hat vier Stühle rechts und zwei zusätzliche links; der Stuhlblock endet eine Kachel vor der rechten Wand. Die linke Laufspur und der Zugang bleiben frei. Neutrale Personen stehen ausserhalb der belegten Stuhlreihen. Eine fünf Kacheln breite Leinwand steht rechts neben der Tür. Links an der Wand folgen von oben nach unten eine Kaffeemaschine direkt oberhalb eines senkrechten, drei Kacheln langen Tisches ohne Stühle mit Obst, Gemüse und Gipfeli sowie ein Papierkorb; eine Pflanze steht unter dem Papierkorb. Zwei weitere Pflanzen stehen verteilt im Raum.
- Pausenraum: um eine Kachel nach Norden vergrössert, mit weiterhin südlichem Eingang. Er enthält zwei kleine Tische mit je vier Stühlen, drei Kaffeemaschinen und drei Abfalleimer an der oberen Wand sowie Pflanzen in den beiden unteren Ecken. Auf den Tischen liegen Essen und Kaffeetassen statt Laptop und Unterlagen.

Zusätzliche Büroausstattung: Jeder Teamraum erhält ein Whiteboard mit bunten Karten an der oberen Wand und ein niedrig gezeichnetes Sideboard an der unteren Wand. In allen vier Westgang-Teams steht das Sideboard unten links und eine Pflanze unten rechts. Die Sideboards blockieren gemäss Spielregel trotzdem die Sicht. Im Workplace Device & Print Solutions Team steht zusätzlich eine Druckerstation rechts neben dem Sideboard; eine weitere Druckerstation steht ganz rechts im oberen Westgang. Neben jeder der vier Kaffeemaschinen steht ein Abfalleimer. Die Teamtische zeigen Laptop, Unterlagen und Kaffeebecher; die beiden Pausentische zeigen Essen und Kaffeetassen. Diese Details sind reine Dekoration. Zusätzliche Wegweiser oder Ausgangsschilder werden nicht ergänzt; die bestehende Ausgangsbeschriftung bleibt erhalten.

Sieben zusätzliche Pflanzen stehen in den äusseren Randnischen der ein Kachel breiteren Abschnitte von West- und Hauptgang. Der Drucker im oberen Westgang steht an der äussersten rechten Gangposition. Türfelder, durchgehende Laufwege und Startposition bleiben frei. Neutrale Platzhalter, deren bisherige Position von soliden Möbeln belegt wird, werden auf freie Felder desselben Raums versetzt. Es bleiben insgesamt 37 Personen. Die visuelle Browserabnahme dieser Platzierung sowie der festen Laufwege und Haltezeiten wurde vom Nutzer bestätigt.

## Neutrale Personen

Insgesamt **37 neutrale Personen**, über die ganze Karte verteilt:

- 16 in den Teamzimmern: je zwei pro Team; Workplace Device & Print Solutions Team und Communication & Meetingroom Solutions Team erhalten je eine dritte Person.
- 5 in den Meeting-Räumen: je eine pro Raum.
- 5 im Pausenraum.
- 5 im PI-Einführungsraum.
- 6 in den Gängen und Quergängen.

Neutrale Personen sind körperliche Hindernisse: Die Spielfigur und andere Personen können nicht durch sie hindurchgehen. Sie entdecken die Spielfigur nicht und lösen selbst keinen Alarm aus. Alle 37 Personen bewegen sich auf festen Routen innerhalb ihres Raums oder Gangs. Raumfiguren betreten keine Tür- oder Gangfelder; Gangfiguren bleiben auf Gangflächen. Die reproduzierbar erzeugten Routen reichen, wo Platz und Möbel es zulassen, bis zu vier Kacheln von der Startposition. Im Pausenraum hat jede der fünf Personen eine eigene, getrennte Route, damit sie nicht auf denselben Engstellen aufeinander warten. Die Person in Meeting 2 umrundet den Tisch. Jeder Kachelschritt dauert 650 ms und wird von 700 ms Pause gefolgt. Türen, solide Möbel, andere Personen und die Spielfigur blockieren die Bewegung; während eines Schritts gelten Start- und reservierte Zielkachel als belegt. Automatisierte Routentests sind erfolgreich; die visuelle Abnahme aller neutralen Bewegungsrouten wurde vom Nutzer bestätigt. Dynamische Sichtdeckung ist noch nicht umgesetzt.

### Laufwegplanung für den Bewegungsprototyp

- **Team-, Meeting-, Pausen- und PI-Räume:** Jede Person erhält eine reproduzierbare Route innerhalb ihres Raums. Die fünf Pausenraumrouten sind voneinander getrennt. Meeting 2 behält eine Schleife um den Tisch.
- **Gänge und Quergänge:** Jede Person erhält eine reproduzierbare Route auf Gangflächen und bleibt von Türfeldern und Seitenräumen getrennt.

Die Bewegung ist bewusst langsam: 650 ms pro Kachelschritt und anschliessend 700 ms Pause. Routen reichen bis zu vier Kacheln von der Startposition, soweit Raum und Möbel das zulassen. Solide Möbel, andere Personen und die Spielfigur blockieren die nächsten Kacheln. Die Spielfigur prüft sowohl die aktuelle als auch die während einer Bewegung reservierte Personenkachel. Bei belegtem Ziel wartet die Person 500 ms und versucht denselben Routenschritt erneut.

Die Bewegungsrouten wurden im Browser visuell abgenommen. Als nächstes folgt der RTE-Prototyp, der Personen als dynamische Sichtblocker berücksichtigt; Ausweichrouten für beengte oder stark belegte Felder werden anhand des Spieltests ergänzt.

## Neutrale Sprechblasen – Entwurf

Neutrale Personen können kurze, zufällig ausgewählte Sprüche sagen, wenn die Spielfigur in ihre Nähe kommt.

- Eine Sprechblase bleibt ungefähr 2–3 Sekunden sichtbar.
- Zwischen Sprechblasen gilt eine kurze globale Pause.
- Sprechblasen sind nicht modal: Sie halten den Timer nicht an und blockieren keine Bewegung.
- Jede neutrale Figur erhält ein oder zwei Zeilen aus dem Sprüche-Pool.

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

## Beta-Feedback über GitHub Issues

Für Beta-Tests soll das Spiel zwei leicht auffindbare Möglichkeiten anbieten: **Fehler melden** und **Idee vorschlagen**. Als erste Lösung öffnen diese Aktionen passende GitHub-Issue-Formulare in einem neuen Browser-Tab. Das Spiel übermittelt keine Berichte automatisch; Tester prüfen und senden den ausgefüllten Bericht selbst ab. Die Umsetzung und nötigen Issue-Formulare sind in [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) beschrieben.

## Dialoge bei Entdeckung – Vorschläge

Beim ersten Erwischtwerden erhält jede Rolle einen eigenen Einstiegsdialog. Bei späteren Versuchen folgt ein kurzer Running-Gag zum noch offenen Fluchtpunkt.

| Rolle | Erstes Erwischtwerden | Späterer Versuch |
|---|---|---|
| RTE | „Erwischt! Ich wollte deinen Abgang gerade als ungeplante Abhängigkeit ins ART-Board aufnehmen.“ | „Ich sehe: ‹Flucht aus dem PI› ist noch offen. Der Ausgang wird freigegeben, sobald alle Abhängigkeiten geklärt sind. Ich bin leider eine davon.“ |
| P&T | „Kurzer Check-in: Wie fühlst du dich auf dem Weg zum Ausgang – und was brauchst du, um weiterzugehen?“ | „Dein Check-out ist wohl noch offen. Dafür braucht es jetzt vermutlich ein Bila oder ein Gespräch. Ich verspreche: diesmal wirklich kurz.“ |
| BO | „Ich sehe Potenzial in diesem Exit. Kannst du den Business Value noch kurz quantifizieren?“ | „Der Business Case fürs Weggehen ist noch offen. Sobald der Mehrwert fürs Parkieren belegt ist, gebe ich den Ausgang frei.“ |
| PM | „Du gehst schon? Ich nehme ‹Heimweg› in die Roadmap auf. Zieltermin: nach dem nächsten PI.“ | „Dein Heimweg steht auf der Roadmap, aber noch ohne Liefertermin. Ich schaue ihn mir im nächsten PI an.“ |
| PO | „Ich habe deinen Flucht-Backlog priorisiert. Eine kleine Akzeptanzkriterien-Frage hätte ich noch.“ | „Das Ticket ‹Ausgang benutzen› ist noch offen. Akzeptanzkriterium: Du bist draussen. Status: fast.“ |
| SM | „Erwischt! Ich wollte gerade eine kurze Retrospektive über deinen Fluchtversuch machen.“ | „Sind die DoR für deinen Abgang schon ready? Der Ausgang ist erst ready, wenn deine Flucht ready ist. Ich hätte dazu nur noch ein kleines Refinement.“ |

## Grafik und Audio – Entwurf

- Eigene Pixelgrafiken auf Basis von 16×16-Kacheln und einer reduzierten Farbpalette.
- Spielfigur, Entdecker und neutrale Personen erhalten klare Silhouetten. Die Entdecker tragen zusätzlich ein dauerhaft sichtbares Rollensymbol oder Namensschild; ihre Erkennbarkeit hängt nicht allein von Farbe ab.
- Neutrale Personen sind zurückhaltender gestaltet und erhalten kein Entdecker-Symbol.
- Hintergrundmusik: heitere, leicht heimliche Chiptune-Schleife von ungefähr 30–45 Sekunden.
- Wenige Soundeffekte für Schritte, Türen, Warnzeichen und Dialoge; eine Stummschaltung ist verfügbar.
- Erster Möbelvorschlag mit einfachen eigenen Formen umgesetzt; finale Pixelgrafiken folgen später. Objektregeln und Platzierung stehen im Abschnitt Raumobjekte.
- Pokémon-Figuren, Grafiken, Musik und Markenzeichen werden nicht übernommen. Inhalte werden selbst erstellt oder passend lizenziert.

## Noch offene Designentscheidungen

- Die tatsächliche Sichtwirkung der Möbel mit der späteren Suchenden-Logik prüfen; bisher sind Sichtblocker nur als Objekteigenschaft hinterlegt.
- Nach dem ersten spielbaren Entdecker-Prototyp die vorgeschlagenen Routen, Startpositionen und Haltezeiten abstimmen.
- Den genauen Platz der Beta-Feedback-Aktionen im Start- oder Pausemenü festlegen; die Meldung über GitHub-Issue-Formulare ist als Lösung vorgesehen.

Die Umsetzungsreihenfolge und der Status der Arbeiten stehen in [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md).
