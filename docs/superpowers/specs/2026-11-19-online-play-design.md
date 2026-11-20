# Online Play Design

Status: draft for approval. Plan artifact: https://claude.ai/artifact/JKBHwjavRmLkVny3a1HnSw

## Intent

Let friends play a full 18xx game on the 18xx-maker website, with no install,
on a board built from the game file. A friendlier Board18: the same free-form
tabletop feel, without the admin upload, per-game player IDs and email turn
notices. The Board18 export (`src/export/b18.js`) stays; this adds a way to play
without leaving the site.

## Goals

- Sign in with Discord, create a game from a game file, share an invite link,
  play.
- One mechanism for live and by-turns play: an append-only event log pushed over
  a websocket and replayed on load.
- Self-hostable: the author runs it on Dokploy (for example
  `games.18xx-maker.com`); the site has a server URL setting so others can run
  their own.
- Print output stays byte-identical (snapshots must not change).

## Non-goals

- Rules enforcement, legality checks, turn order, automatic scoring.
- Hidden information: trays are shared state (honor system, like Board18).
- Electron app play and Board18 import (later projects).
- Accounts other than Discord.

## Anti-goals

- A second copy of the map and tile drawing code.
- A backend the static site cannot work without: with no server URL set, the
  site behaves as today.

## Decisions

| Topic       | Decision                                                                                                                                             |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Play model  | Sandbox: place and rotate tiles, place tokens, move market markers, move pieces between trays, notes.                                                |
| Sync        | Event log, websocket fan-out, catch-up by `seq` on connect. Undo is a logged compensating event.                                                     |
| Server      | Node 24, Hono, `ws`, Postgres (Drizzle or Kysely), one Docker image configured by environment.                                                       |
| Repo        | `server/` package in this repo, sharing the schema validator, tile data and the play reducer.                                                        |
| Auth        | Discord OAuth; opaque session tokens stored hashed, sent as a bearer header; token kept per server URL in localStorage.                              |
| Who creates | Members of a configured Discord server (guild id in the environment; empty means any signed-in user). Joining by invite is open to any Discord user. |
| Game file   | Stored on the server with the game, with its uploaded assets, under size caps.                                                                       |
| Board look  | Layout settings stored per game, set by the creator. Players keep only their own light or dark theme.                                                |
| Supply      | Running out of a tile or token warns and still allows the move.                                                                                      |
| Placement   | Any tile on any hex.                                                                                                                                 |
| Undo        | Anyone, any move; logged with who did it.                                                                                                            |
| Turns       | None in v1.                                                                                                                                          |
| Notices     | One optional Discord channel webhook per game, batched lines for moves.                                                                              |
| Lifecycle   | Only the creator locks, archives or deletes. No expiry.                                                                                              |
| Name        | "Play", routes under `/play`.                                                                                                                        |
| v1 scope    | Website only.                                                                                                                                        |

## Approaches considered

1. **Event-log server with a shared reducer (chosen).** One log, replay,
   undo and history for free; the reducer runs in the client and the server.
2. **Last-write-wins state blob.** Simpler, but loses history and undo and
   loses moves when two players act together.
3. **Peer-to-peer.** No server to run, but needs one online at all times,
   which fails by-turns play.

## Architecture

```text
site / app (static) --REST--> play server (Hono + ws) --> Postgres
                    --WS----> play server            --> Discord (OAuth, webhook)
```

Tables: `users` (discord_id, name, avatar), `games` (title, owner, game_json,
assets, config_json, invite_code, status), `seats` (game_id, user_id, name,
color), `events` (game_id, seq, user_id, type, payload; unique game_id and seq),
`snapshots` (game_id, seq, state; every N events).

The reducer lives in `src/play` (no React, no DOM): `state = reduce(initial(game),
events)`. Events: `tile.place`, `tile.rotate`, `tile.remove`, `token.place`,
`token.remove`, `market.move`, `tray.move`, `note.set`, `undo`. The server checks
that an event is well formed, that the sender has a seat and that its `seq` is
next; a client with a stale `seq` is told to rebase.

Client: a play server URL setting; routes `/play`, `/play/:id`,
`/play/join/:code` in `routePatterns` with smoke tests; an interactive board that
reuses the print drawing code under an interaction layer; a tile pool with
remaining counts, trays, market, history with undo, presence. New UI strings in
`en`, `de` and `zh`; a docs page in all three languages; any new game field in
the schema, `18Test.json`, `make` output and docs.

## Phases

0. Spike: two browsers share tile placements over a websocket (throwaway).
1. Server skeleton: Hono, migrations, Discord login, Dockerfile, deploy.
2. Games: upload game file and assets, seats, invite link, join.
3. Play state: reducer, events, snapshots, tests.
4. Map play: tiles, tokens, supply counts.
5. Market, trays, notes.
6. Live sync, undo, history, presence, reconnect.
7. Discord channel webhook per game.
8. Docs, translations, self-hosting guide.

## Constraints and risks

- The site and the server are different origins (and self-hosters differ
  again): use bearer tokens, not cookies, and configure allowed origins.
- Game files can contain SVG: the server stores them as data and the client
  renders them as it does any loaded game; nothing is served as HTML.
- Upload and abuse limits (file and asset size, games per user, event rate per
  socket) are environment variables with defaults.
- Webhooks: accept only `https://discord.com/api/webhooks/...`, keep the URL
  server side, rate-limit posts.
- Invites are revocable; spectator and seat links are separate.
- Postgres backups are the host's job; migrations run on start.
- Stored user data must survive every release (existing rule); the play
  settings must not change persisted state shape without a migration test.

## Testing

Reducer and server handlers: unit tests. Board: component tests. Server tests
run against a real Postgres (CI service container, `docker compose` locally)
with a fake Discord OAuth endpoint. A Playwright spec runs two browser contexts
against one server. Snapshots must not change. Follow the repo's full test run
and commit rules.

## Left to the builder

Choice of Drizzle or Kysely, the snapshot interval, exact REST shapes, the
board interaction details (selection, drag), and the guild check method
(`guilds.members.read` scope or a bot token).
