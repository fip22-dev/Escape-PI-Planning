# Escape PI Planning – Game Design

## Spielziel

Ein humorvolles 2D-Browserspiel in fester Draufsicht und eigener Retro-Pixeloptik. Die Spielfigur versucht, während des PI Plannings innerhalb des Zeitlimits den Ausgang zu erreichen. 15 Suchende können sie entdecken; neutrale Personen beleben die Etage, lösen aber allein keinen Alarm aus.

## Festgelegte Eckpunkte für Version 0.1

- Start im Raum **PI-Einführung**; der Ausgang liegt am nördlichen Ende des Hauptgangs.
- Steuerung mit **Pfeiltasten, WASD oder vier Touch-Richtungstasten**. Antippen führt einen Schritt aus; Halten bewegt fortlaufend. **Pause / Weiter** pausiert oder setzt fort, **Neustart** startet den Versuch direkt neu. Bei Pointer-Cancel, Fokusverlust und Szenenneustart wird die Touch-Eingabe zurückgesetzt. Das Seitenlayout berücksichtigt Hoch- und Querformat.
- Vorgesehener Timer: **180 Sekunden**. Er startet, wenn die Spielfigur die Flucht beginnt.
- Wird die Spielfigur von einem der 15 Suchenden entdeckt, erscheint ein rollenspezifischer Dialog. Die sieben Product Owner werden dabei über ihr Teamkürzel unterschieden; Scrum Master wird ausgeschrieben. Danach startet der Versuch im PI-Einführungsraum neu.
- Wiederholungsdialoge können übersprungen werden; während eines Dialogs steht der Timer still.
- Die Karte enthält sieben benannte Teamzimmer, einen Pausenraum, fünf kleine Meeting-Räume, den PI-Einführungsraum und drei Quergänge.
- **37 neutrale Personen** verteilen sich über die gesamte Etage. Alle bewegen sich auf festen Routen innerhalb ihres jeweiligen Raums oder Gangs und blockieren einander sowie die Spielfigur. Neutrale Personen lösen selbst keinen Alarm aus. Für den RTE-Piloten blockieren sie dynamisch die Sicht.
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

Spielschleife implementiert: Der 180-Sekunden-Timer startet beim Verlassen des PI-Einführungsraums. Am Ausgang erscheint der Siegzustand; bei null Sekunden erscheint „Pech gehabt – Zeit abgelaufen“ mit einer Ja/Nein-Abfrage für den Neustart. ESC pausiert Timer und Figuren. Im Pausenmenü startet Ja den Versuch neu; Nein oder ESC setzt ihn fort. Bei Zeitablauf startet Ja neu, Nein lässt den Ablaufbildschirm stehen. Die Auswahl geht per Pfeiltasten und Enter oder per Klick. Der Timer steht vor dem Fluchtstart auf 03:00; die letzten 30 Sekunden sind rot, die letzten 15 Sekunden blinken rot. **Geprüft:** 19 automatisierte Tests, Produktionsbuild sowie Browserprüfung von Pause, Auswahl, Neustart, Sieg und Ablaufmeldung mit verkürztem Entwicklertimer. Escape wurde im eingebetteten VSC-Browser direkt im Fenster abgefangen; Öffnen, Fortsetzen und erneutes Öffnen wurden dort bestätigt. Der Nutzer bestätigte anschliessend den sauberen ESC-Test in Safari; der Produktivtimer ist 180 Sekunden.

**Erledigt:** Alle 15 Suchenden patrouillieren auf den festgelegten Routen. Jede prüft eine kardinale Sichtlinie bis fünf Kacheln; Wände, solide sichtblockierende Objekte und neutrale Personen unterbrechen die Sicht. Bei Sichtkontakt erscheint ein gelbes Ausrufezeichen, das nach 300 ms auf Rot wechselt; bleibt die Spielfigur insgesamt 600 ms sichtbar, zeigt die Meldung die entdeckende Rolle. Bei wiederholter Blockade berechnet jede Suchfigur einen freien Umweg; neutrale Personen tun dasselbe innerhalb ihres Bereichs. Anschliessend setzen sie die Route am nächsten erreichbaren Routenfeld fort. **Prüfung:** 23 automatisierte Tests prüfen alle Suchendenrouten, PO-Raumstarts und -Rückkehr, Warnstufen und Umwege um blockierte Felder. Der Nutzer bestätigte den Browser-Spieltest der Mehrrollenansicht, der PO-Rückkehr, der Warnstufe und des Ausweichens bei Blockaden.

**Erledigt und über PR #10 in `main` integriert:** Rollenspezifische Erst- und Wiederholungsdialoge mit stillstehendem Timer und reproduzierbarem Neustart. Automatisierte Prüfungen erfolgreich; der Nutzer hat den lokalen Browser-Spieltest am 07.11.2026 bestätigt. Einzelheiten und verbleibende Geräteprüfungen stehen im Entwicklungsplan.

**Erledigt:** Neutrale Sprechblasen sind auf `feature/neutral-speech-bubbles` implementiert und automatisiert im Browser geprüft; der Nutzer hat den bisherigen Stand bestätigt und die Verlängerung auf 1,7 Sekunden beauftragt. Die neue Dauer ist automatisiert geprüft. **Noch offen:** Gezielte Prüfung der Sichtwirkung von Möbeln sowie finale Pixelgrafik und Audio.

## Hauptfiguren und Routen – Entwurf für Version 0.1

Die Suchenden haben erkennbare Rollen und feste, wiederholbare Routen. Die Reihenfolgen und Haltezeiten folgen dieser Tabelle. Startkacheln und Türfelder wurden passend zum Grundriss konkretisiert; die vollständigen Kachelpfade werden im Spielcode auf den begehbaren Gängen berechnet.

| Figur | Vorgesehener Laufweg | Halt |
|---|---|---|
| RTE | Patrouilliert zwischen PI-Einführung und Ausgang auf dem Hauptgang. Wechselt bei Q1 oder Q3 in den Westgang und zurück. | 2 Sekunden an Kreuzungen, 4 Sekunden beim Ausgang |
| P&T | Ausgewählte Check-ins: Windows Client Team → Enterprise Mobile Services Team → Communication & Meetingroom Solutions Team → zurück. Besucht nicht alle Teams. | 5 Sekunden pro Check-in |
| BO | Besucht alle sieben Teams in der Reihenfolge der Teamliste oben und beginnt wieder beim Windows Client Team. | 4 Sekunden pro Team |
| PM | Besucht alle sieben Teams in umgekehrter Reihenfolge und beginnt wieder beim Communication & Meetingroom Solutions Team. | 4 Sekunden pro Team |
| PO (7 Figuren) | Je eine Figur mit Teamkürzel: WCL (Windows Client), WSW (Windows Software), WDPS (Workplace Device & Print Solutions), EMS (Enterprise Mobile Services), MAC (Mac Workplace), M365 und CMS (Communication & Meetingroom Solutions). Jede startet im eigenen Teamzimmer, patrouilliert im angrenzenden Gangbereich und kehrt durch die eigene Tür zurück. | 4 Sekunden an Team- und Gangstopps; 2,5 Sekunden im eigenen Raum |
| Scrum Master (4 Figuren) | Kontrollieren den unteren Bereich zwischen Mac Workplace, Q3, Communication & Meetingroom, M365 und Q2. Die vier starten an unterschiedlichen Gangfeldern und beginnen die Runde an versetzten Punkten. | 3 Sekunden an Türen und Kreuzungen |

Die Routen von BO, PM, allen sieben PO und allen vier Scrum Mastern starten zeitversetzt. Nur die PO betreten ein Teamzimmer: Sie beginnen und enden jeweils im eigenen Raum. Ihre Gangrouten sind nach den drei Querbereichen Q1, Q2 und Q3 aufgeteilt, damit nicht alle sieben dieselbe grosse Runde laufen. Beim Neustart werden Startpositionen und Zeitversätze zurückgesetzt. Der Nutzer hat die Spieldichte und das Ausweichen bei Blockaden in der Mehrrollenansicht im Browser bestätigt.

### Konkrete Start- und Türkacheln im Prototyp

Die Koordinaten sind nullbasiert. Teamstopps liegen auf der Gangseite direkt vor dem Türfeld. Die PO starten auf freien Kacheln im eigenen Teamzimmer und kehren auf dieselbe Kachel zurück; ihr automatisch berechneter Pfad darf nur den eigenen Raum sowie die Gänge und Türfelder nutzen. Die übrigen Suchenden bleiben auf Gängen und Ausgang.

| Rolle | Startkachel | Teamstopps / Quergänge | Startversatz | Halt |
|---|---:|---|---:|---:|
| RTE | (34, 38) | Q3 (34, 32) → Westgang (14, 32) → Q1 (34, 8) → Westgang (14, 8) → Ausgang (34, 2) → zurück | 1,5 s | 2 s an Kreuzungen, 4 s am Ausgang |
| P&T | (14, 8) | Windows Client (12, 8) → Enterprise Mobile Services (36, 20) → Communication & Meetingroom (36, 32) → zurück | 1,5 s | 5 s |
| BO | (14, 9) | Windows Client (12, 9) → Windows Software (36, 8) → Workplace Device (12, 18) → Enterprise Mobile Services (36, 20) → Mac Workplace (12, 29) → M365 (12, 37) → Communication & Meetingroom (36, 32) → zurück | 6 s | 4 s |
| PM | (28, 20) | Communication & Meetingroom (36, 32) → M365 (12, 37) → Mac Workplace (12, 29) → Enterprise Mobile Services (36, 20) → Workplace Device (12, 18) → Windows Software (36, 8) → Windows Client (12, 8) → zurück | 12 s | 4 s |
| PO · WCL | (10, 8), innen | Eigene Tür (12, 8) → Q1 West (14, 8) → Q1 Mitte-West (20, 8) → Q1 Mitte (24, 8) → zurück durch eigene Tür in Windows Client | 18 s | 4 s an Stopps, 2,5 s im Raum |
| PO · WSW | (38, 8), innen | Eigene Tür (36, 8) → Hauptgang (34, 8) → Q1 Mitte-Ost (28, 8) → Q1 Mitte (24, 8) → zurück durch eigene Tür in Windows Software | 20,5 s | 4 s an Stopps, 2,5 s im Raum |
| PO · WDPS | (10, 18), innen | Eigene Tür (12, 18) → Westgang (14, 18) → Q2 West (18, 20) → Q2 Mitte (24, 20) → zurück durch eigene Tür in Workplace Device | 23 s | 4 s an Stopps, 2,5 s im Raum |
| PO · EMS | (38, 20), innen | Eigene Tür (36, 20) → Hauptgang (34, 20) → Q2 Ost (28, 20) → Q2 Mitte (24, 20) → zurück durch eigene Tür in Enterprise Mobile Services | 25,5 s | 4 s an Stopps, 2,5 s im Raum |
| PO · MAC | (10, 29), innen | Eigene Tür (12, 29) → Westgang (14, 29) → Q3 West (18, 32) → Q3 Mitte (24, 32) → zurück durch eigene Tür in Mac Workplace | 28 s | 4 s an Stopps, 2,5 s im Raum |
| PO · M365 | (10, 37), innen | Eigene Tür (12, 37) → Westgang (14, 37) → (14, 35) → Q3-Westzugang (14, 33) → zurück durch eigene Tür in M365 | 30,5 s | 4 s an Stopps, 2,5 s im Raum |
| PO · CMS | (38, 32), innen | Eigene Tür (36, 32) → Hauptgang (34, 32) → Q3 Ost (28, 32) → Q3 Mitte (24, 32) → zurück durch eigene Tür in Communication & Meetingroom Solutions | 33 s | 4 s an Stopps, 2,5 s im Raum |
| Scrum Master 1 | (14, 30) | Mac Workplace → Q3 → Communication & Meetingroom → M365 → Q2 → zurück | 9 s | 3 s |
| Scrum Master 2 | (28, 8) | Q3 → Communication & Meetingroom → M365 → Q2 → Mac Workplace → zurück | 11,5 s | 3 s |
| Scrum Master 3 | (14, 37) | Communication & Meetingroom → M365 → Q2 → Mac Workplace → Q3 → zurück | 14 s | 3 s |
| Scrum Master 4 | (34, 20) | M365 → Q2 → Mac Workplace → Q3 → Communication & Meetingroom → zurück | 16,5 s | 3 s |

## Sicht und Entdeckung – Regeln für Version 0.1

- Hauptfiguren entdecken nur in Blickrichtung, nicht rundherum.
- Die vorgesehene Sichtweite beträgt ungefähr fünf Kacheln. Im Graybox-Piloten blockieren Wände, solide sichtblockierende Objekte und neutrale Personen die Sicht. Alle Türöffnungen sind offen und durchsichtig; geschlossene Türen gibt es im aktuellen Grundriss nicht.
- Direkt neben einer Hauptfigur wird die Spielfigur auch ausserhalb ihrer Blickrichtung entdeckt.
- Ein gelbes Ausrufezeichen erscheint sofort und wechselt nach 300 ms ununterbrochenem Sichtkontakt auf Rot.
- Bleibt die Spielfigur insgesamt 600 ms im Sichtbereich, gilt sie als entdeckt. Wird der Sichtkontakt unterbrochen, beginnt die Warnphase wieder bei Gelb.
- Neutrale Personen entdecken die Spielfigur nicht.

Diese Werte werden beim Implementieren und Testen feinjustiert.

## Timer, Dialog und Neustart

- Timer: 180 Sekunden. Er beginnt, sobald die Flucht aus der PI-Einführung startet.
- Bei Sieg wird der Timer gestoppt und der Ausgang als geschafft angezeigt; bei null Sekunden erscheint eine Ablaufmeldung mit Ja/Nein-Neustart.
- ESC öffnet während des laufenden Versuchs ein Pausenmenü und hält Timer sowie Figuren an. Ja startet den Versuch neu, Nein oder ESC setzt ihn fort.
- In den letzten 30 Sekunden ist die Timeranzeige rot; in den letzten 15 Sekunden blinkt sie rot.
- Bei Entdeckung halten Timer und sämtliche Figuren an. Nach Dialogbestätigung startet der Versuch im PI-Einführungsraum mit 180 Sekunden neu. Spieler, 37 neutrale Personen und 15 Suchende erhalten ihre ursprünglichen Positionen, Routenindizes, Blickrichtungen und Startpausen; Zielreservierungen, Umwege und Warnungen werden zurückgesetzt.
- Der erste Dialog jeder Rollenfamilie wird vollständig gezeigt; längere Texte werden seitenweise mit Enter, Leertaste oder Klick/Tippen im Spielfeld bestätigt. Wiederholungsdialoge zeigen den vollständigen Wiederholungstext und können mit derselben Eingabe übersprungen werden. Der externe Neustart-Button bestätigt während des Dialogs ebenfalls die nächste Seite. ESC und Pause überspringen den Dialog nicht.
- Die Erinnerung an abgeschlossene Erstgespräche bleibt über alle Versuchsneustarts der aktuellen Spielsitzung erhalten. Alle sieben PO teilen eine Dialogfamilie, zeigen aber ihr jeweiliges Teamkürzel; alle vier Scrum Master teilen ebenfalls eine Familie. Neuladen der Seite löscht die Erinnerung. Gehaltene Bestätigungstasten werden nicht mehrfach verarbeitet; zwischen Bestätigungen liegen mindestens 200 ms.

Timer, Sieg, Ablaufzustand, Pausenmenü und Warnanzeige sind implementiert und geprüft. Die Ablaufmeldung wurde im Browser mit verkürztem Entwicklertimer geprüft; ESC öffnet und schliesst das Pausenmenü im eingebetteten VSC-Browser und wurde vom Nutzer zusätzlich in Safari bestätigt. Der Produktivtimer bleibt bei 180 Sekunden.

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

Die Bewegungskollision und Sichtprüfung der Suchenden sind implementiert. Pflanzen, Tische, Sideboards, Drucker und Kaffeemaschinen blockieren Bewegung und Sicht. Abfalleimer blockieren Bewegung, nicht Sicht. Stühle, Leinwände, Whiteboards und Tischdetails blockieren weder Bewegung noch Sicht. Die Wirkung der Blocker wurde im Browser noch nicht vollständig manuell geprüft.

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

Neutrale Personen sind körperliche Hindernisse: Die Spielfigur und andere Personen können nicht durch sie hindurchgehen. Sie entdecken die Spielfigur nicht und lösen selbst keinen Alarm aus. Alle 37 Personen bewegen sich auf festen Routen innerhalb ihres Raums oder Gangs. Raumfiguren betreten keine Tür- oder Gangfelder; Gangfiguren bleiben auf Gangflächen. Die reproduzierbar erzeugten Routen reichen, wo Platz und Möbel es zulassen, bis zu vier Kacheln von der Startposition. Im Pausenraum hat jede der fünf Personen eine eigene, getrennte Route, damit sie nicht auf denselben Engstellen warten. Die Person in Meeting 2 umrundet den Tisch. Jeder Kachelschritt dauert 650 ms und wird von 700 ms Pause gefolgt. Türen, solide Möbel, andere Personen und die Spielfigur blockieren die Bewegung; während eines Schritts gelten Start- und reservierte Zielkachel als belegt. Wiederholte Blockaden führen zu einer dynamischen Umleitung innerhalb des Bereichs; anschliessend wird die ursprüngliche Route an einem erreichbaren Feld fortgesetzt. Automatisierte Routentests und visuelle Abnahme der bisherigen Bewegungsrouten sind erfolgreich; die Umleitung wurde im Browser durch den Nutzer bestätigt; die Möbel-Sichtblocker bleiben gezielt zu prüfen. Die aktuelle und reservierte Position jeder neutralen Person blockiert dynamisch die Sichtlinie aller Suchenden.

### Laufwegplanung für den Bewegungsprototyp

- **Team-, Meeting-, Pausen- und PI-Räume:** Jede Person erhält eine reproduzierbare Route innerhalb ihres Raums. Die fünf Pausenraumrouten sind voneinander getrennt. Meeting 2 behält eine Schleife um den Tisch.
- **Gänge und Quergänge:** Jede Person erhält eine reproduzierbare Route auf Gangflächen und bleibt von Türfeldern und Seitenräumen getrennt.

Die Bewegung ist bewusst langsam: 650 ms pro Kachelschritt und anschliessend 700 ms Pause. Routen reichen bis zu vier Kacheln von der Startposition, soweit Raum und Möbel das zulassen. Solide Möbel, andere Personen und die Spielfigur blockieren die nächsten Kacheln. Die Spielfigur prüft sowohl die aktuelle als auch die während einer Bewegung reservierte Personenkachel. Bei belegtem Ziel wartet die Person 500 ms und versucht denselben Routenschritt erneut.

Die ursprünglichen Bewegungsrouten wurden im Browser visuell abgenommen. Der RTE-Pilot ergänzt Route, Sichtlinie und dynamische Sichtblockierung durch neutrale Personen. Bei wiederholter Blockade finden Suchende und neutrale Personen einen Umweg innerhalb ihres Bereichs. Der Nutzer bestätigte die manuelle Prüfung der Umleitung bei gegenseitigem Blockieren; die gezielte Prüfung der Möbel-Sichtblocker steht noch aus.

## Neutrale Sprechblasen – Feature-Implementierung

Neutrale Personen können kurze, zufällig ausgewählte Sprüche sagen, wenn die Spielfigur in ihre Nähe kommt.

- Eine Sprechblase bleibt 1,7 Sekunden sichtbar; die Annäherungsdistanz beträgt höchstens zwei Kacheln im gleichen Raum beziehungsweise Gangbereich.
- In jedem Team-, Meeting- und Pausenraum spricht höchstens eine Person gleichzeitig; nach Ende ihrer Blase kann die nächste Person desselben Raums sprechen. In Gängen und PI-Einführung können mehrere Personen gleichzeitig sprechen. Jede erhält eine abgerundete Blase mit Rahmen und einer Spitze zur Person; nahe Textfelder werden nach Platzangebot versetzt. Keine globale Pause, mindestens 15 Sekunden zwischen Auslösungen derselben Person.
- Sprechblasen sind nicht modal: Sie halten den Timer nicht an und blockieren keine Bewegung.
- Jede neutrale Figur erhält zwei feste Sprüche aus dem folgenden Pool; bei Auslösung wird einer zufällig gewählt. Die Blase folgt der Figur innerhalb des sichtbaren Spielfelds, ohne die Zeitanzeige zu verdecken. Während der Pause ist sie ausgeblendet und ihre Laufzeit samt Cooldowns eingefroren. Bei Fang endet sie; Neustart setzt Auswahlzustand und Cooldowns zurück. Implementierung auf `feature/neutral-speech-bubbles`; Prüfung und manuelle Abnahme siehe Entwicklungsplan.

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

## Dialoge bei Entdeckung – implementierte Texte

**Offen:** Weitere Dialogvarianten für die Rollen ergänzen. Zusätzliche Texte und ihre Auswahlregeln sind noch zu entwerfen; aktuell besitzt jede Rollenfamilie einen Erst- und einen Wiederholungstext.

Die Dialogüberschrift zeigt den ausgeschriebenen Rollennamen: **Release Train Engineer**, **People & Transformation**, **Business Owner**, **Product Manager**, **Product Owner** (zusätzlich mit Teamkürzel) oder **Scrum Master**. Die kurzen Rollenmarkierungen an den Figuren bleiben bestehen.

Beim ersten Erwischtwerden erhält jede Rollenfamilie einen eigenen Einstiegsdialog. Die sieben POs zeigen zusätzlich ihr Teamkürzel; alle vier Figuren tragen die ausgeschriebene Bezeichnung „Scrum Master“. Bei späteren Versuchen folgt ein kurzer Running-Gag zum noch offenen Fluchtpunkt.

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

- Die tatsächliche Sichtwirkung der Möbel im Browser gezielt prüfen.
- Den genauen Platz der Beta-Feedback-Aktionen im Start- oder Pausemenü festlegen; die Meldung über GitHub-Issue-Formulare ist als Lösung vorgesehen.

Die Umsetzungsreihenfolge und der Status der Arbeiten stehen in [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md).
