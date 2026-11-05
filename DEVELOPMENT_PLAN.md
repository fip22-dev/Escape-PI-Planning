# Escape PI Planning – Development Plan

Dieses Dokument hält Umsetzungsreihenfolge und Fortschritt fest. Spielregeln, Karte, Rollen und Dialogtexte stehen in [GAME_DESIGN.md](GAME_DESIGN.md).

## Aktueller Stand

- In `main`: Browser-Graybox mit WASD/Pfeiltasten, mitlaufender Kamera, sieben Teamzimmern, Pausenraum, fünf Meeting-Räumen und PI-Einführung.
- 37 neutrale Figuren sind als statische Platzhalter über Teamzimmer, Nebenräume, PI-Einführungsraum und Gänge verteilt.
- Timer, bewegliche Entdecker, Sicht- und Entdeckungslogik, Dialogabläufe, neutrale Laufwege, Sprechblasen, Möbel und finale Grafik/Audio sind noch nicht umgesetzt.
- Der aktuelle Grundriss gilt als abgestimmt. Personenpositionen und Laufwege können nach Browser-Spieltests angepasst werden.

## Umsetzungsreihenfolge

1. **Graybox-Spieltest:** Beschriftungen, Türen und freie Quergänge im Browser prüfen. Positionen der 37 Personen beurteilen und nur nötige Anpassungen vornehmen.
2. **Raumobjekte:** Kaffeemaschine, Tische, Stühle und weitere Objekte platzieren. Für jedes Objekt festlegen, ob es dekorativ ist, Bewegung blockiert oder Sicht beeinflusst.
3. **Spielschleife:** Fluchtstart, 180-Sekunden-Timer, Ausgang, Sieg- und Ablaufzustand sowie Neustart umsetzen.
4. **Entdeckungsmechanik:** Zuerst die RTE als Testrolle mit Route, Blickrichtung, Sichtblockern, Warnzeichen und Entdeckungs-Auslöser einbauen. Danach einzeln P&T, BO, PM, PO und SM ergänzen. Für jede Rolle Route, Startposition und Haltezeiten prüfen.
5. **Erwischtwerden und Neustart:** Für alle sechs Rollen Erst- und Wiederholungsdialoge einbauen, Überspringen ermöglichen, den Timer während eines Dialogs anhalten und den Versuch samt Figurenpositionen zurücksetzen.
6. **Neutrale Personen beleben:** Laufwege und Sprechblasen für die 37 Personen ergänzen; Cooldown, Timerverhalten und Verkehr in den Gängen prüfen.
7. **Grafik und Audio:** Platzhalter durch eigene Pixelgrafik ersetzen, Musik und Effekte ergänzen und Stummschaltung anbieten.
8. **Beta-Feedback über GitHub Issues:** Issue-Formulare für Fehler und Feature-Ideen anlegen. Im Spiel gut auffindbare Aktionen **Fehler melden** und **Idee vorschlagen** ergänzen, die das jeweilige Formular in einem neuen Tab öffnen. Prüfen, dass die Beta-Tester das GitHub-Repository erreichen und Issues erstellen können.
9. **Abschlusstest und Veröffentlichung:** Auf den Zielbrowsern testen und danach GitHub Pages einrichten.

## Branch- und Merge-Regeln

- Einen Branch pro zusammenhängender Funktion oder lieferbarem Zwischenschritt anlegen, nicht pro kleinem Unterpunkt.
- Jeden Feature-Branch vom aktuellen `main` starten; keine Branches auf noch ungemergten Feature-Branches stapeln.
- Änderungen auf den Branch pushen, wenn sie auf anderen Geräten gebraucht oder zur Review bereitgestellt werden sollen.
- Nach Review und Prüfung per Pull Request nach `main` mergen.
