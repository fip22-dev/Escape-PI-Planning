# Feedback im Spiel und automatische Lösungsvorschläge

Stand: 12.11.2026. **Teilweise erledigt – Issue-Eingang implementiert und technisch geprüft. Offen – Merge/öffentliche Veröffentlichung und KI-/PR-Automation.** Der Nutzer wählt Variante 2: Formulare im Spiel erstellen über einen Backend-Dienst GitHub-Issues ohne GitHub-Anmeldung der Spieler. Dies ersetzt die Planung externer GitHub-Formulare. Beschriftung und Platzierung des Einstiegs sind vom Nutzer festgelegt; die einfache Formularausgestaltung ist als Planung dokumentiert. Die lokale und iPhone-Abnahme ist am 12.11.2026 vom Nutzer bestätigt; einzelne Geräte- und Testdetails wurden nicht separat genannt. Aktuelle Betriebsgrenzen und Prüfungen stehen in FEEDBACK_OPERATIONS.md.

## Späterer Umsetzungsauftrag

«Feedback und Issue-Automation gemäss FEEDBACK_AUTOMATION_PLAN.md umsetzen» umfasst Formulare, Backend, GitHub-Anbindung, Analyse, testbare Draft-PRs und die folgenden Prüfungen. Die Planung vom 11.11.2026 umfasste nur Dokumentation auf main. Am 12.11.2026 hat der Nutzer ein eigenes InsForge-Projekt erstellt und dessen lokale Verknüpfung beauftragt; Einrichtung auf feature/insforge-feedback-setup. Formulare, Datenbank, Issue-Eingang und Wartung sind inzwischen umgesetzt; KI-/PR-Workflows bleiben offen.

Merge und Veröffentlichung bleiben manuelle Entscheidungen. Anhänge, Screenshots als Upload, Kontaktfelder, E-Mail-Antworten und ein öffentliches Feedback-Portal gehören nicht zur ersten Version.

## Oberfläche und Spielzustand

Ein gemeinsamer Button **«Bug / Feature melden»** steht ausserhalb des Spielfeldes bei den Bedienelementen neben **Pause / Weiter** und **Neustart**. Er bleibt im Startmenü und während des Spiels sowie auf Smartphones in normaler Ansicht und Grossansicht erreichbar. Auf schmalen Ansichten darf die Beschriftung innerhalb desselben Buttons umbrechen; sie wird nicht auf ein Fragezeichen oder «Feedback» verkürzt. Keine zusätzlichen Einträge im Start- oder Pausenmenü. Der Button öffnet zuerst eine Auswahl **«Bug» / «Feature»**; die Auswahl öffnet das jeweilige HTML-Formular ohne neuen Tab. «Zurück» im Formular führt zur Auswahl und erhält den Entwurf während dieses Dialogbesuchs; beim Wechsel des Typs getrennte Entwürfe verwenden. Abbrechen/Schliessen beendet den Dialog gemäss den folgenden Regeln. Dunkelgrüner Hintergrund, goldene Überschrift, helle Texte, einspaltige Felder mit sichtbaren Labels. Desktop maximal 640 CSS-Pixel breit, mobil bildschirmbreit mit Safe Areas und vertikalem Scrollen; Touch-Ziele mindestens 44 × 44 CSS-Pixel.

Bereits das Öffnen der Auswahl während einer Runde pausiert Timer, Figuren und zeitabhängige Dialog-/Sprechblasenzustände; gehaltene Eingaben werden gelöscht. Schliessen führt ins weiterhin pausierte Pausenmenü zurück; Fortsetzen erfolgt bewusst. Aus dem Startmenü dorthin zurückkehren. Kein Neustart oder Fortschrittsverlust. Fang-/Ergebnisdialoge zuerst abschliessen, keine gestapelten Dialoge.

Auswahl und Formulare liegen ausserhalb der virtuell gedrehten Spielbühne und bleiben zur tatsächlichen Bildschirmorientierung lesbar. Bildschirmtastatur und Visual Viewport berücksichtigen. Bestehende Textauswahl-, Kontextmenü- und Touch-Sperren für die gesamte Formularoberfläche ausnehmen. Phaser-Kürzel während Eingabe deaktivieren: WASD, M, T, F, Enter und Leertaste dürfen Texteingaben nicht beeinflussen. Enter im Textfeld sendet nicht versehentlich. Tab-Reihenfolge, sichtbarer Fokus, Fokusbindung und Rückkehr zum Auslöser, Feldfehler und Screenreader-Status vorsehen. Escape entspricht Abbrechen, soweit es nicht zuerst natives Vollbild beendet; keine doppelte Aktion.

## Formular «Bug»

Einleitung: «Was funktioniert nicht wie erwartet?»

| Feld | Pflicht | Vorgabe |
| --- | --- | --- |
| Titel | Ja | 5–120 Zeichen; Beispiel: Steuerkreuz reagiert nach Pause nicht |
| Beschreibung | Ja | 10–5000 Zeichen; mehrzeilig |

Kurzer Hinweis unter Beschreibung: «Was passiert und was sollte stattdessen passieren? Wenn möglich, beschreibe kurz, wie man den Bug auslösen kann.» Diese Angaben sind Hilfestellungen innerhalb eines einzigen Freitextfelds, keine zusätzlichen Pflichtfelder. Keine Auswahlfelder für Häufigkeit oder Schweregrad.

## Formular «Feature»

Einleitung: «Was würdest du dir für das Spiel wünschen?»

| Feld | Pflicht | Vorgabe |
| --- | --- | --- |
| Titel | Ja | 5–120 Zeichen; Beispiel: Übersicht der Schlüsselräume |
| Beschreibung | Ja | 10–5000 Zeichen; mehrzeilig |

Kurzer Hinweis unter Beschreibung: «Beschreibe deinen Wunsch und was dadurch besser würde.» Kein separates Nutzen- oder Lösungsfeld.

Beide Formulare besitzen damit genau zwei inhaltliche Pflichtfelder. Die bereits vorgesehene gemeinsame Hinweisbestätigung und die ausklappbaren technischen Angaben bleiben erhalten. Weniger Eingabeaufwand hat Vorrang vor einem vollständigen Fragenkatalog; die automatische Analyse kennzeichnet fehlende Informationen, statt sie zu erfinden.

## Gemeinsame Angaben und Versandzustände

Ausklappbarer Abschnitt «Technische Angaben» mit aktivierter, abschaltbarer Option «Technische Angaben mitsenden». Vor Absenden genau anzeigen: Build-Kennung, Browser-/Betriebssystemfamilie soweit erkennbar (automatisch erkannt, sonst unbekannt), Viewport, Ausrichtung, Eingabeart und aktuelle Spielansicht. Beim Bug zusätzlich Raum/Position, verbleibende Sekunden und Schlüsselanzahl als Momentaufnahme beim Öffnen. Keine Cookies, Tokens, vollständigen URLs, Referrer, Konsolenlogs, Namen oder E-Mail-Adressen. Bei abgeschalteter Option nur Formularinhalt, Typ und zufällige Meldungs-ID senden. Keine Übermittlung während des Ausfüllens.

Aktuell implementierter Hinweis: «Deine Meldung wird als öffentliches GitHub-Issue gespeichert. Eine spätere automatische KI-Analyse ist geplant und noch nicht aktiv. Bitte keine persönlichen oder vertraulichen Angaben eintragen. Zum Absenden brauchst du kein GitHub-Konto.» Pflichtbestätigung: «Ich habe den Hinweis zur Speicherung und geplanten automatischen Analyse gelesen». Nach Einrichtung der KI-Verarbeitung den Hinweis entsprechend aktualisieren. Dies ersetzt keine gegebenenfalls erforderliche Datenschutzerklärung des Betreibers.

Unten «Abbrechen» sowie primär «Bug senden» beziehungsweise «Feature senden». Validierung bei Absenden, dann nach Korrekturen; Eingaben bei Fehlern erhalten. Während Versand «Wird gesendet …» und Absenden sperren. Erfolg erst nach bestätigter GitHub-Anlage: «Danke! Deine Meldung wurde als Issue #123 gespeichert.» Dazu «Issue auf GitHub öffnen» und «Zurück». Bei privatem Repository ergänzen: «Zum Öffnen ist GitHub-Zugriff nötig. Deine Meldung ist bereits angekommen.» Kein Versprechen einer Lösung oder Bearbeitungsfrist.

Abbrechen mit geändertem Inhalt fragt «Entwurf verwerfen?» mit «Weiter bearbeiten» / «Verwerfen». Entwurf nur im Arbeitsspeicher bis Schliessen/Neuladen; nach Erfolg löschen. Bei Offline, Timeout oder Serverfehler verständliche Meldung und «Erneut versuchen»; bei Begrenzung Wartezeit nennen. Bei unklarem Ausgang dieselbe Meldungs-ID behalten.

## Backend und Betrieb

Sites-Demo und später GitHub Pages benötigen einen separaten HTTPS-Dienst; das statische Spiel enthält keine GitHub-Secrets. Festgelegt ist ein eigenes InsForge-Projekt mit Backend-Funktion und PostgreSQL für atomare Versandzustände und Limits. Das Projekt ist verknüpft; Function, Datenbankstruktur, GitHub-Secrets und erlaubte Origins sind eingerichtet und technisch geprüft. KI-Zugang bleibt offen. KI-Anbieter und Modell sind noch nicht eingerichtet.

`POST https://6r53f4ec.function2.insforge.app/game-feedback`: JSON mit `schemaVersion: 1`, `submissionId` (UUIDv7, maximal sieben Tage alt), `kind` (`bug`/`feature`), `title`, `description`, `consent: true`, optional `technical` und leeres Honeypot-Feld `website`. Serverseitig Schema, Trim, Pflichtwerte, Längen (Titel 5–120, Beschreibung 10–5000 Zeichen nach Trim), Enums und maximal 24 KiB Body prüfen; unbekannte Felder ablehnen. Client bestimmt weder Repository noch Labels, Priorität, Prompt oder Workflow. Keine beliebigen Datei-/URL-Abrufe. CORS nur für konfigurierte Demo-/Produktions-/Test-Origins; CORS ersetzt keine Missbrauchsbegrenzung.

Antworten: 201 mit `issueNumber`, `issueUrl`, `submissionId` nach Anlage; 200 für bereits bestätigte gleiche Meldung; 202 mit Wiederholungsfrist bei laufender/ungeklärter Anlage; 400 ungültig, 409 gleiche ID mit anderem Inhalt, 413 zu gross, 429 mit Retry-After, 503 vorübergehend nicht verfügbar. Keine internen GitHub-Fehler oder Secrets zum Browser.

Atomare Sperre je Meldungs-ID, Zustände pending/created/uncertain. GitHub-Issue-API hat keinen hier vorausgesetzten Idempotenzschlüssel: nach Timeout nicht blind erneut erstellen. Eindeutigen Submission-Marker im Issue suchen, bei Unklarheit 202 und serverseitigen Abgleich verwenden; keine Exactly-once-Garantie behaupten. Unbehebbare Unklarheit zur manuellen Klärung protokollieren.

Implementierte Limits: fünf neue Meldungen je festem Zehn-Minuten-Zeitfenster insgesamt und 100 neue Meldungen pro UTC-Tag. Ohne belegte vertrauenswürdige Client-IP gilt ein gemeinsamer täglicher HMAC-Zähler; keine IP-Verarbeitung. Status-/Wiederholungsabfragen: 60 je Zehn-Minuten-Fenster. Quoten nach 24 Stunden bereinigen. Versandzuordnung sieben Tage aufbewahren; danach alte IDs anhand Marker abgleichen oder mit 409 verständlich ablehnen. Logs enthalten keine Formulardaten/Secrets; Plattformlog-Aufbewahrung vor öffentlicher Beta noch prüfen; GitHub-Issues bleiben bis manueller Löschung. Honeypot, serverseitige Limits und abschaltbarer Versand. Datenschutz, KI-Datenverarbeitung und Aufbewahrung vor Beta-Freischaltung sichtbar dokumentieren.

## Issue-Format und GitHub-Zugang

Ziel fest `fip22-dev/Escape-PI-Planning`. Backend-GitHub-App nur auf diesem Repository, Issues:write, keine Contents-Schreibrechte. Privater Schlüssel im Secret-Speicher, kurzlebige Installationstokens; keine Secrets im Frontend oder in VITE-Variablen. PR-Publikation erhält eine getrennte Identität/Berechtigung.

Titelpräfix `[Bug]` / `[Feature]`. Serverseitige Labels `feedback:game`, `triage:pending`, zusätzlich `bug` / `enhancement` für Bug beziehungsweise Feature; bei Einrichtung anlegen. Das GitHub-Label enhancement bleibt die technische Zuordnung für Features. Body enthält Titel und Beschreibung, optionale technische Angaben, schemaVersion und Submission-Marker. Benutzereingaben sind untrusted data; Steuerzeichen und unerwünschte Erwähnungen neutralisieren. Bot ist Issue-Autor; kein Spieler-GitHub-Konto erforderlich. Private Issue-Links können für Spieler unzugänglich sein.

## GitHub Action: Analyse bis Draft-PR

GitHub Actions orchestriert. Inhaltliche Analyse und Codeänderungen erfordern zusätzlich einen KI-/Coding-Dienst samt Zugang und Kostenbudget. Dienst/Modell und Action bei Umsetzung anhand aktueller offizieller Dokumentation auswählen und fest versionieren. Keine automatische Zusammenführung oder Veröffentlichung.

1. **Eingang:** Workflow auf `issues: opened`, Definition auf main. Nur Issues der konfigurierten Feedback-App mit Herkunftslabel automatisch verarbeiten; App-/Actor-ID prüfen, kopierbarer Marker genügt nicht. Andere Issues nur durch manuellen Maintainer-Start.
2. **Analyse:** Vertrauenswürdigen main-Commit und Issue-Snapshot festhalten; Verständlichkeit, mögliche Duplikate, betroffene Bereiche, Reproduktionsschritte und Akzeptanzkriterien ermitteln. Bot-Kommentar mit Snapshot und Unsicherheiten; `triage:needs-info` bei fehlenden Angaben, `triage:possible-duplicate` bei möglichem Duplikat. Keine automatische Schliessung.
3. **Lösung:** Bei ausreichend klaren, begrenzten Bugs und Features automatisch isolierten Patch auf aktuellem main vorbereiten. Features müssen zum dokumentierten Spielumfang passen. Unklare Designänderungen, grosse Umbauten, Abhängigkeiten, Infrastruktur oder Berechtigungsänderungen: `triage:needs-decision` mit konkreter Frage statt spekulativem Patch.
4. **Prüfung:** `npm ci`, `npm test`, `npm run build`, relevante Browserfälle über `npm run test:browser`; bei Fehlerbehebung sinnvoller Regressionstest. Sichtbare Änderungen mit Screenshots prüfen, betroffene MD-Dateien mitführen. Fehler/blockierte Prüfungen ausdrücklich nennen; höchstens ein Korrekturdurchlauf. Automatisierung bestätigt keine echte iPhone-Abnahme.
5. **Bereitstellung:** Branch `automation/issue-<nummer>` und höchstens ein Draft-PR je Issue. Beschreibung mit Issue-Link, Änderung, Akzeptanzkriterien, exaktem Head-Commit, Testergebnis und verbleibenden Risiken. Fehlerhafte Tests deutlich kennzeichnen; ohne brauchbaren Patch nur Analysekommentar. Keine Änderungen direkt auf main.
6. **Nutzertest:** PR enthält Checkout-/Startbefehle und konkreten Testablauf. Separate private Testdemo nur nach Auftrag; bestehende abgenommene Demo nicht ersetzen. Maintainer prüft, beauftragt Korrekturen und entscheidet über Merge/Publikation.

Bot-Kommentare, Änderungen und Labels lösen keine Schleife aus. Wiederholung per `workflow_dispatch` mit Issue-Nummer nur für Maintainer; aktuellen Snapshot bewusst übernehmen. Concurrency pro Issue, vorhandenen PR prüfen. Defaults: ein Issue gleichzeitig, maximal drei automatische Lösungsläufe täglich, 15 Minuten Analyse, 30 Minuten Patch/Tests, globaler Kill-Switch. KI-Kostenlimit vor Aktivierung hart konfigurieren; bei Budgetende weiter Issues annehmen, Verarbeitung als ausstehend kennzeichnen.

Issue-Text ist auch für den Coding-Agenten untrusted input: keine darin enthaltenen Befehle/Anweisungen ausführen. Analyse-/Patch-Umgebung ohne GitHub-Schreibtoken, Backend-Schlüssel oder Deployment-Secrets. KI über begrenzten Vermittlungsdienst, Code-/Testprozesse ohne Provider-Secrets. Jobs standardmässig read-only. Separater Publisher prüft Diff/Pfade und darf mit kurzlebigem App-Token nur Automation-Branch/Draft-PR schreiben. `.github/`, AGENTS.md, Secret-/Hostingkonfiguration und Abhängigkeitsdateien von automatischen Änderungen ausschliessen; manuelle Bearbeitung nötig. Keine privilegierten Checkouts untrusted Codes via pull_request_target/workflow_run; Tests isoliert ohne Secrets.

Issue-Eingang und PR-Publikation über geeignete App-Identitäten; Folge-Workflows nicht blind auf GITHUB_TOKEN-Ereignisse stützen. GitHub schränkt diese ein. Interne Tests und tatsächlich ausgelöste PR-CI separat nachweisen; aktuelle Triggerregeln bei Umsetzung erneut prüfen.

## InsForge-Einrichtung

**Teilweise erledigt – Backend-Einrichtung am 12.11.2026:** Eigenes Projekt Escape-PI-Planning, ID d2052f33-4ee5-408c-822a-44abdf9c9c53, Region eu-central, API-Basis https://6r53f4ec.eu-central.insforge.app. CLI-Anmeldung erneuert und Repository erfolgreich verknüpft; CLI current bestätigt Projekt und Region. Die lokale Datei .insforge/project.json ist durch .gitignore ausgeschlossen. Die CLI hat den InsForge-Abschnitt in AGENTS.md ergänzt. Für diese Sitzung wurde Node.js v22.23.5 portabel im temporären Ordner eingerichtet und das Archiv gegen die offizielle SHA256-Liste geprüft; keine systemweite Installation.

**Erledigt – Secrets und lesender GitHub-Verbindungstest am 12.11.2026:** GITHUB_APP_PRIVATE_KEY, GITHUB_APP_ID, GITHUB_INSTALLATION_ID und GITHUB_REPOSITORY wurden per CLI im InsForge-Secret-Speicher angelegt. Der Schlüssel ist nach erkanntem Windows-CLI-Transportfehler als vollständige Base64-PEM-Fassung hinterlegt und zurückgelesen geprüft. Der PEM-Inhalt wurde weder ausgegeben noch ins Repository kopiert. Die App escape-pi-planning-issue (5715580), Installation 180952248 für fip22-dev, verwendet ausgewählte Repositorys und die Berechtigungen Issues:write sowie Metadata:read. Ein explizit auf Escape-PI-Planning begrenztes Installationstoken konnte Repository-Metadaten und Issues lesen und wurde danach widerrufen. Das Zielrepository ist öffentlich, Issues sind aktiviert. Schreibberechtigung und tatsächliche Issue-Anlage aus der bereitgestellten Function sind inzwischen mit #18/#19 und dem Browserpfad #20 bestätigt; Test-Issues geschlossen.

**Teilweise erledigt:** Datenbank, Backend-Funktion, Formulare, Origins, Limits und Wartung implementiert. Technische Prüfungen und echter Browser-Versand erfolgreich; Bisheriger lokaler Stand vom Nutzer bestätigt; private Demo am 12.11.2026 aktualisiert. iPhone-Abnahme vom Nutzer bestätigt; Merge offen. Siehe FEEDBACK_OPERATIONS.md. Eine Bestenliste bleibt eine spätere Erweiterung. GitHub Pages ist weiterhin das geplante, noch nicht eingerichtete Hosting des statischen Spiels.

## Vorbereiteter GitHub-Zugang und Wiederaufnahme

**Prüfhinweis 12.11.2026:** Alle vier GITHUB-Secrets sind laut CLI aktiv. InsForge `memory remember` war durch den aktuellen Tarif blockiert (AI nur in kostenpflichtigen Plänen); der Einrichtungsstand ist deshalb in diesen MD-Dateien festgehalten. Kein Tarifwechsel vorgenommen.

**Erledigt – GitHub-App eingerichtet und geprüft am 12.11.2026:** Der Nutzer hat die App erstellt, installiert und einen privaten Schlüssel als PEM heruntergeladen. Installation und Berechtigungen wurden am 12.11.2026 per API bestätigt; lesender Zugriff sowie tatsächliche Issue-Anlage inzwischen erfolgreich. Nicht geheime Kennungen:

| Einstellung | Wert |
| --- | --- |
| Besitzer | fip22-dev |
| App-ID | 5715580 |
| Client-ID | Iv23liLfo8JIDweueMbI |
| Installation-ID | 180952248 |
| Installationsverwaltung | https://github.com/settings/installations/180952248 |

App-Name: escape-pi-planning-issue. Der PEM-Schlüssel bleibt beim Nutzer und gehört weder in Chat noch Repository. Im InsForge-Secret-Speicher als `GITHUB_APP_PRIVATE_KEY` hinterlegt; Konfiguration `GITHUB_APP_ID=5715580` und `GITHUB_INSTALLATION_ID=180952248`. Kein Client Secret für den geplanten Installationstoken-Ablauf erforderlich.

**Offen – nächster Arbeitsschritt:** Den abgenommenen Feature-Stand über PR #22 nach main übernehmen; danach KI-Analyse einrichten oder öffentliche Spielveröffentlichung vorbereiten. KI-Zugang, Budget und KI-/PR-Automation separat einrichten. Backend, atomare Versandzustände, Formulare und echte Issue-Anlage sind technisch geprüft.

Aktueller GitHub-Navigationsweg für weitere Schlüssel: persönliche Settings → Developer settings → GitHub Apps → Edit → Credentials → Key pairs → New key. Die alte Bezeichnung «Private keys → Generate a private key» kann in anderen Ansichten noch vorkommen. [GitHub-Schlüsselverwaltung](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/managing-private-keys-for-github-apps).

## Umsetzungsreihenfolge und Abnahme

Gesamtstatus **Teilweise erledigt**. Aktueller Stand der Umsetzung:

1. **Teilweise erledigt:** Projekt, öffentliches Repository, App, Labels, Secrets, Origins und Versandquoten eingerichtet; Datenschutzhinweis/Log-Aufbewahrung für öffentliche Beta sowie KI-Dienst/Kostenlimit offen.
2. **Erledigt – technischer Backend-Eingang:** Schema, Limits, Versandzustände, parallele SQL-Claims, Zugriffssperren und echte Test-Issues geprüft. Wartungszeitplan aktiv, geschützter Aufruf erfolgreich.
3. **Erledigt – Implementierung und Geräteabnahme:** Button, Typauswahl, Formulare, Spielpause und Eingabeausnahmen implementiert und in Chromium, Firefox sowie mobilem Chromium geprüft. iPhone-/Safari-Abnahme am 12.11.2026 vom Nutzer bestätigt.
4. **Offen:** Analyse mit Test-Issues aktivieren, dann isolierte Patch-/Testphase und Publisher. Je einen klaren Bug und ein kleines Feature bis zum Draft-PR nachweisen.
5. **Teilweise erledigt:** Echter Chromium-End-to-end-Versand und Betriebsdokumentation vorhanden. Bisheriger lokaler Stand vom Nutzer bestätigt; private Demo mit neuem Button veröffentlicht. iPhone-Abnahme vom Nutzer bestätigt; öffentliche Beta-Veröffentlichung offen. Das Spiel enthält ausschliesslich die öffentliche Backend-URL, keine Secrets.

Abnahme: Button mit exakter Beschriftung «Bug / Feature melden» ausserhalb des Spielfeldes bei der Steuerung in Startansicht und Spiel erreichbar, einschliesslich mobiler Grossansicht; keine zusätzlichen Menüeinträge. Typauswahl führt zum richtigen Formular; Zurück, Typwechsel und Abbrechen verlieren keine Entwürfe ohne Bestätigung. Beide Formulare zeigen ausschliesslich Titel und Beschreibung als inhaltliche Pflichtfelder; Hilfetexte verlangen keine weiteren strukturierten Antworten. Beide Typen mit korrekten Inhalten/Labels ohne GitHub-Konto absendbar; Metadaten abwählbar, keine Daten vor Absenden; private Links erklärt; Pflichtwerte/Limits serverseitig geprüft; Doppelklick, Timeout nach GitHub-Erfolg und Retry ohne zweites Issue im geprüften Zeitraum; unklarer Ausgang ehrlich angezeigt; offline/429/503 verständlich, Text bleibt erhalten. Spielzustand/Timer bleiben erhalten; Schreiben, Fokus, Scrollen, Bildschirmtastatur, Safe Areas und Rotation funktionieren in normaler/grosser Hoch-/Queransicht.

Automation: echter App-Issue-Trigger, fremde Issues ignoriert, keine Bot-Schleifen, Prompt-/Shell-Injection-Gegenfälle, Limits/Kill-Switch, needs-info/needs-decision/Duplikat, erfolgreiche und fehlschlagende Tests, ein Draft-PR je Issue, keine Secrets/geschützten Pfade im Patch/Log, ausgelöste PR-CI, lokale Testanleitung und kein automatischer Merge/Deploy. Blockierte Prüfungen als offen/teilweise kennzeichnen.

## Prüfstand der Planung

**Erledigt – Dokumentationsprüfung am 11.11.2026:** Fetch erfolgreich, main synchron mit origin/main, keine offenen PRs. Alte Remote-Kandidaten game-design-roadmap und graybox-map betreffen Grundlagen, keine offene Feedback-Implementierung. README, GAME_DESIGN und DEVELOPMENT_PLAN sind auf dieses Konzept abgestimmt; Diff und Verweise geprüft. Bezeichnungen auf Bug/Feature und beide Formulare auf Titel/Beschreibung reduziert; API, Issue-Präfixe und Abnahmekriterien entsprechend nachgeführt. Gemeinsamen Button «Bug / Feature melden» bei der Steuerung, nachfolgende Typauswahl und Erreichbarkeit in Startansicht/Spiel/Grossansicht statt zusätzlicher Menüeinträge dokumentiert. Keine Implementierung, Infrastrukturänderung oder Spiel-/Browserprüfung in diesem Schritt.

## Technische Quellen

- [GitHub REST: Issue anlegen](https://docs.github.com/en/rest/issues/issues#create-an-issue)
- [GITHUB_TOKEN und Folgeereignisse](https://docs.github.com/en/actions/concepts/security/github_token)
- [Script Injection](https://docs.github.com/en/actions/concepts/security/script-injections)
- [Sichere Verwendung von Actions](https://docs.github.com/en/actions/reference/security/secure-use)
- [App-Authentifizierung in Actions](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/making-authenticated-api-requests-with-a-github-app-in-a-github-actions-workflow)
