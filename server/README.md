# 18xx Maker play server

The server behind online play: Discord login, games with invite links and
seats, an append-only event log per game, and a websocket that pushes events to
the players of a game. It is a Node (Hono + `ws`) app that stores everything in
Postgres. It runs migrations on start, so an empty database is enough.

## Configuration

All settings are environment variables. The first four are required, the
server refuses to start without them.

| Variable                | Default                      | Meaning                                                                                                                      |
| ----------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`          | required                     | Postgres connection string, for example `postgres://play:play@db:5432/play`.                                                 |
| `PUBLIC_URL`            | required                     | The public URL of this server, without a trailing slash. Used for the Discord redirect URI.                                  |
| `DISCORD_CLIENT_ID`     | required                     | Client id of the Discord application.                                                                                        |
| `DISCORD_CLIENT_SECRET` | required                     | Client secret of the Discord application. Also signs the login `state`, so changing it ends logins that are in progress.     |
| `PORT`                  | `8787`                       | Port the server listens on.                                                                                                  |
| `ALLOWED_ORIGINS`       | empty                        | Comma separated origins of the 18xx Maker sites that may call the API (CORS) and may be the `return` URL of a login.         |
| `DISCORD_GUILD_ID`      | empty                        | When set, only members of this Discord server may create games. Everybody with an invite link can still join. Empty: anyone. |
| `DISCORD_API_BASE`      | `https://discord.com/api`    | Discord API base, only changed in tests.                                                                                     |
| `DISCORD_AUTH_BASE`     | `https://discord.com/oauth2` | Discord authorize base, only changed in tests.                                                                               |
| `MAX_GAME_BYTES`        | `2097152` (2 MiB)            | Largest game file accepted when creating a game.                                                                             |
| `MAX_ASSET_BYTES`       | `1048576` (1 MiB)            | Largest uploaded asset (image or font) of a game.                                                                            |
| `MAX_GAMES_PER_USER`    | `50`                         | Games a user may own that are `active` or `locked` (archived ones do not count).                                             |
| `MAX_EVENTS_PER_SECOND` | `10`                         | Events a websocket may send per second before it gets `rate_limited` errors.                                                 |
| `SNAPSHOT_EVERY`        | `100`                        | Event interval of stored snapshots. A client more than five times this behind gets the full log in a `snapshot` frame.       |
| `JOIN_TIMEOUT_MS`       | `10000`                      | Time a new websocket has to send its `join` frame before it is closed (4001).                                                |

A value that is not a number falls back to the default.

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

Backups are the host's job. Back up the Postgres database (games, events,
assets, sessions); the server keeps nothing else.

## Protocol

Everything except `/health`, `/auth/discord/*` and `GET /invites/:code` needs
the header `Authorization: Bearer <token>`. Errors are `{ "error": "..." }`.

### REST

| Endpoint                          | Who         | Does                                                                                                                    |
| --------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| `GET /health`                     | anyone      | `{ "ok": true }`                                                                                                        |
| `GET /auth/discord/login?return=` | anyone      | Redirects to Discord. `return` must be on `ALLOWED_ORIGINS`.                                                            |
| `GET /auth/discord/callback`      | Discord     | Creates the session and redirects to `return#token=<token>`.                                                            |
| `GET /me`                         | user        | `{ id, name, avatar, canCreate }`                                                                                       |
| `POST /auth/logout`               | user        | Deletes the session of the token.                                                                                       |
| `POST /games`                     | `canCreate` | Body `{ game, config?, seatName? }`. The game file is validated (422 with `errors`). Returns 201 `{ id, inviteCode }`.  |
| `GET /games`                      | user        | Games the user has a seat in: `[{ id, title, status, ownerId, updatedAt }]`.                                            |
| `GET /games/:id`                  | seat holder | `{ id, title, status, ownerId, game, config, seats }`, plus `inviteCode` for the owner.                                 |
| `PATCH /games/:id`                | owner       | Body `{ status }`, one of `active`, `locked`, `archived`. A locked game accepts no events and no new seats.             |
| `DELETE /games/:id`               | owner       | Deletes the game and its events (204).                                                                                  |
| `POST /games/:id/invite`          | owner       | New invite code, the old one stops working.                                                                             |
| `GET /invites/:code`              | anyone      | `{ gameId, title }`.                                                                                                    |
| `POST /invites/:code/join`        | user        | Body `{ name, color? }`. Takes a seat in an `active` game (410 when not open); joining twice returns the existing seat. |
| `PUT /games/:id/assets/:name`     | owner       | Raw body, stored with its `Content-Type`. Name `[\w.-]{1,100}`, limit `MAX_ASSET_BYTES`.                                |
| `GET /games/:id/assets/:name`     | seat holder | The asset, as an attachment with `nosniff`.                                                                             |

### Websocket

Connect to `/ws` (`wss://` behind HTTPS). Frames are JSON text, at most 256 KiB.

Client to server:

- `{ "t": "join", "token", "gameId", "lastSeq" }`, once, within
  `JOIN_TIMEOUT_MS`. Only seat holders may join: anyone else gets an
  `error` frame (`bad_token` or `not_member`) and the socket closes with 4003.
  `lastSeq` is the last event the client holds (0 for none).
- `{ "t": "event", "seq", "event" }` where `seq` is the next sequence number
  (the client's last `seq` + 1) and `event` is `{ "type", ...payload }`.

Server to client:

- `{ "t": "joined", "seq", "seats", "presence" }`: the current `seq` of the
  game, the seats and the user ids online. It is followed by one catch-up
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
  `not_member`, `locked`, `rate_limited` or `server_error`.

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
