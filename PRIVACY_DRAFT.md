# Datenschutz – Entwurf für die öffentliche Beta

**Teilweise erledigt – Textentwurf abgelegt am 13.11.2026.** Noch nicht zur Veröffentlichung freigegeben oder ins Spiel eingebaut. GitHub Pages ist das geplante Hosting; die bestehende Demo ist weiterhin privat.

## Vorgesehener Kurztext

Für die geplante öffentliche Beta ist GitHub Pages als Hosting vorgesehen; das Spiel verwendet InsForge als Backend. Dabei können technische Zugriffsdaten wie IP-Adresse und Browserinformationen verarbeitet werden.

Einträge in die Bestenliste sind freiwillig. Dein Name/Pseudonym und deine Spielzeit werden gespeichert und öffentlich angezeigt. Verwende möglichst ein Pseudonym.

Feedback wird als öffentliches GitHub-Issue veröffentlicht. Übermittelte technische Angaben dienen der Fehleranalyse. Bitte keine persönlichen oder vertraulichen Informationen eingeben.

Bestenlisteneinträge und Feedback bleiben bis zur Löschung gespeichert. Auskunft oder Löschung kannst du bei **Philippe Waber** anfragen; ein Kontaktweg wird vor Veröffentlichung ergänzt. Öffentlich veröffentlichte Inhalte können von Dritten kopiert werden.

## Vor Umsetzung noch offen

- **Teilweise erledigt:** Betreiber mit Philippe Waber benannt; einen Kontaktweg ohne E-Mail-Adresse noch festlegen.
- **Teilweise erledigt:** Die Projekt-API-Adresse weist auf InsForges Region `eu-central`; InsForge ordnet diese Region Frankfurt, Deutschland zu. Die Projektregion wurde nicht über die CLI-Einstellungen bestätigt; Backups und mögliche weitere Verarbeitungsorte bleiben zu klären. GitHub beschreibt IP-, Geräte- und Website-Nutzungsdaten, nennt dafür aber keine einheitliche projektbezogene Aufbewahrungsdauer.
- **Offen:** Projektbezogene Aufbewahrungsfristen der Hosting- und Backend-Logs bei den Anbietern bestätigen. InsForges aktuelle Privacy Notice nennt keine feste Frist für die operativen Logs dieses Projekts. Eine andere InsForge-Domain nennt zwar 30 Tage für Logs/Telemetry; wegen der abweichenden Angaben ist dieser Wert hier nicht als bestätigt übernommen.
- **Teilweise erledigt:** Die eigene Anwendung löscht Feedback-Versandzuordnungen nach sieben Tagen und Quoten nach 24 Stunden; öffentliche GitHub-Issues bleiben bestehen. Bestenlisteneinträge bleiben bis zur gezielten Löschung oder zum Zurücksetzen der Liste gespeichert. Noch festzulegen sind der nicht per E-Mail erfolgende Kontaktweg und die Abläufe für Löschanfragen zu Issues und Bestenlisteneinträgen.
- **Offen:** Nach Prüfung und Freigabe im Spiel leicht zugänglich machen und Hinweise bei den Formularen abstimmen. Öffentliche Beta separat umsetzen.

Die bestehenden technischen Aufbewahrungsregeln für Versandzuordnungen und Quoten stehen in [FEEDBACK_OPERATIONS.md](FEEDBACK_OPERATIONS.md); die Regeln der Bestenliste in [LEADERBOARD.md](LEADERBOARD.md). Dieser Entwurf ändert keine Speicherung oder Löschfrist.

## Prüfbasis (interne Notizen, nicht Teil des Kurztexts)

- GitHub erklärt, dass Website-Nutzungsdaten unter anderem IP-Adresse, Geräteinformationen, Zeitpunkte und aufgerufene Seiten umfassen können. Die allgemeine Aufbewahrung richtet sich nach Zweck und rechtlichen Pflichten; eine feste Frist für die konkrete GitHub-Pages-Site wird dort nicht genannt: [GitHub General Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).
- Der Projektendpunkt `6r53f4ec.eu-central.insforge.app` enthält die Regionskennung `eu-central`. InsForge ordnet EU Central Frankfurt zu und beschreibt, dass Projektinfrastruktur in der gewählten Region bereitgestellt wird: [InsForge Multi-Region](https://insforge.dev/blog/insforge-multi-region). Die direkte CLI-Abfrage der Projektmetadaten war in dieser Arbeitsumgebung nicht verfügbar.
- InsForges [Privacy Notice](https://insforge.dev/privacy) nennt technische Nutzungsdaten wie IP-Adresse, Browser und Zugriffszeiten. Die dort beschriebenen Fristen für bestimmte Konten-, Inhalts- und KI-Agent-Daten bestätigen jedoch keine allgemeine Log-Frist für dieses Projekt. Die separate [InsForge-Datenschutzerklärung auf insforge.co](https://www.insforge.co/privacy) nennt 30 Tage für Log- und Telemetriedaten; wegen der abweichenden Angaben ist eine Bestätigung durch InsForge erforderlich.
- Anwendungsbezogene Aufbewahrung: Versandzuordnungen sieben Tage und Quoten 24 Stunden laut [FEEDBACK_OPERATIONS.md](FEEDBACK_OPERATIONS.md); Bestenlisteneinträge bis zur gezielten Löschung oder zum Zurücksetzen laut [LEADERBOARD.md](LEADERBOARD.md). Veröffentlichte GitHub-Issues bleiben bestehen, bis sie gelöscht werden.
