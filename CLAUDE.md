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
when touching `electron/`, the preload, render mode or `src/export`. This is
required before pushing, not optional: unit tests do not catch a changed export
(a PNG border changed image sizes that `e2e/export-files.js`, `e2e/cli.spec.js`
and `e2e/electron.spec.js` assert, and only CI noticed). An export change that
alters file sizes or contents updates those expected values in the same
commit. In the PR description, list which of these suites you ran. CI runs
the vitest suite in 3 shards on Linux (reports merged for the coverage check);
macOS and Windows run only the unit project on PRs.

Layout (projects are defined in `test.projects` in `vitest.config.js`):

- `unit` (node): `src/**/*.test.js`: logic in `src/util` and `src/state`.
- `component` (real Chromium via `@vitest/browser` + Playwright):
  `tests/**/*.test.jsx` and `src/**/*.test.jsx`. Component tests do not use jsdom: it
  disagrees with Node on `Request`/`AbortSignal`, which react-router needs
  (a few node-project unit tests opt into jsdom).
  Setup is `tests/support/setup.js`; render with `renderApp` from `tests/support/helpers.jsx`
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
- **Always add an example of every new feature to `18Test.json`** (a new
  option, tile element, charter/market/token field, ...), so it renders in the
  print pages and the snapshots cover it. Extend an existing entry where one
  fits; add a new one only when the feature needs it.
- Every route in `rootRoutes` needs a smoke test entry (`tests/support/routes.js`,
  `tests/support/smoke.js`).
- CI enforces a 95% statement floor on `src/state/**`. The state layer is
  pinned by `src/state/*.test.js` (reducers, thunks, root state contract,
  persisted localStorage fixture); a change to stored shape needs a migration
  test.
- Test the rendered output, not the implementation. Chrome (nav, config drawer,
  home, docs) may change in a UI overhaul; print pages may not.
- Lefthook's pre-commit test step excludes `tests/**`; run `pnpm test:run`
  yourself before pushing.

## Visual changes

Snapshots and tests cannot see spacing, centering, size or stroke width, so
look at the output yourself before the first push. Two PRs took 8 and 2
follow-up commits on spacing and a missing border that a render would have
shown at once.

1. Build, then render the thing you changed zoomed in, with `pnpm shot`
   (`scripts/shot.mjs`, output in `shots/`, not committed):

   ```shell
   pnpm build
   pnpm shot 18Test tokens --clip 316,6,200,108      # a region, 4x
   pnpm shot 18Test tokens --sel "g:has(> circle)"   # one element
   pnpm shot 18Test tokens --vs /path/to/main/dist/site   # side by side
   ```

   `--vs` takes a build of `main` (build it once in another worktree) and
   writes `*-compare.png` with before and after. Open the PNG with the Read
   tool and look at it. A render you did not look at does not count.

2. Compare against the neighbours, not against your memory: put the new item
   next to an existing one in the same render (`18Test.json` has the
   examples) and check it matches.
3. Work out spacing and size from numbers (font size, cap height, the
   container size) once, instead of nudging by a pixel per commit. If a
   second look still shows a problem, change the formula, not the constant.
4. Put the before/after image in the PR description (drag it into the PR
   body) so the review is one image. If the request came without a
   reference (a screenshot, a sketch, an item to match), ask for one before
   starting.

Design checklist for tokens and icons:

- Icons (`src/data/icons`): a 25 x 25 `viewBox="-12.5 -12.5 25 25"` centered on
  0, black `stroke="#000"` at the default width of 1 with round caps and
  joins, fills as `color-*` classes so themes can recolor them. A new icon
  gets the stroke the other icons have, and it sits in the same box.
- Token text: the label is centered on the token by its cap height, not its
  line box. With two lines, center them as one block, with the same gap
  whether the second line is above or below, and a second line smaller than
  the label (long text shrinks). Both lines keep the label's stroke and
  color rules.
- Check the longest and the shortest value in `18Test.json`, on a light and a
  dark background color, in every position the feature supports.
- A new field also goes in the schema (see "JSON schemas"); `pnpm validate`
  fails in CI otherwise.

## Upgrade notes

- The UI is shadcn/Radix + Tailwind 4 (`src/components/ui`, theme tokens in
  `src/styles/ui.css`); MUI is gone. Print pages (`#viewport-children`) must
  not be touched by Tailwind's preflight: the legacy stylesheets are imported
  into a `legacy` cascade layer and `root.css` undoes the reset for print
  content. Verify real print output (PDF page counts, screenshots with print
  media) after CSS changes, snapshots cannot see CSS.
- Held back on purpose: `vite` 7 (electron-vite 5 caps at 7),
  `svgo` 3 (4 rewrites every data SVG), `playwright` pinned (the pinned
  Chromium must be installed).
- Redux state uses hand-rolled `combineReducers`/`composeReducers`/`reducePath`
  (`src/state/helpers.js`). A move to `createSlice` must keep the root state
  contract test and persisted fixture passing.
- Persisted data: `src/state/storage.js` mirrors `config`, `loadedGame` and
  `settings` (theme, sidebarOpen, language; all optional) to localStorage; loaded games
  live in IndexedDB/OPFS (`src/util/storage/idb.js`, `src/util/storage/opfs.js`). Stored user data must survive every release.
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
  it off (`--layouts current`, `--variation all`).
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
- An SVG is not a screenshot: `serializeSvg` (`src/export/svg.js`) runs in the
  page (one `adapter.evaluate`, print media), copies the svg inside
  `capture.selector` and writes the computed presentation properties on it as
  attributes (the page's classes and style elements do not exist in the file),
  maps font aliases (`display`) to real families and fails on `foreignObject`.
  It is opt-in, has no dpi or background, and is only on the map, market, par,
  revenue, tiles and tokens.
- File names are the slugged title (`titleToFilename`); CLI output folders and
  the b18 box keep the game id.

### Verifying export changes

- Print output stays the contract: snapshots must not change.
- `node scripts/export-golden.mjs 18Test` compares raw CDP capture against
  `setViewportSize`/`page.pdf` (b18 pixel-identical, PDF page counts and sizes).
  Per-page PDF images need `pdftoppm` (Linux).
- The eight real export paths, {CLI, app} x {pdf, png, svg, b18}, are
  `e2e/export.spec.js` (`export › cli › pdf` ... `export › app › b18`), run
  with `e2e/cli.spec.js` and `e2e/electron.spec.js` by `pnpm test:export`. CI
  runs them on Linux, macOS and Windows (the "Export" job, no mocks). Locally:
  `pnpm build && pnpm build:app && E2E_ELECTRON=1 pnpm test:export`. Run after
  any change to `electron/`, the preload, render mode or export code; compiling
  is not enough (it caught bugs that unit tests with fake CDP targets missed).
- The CLI serves `dist/site` with `sirv` (`startServer` in `src/cli/util.js`,
  `single: true` so unknown routes get `index.html`). It works from a checkout
  under a dot folder (worktrees live in `.claude/worktrees`).

## JSON schemas

Schemas live in `src/schemas/` (draft-07, validated with `json-schema-library`
by `src/cli/validate.js`). `tiles.defs.json` is **generated**; never edit it.

- **Hand-edited:** `companies`, `config`, `game`, `publishers`, `theme`,
  `tiles` (`*.schema.json`), `fields.schema.json` (shared field definitions:
  `position`, `font`, `text`, `svg`, `revenue`) and `tiles.src.json` (the tile
  definitions, `$id` `.../tiles.defs.json`).
- **Generated:** `src/schemas/tiles.defs.json` = `tiles.src.json` plus the
  `fields.schema.json` properties merged into the tile elements listed in the
  `elements` map in `src/cli/compile-schemas.js` (`pnpm maker compile`,
  or `make`). `game.schema.json` and `tiles.schema.json` reference it via
  `tiles.defs.json#/definitions/hex`.
- **Published copies:** `make` copies every `src/schemas/{companies,config,game,
publishers,theme,tiles}.schema.json` and `tiles.defs.json` to
  `public/schemas/` (what `$schema` URLs and editors use). Both the generated
  file and the `public/schemas` copies are committed; the pre-commit hook runs
  `make && pnpm validate:schemas` and restages them.
- `validate.js` registers each schema by `$id`; a new schema file must be
  added to `schemas` in `validate.js`, `determineSchema` (how a data file is
  matched to it) and the `schemas` list in the `Makefile`.

Adding to a schema:

1. Edit the source: `game.schema.json` etc. directly; a field on a tile element
   in `tiles.src.json`; a property shared by tile elements in
   `fields.schema.json` (and add the element path to `elements` in
   `compile-schemas.js` if it is a new element type). Keep
   `additionalProperties: false` and give every property a `description`.
2. Run `make` (compiles `tiles.defs.json`, copies to `public/schemas`). Do not
   hand-edit or skip the copy: `compile-schemas.test.js` fails if
   `tiles.defs.json` differs from a fresh compile.
3. Run `pnpm prettier --write src/schemas public/schemas` if `make` output
   needs formatting (`pnpm pretty` checks it).
4. Add or extend a fixture/test: positive and negative cases in
   `src/cli/validate.test.js` (e.g. the `exports of a game` block), and use
   the new field in `src/data/games/18Test.json` or another data file when it
   affects rendering.
5. Verify:

```shell
make                                    # compile + copy
pnpm validate:schemas                   # the schemas are valid draft-07
pnpm validate                           # every src/data/**/*.json still validates
pnpm exec vitest run --project unit src/cli   # compile-schemas + validate tests
git status public/schemas src/schemas   # generated files show up in the diff
```

Runtime consumers of a schema change (UI forms, docs, export options) are
listed under "Exporting" and "Translations" when the field is user facing.

## Translations

UI strings live in `src/locales/<lang>.json` (`en` is the source) and the docs
are `src/docs/**/<slug>.<lang>.md` plus `src/home/home.<lang>.md`. German (`de`)
and Simplified Chinese (`zh`) are AI-generated and kept in step with English.

- **Any change to a doc page or `home.en.md` must update `.de.md` and `.zh.md`
  in the same change** (new page: add all three plus its `docs.*` title and
  description keys in every locale; removed page: delete all three). Re-translate
  only what changed, keep the structure identical, leave code blocks untouched,
  and fix `#anchor` links to match the translated headings.
- **Any new or changed UI string goes in `en.json`, `de.json` and `zh.json`**
  with the same keys and `{{vars}}`/`<tags>` (`src/locales/locales.test.js`
  enforces it). Never hardcode user-visible text in the app chrome; print output
  is not translated.
- Reuse the terminology already in `de.json`/`zh.json` (tile, token, charter,
  par, ...) so docs match the UI. Write new docs in the repo's neutral voice;
  German uses informal "du".
- The translation notice in `translation.<lang>.md` must keep saying these are
  machine translations and that fixes are welcome.

## Docs screenshots

Images in `src/docs` live in `public/images`.

- Every image has descriptive alt text and a caption: `![alt](/images/x.png "caption")`.
  A titled image renders as a rounded, bordered figure (`DocImage` in
  `src/components/docs/Markdown.jsx`); never put the caption in the alt text.
- Annotate where it clarifies (circle the control, label parts with arrows,
  one label per thing, nothing overlapping). Crop to whole objects, never cut
  tokens or hexes at the edge.
- UI screenshots come in a theme pair, `<name>-light.png` and
  `<name>-dark.png`; reference the `-light.png` and the renderer swaps by
  theme. Capture them from the real app (Playwright, 2x) and keep the app's own
  transparent-square background across the whole image, including under the
  labels; do not pad with a flat color.
- Keep screenshots clean: equal margins on the left, right and bottom (check
  the pixels), whole objects only, and no slivers of neighboring objects at the
  edges (hide them in the capture rather than cropping through them). Generate
  the image from `scripts/docs-images.mjs`, labels included, so it can be
  reproduced.

## Commit messages

release-please builds releases and the changelog from commit subjects, so every
commit (and every PR title, since PRs are squash-merged) must follow strict
[Conventional Commits](https://www.conventionalcommits.org). A PR title is held
to the same rules as a commit message (same types, scope, `!` and lowercase
imperative description):

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
- release-please also reads every line of the squash commit body (the PR
  description) and turns a line that starts with `type: text` into an extra
  changelog entry, and GitHub wraps long lines. Never write `build:app`,
  `test:run`, `fix: ...` and the like in prose or code spans; put commands in a
  fenced code block. The `PR body` workflow fails a PR that does this.
- `chore(release): v<version>` is reserved for release-please PRs.
- Subject only needs the `(#123)` PR suffix that GitHub adds on merge; do not
  add it yourself.
- **Check the body before pushing or opening a PR.** Write the PR description
  to a file and run `node scripts/check-pr-body.mjs body.md` (the CI check
  "Release notes safe" runs the same script and is the first job to fail). The
  commit-msg hook runs it on every commit body too. Do this before
  `gh pr create`, not after CI fails.

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
