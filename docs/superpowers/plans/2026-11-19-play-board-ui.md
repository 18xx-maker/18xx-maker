# Play Board UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let people sign in, create or join a game and play it on the 18xx-maker website: an interactive board (tiles, tokens, market, trays, notes) driven by the play server's event log, with history, undo and presence.

**Architecture:** A framework-free client in `src/play/client` (REST wrapper, websocket session with catch-up and reconnect, pure history helpers) feeds a React hook that holds the event log and derives state with `reduce` from `src/play`. The board draws the server's game with the existing print components (`getMapData`, `Hex`, `Tile`, `Market`'s layout, token components) under a thin placement layer; a `GameContext` makes those components read the server game instead of the Redux game, so the Redux store, its persisted shape and the print pages are untouched.

**Tech Stack:** React 19, wouter (via `src/router`), Redux (settings only), shadcn/Radix + Tailwind, vitest unit and component projects.

**Spec:** `docs/superpowers/specs/2026-11-19-online-play-design.md` (plan 1, `docs/superpowers/plans/2026-11-19-play-server-and-event-core.md`, built the server and `src/play/{events,reduce}.js`; the wire protocol is in `server/README.md`).

**Branch:** stacked on PR 1106. Create `claude/play-board-ui` from `claude/game-distribution-18xx-maker-534654`, open its PR with that branch as base.

## Global Constraints

- Print output is the contract: `CI=1 pnpm test:run` must change zero snapshot bytes. Nothing in `src/components/pages/games` print output may change.
- With no play server URL set, the site behaves as today; `/play` pages render an explanation, never an error.
- Website only: in Electron (`capability.electron`) the play pages show a "play is available on the website" notice and make no requests.
- Redux persisted shape (`config`, `loadedGame`, `settings`) changes only by one new optional `settings.playServer` string; a migration-style test pins that old stored settings still load. Tokens are not in Redux: they live in `localStorage` key `play-tokens` as `{ [serverUrl]: token }`, behind try/catch.
- Routing only through `src/router`. New routes are in `routePatterns` (`src/routes.jsx`) and every one has a smoke entry (`tests/support/smoke.js`) with a `data-testid`.
- Every new UI string is in `src/locales/en.json`, `de.json` and `zh.json` with identical keys, order and `{{vars}}`. No hardcoded chrome text. German uses informal "du".
- Icons only from `lucide-react`; primitives only from `src/components/ui`; Tailwind classes, no new CSS files.
- Component tests render the rendered output with `renderApp` and fake `fetch`/`WebSocket` (no real server). A test that reads `window` or `localStorage` in the unit project imports `tests/support/windowStub.js` first.
- Commit messages: Conventional Commits, no AI attribution. PR body checked with `node scripts/check-pr-body.mjs`.

## Review Focus

- Token fragment: after login the URL `/play#token=...` must be stripped from the address bar and history (`replace`) and never logged or sent anywhere. Test: the token is stored, the hash is empty afterwards.
- Reconnect after a dropped socket must not duplicate or lose events: events arriving twice (live plus catch-up) apply once, a `snapshot` frame replaces the whole log. Tests in the session.
- A stale `seq` (`rebase`) resends the pending event once after catching up; two rapid local events keep their order and each gets a distinct `seq`.
- `joined.seq` is read before catch-up: the client's next `seq` is the highest seq it holds plus one, never `joined.seq` plus one.
- Undo of an undo (redo) and undo with nothing to undo: the button is disabled, no event is sent. Test over logs including an existing undo.
- Server game with a tile id that is not in the library, a hex id not on the map, or a company abbrev with no company: the board renders a placeholder and never throws (an event log is permanent, so a bad row must not brick the game).
- Server unreachable, 401 (expired or revoked token), 403/410 (locked or archived game): each shows a message and a way out (sign in again, back to the list); a locked game is read-only.
- Supply: placing a tile or token beyond its count warns and still places.

---

## File Structure

| File                            | Responsibility                                                                                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/play/client/api.js`        | `createApi({ baseUrl, token, fetch })`: typed REST calls, `ApiError` with `status`.                                                                           |
| `src/play/client/tokenStore.js` | `getToken(url)`, `setToken(url, token)`, `clearToken(url)` over `localStorage`.                                                                               |
| `src/play/client/socket.js`     | `createSession({ baseUrl, token, gameId, WebSocket, setTimeout })`: join, catch-up, send, reconnect.                                                          |
| `src/play/history.js`           | Pure: `undoTarget(log)`, `describeEvent(event)`, `supply(game, state)`.                                                                                       |
| `src/hooks/usePlayGame.js`      | React hook over `createSession`: `{ status, game, config, seats, log, state, presence, send, undo, me }`.                                                     |
| `src/context/GameContext.js`    | Optional override read by `useGame`/`useConfig`.                                                                                                              |
| `src/components/play/*`         | `PlayList`, `CreateGame`, `JoinGame`, `PlayBoard`, `PlayMap`, `PlayMarket`, `TilePanel`, `TokenPanel`, `TrayPanel`, `NotesPanel`, `HistoryPanel`, `Presence`. |
| `src/components/pages/play/*`   | Route pages `PlayPage`, `PlayJoinPage`, `PlayGamePage`.                                                                                                       |

### Task 1: Server URL setting and token store

**Files:**

- Modify: `src/state/settings.js`, `src/state/selectors.js`, `src/components/pages/SettingsPage.jsx`, `src/locales/{en,de,zh}.json`, `DEVELOPMENT.md`
- Create: `src/play/client/tokenStore.js`
- Test: `src/state/settings.test.js` (extend), `src/play/client/tokenStore.test.js`, `tests/settings.test.jsx` (extend)

**Interfaces:**

- Produces: `SET_PLAY_SERVER`, `createSetPlayServer(url)`, `selectPlayServer(state): string` (`""` when unset); `getToken(url): string|null`, `setToken(url, token)`, `clearToken(url)`.

- [ ] **Step 1: Failing tests.** Reducer: a valid `https://x.test/` stores `https://x.test` (trailing slashes stripped); `""` removes the key (only non-default values are stored); a non-http(s) value is ignored; old stored settings without the key load unchanged. Token store: set/get/clear per server url, two urls independent, `localStorage` throwing makes `getToken` return null and `setToken` not throw. Settings page: a textbox labelled "Play server" saves on change.
- [ ] **Step 2: Implement** the reducer case following `SET_LANGUAGE`, the selector, the tokenStore (JSON map under `play-tokens`), and one settings row (`Label` + `Input` + description line) with keys `settings.playServer.{title,description}` in all three locales.
- [ ] **Step 3: Verify** `pnpm exec vitest run --project unit src/state src/play` and `--project component tests/settings.test.jsx`, then `pnpm exec vitest run --project unit src/locales`.
- [ ] **Step 4: Commit** `feat(play): add play server setting and token store`.

### Task 2: REST client

**Files:**

- Create: `src/play/client/api.js`
- Test: `src/play/client/api.test.js`

**Interfaces:**

- Produces: `createApi({ baseUrl, token, fetch = globalThis.fetch })` returning `{ loginUrl(returnUrl), me(), logout(), listGames(), createGame({ game, config, seatName }), getGame(id), setStatus(id, status), deleteGame(id), newInvite(id), getInvite(code), join(code, { name, color }), putAsset(id, name, blob), assetUrl(id, name) }`. Every call sends `Authorization: Bearer <token>` when a token is set and `Accept: application/json`. A non-2xx response throws `ApiError { status, message, errors }` (`message` from `{error}`, `errors` from a 422 body). Network failure throws `ApiError` with `status: 0`.

- [ ] **Step 1: Failing tests** with a recording fake `fetch`: URL, method, headers and JSON body of each call; `loginUrl("https://s/play")` is `${baseUrl}/auth/discord/login?return=https%3A%2F%2Fs%2Fplay`; 401, 410, 422 (with `errors`) and a rejected fetch map to the right `ApiError`; `putAsset` sends the blob with its own `Content-Type`; `baseUrl` with a trailing slash is normalized.
- [ ] **Step 2: Implement** as plain functions, no classes. `assetUrl` is the URL only (assets need the bearer header, so Task 6 fetches them with `getAsset`; add `getAsset(id, name): Promise<Blob>` here too).
- [ ] **Step 3: Verify** `pnpm exec vitest run --project unit src/play/client/api.test.js`.
- [ ] **Step 4: Commit** `feat(play): add play server rest client`.

### Task 3: Websocket session

**Files:**

- Create: `src/play/client/socket.js`
- Test: `src/play/client/socket.test.js`

**Interfaces:**

- Consumes: wire protocol in `server/README.md`; `validateEvent` from `src/play/events.js`.
- Produces: `createSession({ baseUrl, token, gameId, WebSocket = globalThis.WebSocket, schedule = setTimeout })` returning `{ subscribe(listener), send(event), close() }`. `subscribe` calls `listener(snapshot)` on every change with `{ status: "connecting"|"online"|"offline"|"denied"|"locked"|"error", log: Event[], seats, presence: string[], pending: number, error?: string }`. `ws(s)://` is derived from `baseUrl`. `send(event)` validates with `validateEvent` (invalid throws), queues it and sends `{t:"event", seq: lastSeq + pending position + 1, event}`.

- [ ] **Step 1: Failing tests** with a scripted fake `WebSocket` and manual scheduler: sends `join` with `lastSeq` 0 on open; `joined` then `events` fill `log` and `status` becomes `online`; `lastSeq` is the highest `seq` held, not `joined.seq`; a live `event` for an already-held seq is ignored; a `snapshot` frame replaces `log` entirely; `send` while online emits `{t:"event"}` with `seq = lastSeq + 1` and the event appears in `log` only when the server echoes it (no optimistic apply), and `pending` counts unechoed events; two sends in a row get seq `n+1` and `n+2`; `rebase` triggers a catch-up (reconnect with the held `lastSeq`) and resends the unechoed events once; close code 4003 gives `denied` with no reconnect; error `locked` gives `locked`; `rate_limited` keeps the event queued and retries after one second; an unexpected close gives `offline` and reconnects with backoff 1s, 2s, 4s up to 15s, resending unechoed events after catch-up; `close()` stops reconnecting; `presence` frames update `presence`.
- [ ] **Step 2: Implement** one closure with a small state object; events from the server are stored sorted by `seq` and de-duplicated by `seq`.
- [ ] **Step 3: Verify** `pnpm exec vitest run --project unit src/play/client/socket.test.js`.
- [ ] **Step 4: Commit** `feat(play): add websocket session with catch-up and reconnect`.

### Task 4: History helpers and supply

**Files:**

- Create: `src/play/history.js`
- Test: `src/play/history.test.js`

**Interfaces:**

- Consumes: `reduce`, `usedTiles` from `src/play/reduce.js`; `getTile` quantities (`src/util/index.js`).
- Produces: `undoTarget(log): number|null` (the `seq` an undo event would need: the newest event that is still in effect and is not an `undo` that has itself been cancelled; an effective `undo` is a valid target, which makes undo-of-undo a redo; `null` when nothing is in effect), `describeEvent(event, { seats, game }): { key, params }` (an i18n key under `play.events.<type>` plus params: user name, hex, tile, token), `supply(game, state): { tiles: { [id]: { total, used, left } }, tokens: { [abbrev]: { used } } }` (`total` from `getTile` quantity, `left` may be negative).

- [ ] **Step 1: Failing tests.** `undoTarget`: empty log null; one event gives its seq; after an undo of seq 3 the target is the newest still-effective event (2); an undo of that undo (redo) makes 3 effective again and target 4's undo is the next target; logs containing invalid events are skipped without throwing. `supply`: tile counts from `18Test.json` quantities, `left` negative when over-used, variant ids `26|T2` count against their own entry. `describeEvent` covers all nine types.
- [ ] **Step 2: Implement.** Reuse the reducer's own cancellation rule: compute effective seqs by the same last-to-first walk (export a small helper from `src/play/reduce.js` if needed; do not copy the rule).
- [ ] **Step 3: Verify** `pnpm exec vitest run --project unit src/play`.
- [ ] **Step 4: Commit** `feat(play): add history, undo target and supply helpers`.

### Task 5: Game context and `usePlayGame`

**Files:**

- Create: `src/context/GameContext.js`, `src/hooks/usePlayGame.js`
- Modify: `src/hooks/game.js` (`useGame`), `src/hooks/config.js` (`useConfig`)
- Test: `src/hooks/usePlayGame.test.jsx`, `tests/play/game-context.test.jsx`

**Interfaces:**

- Produces: `GameContext` (value `{ game, config } | null`); `useGame()` and `useConfig()` return the context value when one is provided and behave exactly as before otherwise; `usePlayGame({ baseUrl, token, gameId }): { status, game, config, seats, log, state, presence, me, locked, send(event), undo(), error }` where `state = reduce(log)`, `game` and `config` come from `GET /games/:id`, and the session is created in an effect and closed on unmount.

- [ ] **Step 1: Failing tests.** Context: rendering `Map` of a small game inside `<GameContext.Provider>` draws that game's hexes while the store holds a different game; without the provider nothing changes (existing snapshots are the proof). Hook (with fake api and fake socket factory injected through an optional `deps` argument): `status` goes loading, online; `send` is a no-op with `locked`; `undo()` sends `{type:"undo", target: undoTarget(log)}` and does nothing when the target is null; unmount closes the session.
- [ ] **Step 2: Implement.** `useGame` today returns `state.game` only under `/games/*`; add the context check first and leave the rest untouched. Add `deps` only for tests.
- [ ] **Step 3: Verify** `pnpm exec vitest run --project component tests/play src/hooks` and `CI=1 pnpm test:run --project component tests/snapshots.test.jsx` (zero snapshot changes).
- [ ] **Step 4: Commit** `feat(play): add game context and usePlayGame hook`.

### Task 6: Routes, list, login, create and join pages

**Files:**

- Create: `src/components/pages/play/{PlayPage,PlayJoinPage,PlayGamePage}.jsx`, `src/components/play/{PlayList,CreateGame,JoinGame,PlayNotice,useApi}.jsx`
- Modify: `src/routes.jsx`, `src/components/nav/index.jsx`, `tests/support/smoke.js`, `src/locales/{en,de,zh}.json`
- Test: `tests/play/pages.test.jsx`, `tests/routes/routes.test.jsx` (via smoke)

**Interfaces:**

- Consumes: `createApi` (Task 2), tokenStore and `selectPlayServer` (Task 1), `usePlayGame` (Task 5).
- Produces: routes `/play` (testid `play`), `/play/join/:code` (`play-join`), `/play/:id` (`play-game`), declared in that order in `topPages`; sidebar entry "Play"; `useApi()` returns `{ api, token, user, signIn(), signOut() }`.

- [ ] **Step 1: Failing tests** with a fake `fetch`: no server URL shows the explanation with a link to Settings; Electron shows the notice and makes no request; `/play#token=abc` stores `abc` for the server url, clears the hash with `replace`, then shows the game list; a 401 from `/me` clears the stored token and shows "Sign in with Discord" linking to `loginUrl(window.location.origin + "/play")`; the list shows games from `GET /games` linking to `/play/:id`; a user with `canCreate: false` gets no create button and a hint; "Create game" posts the currently loaded game (`state.game`) with its config and the chosen seat name, uploads the game's assets (`putAsset` for each entry of the loaded game's assets, each within the size note on the form), and navigates to `/play/:id`; a 422 shows the schema errors; `/play/join/:code` shows the game title from `getInvite`, asks for a name and color, joins, and navigates to the game; a signed-out visitor on a join link is sent through Discord and returns to the same join url (`return` carries the join path); a 410 shows "this game is closed".
- [ ] **Step 2: Implement** the pages. Route params only through `src/router`. `PlayGamePage` renders `PlayBoard` from Task 7 once it exists (until then a placeholder `div` with the testid; replaced in Task 7).
- [ ] **Step 3: Verify** `pnpm exec vitest run --project component tests/play tests/routes tests/settings.test.jsx`, locale test, and `pnpm lint`.
- [ ] **Step 4: Commit** `feat(play): add play routes, game list, create and join`.

### Task 7: Board with tile and token placement

**Files:**

- Create: `src/components/play/{PlayBoard,PlayMap,TilePanel,TokenPanel,Presence}.jsx`
- Modify: `src/components/pages/play/PlayGamePage.jsx`, `src/locales/{en,de,zh}.json`, `src/data/games/18Test.json` only if the feature needs a field (it should not)
- Test: `tests/play/board.test.jsx`

**Interfaces:**

- Consumes: `usePlayGame`, `GameContext`, `supply`, `getMapData` (`src/util/map.js`), `Hex`/`Tile`, `GameMapCompanyToken`.
- Produces: `PlayBoard({ play })` laying out the map, a side panel (tabs: Tiles, Tokens, Market, Trays, Notes, History) and the header (title, connection status, presence avatars, undo button). `PlayMap({ game, config, state, selected, onSelect, onTap })`.

- [ ] **Step 1: Failing tests** over a hook stub feeding `18Test` and a log: placed tiles appear on their hexes with the rotation (`rotate(60*r)`); clicking a hex selects it; with a tile chosen in the Tiles tab, clicking a hex sends `tile.place` with the chosen rotation; rotate and remove buttons send `tile.rotate` and `tile.remove` for the selected hex; the tile list shows `left` counts and a warning, not a block, when `left <= 0`; with a company chosen in the Tokens tab, clicking a point in a hex sends `token.place` with hex-local `x`,`y` (the click is converted with the hex's `scale` and the hex-local range -86.6..86.6 by -75..75); clicking an existing token removes it after selecting it; a tile id not in the library, a hex id not on the map and an unknown company abbrev render placeholders and do not throw; a locked game disables every action; the board root has `data-testid="play-board"` and the print drawing components are reused (no copy of hex or tile drawing).
- [ ] **Step 2: Implement.** `PlayMap` draws `getMapData` cells with the base `Hex`, then for each placed tile a `Tile` in `<g transform="translate(hexX hexY) scale(data.scale) rotate(...)">` over it, then tokens, then a transparent `<polygon data-coord>` per cell for picking (outline points from the `CORNERS`/`outline` approach of `HexOverlay`, copied only if it cannot be imported without the edit panel gates; prefer extracting the outline function into `src/util/hexEdit.js` and importing it in both). Pan and zoom: reuse `usePanZoom` on a plain svg; no `useEditing` dependency. Orientation through `MapOrientation`. Placement mode (tile, token) lives in local state of `PlayBoard`.
- [ ] **Step 3: Verify** `pnpm exec vitest run --project component tests/play`, the snapshot suite (zero changes), `pnpm lint`.
- [ ] **Step 4: Visual check** (`pnpm build`, then `pnpm shot` is for print pages; for this one, load the dev site with a stub log in the browser pane and look at it at 1x and zoomed: tile alignment on hexes, token size against print tokens). Put the render in the PR description.
- [ ] **Step 5: Commit** `feat(play): add interactive board with tile and token placement`.

### Task 8: Market, trays and notes

**Files:**

- Create: `src/components/play/{PlayMarket,TrayPanel,NotesPanel}.jsx`
- Modify: `src/components/play/PlayBoard.jsx`, `src/locales/{en,de,zh}.json`
- Test: `tests/play/market-trays.test.jsx`

**Interfaces:**

- Consumes: `getMarketData`, `Market`'s cell layout (`src/components/market/Market.jsx`, `Cell.jsx`), `reduce` state (`market[marker] = {row, col}`, `trays[name] = item[]`, `notes`).
- Produces: `PlayMarket({ game, config, state, onMove })` and the Trays and Notes tabs.

Rulings for this task: marker ids are company abbrevs; for 1D and 1Diag markets `row` is 0 and `col` is the cell index; tray ids are `"bank"` plus seat user ids; tray items are free-form ids (a company abbrev or a tile id picked from lists built from the game), `bank` is the source for adding an item.

- [ ] **Step 1: Failing tests.** The market draws a company marker on its cell (`GameMapCompanyToken` at the cell's translate, like `Cell` does for `cell.tokens`) for 2D, 1D and 1Diag; choosing a company then clicking a cell sends `market.move` with `{row, col}` (1D: row 0); a marker on a cell that no longer exists renders nothing and does not throw; the Trays tab lists each seat's tray and the bank, moving an item between trays sends `tray.move`; the Notes tab shows `notes` and saves with `note.set` on blur (debounced to one event per edit burst), rejecting text over 10000 characters with a message.
- [ ] **Step 2: Implement.** Cell geometry comes from `getMarketData` (`width`, `height`, `rows`, `columns`) with the same translate formulas as `Market`; do not duplicate drawing, only add a layer (extract the cell-position function from `Market.jsx` into `src/util/market.js` if needed and use it in both; snapshots must not change).
- [ ] **Step 3: Verify** the component tests, snapshot suite (zero changes), `pnpm lint`.
- [ ] **Step 4: Visual check** the market with markers next to the print market (same cell alignment), in the PR description.
- [ ] **Step 5: Commit** `feat(play): add market markers, trays and notes`.

### Task 9: History, undo, presence and connection states

**Files:**

- Create: `src/components/play/HistoryPanel.jsx`
- Modify: `src/components/play/{PlayBoard,Presence}.jsx`, `src/locales/{en,de,zh}.json`
- Test: `tests/play/history.test.jsx`

**Interfaces:**

- Consumes: `describeEvent`, `undoTarget` (Task 4), `play.undo()`.

- [ ] **Step 1: Failing tests.** The History tab lists events newest first as "<name> placed 5 on D3"; an event cancelled by an undo is struck through; an undo event reads "<name> undid <name>'s move"; the Undo button is disabled with an empty log and when locked, enabled otherwise, and sends one `undo` with the `undoTarget`; after undo, the button's next press undoes the previous move; undoing an undo restores the move (the board shows the tile again); presence shows an avatar or initial per online seat with the seat name as its label; `status` banners: `offline` ("Reconnecting"), `denied` ("You are not in this game", link to the list), `locked` (read-only note), `error` (message, retry); a keyboard shortcut is not added.
- [ ] **Step 2: Implement** with `Tooltip` for avatar names and `Badge` for status.
- [ ] **Step 3: Verify** component tests, locale test, snapshots, `pnpm lint`.
- [ ] **Step 4: Commit** `feat(play): add history, undo, presence and connection states`.

### Task 10: Owner controls and invite

**Files:**

- Create: `src/components/play/OwnerMenu.jsx`
- Modify: `src/components/play/PlayBoard.jsx`, `src/locales/{en,de,zh}.json`
- Test: `tests/play/owner.test.jsx`

**Interfaces:**

- Consumes: `api.getGame` (`inviteCode` only for the owner), `setStatus`, `newInvite`, `deleteGame`.

- [ ] **Step 1: Failing tests.** The owner sees a menu with: copy invite link (`<origin>/play/join/<code>`), new invite link (the old link stops working: the menu shows the new one), lock, unlock, archive, delete (a dialog states "this cannot be undone" and requires a click); a non-owner sees none of it; each action calls the matching endpoint once; after delete the page goes to `/play`; a failed call shows an alert and leaves the menu usable.
- [ ] **Step 2: Implement** with `DropdownMenu` and `Dialog`.
- [ ] **Step 3: Verify** component tests, locale test, `pnpm lint`.
- [ ] **Step 4: Commit** `feat(play): add owner controls and invite link`.

### Task 11: Full verification and PR

**Files:** none new.

- [ ] **Step 1:** Run the full CI sequence from `CLAUDE.md`: `pnpm pretty`, `pnpm lint`, `pnpm validate`, `CI=1 pnpm test:run`, `pnpm build && pnpm test:e2e`, `pnpm build:app && pnpm build:sb`. Snapshots must not change; the known `edit-panel-hex` timeout also fails on main.
- [ ] **Step 2:** Add a manual-test section to the guide artifact (sign in, create from a loaded game, join in a second browser, place a tile, undo, kill the server and watch reconnect) and run it against the local server from plan 1.
- [ ] **Step 3:** Push `claude/play-board-ui`, open a PR with base `claude/game-distribution-18xx-maker-534654`, body checked by `node scripts/check-pr-body.mjs`, with the board and market renders and an "Unverified" list. Do not merge.

---

## Deferred to plan 3

Discord webhook per game, docs pages (en, de, zh), the self-hosting guide, the spectator link, the two-browser Playwright spec against a real server in CI, and the `GET`-asset rendering of game assets inside the board (Task 6 uploads assets; the board shows the game's own images only when `getAsset` blobs are put in the assets store, which plan 3 wires with the docs).
