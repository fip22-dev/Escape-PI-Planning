# Gemeinsame Bestenliste

Stand: 12.11.2026. **Teilweise erledigt – implementiert und technisch geprüft auf feature/leaderboard; reale Nutzer-/iPhone-Abnahme und Merge offen.** Eigener PR, unabhängig von der noch offenen KI-Issue-Automation. Die bisherige private Demo bleibt zunächst auf dem abgenommenen Feedback-Stand.

## Verhalten

Nach einem erfolgreichen Run mit sieben Schlüsseln und gestartetem Fluchttimer erscheint ein HTML-Dialog mit der benötigten Zeit und dem Feld «Name / Pseudonym». Der Siegerdialog bietet genau zwei Aktionen: «Zeit eintragen» speichert; «Zurück ins Hauptmenü» beendet den Run ohne Eintrag. Eintragen ist freiwillig. Anschliessend wird die gemeinsame Top 20 angezeigt, ein eigener Eintrag dort hervorgehoben und der eigene Rang auch ausserhalb der Top 20 genannt. «Zurück ins Hauptmenü» beendet den Ergebnisablauf. Kein Eintrag nach Fang, Timeout oder Abbruch.

Im Hauptmenü steht «Bestenliste» direkt über «Infos & Credits» und öffnet jederzeit die Liste. Die Daten werden beim Öffnen geladen; einen zusätzlichen Button «Aktualisieren» gibt es nicht. Laden, leere Liste, Verbindungsfehler und erneuter Versuch erhalten klare Anzeigen. Namen werden als Text dargestellt. Dialoge bleiben in mobiler Grossansicht aufrecht, scrollbar und von Spielkürzeln getrennt.

Gewertet wird die bestehende Fluchtzeit ab Verlassen der PI-Einführung bis zum Sieg, ohne Pausenzeit. Anzeige `MM:SS.mmm`; intern ganze Millisekunden, schneller zuerst. Bei gleicher Zeit zuerst der früher gespeicherte Eintrag, danach die Run-ID als stabiler Tie-Breaker. Jeder Run besitzt eine neue zufällige UUID und darf genau einmal eingetragen werden. Bei unklarer Speicherbestätigung bleibt für einen Retry derselbe Run mit demselben Namen erhalten.

Namen sind nicht exklusiv: ohne Account kann niemand einen Namen beanspruchen, und mehrere Runs dürfen denselben Namen tragen. Namen/Pseudonyme und Zeiten sind öffentlich sichtbar; kein Spielerlogin, keine E-Mail. Name 2–24 Zeichen, Buchstaben/Ziffern/Leerzeichen/Punkt/Bindestrich/Unterstrich. Aktuelle Regelversion `team-keys-v1`; Zeiten anderer Regeln werden abgelehnt. Bei künftigen Änderungen an Karte, Bewegung oder Zeitmessung eine neue Ranglisten-Regelversion vorsehen. Die zufällige Schlüsselverteilung bleibt Bestandteil des Spiels.

## Backend und Grenzen

Eigenständige Function `game-leaderboard` unter `https://6r53f4ec.function2.insforge.app/game-leaderboard`, Quelle `functions/leaderboard.js`. `GET` liefert die Top 20; optional `?runId=<UUID>` aktualisiert zusätzlich den eigenen Rang. `POST` nimmt ausschliesslich `{runId,name,elapsedMs,ruleset}` bis 2 KiB an. Kein Admin-Key im Frontend. CORS erlaubt nur `LEADERBOARD_ALLOWED_ORIGINS`; öffentliche URL im Spiel, optionaler Build-Override `VITE_LEADERBOARD_URL`.

Neue Tabellen `leaderboard_runs`, `leaderboard_limits`, `leaderboard_settings` mit RLS und ohne direkte Rechte für anon/authenticated. Administrative RPCs `leaderboard_read` und `leaderboard_submit`; serverseitige Prüfung, atomare UUID-/Quota-Prüfung, keine Änderungen an Feedback-Tabellen. Gemeinsame Begrenzung: 20 neue Einträge je festem Zehn-Minuten-Fenster und 1000 pro UTC-Tag; keine IP-Verarbeitung. Wiederholung gleicher ID/Inhalt gibt denselben Run zurück, anderer Inhalt 409. In `leaderboard_settings` stoppt `enabled=false` neue Speicherungen sofort; Lesen bleibt möglich.

**Grenze:** Der Browser berechnet und meldet die Run-Zeit. Das Backend prüft Format, Wertebereich bis 180 Sekunden, Einmaligkeit und Quoten, kann aber nicht beweisen, dass ein Browser tatsächlich regelgerecht gewonnen hat. Dies ist eine lockere, nicht manipulationssichere Bestenliste. Serverautorisierte Spielsimulation/Replays und überprüfte Spieleridentitäten gehören nicht zu dieser Version.

Einträge bleiben gespeichert, bis der Betreiber sie gezielt löscht oder die Liste zurücksetzt. Für einen Löschwunsch benötigt er die öffentliche Run-ID bzw. Name und Zeit; ohne Account gibt es keinen Identitätsnachweis. Administrative Korrekturen nur gezielt und mit dokumentiertem Anlass. Betrieb und Plattformlogs vor öffentlicher Beta gemeinsam mit dem Feedback-Betrieb prüfen.

## Prüfstand

**Erledigt – technische Prüfung am 12.11.2026:** 76 Funktionstests und Produktionsbuild erfolgreich; bekannter Bundlehinweis bei ca. 1,30 MB. 33 relevante Browserfälle (Bestenliste, Feedback, Menü/Audio/Grafik, Vollbild und tatsächlicher Schlüssel-bis-Sieg-Übergang) über Regressionslauf und gezielte Wiederholungen in Chromium, Firefox und mobilem Chromium erfolgreich; sechs plattformbedingte Skips. Zwei Grafik-/Audiotests erreichten zunächst das 30-Sekunden-Limit; mit 60 Sekunden und unveränderten Prüfkriterien bestanden alle drei Profile. Abschliessend alle zwölf Bestenlisten-/Sieg-Fälle erneut erfolgreich. Menü-, Namenseingabe- und Listen-Screenshots auf Desktop und mobil visuell kontrolliert. Kein kompletter Lauf aller unberührten NPC-/Möbel-Browserfälle in diesem Schritt.

**Erledigt – echtes Backend:** Schreiben/Lesen, Sortierung und Gleichstand, Retry, Inhaltskonflikt, abgewiesene ungültige Werte/Origins, verweigerter direkter Gastzugriff und sofortiger Abschaltschalter geprüft. Sechs parallele Anfragen erzeugten eine Speicherung und fünf Wiederholungsantworten; beide Quoten atomar mit wiederhergestellten Originalzählern geprüft. Echter Chromium-Weg vom Siegerdialog über den Namen bis zur InsForge-Liste erfolgreich. Alle eigenen QA-Einträge gezielt entfernt; abschliessende Datenbankabfrage ergab null verbliebene QA-Zeilen. Keine echten Spielerzeilen verändert.

Live-Test bewusst opt-in (benötigt die bestehende administrative CLI-Anmeldung für seine gezielte Bereinigung):

```powershell
$env:LEADERBOARD_LIVE_TEST='1'
npx playwright test tests/browser/leaderboard-live.spec.js --project=chromium
```

**Offen:** reale PC-/iPhone-Nutzerabnahme, Merge und gesondertes Demo-Update. Die bestehende Demo bleibt unverändert auf dem abgenommenen Feedback-Stand. Die separate Function und Tabellen sind bereits im dedizierten InsForge-Projekt bereitgestellt.

**Erledigt – Siegerdialog angepasst am 12.11.2026:** Auf Nutzerwunsch genau zwei Aktionen: «Zeit eintragen» und «Zurück ins Hauptmenü». Der zusätzliche Weg ohne Eintrag direkt zur Liste entfällt; die Liste bleibt im Hauptmenü erreichbar. Neun Bestenlisten-Browserfälle in Chromium, Firefox und mobilem Chromium sowie Produktionsbuild erfolgreich; mobile Darstellung visuell kontrolliert. Reale Nutzerabnahme der Erweiterung bleibt offen.
