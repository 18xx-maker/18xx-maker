# Play Server and Event Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A self-hostable play server (Discord login, games with seats and invites, an event log over REST and websocket) and the pure event reducer it shares with the site, ready for the board UI plan to build on.

**Architecture:** `src/play` holds the pure event validation and reducer (no React, no DOM), imported by the server and later by the site. `server/` is a Hono + `ws` + Postgres app (`pg` with plain SQL migrations) that stores games, seats and an append-only event log and fans events out per game.

**Tech Stack:** Node 24, Hono, `@hono/node-server`, `ws`, `pg`, vitest (new `server` project), Postgres 17 (docker compose locally, service container in CI).

**Spec:** `docs/superpowers/specs/2026-11-19-online-play-design.md`

This is plan 1 of 3. Plan 2 (board UI: routes, tile/token/market/tray play, history, undo UI, presence) and plan 3 (Discord webhook, docs, translations, self-hosting guide) are written after this one lands, against the real interfaces below. Phases 1 to 3 of the spec are covered here.

## Global Constraints

- Node `>=24`, ES modules, no TypeScript; Ramda is used in `src/` but `src/play` and `server/` do not need it.
- `src/play` imports nothing from React, the DOM, `fs`, `window` or `@/` aliases; it must run unchanged in the browser and in Node.
- Sandbox model: no rules, any tile on any hex, any player can undo any move, running out of tiles is a warning only (computed by the client later, never blocked on the server).
- Seats: only members with a seat may write events; spectators read only.
- Only the creator locks, archives or deletes a game. No expiry.
- Discord is the only login. Creating a game requires membership of `DISCORD_GUILD_ID` when set; empty means any signed-in user.
- Session tokens: opaque, stored hashed (SHA-256) in Postgres, sent as `Authorization: Bearer <token>`. No cookies.
- Event log: append-only, unique `(game_id, seq)`, `seq` starts at 1 with no gaps.
- Environment variables with defaults for all limits: `MAX_GAME_BYTES=2097152`, `MAX_ASSET_BYTES=1048576`, `MAX_GAMES_PER_USER=50`, `MAX_EVENTS_PER_SECOND=10`, `SNAPSHOT_EVERY=100`.
- Commit subjects follow strict Conventional Commits (`feat(server): ...`); no AI attribution; bodies pass `node scripts/check-pr-body.mjs`.
- Print output must not change: `pnpm test:run` snapshots stay untouched.
- Run before pushing: `pnpm pretty`, `pnpm lint`, `pnpm validate`, `CI=1 pnpm test:run`.

## Review Focus

- A client reconnecting with a `lastSeq` ahead of the server's (stale client after a restore): server answers with a fresh snapshot, not an error loop.
- Two events for the same `seq` at once: exactly one is stored, the other sender gets `rebase`.
- An undo of an undo (redo) and an undo targeting a `seq` that does not exist: reducer ignores the unknown target, redo restores the move.
- A game file that validates but is huge, or has an asset over the cap: rejected with a clear status before anything is stored.
- A leaked invite code after the creator regenerates it: old code stops working, existing seats stay.
- A locked or archived game: writes rejected on both REST and websocket, reads still allowed.
- OAuth callback with a `return` URL whose origin is not in `ALLOWED_ORIGINS`: refused (open redirect).
- A Discord API failure during login (guilds call fails): login fails cleanly and no half-created session remains.

---

## File Structure

| File                                                                 | Responsibility                                                          |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `src/play/events.js`                                                 | Event type names and `validateEvent` (shape only)                       |
| `src/play/reduce.js`                                                 | `initialState`, `applyEvent`, `reduce` with undo semantics, `usedTiles` |
| `src/cli/validate.js`                                                | Add exported `validateGameJson(json)` next to `validateGameFile`        |
| `server/package.json`, `pnpm-workspace.yaml`                         | New workspace package and its dependencies                              |
| `server/src/config.js`                                               | `loadConfig(env)`                                                       |
| `server/src/db.js`                                                   | `createPool`, `migrate(pool)` runner                                    |
| `server/migrations/001_init.sql`                                     | All tables                                                              |
| `server/src/auth.js`                                                 | Discord OAuth routes, session helpers, `requireUser` middleware         |
| `server/src/games.js`                                                | Game, seat, invite, asset routes                                        |
| `server/src/events.js`                                               | `appendEvent`, `eventsSince`, snapshots                                 |
| `server/src/hub.js`                                                  | Websocket hub: join, catch-up, broadcast, presence                      |
| `server/src/app.js`                                                  | `createApp({ pool, config })` wiring                                    |
| `server/src/index.js`                                                | Process entry: config, migrate, listen                                  |
| `server/test/*.js`                                                   | Test helpers: `db.js`, `discord.js` (fake Discord), `client.js`         |
| `server/Dockerfile`, `server/docker-compose.yml`, `server/README.md` | Deploy and local dev                                                    |

---

### Task 1: Event validation

**Files:**

- Create: `src/play/events.js`
- Test: `src/play/events.test.js`

**Interfaces:**

- Produces: `EVENT_TYPES` (array of the nine type strings below); `validateEvent(event: unknown): string | null` returning `null` when well formed or a short error message.

Event shapes (all objects have `type`; ids are non-empty strings, `hex` is a map hex id string, `rotation` is an integer 0 to 5):

| type           | fields                                                          |
| -------------- | --------------------------------------------------------------- |
| `tile.place`   | `hex`, `tile` (tile id), `rotation`                             |
| `tile.rotate`  | `hex`, `rotation`                                               |
| `tile.remove`  | `hex`                                                           |
| `token.place`  | `hex`, `token` (token id), `x`, `y` (numbers, hex-local offset) |
| `token.remove` | `hex`, `token`, `x`, `y`                                        |
| `market.move`  | `marker` (id), `cell` (`{ row: integer, col: integer }`)        |
| `tray.move`    | `item` (id), `from`, `to` (each `"bank"` or a seat id)          |
| `note.set`     | `text` (string, at most 10000 characters)                       |
| `undo`         | `target` (integer seq of an earlier event)                      |

- [ ] **Step 1: Write the failing tests** in `src/play/events.test.js` (unit project): `it("accepts every event type in its minimal valid form")` over a table of nine valid events asserting `validateEvent(e) === null`; `it("rejects non objects, missing or unknown type")`; `it("rejects wrong field types")` (rotation `6`, rotation `1.5`, `cell.row` a string, `x` as a string, `text` of 10001 characters, `target` `0`); `it("rejects extra properties")` (an unknown key makes the event invalid); `it("lists every type in EVENT_TYPES")` (length 9, each valid table row's `type` is included).
- [ ] **Step 2: Run** `pnpm exec vitest run --project unit src/play/events.test.js`. Expected: FAIL, module missing.
- [ ] **Step 3: Implement** `EVENT_TYPES` and `validateEvent` in `src/play/events.js` with a per-type field table (a small spec object per type, one loop checks required fields, types, and no extra keys). No dependencies.
- [ ] **Step 4: Run** the same command. Expected: PASS.
- [ ] **Step 5: Commit** `git add src/play && git commit -m "feat(play): add play event validation"`.

---

### Task 2: Event reducer with undo

**Files:**

- Create: `src/play/reduce.js`
- Test: `src/play/reduce.test.js`

**Interfaces:**

- Consumes: `validateEvent`, `EVENT_TYPES` (Task 1).
- Produces:
  - `initialState(): State` where `State = { tiles: { [hex]: { tile, rotation } }, tokens: { [hex]: [{ token, x, y }] }, market: { [marker]: { row, col } }, trays: { [owner]: string[] }, notes: string }` (`trays` keys are `"bank"` or seat ids; `"bank"` is not pre-filled).
  - `reduce(events: Array<{ seq: number, type: string, ... }>, state = initialState()): State` applying events in `seq` order with undo semantics.
  - `usedTiles(state): { [tileId]: number }` counts placed tiles by tile id.

Semantics: an `undo` event cancels its `target` event; an `undo` that is itself undone is cancelled, which restores its target (redo). Effective events are computed once by walking the list from last to first: an undo that is not itself cancelled marks its `target` cancelled; cancelled events are skipped when applying forward; `undo` events never change state themselves; an undo whose target does not exist, or is not earlier than the undo, is ignored. `tile.place` replaces any tile on that hex. `tile.rotate` and `tile.remove` on an empty hex are ignored. `token.remove` removes the first token entry equal to `{token, x, y}`. `tray.move` removes `item` from `from` (if present) and appends it to `to`; moving an item that is not in `from` still adds it to `to`. Applying never throws for a valid event.

- [ ] **Step 1: Write the failing tests** in `src/play/reduce.test.js`: `place then rotate then remove a tile`; `placing on an occupied hex replaces the tile`; `rotate and remove on an empty hex change nothing`; `tokens stack on a hex and remove by exact position`; `market.move sets and replaces a marker cell`; `tray.move moves an item between bank and a seat`; `note.set replaces the note`; `undo cancels the move it targets`; `undo of an undo restores the move (redo)`; `undo with an unknown or later target is ignored`; `replaying the same log twice gives equal states (deepEqual)`; `usedTiles counts tiles by id`.
- [ ] **Step 2: Run** `pnpm exec vitest run --project unit src/play`. Expected: FAIL.
- [ ] **Step 3: Implement** `initialState`, `reduce`, `usedTiles` in `src/play/reduce.js` (pure, immutable: copy-on-write per event; a local `applyEvent(state, event)` helper, not exported).
- [ ] **Step 4: Run** the same command. Expected: PASS. Then `pnpm lint`. Expected: clean.
- [ ] **Step 5: Commit** `git add src/play && git commit -m "feat(play): add play event reducer"`.

---

### Task 3: Validate a game from JSON

**Files:**

- Modify: `src/cli/validate.js` (next to `validateGameFile`, line 171)
- Test: `src/cli/validate.test.js`

**Interfaces:**

- Produces: `validateGameJson(json: object): { valid: boolean, validationErrors: object[], warnings: string[] }` using the existing `validate(json, undefined, gameSchema.$id)` so removed-field warnings behave exactly as for files.

- [ ] **Step 1: Write the failing test** in the existing `src/cli/validate.test.js`: `validateGameJson accepts the 18Test game` (load `src/data/games/18Test.json`, expect `valid: true`) and `validateGameJson rejects a game with an unknown top level field` (expect `valid: false`, at least one error).
- [ ] **Step 2: Run** `pnpm exec vitest run --project unit src/cli/validate.test.js`. Expected: FAIL (not exported).
- [ ] **Step 3: Implement** `export const validateGameJson = (json) => { const { valid, validationErrors, warnings } = validate(json, undefined, gameSchema.$id); return { valid, validationErrors, warnings }; }`.
- [ ] **Step 4: Run** the same command. Expected: PASS.
- [ ] **Step 5: Commit** `git add src/cli && git commit -m "feat(cli): export validateGameJson"`.

---

### Task 4: Server package, config, database, migration

**Files:**

- Create: `server/package.json`, `server/src/config.js`, `server/src/db.js`, `server/migrations/001_init.sql`, `server/docker-compose.yml` (Postgres 17 service `db` on `localhost:55432`, user, password and database all `play`), `server/test/db.js`
- Modify: `pnpm-workspace.yaml` (add `- "server"` to `packages`), `vitest.config.js` (new project), `.github/workflows/test.yml` (service container, see Step 7)
- Test: `server/src/config.test.js`, `server/src/db.test.js`

**Interfaces:**

- Produces:
  - `loadConfig(env: object): Config` where `Config = { port, databaseUrl, publicUrl, allowedOrigins: string[], discord: { clientId, clientSecret, guildId, apiBase, authBase }, limits: { gameBytes, assetBytes, gamesPerUser, eventsPerSecond, snapshotEvery } }`. Required: `DATABASE_URL`, `PUBLIC_URL`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`; throws an `Error` naming every missing variable. Defaults: `PORT=8787`, `ALLOWED_ORIGINS=""` (comma list), `DISCORD_GUILD_ID=""`, `DISCORD_API_BASE=https://discord.com/api`, `DISCORD_AUTH_BASE=https://discord.com/oauth2`, limits from Global Constraints.
  - `createPool(databaseUrl): pg.Pool`; `migrate(pool): Promise<string[]>` applies `server/migrations/*.sql` in filename order inside one transaction each, records them in table `schema_migrations(name text primary key)`, returns the names applied this call.
  - `server/test/db.js`: `hasDb: boolean`; `makeTestDb(): Promise<{ pool, schema, close }>` creating a unique schema per call, setting `search_path` on every connection, running `migrate`, `close` dropping the schema. When `process.env.CI` is set and `DATABASE_URL` is not, importing the module throws.

Schema in `001_init.sql` (all `created_at timestamptz not null default now()`):

- `users(id uuid pk default gen_random_uuid(), discord_id text unique not null, name text not null, avatar text, can_create boolean not null default false)`
- `sessions(token_hash text pk, user_id uuid not null references users on delete cascade)`
- `games(id uuid pk default gen_random_uuid(), title text not null, owner_id uuid not null references users, game_json jsonb not null, config_json jsonb not null default '{}', invite_code text unique not null, status text not null default 'active' check (status in ('active','locked','archived')))`
- `seats(game_id uuid references games on delete cascade, user_id uuid references users, name text not null, color text, primary key (game_id, user_id))`
- `game_assets(game_id uuid references games on delete cascade, name text not null, content_type text not null, data bytea not null, primary key (game_id, name))`
- `events(game_id uuid references games on delete cascade, seq integer not null, user_id uuid not null references users, type text not null, payload jsonb not null, primary key (game_id, seq))`
- `snapshots(game_id uuid references games on delete cascade, seq integer not null, state jsonb not null, primary key (game_id, seq))`

- [ ] **Step 1: Write the failing tests.** `config.test.js` (no database): `loadConfig applies defaults`, `loadConfig lists every missing required variable in the error`, `loadConfig parses ALLOWED_ORIGINS and numeric limits`. `db.test.js` (`describe.skipIf(!hasDb)`): `migrate creates every table`, `migrate is idempotent (second call returns [])`.
- [ ] **Step 2: Scaffold.** `server/package.json` (`name: "18xx-maker-play-server"`, `private`, `type: module`, scripts `start: node src/index.js`, `dependencies`: `hono`, `@hono/node-server`, `ws`, `pg`), add the workspace entry, run `pnpm install`. Add the `server` vitest project: `{ ...shared, test: { ...testShared, environment: "node", include: ["server/**/*.test.js"], name: "server" } }`.
- [ ] **Step 3: Run** `pnpm exec vitest run --project server`. Expected: FAIL (modules missing).
- [ ] **Step 4: Implement** `config.js`, `db.js`, `001_init.sql`, `server/test/db.js`.
- [ ] **Step 5: Run** `docker compose -f server/docker-compose.yml up -d db` then `DATABASE_URL=postgres://play:play@localhost:55432/play pnpm exec vitest run --project server`. Expected: PASS.
- [ ] **Step 6: Verify the skip.** Run `pnpm exec vitest run --project server` without `DATABASE_URL`. Expected: `config` tests pass, `db` tests skipped.
- [ ] **Step 7: CI.** In `.github/workflows/test.yml`, `linux-shards` job: add a `services.postgres` (image `postgres:17`, env user, password and db `play`, health check `pg_isready`, port `5432`) and `env: DATABASE_URL: postgres://play:play@localhost:5432/play` on the vitest step. The desktop jobs already run `--project unit` only.
- [ ] **Step 8: Commit** `git add server pnpm-workspace.yaml pnpm-lock.yaml vitest.config.js .github/workflows/test.yml && git commit -m "feat(server): add play server package, config and schema"`.

---

### Task 5: Discord login and sessions

**Files:**

- Create: `server/src/auth.js`, `server/src/app.js`, `server/test/discord.js`
- Test: `server/src/auth.test.js`

**Interfaces:**

- Consumes: `loadConfig`, `makeTestDb` (Task 4).
- Produces:
  - `createApp({ pool, config }): Hono` (Task 5 adds `GET /health` returning `{ ok: true }` and mounts auth; later tasks mount more). CORS allows `config.allowedOrigins` with the `Authorization` header.
  - `GET /auth/discord/login?return=<url>`: refuses (400) a `return` whose origin is not in `allowedOrigins`; otherwise stores `{state, return}` in a signed, short lived (10 minutes) cookie-free record (table is not needed: encode as an HMAC-signed `state` parameter with `DISCORD_CLIENT_SECRET` as the key, payload = `{ return, exp }`) and redirects to `${authBase}/authorize` with scope `identify guilds`, `redirect_uri=${publicUrl}/auth/discord/callback`.
  - `GET /auth/discord/callback?code&state`: verifies `state`, exchanges the code at `${apiBase}/oauth2/token`, fetches `${apiBase}/users/@me` and `${apiBase}/users/@me/guilds`, upserts `users` by `discord_id` (name, avatar, `can_create = guildId === "" || guilds.some(g => g.id === guildId)`), creates a session (32 random bytes, base64url; stores SHA-256 hex), redirects to `${return}#token=<token>`.
  - `requireUser(pool)` Hono middleware: reads `Authorization: Bearer`, hashes, loads the user into `c.set("user", { id, name, avatar, canCreate })`, else 401.
  - `GET /me` returns that user; `POST /auth/logout` deletes the session row.
  - `server/test/discord.js`: `startFakeDiscord({ users: [{ code, id, username, avatar, guilds: [id] }] }): Promise<{ url, close }>` implementing `/oauth2/token`, `/users/@me`, `/users/@me/guilds` over `http`.

- [ ] **Step 1: Write the failing tests** (`describe.skipIf(!hasDb)`, using `app.request`): `login redirects to Discord with the state and scopes`; `login refuses a return origin that is not allowed`; `callback creates a user and a session and redirects with the token`; `callback sets can_create false for a user outside the guild and true inside`; `callback with a bad or expired state returns 400`; `callback when the Discord guilds call fails returns 502 and creates no session`; `GET /me with the token returns the user, without it 401`; `logout invalidates the token`; `the session table stores a hash, never the token`.
- [ ] **Step 2: Run** `DATABASE_URL=... pnpm exec vitest run --project server server/src/auth.test.js`. Expected: FAIL.
- [ ] **Step 3: Implement** `auth.js`, `app.js`, `test/discord.js`. Use `node:crypto` (`createHmac`, `randomBytes`, `createHash`, `timingSafeEqual`) and global `fetch`.
- [ ] **Step 4: Run** the same command. Expected: PASS.
- [ ] **Step 5: Commit** `git add server && git commit -m "feat(server): add discord login and sessions"`.

---

### Task 6: Games, seats, invites and assets

**Files:**

- Create: `server/src/games.js`
- Modify: `server/src/app.js` (mount `games` routes behind `requireUser`)
- Test: `server/src/games.test.js`

**Interfaces:**

- Consumes: `requireUser` (Task 5), `validateGameJson` (Task 3, imported with a relative path `../../src/cli/validate.js`).
- Produces (JSON in and out, all require a user unless noted):
  - `POST /games` body `{ game: object, config?: object, seatName?: string }` → `201 { id, inviteCode }`. 403 when `!canCreate`; 413 over `MAX_GAME_BYTES` (measured on the JSON body); 422 `{ errors }` when `validateGameJson` is invalid; 429 over `MAX_GAMES_PER_USER` active or locked games owned. Title is `game.info.title` (falls back to `"Untitled"`). The creator gets a seat.
  - `GET /games` → games the user has a seat in: `[{ id, title, status, ownerId, updatedAt }]` (`updatedAt` = last event time or creation).
  - `GET /games/:id` → `{ id, title, status, ownerId, game, config, seats: [{ userId, name, color }], inviteCode }`; the invite code is included only for the owner. 404 for a non-member.
  - `GET /invites/:code` (no auth) → `{ gameId, title }` or 404.
  - `POST /invites/:code/join` body `{ name, color? }` → seat created (idempotent: an existing seat is returned unchanged). 410 when the game is not `active`.
  - `POST /games/:id/invite` (owner) → regenerates the code, returns `{ inviteCode }`.
  - `PATCH /games/:id` (owner) body `{ status: "active" | "locked" | "archived" }`.
  - `DELETE /games/:id` (owner) → 204.
  - `PUT /games/:id/assets/:name` (owner, raw body, `Content-Type` kept) → 204; 413 over `MAX_ASSET_BYTES`; `GET /games/:id/assets/:name` (member) returns the bytes with the stored type and `X-Content-Type-Options: nosniff` and `Content-Disposition: attachment`.

- [ ] **Step 1: Write the failing tests** (`describe.skipIf(!hasDb)`; helper in the test file creates users with sessions directly in the database): `creates a game from 18Test and the creator has a seat`; `rejects creation when can_create is false`; `rejects an invalid game with 422 and errors`; `rejects an oversize game with 413`; `caps games per user`; `a non member gets 404 for a game`; `only the owner sees the invite code`; `joining by invite creates a seat and is idempotent`; `a regenerated invite code makes the old code 404 and keeps seats`; `joining a locked game returns 410`; `only the owner can lock, archive, delete, regenerate or upload assets`; `delete removes seats, events and assets`; `asset upload over the cap returns 413`; `asset download sets nosniff and attachment`.
- [ ] **Step 2: Run** `DATABASE_URL=... pnpm exec vitest run --project server server/src/games.test.js`. Expected: FAIL.
- [ ] **Step 3: Implement** `games.js` (queries in `pg` parameterised SQL; invite codes are 16 random bytes base64url).
- [ ] **Step 4: Run** the same command, then the whole server project. Expected: PASS.
- [ ] **Step 5: Commit** `git add server && git commit -m "feat(server): add games, seats, invites and assets"`.

---

### Task 7: Event store with snapshots

**Files:**

- Create: `server/src/events.js`
- Test: `server/src/events.test.js`

**Interfaces:**

- Consumes: `validateEvent`, `reduce`, `initialState` (Tasks 1 and 2), `makeTestDb` (Task 4).
- Produces:
  - `appendEvent(pool, config, { gameId, userId, seq, event }): Promise<{ ok: true, seq: number } | { ok: false, reason: "not_member" | "locked" | "invalid" | "conflict", message?: string, currentSeq?: number }>`. In one transaction: confirm a seat and `status = 'active'`; `validateEvent`; for `undo`, `target` must be an existing `seq` lower than this one (else `invalid`); insert `(gameId, seq, userId, type, payload)` where `payload` is the event without `type`; a unique violation returns `conflict` with `currentSeq` (the real last seq). `seq` must equal last seq + 1 (else `conflict`). After inserting, when `seq % config.limits.snapshotEvery === 0`, write a snapshot of `reduce(allEvents)`.
  - `eventsSince(pool, gameId, afterSeq): Promise<Array<{ seq, userId, type, ... }>>` ordered by seq, each row as the event object plus `seq` and `userId`.
  - `loadSnapshot(pool, gameId): Promise<{ seq, state } | null>` the latest snapshot.
  - `lastSeq(pool, gameId): Promise<number>` (0 when none).

- [ ] **Step 1: Write the failing tests** (`describe.skipIf(!hasDb)`): `appends events with consecutive seq`; `rejects a non member`; `rejects writes to a locked game`; `rejects an invalid event with a message`; `rejects seq that is not last plus one with conflict and the current seq`; `two concurrent appends for the same seq store exactly one and report conflict for the other` (run both with `Promise.all`); `undo must target an earlier existing seq`; `eventsSince returns only later events in order`; `a snapshot is written every snapshotEvery events and equals reduce of the log`; `loadSnapshot returns null before the first snapshot`.
- [ ] **Step 2: Run** `DATABASE_URL=... pnpm exec vitest run --project server server/src/events.test.js`. Expected: FAIL.
- [ ] **Step 3: Implement** `events.js`. Import the reducer with `../../src/play/reduce.js`. The row-to-event conversion lives here; the reducer receives `{ seq, type, ...payload }`.
- [ ] **Step 4: Run** the same command. Expected: PASS.
- [ ] **Step 5: Commit** `git add server && git commit -m "feat(server): add event log with snapshots"`.

---

### Task 8: Websocket hub

**Files:**

- Create: `server/src/hub.js`, `server/test/client.js`, `server/src/index.js`
- Modify: `server/src/app.js` (export `createServer({ pool, config })` that attaches the hub to the HTTP server)
- Test: `server/src/hub.test.js`

**Interfaces:**

- Consumes: `appendEvent`, `eventsSince`, `loadSnapshot`, `lastSeq` (Task 7); sessions (Task 5).
- Produces:
  - `createServer({ pool, config }): http.Server` using `@hono/node-server`'s `createAdaptorServer` and a `ws` `WebSocketServer` on path `/ws` handled in the `upgrade` event.
  - `server/src/index.js`: loads `process.env`, runs `migrate`, calls `createServer(...).listen(config.port)`.
  - Protocol, JSON text frames. Client to server: `{ t: "join", token, gameId, lastSeq }`, `{ t: "event", seq, event }`. Server to client: `{ t: "joined", seq, seats, presence }` followed by either `{ t: "events", events }` (when `lastSeq <= current` and a gap is replayable) or `{ t: "snapshot", seq, state, events }` (when `lastSeq > current`, or more than `snapshotEvery * 5` events behind: state from `loadSnapshot` plus events after it); `{ t: "event", event }` broadcast to everyone in the game including the sender (the stored event with `seq` and `userId`); `{ t: "rebase", currentSeq }` to the sender on `conflict`; `{ t: "error", code, message }` for `not_member`, `locked`, `invalid`, `bad_token`, `rate_limited`; `{ t: "presence", users: [userId] }` whenever someone joins or leaves. A socket must `join` within 10 seconds or is closed with code 4001. Spectators (no seat) may join and read; their `event` frames get `error not_member`. A sender over `limits.eventsPerSecond` gets `rate_limited` and the frame is dropped.

- [ ] **Step 1: Write the failing tests** (`describe.skipIf(!hasDb)`; `server/test/client.js` exposes `connect(url): { send(obj), next(type): Promise<msg>, close() }` over the `ws` package; each test starts a real server on port 0): `join with a bad token returns bad_token`; `join returns joined and the full history for lastSeq 0`; `reconnect with lastSeq gets only the missing events`; `lastSeq ahead of the server gets a snapshot, not an error` (Review Focus); `an event is stored and broadcast to all clients in the game, including the sender`; `clients of another game receive nothing`; `a stale seq gets rebase with the current seq and nobody else sees the event`; `two clients sending the same seq: one event stored, the other gets rebase` (Review Focus); `a spectator can read but their event gets not_member`; `a locked game rejects events`; `presence updates on join and close`; `a socket that never joins is closed with 4001` (use a short test override via `config.limits`-style `joinTimeoutMs`, default 10000 added to `Config.limits`); `rate limit drops frames over the limit`.
- [ ] **Step 2: Run** `DATABASE_URL=... pnpm exec vitest run --project server server/src/hub.test.js`. Expected: FAIL.
- [ ] **Step 3: Implement** `hub.js` (a `Map<gameId, Set<ws>>`, per-socket state `{ userId, gameId, windowCount }`) and `index.js`. Add `joinTimeoutMs` (env `JOIN_TIMEOUT_MS`, default 10000) to `loadConfig` and its test in Task 4's `config.test.js`.
- [ ] **Step 4: Run** the same command, then the whole server project. Expected: PASS.
- [ ] **Step 5: Commit** `git add server && git commit -m "feat(server): add websocket hub for game events"`.

---

### Task 9: Two player end to end test

**Files:**

- Create: `server/test/e2e.test.js` (matches the server project glob)

**Interfaces:**

- Consumes: everything above through HTTP and websocket only, plus `startFakeDiscord` (Task 5).

- [ ] **Step 1: Write the test** `two players play a short game through the real server`: start fake Discord (two users, both in the guild), start the server on port 0, run login for both via the redirect flow (follow redirects manually, read the `#token=`), player A `POST /games` with `18Test.json`, `POST /invites/:code/join` as B, both connect and `join`, A sends `tile.place`, B receives it, B sends `token.place`, A receives it, A sends `undo` of B's move, both receive it, B disconnects and reconnects with its old `lastSeq` and receives the missing events, then `reduce` of `eventsSince` on both ends equals the state each client computed live (compare with `deepEqual` after reducing `reduce(events)` from `src/play/reduce.js`).
- [ ] **Step 2: Run** `DATABASE_URL=... pnpm exec vitest run --project server server/test/e2e.test.js`. Expected: PASS (all code exists; a failure is a real bug to fix in the owning task's file).
- [ ] **Step 3: Commit** `git add server && git commit -m "test(server): add two player end to end test"`.

---

### Task 10: Container, compose and self-hosting readme

**Files:**

- Create: `server/Dockerfile`, `server/README.md`, `.dockerignore` rule if the root has none for `server/node_modules`
- Modify: `server/docker-compose.yml` (add the `play` service next to `db`), `.github/workflows/test.yml` (a `server-image` job)

**Interfaces:**

- Produces: an image built with the repo root as context (`docker build -f server/Dockerfile .`) containing `server/` and only the shared files it imports: `src/play`, `src/cli/validate.js`, `src/cli/util.js`, `src/util/gameValidation.js`, `src/util/testGames.js`, `src/schemas`, and the root `package.json` (for the `#cli/*`, `#util/*` imports). `CMD ["node", "server/src/index.js"]`, `EXPOSE 8787`, a `HEALTHCHECK` hitting `/health`, runs as the non root `node` user.

- [ ] **Step 1: Build** the image: `docker build -f server/Dockerfile -t 18xx-maker-play .`. Expected: success. If a transitive import is missing at runtime, add the file to the `COPY` list rather than copying all of `src`.
- [ ] **Step 2: Run** `docker compose -f server/docker-compose.yml up -d` with `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` and `PUBLIC_URL=http://localhost:8787` in the environment, then `curl -s localhost:8787/health`. Expected: `{"ok":true}`.
- [ ] **Step 3: Write** `server/README.md`: what it is, environment variable table (name, default, meaning) copied from `loadConfig`, Discord application setup (redirect URI `${PUBLIC_URL}/auth/discord/callback`, scopes `identify guilds`), a Dokploy note (set the variables, mount nothing, Postgres is external), backups are the host's job, and local dev (`docker compose up -d db`, `pnpm --filter 18xx-maker-play-server start`).
- [ ] **Step 4: CI.** Add a `server-image` job to `test.yml` that runs `docker build -f server/Dockerfile .` on `ubuntu-latest` (no push).
- [ ] **Step 5: Verify** `pnpm pretty && pnpm lint && pnpm validate && CI=1 DATABASE_URL=postgres://play:play@localhost:55432/play pnpm test:run`. Expected: all pass, snapshot files unchanged (`git status tests/__snapshots__` is clean).
- [ ] **Step 6: Commit** `git add server .github && git commit -m "build(server): add play server image and self-hosting readme"`.

---

## Self-Review

- **Spec coverage:** event log, reducer, undo, Discord login, guild gate, invites, seats, assets, game file stored, locking and deletion, snapshots, websocket catch-up, rate and size limits, bearer tokens, CORS origins, Docker image and Dokploy notes, Postgres in CI are all tasks above. Deferred to plans 2 and 3 on purpose: the `/play` routes and board UI, supply warnings (the reducer gives `usedTiles`, the client compares it with tile quantities), the server URL setting, Discord channel webhook, docs, translations, the schema field for per game config (stored as free `config_json` here; plan 2 decides its keys with the board).
- **Deviations from the spec, my calls:** `pg` with plain SQL migrations instead of Drizzle or Kysely (smaller, nothing to learn); the OAuth `state` is an HMAC-signed token instead of a database row; the `guilds` scope is used for the guild check (no bot token); `tray.move` items and ids are free strings so plan 2 can model privates and trains without a server change.
- **Types checked:** `seq` is an integer everywhere; `event` frames carry `{ seq, userId, type, ...payload }` on the way out and `{ type, ...fields }` on the way in; `reduce` takes events with `seq`.
- **Proportion:** the plan holds signatures, protocol and tests, no function bodies.
