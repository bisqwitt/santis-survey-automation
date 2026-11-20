# SANTIS Projektwochen

Node.js ab 22.13. Im Projektordner `npm ci` ausführen. Für eine neue Installation in `.env.local` die Variable `ADMIN_INITIAL_PASSWORD` auf das vereinbarte Startpasswort setzen. `npm run dev` startet die Anwendung unter http://localhost:3000.

Das Administratorkonto sascha-max.steinegger@santismail.ch wird beim ersten Datenbankzugriff eingerichtet. Ein Passwortwechsel erfolgt in der Verwaltung und beendet bestehende Sitzungen. Nach der Ersteinrichtung kann die Startpasswort-Variable entfernt werden.

Jede Einladung erhält einen persönlichen UUID-Link und die zu diesem Zeitpunkt aktive Katalogversion. Änderungen am Katalog werden als neue Version gespeichert. Das Ausblenden einer Frage betrifft zukünftige Einladungen. Eine Umfrage kann einmal abgegeben werden. Frühere Teilnehmerlinks bleiben gültig.

Die Verwaltung zeigt einzelne Umfragen und Antworten sowie nach Kategorie und Auswahlfrage gruppierte Diagramme. Unveränderte Fragen werden über alle Fragebögen hinweg zusammen ausgewertet. Das bestätigte Löschen eines Teilnehmers entfernt auch seine Einladung und seine Antworten.

Für den Firmenbetrieb die Anwendung unter einer erreichbaren HTTPS-Adresse öffnen und dort Links kopieren. Mit `npm run build` und `npm start` betreiben. Das Verzeichnis `data/` auf dauerhaftem, beschreibbarem Speicher halten und sichern.
## Einladungen per E-Mail

In der Teilnehmerverwaltung öffnet «Einladungen versenden» die Empfängerauswahl für offene Umfragen. Jede ausgewählte Person erhält eine separate Nachricht mit ihrem persönlichen Link.

Die SMTP-Einstellungen aus `.env.example` in `.env.local` oder als Server-Umgebungsvariablen setzen. `SMTP_FROM` ist die reine Absenderadresse. `SURVEY_BASE_URL` ist die für die Teilnehmenden erreichbare Basisadresse. Port 465 verwendet direkt TLS, andere Ports verwenden STARTTLS. Nach Änderungen den Server neu starten.

Der Versand benötigt Python 3 auf dem Server und das mitgelieferte Skript `scripts/send_invitations.py`. Optional kann `SMTP_PYTHON` auf den absoluten Pfad des Interpreters zeigen. Ohne Konfiguration lässt sich die Auswahl öffnen, der Versand bleibt deaktiviert.
