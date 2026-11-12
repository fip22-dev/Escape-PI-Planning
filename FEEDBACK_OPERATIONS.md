# Betrieb des Feedback-Eingangs

Stand: 12.11.2026. **Teilweise erledigt:** Backend bereitgestellt und echter Browser-Versand bestätigt. Der Feedback-Eingang wurde auf `feature/insforge-feedback-setup` umgesetzt und ist lokal sowie auf iPhone vom Nutzer abgenommen. Die Integration in den Hauptstand erfolgt über PR #22. Die bestehende private Demo ist mit dem Feature-Stand aktualisiert; Nutzer bestätigt den bisherigen lokalen Stand als gut. KI-Analyse und Draft-PR-Automation sind nicht aktiviert.

## Architektur und lokale Nutzung

Das statische Spiel ruft `https://6r53f4ec.function2.insforge.app/game-feedback` auf. Die Function benutzt die GitHub-App `escape-pi-planning-issue` und erstellt Issues ausschliesslich in `fip22-dev/Escape-PI-Planning`. Es ist öffentlich; auch Meldungen sind öffentlich. Keine Spieleranmeldung erforderlich. GitHub Pages bleibt das geplante, noch einzurichtende Spielhosting; die bestehende private Sites-Demo wird durch einen Git-Push nicht verändert.

`npm run dev` startet das Spiel. Der öffentliche Endpunkt ist in `src/feedback.js` vorbelegt; `VITE_FEEDBACK_URL` kann ihn beim Build ersetzen. Nur die öffentliche URL darf ins Frontend, keine Admin-API-Keys oder GitHub-Schlüssel. Zum lokalen Test sind `http://localhost:5173`, `http://127.0.0.1:5173` und `http://127.0.0.1:5181` freigegeben. Weitere freigegebene Origins: `https://fip22-dev.github.io` und `https://escape-pi-iphone-safari-philippe.electgleam1.chatgpt.site`. Ein Origin gilt für die gesamte Domain, nicht nur einen URL-Pfad.

## Ressourcen und Zugang

**Erledigt – Demo-Veröffentlichung am 12.11.2026:** https://escape-pi-iphone-safari-philippe.electgleam1.chatgpt.site ist mit «Bug / Feature melden» und dem gesamten Feedback-Feature aktualisiert. Sites-Quelle `5dc745e5432b0516048a02abf314e224b3b01bad`, Version `appgprj_6af23d83574c81919296181569f39729~appgver_195b245321948191bb46ed8d7be876a3`, Deployment `appgdep_6af5f6a3ce9c81919eec1583aa13cd17` erfolgreich. Owner-private Zugang erhalten; funktioniert auch ausserhalb des Heimnetzes ohne laufenden PC. Die Site-Origin war bereits im Backend freigeschaltet. 71 Funktionstests und Build im Veröffentlichungssnapshot sowie beide gezielten mobilen Formularprüfungen erfolgreich. iPhone-Abnahme am 12.11.2026 vom Nutzer bestätigt.

**Erledigt – manuelle Nutzerabnahme am 12.11.2026:** Feature-Testserver mit `--host 0.0.0.0 --port 5173` gestartet. Zusätzlich ist `http://192.168.1.13:5173` als lokale WLAN-Test-Origin freigeschaltet; Backend nach Secret-Änderung erneut bereitgestellt. Spiel HTTP 200 und CORS-Preflight HTTP 204 mit passender Origin bestätigt. iPhone muss im gleichen WLAN sein; der PC und Testserver müssen laufen. Die Adresse ist vom lokalen Netzwerk/DHCP abhängig und keine dauerhafte Veröffentlichung. Der bisherige lokale Stand wurde vom Nutzer als gut bestätigt; iPhone-/Safari-Abnahme am 12.11.2026 vom Nutzer bestätigt.

- InsForge-Projekt: `d2052f33-4ee5-408c-822a-44abdf9c9c53`, Region `eu-central`.
- Function: `game-feedback`, Quellcode `functions/feedback.js`, SDK fest auf `1.5.2`.
- Tabellen: `feedback_submissions`, `feedback_limits` und `feedback_settings`, jeweils mit RLS und ohne Zugriffsrechte für `anon` oder `authenticated`.
- RPCs `feedback_claim`, `feedback_complete`, `feedback_maintenance` sind ausschliesslich für den administrativen Backend-Zugriff vorgesehen. Keine öffentlichen SECURITY-DEFINER-Helfer.
- GitHub-Secrets: `GITHUB_APP_PRIVATE_KEY`, `GITHUB_APP_ID`, `GITHUB_INSTALLATION_ID`, `GITHUB_REPOSITORY`, `GITHUB_APP_BOT_LOGIN`.
- Betrieb: `FEEDBACK_ENABLED`, `FEEDBACK_ALLOWED_ORIGINS`, `FEEDBACK_RATE_SECRET`, `FEEDBACK_MAINTENANCE_SECRET`.
- Plattform-Secrets `API_KEY` und `INSFORGE_BASE_URL` werden nur serverseitig verwendet. `.insforge/` bleibt von Git ausgeschlossen.

`GITHUB_APP_PRIVATE_KEY` enthält derzeit **Base64 des vollständigen PEM-Inhalts**. Beim ursprünglichen mehrzeiligen Windows-CLI-Aufruf wurde nur der Header gespeichert; das wurde beim echten Versandtest erkannt und korrigiert. Base64 ist eine Transportkodierung, keine zusätzliche Verschlüsselung. Die gespeicherte Base64-Fassung wurde mit dem Original verglichen und erfolgreich als privater Schlüssel geparst. Die Function unterstützt sowohl PEM als auch dessen Base64-Fassung. Neue Schlüssel ebenso direkt in den Secret-Speicher übertragen und zurückgelesen im Arbeitsspeicher prüfen; niemals Werte ausgeben oder committen. Die Störung wurde ohne Schlüssel oder Nutzerdaten an InsForge gemeldet (Referenz `129b3533-bd53-44c0-9f0d-42bee6c9a558`).

## Versand, Limits und Aufbewahrung

Der Endpunkt akzeptiert ausschliesslich POST-JSON bis 24 KiB mit Titel (5–120 Zeichen), Beschreibung (10–5000 Zeichen), Typ, Hinweisbestätigung und **UUIDv7**. Deren Zeitanteil ermöglicht, Meldungs-IDs nach sieben Tagen sicher mit 409 abzulehnen, statt sie nach der Bereinigung als neue Meldung anzulegen. Maximal fünf Minuten zukünftige Uhrabweichung. Ein optionales leeres Honeypot-Feld `website` und explizit erlaubte technische Felder sind zulässig. Unbekannte Felder werden abgelehnt.

Die SQL-Transaktion serialisiert Meldungs-ID und Quoten atomar. Standard: **fünf neue Meldungen je festem Zehn-Minuten-Zeitfenster insgesamt**, zusätzlich **100 neue Meldungen pro UTC-Tag insgesamt**. Wiederholungs-/Statusanfragen sind auf 60 je Zehn-Minuten-Fenster begrenzt. Bis der Host eine vertrauenswürdige Client-IP dokumentiert, gilt bewusst ein gemeinsamer, täglich abgeleiteter HMAC-Zähler. Es werden keine IP-Adressen verarbeitet oder gespeichert; gefälschte Forwarding-Header können die Quoten nicht umgehen. Die strengere gemeinsame Begrenzung kann mehrere Spieler gleichzeitig betreffen.

Vor einem GitHub-POST wird der Zustand `uncertain` gespeichert. Nach bestätigtem Erfolg folgt `created`; bereits bestätigte Wiederholungen liefern dasselbe Issue zurück. Fehler vor Beginn des POST dürfen erneut versucht werden. Bei unklarem POST-Ausgang erfolgt **kein automatischer zweiter POST**. Der Abgleich prüft in bis zu drei GitHub-Listenseiten Herkunfts-Bot und UUID-Marker. Nicht auflösbare Fälle bleiben unbestätigt und benötigen gegebenenfalls manuelle Klärung. Es gibt keine Exactly-once-Garantie.

Der geschützte Wartungsaufruf derselben Function benötigt `Authorization: Bearer <FEEDBACK_MAINTENANCE_SECRET>` und wird durch den aktiven Zeitplan `feedback-maintenance` alle 15 Minuten aufgerufen (ID `b46380a6-a8b5-47c3-93a7-f6998b3ddcd8`). Er gleicht bis zu 20 unbestätigte Einträge ab; die Auswahl rotiert über den letzten Prüfzeitpunkt. Er legt selbst keine Issues an. Versandzuordnungen werden nach sieben Tagen, Quoten nach 24 Stunden bei Wartung bzw. beim nächsten Eingang gelöscht; planmässige Toleranz bis 15 Minuten. GitHub-Issues bleiben bestehen. Datenbank speichert nur ID, Hash, Status, Zeitpunkte und Issue-Verweis, keine Formulartexte. Logs enthalten keine Meldungsinhalte oder Secrets; die Aufbewahrung der Plattformlogs ist vor öffentlicher Beta separat zu prüfen.

## Abschalten, Aktualisieren und Störungen

Sofortiger Versandstopp erfolgt über den zur Laufzeit geprüften Datenbank-Schalter:

```powershell
npx -y @insforge/cli db query "update public.feedback_settings set enabled=false where singleton=true"
```

Aktivieren mit derselben SQL-Abfrage und `enabled=true`. Der zusätzliche Secret-Schalter FEEDBACK_ENABLED wirkt erst nach erneuter Function-Bereitstellung und ist deshalb nicht der sofortige Betriebsschalter. Das wurde mit einer markierten Testmeldung geprüft und durch den sofort wirksamen Datenbank-Schalter ergänzt; dessen Test lieferte HTTP 503 ohne Issue-Anlage. Wartung darf weiterhin vorhandene Zustellungen abgleichen. Änderungen der Quoten erfolgen über eine neue Migration; bereits angewandte Migrationen nicht verändern. Function neu bereitstellen:

```powershell
npx -y @insforge/cli functions deploy game-feedback --file functions/feedback.js
npx -y @insforge/cli functions list
npx -y @insforge/cli schedules logs b46380a6-a8b5-47c3-93a7-f6998b3ddcd8
```

Bei 202 denselben unveränderten Entwurf erneut versuchen. Bei 429 angezeigte Wartezeit beachten. Bei 503 Zustand und Function-Logs prüfen; keine Secrets in Fehlerberichte kopieren. `uncertain` niemals ohne GitHub-Markerprüfung manuell zum erneuten Versand freigeben. Nach Secret-Rotation Wartungszeitplan aktualisieren, da InsForge Secret-Referenzen in Headern beim Anlegen/Aktualisieren auflöst.

## Prüfungen und verbleibende Abnahme

**Erledigt – automatisierte Prüfung 12.11.2026:** 71 Funktionstests und Produktionsbuild erfolgreich; bekannter Bundle-Grössenhinweis (ca. 1,29 MB) bleibt. Alle 72 anwendbaren Browserfälle wurden über Gesamtlauf und gezielte Wiederholungen erfolgreich geprüft, neun Fälle planmässig übersprungen (Plattformfilter und opt-in Live-Test). Der Gesamtlauf hatte zunächst 63 bestandene und neun fehlgeschlagene Fälle. Veraltete Startanleitungs-/Sprechblasen-Testannahmen wurden an das implementierte Verhalten angepasst; nach Änderungen am laufenden Vite-Server betroffene Fälle mit frischem Server wiederholt. Danach sechs frühere Fehlerfälle erfolgreich, anschliessend alle drei Sprechblasenfälle sowie die sechs finalen Formularfälle erfolgreich (9 passed). Kein erneuter vollständiger Gesamtlauf nach diesen gezielten Korrekturen. Desktop- und mobile Formular-Screenshots visuell kontrolliert. Separater echter Browser-Versand erfolgreich. Repository-Dateien auf enthaltene PEM-/Admin-Schlüssel geprüft; kein Treffer, lokale InsForge-Konfiguration ignoriert.

**Erledigt:** GitHub-App authentifiziert, beschränktes Installationstoken mit Issues:write/Metadata:read, echte Bug-/Feature-Issues [#18](https://github.com/fip22-dev/Escape-PI-Planning/issues/18) und [#19](https://github.com/fip22-dev/Escape-PI-Planning/issues/19); identische Wiederholung jeweils HTTP 200 mit derselben Issue-Nummer. Echter Chromium-Formularversand bis [#20](https://github.com/fip22-dev/Escape-PI-Planning/issues/20) erfolgreich. Herkunfts-Bot, Labels und Marker geprüft, die Test-Issues anschliessend geschlossen. Ein zusätzliches markiertes Issue #21 entstand beim Nachweis, dass Secret-Änderungen erst nach Bereitstellung greifen; auch dieses ist nach Prüfung geschlossen. Sechs parallele SQL-Claims lieferten eine Versandfreigabe und fünf wartende Antworten; anderer Inhalt 409, sechste neue Meldung im Testfenster 429. Testdatensätze bereinigt. Direkte Datenbank-/RPC-Rechte für anonyme Nutzer verweigert. Geschützter Wartungsaufruf HTTP 200, Zeitplan aktiv; erster automatischer Lauf am 12.11.2026 um 18:00 MEZ mit HTTP 200 erfolgreich.

Funktionstests: `npm test`. Formular-Browsertests: `npx playwright test tests/browser/feedback.spec.js`; prüfen getrennte Entwürfe, Metadaten-Abwahl, Texteingabe/Enter, Spielpause, Verwerfen, bestätigten Erfolg und unveränderten Retry in Chromium, Firefox und mobilem Chromium. Echter Testversand ist bewusst separat opt-in, da er ein öffentliches Issue anlegt:

```powershell
$env:FEEDBACK_LIVE_TEST='1'
npx playwright test tests/browser/feedback-live.spec.js --project=chromium
```

**Offen:** öffentliche Spielveröffentlichung; Plattformlog-Aufbewahrung und abschliessender Datenschutzhinweis vor öffentlicher Beta. KI-Dienst/Budget, automatische Analyse und Draft-PRs sind separat noch nicht eingerichtet. Der aktuelle Formularhinweis bezeichnet KI deshalb ausdrücklich als geplant und noch nicht aktiv.
