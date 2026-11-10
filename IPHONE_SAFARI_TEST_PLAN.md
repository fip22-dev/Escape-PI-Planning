# iPhone-/Safari-Geräteabnahme

## Abschluss – 10.11.2026

**Erledigt – iPhone-/Safari-Abnahme am 10.11.2026:** Der Nutzer bestätigt den erfolgreichen Test des aktuellen Stands und gibt den Abschluss von `feature/iphone-safari-testing` sowie den Merge nach `main` frei. Kein neuer Entwicklungsbranch wird eröffnet. Die geplante Team-Schlüssel-Mechanik einschliesslich „So geht’s“ bleibt **Offen** und ist nicht implementiert.

Die Prüfliste ist aufgrund der ausdrücklichen Gesamtbestätigung des Nutzers abgeschlossen. Dies ist eine reale Nutzerabnahme, keine neu durch den Agenten ausgeführte Safari-Prüfung. Gerätemodell, genaue iOS-/Safari-Version, Zoom, Lautstärke und Einzelbefunde wurden nicht separat mitgeteilt und werden nicht ergänzt. Frühere offene Vermerke weiter unten bleiben als historischer Prüfverlauf erhalten.

## Zuordnung

- Abgeschlossener Arbeitsbranch: feature/iphone-safari-testing; Merge nach main vom Nutzer beauftragt.
- Freigegebene Spielbasis: main a199290e4b00ebb57029d59aafb5007eb4b2901a ([PR #14](https://github.com/fip22-dev/Escape-PI-Planning/pull/14)).
- **Erledigt – technische Hauptstand-Prüfung:** 45 Funktionstests, alle 51 Browserfälle in Chromium/Firefox/mobilem Chromium, Produktionsbuild und Diff-Prüfung erfolgreich. Das ist keine reale iPhone-/Safari-Abnahme.
- Eigene owner-private Testdemo, Site-ID: appgprj_6af23d83574c81919296181569f39729. Die alte Demo wird nicht mehr benötigt; ihre Löschung ist beauftragt und noch offen.
- **Erledigt – veröffentlicht:** Demo-Adresse: https://escape-pi-iphone-safari-philippe.electgleam1.chatgpt.site (owner-private; Publikationshistorie siehe unten).
- Anzeige zur Unterscheidung: iPhone/Safari-Testdemo · Basis a199290.
- Erstveröffentlichung: GitHub-Quellcommit: 2e46d805393633ffb9250989f122c261da061f45; Sites-Quellcommit: 2aeac129288902dab6bf47fede1c7e210dad6ccc. Version 1, Deployment appgdep_6af23f0a3eb88191a3f7947faa7142b1 am 09.11.2026 erfolgreich. Nachfolgende Dokumentationscommits ändern den veröffentlichten Spielstand nicht.
- Veröffentlichung des Vorgängers vom 10.11.2026 bestätigt: GitHub 707d53d, Sites fe7cc06, Deployment appgdep_6af2dd65932081919f620d1e8fa026d7. Browseröffnung zeigte den privaten Anmeldeschutz. Reale Safari-Prüfung bleibt offen.

## Vorgehen auf dem iPhone

1. Den privaten Demo-Link in Safari öffnen und gegebenenfalls mit demselben ChatGPT-Konto anmelden, dem die Demo gehört.
2. Die Kennung Basis a199290 kontrollieren. Bei abweichender Anzeige Seite neu laden; der Browser wählt keinen Git-Branch.
3. iPhone-Modell, iOS-Version, Datum, Ausrichtung und Browserzoom im Protokoll notieren.
4. Prüfungen zunächst im Hochformat, danach im Querformat durchführen. Abweichungen mit reproduzierbaren Schritten dokumentieren.
5. Nur tatsächlich ausgeführte und bestandene Prüfungen als Erledigt markieren; Gerätebefunde sind keine automatisch bestandenen Browserfälle.

## Technische Prüfung des Demo-Aufbaus

**Erledigt:** Separater Produktionsbuild und vier betroffene Browserfälle in mobilem Chromium erfolgreich (Vollbild, beide Grossansicht-Rückfälle und Grafik/Audio). Dies ist Touch-Emulation und bestätigt keine reale Safari-Geräteabnahme.

## Prüfliste

| ID | Prüfung und erwartetes Ergebnis | Status |
|---|---|---|
| I01 | Privater Zugriff funktioniert; eigene Testdemo/Basiskennung korrekt. | **Erledigt – Nutzerabnahme 10.11.2026** |
| I02 | Menü, Anleitung (Scrollen/Wischen), Einstellungen und Zurück funktionieren ohne verdeckte Texte. | **Erledigt – Nutzerabnahme 10.11.2026** |
| I03 | Gleitendes Steuerkreuz: vier grosse Richtungsflächen, aktive Richtung hervorgehoben, direkter Wechsel ohne Loslassen, Kurve vor Abzweigung halten (geradeaus weiter und am ersten freien Feld abbiegen), kleiner 20 × 20-Pixel-Mittelbereich und Verlassen der Fläche stoppen, Loslassen/Abbruch/App-Wechsel stoppt weitere Schritte. Zweiten Finger ignorieren; auch in gedrehter Grossansicht prüfen. | **Erledigt – Nutzerabnahme 10.11.2026** |
| I04 | Nach App-/Tabwechsel oder Fokusverlust hängt keine Richtung fest. Für Fristvergleiche zuvor bewusst pausieren; Hintergrundwechsel ist keine zugesicherte automatische Spielpause. | **Erledigt – Nutzerabnahme 10.11.2026** |
| I05 | Im Hochformat Grossansicht wählen: Bühne und Tasten drehen automatisch quer. Menü, Anleitung per Wischen, Spiel, Pause und Dialoge treffen korrekt. Echtes Drehen und Zurückdrehen erhalten den Versuch; Verkleinern stellt die normale Ansicht her. | **Erledigt – Nutzerabnahme 10.11.2026** |
| I06 | Vollbildtaste: natives Vollbild, wenn freigegeben; sonst benannte Grossansicht mit erhaltenen Browserleisten. Zurück-Taste bleibt erreichbar. Kein Anspruch auf native API auf jedem iPhone. | **Erledigt – Nutzerabnahme 10.11.2026** |
| I07 | Pause/Weiter friert Timer/Figuren/Sprechblasen und Türfristen ein. Neustart setzt den Versuch zurück. Direkter Startmenü-Eintrag führt ohne zweite Abfrage zurück. | **Erledigt – Nutzerabnahme 10.11.2026** |
| I08 | Musik und Töne getrennt schaltbar und nach Neuladen gespeichert. Audio beginnt erst nach Nutzeraktion. Musik/Schritte auf Lautsprecher und gegebenenfalls Kopfhörer dezent; Lautstärkeeinstellung notieren. | **Erledigt – Nutzerabnahme 10.11.2026** |
| I09 | Texte (Rollen, Räume, HUD, Dialoge) lesbar; Pflanzen, Türen und Möbel klar. Keine Störungen beim Laufen oder in Grossansicht. | **Erledigt – Nutzerabnahme 10.11.2026** |
| I10 | Sprechblasen folgen zwei Spielsekunden lang dem sprechenden NPC einschliesslich Bewegung zwischen Kacheln, nicht dem Spieler. Blasenkörper und Spitze folgen gemeinsam; ausserhalb des Kamerabereichs ausgeblendet. Höchstens zwei insgesamt, höchstens eine pro Seitenraum; sichtbare Meeting-NPCs sprechen auch bei Spieler ausserhalb des Raums. Spieler-/Kamerabewegung darf den Weltversatz zum NPC nicht ändern; Pause friert Laufzeit ein. | **Erledigt – Nutzerabnahme 10.11.2026** |
| I11 | Spieler und zulässige NPCs öffnen Türen in der Wandöffnung. Kein Schliessen auf belegter/reservierter Kachel; 250 ms nach letzter Freigabe geschlossen. Geschlossene Tür blockiert Sicht, offene nicht. Wartende NPCs in der Tür halten sie offen. | **Erledigt – Nutzerabnahme 10.11.2026** |
| I12 | Fangdialoge vollständig lesbar, Wiederholung überspringbar; Neustart setzt Spieler und alle NPCs sauber zurück. | **Erledigt – Nutzerabnahme 10.11.2026** |
| I13 | Vollständiger Versuch: Timer ab Verlassen des PI-Raums, Zeitablauf oder Sieg erreichbar, danach sauberer Neustart. | **Erledigt – Nutzerabnahme 10.11.2026** |
| I14 | Kaltstart, längerer Spielversuch und wiederholte Neustarts laufen flüssig; Gerätewärme/auffällige Verzögerungen notieren. | **Erledigt – Nutzerabnahme 10.11.2026** |

## Geräteprotokoll

**Erledigt – Nutzerabnahme:** Erfolgreicher iPhone-/Safari-Test des aktuellen Stands am 10.11.2026 ausdrücklich bestätigt. Einzelne Geräteparameter wurden nicht separat mitgeteilt.

| Datum | Modell | iOS/Safari | Ausrichtung/Zoom | Demo-/Quellstand | Prüf-IDs | Befund |
|---|---|---|---|---|---|---|
| 10.11.2026 | iPhone, Modell nicht separat angegeben | Safari, Versionen nicht separat angegeben | Nicht separat angegeben | GitHub-Spielquelle d9673f7; Sites d69f138; Deployment appgdep_6af31bad97cc81918a19793421df6ae5 | I01–I14, Gesamtbestätigung | Erfolgreich; Branchabschluss und Merge nach main freigegeben |

## Demo und Rückführung

Die bestätigte private Demo verwendet GitHub-Spielquelle `d9673f701ce4aaa5b3aff41173b4fb23af73c72f`, Sites-Quelle `d69f138b7e49da60dd9dad53c4a8026e941c5354` und Deployment `appgdep_6af31bad97cc81918a19793421df6ae5`. Dokumentationscommit `9c0d806` ergänzte danach ausschliesslich die geplante Schlüsselmechanik. Der gesamte Testbranch wird nach Nutzerfreigabe nach main übernommen, einschliesslich bestehender Hosting-Zuordnung und sichtbarer Basiskennung. Zugang bleibt owner-private; es wird keine neue Site und kein neuer Entwicklungsbranch eröffnet. Der Merge löst keine automatische Neuveröffentlichung aus.

## Historischer Prüfverlauf

Frühere offene Gerätebefunde in den folgenden Abschnitten sind durch die Nutzerabnahme vom 10.11.2026 abgeschlossen. Die damaligen Einschränkungen automatisierter Prüfungen bleiben nachvollziehbar.

## Automatische Spielrotation – 10.11.2026

**Erledigt – gezielte technische Prüfung:** 46 Funktionstests und Build erfolgreich; sechs Chromium-Harness-Prüfungen mit simuliertem grobem Zeiger und synthetischer Maus bestanden (keine reale Touch-Abnahme). Die Playwright-Suite ist wegen fehlendem Browser-Binary nicht ausführbar. Virtuelles Querformat im Hochformat einschliesslich umgerechneter Canvas-Eingaben. Zum Prüfen im Hochformat die Grossansicht wählen, ohne das iPhone zu drehen. Zusätzlich die Seite bereits im Querformat öffnen: Anfangs normale Ansicht, erster Tipp auf Grossansicht vergrössert, zweiter Tipp verkleinert. Ohne Grossansicht darf ein Formatwechsel sie nicht selbst aktivieren. Die Safari-Leisten werden dadurch nicht entfernt. Für den Standalone-Start ohne Safari-Leisten: Teilen → Zu Home-Bildschirm hinzufügen → Als Web-App öffnen, danach über das Symbol starten. Physische Ausrichtungssperre verhindert die CSS-Drehung nicht. Reale iPhone-/Safari-Abnahme bleibt offen.


## Gerätebefund: Seitenränder und Auswahlmenü – 10.11.2026

**Bestätigter Nutzerbefund am Vorgänger d4af3ed:** iPhone-Screenshots zeigen eine bereits aktive Grossansicht mit breiten Seitenrändern des 4:3-Canvas sowie eine blaue Auswahl mit Safari-Kopiermenü über dem Spiel. Der frühere Schaltertest hat diese beiden Probleme nicht abgedeckt.

**Erledigt – Korrektur und gezielte technische Prüfung:** 47 Funktionstests, Build und zehn Chromium-Harness-Prüfungen erfolgreich. Vollflächiger Canvas bei 874×292, zentrierte Dialoge/korrekte Menütreffer, Entfernen der Auswahl, CSS-Auswahlsperre/Kontextmenüschutz sowie simulierte Visual-Viewport-Offsets geprüft. Harness simuliert groben Zeiger und erzeugt Mausereignisse. Neue Playwright-Ausführung wegen fehlendem Browser-Binary blockiert. Mobile Breitbild-Bühne mit breiterer Welt-/Interface-Kamera, zentrierten Menüs und Dialogen, unverzerrten Figuren und nachgeführten Viewport-Offsets. Textauswahl und Kontextmenüs werden im Spiel verhindert; bestehende Spielauswahl wird entfernt. Auf dem realen iPhone erneut prüfen: Querformat mit offenen Safari-Leisten → Grossansicht; gesamte verfügbare Fläche ohne seitliche Leerbalken, alle Tasten erreichbar, langes Drücken und mehrfaches Tippen erzeugen keine Markierung. Neue reale Safari-Abnahme offen.


## Mitlaufende NPC-Sprechblasen – 10.11.2026

Der Nutzer bestätigt die Darstellung des Breitbildstands 2473b6b als gut. Dies ist keine vollständige Abnahme aller Gerätefälle. Neuer Wunsch: Blasen folgen dem sprechenden NPC statt am Entstehungsort zu verbleiben. **Erledigt – technische Prüfung:** 48 Funktionstests, Build und elf Chromium-Harness-Prüfungen bestanden, einschliesslich Sprite-Tween, Blasenbewegung, Pause, Ablauf und Neustart. Die Playwright-Ausführung bleibt wegen fehlendem Browser-Binary blockiert. Anker und Layout werden pro Spielupdate nachgeführt; Dauer, Raumbegrenzung, Cooldowns und Pausenregeln bleiben erhalten. Neue reale Geräteprüfung des Nachführens offen.


## Erneuter Touch-Befund und Meeting-Sprecher – 10.11.2026

**Nutzerbefund:** Markierung tritt weiterhin auf; Blasen sollen ausschliesslich dem NPC folgen, Meeting-Sprecher auch ausserhalb des Raums hörbar/lesbar sein, maximal zwei gleichzeitig. **Erledigt – Umsetzung und gezielte technische Prüfung:** Weltkamera statt fester UI-Kamera für Blasen, stabiler NPC-relativer Versatz ohne Kamera-Clamping. Sichtbare Meeting-1–5-NPCs sind unabhängig von Raumzutritt/Entfernung auslösbar; andere NPCs behalten Nähe-/Bereichsregel. Globale Obergrenze zwei. Touch-Standardaktionen unterdrückt, Buttons beim Loslassen einmal aktiviert, nachfolgender Kompatibilitätsklick und Abbruch geprüft. Die vorherige CSS-/Kontextmenüprüfung war keine echte iPhone-Langdruckabnahme. Neu auf dem iPhone prüfen: lange Tastenberührung, Loslassen/Abbruch, Menüwahl/Wischen, NPC bei eigener Bewegung beobachten, Meetingräume von aussen und Anzahl der Blasen.

Technische Prüfung dieses Stands: 51 Funktionstests, Build und 14 Chromium-Harness-Fälle erfolgreich; echte Safari-Langdruck-/Mehrfingerprüfung bleibt offen. Das sind synthetische TouchEvents im Testbrowser und keine reale iPhone-Abnahme.
