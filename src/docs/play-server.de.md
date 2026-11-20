# Einen Spielserver betreiben

Der Spielserver ist das, womit das [Online-Spiel](/docs/play) spricht: Er meldet
Spieler mit Discord an, speichert die Spiele und ihre Züge und schickt jeden Zug
an die Spieler eines Spiels. Diese Seite ist für alle, die einen eigenen
betreiben möchten. Wenn dir schon jemand eine Serveradresse gegeben hat,
brauchst du nur die Seite [Online-Spiel](/docs/play).

Der Server ist eine Node-App im Ordner `server` des
[Repositorys](https://github.com/18xx-maker/18xx-maker/tree/main/server) und
speichert alles in Postgres. Seine
[README](https://github.com/18xx-maker/18xx-maker/blob/main/server/README.md)
beschreibt auch die API und das Websocket-Protokoll (auf Englisch).

## Voraussetzungen

- Postgres 17. Eine leere Datenbank reicht: Der Server legt seine Tabellen beim
  Start an.
- Node 24 mit pnpm (den Befehl findest du unter
  [Local development](https://github.com/18xx-maker/18xx-maker/blob/main/server/README.md#local-development)
  in der README), oder Docker, um stattdessen das Image zu starten.
- Eine Discord-Anwendung (siehe unten).
- Eine öffentliche HTTPS-Adresse für den Server, etwa
  `https://play.example.com`, damit die Website ihn erreicht und Discord die
  Spieler zu ihm zurückschicken kann.

## Discord-Anwendung

Spieler melden sich mit Discord an, der Server braucht also eine eigene
Discord-Anwendung:

1. Erstelle im
   [Discord Developer Portal](https://discord.com/developers/applications) eine
   Anwendung und öffne **OAuth2**.
2. Füge die Redirect-URI `${PUBLIC_URL}/auth/discord/callback` hinzu, zum
   Beispiel `https://play.example.com/auth/discord/callback`. Sie muss genau zu
   `PUBLIC_URL` passen.
3. Kopiere die Client-ID und das Client-Secret in `DISCORD_CLIENT_ID` und
   `DISCORD_CLIENT_SECRET`.
4. Der Server fragt nach den Scopes `identify guilds`. Ein Bot ist nicht nötig:
   Über den Scope `guilds` wird `DISCORD_GUILD_ID` geprüft (kopiere die ID des
   Servers bei eingeschaltetem Entwicklermodus).

## Konfiguration

Alle Einstellungen sind Umgebungsvariablen. Die ersten vier sind Pflicht, ohne
sie startet der Server nicht.

| Variable                 | Standard                     | Bedeutung                                                                                                                                         |
| ------------------------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`           | Pflicht                      | Postgres-Verbindungsstring, zum Beispiel `postgres://play:play@db:5432/play`.                                                                     |
| `PUBLIC_URL`             | Pflicht                      | Die öffentliche URL dieses Servers, ohne abschließenden Schrägstrich. Wird für die Discord-Redirect-URI genutzt.                                  |
| `DISCORD_CLIENT_ID`      | Pflicht                      | Client-ID der Discord-Anwendung.                                                                                                                  |
| `DISCORD_CLIENT_SECRET`  | Pflicht                      | Client-Secret der Discord-Anwendung. Signiert auch den Login-`state`, eine Änderung beendet also laufende Anmeldungen.                            |
| `PORT`                   | `8787`                       | Port, auf dem der Server lauscht.                                                                                                                 |
| `ALLOWED_ORIGINS`        | leer                         | Kommagetrennte Origins der 18xx-Maker-Seiten, die die API aufrufen dürfen (CORS) und die `return`-URL einer Anmeldung sein dürfen.                |
| `DISCORD_GUILD_ID`       | leer                         | Wenn gesetzt, dürfen nur Mitglieder dieses Discord-Servers Spiele erstellen. Alle mit Einladungslink können trotzdem beitreten. Leer: alle.       |
| `DISCORD_API_BASE`       | `https://discord.com/api`    | Basis der Discord-API, wird nur in Tests geändert.                                                                                                |
| `DISCORD_AUTH_BASE`      | `https://discord.com/oauth2` | Basis der Discord-Autorisierung, wird nur in Tests geändert.                                                                                      |
| `DISCORD_TIMEOUT_MS`     | `10000`                      | Zeit, die jede Discord-Anfrage einer Anmeldung samt Antwort dauern darf. Eine Anmeldung mit Zeitüberschreitung scheitert mit 502.                 |
| `DISCORD_WEBHOOK_ORIGIN` | `https://discord.com`        | Origin, mit dem die Webhook-URL eines Spiels beginnen muss (`<origin>/api/webhooks/<id>/<token>`), wird nur in Tests geändert.                    |
| `SESSION_TTL_DAYS`       | `30`                         | Tage, die eine Anmeldung gültig bleibt. Eine abgelaufene Sitzung bekommt 401 von der API und `bad_token` am Websocket.                            |
| `MAX_GAME_BYTES`         | `2097152` (2 MiB)            | Größte Spieldatei, die beim Erstellen eines Spiels angenommen wird.                                                                               |
| `MAX_ASSET_BYTES`        | `1048576` (1 MiB)            | Größtes hochgeladenes Asset (Bild oder Schrift) eines Spiels.                                                                                     |
| `MAX_ASSETS_PER_GAME`    | `50`                         | Assets, die ein Spiel haben darf. Ein Asset mit demselben Namen zu ersetzen zählt nicht noch einmal.                                              |
| `MAX_ASSET_TOTAL_BYTES`  | `8388608` (8 MiB)            | Gesamtgröße der Assets eines Spiels.                                                                                                              |
| `MAX_GAMES_PER_USER`     | `50`                         | Spiele, die ein Benutzer besitzen darf, die `active` oder `locked` sind (archivierte zählen nicht, bis sie wieder aktiv oder gesperrt sind).      |
| `MAX_EVENTS_PER_SECOND`  | `10`                         | Events, die ein Websocket pro Sekunde senden darf, bevor er `rate_limited`-Fehler bekommt.                                                        |
| `MAX_EVENTS_PER_GAME`    | `200000`                     | Events, die ein Spiel enthalten darf. Das Event danach bekommt `invalid` („game is full“).                                                        |
| `SNAPSHOT_EVERY`         | `100`                        | Event-Abstand gespeicherter Snapshots. Ein Client, der mehr als das Fünffache zurückliegt, bekommt das ganze Protokoll in einem `snapshot`-Frame. |
| `JOIN_TIMEOUT_MS`        | `10000`                      | Zeit, die ein neuer Websocket hat, um seinen `join`-Frame zu senden, bevor er geschlossen wird (4001).                                            |
| `WEBHOOK_BATCH_MS`       | `5000`                       | Zeit, in der die Zug-Benachrichtigungen eines Spiels gesammelt werden, bevor sie als eine Nachricht an seinen Discord-Webhook gehen.              |
| `WEBHOOK_MAX_PER_MINUTE` | `10`                         | Webhook-Nachrichten pro Spiel und Minute. Benachrichtigungen darüber hinaus warten und gehen mit der nächsten Nachricht raus.                     |
| `MAX_SPECTATORS`         | `50`                         | Zuschauer-Websockets, die ein Spiel gleichzeitig haben darf. Der nächste bekommt `too_many_spectators` und wird mit 4003 geschlossen.             |

Eine numerische Variable muss eine positive ganze Zahl sein, sonst startet der
Server nicht und nennt die Variable. Nicht gesetzt oder leer nutzt den
Standardwert.

`ALLOWED_ORIGINS` muss den Origin jeder 18xx-Maker-Seite enthalten, die deine
Spieler nutzen, genau so, wie der Browser ihn zeigt (Schema und Host, ohne Pfad
und ohne abschließenden Schrägstrich), zum Beispiel `https://18xx-maker.com`.
Trenne mehrere mit Kommas.

## Mit Docker starten

Das Image wird aus dem Wurzelordner des Repositorys gebaut:

```shell
docker build -f server/Dockerfile -t 18xx-maker-play .
```

Es lauscht auf Port 8787, läuft als Benutzer `node` ohne Root-Rechte und hat
einen Healthcheck auf `/health`.

### Docker Compose

Compose startet den Server zusammen mit Postgres (der Dienst `play` liest die
Discord-Werte und `PUBLIC_URL` aus deiner Shell):

```shell
export PUBLIC_URL=http://localhost:8787
export DISCORD_CLIENT_ID=...
export DISCORD_CLIENT_SECRET=...
export ALLOWED_ORIGINS=http://localhost:5173
docker compose -f server/docker-compose.yml up -d
curl -s localhost:8787/health   # {"ok":true}
```

Für einen öffentlichen Server setzt du `PUBLIC_URL` auf seine `https://`-Adresse
und `ALLOWED_ORIGINS` auf die Seite, die deine Spieler nutzen.

### Dokploy

1. Erstelle im Projekt einen **Postgres**-Datenbankdienst.
2. Erstelle eine **Application** aus Git (dieses Repository). Build-Typ
   **Dockerfile**, Dockerfile-Pfad `server/Dockerfile`, Build-Kontext der
   Wurzelordner des Repositorys (`.`).
3. Setze in der Umgebung `DATABASE_URL` (den internen Verbindungsstring des
   Datenbankdienstes), `PUBLIC_URL` (die Domain unten, mit `https://`),
   `ALLOWED_ORIGINS`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` und optional
   `DISCORD_GUILD_ID`.
4. Füge eine Domain hinzu, die auf den Container-Port `8787` zeigt. Der
   Websocket (`/ws`) funktioniert so durch den Proxy, es gibt nichts
   einzustellen.
5. Binde nichts ein: Der ganze Zustand liegt in Postgres.

## Die Website und dein Server

Die Content-Security-Policy der Website erlaubt Verbindungen zu jeder `https:`-
und `wss:`-Adresse, also funktioniert jeder Spielserver mit der gehosteten Seite
ohne neuen Build: Die Spieler tragen nur seine Adresse in den Einstellungen ein.
Ein Server unter einer einfachen `http://`-Adresse wird blockiert, außer auf
`localhost` und `127.0.0.1` zum Testen auf deinem eigenen Computer.

Der Browser fragt den Server außerdem, ob die Seite ihn aufrufen darf (CORS).
Der Server erlaubt das nur für die Origins in `ALLOWED_ORIGINS` und lässt eine
Anmeldung nur zu diesen Origins zurückkehren.

## Nur eine Instanz

Starte genau **eine Instanz**. Räume, Anwesenheit und die Reihenfolge der
Broadcasts leben im Prozess, eine zweite Replik würde also die Broadcasts der
ersten verpassen, und ihre Spieler würden die Events der anderen erst nach einer
neuen Verbindung sehen.

Der Container behandelt `SIGTERM` (und `SIGINT`): Er schließt die Websockets und
den Listener, beendet den Datenbank-Pool und endet mit 0, mit einer Grenze von 5
Sekunden, sodass `docker stop` und neue Deployments nicht auf einen Kill warten.

## Backups

Backups sind Sache dessen, der den Server betreibt. Sichere die
Postgres-Datenbank (Spiele, Events, Assets, Sitzungen), zum Beispiel regelmäßig
mit `pg_dump`; der Server speichert sonst nichts.

## Aktualisieren

Hol die neue Version, bau das Image neu und starte den Container neu. Der Server
führt seine Datenbankmigrationen beim Start aus, es gibt also keinen eigenen
Schritt. Migrationen halten während ihrer Ausführung einen Postgres Advisory
Lock, sodass sie nur einmal angewendet werden, auch wenn zwei Server
gleichzeitig starten.

## Sicherheit

- Eine Anmeldung gilt `SESSION_TTL_DAYS` (standardmäßig 30 Tage). Eine
  abgelaufene Sitzung wird abgelehnt, und der Spieler meldet sich erneut an.
  Eine Änderung des Werts gilt nur für neue Anmeldungen. Abmelden beendet die
  Sitzung und schließt ihre Websockets.
- Eine Änderung von `DISCORD_CLIENT_SECRET` beendet laufende Anmeldungen (es
  signiert den Login-`state`). Halte es geheim wie ein Passwort.
- Die Discord-Webhook-URL eines Spiels wird nur auf dem Server gespeichert. Kein
  Endpunkt gibt sie zurück, auch nicht dem Besitzer, und die Logs enthalten sie
  nie. Nur URLs der Form `https://discord.com/api/webhooks/...` (oder
  `discordapp.com`) werden angenommen.
- Einladungslinks und Zuschauerlinks sind Geheimnisse: Alle, die einen haben,
  können beitreten oder zuschauen. Der Besitzer kann beide ersetzen, was den
  alten sofort beendet.
- Hochgeladene Bilder und Schriften werden als Anhänge ausgeliefert, und die
  Seite bereinigt SVG-Bilder, bevor sie sie zeichnet.

## Fehlerbehebung

### Redirect-URI passt nicht

Discord zeigt „Invalid OAuth2 redirect_uri“, wenn die Redirect-URI der Anwendung
nicht genau `${PUBLIC_URL}/auth/discord/callback` ist. Prüfe das Schema
(`https://`), den Host und dass `PUBLIC_URL` keinen abschließenden Schrägstrich
hat.

### CORS-Fehler

Wenn die Website den Server nicht erreicht und die Browserkonsole einen
CORS-Fehler zeigt, oder eine Anmeldung mit 400 abbricht, fehlt der Origin der
Seite in `ALLOWED_ORIGINS`. Füge ihn genau hinzu (`https://18xx-maker.com`, ohne
abschließenden Schrägstrich) und starte den Server neu.

### Websocket verbindet nicht

Zeigt das Spielbrett gleich nach dem Laden „Offline, verbinde neu...“, scheitert
das Websocket-Upgrade auf `/ws`: Der Proxy vor dem Server leitet keine
Websockets weiter. (Ein Proxy, der die Verbindung offen hält, ohne zu antworten,
kann es stattdessen bei „Verbinde...“ lassen.) Schalte die
Websocket-Unterstützung (Upgrade) für die Domain ein und betreibe den Server
unter `https://`, damit das Spielbrett sich mit `wss://` verbindet.

### Spiel erstellen scheitert mit 422

Ein 422 bedeutet, dass die Prüfung der Spieldatei auf dem Server Fehler gefunden
hat; die Seite Spielen listet sie auf. Führe `pnpm maker validate my-game.json`
aus (siehe [JSON-Schemas](/docs/games/schemas)) und behebe sie. Ein 413
bedeutet, dass die Spieldatei oder ein Bild über den Grenzen des Servers liegt
(`MAX_GAME_BYTES`, `MAX_ASSET_BYTES`, `MAX_ASSETS_PER_GAME`,
`MAX_ASSET_TOTAL_BYTES`).
