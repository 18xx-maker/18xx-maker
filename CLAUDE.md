# 18xx Maker

Prototyper for 18xx board games. The real product is SVG that people print at
exact physical sizes (tiles, maps, market charts, tokens, cards). Setup, scripts
and test details are in `DEVELOPMENT.md`.

## Testing

Commands (Node >= 24, pnpm; install the browser once with
`pnpm exec playwright install chromium --only-shell`):

```shell
pnpm test:run          # all vitest projects, once
pnpm test:run -u       # also update print output snapshots
CI=1 pnpm test:run     # reproduce CI (coverage floor, snapshots never written)
pnpm build && pnpm test:e2e   # Playwright against the built site (dist/site)
pnpm validate          # schema check of every src/data/**/*.json
```

Layout (projects are defined in `vitest.workspace.js`, not `vitest.config.js`):

- `unit` (node): `src/**/*.test.js`: logic in `src/util` and `src/state`.
- `component` (real Chromium via `@vitest/browser` + Playwright):
  `tests/**/*.test.jsx` and `src/**/*.test.jsx`. jsdom is not used; it
  disagrees with Node on `Request`/`AbortSignal`, which react-router 7 needs.
  Setup is `tests/setup.js`; render with `renderApp` from `tests/helpers.jsx`
  (real store + memory router built from `rootRoutes`).
- `e2e/*.spec.js`: Playwright on `vite preview` of `dist/site` (port 4318).
  Rebuild after any code change, specs never see the dev server.

Conventions:

- Print output is the contract. `tests/snapshots.test.jsx` snapshots every print
  page for a few games into `tests/__snapshots__/<game>/` (ids renumbered,
  decimals rounded to 3 places, `getBBox` stubbed, locale `en-US`). A React,
  Redux or UI change should change zero bytes there. Only run `-u` when an
  output change is intended, and review the snapshot diff. To cover another
  game, add its slug to `tests/snapshots.test.jsx`.
- `src/data/games/18Test.json` is the fixture game. Page roots expose
  `data-testid` hooks like `game-18Test-map`; add one when adding a page.
- Every route in `rootRoutes` needs a smoke test entry (`tests/routes.js`,
  `tests/smoke.js`).
- CI enforces a 95% statement floor on `src/state/**`. The state layer is
  pinned by `src/state/*.test.js` (reducers, thunks, root state contract,
  persisted localStorage fixture); a change to stored shape needs a migration
  test.
- Test the rendered output, not the implementation. Chrome (nav, config drawer,
  home, docs) may change in a UI overhaul; print pages may not.
- Lefthook's pre-commit test step excludes `tests/**`; run `pnpm test:run`
  yourself before pushing.

## Upgrade notes

- `@mui/styles` (legacy JSS `makeStyles`, 22 files in `src`) is unsupported
  upstream on React 19, but a spike found React 19.3 runs on the current stack
  in the component tests and e2e (not known broken). The peers
  `@testing-library/react`, `react-redux`, `@reduxjs/toolkit` and
  `react-confetti` need bumps first, and the snapshot id normaliser must accept
  React 19 ids. Migrate off it before upgrading React (currently 18.3.1).
- Redux state uses hand-rolled `combineReducers`/`composeReducers`/`reducePath`
  (`src/state/helpers.js`). A move to `createSlice` must keep the root state
  contract test and persisted fixture passing.
- Persisted data: `src/state/storage.js` mirrors `config` and `loadedGame` to
  localStorage; loaded games live in IndexedDB/OPFS (`src/util/idb.js`,
  `src/util/opfs.js`). Stored user data must survive every release.
- The component tests fail on React `console.error` warnings, which is the
  early warning for React 19 deprecations.
- Print pixel screenshots are only stable on one OS and Chromium build, so keep
  any such test Linux-only and pin the Chromium version.
