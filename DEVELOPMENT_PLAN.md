# Escape PI Planning – Development Plan

Dieses Dokument hält Umsetzungsreihenfolge und Fortschritt fest. Spielregeln, Karte, Rollen und Dialogtexte stehen in [GAME_DESIGN.md](GAME_DESIGN.md).

## Aktueller Stand

- Grundlage: Browser-Graybox mit WASD/Pfeiltasten, mitlaufender Kamera, sieben Teamzimmern, Pausenraum, fünf Meeting-Räumen und PI-Einführung.
- 37 neutrale Figuren sind als statische Platzhalter über Teamzimmer, Nebenräume, PI-Einführungsraum und Gänge verteilt.
- Timer, bewegliche Entdecker, Sicht- und Entdeckungslogik, Dialogabläufe, neutrale Laufwege, Sprechblasen und finale Grafik/Audio sind noch nicht umgesetzt.
- Der aktuelle Grundriss gilt als abgestimmt. Personenpositionen und Laufwege können nach Browser-Spieltests angepasst werden.
- Graybox-Korrekturen: Raumränder geschlossen; Öffnungen von Pausenraum, PI-Einführung und Ausgang zwei Kacheln breit, übrige Türen eine Kachel breit. Meeting 1 besitzt einen oberen und einen unteren Eingang.
- Aktiver Möbelstand: `feature/room-objects`, zur geräteübergreifenden Prüfung vorgesehen und ausdrücklich ungemergt. Offen bleiben visuelle Abnahme und konkrete neutrale Laufwege. Vor Tests auf einem anderen Client Remote-Stand und offene Pull Requests prüfen; Anleitung in README und verbindliche Regeln in AGENTS.md.

## Umsetzungsreihenfolge

Schritt 1 ist **Erledigt**; Schritt 2 ist **Teilweise erledigt**; Schritte 3–10 sind **Offen**. Teilabschlüsse und abgeschlossene Schritte werden direkt am jeweiligen Schritt gekennzeichnet; erforderliche Prüfungen werden mitgeführt.

1. **Erledigt – Graybox-Spieltest:** Vom Nutzer bestätigt. Beschriftungen sind gut platziert; teilweise verschwommene Schrift wird separat als offener Darstellungsfehler geführt. Weitere Personenanpassungen erfolgen mit Möbeln und Laufwegen.
2. **Teilweise erledigt – Raumobjekte und Laufwegplanung:** Erster Möbelvorschlag und Objektregeln implementiert: Sitzungstische mit Stühlen und kleinen Leinwänden in allen Team-/Meeting-Räumen sowie Pflanzen in Gangverbreiterungen, Stuhlreihen und Leinwand rechts neben der Tür im PI-Raum, Kaffeemaschine und Pflanzen links sowie zwei Tische und drei Kaffeemaschinen im Pausenraum. Bewegungskollision aktiv; Sichtblocker-Eigenschaften hinterlegt. Offen: visuelle Abnahme, Pflanzenpositionen abstimmen und konkrete neutrale Laufwege mit Halte-/Ausweichpunkten festlegen.

   Zusätzliche Büroobjekte sind ebenfalls implementiert: Whiteboards und Sideboards in Teamräumen, Druckerstation im Workplace Device & Print Solutions Team, vier Abfalleimer neben Kaffeemaschinen und Tischdetails. Keine zusätzlichen Wegweiser oder Ausgangsschilder. Sideboards/Drucker blockieren Bewegung und später Sicht; Abfalleimer nur Bewegung; Whiteboards und Tischdetails bieten keinen zusätzlichen Sichtschutz.
3. **Offen – Erste neutrale Personen bewegen:** Zunächst wenige repräsentative Personen in Räumen und Gängen mit festen Routen, versetzten Pausen und körperlicher Kollision umsetzen. Warten beziehungsweise Ausweichen bei belegten Wegen erproben. Keine Überlappungen, dauerhaft versperrten Türen oder blockierten Quergänge zulassen. Diesen Test vor dem RTE-Prototyp abschliessen.
4. **Offen – Spielschleife:** Fluchtstart, 180-Sekunden-Timer, Ausgang, Sieg- und Ablaufzustand sowie Neustart umsetzen.
5. **Offen – Entdeckungsmechanik:** Zuerst die RTE als Testrolle mit Route, Blickrichtung, Sichtblockern, Warnzeichen und Entdeckungs-Auslöser einbauen. Bewegte neutrale Personen als dynamische Sichtdeckung einbeziehen und prüfen, dass sie die Spielfigur verdecken und nach dem Vorbeigehen wieder sichtbar machen. Danach einzeln P&T, BO, PM, PO und SM ergänzen. Für jede Rolle Route, Startposition und Haltezeiten prüfen.
6. **Offen – Erwischtwerden und Neustart:** Für alle sechs Rollen Erst- und Wiederholungsdialoge einbauen, Überspringen ermöglichen, den Timer während eines Dialogs anhalten und den Versuch samt Figurenpositionen zurücksetzen. Auch neutrale Laufwege und Startpausen reproduzierbar zurücksetzen.
7. **Offen – Neutrale Personen vervollständigen:** Das erprobte Bewegungs- und Kollisionsverhalten auf die übrigen der insgesamt 37 Personen ausweiten und Sprechblasen ergänzen. Sichtdeckung, Cooldown, Timerverhalten sowie Verkehr mit allen Personen und Suchenden prüfen.
8. **Offen – Grafik und Audio:** Platzhalter durch eigene Pixelgrafik ersetzen, Musik und Effekte ergänzen und Stummschaltung anbieten.
9. **Offen – Beta-Feedback über GitHub Issues:** Issue-Formulare für Fehler und Feature-Ideen anlegen. Im Spiel gut auffindbare Aktionen **Fehler melden** und **Idee vorschlagen** ergänzen, die das jeweilige Formular in einem neuen Tab öffnen. Prüfen, dass die Beta-Tester das GitHub-Repository erreichen und Issues erstellen können.
10. **Offen – Abschlusstest und Veröffentlichung:** Auf den Zielbrowsern testen und danach GitHub Pages einrichten.

## Branch- und Merge-Regeln

- Vor jeder Änderung den Repository-Stand abgleichen und Differenzen sichtbar melden; nach Änderungen die betroffenen MD-Dateien und Aufgabenstatus aktualisieren. Die verbindlichen Einzelregeln stehen in [AGENTS.md](AGENTS.md).
- Einen Branch pro zusammenhängender Funktion oder lieferbarem Zwischenschritt anlegen, nicht pro kleinem Unterpunkt.
- Jeden Feature-Branch vom aktuellen `main` starten; keine Branches auf noch ungemergten Feature-Branches stapeln.
- Änderungen auf den Branch pushen, wenn sie auf anderen Geräten gebraucht oder zur Review bereitgestellt werden sollen.
- Nach Review und Prüfung per Pull Request nach `main` mergen.

## Abgeschlossene Grundlagen

- **Teilweise erledigt – Möbelvorschlag auf `feature/room-objects`:** Objektplatzierung, einfache Darstellung und Bewegungskollision implementiert. Pflanzen/Tische/Kaffeemaschinen blockieren Bewegung und sind als Sichtblocker markiert; Stühle/Leinwand bleiben passierbar ohne Sichtschutz. Neutrale Platzhalter auf soliden Möbeln werden im selben Raum versetzt. Acht Tests und Build erfolgreich: keine Möbelüberschneidungen, keine belegten Türen oder Wände, alle freien Bodenfelder weiterhin erreichbar. Browser-Abnahme und echte Sichtprüfung bleiben offen.

- **Erledigt – Reihenfolge für neutrale Personen abgestimmt:** Laufwegplanung mit der Möbelplatzierung verbunden und erster Bewegungs-/Kollisionstest vor den RTE-Prototyp gezogen. Bereichsregeln im Game Design ergänzt und MD-Dateien auf gleiche Reihenfolge geprüft. Laufwege, Bewegung und Sichtdeckung sind weiterhin nicht implementiert.

- **Erledigt – Graybox-Grundlage:** Bewegung, Wandprüfung, Kamera, Grundriss und 37 statische neutrale Personen sind im Code vorhanden. Prüfung: `src/scenes/GrayboxScene.js` und `src/game/map.js` mit dem dokumentierten Stand abgeglichen. Der Browser-Spieltest wurde vom Nutzer bestätigt.
- **Erledigt – Arbeitsregeln und Dokumentationspflege:** `AGENTS.md` angelegt und aus README sowie Entwicklungsplan verlinkt. Prüfung: Regeln und Verweise in den betroffenen MD-Dateien kontrolliert. Keine Änderung am Spielcode.

## Testprotokoll – 05.11.2026

- **Erledigt – Repository-Abgleich:** `git fetch origin` erfolgreich; Feature-Branch stimmt mit seinem Upstream und `origin/main` überein. Vorhandene uncommittete Dokumentationsänderungen bleiben erhalten.
- **Erledigt – Erreichbarkeit anhand der Kartendaten:** Vier-Richtungs-Suche vom Start bestätigt den erreichbaren Ausgang und erreichbare Türen sowie Raummitten aller 13 Seitenräume.
- **Erledigt – Fehler bei Raumbegrenzungen:** Aussenwände ergänzt; alle 13 Seitenräume sind nur durch ihre vorgesehenen Türdurchgänge zugänglich (Meeting 1 mit zwei Eingängen). Automatisierte Kartentests bestätigen Erreichbarkeit und Abschottung bei blockierten Türfeldern. Ausgang und Q1–Q3 bleiben ohne Durchquerung der Seitenräume erreichbar.
- **Erledigt – Türbreiten:** Pausenraum, PI-Einführung und Ausgang besitzen jeweils zwei nebeneinanderliegende begehbare Kacheln. Die übrigen Türen bleiben eine Kachel breit. Die zusätzliche Durchgangstiefe an Seitenräumen entsteht durch die Aussenwände und erhält die Raumflächen. Vier Kartentests mit `npm test` erfolgreich.
- **Erledigt – Entwicklungsumgebung und Build:** Portable Node.js 24.22.2 im temporären Bereich eingerichtet, offiziellen SHA-256-Prüfwert kontrolliert und Abhängigkeiten installiert. Vite-Server konnte auf `http://127.0.0.1:5173/` gestartet werden. `npm run build` erfolgreich; Hinweis auf grosses Phaser-Bundle bleibt bestehen. Die portable Laufzeit ist keine dauerhafte Systeminstallation.
- **Erledigt – Visueller Browser-Spieltest:** Vom Nutzer bestätigt; Beschriftungen sind gut platziert. Die zuvor blockierte automatisierte Browserprüfung wird dadurch durch den manuellen Nutzer-Spieltest abgedeckt. Teilweise verschwommene Schrift bleibt als separater Qualitätsmangel offen.
- **Erledigt – Designvorgabe nachgeführt:** Neutrale Personen bewegen sich künftig, sind körperliche Hindernisse und blockieren die Sicht suchender Rollen. Die Implementierung bleibt offen.
- **Erledigt – Ausgang verschoben:** Zwei Kacheln breiter Ausgang um eine Kachel nach links auf Spalten 33–34 verschoben, Beschriftung mitverschoben. Vier Kartentests und Produktionsbuild erfolgreich.
- **Erledigt – Eingänge Meeting 1:** Oberen Zugang von Q1 ergänzt und unteren Eingang zu Q2 beibehalten. Text bleibt links neben dem oberen Eingang. Vier Kartentests prüfen unter anderem beide Zugänge unabhängig voneinander; Tests und Build erfolgreich. Manueller Browser-Spieltest vom Nutzer bestätigt.
- **Teilweise erledigt – Lesbarkeit und freie Raumflächen:**
  - **Erledigt – Platzierung:** Beschriftungen ausserhalb der Raumflächen, Meeting 1–5 linksbündig am linken Wandrand, PI-Einführung rechts neben dem Eingang und M365 unterhalb. Steuerungshinweis aus dem Spielfeld entfernt. Der Nutzer bestätigt die gute Platzierung im Browser-Spieltest.
  - **Geprüft:** Produktionsbuild erfolgreich; manueller Spieltest vom Nutzer bestätigt.
  - **Offen – Schriftschärfe:** Beschriftungen sind teilweise verschwommen. Textdarstellung und Skalierung untersuchen, verbessern und im Browser bei Stillstand und Kamerabewegung erneut prüfen. Schriftgrösse und bestätigte Positionen dabei erhalten.
- **Erledigt – Lokalen Branch umbenannt:** `feature/graybox-refinements` beschreibt den tatsächlichen Umfang. Der Branch bündelt Graybox-Korrekturen, Kartentests und Dokumentationsregeln. Abschliessend vier Kartentests, Produktionsbuild und Diff-Prüfung erfolgreich; manueller Spieltest vom Nutzer bestätigt. Teilweise verschwommene Schrift bleibt offen.

- **Teilweise erledigt – Kleine Leinwände und Gangpflanzen:** In sieben Teamräumen je drei Kacheln breite, in fünf Meeting-Räumen je zwei Kacheln breite Leinwand ergänzt (PI: fünf Kacheln). Sieben Pflanzen an äusseren Rändern der Gangverbreiterungen ergänzt. Acht Tests und Build erfolgreich; alle freien Bodenfelder bleiben erreichbar, Türfelder sind unbelegt. Visuelle Abnahme bleibt offen.
- **Teilweise erledigt – Büroausstattung:** Sieben Whiteboards, sieben Sideboards, eine Druckerstation und vier Abfalleimer ergänzt. Alle 14 Tische mit Laptop, Unterlagen und Becher dekoriert. Acht Tests und Build erfolgreich; Objektregeln geprüft, keine unbeabsichtigten Möbelüberschneidungen, Türen frei und alle freien Bodenfelder erreichbar. Visuelle Abnahme und spätere Sichtlogik bleiben offen.
