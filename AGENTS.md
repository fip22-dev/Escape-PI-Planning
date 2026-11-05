# Verbindliche Arbeitsregeln

Diese Regeln gelten für alle Arbeiten in diesem Repository.

## Vor jeder Änderung: Repository-Stand abgleichen

1. Diese Datei und die für die Aufgabe relevanten MD-Dateien lesen.
2. Mit `git status --short --branch` den aktiven Branch und lokale Änderungen prüfen.
3. Mit `git fetch origin` den aktuellen Remote-Stand abrufen. Danach den lokalen Branch mit seinem Upstream und für die Aufgabe mit `origin/main` vergleichen; Ahead-/Behind-Stand und relevante Unterschiede prüfen.
4. Bei Differenzen vor Änderungen eine sichtbare Warnmeldung ausgeben: betroffene Branches oder Dateien, Art der Abweichung und geplantes Vorgehen nennen. Das gilt auch für lokale uncommittete Änderungen, einen unerwarteten Branch und Widersprüche zwischen Code und Dokumentation. Erwartete Feature-Branch-Unterschiede als solche erklären.
5. Falls der Remote-Abgleich scheitert, ausdrücklich melden, dass die Aktualität nicht bestätigt werden konnte. Gespeicherte Remote-Referenzen nicht als aktuellen Remote-Stand ausgeben.
6. Bestehende Änderungen erhalten. Kein automatisches Überschreiben, Verwerfen, Reset, Merge oder Rebase zur Beseitigung einer Differenz. Sichere, unabhängige Arbeiten können fortgesetzt werden; bei Konflikten mit der Aufgabe zuerst die Klärung herbeiführen.
7. Auf dem passenden Feature-Branch arbeiten. Vorhandene Branches prüfen und verwenden, wenn sie zur Aufgabe gehören. Neue Branches vom aktuellen `main` starten.

## Bei jeder Änderung: Dokumentation mitführen

- Die betroffenen MD-Dateien im selben Arbeitsschritt wie die Implementierung aktualisieren, spätestens vor der Übergabe oder einem Commit.
- `README.md`: Einstieg, Startanleitung und zusammengefasster Projektstatus.
- `GAME_DESIGN.md`: Spielregeln, Gestaltung, Entscheidungen und Abgrenzung zwischen Entwurf und implementiertem Verhalten.
- `DEVELOPMENT_PLAN.md`: Fortschritt, offene Aufgaben, Umsetzungsreihenfolge und durchgeführte Prüfungen.
- `AGENTS.md`: verbindliche Arbeits- und Zusammenarbeitsregeln.
- Veraltete Aussagen ersetzen oder berichtigen. Dokumentation soll den aktuellen Stand beschreiben; reine Kommentare über eine Änderung ersetzen die inhaltliche Anpassung nicht.
- Auch bereits früher abgeschlossene, aber noch als offen dokumentierte Schritte anhand von Code und Prüfungen nachführen.
- Schritte eindeutig als **Offen**, **In Arbeit**, **Teilweise erledigt** oder **Erledigt** kennzeichnen. Bei Teilabschluss verbleibende Arbeiten benennen.
- **Erledigt** nur verwenden, wenn Umsetzung und erforderliche Prüfung nachweisbar abgeschlossen sind. Ein vorhandener Codeabschnitt belegt keinen erfolgreichen Browser-Spieltest.
- Bei erledigten Schritten knapp Ergebnis und Prüfung festhalten. Nicht durchgeführte oder blockierte Prüfungen ausdrücklich nennen.
- Vor Abschluss die betroffenen MD-Dateien auf Widersprüche untereinander und zum Code prüfen. Im Abschlussbericht Änderungen, Prüfungen und verbleibende offene Punkte nennen.
