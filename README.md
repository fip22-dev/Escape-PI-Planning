# Escape PI Planning

Ein humorvolles 2D-Browserspiel in Draufsicht: Während des PI Plannings versucht die Spielfigur, den Ausgang zu erreichen, ohne von den 15 Suchenden entdeckt zu werden.

## Spielidee

- Start im Raum PI-Einführung
- Sieben Teamzimmer mit den Namen Windows Client Team, Windows Software Team, Workplace Device & Print Solutions Team, Enterprise Mobile Services Team, Mac Workplace Team, M365 Tenant & Collaboration Team und Communication & Meetingroom Solutions Team
- Verbindung über einen Hauptgang, einen parallelen Westgang und drei Quergänge
- Zusätzlicher Pausenraum bei Q1 und fünf kleine Sitzungszimmer bei Q2 und Q3
- 15 erkennbare Suchende aus sechs Rollenfamilien mit eigenen Patrouillen; bei wiederholter Blockade finden sie Umwege
- 37 neutrale Personen, verteilt über Teamzimmer, Nebenräume, PI-Einführung und Gänge
- Timer, Dialoge bei Entdeckung und Neustart im PI-Raum

Die vollständigen Spielregeln und Dialogtexte stehen in [GAME_DESIGN.md](GAME_DESIGN.md).

## iPhone-/Safari-Testbranch

Dieser Branch basiert auf dem nach main gemergten Stand a199290. Eigene private Testdemo und echte Geräteabnahme werden hier isoliert geführt. Die sichtbare Testkennung unterscheidet die Demo vom Hauptstand; Spielregeln bleiben unverändert. [Prüfplan und Geräteprotokoll](IPHONE_SAFARI_TEST_PLAN.md).

## Projektstatus

**Freigegebener Funktionsstand:** Der Nutzer hat Grafik und Darstellung visuell bestätigt und die Übernahme nach `main` beauftragt. Echte iPhone-/Safari-Tests und die neue private Testdemo gehören zum separaten Branch `feature/iphone-safari-testing`, der vom gemergten `main` startet. Die bestehende private Demo wird dadurch nicht ersetzt.

Der Graybox-Prototyp zeigt die Etage mit sieben Teamzimmern, sechs Nebenräumen und 37 neutralen Personen. Alle Personen bewegen sich auf festen, raum- oder ganggebundenen Routen. Ein Kachelschritt dauert 650 ms, danach pausieren neutrale Personen 700 ms; ihre Wege reichen bis zu vier Kacheln weit. Die fünf Routen im Pausenraum sind voneinander getrennt, damit die Personen dort nicht an denselben Engstellen warten. Die Person in Meeting 2 läuft um den Tisch. Insgesamt patrouillieren 15 Suchende: RTE, P&T, BO, PM, sieben teambezogene PO (WCL, WSW, WDPS, EMS, MAC, M365 und CMS) sowie vier als „Scrum Master“ beschriftete Figuren. Jede PO startet und endet im eigenen Teamraum und patrouilliert im benachbarten Gangabschnitt. Bei Sichtkontakt wechselt die Warnung nach 300 ms auf Rot; nach 600 ms Sichtkontakt wird die Spielfigur entdeckt. Bei wiederholter Blockade suchen Suchende und neutrale Personen einen freien Umweg innerhalb ihres Bereichs und setzen ihre Route fort. Solide Möbel und Personen blockieren die Wege; Türen öffnen automatisch und blockieren geschlossen die Sicht; die Spielfigur kann auch während einer Bewegung keine aktuelle oder reservierte Personenkachel betreten. Die Spielschleife hat einen 180-Sekunden-Timer, Sieg am Ausgang, Ablaufmeldung und Neustart. ESC pausiert das Spiel; im Pausenmenü startet Ja neu, Nein setzt fort, Musik und Töne lassen sich getrennt umschalten. ESC setzt das pausierte Spiel fort. „Zurück zum Startmenü“ ist mit ↑/↓ und Enter sowie per Klick/Tippen direkt erreichbar. Die letzten 30 Sekunden erscheinen rot, die letzten 15 blinken rot. Der Nutzer hat die Mehrrollenansicht mit PO-Rückkehr und Ausweichwegen im Browser bestätigt; Routentests und Produktionsbuild sind erfolgreich. Rollenspezifische Erst- und Wiederholungsdialoge mit Timerstillstand und reproduzierbarem Figurenneustart sind über PR #10 in `main` integriert und automatisiert im Browser geprüft. Startmenü, Pixelgrafik und Büro-Jazz sind über PR #13 in `main` integriert und vom Nutzer im Browser geprüft. Möbelpalette, Suchendenaccessoires, scharfe Schrift, dezente Schritte, feste Zwei-Sekunden-Sprechblasen, automatische Türen und Vollbild sind Bestandteil dieses freigegebenen Funktionsstands. Visuelle Abnahme bestätigt; reale Geräteprüfung und Hörprobe folgen separat.

Die Raumränder sind geschlossen. Alle sieben Teamräume sowie Pausenraum, PI-Einführung und Ausgang haben zwei Kacheln breite Öffnungen; die übrigen Türen bleiben eine Kachel breit. Der Pausenraum-Eingang liegt eine Kachel weiter links. Der Browser-Spieltest wurde vom Nutzer bestätigt; die frühere Schriftunschärfe wird auf dem Folgebranch durch höher aufgelöste Zeichnung korrigiert; die manuelle Abnahme bleibt offen.

Der Ausgang ist um eine Kachel nach links verschoben. Kleine Beschriftungen stehen oberhalb der Räume, bei M365 unterhalb, und verdecken keine Raumflächen. Meeting 1–5 sind linksbündig am linken Wandrand beschriftet; PI-Einführung steht rechts neben dem Eingang. Der Steuerungshinweis steht unter dem Spiel statt im Spielfeld. Die Kamera rundet auf ganze Pixel; die Platzierung der Beschriftungen ist vom Nutzer bestätigt. Auf dem Folgebranch werden alle Spieltexte mit vierfacher Auflösung pro Achse gezeichnet. Die manuelle Lesbarkeitsabnahme auf Zielgeräten bleibt offen.

Meeting 1 besitzt zwei Eingänge: oben mit kurzem Zugang von Q1 und unten zu Q2. Seine Beschriftung steht links neben dem oberen Eingang.

Auf `feature/room-objects` ist ein Möbelvorschlag umgesetzt: Sitzungstische, Stühle, Leinwände, Pflanzen und Büroausstattung. Alle Leinwände hängen hochkant an Seitenwänden: in den linken Teamräumen links, in den rechten Teamräumen und allen Meeting-Räumen rechts. In allen vier Westgang-Teams stehen Sideboard links unten und Pflanze rechts unten. Die PI-Stühle stehen in fünf Reihen mit Leerreihen dazwischen; je Reihe zwei zusätzliche Stühle links und eine freie Kachel zur rechten Wand lassen eine freie Laufspur. Links an der Wand folgen von oben nach unten Kaffeemaschine, senkrechter dreikachelbreiter Snacktisch ohne Stühle mit Obst, Gemüse und Gipfeli sowie Papierkorb; die Pflanze steht darunter. Der Pausenraum ist eine Kachel nach Norden erweitert; sein Eingang ist nach links verschoben, die Tische zeigen Essen und Kaffeetassen, Kaffeemaschinen und Abfalleimer stehen wieder an der oberen Wand. Ein Drucker steht ganz rechts im oberen Westgang. Der Nutzer hat die aktuelle Platzierung im Browser visuell abgenommen. Pflanzen, Tische, Sideboards, Drucker und Kaffeemaschinen blockieren Bewegung und Sicht; die Sichtprüfung der Suchenden ist implementiert, die gezielte Möbel-Sichtprüfung ist abgeschlossen; Grenzen der nutzbaren Deckung stehen in [FURNITURE_SIGHT_TEST.md](FURNITURE_SIGHT_TEST.md).

Laufwege und Kollisionen aller 37 Personen sind auf `feature/neutral-person-movement` umgesetzt und visuell abgenommen. Die Bewegungsregeln und Spielerblockierung sind automatisiert geprüft; wiederholte Blockaden lösen eine dynamische Umleitung mit anschliessender Rückkehr zur Route aus. Die 15 Suchenden nutzen ihre im Design festgelegten Patrouillen. Der Nutzer hat den manuellen Browser-Spieltest der Mehrrollenansicht, PO-Rückkehr und Ausweichwege bestätigt.

Ergänzt sind Whiteboards, Sideboards, eine Druckerstation, Abfalleimer neben den Kaffeemaschinen sowie Laptops, Unterlagen und Becher auf den Tischen. Sideboards und Drucker blockieren Bewegung und Sicht; Abfalleimer blockieren nur Bewegung. Whiteboards und Tischdetails erzeugen keine zusätzliche Bewegungs- oder Sichtblockierung. Zusätzliche Wegweiser und Ausgangsschilder sind nicht vorgesehen.

## Mobile Steuerung

Im Dialogfenster werden Rollen ausgeschrieben: Release Train Engineer, People & Transformation, Business Owner, Product Manager, Product Owner (mit Teamkürzel) und Scrum Master.

Die Rollendialoge und der reproduzierbare Neustart auf `feature/caught-dialogs` sind zusätzlich zu den automatisierten Tests vom Nutzer im lokalen Browser-Spieltest am 07.11.2026 abgenommen. Die iPhone-/Safari-Abnahme des integrierten Stands wurde am 08.11.2026 vom Nutzer bestätigt.

Die mobile Steuerung entspricht der vom Nutzer bestätigten Demo: Richtungstasten antippen für einzelne Schritte oder gedrückt halten zum Laufen. **Pause / Weiter** hält das Spiel an oder setzt es fort; **Neustart** setzt den Versuch direkt zurück. Bei Fokusverlust oder abgebrochener Berührung wird die Richtungseingabe gelöscht. Die Touch-Steuerung ist im Projekt enthalten; für einen Aufruf unterwegs muss dieser Stand auf einem erreichbaren Server bereitgestellt sein.

Prüfung: Bewegung, Pause und Neustart im Browser geprüft, 23 vorhandene Tests und Produktionsbuild erfolgreich. Der Nutzer hat die mobile Demo bestätigt.

## Spiel auf Mobile und PC öffnen

### Online-Demo – ohne Installation

Die [Escape PI Planning – Demo](https://escape-pi-planning-demo-philippe.electgleam1.chatgpt.site/) lässt sich auf dem iPhone und am PC im Browser öffnen.

1. Den Demo-Link öffnen; auf dem iPhone beispielsweise in Safari, am PC im Browser.
2. Bei Aufforderung mit dem ChatGPT-Konto anmelden, dem die Demo gehört. Die Demo ist privat; andere Personen erhalten über den Link allein keinen Zugriff.
3. Auf dem iPhone die eingeblendeten Richtungstasten antippen oder halten. **Pause / Weiter** und **Neustart** sind ebenfalls als Tasten verfügbar. Hoch- und Querformat werden unterstützt.
4. Am PC mit **WASD oder Pfeiltasten** bewegen. **Esc** öffnet bzw. schliesst das Pausenmenü; alternativ die eingeblendeten Schaltflächen verwenden.

Ein eigener Computer muss für den Online-Aufruf nicht eingeschaltet sein. Die Demo ist eine separat bereitgestellte Version und wird durch Änderungen auf GitHub nicht automatisch aktualisiert. Der GitHub-Repository-Link zeigt den Quellcode; er startet das Spiel nicht. GitHub Pages ist noch nicht eingerichtet.

### PC – aktuellen GitHub-Stand lokal testen

Voraussetzungen: Git, Node.js und npm (Node.js 20.19+ oder 22.12+; bisher mit Node.js 24.22.2 geprüft).

Beim ersten Mal das Repository herunterladen:

```sh
git clone https://github.com/fip22-dev/Escape-PI-Planning.git
cd Escape-PI-Planning
```

Bei einer bestehenden Kopie zuerst im Projektordner den Stand prüfen und eigene lokale Änderungen sichern. Für einen Test des freigegebenen Stands mit sauberem Arbeitsverzeichnis:

```sh
git status --short --branch
git fetch origin
git switch main
git pull --ff-only
```

Danach Abhängigkeiten installieren und das Spiel starten:

```sh
npm install
npm run dev
```

Die im Terminal angezeigte **Local**-Adresse im Browser desselben Computers öffnen. Das Terminal während des Spielens geöffnet lassen; mit **Ctrl+C** den Server beenden.

### iPhone – lokalen PC-Stand im gleichen WLAN testen

Diese Variante benötigt einen eingeschalteten Computer mit laufendem Spielserver. Für unterwegs stattdessen die Online-Demo verwenden.

1. Computer und iPhone mit demselben WLAN verbinden.
2. Im Projektordner auf dem Computer starten:

   ```sh
   npm run dev -- --host 0.0.0.0
   ```

3. Die von Vite angezeigte **Network**-Adresse in Safari auf dem iPhone eingeben. Die tatsächliche Adresse und den Port aus dem Terminal übernehmen, zum Beispiel `http://192.168.1.42:5173/`.
4. Falls keine Verbindung möglich ist, die Firewall-Freigabe für Node.js im privaten Netzwerk und eine mögliche Geräteisolation des WLANs prüfen.

`localhost` und `127.0.0.1` auf dem iPhone verweisen auf das iPhone selbst und erreichen den Computer nicht. Den Entwicklungsserver nur im vertrauenswürdigen lokalen Netzwerk verwenden.

### Build und automatisierte Tests

Ein Produktionspaket erstellen:

```sh
npm run build
```

Die automatisierten Tests starten mit `npm test`.

Rollendialoge sind über PR #10 in `main` integriert. Beim ersten Erwischtwerden wird der vollständige Text gezeigt, längere Texte werden seitenweise bestätigt. Wiederholungsdialoge lassen sich mit Enter, Leertaste oder Klick/Tippen im Spielfeld überspringen. Die Erinnerung gilt je Rollenfamilie für die aktuelle Spielsitzung und bleibt über Versuchsneustarts erhalten; ein Neuladen der Seite löscht sie. Während des Dialogs stehen Timer und Figuren still. Nach Bestätigung starten Spieler, alle 37 neutralen Personen und alle 15 Suchenden mit ursprünglichen Routen und Startpausen neu. Der externe Neustart-Button bestätigt während eines Dialogs dessen nächste Seite.

Für reproduzierbare Browserprüfungen einmalig `npx playwright install chromium firefox` ausführen, danach `npm run test:browser`. Die Tests starten und beenden ihren eigenen lokalen Vite-Server auf Port 5181. Sie prüfen Chromium, Firefox und mobiles Chromium mit Touch-Eingaben. Testberichte/Screenshots liegen unter `test-results/`; bei Fehlern wird ein Playwright-Trace gespeichert. Der Testzugriff auf die Phaser-Szene wird ausschliesslich im Testbrowser eingebunden und ist nicht Teil der veröffentlichten Anwendung. Der finale Prüfstatus steht im Entwicklungsplan; ein reales iPhone/Safari ist damit nicht geprüft.

## Zusammenarbeit

### Arbeit oder Tests auf einem anderen Client

Vor dem Weiterarbeiten im VS-Code-Terminal:

```sh
git status --short --branch
git fetch origin
git branch -r --no-merged origin/main
```

Zusätzlich die [offenen Pull Requests](https://github.com/fip22-dev/Escape-PI-Planning/pulls) prüfen. Die Branchliste enthält auch veraltete oder bereits anders integrierte Branches; sie ist keine verlässliche Liste aktiver Arbeit. Den zur Aufgabe gehörenden Branch anhand des Pull Requests auswählen. Bestehende lokale Änderungen zuerst sichern und nicht überschreiben.

Für Tests des freigegebenen Spielstands `main` verwenden; die Befehle stehen unter **Spiel auf Mobile und PC öffnen**. Ein Feature-Stand muss gezielt anhand des zugehörigen Pull Requests gewählt werden. Der frühere Möbelstand ist bereits in `main` integriert.

Auf dem Phone gilt dieser Abgleich für Entwicklungssitzungen mit Repository-Zugriff. Beim blossen Öffnen des Spiels zählt dagegen der Stand des Servers oder Deployments; der Browser prüft oder wechselt keine Git-Branches. Die lokale Adresse `127.0.0.1` des Entwicklungsclients ist vom Phone aus nicht dessen Spielserver. Touch-Steuerung ist implementiert: vier Richtungstasten zum Antippen oder Halten sowie Pause/Weiter und direkter Neustart. Das Layout passt sich an Hoch- und Querformat an. WASD und Pfeiltasten bleiben verfügbar.

### Entwicklungsregeln

- Verbindliche Regeln für Repository-Abgleich, Warnmeldungen und laufende Dokumentationspflege stehen in [AGENTS.md](AGENTS.md).
- Entwicklung erfolgt auf einem Feature-Branch.
- Änderungen werden als zusammenhängende Commits bereitgestellt und vor dem Merge nach `main` geprüft.
- `main` ist der vorgesehene Stand für eine spätere Veröffentlichung.
- GitHub Pages ist noch nicht eingerichtet.

## Neutrale Sprechblasen – aktueller Feature-Stand

Neutrale Personen sprechen bei Annäherung bis zwei Kacheln im gleichen Bereich. Die Blasen bleiben zwei Sekunden an ihrem Entstehungsort in der Spielwelt; sie folgen weder Spieler noch Sprecher und scrollen mit der Karte aus dem Bild. Je eine Blase pro Team-, Meeting- und Pausenraum, mehrere im Gang und in der PI-Einführung; weiterhin 15 Sekunden Cooldown pro Person. Timer und Bewegung laufen weiter. Pause friert Anzeigezeit und Cooldowns ein; Fang und Neustart räumen die Blasen auf. Aktuelle Prüfungen und offene Nutzerabnahme stehen im Entwicklungsplan.

Der Product Manager startet bei Q2 auf (28, 20), Scrum Master 2 im ersten horizontalen Gang Q1 auf (28, 8). Damit stehen beide zu Beginn abseits des RTE-Laufwegs vor der PI-Einführung. Routen und Startversätze bleiben erhalten; später können sich Patrouillen weiterhin begegnen.

## Möbel-Sichtprüfung

Historischer Prüfstand vom 07.11.2026: 41 Funktionstests, neun neue Möbel-Browserfälle und alle 18 bisherigen Browserfälle erfolgreich; Build erfolgreich. Der am 08.11.2026 aufgetretene Fehler im synthetischen Möbel-Kontrolltest ist auf eine zu frühe Dialogbestätigung zurückgeführt und im Test korrigiert; 30 Wiederholungen und anschliessend alle 27 Browserfälle erfolgreich. Die Sichtregeln stimmen, Tischdeckung ist auch auf der Originalkarte geprüft. Pflanzen, Sideboards und Drucker bieten mit der aktuellen Platzierung keine freie begehbare Sichtachse innerhalb der Sichtweite; Kaffeemaschinen liegen ohne zulässigen Suchenden-Standort. Eine Entscheidung über ihre spielerisch nutzbare Platzierung bleibt offen. Methodik und Ergebnisse stehen in [FURNITURE_SIGHT_TEST.md](FURNITURE_SIGHT_TEST.md).

## iPhone-Abnahme und nächster Schritt

Der Nutzer hat am 08.11.2026 alle vorgesehenen iPhone-/Safari-Tests der aktualisierten privaten Online-Demo bestätigt: Hoch-/Querformat, Touch-Steuerung, Fokusverlust, Pause/Weiter, Neustart, Fangdialoge und Überspringen, Sprechblasen, Raumbegrenzung und vollständiger Spielversuch. Die Demo enthält die Spielquellen aus main (21483a7, PR #11). Git-Merges aktualisieren sie weiterhin nicht automatisch.

**Erledigt – Testabschluss:** Ursache des Möbel-Kontrolltestfehlers geklärt und nur im Test korrigiert. 30 Wiederholungen (270 Möbelaufstellungen), alle 27 Browserfälle, 41 Funktionstests, Build und Diff-Prüfung erfolgreich. Die Umsetzung von Grafik, Audio und Intro-Menü wurde über PR #13 in `main` integriert und vom Nutzer im Browser geprüft.

## Intro-Menü, Grafik und Audio

**Teilweise erledigt:** Das Startmenü, eine kleine Büro-Pixelszene, erste eigene Pixelgrafik und generierte dezente Büro-Jazz-Musik sind angelegt. Es bietet Spielstart, eine grössere scrollbare Anleitung mit fett hervorgehobenen Abschnitten Regeln und Rollen sowie zwei Audio-Einstellungen: Musik und Töne (Spielgeräusche). Die Menünavigation bleibt stumm. Dieselben Schalter lassen sich während des Spiels im Pausenfenster per Klick oder mit **M** und **T** bedienen; die Tastenkürzel stehen gut sichtbar in einer eigenen Zeile. „Zurück zum Startmenü“ mit ↑/↓ auswählen und mit Enter direkt ausführen oder anklicken/antippen. ESC setzt fort. Der Nutzer bestätigt die manuelle Browserprüfung dieses Stands. Der Grafik-Feinschliff für Möbel und Suchende ist auf dem Folgebranch umgesetzt. Offen bleiben dessen manuelle Abnahme, Hörprobe auf Zielgeräten und die verlinkten Beta-Feedback-Formulare. Die vollständige Umsetzung und noch ausstehende Prüfung stehen in [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md); Gestaltung und Verhalten in [GAME_DESIGN.md](GAME_DESIGN.md).

Der aktuelle Funktionsschnitt aus PR #13 ist in `main` integriert. Möbelgrafik, Rollenaccessoires sowie automatisierte Layout-/Audioprüfung liegen auf `feature/visuals-audio-polish`; die reale Geräteabnahme bleibt offen; danach kommen Beta-Feedback-Formulare sowie Abschlusstest und Veröffentlichung.

Der Folgebranch verwendet für die HTML-Oberfläche lokale Systemschrift-Fallbacks statt externer Fontdownloads. Prüfung am 09.11.2026: 41 Funktionstests, 30 Browserfälle in Chromium, Firefox und mobilem Chromium sowie Produktionsbuild erfolgreich. Nach dem Versetzen des Menü-Steuerungshinweises unter den Rahmen bestanden die drei betroffenen Grafik-/Audiofälle erneut. Möbel-/Rollengalerie und Layout-Screenshots visuell kontrolliert. Hörprobe auf realen Geräten und manuelle Abnahme der neuen Grafik bleiben offen; Einzelheiten im Entwicklungsplan.

## Schärfere Darstellung und dezente Schritte

**Teilweise erledigt:** Auf `feature/visuals-audio-polish` zeichnet das Spiel intern 1280×960 Pixel statt 320×240. Kartenausschnitt, Layout und Regeln verwenden weiterhin 320×240 logische Einheiten. Texte werden vierfach aufgelöst; die CSS-Vergrösserung des fertigen Niedrigauflösungsbilds entfällt. Die Normalansicht nutzt am Desktop bis 960 Pixel Breite; Vollbild und Grossansicht nutzen den verfügbaren Bildschirm. Mobilansichten bleiben angepasst. Pflanzen besitzen kontrastreiche Blattgruppen und einen hellen Topfrand. Der Schrittklang ist ein kurzer, leiser Sinuston statt eines Rechtecktons; Musik und Warnsignale behalten ihre Einstellungen. Neue manuelle Sicht-/Hörprobe und reale Geräteprüfung bleiben offen. 41 Funktionstests und Build erfolgreich; alle 30 Browserfälle durch Gesamtlauf und gezielte Nachprüfung abgedeckt. Menü-, Spiel- und Pausenscreenshots visuell kontrolliert. Die Canvas-Zentrierung übernimmt die Spielengine allein. Prüfdetails im Entwicklungsplan.

## Automatische Türen und Pausenmenü

**Teilweise erledigt – neue Nutzerabnahme offen:** Alle 16 Durchgänge einschliesslich der beiden Meeting-1-Türen, PI-Einführung und Ausgang besitzen automatisch öffnende Türen. Türblätter, automatische Öffnung und Sichtblockierung liegen gemeinsam in den tatsächlichen Wandöffnungen. Die bisherigen inneren Türfelder erscheinen als normaler Raumboden; die ein-/zweikachelbreiten Durchgänge bleiben passierbar. Aktuelle und reservierte Zielkacheln von Spieler und NPCs halten die gemeinsame Tür offen; 250 ms nach der letzten Freigabe schliesst sie. Geschlossene Türfelder unterbrechen die Sicht aller Suchenden, offene Türen bleiben durchsichtig. In der Pause stehen auch Türfristen still. Figuren behalten ihre bisherigen Routen und erlaubten Bereiche.

Pause: ↑/↓ oder W/S wechseln zwischen Neustartfrage, Startmenü und Audio; ←/→ oder A/D wählen Ja/Nein beziehungsweise Musik/Töne. Enter führt die markierte Aktion aus. „Zurück zum Startmenü“ führt ohne weiteren Bestätigungsdialog ins Hauptmenü und verwirft den Versuch. Klick/Touch ist ebenfalls möglich; ESC beziehungsweise Pause/Weiter setzt fort. Beim Menüwechsel werden die Canvas-Eingabekoordinaten neu abgeglichen, damit die Treffflächen nach dem Ein-/Ausblenden des Seitenkopfs stimmen.

Prüfung dieses Stands: 44 Funktionstests, alle 39 Browserfälle (Chromium, Firefox, mobiles Chromium), Produktionsbuild und Diff-Prüfung erfolgreich. Tür- und Menü-Screenshots visuell kontrolliert. Neue manuelle Nutzerabnahme und realer iPhone-/Safari-Test bleiben offen. Der Funktionsstand wird nach Nutzerfreigabe in main übernommen; Online-Demos werden separat aus einem eindeutig benannten Commit bereitgestellt.

Türplatzierung korrigiert: alle 14 Raumtüren sitzen in der jeweiligen Wandöffnung, einschliesslich beider Meeting-1-Eingänge. PI-Eingang auf seiner bestehenden Wandlinie und Ausgang am Spielziel bleiben korrekt positioniert. 45 Funktionstests, neun gezielte Tür-Browserfälle, Produktionsbuild und Diff-Prüfung erfolgreich; der frühere Gesamtlauf mit 39 Fällen bleibt als vorheriger Prüfstand im Entwicklungsplan dokumentiert. Visuelle Nutzerabnahme bestätigt; reale Geräteabnahme folgt separat.

## Vollbild und Grossansicht

Mit der Taste **Vollbild** oberhalb des Spiels oder **F** die grosse Ansicht öffnen und schliessen; die Taste ist auch im Startmenü sichtbar. **Esc** beendet zuerst Vollbild/Grossansicht, ohne dabei den Spiel-/Pausenzustand zu ändern. Danach hat Esc wieder seine normale Spielfunktion. Der Ansichtsschalter ist auch per Tab und Enter/Leertaste bedienbar.

Wenn Browser oder Einbettung echtes Vollbild nicht freigeben, verwendet das Spiel eine Grossansicht innerhalb der Seite und zeigt dies an. Browserleisten bleiben dort erhalten. Auf Touch-Geräten bleiben Richtungstasten, Pause und Neustart erreichbar; im Querformat stehen sie neben dem Spiel. Bei Maus-/Tastaturgeräten wird die Touch-Leiste in der grossen Ansicht ausgeblendet. Kartenausschnitt und Regeln bleiben unverändert; das Seitenverhältnis bleibt erhalten.

Die Türen haben graugrüne Paneele, dunkle Mauerrahmen und dezente Griffe. Die Schwellen verwenden Gangfarben statt gelber Flächen. Position, automatische Öffnung und Sichtschutz bleiben erhalten.

Prüfung: 45 Funktionstests, 15 gezielte Browserfälle in Chromium/Firefox/mobilem Chromium sowie Produktionsbuild erfolgreich. Zusätzlich ein Chromium-Sichtlauf für offene Türblätter; Tür-, Vollbild- und mobile Grossansicht-Screenshots kontrolliert. Die visuelle Nutzerabnahme ist bestätigt; echtes iPhone/Safari bleibt separat offen. Die visuelle Nutzerabnahme ist bestätigt; die neue iPhone-/Safari-Demo wird separat bereitgestellt.

## Separate iPhone-/Safari-Testdemo

Der Branch [feature/iphone-safari-testing](https://github.com/fip22-dev/Escape-PI-Planning/tree/feature/iphone-safari-testing) ist für die reale Geräteabnahme und die eigene private iPhone-Testdemo reserviert. Er startet vom gemergten Hauptstand. Demo-Konfiguration, Quellcommit und Prüfergebnisse werden dort dokumentiert; spielrelevante Korrekturen gehen später per Pull Request nach main zurück. Ein iPhone-Browser verwendet ausschliesslich den veröffentlichten Stand und wählt keinen Git-Branch. Die alte Demo wird nicht mehr benötigt; ihre Löschung ist beauftragt und noch offen.

Abschliessender Prüfstand vor der Übernahme nach main: 45 Funktionstests, alle 51 Browserfälle in Chromium/Firefox/mobilem Chromium, Produktionsbuild und Diff-Prüfung erfolgreich. Die visuelle Nutzerabnahme und Mergefreigabe liegen vor; der echte iPhone-/Safari-Spieltest wird auf dem separaten Testbranch protokolliert.

## Gerätezweig – Bereitstellung

**Erledigt – veröffentlicht:** Die eigene [private iPhone-/Safari-Testdemo](https://escape-pi-iphone-safari-philippe.electgleam1.chatgpt.site) wurde als Version 1 erfolgreich bereitgestellt. In Safari gegebenenfalls mit dem zugehörigen ChatGPT-Konto anmelden. Die alte Demo wird nicht mehr benötigt; ihre Löschung ist beauftragt und noch offen. **Offen:** reale Geräteabnahme I01–I14. Zusätzliche Browseröffnung hier wegen nicht verfügbarem Browser-Dienst blockiert. Site-ID und statisches Ausgabeziel stehen in .openai/hosting.json; Publikationsstand und Quellzuordnung im [Geräteprüfplan](IPHONE_SAFARI_TEST_PLAN.md). Hauptstand-Merge: PR #14, main a199290.
