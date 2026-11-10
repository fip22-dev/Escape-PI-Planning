# iPhone-/Safari-Geräteabnahme

## Zuordnung

- Arbeitsbranch: feature/iphone-safari-testing.
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
| I01 | Privater Zugriff funktioniert; eigene Testdemo/Basiskennung korrekt. | **Offen** |
| I02 | Menü, Anleitung (Scrollen/Wischen), Einstellungen und Zurück funktionieren ohne verdeckte Texte. | **Offen** |
| I03 | Richtungstasten einzeln antippen und halten: alle vier Richtungen, Loslassen/Abbruch stoppt die Eingabe. | **Offen** |
| I04 | Nach App-/Tabwechsel oder Fokusverlust hängt keine Richtung fest. Für Fristvergleiche zuvor bewusst pausieren; Hintergrundwechsel ist keine zugesicherte automatische Spielpause. | **Offen** |
| I05 | Im Hochformat Grossansicht wählen: Bühne und Tasten drehen automatisch quer. Menü, Anleitung per Wischen, Spiel, Pause und Dialoge treffen korrekt. Echtes Drehen und Zurückdrehen erhalten den Versuch; Verkleinern stellt die normale Ansicht her. | **Offen** |
| I06 | Vollbildtaste: natives Vollbild, wenn freigegeben; sonst benannte Grossansicht mit erhaltenen Browserleisten. Zurück-Taste bleibt erreichbar. Kein Anspruch auf native API auf jedem iPhone. | **Offen** |
| I07 | Pause/Weiter friert Timer/Figuren/Sprechblasen und Türfristen ein. Neustart setzt den Versuch zurück. Direkter Startmenü-Eintrag führt ohne zweite Abfrage zurück. | **Offen** |
| I08 | Musik und Töne getrennt schaltbar und nach Neuladen gespeichert. Audio beginnt erst nach Nutzeraktion. Musik/Schritte auf Lautsprecher und gegebenenfalls Kopfhörer dezent; Lautstärkeeinstellung notieren. | **Offen** |
| I09 | Texte (Rollen, Räume, HUD, Dialoge) lesbar; Pflanzen, Türen und Möbel klar. Keine Störungen beim Laufen oder in Grossansicht. | **Offen** |
| I10 | Sprechblasen bleiben zwei Spielsekunden am Entstehungsort; kein Nachführen mit Spieler/Sprecher. Beim Kamerascrollen mit der Karte aus dem Bild. Pro Seitenraum nur eine, Gang/PI mehrere; Pause friert Laufzeit ein. | **Offen** |
| I11 | Spieler und zulässige NPCs öffnen Türen in der Wandöffnung. Kein Schliessen auf belegter/reservierter Kachel; 250 ms nach letzter Freigabe geschlossen. Geschlossene Tür blockiert Sicht, offene nicht. Wartende NPCs in der Tür halten sie offen. | **Offen** |
| I12 | Fangdialoge vollständig lesbar, Wiederholung überspringbar; Neustart setzt Spieler und alle NPCs sauber zurück. | **Offen** |
| I13 | Vollständiger Versuch: Timer ab Verlassen des PI-Raums, Zeitablauf oder Sieg erreichbar, danach sauberer Neustart. | **Offen** |
| I14 | Kaltstart, längerer Spielversuch und wiederholte Neustarts laufen flüssig; Gerätewärme/auffällige Verzögerungen notieren. | **Offen** |

## Geräteprotokoll

**Offen:** Noch kein reales Gerät dieses Stands protokolliert.

| Datum | Modell | iOS/Safari | Ausrichtung/Zoom | Demo-/Quellstand | Prüf-IDs | Befund |
|---|---|---|---|---|---|---|
| — | — | — | — | — | — | Noch nicht durchgeführt |

## Demo und spätere Rückführung

Die App-Quelle dieses Branchs wird in eine eigene private Sites-Quelle gespiegelt. Veröffentlichung und Geräteabnahme sind getrennte Zustände: Eine erfolgreiche Veröffentlichung bestätigt keinen Safari-Spieltest. Zugang bleibt owner-private. Die Hosting-Konfiguration, sichtbare Testkennung und dieses Protokoll bleiben auf dem Testbranch; spätere spielrelevante Korrekturen werden gezielt per Pull Request nach main zurückgeführt.


## Automatische Spielrotation – 10.11.2026

**Erledigt – gezielte technische Prüfung:** 46 Funktionstests und Build erfolgreich; sechs Chromium-Harness-Prüfungen mit simuliertem grobem Zeiger und synthetischer Maus bestanden (keine reale Touch-Abnahme). Die Playwright-Suite ist wegen fehlendem Browser-Binary nicht ausführbar. Virtuelles Querformat im Hochformat einschliesslich umgerechneter Canvas-Eingaben. Zum Prüfen im Hochformat die Grossansicht wählen, ohne das iPhone zu drehen. Zusätzlich die Seite bereits im Querformat öffnen: Anfangs normale Ansicht, erster Tipp auf Grossansicht vergrössert, zweiter Tipp verkleinert. Ohne Grossansicht darf ein Formatwechsel sie nicht selbst aktivieren. Die Safari-Leisten werden dadurch nicht entfernt. Für den Standalone-Start ohne Safari-Leisten: Teilen → Zu Home-Bildschirm hinzufügen → Als Web-App öffnen, danach über das Symbol starten. Physische Ausrichtungssperre verhindert die CSS-Drehung nicht. Reale iPhone-/Safari-Abnahme bleibt offen.
