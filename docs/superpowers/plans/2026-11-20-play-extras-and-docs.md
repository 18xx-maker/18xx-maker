# Play Extras, Hardening and Docs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish online play: harden the server, close the login CSRF hole, add per-game Discord notices, a read-only spectator link, the game's own images on the board, a two-browser end-to-end test, and the docs (en, de, zh) with a self-hosting guide.

**Architecture:** Server changes are small modules next to `server/src` (`webhook.js`, `watch` routes in `games.js`, a hub spectator mode) plus migration `002`. Client changes extend `usePlayGame`, `PlayBoard`, `OwnerMenu` and `useApi`. Nothing here changes the event protocol for players.

**Tech Stack:** Node 24, Hono, `ws`, `pg`; React 19, Vitest (unit, component, server), Playwright; markdown docs.

**Specs and context:** `docs/superpowers/specs/2026-11-19-online-play-design.md`; plan 1 (server and event core) and plan 2 (`docs/superpowers/plans/2026-11-19-play-board-ui.md`, PR 1107) are built. Wire protocol: `server/README.md`.

**Branch:** stacked on PR 1107. Create `claude/play-extras` from `claude/play-board-ui`; its PR has `claude/play-board-ui` as base.

## Global Constraints

- Print output is the contract: `CI=1 pnpm test:run` changes zero snapshot bytes.
- Server tests run against real Postgres (`DATABASE_URL=postgres://play:play@localhost:55432/play` locally, a CI service container) with the fake Discord in `server/test/discord.js`. New server behavior has a test through the real HTTP/websocket surface, not only unit tests.
- A migration is a new file `server/migrations/00N_*.sql`; never edit `001_init.sql`. Migrations stay idempotent per `schema_migrations`.
- Secrets stay server side: the webhook URL is never returned by any endpoint (owner included) and never logged; spectator and invite codes are never logged.
- Every new server env var is a positive integer or a URL, validated in `server/src/config.js`, documented in the `server/README.md` table, and covered in `server/src/config.test.js`.
- Every new UI string is in `src/locales/{en,de,zh}.json` with identical keys, order and `{{vars}}`; German informal "du". Docs: any new or changed page has `.en.md`, `.de.md` and `.zh.md` with the same heading count, no `#anchor` link that does not exist (`src/docs/links.test.js`), and `docs.*` title and description keys in all three locales.
- New routes go in `routePatterns` with a smoke entry and `data-testid`; routing only through `src/router`.
- Commits: Conventional, no AI attribution. PR body checked with `node scripts/check-pr-body.mjs`. Commit with `CI=true git commit` (the pre-commit hook's pnpm check aborts without a TTY).

## Review Focus

- Logout, session expiry and an expired token on an open websocket: the socket is closed (4003) and cannot send afterwards. Test over the real hub.
- A spectator can never send an event, appears nowhere in `presence`, never receives a secret (invite code, webhook, other users' session data), and loses access the moment the owner revokes the link (open sockets closed).
- Webhook failures (Discord 404/429/5xx, timeout, invalid URL) never delay, fail or reorder a game event; a deleted webhook (404/401) switches notices off for that game; no message ever contains `@everyone`, `@here` or user-supplied mentions (`allowed_mentions: { parse: [] }`) and note text is excluded or length-capped.
- Login nonce: a callback whose fragment nonce differs from the one the browser stored is refused client side and never stores the token; a replayed or missing nonce is refused; the nonce is never in a query string sent to a third party beyond the signed state.
- Caps: per-game asset count and total bytes, per-game event count, games-per-user when reactivating an archived game: each rejects cleanly (4xx with a message) without partial writes.
- Server game assets on the board: SVG from the server is passed through `sanitizeAssets` before it is drawn; a missing, oversize or malformed asset degrades to the existing placeholder and never throws.
- Docs links and anchors in all three languages; the self-hosting guide's commands are the ones in `server/README.md` (no drift).

---

## File Structure

| File                                                                   | Responsibility                                                                        |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `server/migrations/002_extras.sql`                                     | `sessions.expires_at`, `games.webhook_url`, `games.watch_code`.                       |
| `server/src/webhook.js`                                                | `createNotifier({ pool, config, fetch, schedule })`: batching, rate limit, line text. |
| `server/src/games.js`, `auth.js`, `hub.js`, `db.js`, `config.js`       | Hardening, nonce, watch routes, spectator join, webhook settings.                     |
| `src/play/client/api.js`, `socket.js`, `useApi.jsx`, `usePlayGame.js`  | Nonce, watch mode, asset listing.                                                     |
| `src/components/play/*`, `src/components/pages/play/PlayWatchPage.jsx` | Owner menu items, watch page, banner.                                                 |
| `e2e/play.spec.js`, `e2e/support/play-server.mjs`                      | Two-browser end-to-end test.                                                          |
| `src/docs/play.*.md`, `src/docs/play-server.*.md`                      | Docs and self-hosting guide.                                                          |

### Task 1: Server hardening

**Files:**

- Create: `server/migrations/002_extras.sql` (sessions part)
- Modify: `server/src/{auth,hub,games,db,config}.js`, `server/README.md`
- Test: `server/src/config.test.js`, `server/test/{auth,games,hub,db}.test.js` (extend or add)

**Interfaces:**

- Produces: env `SESSION_TTL_DAYS` (default 30), `DISCORD_TIMEOUT_MS` (10000), `MAX_ASSETS_PER_GAME` (50), `MAX_ASSET_TOTAL_BYTES` (8388608), `MAX_EVENTS_PER_GAME` (200000) in `config.limits` / `config.discord`; `attachHub` returns `{ close, closeToken(tokenHash), closeGame(gameId) }` (extend what exists).

- [ ] **Step 1: Failing tests.**
  - Session expiry: a session older than the TTL is refused by `requireUser` (401) and by websocket `join` (`bad_token`, 4003); a login deletes the user's expired sessions.
  - Logout closes the user's open sockets that joined with that token (4003) and later frames are ignored; another session's sockets stay open.
  - A socket whose session expired mid-connection is closed on its next `event` frame.
  - Discord fetch: a hung Discord endpoint (fake that never answers) fails the callback within `DISCORD_TIMEOUT_MS` with a 502-style error, not a hang.
  - `?error=access_denied` on the callback with a valid state redirects to `return#error=access_denied`; an invalid state still 400.
  - `migrate` run twice concurrently against one database applies each file once (advisory lock).
  - Asset caps: the 51st asset and a total over the byte cap get 413 with a message, no row written; overwriting an existing name does not count twice.
  - Event cap: the append past `MAX_EVENTS_PER_GAME` returns `invalid` ("game is full") and writes nothing.
  - PATCH `{status:"active"}` on an archived game past `gamesPerUser` active/locked games gets 409.
- [ ] **Step 2: Implement.** `sessions.expires_at timestamptz not null default now() + interval '30 days'` is set per row from the config at insert (the SQL default only backfills); both lookups add `and expires_at > now()`. `migrate` takes `pg_advisory_lock(<constant>)` for its duration. `discordFetch` uses `AbortSignal.timeout`. The hub keeps `tokenHash` per socket state. Each cap is checked inside the same transaction that writes.
- [ ] **Step 3: Verify** `DATABASE_URL=... pnpm exec vitest run --project server`, `pnpm lint`, `pnpm exec prettier --check server`.
- [ ] **Step 4: Commit** `fix(server): expire sessions, cut sockets on logout, add caps and timeouts`.

### Task 2: Login nonce and Discord error return

**Files:**

- Modify: `server/src/auth.js`, `src/play/client/api.js`, `src/components/play/useApi.jsx`, `src/locales/{en,de,zh}.json`, `server/README.md`
- Test: `server/test/auth.test.js`, `server/test/e2e.test.js` (login helper), `src/play/client/api.test.js`, `tests/play/pages.test.jsx`

**Interfaces:**

- Produces: `api.loginUrl(returnUrl, nonce)` adds `&nonce=<nonce>` (base64url, 16 to 64 chars, validated server side); the signed state carries the nonce; the callback redirects to `return#token=<token>&nonce=<nonce>`; `readState` returns `{ return, nonce }`. The client generates the nonce with `crypto.getRandomValues`, keeps it in `sessionStorage` (`play-login-nonce`, try/catch) and, on return, accepts the fragment only when its nonce equals the stored one, then deletes it.

- [ ] **Step 1: Failing tests.** Server: login without a valid nonce is 400; the redirect fragment has `token` and the same `nonce`; a tampered state is refused. Client: fragment with a different or missing nonce stores no token, clears the hash and shows an error message ("Sign in did not complete, try again"); a matching nonce stores the token and clears the nonce; the `#error=access_denied` fragment shows a "Discord sign in was cancelled" message. Update the real-server integration test helper to send the nonce.
- [ ] **Step 2: Implement** both sides; the fragment parser reads `URLSearchParams` instead of a regex; keep stripping any `#token=`/`#error=` fragment as today.
- [ ] **Step 3: Verify** server project, `pnpm exec vitest run --project component tests/play`, `pnpm exec vitest run --project unit src/play src/locales`, lint, prettier.
- [ ] **Step 4: Commit** `fix(play): bind the login to the browser with a nonce`.

### Task 3: Discord webhook notices (server)

**Files:**

- Create: `server/src/webhook.js`
- Modify: `server/migrations/002_extras.sql` (webhook column), `server/src/{games,hub,config,app}.js`, `server/README.md`
- Test: `server/src/webhook.test.js`, `server/test/webhook.test.js`

**Interfaces:**

- Produces: `PATCH /games/:id` accepts `{ webhookUrl: string|null }` (owner; `null` clears); only `https://discord.com/api/webhooks/<id>/<token>` and `https://discordapp.com/api/webhooks/...` accepted, else 400; `GET /games/:id` returns `webhookSet: boolean` for the owner only and never the URL; env `WEBHOOK_BATCH_MS` (5000) and `WEBHOOK_MAX_PER_MINUTE` (10); `createNotifier({ pool, config, fetch, schedule }).notify(gameId, line)` collecting lines per game and posting `{ content, allowed_mentions: { parse: [] } }` once per batch window, at most `WEBHOOK_MAX_PER_MINUTE` posts per game per minute (excess lines merge into the next post), content capped at 1900 characters. `describeEvent(event, seatName)` (server side, English) covers the nine event types and never includes note text. A webhook answering 401/404 clears `webhook_url`; other failures drop the batch and are logged without the URL. The hub calls `notify` after a successful append, fire and forget, inside no lock. Setting a webhook posts one "Notifications connected" line.
- Config: `DISCORD_WEBHOOK_ORIGIN` (default `https://discord.com`, only changed in tests) is what the URL validation and the test fake use.

- [ ] **Step 1: Failing tests.** Unit (fake fetch, manual scheduler): batching merges lines into one post; rate limit; 1900-character cap; `allowed_mentions`; 404 clears the column; 429 and timeouts do not throw; note text excluded; seat-name fallback. Integration (fake Discord extended with a recording `POST /webhooks/:id/:token` route): the owner sets a webhook, two moves produce one post with two lines, a non-owner gets 403, an invalid URL 400, the URL never appears in any GET, clearing stops posts, and a slow webhook does not delay event delivery to the other player.
- [ ] **Step 2: Implement.** Seat names come from one query per batch flush, not per event.
- [ ] **Step 3: Verify** server project, lint, prettier.
- [ ] **Step 4: Commit** `feat(server): post batched move notices to a discord webhook`.

### Task 4: Webhook settings in the owner menu

**Files:**

- Create: `src/components/play/WebhookDialog.jsx`
- Modify: `src/components/play/OwnerMenu.jsx`, `src/hooks/usePlayGame.js` (expose `webhookSet`), `src/play/client/api.js` (`setWebhook(id, url|null)`), `src/locales/{en,de,zh}.json`
- Test: `tests/play/webhook.test.jsx`, `src/play/client/api.test.js`

**Interfaces:**

- Consumes: Task 3 endpoints. Produces: menu item "Discord notifications" opening a Dialog with a password-type URL input (value never shown back), Save, Remove (when `webhookSet`), validation hint for the URL pattern.

- [ ] **Step 1: Failing tests.** Item visible to the owner only; saving calls `PATCH {webhookUrl}` once and shows success; an invalid URL is refused client side without a request; remove sends `null`; a 400 shows the server message; the URL is not rendered anywhere after save; pending guard like the other owner actions.
- [ ] **Step 2: Implement** with `Dialog`, `Input`, `Button`; follow `OwnerMenu`'s pending-guard pattern.
- [ ] **Step 3: Verify** component tests for `tests/play`, locale test, snapshots (`CI=1`, zero changes), lint, prettier.
- [ ] **Step 4: Commit** `feat(play): set a discord webhook from the owner menu`.

### Task 5: Spectator link (server)

**Files:**

- Modify: `server/migrations/002_extras.sql` (watch column), `server/src/{games,hub,app}.js`, `server/README.md`
- Test: `server/test/watch.test.js`

**Interfaces:**

- Produces: owner endpoints `POST /games/:id/watch` (creates or rotates; returns `{ watchCode }`) and `DELETE /games/:id/watch` (204, closes open spectator sockets of that game); `GET /games/:id` returns `watchCode` to the owner only; public `GET /watch/:code` returns `{ gameId, title }` (404 for unknown) ; `GET /watch/:code/game` returns `{ id, title, status, game, config, seats: [{ userId, name, color }], assets: [names] }` (no invite code, no webhook, no owner id); `GET /watch/:code/assets/:name`; websocket `join` frame accepts `{ t:"join", watch: "<code>", lastSeq }` instead of a token: the socket is read-only, is not listed in `presence`, receives `joined` (with seats and `spectator: true`), catch-up, live events and presence; any `event` frame from it gets an `error` frame (`not_member`) and nothing is appended. Spectator sockets are counted against a per-game limit `MAX_SPECTATORS` (default 50). CORS allows the new routes like the others. Watch codes: 16 random bytes base64url like invite codes.
- Also add to `GET /games/:id` (seat holders): `assets: [names]` (used by Task 7).

- [ ] **Step 1: Failing tests** through the real server: create/rotate (old code stops working, open spectator sockets closed on rotate and on delete); a spectator receives live events and catch-up but `presence` never lists it; an `event` frame from it appends nothing; `/watch/:code/game` has none of `inviteCode`, `webhook*`, `ownerId`; archived games still watchable? (ruling: yes, read-only); the spectator limit; unknown code 404 with no timing-distinguishable path beyond a constant-time compare is not required.
- [ ] **Step 2: Implement.**
- [ ] **Step 3: Verify** server project, lint, prettier.
- [ ] **Step 4: Commit** `feat(server): add a read-only spectator link`.

### Task 6: Watch page and spectator mode (client)

**Files:**

- Create: `src/components/pages/play/PlayWatchPage.jsx`
- Modify: `src/routes.jsx`, `src/play/client/{api,socket}.js`, `src/hooks/usePlayGame.js`, `src/components/play/{PlayBoard,OwnerMenu}.jsx`, `tests/support/smoke.js`, `src/util/analytics.js` (mask `/play/watch/<code>`), `src/locales/{en,de,zh}.json`
- Test: `tests/play/watch.test.jsx`, `src/play/client/socket.test.js`, `src/util/analytics.test.js`

**Interfaces:**

- Produces: route `/play/watch/:code` (testid `play-watch`, declared before `/play/:id`); `api.watchInfo(code)`, `api.watchGame(code)`, `api.watchAsset(code, name)`, `api.newWatch(id)`, `api.deleteWatch(id)`; `createSession({ ..., watch })` joins with `{ t:"join", watch, lastSeq }` and never sends events (`send` throws); `usePlayGame({ baseUrl, watch })` returns `spectator: true`, `locked: true`; the board shows a "Watching" banner, no Undo, no owner menu, all actions disabled. Owner menu items: "Spectator link" (create/copy), "Stop spectator link". Needs no sign in.

- [ ] **Step 1: Failing tests.** Watch page without sign in loads and shows the board read-only with live updates from a fake session; no request carries an `Authorization` header; an unknown code shows "Link not found" with a way back; the owner can create, copy (link `<origin>/play/watch/<code>`, encoded), rotate and stop; the analytics path is masked; socket test: watch join frame, `send` throws, reconnect keeps `watch`.
- [ ] **Step 2: Implement.** Reuse `PlayBoard`; pass `readOnly` through `locked`.
- [ ] **Step 3: Verify** component and unit tests, locale test, snapshots (zero change), lint, prettier.
- [ ] **Step 4: Commit** `feat(play): add the spectator link and watch page`.

### Task 7: The game's own images on the board

**Files:**

- Modify: `src/hooks/usePlayGame.js` (fetch assets), `src/hooks/assets.js`, `src/context/GameContext.js` (value gains `assets`), `src/components/play/PlayBoard.jsx`
- Create: `src/play/client/assets.js` (`loadAssets({ api|watch, names, gameId }): Promise<Assets>`)
- Test: `src/play/client/assets.test.js`, `tests/play/assets.test.jsx`

**Interfaces:**

- Consumes: `assets: [names]` from `GET /games/:id` and `/watch/:code/game` (Task 5); `getAsset`/`watchAsset` blobs; `sanitizeAssets` (`src/util/assets.js`), `pngDataUri` and the `<kind>.<name>` naming (`src/util/assetNames.js`; split on the FIRST dot).
- Produces: `loadAssets` returns `{ icons, logos, trains }` (SVG text, PNG data URIs) built with at most 4 fetches in flight, passed through `sanitizeAssets`; `useAssets()` returns the context's `assets` when a `GameContext` is provided (still `undefined` when the context has none), and the store's assets otherwise.

- [ ] **Step 1: Failing tests.** A board over a game that references `custom/star` shows the server's SVG, not the open local game's; a script-bearing SVG is sanitized; a 404, oversize or invalid asset leaves the placeholder and no exception; names are split on the first dot; blobs become data URIs for PNG; loading failures do not block the board (it renders first, images appear when loaded).
- [ ] **Step 2: Implement.**
- [ ] **Step 3: Verify** component and unit tests, snapshots (zero change), lint, prettier.
- [ ] **Step 4: Commit** `feat(play): draw the server game's images on the board`.

### Task 8: Two-browser end-to-end test and CI

**Files:**

- Create: `e2e/play.spec.js`, `e2e/support/play-server.mjs`
- Modify: `playwright.config.js` (second `webServer` entry, started only when `DATABASE_URL` is set), `server/test/discord.js` (an `/authorize` route that redirects back with code and state, usable from a browser), `.github/workflows/test.yml` (postgres service and `DATABASE_URL` on the `e2e` job), `DEVELOPMENT.md`

**Interfaces:**

- `e2e/support/play-server.mjs` starts the real server on a fixed port (4319) with a fresh schema, the fake Discord, `ALLOWED_ORIGINS=http://localhost:4318`, and a test user table; it exits cleanly on SIGTERM. The spec is skipped without `DATABASE_URL`.

- [ ] **Step 1: Write the spec** (two browser contexts, A and B): A sets the play server URL, signs in through the fake Discord, loads the bundled `18Test` game and creates a game; B opens the invite link, signs in as another user and joins; A places a tile and B sees it within a few seconds; B undoes it and A sees it removed; A locks the game and B's board becomes read-only; a third context opens the spectator link without signing in, sees the board and cannot act; A unlocks and plays on.
- [ ] **Step 2: Wire** the web server, the Discord authorize route and the CI service.
- [ ] **Step 3: Verify** `DATABASE_URL=postgres://play:play@localhost:55432/play pnpm build && pnpm test:e2e` (all specs, including the new one) and that without `DATABASE_URL` the suite still passes with the play spec skipped.
- [ ] **Step 4: Commit** `test(play): add a two-browser end-to-end spec`.

### Task 9: Docs and self-hosting guide

**Files:**

- Create: `src/docs/play.{en,de,zh}.md`, `src/docs/play-server.{en,de,zh}.md`
- Modify: `src/components/nav/index.jsx` (two docs entries at the end of the "start" group, after `translation`), `src/locales/{en,de,zh}.json` (`docs.play.*`, `docs.playServer.*`), `src/docs/index.{en,de,zh}.md`, `src/home/home.{en,de,zh}.md`, `tests/docs/pager.test.jsx` (new neighbours), `server/README.md` (link to the guide)
- Test: existing docs tests (`src/docs/links.test.js`, `src/locales/locales.test.js`, `tests/docs/*`)

**Interfaces:** No front matter; first line `# Title`; en and de wrapped near 80 columns, zh unwrapped; internal links `[text](/docs/play#anchor)` with anchors from headings.

- [ ] **Step 1: Write `play`**: what online play is and is not (sandbox, no rules enforcement, honor-system trays); setting the server URL; signing in; creating a game from the game you have open (size limits, images); inviting; the board (tiles, tokens, market, trays, notes, history and undo, supply warnings); owner controls (lock, archive, reopen, delete, new invite); the spectator link; Discord notices; what players should know (anyone can undo, the log is permanent); limits; desktop app has no play.
- [ ] **Step 2: Write `play-server`** (self-hosting): requirements, the Discord application, every environment variable (same table as `server/README.md`, no drift), Docker and compose, Dokploy steps, the CSP note (website allows `https:`/`wss:` connections so any server URL works; `http://` works only for localhost), single instance, backups, upgrading, security notes (session lifetime, webhook handling), troubleshooting (CORS origins, redirect URI mismatch, websocket through proxies).
- [ ] **Step 3: Translate** to de ("du") and zh with the same structure and heading count; code blocks untouched; fix `#anchor` links to match translated headings.
- [ ] **Step 4: Register** nav entries, locale keys (same order in all three), links from the docs index and the home page (`::: siteonly` where the desktop app cannot use it); update pager expectations.
- [ ] **Step 5: Verify** `pnpm exec vitest run --project unit src/docs src/locales`, `pnpm exec vitest run --project component tests/docs tests/routes`, prettier, lint.
- [ ] **Step 6: Commit** `docs(play): document online play and self-hosting`.

### Task 10: Full verification and PR

**Files:** none new.

- [ ] **Step 1:** Run the full CI sequence from `CLAUDE.md` with Postgres: `pnpm pretty` (ignore untracked `.superpowers/`), `pnpm lint`, `pnpm validate`, `DATABASE_URL=... CI=1 pnpm test:run`, `pnpm build && pnpm test:e2e` (the play spec runs), `pnpm build:app && pnpm build:sb`, and `E2E_ELECTRON=1 pnpm test:export` (the Electron build is touched only by the CSP in plan 2; run it anyway). Snapshots must not change.
- [ ] **Step 2:** Look at the spectator banner, the webhook dialog and the owner menu in the built app (375 and 1280 wide, light and dark) with a mocked server, as in plan 2.
- [ ] **Step 3:** Push `claude/play-extras`, open a PR with base `claude/play-board-ui`, body checked by `node scripts/check-pr-body.mjs`, with an "Unverified" list. Do not merge.
