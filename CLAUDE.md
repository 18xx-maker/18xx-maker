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

### Full test run (what CI runs)

Run in this order before pushing; every step must pass:

```shell
pnpm install
pnpm exec playwright install chromium --only-shell   # once
pnpm pretty                                          # prettier check (pretty:fix to fix)
pnpm lint
pnpm validate
CI=1 pnpm test:run                                   # unit + component, coverage floor, no snapshot writes
pnpm build && pnpm test:e2e                          # Playwright on dist/site
pnpm build:app && pnpm build:sb                      # Electron and Storybook must compile
```

Also run `E2E_ELECTRON=1 pnpm test:export` (after `pnpm build && pnpm build:app`)
when touching `electron/`, the preload, render mode or `src/export`. CI runs
the vitest suite in 3 shards on Linux (reports merged for the coverage check);
macOS and Windows run only the unit project on PRs.

Layout (projects are defined in `test.projects` in `vitest.config.js`):

- `unit` (node): `src/**/*.test.js`: logic in `src/util` and `src/state`.
- `component` (real Chromium via `@vitest/browser` + Playwright):
  `tests/**/*.test.jsx` and `src/**/*.test.jsx`. jsdom is not used; it
  disagrees with Node on `Request`/`AbortSignal`, which react-router needs.
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

- The UI is shadcn/Radix + Tailwind 4 (`src/components/ui`, theme tokens in
  `src/styles/ui.css`); MUI is gone. Print pages (`#viewport-children`) must
  not be touched by Tailwind's preflight: the legacy stylesheets are imported
  into a `legacy` cascade layer and `root.css` undoes the reset for print
  content. Verify real print output (PDF page counts, screenshots with print
  media) after CSS changes, snapshots cannot see CSS.
- Held back on purpose: `eslint`/`@eslint/js` 9 (eslint-plugin-react and
  eslint-plugin-vitest do not allow 10), `vite` 7 (electron-vite 5 caps at 7),
  `svgo` 3 (4 rewrites every data SVG), `playwright` pinned (the pinned
  Chromium must be installed).
- Redux state uses hand-rolled `combineReducers`/`composeReducers`/`reducePath`
  (`src/state/helpers.js`). A move to `createSlice` must keep the root state
  contract test and persisted fixture passing.
- Persisted data: `src/state/storage.js` mirrors `config` and `loadedGame` to
  localStorage; loaded games live in IndexedDB/OPFS (`src/util/idb.js`,
  `src/util/opfs.js`). Stored user data must survive every release.
- The component tests fail on React `console.error` warnings, which is the
  early warning for React deprecations.
- Print pixel screenshots are only stable on one OS and Chromium build, so keep
  any such test Linux-only and pin the Chromium version.

## Exporting (CLI and app)

PNG, PDF and Board18 export share one code path in `src/export` (plain ES
modules: no React, DOM, `fs` or Vite aliases, imported as `#export/*`). The
CLI (`src/cli/export*.js`, Playwright) and the app (`electron/main`,
`webContents.debugger`) only drive a browser page. Do not put planning, naming,
sizing or packaging logic in either surface.

- **Adding or changing an export option** touches all of these in one change:
  the `exports` field in `src/schemas/game.schema.json` (copy it to
  `public/schemas`, give it a description, keep `additionalProperties: false`),
  `resolveExportOptions` in `src/export/options.js`, a CLI flag, a control in
  `ExportOptions.jsx` (strings in `src/locales/en.json`), the docs
  (`src/docs/games/exports.en.md`, `src/docs/output/*.en.md`,
  `src/cli/README.md`, `DEVELOPMENT.md`) and tests.
- **Precedence is built-in defaults, then the game file's `exports`, then the
  user's choice** (CLI flag, user config, options panel). Never give a commander
  option a default that hides the game file, and give every boolean a way to turn
  it off (`--no-paginated`, `--variation all`).
- **Render mode** (`getRenderInput()`, `window.__RENDER_INPUT__`) must never
  write localStorage, add recents, send analytics or call app APIs. Games are
  injected as `render:<id>`.
- **Electron IPC:** validate the sender (main window and app URL) on every
  export channel, honor an output folder only if the user chose it in the
  dialog, and keep names inside the output folder (`insideFolder`). Capture
  windows get only the minimal preload (`renderInput`), an in-memory partition,
  and blocked navigation.
- Electron's debugger has no `Page.printToPDF`; `src/export/window.js` answers
  it with `webContents.printToPDF`. Hidden windows need
  `backgroundThrottling: false`. Capture windows are `offscreen` (a device
  pixel ratio of 1 like the headless CLI): a window on a retina screen paints
  on its own pixel grid, and its PNGs differ from the CLI's.
- A PNG is the device pixels its element covers whole (`devicePixels` in
  `src/export/capture.js`): Chromium paints boxes on the page's pixel grid and
  then scales by the emulated device scale, so a card of 255.11 CSS pixels is
  painted to 796.875 device pixels at 300 dpi. A clip is whole CSS pixels, so
  the screenshot is cut to size with `cropPng`.
- File names are the slugged title (`titleToFilename`); CLI output folders and
  the b18 box keep the game id.

### Verifying export changes

- Print output stays the contract: snapshots must not change.
- `node scripts/export-golden.mjs 18Test` compares raw CDP capture against
  `setViewportSize`/`page.pdf` (b18 pixel-identical, PDF page counts and sizes).
  Per-page PDF images need `pdftoppm` (Linux).
- The six real export paths, {CLI, app} x {pdf, png, b18}, are
  `e2e/export.spec.js` (`export › cli › pdf` ... `export › app › b18`), run
  with `e2e/cli.spec.js` and `e2e/electron.spec.js` by `pnpm test:export`. CI
  runs them on Linux, macOS and Windows (the "Export" job, no mocks). Locally:
  `pnpm build && pnpm build:app && E2E_ELECTRON=1 pnpm test:export`. Run after
  any change to `electron/`, the preload, render mode or export code; compiling
  is not enough (it caught bugs that unit tests with fake CDP targets missed).
- Run the CLI from a checkout path with no dot folder for a baseline: express
  `sendFile` 404s on absolute paths containing one (worktrees live in
  `.claude/worktrees`), so use `root` as `startExpress` does.

## Commit messages

release-please builds releases and the changelog from commit subjects, so every
commit (and every PR title, since PRs are squash-merged) must follow strict
[Conventional Commits](https://www.conventionalcommits.org):

```text
<type>(<optional scope>): <lowercase imperative description>
```

- `<type>` must be one of the `changelog-sections` types in
  `release-please-config.json`: `feat`, `fix`, `perf`, `revert`, `chore`,
  `docs`, `style`, `refactor`, `test`, `build`, `ci`. No other types.
- Scope is optional and short, e.g. `ui`, `electron`, `cli`, `export`.
- Breaking changes use `!` after the type/scope (`feat(export)!: ...`) and a
  `BREAKING CHANGE:` footer.
- Pick the type by what ships: `feat` (new user-visible capability) and `fix`
  (bug fix) drive version bumps; use `chore`/`refactor`/`test`/`docs`/`ci`/
  `build` for everything else. Check `release-please-config.json` if the list
  above may be stale.
- `chore(release): v<version>` is reserved for release-please PRs.
- Subject only needs the `(#123)` PR suffix that GitHub adds on merge; do not
  add it yourself.

## Working in this repo

- Large work: implement phase by phase with sub-agents, commit per phase, then
  run independent correctness, security and test-gap reviews and fix their
  confirmed findings before pushing. Each fix gets a test that fails without it.
- Run `pnpm lint`, `pnpm validate`, `CI=1 pnpm test:run` and
  `pnpm build && pnpm test:e2e` before pushing.
- Commit messages and PR descriptions carry no AI attribution. PR descriptions
  list behavior changes for release notes and what was not verified (other OSes,
  packaged app, CI wiring).
- If commit signing fails with a 1Password error, ask the user to unlock it; do
  not disable signing.
