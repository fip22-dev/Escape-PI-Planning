# Escape PI Planning – Game Design

## Ziel

Ein humorvolles 2D-Browserspiel in Draufsicht und Retro-Pixeloptik. Die Spielfigur versucht, während des PI Plannings das Gebäude zu verlassen.

## Vereinbarte Eckpunkte

- Start ist der grosse Sitzungsraum, in dem die PI-Einführung stattfindet.
- Es gibt sieben Team-Sitzungszimmer, vorläufig benannt Team 1 bis Team 7.
- Die Karte hat einen Hauptgang, einen parallelen Westgang und Quergänge als Abkürzungen und Ausweichwege.
- Teamzimmer sind Seitenräume. Keines muss durchquert werden, um vom Start zum Ausgang zu gelangen.
- Ziel ist, den Ausgang innerhalb eines Timers zu erreichen.
- Entdeckt eine der sechs Hauptfiguren die Spielfigur, erscheint ein Dialog. Danach beginnt der Versuch im grossen PI-Raum neu.
- Neutrale Personen können durch Gänge laufen oder sich in Teamzimmern aufhalten. Sie lösen allein keinen Neustart aus.
- P&T bedeutet People & Transformation.
- Für Version 0.1 übernehmen wir als Vorschlag: Pfeiltasten und WASD, 180 Sekunden Spielzeit, überspringbare Wiederholungsdialoge, pixelige Retro-Grafik und eine dezente Chiptune-Atmosphäre.

## Kartenprinzip

Der PI-Raum liegt am südlichen Ende und führt direkt in den Hauptgang. Der Ausgang liegt am nördlichen Ende des Hauptgangs. Der Westgang verläuft parallel dazu; drei Quergänge verbinden die beiden Gänge. Die Teamzimmer liegen mit Türen seitlich an den Gängen und sind keine Durchgangsräume.

Vorgeschlagene Zimmerverteilung:

- Westgang: Team 1 im oberen Bereich, Team 3 mittig, Team 5 weiter unten und Team 7 im unteren Bereich.
- Hauptgang: Team 2 im oberen Bereich, Team 4 mittig und Team 6 weiter unten.
- Quergang Q1 liegt oben, Q2 in der Mitte und Q3 unten.
- Der grosse PI-Raum verbindet sich direkt mit dem unteren Ende des Hauptgangs.

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

Teamzimmer sind seitliche Abzweigungen an den Gängen. Ihre genaue Grundfläche und Türpositionen werden beim Kartenentwurf festgelegt. Team 7 ist kein Durchgangszimmer.

## Figuren und Bewegung – Vorschlag für Version 0.1

Die sechs Hauptfiguren können die Spielfigur entdecken. Die Laufwege sind fest und wiederholen sich, damit sie erlernbar sind. Die Figuren bewegen sich mit ungefähr ein bis zwei Kacheln pro Sekunde und bleiben an Teamzimmern oder Kreuzungen kurz stehen.

| Figur | Laufweg | Halt |
|---|---|---|
| RTE | Patrouilliert zwischen PI-Raum und Ausgang auf dem Hauptgang. Wechselt bei Q1 oder Q3 in den Westgang und zurück. | 2 Sekunden an Kreuzungen, 4 Sekunden beim Ausgang |
| P&T | Macht ausgewählte Check-ins: Team 1 → Team 4 → Team 7 → zurück. Muss nicht jedes Teamzimmer besuchen. | 5 Sekunden pro Check-in |
| BO | Besucht alle Teams in Reihenfolge: Team 1 → 2 → 3 → 4 → 5 → 6 → 7 → zurück zu Team 1. | 4 Sekunden pro Team |
| PM | Besucht alle Teams in Gegenrichtung: Team 7 → 6 → 5 → 4 → 3 → 2 → 1 → zurück zu Team 7. | 4 Sekunden pro Team |
| PO | Besucht alle Teams in einer abweichenden Runde: Team 4 → 1 → 5 → 2 → 6 → 3 → 7 → zurück zu Team 4. | 4 Sekunden pro Team |
| SM | Kontrolliert den unteren Bereich: Team 5 → Q3 → Team 7 → Team 6 → Q2 → zurück. | 3 Sekunden an Türen und Kreuzungen |

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
- Nach dem Dialog startet der Versuch im grossen PI-Raum mit vollem Timer und zurückgesetzten Figuren.

## Neutrale Personen – Vorschlag für Version 0.1

Insgesamt zehn neutrale Personen:

- eine Person in jedem der sieben Teamzimmer
- drei Personen mit einfachen Laufwegen durch die Gänge

Sie beleben die Etage, blockieren den Spieler nicht und lösen keinen Alarm aus.

## Grafik und Sound – Vorschlag für Version 0.1

- Eigene Pixelgrafiken mit 16×16-Kacheln und einer reduzierten Farbpalette.
- Die sechs Hauptfiguren erhalten klar unterscheidbare Farben oder Accessoires.
- Eine ruhige, dezente Chiptune-Schleife als Hintergrundmusik.
- Wenige Soundeffekte für Schritte, Türen, Warnzeichen und Dialoge.
- Eine Stummschaltung ist verfügbar.
- Der Retro-Look ist eine Stil-Inspiration. Pokémon-Figuren, Grafiken, Musik oder Markenzeichen werden nicht übernommen; alle Inhalte werden selbst erstellt oder passend lizenziert.

## Noch beim Kartenentwurf festzulegen

- genaue Kachelmasse und Grundfläche der Teamzimmer
- genaue Türpositionen, Möbel und Deckungsmöglichkeiten
- finale Routenlängen und Startpositionen nach einem ersten spielbaren Prototyp
- Dialogtexte der sechs Hauptfiguren
