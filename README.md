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

Der Graybox-Prototyp zeigt die Etage mit sieben Teamzimmern, sechs Nebenräumen und 37 statischen neutralen Platzhaltern. Die Spielfigur lässt sich mit WASD oder den Pfeiltasten bewegen; die Kamera folgt ihr. Bewegliche Hauptfiguren, Dialoge, Timer, finale Pixelgrafiken und Musik werden schrittweise ergänzt.

Die Raumränder sind geschlossen. Pausenraum, PI-Einführung und Ausgang haben zwei Kacheln breite Öffnungen; alle anderen Türen bleiben eine Kachel breit. Kartentests prüfen die Zugänge und die Erreichbarkeit. Der Browser-Spieltest wurde vom Nutzer bestätigt; teilweise verschwommene Schrift bleibt als offener Qualitätsmangel bestehen.

Der Ausgang ist um eine Kachel nach links verschoben. Kleine Beschriftungen stehen oberhalb der Räume, bei M365 unterhalb, und verdecken keine Raumflächen. Meeting 1–5 sind linksbündig am linken Wandrand beschriftet; PI-Einführung steht rechts neben dem Eingang. Der Steuerungshinweis steht unter dem Spiel statt im Spielfeld. Die Kamera rundet auf ganze Pixel; die Platzierung der Beschriftungen ist vom Nutzer bestätigt. Die Schrift ist teilweise noch verschwommen und muss verbessert werden.

Meeting 1 besitzt zwei Eingänge: oben mit kurzem Zugang von Q1 und unten zu Q2. Seine Beschriftung steht links neben dem oberen Eingang.

Geplante nächste Entwicklung: Mit den Möbeln die neutralen Laufwege festlegen, danach zunächst wenige Personen mit Bewegung und Kollision testen. Dieser Test liegt vor dem RTE-Prototyp; die übrigen Personen und Sprechblasen folgen später. Aktuell bleiben alle 37 neutralen Personen statische Platzhalter.

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

- Verbindliche Regeln für Repository-Abgleich, Warnmeldungen und laufende Dokumentationspflege stehen in [AGENTS.md](AGENTS.md).
- Entwicklung erfolgt auf einem Feature-Branch.
- Änderungen werden als zusammenhängende Commits bereitgestellt und vor dem Merge nach `main` geprüft.
- `main` ist der vorgesehene Stand für eine spätere Veröffentlichung.
- GitHub Pages ist noch nicht eingerichtet.
