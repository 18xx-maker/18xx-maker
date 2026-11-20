# 18xx Maker play server

The server behind online play: Discord login, games with invite links and
seats, an append-only event log per game, and a websocket that pushes events to
the players of a game. It is a Node (Hono + `ws`) app that stores everything in
Postgres. It runs migrations on start, so an empty database is enough.

The self-hosting guide for people running their own server is the
[Running a Play Server](../src/docs/play-server.en.md) docs page (on the site
at `/docs/play-server`).

## Configuration

All settings are environment variables. The first four are required, the
server refuses to start without them.

| Variable                  | Default                      | Meaning                                                                                                                        |
| ------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `DATABASE_URL`            | required                     | Postgres connection string, for example `postgres://play:play@db:5432/play`.                                                   |
| `PUBLIC_URL`              | required                     | The public URL of this server, without a trailing slash. Used for the Discord redirect URI.                                    |
| `DISCORD_CLIENT_ID`       | required                     | Client id of the Discord application.                                                                                          |
| `DISCORD_CLIENT_SECRET`   | required                     | Client secret of the Discord application. Also signs the login `state`, so changing it ends logins that are in progress.       |
| `PORT`                    | `8787`                       | Port the server listens on.                                                                                                    |
| `ALLOWED_ORIGINS`         | empty                        | Comma separated origins of the 18xx Maker sites that may call the API (CORS) and may be the `return` URL of a login.           |
| `DISCORD_GUILD_ID`        | empty                        | When set, only members of this Discord server may create games. Everybody with an invite link can still join. Empty: anyone.   |
| `DISCORD_API_BASE`        | `https://discord.com/api`    | Discord API base, only changed in tests.                                                                                       |
| `DISCORD_AUTH_BASE`       | `https://discord.com/oauth2` | Discord authorize base, only changed in tests.                                                                                 |
| `DISCORD_TIMEOUT_MS`      | `10000`                      | Time each Discord request of a login may take, body included. A login that times out fails with 502.                           |
| `DISCORD_WEBHOOK_ORIGIN`  | `https://discord.com`        | Origin a game's webhook URL must start with (`<origin>/api/webhooks/<id>/<token>`), only changed in tests.                     |
| `SESSION_TTL_DAYS`        | `30`                         | Days a login stays valid. An expired session gets 401 on the API and `bad_token` on the websocket.                             |
| `MAX_GAME_BYTES`          | `2097152` (2 MiB)            | Largest game file accepted when creating a game.                                                                               |
| `MAX_ASSET_BYTES`         | `1048576` (1 MiB)            | Largest uploaded asset (image or font) of a game.                                                                              |
| `MAX_ASSETS_PER_GAME`     | `50`                         | Assets a game may have. Replacing an asset of the same name does not count again.                                              |
| `MAX_ASSET_TOTAL_BYTES`   | `8388608` (8 MiB)            | Total size of the assets of a game.                                                                                            |
| `MAX_GAMES_PER_USER`      | `50`                         | Games a user may own that are `active` or `locked` (archived ones do not count, until they are made active or locked again).   |
| `MAX_EVENTS_PER_SECOND`   | `10`                         | Events a websocket may send per second before it gets `rate_limited` errors.                                                   |
| `MAX_EVENTS_PER_GAME`     | `200000`                     | Events a game may hold. The event after that gets `invalid` ("game is full").                                                  |
| `SNAPSHOT_EVERY`          | `100`                        | Event interval of stored snapshots. A client more than five times this behind gets the full log in a `snapshot` frame.         |
| `JOIN_TIMEOUT_MS`         | `10000`                      | Time a new websocket has to send its `join` frame before it is closed (4001).                                                  |
| `WEBHOOK_BATCH_MS`        | `5000`                       | Time the move notices of a game are collected before they go to its Discord webhook as one message.                            |
| `WEBHOOK_MAX_PER_MINUTE`  | `10`                         | Webhook messages per game per minute. Notices past that wait and go out together with the next message.                        |
| `WEBHOOK_TEST_PER_MINUTE` | `60`                         | Test posts ("Notifications connected") of the whole server per minute. Past that setting a webhook is 429 `Too many requests`. |
| `MAX_SPECTATORS`          | `50`                         | Spectator websockets a game may have at once. The next one gets `too_many_spectators` and is closed with 4003.                 |

A numeric variable must be a positive integer, otherwise the server refuses to
start and names the variable. Unset or empty uses the default.

A session gets its expiry when it is created, so changing `SESSION_TTL_DAYS`
applies to new logins only. Expired sessions of a user are deleted on their
next login. Migrations hold a Postgres advisory lock while they run, so two
servers starting against one database apply each migration once.

## Discord application

1. In the [Discord developer portal](https://discord.com/developers/applications)
   create an application and open **OAuth2**.
2. Add the redirect URI `${PUBLIC_URL}/auth/discord/callback`, for example
   `https://play.example.com/auth/discord/callback`. It must match
   `PUBLIC_URL` exactly.
3. Copy the client id and the client secret into `DISCORD_CLIENT_ID` and
   `DISCORD_CLIENT_SECRET`.
4. The server asks for the scopes `identify guilds`. No bot is needed: the
   `guilds` scope is how `DISCORD_GUILD_ID` is checked (copy the id of the
   server with developer mode on).

## Running it

The image is built from the repository root:

```shell
docker build -f server/Dockerfile -t 18xx-maker-play .
```

It listens on port 8787, runs as the non root `node` user and has a health
check on `/health`. Compose starts it together with Postgres (the `play`
service reads the Discord values and `PUBLIC_URL` from your shell):

```shell
export PUBLIC_URL=http://localhost:8787
export DISCORD_CLIENT_ID=...
export DISCORD_CLIENT_SECRET=...
export ALLOWED_ORIGINS=http://localhost:5173
docker compose -f server/docker-compose.yml up -d
curl -s localhost:8787/health   # {"ok":true}
```

### Dokploy

1. Create a **Postgres** database service in the project.
2. Create an **Application** from Git (this repository). Build type
   **Dockerfile**, Dockerfile path `server/Dockerfile`, build context the
   repository root (`.`).
3. In the environment, set `DATABASE_URL` (the internal connection string of
   the database service), `PUBLIC_URL` (the domain below, with `https://`),
   `ALLOWED_ORIGINS`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` and
   optionally `DISCORD_GUILD_ID`.
4. Add a domain pointing at the container port `8787`. The websocket (`/ws`)
   works through the proxy as it is, nothing to configure.
5. Mount nothing: all state is in Postgres.

Run exactly **one instance**. Rooms, presence and the ordering of broadcasts
live in the process, so a second replica would miss the broadcasts of the
first and its players would not see each other's events until they reconnect.
The container handles `SIGTERM` (and `SIGINT`): it closes the websockets and
the listener, ends the database pool and exits 0, with a 5 second limit, so
`docker stop` and redeploys do not wait for a kill.

The site's Content-Security-Policy (`index.html`) allows `connect-src` to
`https:`, `wss:` and `localhost`/`127.0.0.1` (http and ws), so any play server
URL works from the hosted site without a rebuild. `script-src` stays `'self'`.
A server on a plain `http://` host other than localhost is blocked.

Backups are the host's job. Back up the Postgres database (games, events,
assets, sessions); the server keeps nothing else.

## Protocol

Everything except `/health`, `/auth/discord/*`, `GET /invites/:code` and
`GET /watch/:code` (with its `/game` and `/assets/:name`) needs the header `Authorization: Bearer <token>`. Errors are `{ "error": "..." }`.

### Login nonce

The browser makes a random `nonce` per login, keeps it in `sessionStorage` and
sends it to `/auth/discord/login`. The server returns it in the fragment next to
the token (or error) and the browser stores the token only when the fragment's
nonce is the one it kept, once. This stops a token that someone else made from
being planted into a browser by a crafted link.

### REST

| Endpoint                                 | Who         | Does                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /health`                            | anyone      | `{ "ok": true }`                                                                                                                                                                                                                                                                                                                                                                        |
| `GET /auth/discord/login?return=&nonce=` | anyone      | Redirects to Discord. `return` must be on `ALLOWED_ORIGINS`. `nonce` (16 to 64 base64url characters, else 400) is signed into the `state`.                                                                                                                                                                                                                                              |
| `GET /auth/discord/callback`             | Discord     | Creates the session and redirects to `return#token=<token>&nonce=<nonce>`. When Discord sends an `error` (the user cancelled), redirects to `return#error=<code>&nonce=<nonce>` (`access_denied`; `login_failed` for anything that is not a plain code). An invalid `state` is 400.                                                                                                     |
| `GET /me`                                | user        | `{ id, name, avatar, canCreate }`                                                                                                                                                                                                                                                                                                                                                       |
| `POST /auth/logout`                      | user        | Deletes the session of the token and closes its websockets (`bad_token`, 4003). Other sessions of the user stay.                                                                                                                                                                                                                                                                        |
| `POST /games`                            | `canCreate` | Body `{ game, config?, seatName? }`. The game file is validated (422 with `errors`). Returns 201 `{ id, inviteCode }`.                                                                                                                                                                                                                                                                  |
| `GET /games`                             | user        | Games the user has a seat in: `[{ id, title, status, ownerId, updatedAt }]`.                                                                                                                                                                                                                                                                                                            |
| `GET /games/:id`                         | seat holder | `{ id, title, status, ownerId, game, config, seats, assets }` (`assets` is the list of asset names), plus `inviteCode`, `watchCode` (`null` when there is no spectator link) and `webhookSet` (whether a webhook is set, never its URL) for the owner.                                                                                                                                  |
| `PATCH /games/:id`                       | owner       | Body `{ status?, webhookUrl? }`, at least one. `status` is one of `active`, `locked`, `archived`. A locked game accepts no events and no new seats. Making an archived game active or locked when the owner has `MAX_GAMES_PER_USER` such games is 409. `webhookUrl` sets the Discord webhook for move notices (see below) or clears it (`null`). Returns `{ id, status, webhookSet }`. |
| `DELETE /games/:id`                      | owner       | Deletes the game and its events (204).                                                                                                                                                                                                                                                                                                                                                  |
| `POST /games/:id/invite`                 | owner       | New invite code, the old one stops working.                                                                                                                                                                                                                                                                                                                                             |
| `POST /games/:id/watch`                  | owner       | Creates the spectator link, or a new one: returns `{ watchCode }`, the old code stops working and its open spectator websockets are closed.                                                                                                                                                                                                                                             |
| `DELETE /games/:id/watch`                | owner       | Removes the spectator link (204) and closes its open spectator websockets.                                                                                                                                                                                                                                                                                                              |
| `GET /invites/:code`                     | anyone      | `{ gameId, title }`.                                                                                                                                                                                                                                                                                                                                                                    |
| `GET /watch/:code`                       | anyone      | `{ gameId, title }` of the game with this spectator link, 404 for an unknown code.                                                                                                                                                                                                                                                                                                      |
| `GET /watch/:code/game`                  | anyone      | `{ id, title, status, game, config, seats, assets }`: what a spectator needs to draw the game, without the owner, the invite code or the webhook. Archived and locked games stay watchable.                                                                                                                                                                                             |
| `GET /watch/:code/assets/:name`          | anyone      | An asset of that game, as an attachment with `nosniff`. 404 for an unknown code or name.                                                                                                                                                                                                                                                                                                |
| `POST /invites/:code/join`               | user        | Body `{ name, color? }`. Takes a seat in an `active` game (410 when not open); joining twice returns the existing seat.                                                                                                                                                                                                                                                                 |
| `PUT /games/:id/assets/:name`            | owner       | Raw body, stored with its `Content-Type`. Name `[\w.-]{1,100}`, limit `MAX_ASSET_BYTES`. Past `MAX_ASSETS_PER_GAME` or `MAX_ASSET_TOTAL_BYTES` it is 413 and nothing is written.                                                                                                                                                                                                        |
| `GET /games/:id/assets/:name`            | seat holder | The asset, as an attachment with `nosniff`.                                                                                                                                                                                                                                                                                                                                             |

### Discord webhook notices

The owner of a game can give it a Discord webhook (channel settings,
Integrations, Webhooks, Copy Webhook URL). Only
`https://discord.com/api/webhooks/<id>/<token>` (or `discordapp.com`) is
accepted, anything else is 400 `Invalid webhook URL`. Setting it posts
"Notifications connected" first: when Discord answers 401 or 404 (the webhook
does not exist) the PATCH is 400 `Discord rejected the webhook` and nothing is
written; any other failure of that post is only logged and the webhook is set.
The test post counts against the game's `WEBHOOK_MAX_PER_MINUTE` like every
other message, and also against the owner's own `WEBHOOK_MAX_PER_MINUTE` test
posts over all their games (so new or deleted games do not add more) and the
server's `WEBHOOK_TEST_PER_MINUTE`: past any of them the PATCH is 429
`Too many requests`, with no write and no call to Discord. Deleting a game
drops its waiting notices.

Every accepted event then becomes one English line ("Alice placed tile 7 on
A1"; a note change is "Alice updated the notes", never its text). The lines of
a game are posted together every `WEBHOOK_BATCH_MS`, at most
`WEBHOOK_MAX_PER_MINUTE` messages a minute and 1900 characters a message (the
rest goes in the next one), with mentions and link previews turned off and
`@`, `<`, `>` and backticks removed from names. At most 200 lines of a game
wait; past that they are counted ("(N more moves not shown)"). A webhook that
answers 401 or 404 later is cleared, so the notices of that game stop until
the owner sets a new one. A 429 is retried after its `retry-after`. Other
failures, redirects (never followed) and timeouts (`DISCORD_TIMEOUT_MS`) drop
that message. The URL is a secret: no endpoint returns it and the logs never
contain it. Notices still waiting when the server stops are dropped.

### Websocket

Connect to `/ws` (`wss://` behind HTTPS). Frames are JSON text, at most 256 KiB.

Client to server:

- `{ "t": "join", "token", "gameId", "lastSeq" }`, once, within
  `JOIN_TIMEOUT_MS`. Only seat holders may join: anyone else gets an
  `error` frame (`bad_token` or `not_member`) and the socket closes with 4003.
  `lastSeq` is the last event the client holds (0 for none). An expired
  session is `bad_token`.
- `{ "t": "join", "watch", "gameId"?, "lastSeq" }`: a spectator joins with the
  watch code instead of a token (no login). An unknown code, or a `gameId`
  that is not the code's game, is `not_member` and 4003; past
  `MAX_SPECTATORS` it is `too_many_spectators` and 4003. A spectator gets
  `joined` (with `"spectator": true`), the catch-up frame, events and
  presence like a player, but is read-only: every `event` frame it sends is
  answered with `not_member` (within `MAX_EVENTS_PER_SECOND`) and nothing is
  stored. It is never listed in `presence`. Rotating or deleting the watch
  code closes the game's spectators with `not_member` and 4003.
- `{ "t": "event", "seq", "event" }` where `seq` is the next sequence number
  (the client's last `seq` + 1) and `event` is `{ "type", ...payload }`.

Server to client:

- `{ "t": "joined", "seq", "seats", "presence", "spectator"? }`: the current
  `seq` of the game, the seats and the user ids of the players online. It is followed by one catch-up
  frame.
- `{ "t": "events", "events" }`: the events after `lastSeq`.
- `{ "t": "snapshot", "seq": 0, "state", "events" }`: **replace your local
  log.** `state` is the initial state and `events` the full log. Sent when
  `lastSeq` is ahead of the server or more than `SNAPSHOT_EVERY * 5` behind.
- `{ "t": "event", "event": { "seq", "userId", "type", ... } }`: an accepted
  event, sent to every socket of the game, the sender included.
- `{ "t": "rebase", "currentSeq" }`: to the sender of an event whose `seq` was
  stale; catch up and send again.
- `{ "t": "presence", "users" }`: on every join and leave.
- `{ "t": "error", "code", "message"? }`: `invalid`, `bad_token`,
  `not_member`, `locked`, `rate_limited`, `too_many_spectators` or
  `server_error`. `invalid` with
  the message `game is full` when the game holds `MAX_EVENTS_PER_GAME` events.

A joined socket is closed with `bad_token` and 4003 when its session is logged
out, and on its next `event` frame once the session has expired. Frames that
arrive after that are ignored.

## Local development

```shell
docker run -d --name server-db-1 -e POSTGRES_USER=play -e POSTGRES_PASSWORD=play -e POSTGRES_DB=play -p 55432:5432 postgres:17
pnpm install
DATABASE_URL=postgres://play:play@localhost:55432/play PUBLIC_URL=http://localhost:8787 \
  DISCORD_CLIENT_ID=x DISCORD_CLIENT_SECRET=y \
  pnpm --filter 18xx-maker-play-server start
```

The server tests need the database (they create and drop their own schemas):

```shell
DATABASE_URL=postgres://play:play@localhost:55432/play pnpm exec vitest run --project server
```
