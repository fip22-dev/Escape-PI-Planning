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

## Lokaler Start

Voraussetzung: Node.js und npm.

```sh
npm install
npm run dev
```

Vite zeigt nach dem Start die lokale Adresse im Terminal an. Für ein Produktionspaket:

```sh
npm run build
```

## Zusammenarbeit

- Entwicklung erfolgt auf einem Feature-Branch.
- Änderungen werden als zusammenhängende Commits bereitgestellt und vor dem Merge nach `main` geprüft.
- `main` ist der vorgesehene Stand für eine spätere Veröffentlichung.
- GitHub Pages ist noch nicht eingerichtet.
