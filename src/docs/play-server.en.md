# Running a Play Server

The play server is what [online play](/docs/play) talks to: it signs players in
with Discord, keeps the games and their moves, and sends every move to the
players of a game. This page is for people who want to run their own. If someone
already gave you a server address, you only need the [online play](/docs/play)
page.

The server is a Node app in the `server` folder of the
[repository](https://github.com/18xx-maker/18xx-maker/tree/main/server) and
stores everything in Postgres. Its
[README](https://github.com/18xx-maker/18xx-maker/blob/main/server/README.md)
also describes the API and the websocket protocol.

## Requirements

- Postgres 17. An empty database is enough: the server creates its tables when
  it starts.
- Node 24 with pnpm (see
  [local development](https://github.com/18xx-maker/18xx-maker/blob/main/server/README.md#local-development)
  in the README for the command), or Docker to run the image instead.
- A Discord application (see below).
- A public HTTPS address for the server, like `https://play.example.com`, so the
  website can reach it and Discord can send players back to it.

## Discord application

Players sign in with Discord, so the server needs a Discord application of its
own:

1. In the
   [Discord developer portal](https://discord.com/developers/applications)
   create an application and open **OAuth2**.
2. Add the redirect URI `${PUBLIC_URL}/auth/discord/callback`, for example
   `https://play.example.com/auth/discord/callback`. It must match `PUBLIC_URL`
   exactly.
3. Copy the client id and the client secret into `DISCORD_CLIENT_ID` and
   `DISCORD_CLIENT_SECRET`.
4. The server asks for the scopes `identify guilds`. No bot is needed: the
   `guilds` scope is how `DISCORD_GUILD_ID` is checked (copy the id of the
   server with developer mode on).

## Configuration

All settings are environment variables. The first four are required, the server
refuses to start without them.

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

`ALLOWED_ORIGINS` must list the origin of every 18xx Maker site your players
use, exactly as the browser shows it (scheme and host, no path and no trailing
slash), for example `https://18xx-maker.com`. Separate several with commas.

## Running it with Docker

The image is built from the repository root:

```shell
docker build -f server/Dockerfile -t 18xx-maker-play .
```

It listens on port 8787, runs as the non root `node` user and has a health check
on `/health`.

### Docker Compose

Compose starts the server together with Postgres (the `play` service reads the
Discord values and `PUBLIC_URL` from your shell):

```shell
export PUBLIC_URL=http://localhost:8787
export DISCORD_CLIENT_ID=...
export DISCORD_CLIENT_SECRET=...
export ALLOWED_ORIGINS=http://localhost:5173
docker compose -f server/docker-compose.yml up -d
curl -s localhost:8787/health   # {"ok":true}
```

For a public server, set `PUBLIC_URL` to its `https://` address and
`ALLOWED_ORIGINS` to the site your players use.

### Dokploy

1. Create a **Postgres** database service in the project.
2. Create an **Application** from Git (this repository). Build type
   **Dockerfile**, Dockerfile path `server/Dockerfile`, build context the
   repository root (`.`).
3. In the environment, set `DATABASE_URL` (the internal connection string of the
   database service), `PUBLIC_URL` (the domain below, with `https://`),
   `ALLOWED_ORIGINS`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` and
   optionally `DISCORD_GUILD_ID`.
4. Add a domain pointing at the container port `8787`. The websocket (`/ws`)
   works through the proxy as it is, nothing to configure.
5. Mount nothing: all state is in Postgres.

## The website and your server

The website's Content-Security-Policy allows connections to any `https:` and
`wss:` address, so any play server works from the hosted site without a rebuild:
players only enter its address in Settings. A server on a plain `http://`
address is blocked, except on `localhost` and `127.0.0.1` for testing on your
own computer.

The browser also asks the server whether the site may call it (CORS). The server
answers yes only for the origins in `ALLOWED_ORIGINS`, and only lets a login
return to those origins.

## One instance only

Run exactly **one instance**. Rooms, presence and the ordering of broadcasts
live in the process, so a second replica would miss the broadcasts of the first
and its players would not see each other's events until they reconnect.

The container handles `SIGTERM` (and `SIGINT`): it closes the websockets and the
listener, ends the database pool and exits 0, with a 5 second limit, so
`docker stop` and redeploys do not wait for a kill.

## Backups

Backups are the job of whoever runs the server. Back up the Postgres database
(games, events, assets, sessions), for example with `pg_dump` on a schedule; the
server keeps nothing else.

## Upgrading

Pull the new version, build the image again and restart the container. The
server runs its database migrations when it starts, so there is no separate
step. Migrations hold a Postgres advisory lock while they run, so they are
applied once even if two servers start at the same time.

## Security

- A sign in lasts `SESSION_TTL_DAYS` (30 days by default). An expired session is
  refused and the player signs in again. Changing the value applies to new sign
  ins only. Signing out ends the session and closes its websockets.
- Changing `DISCORD_CLIENT_SECRET` ends sign ins that are in progress (it signs
  the login `state`). Keep it secret like a password.
- A game's Discord webhook URL is stored on the server only. No endpoint returns
  it, not even to the owner, and the logs never contain it. Only
  `https://discord.com/api/webhooks/...` (or `discordapp.com`) URLs are
  accepted.
- Invite links and spectator links are secrets: anyone who has one can join or
  watch. The owner can replace either, which ends the old one at once.
- Uploaded images and fonts are served as attachments, and the site cleans SVG
  images before it draws them.

## Troubleshooting

### Redirect URI mismatch

Discord shows "Invalid OAuth2 redirect_uri" when the redirect URI of the
application is not exactly `${PUBLIC_URL}/auth/discord/callback`. Check the
scheme (`https://`), the host and that `PUBLIC_URL` has no trailing slash.

### CORS errors

When the website cannot reach the server and the browser console shows a CORS
error, or a login stops with 400, the site's origin is missing from
`ALLOWED_ORIGINS`. Add it exactly (`https://18xx-maker.com`, no trailing slash)
and restart the server.

### Websocket does not connect

If the board shows "Offline, reconnecting..." right after it loads, the
websocket upgrade on `/ws` fails: the proxy in front of the server does not pass
websockets. (A proxy that holds the connection open without answering can leave
it on "Connecting..." instead.) Turn on websocket (upgrade) support for the
domain, and serve the server on `https://` so the board connects with `wss://`.

### Creating a game fails with 422

A 422 means the server's check of the game file found errors; the Play page
lists them. Run `pnpm maker validate my-game.json` (see
[JSON Schemas](/docs/games/schemas)) and fix them. A 413 means the game file or
an image is over the server's limits (`MAX_GAME_BYTES`, `MAX_ASSET_BYTES`,
`MAX_ASSETS_PER_GAME`, `MAX_ASSET_TOTAL_BYTES`).
