# Möbel-Sichtprüfung – 07.11.2026

## Ergebnis

**Erledigt – Sichtregeln:** Die neun Möbeltypen verhalten sich wie im Spieldesign festgelegt. Pflanzen, Tische, Sideboards, Drucker und Kaffeemaschinen blockieren Sicht; Stühle, Leinwände, Whiteboards und Abfalleimer nicht. Alle 15 Suchenden nutzen diese Regeln einschliesslich aktueller und reservierter Kacheln. Kein Spielcode oder Möbelstandort wurde für diese Prüfung geändert.

**Offen, vorerst zurückgestellt – Spielbare Deckung durch die Platzierung:** Tische bieten auf der aktuellen Karte nutzbare Deckung. Für Pflanzen, Sideboards und Drucker gibt es keine freie kardinale Sichtachse mit begehbaren Endpunkten innerhalb von fünf Kacheln. Eine Kaffeemaschine liegt auf vier solchen Achsen im Pausenraum, den keine Suchenden betreten dürfen. Ihre Sichtblocker-Eigenschaft ist korrekt, daraus entsteht dort aber noch keine eigenständige Deckungsmöglichkeit gegen die Suchenden. Der Nutzer lässt diesen Befund vorerst unverändert stehen; eine mögliche Umstellung bleibt als zurückgestelltes To-do dokumentiert.

## Prüfumfang

- Node-Prüfungen aller 197 vorhandenen Möbelobjekte mit ihren tatsächlichen Abmessungen: beide Achsen, beide Blickrichtungen, jede Reihe beziehungsweise Spalte. Sollwerte sind unabhängig von den Objektregeln aus dem Spieldesign abgeleitet. Die fünf Kacheln breite PI-Leinwand wird für die reine Transparenzprüfung mit grösserer Testreichweite geprüft; die produktive Sichtweite bleibt fünf Kacheln und wird separat geprüft.
- Originalkarte: alle 1458 freien Sichtachsen innerhalb der produktiven Reichweite, jeweils auch in Gegenrichtung. Solide Möbel und Wände dürfen die Endpunkte nicht belegen; zusätzliche Sichtblocker werden ausgeschlossen. Neutrale Personen werden für diese isolierte Geometrieprüfung ausgeblendet.
- Browsermatrix mit 15 Suchenden × neun Möbeltypen pro Browser. Zusätzlich prüfen wir sichtbare reservierte Spielerkacheln und reservierte Beobachterkacheln sowie gelbe Warnung, Rot ab 300 ms und Fang ab 600 ms.
- Gerenderte Kontrollaufstellungen aller neun Möbeltypen mit der echten Szene, ihren Möbelgrafiken und der normalen Aktualisierung. Blockierende Möbel verhindern die Entdeckung über 800 ms; eine anschliessende freie Sichtlinie führt wieder zu Warnung und Fang. Diese Kontrollaufstellungen gelten nur im Testbrowser.
- Originalkarte: Product Owner im Windows Client Team und Spielfigur auf entgegengesetzten Seiten des dortigen Tischs. Verdeckte Spielfigur bleibt unerkannt; nach Wechsel auf eine freie Sichtlinie folgen Rotwarnung und Fang. Figurenpositionen sind kontrolliert gesetzt; es handelt sich nicht um einen vollständigen Fluchtversuch oder den Nachweis, dass die Patrouille diese Position regulär besucht.
- Chromium, Firefox und mobiles Chromium. Screenshots der Originalkarte vor und nach dem Hervortreten visuell geprüft. Kein echter iPhone-/Safari-Test.

## Originalkarte: geometrische Sichtachsen

Die letzte Spalte verlangt zusätzlich mindestens einen nach den Bewegungsregeln erlaubten Suchenden-Standort. Sie beweist keinen regulären Patrouillenhalt an dieser Position. Zählung ohne umgekehrte Blickrichtung; verschiedene Endpunktpaare zählen getrennt.

| Möbeltyp | Objekte | Freie Sichtachsen | Mit erlaubtem Suchenden-Standort |
|---|---:|---:|---:|
| Pflanze | 31 | 0 | 0 |
| Tisch | 15 | 233 | 171 |
| Sideboard | 7 | 0 | 0 |
| Drucker | 2 | 0 | 0 |
| Kaffeemaschine | 4 | 4 | 0 |
| Stuhl | 114 | 1187 | 543 |
| Leinwand | 13 | 13 | 6 |
| Whiteboard | 7 | 21 | 21 |
| Abfalleimer | 4 | 0 | 0 |

## Wiederholen

```sh
npm test
npm run test:browser -- --grep "furniture|actual-map table"
```

Die 41 Node-Tests, neun gezielten Möbel-Browserfälle und alle 18 bisherigen Browserfälle sind erfolgreich. Der Firefox-Belastungstest mit 30 Szenenneustarts überschritt zunächst das 30-Sekunden-Testbudget; mit 60 Sekunden Budget bestand die gezielte Wiederholung in 19,5 Sekunden. Build und Diff-Prüfung erfolgreich; der bestehende Bundle-Grössenhinweis bleibt. JSON-Zählbericht und Screenshots entstehen beim gezielten Testlauf unter `test-results/`; weitere Testläufe können diese Artefakte ersetzen. Einzelheiten stehen im Entwicklungsplan.
