# Escape PI Planning – Game Design

## Freigabe und Geräteprüfung

**Erledigt – iPhone-/Safari-Abnahme am 10.11.2026:** Der Nutzer bestätigt den erfolgreichen Test des aktuellen Stands. `feature/iphone-safari-testing` ist über [PR #15](https://github.com/fip22-dev/Escape-PI-Planning/pull/15) am 10.11.2026 nach `main` gemergt und abgeschlossen. Dieser Abschluss gilt für den bisherigen Spielstand. Die Team-Schlüssel-Erweiterung ist über [PR #16](https://github.com/fip22-dev/Escape-PI-Planning/pull/16) nach `main` übernommen; die vollständige Spielrunde am PC ist vom Nutzer am 10.11.2026 erfolgreich bestätigt. Die iPhone-Prüfung der Erweiterung einschliesslich Schliessen der Startanleitung durch Tippen in die Spielansicht ist vom Nutzer bestätigt.

Historische Prüfabschnitte weiter unten beschreiben frühere Zwischenstände. Dort offene reale Geräte-, Grafik- und Audio-Abnahmen sind mit der Nutzerbestätigung vom 10.11.2026 abgeschlossen; technische Grenzen früherer automatisierter Tests bleiben dokumentiert.

## Spielziel

Ein humorvolles 2D-Browserspiel in fester Draufsicht und eigener Retro-Pixeloptik. Die Spielfigur versucht, während des PI Plannings innerhalb des Zeitlimits den Ausgang zu erreichen. 15 Suchende können sie entdecken; neutrale Personen beleben die Etage, lösen aber allein keinen Alarm aus.

## Festgelegte Eckpunkte für Version 0.1

- Start im Raum **PI-Einführung**; der Ausgang liegt am nördlichen Ende des Hauptgangs.
- Steuerung mit **Pfeiltasten, WASD oder gleitendes Touch-Steuerkreuz**. Vier grosse Richtungsflächen erlauben Halten zum Laufen und gleitenden Richtungswechsel ohne Loslassen. Die gewünschte Richtung wird hervorgehoben. Ein kleiner 20 × 20-Pixel-Mittelbereich und direkte Achsenwechsel erleichtern das Gleiten. Eine gehaltene Kurve wird am ersten freien Feld übernommen; bis dahin bleibt die bisherige Richtung aktiv, sofern sie frei ist. Die Schrittzeit bleibt 105 ms; Mitte, Verlassen der Fläche und Loslassen stoppen weitere Schritte. **Pause / Weiter** pausiert oder setzt fort, **Neustart** startet den Versuch direkt neu. Bei Pointer-Cancel, Fokusverlust und Szenenneustart wird die Touch-Eingabe zurückgesetzt. Das Seitenlayout berücksichtigt Hoch- und Querformat.
- Vorgesehener Timer: **180 Sekunden**. Er startet, wenn die Spielfigur die Flucht beginnt.
- Wird die Spielfigur von einem der 15 Suchenden entdeckt, erscheint ein rollenspezifischer Dialog. Die sieben Product Owner werden dabei über ihr Teamkürzel unterschieden; Scrum Master wird ausgeschrieben. Danach startet der Versuch im PI-Einführungsraum neu.
- Wiederholungsdialoge können übersprungen werden; während eines Dialogs steht der Timer still.
- Die Karte enthält sieben benannte Teamzimmer, einen Pausenraum, fünf kleine Meeting-Räume, den PI-Einführungsraum und drei Quergänge.
- **37 neutrale Personen** verteilen sich über die gesamte Etage. Alle bewegen sich auf festen Routen innerhalb ihres jeweiligen Raums oder Gangs und blockieren einander sowie die Spielfigur. Neutrale Personen lösen selbst keinen Alarm aus. Für den RTE-Piloten blockieren sie dynamisch die Sicht.
- P&T bedeutet **People & Transformation**.
- Kamera und Spielwelt bleiben in fester Draufsicht; die Kamera folgt der Spielfigur.

## Team-Schlüssel als Voraussetzung für den Ausgang

**Erledigt – vollständige Spielrunde am PC:** Vom Nutzer am 10.11.2026 erfolgreich bestätigt. **Erledigt – iPhone-Abnahme:** Der Nutzer bestätigt am 10.11.2026, dass der veröffentlichte Schlüssel-/Kurzanleitungsstand auch auf dem iPhone gut funktioniert. **Erledigt – Tippfläche abgenommen:** Der Nutzer bestätigt auch die Umsetzung des Wegtippens als gut. Die private Demo ist aktualisiert und abgenommen. Der Branchabschluss samt Übernahme nach main ist über PR #16 erfolgt.

**Erledigt – Kurzanleitung beim Spielstart implementiert und vom Nutzer abgenommen:** Nach „Spiel starten“ erscheint die Kurzanleitung mit dem Titel „Entkomme dem PI Planning“: „Entkomme in 180 Sekunden und gehe den Suchenden aus dem Weg. Sammle dafür in jedem der sieben Teamzimmer einen Schlüssel – laufe einfach darüber. Hast du alle sieben Schlüssel, ist der Ausgang frei. Wirst du erwischt, musst du am PI Planning teilnehmen.“ Enter, Leertaste oder Tippen irgendwo in die Spielansicht bestätigt; die auslösende Menüeingabe bestätigt nicht gleichzeitig die Anleitung. Figuren und Timer stehen während der Einblendung still. Pause und Touch-Neustart bleiben währenddessen ohne Wirkung. Bestätigung löscht gehaltene Eingaben und verschiebt die Startfristen der Figuren um die Lesezeit. Der Timer startet weiterhin beim Verlassen des PI-Raums. Neuversuche wiederholen die Einblendung nicht; ein neuer Start über das Hauptmenü zeigt sie wieder. Die Regeln unter „So geht’s“ bleiben zusätzlich verfügbar.

**Erledigt – implementiert und vom Nutzer auf PC und iPhone abgenommen:** Jedes Teamzimmer liefert einen eigenen goldenen Pixelschlüssel. Aufnahme automatisch beim Betreten des Felds, ohne zusätzliche Taste. Bei jedem Start und Neuversuch wird pro Team ein zufälliges, vom Start erreichbares freies Bodenfeld innerhalb des eigenen Teamzimmers gewählt. Wände, Türen und sämtliche Möbelgrundflächen (auch passierbare Stühle) sind ausgeschlossen. Die Position jedes Schlüssels unterscheidet sich vom vorigen Versuch; Pause behält die Positionen. Schlüssel blockieren weder Bewegung noch Sicht.

Das HUD zeigt ausschliesslich „Schlüssel 0/7“ bis „Schlüssel 7/7“, ohne Teamnamen: 8-Pixel-Schrift mit dezentem Schatten, rechtsbündig mit acht logischen Pixeln Abstand zum oberen/rechten Rand. Ein eng anliegender dunkelgrüner Hintergrund (#24332b) mit vier Pixeln seitlichem und drei Pixeln vertikalem Innenabstand verbessert den Kontrast; die Position folgt auch in mobiler Breitbildansicht dem rechten Rand. Erst alle sieben unterschiedlichen Schlüssel erlauben das Betreten des Ausgangs und den Sieg. NPCs und Zielreservierungen öffnen den gesperrten Ausgang nicht; ihre bisherigen Routen bleiben bestehen. Bei Annäherung auf eine Kachel an den noch gesperrten Ausgang erscheint für höchstens vier Sekunden die Meldung „Netter Fluchtversuch! Ohne sieben Schlüssel gibt’s nur ein weiteres Refinement.“ Timer und Spiel laufen weiter; die Meldung blockiert keine Eingabe. Beim Weggehen verschwindet sie sofort, bereits mit Beginn des Schritts aus dem direkten Türbereich. Sie wiederholt sich erst nach Weggehen und erneutem Annähern. Pause hält ihre Anzeigefrist an; Sieg, Fang und Neustart blenden sie aus. Andere Türen öffnen weiterhin automatisch. Pause erhält den Fortschritt, jeder neue Versuch (auch nach Fangdialog oder Rückkehr ins Menü) setzt ihn zurück. Zeitlimit bleibt 180 Sekunden.

**So geht’s → Regeln** erklärt Schlüssel, automatisches Einsammeln, HUD, Ausgangssperre und Neustart. Die frühere Beschreibung einer bedingungslosen Flucht gilt für den historischen Stand. Prüfung und verbleibende Abnahme siehe Entwicklungsplan.

## Grundriss

Der aktuelle Graybox-Grundriss ist im Prototyp umgesetzt. Die offenen Raumränder wurden am 05.11.2026 durch Aussenwände geschlossen. Die Teamzimmer haben je einen zwei Kacheln breiten Türdurchgang; Nebenräume haben je einen Türdurchgang, Meeting 1 hat als Ausnahme zwei Eingänge. Kein Teamzimmer muss durchquert werden, um vom Start zum Ausgang zu gelangen. Mauerrahmen markieren die tatsächlichen Wandöffnungen mit automatisch öffnenden, graugrünen Türblättern; die Schwellen sind in Gangfarben gehalten. Die inneren Raumschwellen werden als normaler Boden gezeichnet.

Pausenraum, PI-Einführungsraum und Ausgang haben jeweils eine zwei Kacheln breite Öffnung. Die Teamzimmer-Türen sind ebenfalls zwei Kacheln breit, entlang der jeweiligen Seitenwand. Die übrigen Türen sind eine Kachel breit. Der Pausenraum-Eingang liegt bei Spalten 22–23 (nullbasierte Kartenkoordinaten), eine Kachel links von seiner vorherigen Position. Bei den Seitenräumen führt eine innere Raumschwelle zur begehbaren Wandöffnung und weiter zum Gang. Türblatt, automatische Öffnung und Sichtblockierung liegen auf der Wandöffnung. Die inneren Schwellenmarkierungen bleiben im Kartenmodell für bestehende Routen erhalten, werden jedoch als normaler Raumboden dargestellt. Raumflächen und Laufwege bleiben erhalten; es gibt keine zusätzliche zweite Tür. Der Browser-Spieltest ist vom Nutzer bestätigt.

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
- Raum- und Ausgangsbeschriftungen mit fetter 9-Pixel-Schrift und deckendem dunklem Hintergrund. Raumnamen stehen oberhalb der Raumfläche, bei M365 wegen des knappen Abstands unterhalb. Meeting 1–5 beginnen linksbündig am linken äusseren Wandrand; PI-Einführung steht auf der dunklen Fläche rechts neben dem Eingang und oberhalb des Raums. Der Steuerungshinweis steht ausschliesslich im Seitenfuss ausserhalb des Spielfelds. Die Kamera rundet auf ganze Pixel. Die logische Ansicht bleibt 320×240 Einheiten mit 16×16-Kacheln; auf dem Folgebranch wird mit 1280×960 Pixeln und vierfach aufgelösten Texttexturen gezeichnet. Die Platzierung ist vom Nutzer bestätigt, die neue Lesbarkeit auf Zielgeräten noch nicht manuell abgenommen.
- Sieben Teamzimmer, Pausenraum, fünf Meeting-Räume und PI-Einführungsraum.
- 37 neutrale Personen an den unten beschriebenen Stellen; alle bewegen sich auf festen, begrenzten Raum- oder Gangrouten.

Spielschleife implementiert: Der 180-Sekunden-Timer startet beim Verlassen des PI-Einführungsraums. Am Ausgang erscheint der Siegzustand; bei null Sekunden erscheint „Pech gehabt – Zeit abgelaufen“ mit einer Ja/Nein-Abfrage für den Neustart. ESC pausiert Timer und Figuren. Ja startet dort den Versuch neu; Nein setzt ihn fort. ESC setzt das pausierte Spiel fort. Der Eintrag Zurück zum Startmenü ist per Pfeiltasten/Enter und per Klick/Touch direkt auswählbar; er verwirft den Versuch ohne zusätzliche Bestätigung. Bei Zeitablauf startet Ja neu, Nein lässt den Ablaufbildschirm stehen. Die Auswahl geht per Pfeiltasten und Enter oder per Klick. Der Timer steht vor dem Fluchtstart auf 03:00; die letzten 30 Sekunden sind rot, die letzten 15 Sekunden blinken rot. **Geprüft:** 19 automatisierte Tests, Produktionsbuild sowie Browserprüfung von Pause, Auswahl, Neustart, Sieg und Ablaufmeldung mit verkürztem Entwicklertimer. Die frühere ESC-Rückkehrbestätigung wurde vom Nutzer geprüft; die neue direkte Menü-Rückkehr benötigt eine neue Nutzerabnahme.

**Erledigt:** Alle 15 Suchenden patrouillieren auf den festgelegten Routen. Jede prüft eine kardinale Sichtlinie bis fünf Kacheln; Wände, solide sichtblockierende Objekte und neutrale Personen unterbrechen die Sicht. Bei Sichtkontakt erscheint ein gelbes Ausrufezeichen, das nach 300 ms auf Rot wechselt; bleibt die Spielfigur insgesamt 600 ms sichtbar, zeigt die Meldung die entdeckende Rolle. Bei wiederholter Blockade berechnet jede Suchfigur einen freien Umweg; neutrale Personen tun dasselbe innerhalb ihres Bereichs. Anschliessend setzen sie die Route am nächsten erreichbaren Routenfeld fort. **Prüfung:** 23 automatisierte Tests prüfen alle Suchendenrouten, PO-Raumstarts und -Rückkehr, Warnstufen und Umwege um blockierte Felder. Der Nutzer bestätigte den Browser-Spieltest der Mehrrollenansicht, der PO-Rückkehr, der Warnstufe und des Ausweichens bei Blockaden.

**Erledigt und über PR #10 in `main` integriert:** Rollenspezifische Erst- und Wiederholungsdialoge mit stillstehendem Timer und reproduzierbarem Neustart. Automatisierte Prüfungen erfolgreich; der Nutzer hat den lokalen Browser-Spieltest am 07.11.2026 bestätigt. Einzelheiten und verbleibende Geräteprüfungen stehen im Entwicklungsplan.

**Erledigt:** Neutrale Sprechblasen sind implementiert und automatisiert im Browser geprüft; der Nutzer hat den früheren Stand bestätigt. Auf dem aktuellen Folgebranch gelten zwei Sekunden Laufzeit mit Nachführung am sprechenden NPC; eine neue Nutzerabnahme bleibt offen. **Noch offen:** Designentscheidung über nutzbare Deckungspositionen weiterer Möbel. Die Angleichung der finalen Pixelgrafik und Audio ist in Arbeit; Details stehen im Abschnitt Intro-Menü und Pixelstil.

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
- Die vorgesehene Sichtweite beträgt ungefähr fünf Kacheln. Im Graybox-Piloten blockieren Wände, solide sichtblockierende Objekte und neutrale Personen die Sicht. Die 16 Türen sind standardmässig geschlossen und blockieren die Sicht. Sie öffnen bei Belegung oder Reservierung durch Spieler oder NPCs und schliessen 250 ms nach der letzten Freigabe; geöffnete Türen sind durchsichtig.
- Direkt neben einer Hauptfigur wird die Spielfigur auch ausserhalb ihrer Blickrichtung entdeckt.
- Ein gelbes Ausrufezeichen erscheint sofort und wechselt nach 300 ms ununterbrochenem Sichtkontakt auf Rot.
- Bleibt die Spielfigur insgesamt 600 ms im Sichtbereich, gilt sie als entdeckt. Wird der Sichtkontakt unterbrochen, beginnt die Warnphase wieder bei Gelb.
- Neutrale Personen entdecken die Spielfigur nicht.

Diese Werte werden beim Implementieren und Testen feinjustiert.

## Timer, Dialog und Neustart

- Timer: 180 Sekunden. Er beginnt, sobald die Flucht aus der PI-Einführung startet.
- Bei Sieg wird der Timer gestoppt und der Ausgang als geschafft angezeigt; bei null Sekunden erscheint eine Ablaufmeldung mit Ja/Nein-Neustart.
- ESC öffnet während des laufenden Versuchs ein Pausenmenü und hält Timer sowie Figuren an. Ja startet den Versuch neu, Nein setzt ihn fort. Im Pausenfenster lassen sich Musik und Töne per Klick oder mit den Tasten **M** und **T** getrennt ein- und ausschalten; die Kürzel werden gut sichtbar am unteren Rand angezeigt. Mit **↑/↓** oder **W/S** zwischen Neustartfrage, **Zurück zum Startmenü** und Audio wechseln; **←/→** oder **A/D** wählen Ja/Nein beziehungsweise Musik/Töne. **Enter** führt die Auswahl aus. **Zurück zum Startmenü** führt direkt, ohne zweiten Bestätigungsdialog, ins Hauptmenü und verwirft den Versuch. Klick/Touch bleibt möglich; **ESC** oder **Pause/Weiter** setzt das Spiel fort.
- In den letzten 30 Sekunden ist die Timeranzeige rot; in den letzten 15 Sekunden blinkt sie rot.
- Bei Entdeckung halten Timer und sämtliche Figuren an. Nach Dialogbestätigung startet der Versuch im PI-Einführungsraum mit 180 Sekunden neu. Spieler, 37 neutrale Personen und 15 Suchende erhalten ihre ursprünglichen Positionen, Routenindizes, Blickrichtungen und Startpausen; Zielreservierungen, Umwege und Warnungen werden zurückgesetzt.
- Der erste Dialog jeder Rollenfamilie wird vollständig gezeigt; längere Texte werden seitenweise mit Enter, Leertaste oder Klick/Tippen im Spielfeld bestätigt. Wiederholungsdialoge zeigen den vollständigen Wiederholungstext und können mit derselben Eingabe übersprungen werden. Der externe Neustart-Button bestätigt während des Dialogs ebenfalls die nächste Seite. ESC und Pause überspringen den Dialog nicht.
- Die Erinnerung an abgeschlossene Erstgespräche bleibt über alle Versuchsneustarts der aktuellen Spielsitzung erhalten. Alle sieben PO teilen eine Dialogfamilie, zeigen aber ihr jeweiliges Teamkürzel; alle vier Scrum Master teilen ebenfalls eine Familie. Neuladen der Seite löscht die Erinnerung. Gehaltene Bestätigungstasten werden nicht mehrfach verarbeitet; zwischen Bestätigungen liegen mindestens 200 ms.

Timer, Sieg, Ablaufzustand, Pausenmenü und Warnanzeige sind implementiert und geprüft. Die Ablaufmeldung wurde im Browser mit verkürztem Entwicklertimer geprüft; das Öffnen und Fortsetzen per ESC wurden im eingebetteten VSC-Browser und in Safari bestätigt. Der damalige ESC-Weg mit Rückkehrbestätigung wurde vom Nutzer geprüft; der aktuelle Folgebranch ersetzt ihn durch einen direkt auswählbaren Startmenü-Eintrag und ESC zum Fortsetzen. Der Produktivtimer bleibt bei 180 Sekunden.

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

Die Bewegungskollision und Sichtprüfung der Suchenden sind implementiert. Pflanzen, Tische, Sideboards, Drucker und Kaffeemaschinen blockieren Bewegung und Sicht. Abfalleimer blockieren Bewegung, nicht Sicht. Stühle, Leinwände, Whiteboards und Tischdetails blockieren weder Bewegung noch Sicht. Die Sichtregeln aller neun Möbeltypen wurden gezielt automatisiert im Browser geprüft; Tischdeckung auf der Originalkarte und das Hervortreten sind mit Screenshots kontrolliert. Pflanzen, Sideboards und Drucker besitzen im aktuellen Layout keine begehbare Sichtachse innerhalb von fünf Kacheln; Kaffeemaschinen bieten nur Achsen ohne zulässigen Suchenden-Standort. Der Nutzer akzeptiert die aktuelle Platzierung vorerst; zusätzliche nutzbare Deckungspositionen sind zurückgestellt. Methodik und Ergebnisse: [FURNITURE_SIGHT_TEST.md](FURNITURE_SIGHT_TEST.md).

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

Neutrale Personen sind körperliche Hindernisse: Die Spielfigur und andere Personen können nicht durch sie hindurchgehen. Sie entdecken die Spielfigur nicht und lösen selbst keinen Alarm aus. Alle 37 Personen bewegen sich auf festen Routen innerhalb ihres Raums oder Gangs. Raumfiguren betreten keine Tür- oder Gangfelder; Gangfiguren bleiben auf Gangflächen. Die reproduzierbar erzeugten Routen reichen, wo Platz und Möbel es zulassen, bis zu vier Kacheln von der Startposition. Im Pausenraum hat jede der fünf Personen eine eigene, getrennte Route, damit sie nicht auf denselben Engstellen warten. Die Person in Meeting 2 umrundet den Tisch. Jeder Kachelschritt dauert 650 ms und wird von 700 ms Pause gefolgt. Solide Möbel, andere Personen und die Spielfigur blockieren die Bewegung; Türen öffnen für zulässige Durchgänge automatisch; während eines Schritts gelten Start- und reservierte Zielkachel als belegt. Wiederholte Blockaden führen zu einer dynamischen Umleitung innerhalb des Bereichs; anschliessend wird die ursprüngliche Route an einem erreichbaren Feld fortgesetzt. Automatisierte Routentests und visuelle Abnahme der bisherigen Bewegungsrouten sind erfolgreich; die Umleitung wurde im Browser durch den Nutzer bestätigt; die Möbel-Sichtprüfung ist abgeschlossen; nutzbare Deckungspositionen weiterer Möbel bleiben offen. Die aktuelle und reservierte Position jeder neutralen Person blockiert dynamisch die Sichtlinie aller Suchenden.

### Laufwegplanung für den Bewegungsprototyp

- **Team-, Meeting-, Pausen- und PI-Räume:** Jede Person erhält eine reproduzierbare Route innerhalb ihres Raums. Die fünf Pausenraumrouten sind voneinander getrennt. Meeting 2 behält eine Schleife um den Tisch.
- **Gänge und Quergänge:** Jede Person erhält eine reproduzierbare Route auf Gangflächen und bleibt von Türfeldern und Seitenräumen getrennt.

Die Bewegung ist bewusst langsam: 650 ms pro Kachelschritt und anschliessend 700 ms Pause. Routen reichen bis zu vier Kacheln von der Startposition, soweit Raum und Möbel das zulassen. Solide Möbel, andere Personen und die Spielfigur blockieren die nächsten Kacheln. Die Spielfigur prüft sowohl die aktuelle als auch die während einer Bewegung reservierte Personenkachel. Bei belegtem Ziel wartet die Person 500 ms und versucht denselben Routenschritt erneut.

Die ursprünglichen Bewegungsrouten wurden im Browser visuell abgenommen. Der RTE-Pilot ergänzt Route, Sichtlinie und dynamische Sichtblockierung durch neutrale Personen. Bei wiederholter Blockade finden Suchende und neutrale Personen einen Umweg innerhalb ihres Bereichs. Der Nutzer bestätigte die manuelle Prüfung der Umleitung bei gegenseitigem Blockieren; die Möbel-Sichtprüfung ist abgeschlossen; Platzierungsgrenzen stehen im Möbel-Prüfbericht.

## Neutrale Sprechblasen – Feature-Implementierung

Neutrale Personen können kurze, zufällig ausgewählte Sprüche sagen, wenn die Spielfigur in ihre Nähe kommt.

- Eine Sprechblase bleibt zwei Sekunden sichtbar. Sichtbare NPCs in Meeting 1–5 benötigen keine Nähe oder Anwesenheit des Spielers im Raum; bei anderen NPCs gelten höchstens zwei Kacheln Entfernung im gleichen Bereich.
- In jedem Team-, Meeting- und Pausenraum spricht höchstens eine Person gleichzeitig; nach Ende ihrer Blase kann die nächste Person desselben Raums sprechen. Es gibt insgesamt höchstens zwei aktive Blasen gleichzeitig, auch in Gängen und PI-Einführung. Wartende NPCs erhalten ihren Cooldown erst beim tatsächlichen Sprechen. Jede erhält eine abgerundete Blase mit Rahmen und einer Spitze zum aktuellen Sprecher; nahe Textfelder erhalten bei ihrer Entstehung einen möglichst überlappungsfreien Versatz relativ zum Sprecher. Keine globale Pause, mindestens 15 Sekunden zwischen Auslösungen derselben Person.
- Sprechblasen sind nicht modal: Sie halten den Timer nicht an und blockieren keine Bewegung.
- Jede neutrale Figur erhält zwei feste Sprüche aus dem folgenden Pool; bei Auslösung wird einer zufällig gewählt. Der Anker wird bei jedem Spielupdate aus der interpolierten Sprite-Position des sprechenden NPCs ermittelt. Blasenkörper und Spitze folgen ihm; Nähe zur Spielfigur ist nur Auslöser und beeinflusst anschliessend nicht die Position. Blasenkörper, Text und Spitze werden über die Weltkamera gezeichnet. Ihr relativer Versatz zum NPC wird einmal gewählt und bleibt erhalten; die Kamera und die Spielerposition richten die Blase nicht neu aus. Am Bildschirmrand werden Blasen natürlich abgeschnitten, statt dem Spieler zu folgen. Verlässt der Sprecher den Kamerabereich, wird seine Blase ausgeblendet. Die Bewegung erneuert weder Text noch Ablaufzeit oder Cooldown. Während der Pause ist sie ausgeblendet und ihre Laufzeit samt Cooldowns eingefroren. Bei Fang endet sie; Neustart setzt Auswahlzustand und Cooldowns zurück. Implementierung auf `feature/neutral-speech-bubbles`; Prüfung und manuelle Abnahme siehe Entwicklungsplan.

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

## Intro-Menü und Pixelstil – in Arbeit

**Erledigt – Nutzerabnahme am 10.11.2026:** Das Intro-Menü und die dazu passende Pixelgrafik sowie Audio wurden über PR #13 in `main` integriert. Die erste Version startet vor dem ersten Spielversuch mit Titel „Escape PI Planning“ und dem Untertitel „Schaffst du es, dich vor dem PI Planning zu drücken, ohne erwischt zu werden?“ im freien dunklen Streifen oberhalb der Büro-Pixelszene. Titel und Untertitel verdecken die Illustration nicht. Auswahl: **Spiel starten**, **So geht's**, **Einstellungen** und **Infos & Credits**. Spielregeln und Patrouillen beginnen erst nach Spielstart. Der Nutzer hat den aktuellen Menü-/Audio-Funktionsschnitt manuell im Browser geprüft. Auf `feature/visuals-audio-polish` sind Möbelpalette und Rollenaccessoires umgesetzt; manuelle Grafikabnahme und reale Geräte-Hörprobe bleiben offen.

| Inhalt | Vorgeschlagenes Verhalten |
|---|---|
| Titel und kurzes Intro | Kleine Büro-Pixelszene, Titel Escape PI Planning und der Untertitel „Schaffst du es, dich vor dem PI Planning zu drücken, ohne erwischt zu werden?“. Keine lange Pflichtsequenz. |
| Spiel starten | Deutliche Hauptaktion. Beginnt einen frischen Versuch im PI-Raum; der 180-Sekunden-Timer startet weiterhin erst beim Verlassen des Raums. |
| So geht's | Team-Schlüssel, automatische Aufnahme, HUD und Ausgangssperre sind erklärt. grössere, scrollbar angezeigte Erklärung, zuerst im fett und gold hervorgehobenen Unterkapitel **Regeln** (Ziel, 180 Sekunden ab Verlassen des PI-Raums, Steuerung, Pause und Tarnung), danach **Rollen** mit kurzen humorvollen Beschreibungen von RTE, P&T, BO, PM, PO und Scrum Master. Scrollen per Mausrad, Wischgeste oder Pfeiltasten/WASD. Zurück führt ins Menü. |
| Einstellungen | **Musik** und **Töne** getrennt schalten. Töne umfassen Spielgeräusche wie Schritte, Warnung, Fang und Sieg; die Menünavigation bleibt stumm. Beide Einstellungen lokal speichern und im Pausenfenster direkt erreichbar machen. |
| Infos / Credits | Kurze Projektinfo rund um den Versuch, sich vor dem PI Planning zu drücken, Urheber-/Lizenzangaben und kompakte Versionskennung für Fehlermeldungen. |
| Beta-Feedback | Fehler melden und Idee vorschlagen als sekundäre Links, sobald die GitHub-Issue-Formulare aus Schritt 9 bereitstehen. |

**Technische Umsetzung:** Ein Phaser-Menü läuft als erste Szene; die Graybox wird erst nach Spielstart aktiviert. Die Menüpunkte reagieren auf Maus/Touch und Tastatur: Pfeiltasten oder WASD bewegen die Auswahl, Enter oder Leertaste aktiviert sie, Escape führt zurück. Die Menünavigation selbst erzeugt keine Tastaturtöne. Der grössere Anleitungstext scrollt mit Mausrad, Wischgeste oder Pfeiltasten/WASD; **Regeln** und **Rollen** sind fett und gold hervorgehoben. In den Einstellungen schalten zwei gespeicherte Optionen Musik sowie Töne (Spielgeräusche). Dieselben beiden Schalter stehen im Pausenfenster bereit; sie reagieren auf Klick sowie **M** (Musik) und **T** (Töne). Während des Menüs laufen weder Patrouillen noch Sprechblasen oder Spielzeit; Spielsteuerungen sind ausgeblendet. Audio wird erst nach einer Nutzeraktion aktiviert und blockiert die Menübedienung nicht. Für die direkte Rückkehr über den ausgewählten Startmenü-Eintrag wird der laufende Versuch verworfen und die Eingabe bereinigt; der Szenenwechsel wird nach der aktuellen Eingabe verarbeitet. Ein gewöhnlicher Versuchsneustart bleibt direkt im Spiel. Die Gesprächserinnerung bleibt gemäss bisheriger Regel bis zum Neuladen der Seite erhalten.

Vorerst sind keine Spielstände, Highscores, Schwierigkeitsgrade oder zusätzliche Anmeldung vorgesehen. Tastatur, Touch, sichtbare Auswahl, lesbare Hoch-/Querformate und verlässliche Rückkehr aus Untermenüs gehören zur Prüfung. Anordnung: Büro-Pixelszene und Titel oben, darunter der Introtext. Spiel starten als Hauptaktion; anschliessend So geht's und Einstellungen. Infos & Credits kleiner darunter. Feedback-Links später ergänzen. Konkrete Ausgestaltung und genaue Platzierung der Feedback-Links bleiben offen.

**Teilweise umgesetzt:** Eine eigene Büro-Pixelszene, Kacheltexturen, Spielfigur/neutralen Figuren, generierte Büro-Jazz-Musik und synthetische Spielgeräusche sind in `main` integriert. Der Nutzer hat die manuelle Browserprüfung des Funktionsschnitts bestätigt. Auf `feature/visuals-audio-polish` nutzen alle neun Raumobjekttypen die warme Palette mit einheitlichen Schatten und ergänzten Gerätedetails. Suchende tragen zusätzlich zum Rollenschild ein Lanyard und rollenbezogene Accessoires: Klemmbrett, Tasse, Brille/Aktentasche, Roadmap, Backlogkarten oder Taschenuhr. Manuelle Grafikabnahme und Lautstärke-/Geräteprüfung bleiben offen.
## Beta-Feedback über GitHub Issues

Für Beta-Tests soll das Spiel zwei leicht auffindbare Möglichkeiten anbieten: **Fehler melden** und **Idee vorschlagen**. Als erste Lösung öffnen diese Aktionen passende GitHub-Issue-Formulare in einem neuen Browser-Tab. Das Spiel übermittelt keine Berichte automatisch; Tester prüfen und senden den ausgefüllten Bericht selbst ab. Die Umsetzung und nötigen Issue-Formulare sind in [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) beschrieben.

## Dialoge bei Entdeckung – implementierte Texte

**In Arbeit – Textabstimmung:** Zwei zusätzliche Wiederholungstexte pro Rollenfamilie sind unten vorgeschlagen. Sie sind noch nicht freigegeben oder implementiert; aktuell besitzt jede Rollenfamilie einen Erst- und einen Wiederholungstext.

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

### Zusätzliche Wiederholungsdialoge – Entwurf zur Abstimmung

**In Arbeit – nur Textentwurf:** Erst die Texte mit dem Nutzer abstimmen, anschliessend implementieren. Die folgende Auswahl ist noch nicht Teil des Spiels oder der Demo.

| Rolle | Neue Variante A | Neue Variante B |
|---|---|---|
| RTE | Dein Fluchtweg ist gut geplant. Leider fehlt noch das Alignment mit allen, die dich aufhalten. | Du willst den Zug verlassen? Das besprechen wir zuerst im nächsten ART Sync. |
| P&T | Bevor du gehst: Auf einer Skala von eins bis zehn, wie sehr brauchst du diese Pause? | Ich höre einen starken Wunsch nach Freiheit. Lass uns dazu einen Workshop machen. |
| BO | Deine Flucht hat Potenzial. Wie hoch sind die Einsparungen pro vermiedenem Meeting? | Ich unterstütze deinen Abgang. Sobald wir den Nutzen im Steering vorgestellt haben. |
| PM | Dein Wunsch nach Freiheit ist erfasst. Im nächsten PI priorisieren wir ihn gegen die anderen Wünsche. | Wir liefern den Ausgang inkrementell. Heute gibt es schon mal die Türklinke. |
| PO | Du wolltest nur kurz raus? Klingt klein. Lass uns trotzdem erst die Story schätzen. | Dein Fluchtticket ist fast fertig. Es fehlt nur noch die Abnahme durch alle Stakeholder. |
| Scrum Master | Du läufst im Kreis. Perfekt, dann sind wir schon mitten im nächsten Sprint. | Ich halte dich nur kurz auf. Wir müssen noch klären, warum unsere kurzen Meetings so lange dauern. |

**Offen – Auswahlregel zur Abstimmung:** Erster Dialog je Rollenfamilie unverändert; bei späteren Begegnungen bisherigen Wiederholungstext, Variante A und Variante B reihum anzeigen. Kein unmittelbar gleicher Wiederholungstext derselben Rollenfamilie. Die sieben PO-Teams teilen einen Verlauf; die vier Scrum Master ebenfalls. Verlauf nur während der Spielsitzung, keine dauerhafte Speicherung. Seitenanzeige, Überspringen und Timerstillstand bleiben erhalten. Umsetzung und Tests erst nach Textfreigabe.

## Grafik und Audio – Stand und Entwurf

- Eigene Pixelgrafiken auf Basis von 16×16-Kacheln und einer reduzierten Farbpalette.
- Spielfigur, Entdecker und neutrale Personen erhalten klare Silhouetten. Die Entdecker tragen zusätzlich ein dauerhaft sichtbares Rollensymbol oder Namensschild; ihre Erkennbarkeit hängt nicht allein von Farbe ab.
- Neutrale Personen sind zurückhaltender gestaltet und erhalten kein Entdecker-Symbol.
- Hintergrundmusik: dezenter Büro-Jazz mit ruhigem Akkordbett, sanftem Walking Bass und sparsamer Melodie. Die generierte Fassung ist als ungefähr 26-sekündige Schleife angelegt; die abschliessende Lautstärke-/Geräteprüfung bleibt offen.
- Implementierte Spielgeräusche: Schritte, Start, Warnung, Fang, Sieg, Zeitablauf und Sprechblasen. Musik und Spielgeräusche lassen sich getrennt schalten; ein eigener Türton ist nicht implementiert.
- Möbel sind auf dem Folgebranch als eigene Pixelzeichnung mit warmer Holz-/Papierpalette, grünen Polstern, Schatten und Gerätedetails umgesetzt. Objektregeln und Platzierung stehen im Abschnitt Raumobjekte; eine manuelle Abnahme der überarbeiteten Darstellung bleibt offen.
- Pokémon-Figuren, Grafiken, Musik und Markenzeichen werden nicht übernommen. Inhalte werden selbst erstellt oder passend lizenziert.

## Noch offene Designentscheidungen

- Vorerst zurückgestellt: Entscheiden, ob Pflanzen, Sideboards, Drucker und Kaffeemaschinen so umgestellt werden sollen, dass sie im aktuellen Sichtmodell tatsächlich Deckung gegen Suchende bieten. Die Sichtregeln sind geprüft; die vorhandene Platzierung schränkt ihren Nutzen ein.
- Den genauen Platz der Beta-Feedback-Aktionen im Start- oder Pausemenü festlegen; die Meldung über GitHub-Issue-Formulare ist als Lösung vorgesehen.

Die Umsetzungsreihenfolge und der Status der Arbeiten stehen in [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md).

## Geräteabnahme – 08.11.2026

**Erledigt:** Der Nutzer bestätigt alle vorgesehenen iPhone-/Safari-Tests der aktualisierten privaten Online-Demo, einschliesslich Hoch-/Querformat, Touch-Steuerung, Fokusverlust, Pause/Neustart, Fangdialogen, Sprechblasen, Raumbegrenzung und vollständigem Spielversuch. Der separat fehlgeschlagene automatisierte Möbel-Kontrolltest wurde auf die 200-ms-Bestätigungssperre zurückgeführt und im Test korrigiert. Die Spielregeln und die Sichtlogik bleiben unverändert; Abschlussprüfung siehe Entwicklungsplan.

## Prüfung des Grafik-Feinschliffs – 09.11.2026

**Teilweise erledigt:** Möbel-/Rollengalerie und Desktop-/Mobile-Screenshots visuell kontrolliert; 41 Funktionstests, 30 Browserfälle sowie Build erfolgreich. Der Menü-Steuerungshinweis steht unterhalb des Auswahlrahmens; die drei betroffenen Browserfälle bestanden danach erneut. Die technische Audioprüfung bestätigt getrennte Schalter, gespeicherte Einstellungen, eine einzelne ungefähr 26-sekündige Musikschleife und Musik-Samples unter dem Clipping-Grenzwert. Das ersetzt keine Lautstärke-/Klangabnahme auf realen Geräten. Manuelle Nutzerabnahme der neuen Grafik und reale Geräte-Hörprobe bleiben offen; die danach gemeldete Schriftunschärfe wird mit der unten beschriebenen höher aufgelösten Darstellung korrigiert; die manuelle Geräteabnahme bleibt offen.

## Darstellung und Schrittklang – Korrektur vom 09.11.2026

**Teilweise erledigt:** Die logische Ansicht bleibt 320×240 Einheiten mit 16×16-Kacheln. Der Renderer zeichnet 1280×960 Pixel, mit Kamera-Zoom 4 und vierfach aufgelösten Texttexturen. Eine feste UI-Kamera trennt HUD und Dialoge von der folgenden Weltkamera; NPC-Sprechblasen gehören zur Weltkamera. Maus-/Touch-Koordinaten der Anleitung werden in Kamerakoordinaten umgerechnet. CSS verwendet normale Bildskalierung statt pixelated-Vergrösserung eines 320×240-Rasters; der Pixelstil der ganzzahlig gezeichneten Welt bleibt bestehen. Die Spielengine übernimmt die Canvas-Zentrierung allein, damit keine zusätzlichen CSS-Verschiebungen entstehen. In der Normalansicht beträgt die höchste Desktopbreite für Menü und Spiel 960 CSS-Pixel; in Vollbild/Grossansicht entfällt diese Begrenzung; mobile Hoch-/Querformate bleiben erhalten. Dies verbessert Schärfe und Buchstabenformen, erzeugt aber keine zusätzlichen Details in den 16×16-Objekten. Grössere interne Auflösung beansprucht mehr Grafikleistung und muss auf realen Zielgeräten abgenommen werden.

Menü-Untertext und Hinweise sind leicht vergrössert; die aktive Menüzeile skaliert die Buchstaben nicht mehr unterschiedlich. Rollenschilder verwenden 7 statt 6 logische Pixel. Pflanzen erhalten voneinander getrennte grüne Blattgruppen mit dunkler Kontur, hellen Blattspitzen und Terrakotta-Topfrand; der diffuse rechteckige Objektschatten wird durch einen schmalen Bodenschatten ersetzt. Objektregeln und Platzierung bleiben erhalten.

Der Bewegungston verwendet nun eine weiche Sinuswelle von 120 nach 80 Hz über 55 ms. Seine maximale Gain-Einstellung beträgt 0,012 statt 0,07 (nominell rund 15 dB weniger); andere Effekte behalten ihren Pegel. Die bestehende Einstellung Töne schaltet weiterhin alle Spielgeräusche gemeinsam. Die Nutzer-Hörprobe entscheidet über die subjektiv passende Lautstärke.

**Erledigt – Automatisierte Prüfung:** 41 Funktionstests, Produktionsbuild und Diff-Prüfung erfolgreich; alle 30 Browserfälle durch Gesamtlauf und gezielten Nachlauf abgedeckt. Offline gerenderte Schritte bleiben unter Amplitude 0,013 und unter einem Viertel des Warnsignals. Desktop-, Hoch-/Querformat, Kameraausschnitt, Zentrierung, Menü/Audio per Maus und Touch sowie Anleitungsscrollen geprüft. Menü-/Spiel-/Pflanzenscreenshots visuell kontrolliert. **Offen:** subjektive Nutzerabnahme und reale Geräteperformance/Hörprobe. Prüfverlauf inklusive Testuhr-Korrektur im Entwicklungsplan.

## Türverhalten – Feature-Stand vom 09.11.2026

**Teilweise erledigt – Nutzerabnahme offen:** Benachbarte Tür-/Ausgangskacheln bilden einen gemeinsamen Durchgang. Sieben Teamtüren, Pausenraum, sechs Meeting-Eingänge, PI-Einführung und Ausgang ergeben 16 Türen mit 26 Kacheln. Zweikachelbreite Türen öffnen gemeinsam. Geschlossene Blätter sind graugrüne Paneele mit dunklem Mauerrahmen, heller Oberkante, Schattenkante und dezentem Griff; am Ausgang bleibt eine zurückhaltende Grünkennung. Geöffnet stehen die Blätter am Rand. Die Türschwellen verwenden Gangfarben statt gelber Felder. Es gibt keine manuelle Öffnungstaste. Seit der Schlüssel-Erweiterung bleibt der Ausgang bis zum siebten Schlüssel gesperrt. Vor einer Passage öffnet die reservierte Zielkachel die Tür; währenddessen halten aktuelle und reservierte Kacheln aller Figuren sie offen. Erst wenn keine Figur mehr zur Passage gehört, läuft die 250-ms-Schliessfrist. Neue Reservierungen brechen das Schliessen ab. Pause friert die Frist ein; Szenenneustart erzeugt den Ausgangszustand neu.

Die Sichtprüfung berücksichtigt jede geschlossene Türkachel zusätzlich zu Wänden, Möbeln und Personen. Beim Schliessen wird eine unterbrochene Sichtlinie samt Warnfrist zurückgesetzt. Türöffnung und Entdeckung werden in derselben Aktualisierung in dieser Reihenfolge verarbeitet. Bestehende Patrouillen und Bewegungsbereiche bleiben unverändert; neutrale Raumfiguren beginnen nicht neu, andere Räume zu besuchen. Isolierte Möbeltests ohne Türzustände prüfen weiterhin die reine Möbelgeometrie; die Türtests prüfen den zusätzlichen dynamischen Sichtschutz.

**Erledigt – Automatisierte Prüfung:** 44 Funktionstests und 39 Browserfälle in Chromium, Firefox und mobilem Chromium sowie Produktionsbuild und Diff-Prüfung erfolgreich. Geprüft sind feste Blasenpositionen trotz Sprecher-/Spieler-/Kamerabewegung, 2000-ms-Dauer, Pausenfristen, echte Spieler-/PO-Türpassagen, geschlossene Sichtlinien, Warnungsrücksetzung, Neustart sowie direkte Rückkehr zum Hauptmenü per Tastatur/Maus/Touch. Tür- und Menü-Screenshots visuell kontrolliert. **Offen:** neue manuelle Nutzerabnahme und echte iPhone-/Safari-Prüfung.

## Türplatzierung in den Wandöffnungen – 09.11.2026

**Erledigt – Umsetzung und automatisierte Prüfung:** Alle 14 Seitenraum-Türen sind von der inneren Raumschwelle in den angrenzenden Wanddurchbruch versetzt. Linke Teams nutzen Spalte 12, rechte Teams Spalte 36; Pausenraum Zeile 6; Meeting 1 Zeilen 12 und 18; Meeting 2/3 Zeile 22; Meeting 4/5 Zeile 34 (nullbasiert). Die PI-Tür liegt bereits auf ihrer Wandlinie bei (34–35, 39), der Ausgang weiterhin am Spielziel (33–34, 2). Alle 16 Türgruppen und 26 Türkacheln bleiben erhalten. Bodenzeichnung, Türblätter, Reservierungsprüfung und Sichtschutz verwenden dieselbe tatsächliche Türposition. Kartentopologie, Möbel und Patrouillen bleiben unverändert. 45 Funktionstests, neun gezielte Browserfälle in Chromium, Firefox und mobilem Chromium sowie Produktionsbuild und Diff-Prüfung erfolgreich; Screenshots der Wandöffnungen kontrolliert. **Offen:** reale Geräteabnahme der Platzierung; die visuelle Nutzerabnahme ist bestätigt.

## Vollbild und angeglichene Türen – 09.11.2026

**Erledigt – Umsetzung und automatisierte Prüfung:** Ein HTML-Ansichtsschalter bleibt im Startmenü und im Spiel sichtbar. Klick/Touch und F schalten die gesamte Spielseite mit ihren Bedienelementen in die native Fullscreen API; Enter/Leertaste auf dem fokussierten Schalter aktiviert nur die Ansicht und nicht gleichzeitig einen Menüpunkt. Der Aufruf erfolgt ausschliesslich nach Nutzeraktion. Wenn Vollbild nicht verfügbar oder abgelehnt ist, wird stattdessen eine feste, bildschirmfüllende Grossansicht innerhalb der Seite verwendet und benannt. Diese kann Browserleisten nicht ausblenden. Keine Tastatur- oder Orientierungssperre.

Esc verlässt zunächst Vollbild/Grossansicht. Der Spiel-/Pausenzustand bleibt dabei erhalten; ein nachgelagertes Escape-Ereignis des Browsers wird kurz abgefangen. Der Ansichtsschalter kann den Modus ebenfalls verlassen. Änderungen bereinigen gehaltene Eingaben und aktualisieren die Canvas-Koordinaten. Die 320×240-logische Ansicht, 1280×960-Zeichenauflösung und das 4:3-Seitenverhältnis bleiben erhalten. Touch-Geräte behalten die Bedienleiste (im kurzen Querformat rechts), Maus-/Tastaturgeräte nutzen den freiwerdenden Platz ohne Touch-Leiste. Der äussere Seitenkopf und Fuss werden in der grossen Ansicht ausgeblendet.

Türgrafik: dunkle Rahmen aus der Wandpalette, gedeckte graugrüne Paneele, kleine Papier-/Metallgriffe, Kantenlicht und Schatten. Schwellen passen zum Gangboden. Die geänderte Darstellung betrifft geschlossene und offene Blätter beider Ausrichtungen; Türpositionen und Sicht-/Bewegungsregeln bleiben erhalten.

45 Funktionstests, 15 gezielte Browserfälle und Build erfolgreich. Native Vollbildwechsel in Chromium, Firefox und mobilem Chromium tatsächlich geprüft; nicht verfügbare beziehungsweise verweigerte API zusätzlich kontrolliert simuliert. Getestet: Schalter, F, fokussierter Schalter per Enter, Esc, Bewegung, Erhalt des Pausenzustands, Rückkehr zur zentrierten Ansicht, mobiler Hoch-/Querformatmodus und Touch-Pause. Screenshots visuell kontrolliert. **Offen:** reale iPhone-/Safari-Abnahme; die visuelle Nutzerabnahme ist bestätigt. API-Verfügbarkeit ist browserabhängig; technische Referenz: [MDN requestFullscreen](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen).

**Erledigt – Prüfung zur Mergefreigabe:** Der vollständige aktuelle Stand besteht 45 Funktionstests und alle 51 Browserfälle (Chromium, Firefox, mobiles Chromium) sowie Produktionsbuild und Diff-Prüfung. Visuelle Nutzerabnahme und Mergefreigabe sind erteilt. Die reale iPhone-/Safari-Abnahme bleibt dem separaten Testbranch vorbehalten.

## Abgeschlossene Geräte-Testdemo

Der Testbranch startete von main a199290 (PR #14). Der Nutzer hat den aktuellen iPhone-/Safari-Stand am 10.11.2026 erfolgreich abgenommen und den Merge des gesamten Branchs nach main beauftragt. Mobile Grossansicht, Schutz gegen Textauswahl, NPC-gebundene Sprechblasen mit höchstens zwei gleichzeitig sowie gleitendes Steuerkreuz und vorgemerkte Kurven gehören zum abgenommenen Stand. Die bestehende private Hosting-Zuordnung und sichtbare Basiskennung bleiben erhalten; die Kennung bezeichnet die ursprüngliche Spielbasis. Der damalige Geräteabschluss eröffnete keinen neuen Branch. Geräteprotokoll und geprüfte Quellzuordnung: IPHONE_SAFARI_TEST_PLAN.md.


## Mobile Rotation der Spieloberfläche

Die mobile Grossansicht verwendet ein virtuelles Querformat: Im Hochformat wird die gesamte Bühne einschliesslich HTML-Tasten im Uhrzeigersinn gedreht. Phaser skaliert und zentriert anhand der ungedrehten lokalen Bühne; Canvas-Eingaben werden vor Kamera-/Objekt-Treffertests zurückgerechnet. Dadurch bleiben Menüauswahl, Anleitungsscrollen, Pause und Dialoge bedienbar. Bei echter Querformatlage wird nur die CSS-Drehung aufgehoben, ohne Szene oder Versuch neu zu starten. Physische Ausrichtung, Browser-Vollbild und CSS-Grossansicht sind getrennt. Explizites Verkleinern im Querformat darf durch eine Änderung der Browserleistenhöhe nicht rückgängig gemacht werden. Sichtbereichänderungen aktualisieren das Layout und löschen gehaltene Eingaben.


Grossansicht wird in beiden Ausrichtungen ausschliesslich mit dem Ansichtsschalter aktiviert. Das Drehen des Geräts passt nur eine bereits gewählte Grossansicht an. So vergrössert der erste Tipp auch bei einem Start im Querformat; der nächste Tipp verkleinert.


## Mobile Breitbild-Bühne und Eingabesicherheit

In mobiler Grossansicht füllt der Canvas den sichtbaren Viewport in beiden Achsen. Die interne Renderhöhe bleibt 960 Pixel (240 logische Einheiten); die Breite folgt dem Bühnen-Seitenverhältnis. Die Weltkamera zeigt dadurch seitlich mehr Karte. Die Interface-Kamera übernimmt die neue Breite, zentriert Dialoge und belässt Timer und Welt-Sprechblasen an ihren vorgesehenen Ankern. Menüauswahl und Anleitungswischen werden weiterhin über Kamera-Koordinaten getroffen. Der Bürohintergrund wird seitlich erweitert, das Referenzlayout bleibt unverzerrt. Bei Rückkehr zur normalen Ansicht wird die Renderbreite auf 1280 Pixel zurückgesetzt. Regeln, Wege, Sichtweiten und Zeitfristen ändern sich nicht.

Die ganze HTML-Spieloberfläche einschliesslich Canvas und Schaltern unterbindet Textauswahl, Touch-Callouts, Kontextmenüs und Ziehen. Bereits bestehende Spielauswahl wird bei Auswahländerung oder neuer Zeigereingabe entfernt. Das Standardverhalten von Klicks, Touch-Bedientasten und Audio-Freigabe bleibt erhalten. Die Visual-Viewport-Abmessungen und Offsets positionieren die mobile Bühne beim Ein-/Ausblenden oder Verschieben von Browserleisten.


Touch-Eingabesicherheit: Die CSS-Auswahlsperre gilt ausdrücklich für html/body und alle Spielnachfahren. Spielüberschneidende DOM-Auswahlbereiche werden auch bei Body-Ankern entfernt. Nicht-passive Touch-Listener unterdrücken Standardaktionen erst nach den Canvas-Listenern. Aktionsbuttons werden beim Loslassen auf derselben Taste aktiviert; Verschieben, Abbrechen oder Loslassen ausserhalb aktiviert sie nicht. Ein nachfolgender Kompatibilitätsklick wird unterdrückt, Tastaturaktivierung bleibt erhalten. Kontext-/Abbruchaktionen löschen die Spieleingaben.
