# iPhone-/Safari-Geräteabnahme

## Zuordnung

- Arbeitsbranch: feature/iphone-safari-testing.
- Freigegebene Spielbasis: main a199290e4b00ebb57029d59aafb5007eb4b2901a ([PR #14](https://github.com/fip22-dev/Escape-PI-Planning/pull/14)).
- **Erledigt – technische Hauptstand-Prüfung:** 45 Funktionstests, alle 51 Browserfälle in Chromium/Firefox/mobilem Chromium, Produktionsbuild und Diff-Prüfung erfolgreich. Das ist keine reale iPhone-/Safari-Abnahme.
- Eigene owner-private Testdemo, Site-ID: appgprj_6af23d83574c81919296181569f39729. Die frühere private Demo bleibt bestehen.
- Vorgesehene Demo-Adresse: https://escape-pi-iphone-safari-philippe.electgleam1.chatgpt.site (Veröffentlichung noch in Arbeit).
- Anzeige zur Unterscheidung: iPhone/Safari-Testdemo · Basis a199290.
- Der veröffentlichte GitHub-Quellcommit und die Sites-Version werden nach erfolgreicher Bereitstellung hier protokolliert.

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
| I01 | Privater Zugriff funktioniert; eigene Testdemo/Basiskennung korrekt, bestehende Demo unverändert. | **Offen** |
| I02 | Menü, Anleitung (Scrollen/Wischen), Einstellungen und Zurück funktionieren ohne verdeckte Texte. | **Offen** |
| I03 | Richtungstasten einzeln antippen und halten: alle vier Richtungen, Loslassen/Abbruch stoppt die Eingabe. | **Offen** |
| I04 | Nach App-/Tabwechsel oder Fokusverlust hängt keine Richtung fest. Für Fristvergleiche zuvor bewusst pausieren; Hintergrundwechsel ist keine zugesicherte automatische Spielpause. | **Offen** |
| I05 | Hoch-/Querformatwechsel im Menü und Spiel: richtige Proportionen, alle Touch-Tasten erreichbar, Treffflächen stimmen. | **Offen** |
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
