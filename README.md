# Escape PI Planning

Ein humorvolles 2D-Browserspiel in Draufsicht: Während des PI Plannings versucht die Spielfigur, den Ausgang zu erreichen, ohne von den sechs Hauptfiguren entdeckt zu werden.

## Spielidee

- Start im Raum PI-Einführung
- Sieben Teamzimmer mit den Namen Windows Client Team, Windows Software Team, Workplace Device & Print Solutions Team, Enterprise Mobile Services Team, Mac Workplace Team, M365 Tenant & Collaboration Team und Communication & Meetingroom Solutions Team
- Verbindung über einen Hauptgang, einen parallelen Westgang und drei Quergänge
- Zusätzlicher Pausenraum bei Q1 und fünf kleine Sitzungszimmer bei Q2 und Q3
- Sechs erkennbare Entdecker mit festen Laufwegen
- 37 neutrale Personen, verteilt über Teamzimmer, Nebenräume, PI-Einführung und Gänge
- Timer, Dialoge bei Entdeckung und Neustart im PI-Raum

Die vollständigen Spielregeln und Dialogvorschläge stehen in [GAME_DESIGN.md](GAME_DESIGN.md).

## Projektstatus

Der Graybox-Prototyp zeigt die Etage mit sieben Teamzimmern, sechs Nebenräumen und 37 neutralen Personen. Alle Personen bewegen sich auf festen, raum- oder ganggebundenen Routen. Ein Kachelschritt dauert 650 ms, danach pausieren sie 700 ms; die Wege reichen bis zu vier Kacheln weit. Die fünf Routen im Pausenraum sind voneinander getrennt, damit die Personen dort nicht an denselben Engstellen warten. Die Person in Meeting 2 läuft um den Tisch. Türen, solide Möbel und Personen blockieren die Wege; die Spielfigur kann auch während einer Bewegung keine aktuelle oder reservierte Personenkachel betreten. Bewegliche Hauptfiguren, Dialoge, Timer, finale Pixelgrafiken und Musik werden schrittweise ergänzt.

Die Raumränder sind geschlossen. Alle sieben Teamräume sowie Pausenraum, PI-Einführung und Ausgang haben zwei Kacheln breite Öffnungen; die übrigen Türen bleiben eine Kachel breit. Der Pausenraum-Eingang liegt eine Kachel weiter links. Der Browser-Spieltest wurde vom Nutzer bestätigt; teilweise verschwommene Schrift bleibt als offener Qualitätsmangel bestehen.

Der Ausgang ist um eine Kachel nach links verschoben. Kleine Beschriftungen stehen oberhalb der Räume, bei M365 unterhalb, und verdecken keine Raumflächen. Meeting 1–5 sind linksbündig am linken Wandrand beschriftet; PI-Einführung steht rechts neben dem Eingang. Der Steuerungshinweis steht unter dem Spiel statt im Spielfeld. Die Kamera rundet auf ganze Pixel; die Platzierung der Beschriftungen ist vom Nutzer bestätigt. Die Schrift ist teilweise noch verschwommen und muss verbessert werden.

Meeting 1 besitzt zwei Eingänge: oben mit kurzem Zugang von Q1 und unten zu Q2. Seine Beschriftung steht links neben dem oberen Eingang.

Auf `feature/room-objects` ist ein Möbelvorschlag umgesetzt: Sitzungstische, Stühle, Leinwände, Pflanzen und Büroausstattung. Alle Leinwände hängen hochkant an Seitenwänden: in den linken Teamräumen links, in den rechten Teamräumen und allen Meeting-Räumen rechts. In allen vier Westgang-Teams stehen Sideboard links unten und Pflanze rechts unten. Die PI-Stühle stehen in fünf Reihen mit Leerreihen dazwischen; je Reihe zwei zusätzliche Stühle links und eine freie Kachel zur rechten Wand lassen eine freie Laufspur. Links an der Wand folgen von oben nach unten Kaffeemaschine, senkrechter dreikachelbreiter Snacktisch ohne Stühle mit Obst, Gemüse und Gipfeli sowie Papierkorb; die Pflanze steht darunter. Der Pausenraum ist eine Kachel nach Norden erweitert; sein Eingang ist nach links verschoben, die Tische zeigen Essen und Kaffeetassen, Kaffeemaschinen und Abfalleimer stehen wieder an der oberen Wand. Ein Drucker steht ganz rechts im oberen Westgang. Der Nutzer hat die aktuelle Platzierung im Browser visuell abgenommen. Pflanzen, Tische, Sideboards, Drucker und Kaffeemaschinen blockieren Bewegung; Sichtblocker-Eigenschaften sind für die spätere Suchenden-Logik hinterlegt. Die Suchenden-Sichtlogik fehlt noch.

Laufwege und Kollisionen aller 37 Personen sind auf `feature/neutral-person-movement` umgesetzt und visuell abgenommen. Die Bewegungsregeln und die Spielerblockierung sind vor dem RTE-Prototyp automatisiert geprüft.

Ergänzt sind Whiteboards, Sideboards, eine Druckerstation, Abfalleimer neben den Kaffeemaschinen sowie Laptops, Unterlagen und Becher auf den Tischen. Sideboards und Drucker blockieren Bewegung und sind als Sichtblocker hinterlegt; Abfalleimer blockieren nur Bewegung. Whiteboards und Tischdetails erzeugen keine zusätzliche Bewegungs- oder Sichtblockierung. Zusätzliche Wegweiser und Ausgangsschilder sind nicht vorgesehen.

## Lokaler Start

Voraussetzung: Node.js und npm (die aktuelle Vite-Version benötigt Node.js 20.19+ oder 22.12+; lokal wurde mit Node.js 24.22.2 geprüft).

```sh
npm install
npm run dev
```

Vite zeigt nach dem Start die lokale Adresse im Terminal an. Für ein Produktionspaket:

```sh
npm run build
```

Die automatisierten Kartentests starten mit `npm test`.

## Zusammenarbeit

### Arbeit oder Tests auf einem anderen Client

Vor dem Weiterarbeiten im VS-Code-Terminal:

```sh
git status --short --branch
git fetch origin
git branch -r --no-merged origin/main
```

Zusätzlich die [offenen Pull Requests](https://github.com/fip22-dev/Escape-PI-Planning/pulls) prüfen. Die Branchliste enthält auch veraltete oder bereits anders integrierte Branches; sie ist keine verlässliche Liste aktiver Arbeit. Den zur Aufgabe gehörenden Branch anhand des Pull Requests auswählen. Bestehende lokale Änderungen zuerst sichern und nicht überschreiben.

Der Möbelstand liegt auf **`feature/room-objects`** und bleibt zur visuellen Abnahme ungemergt. Zum Abrufen auf einem anderen Client mit sauberem Arbeitsverzeichnis:

```sh
git switch feature/room-objects
git pull --ff-only
npm install
npm test
npm run build
npm run dev
```

Beim ersten Wechsel legt Git normalerweise den lokalen Tracking-Branch für `origin/feature/room-objects` an. Falls das nicht eindeutig möglich ist, explizit `git switch --track origin/feature/room-objects` verwenden.

Auf dem Phone gilt dieser Abgleich für Entwicklungssitzungen mit Repository-Zugriff. Beim blossen Öffnen des Spiels zählt dagegen der Stand des Servers oder Deployments; der Browser prüft oder wechselt keine Git-Branches. Die lokale Adresse `127.0.0.1` des Entwicklungsclients ist vom Phone aus nicht dessen Spielserver. Touch-Steuerung ist bisher nicht implementiert.

### Entwicklungsregeln

- Verbindliche Regeln für Repository-Abgleich, Warnmeldungen und laufende Dokumentationspflege stehen in [AGENTS.md](AGENTS.md).
- Entwicklung erfolgt auf einem Feature-Branch.
- Änderungen werden als zusammenhängende Commits bereitgestellt und vor dem Merge nach `main` geprüft.
- `main` ist der vorgesehene Stand für eine spätere Veröffentlichung.
- GitHub Pages ist noch nicht eingerichtet.
