# 18xx Maker Development

> [!WARNING]
> The easiest way to start using 18xx-maker is by using the
> [app](https://github.com/18xx-maker/18xx-maker/releases) or the
> [website](https://18xx-maker.com). These instructions are **ONLY** if you want
> to develop on 18xx Maker itself. You can find [more
> documentation](https://18xx-maker.com/docs) on general usage in the help
> section of the website.

> [!IMPORTANT]
> These docs assume an understanding of development practices and using a
> terminal and command line programs. If you are interested in development but
> don't meet this requirement please ask for help in [the 18xx Maker
> Discord](https://discord.gg/gcYvAjYYfw).

## Installation

You can develop on 18xx Maker on your local computer or by using Docker. We only
recommend using Docker if you already have a good understanding of software
development using it. Documentation about using the Docker images is available
in
[docker/README.md](https://github.com/18xx-maker/18xx-maker/blob/main/docker/README.md)

### Prerequisites

In order to develop on 18xx Maker you need [git](https://git-scm.com/),
[NodeJS](https://nodejs.org), and [pnpM](https://pnpm.io/). Git is the tool we
use to store and version the source code. NodeJS is a javascript runtime that
lets you run javascript on your computer. pnpM is a package manager for NodeJS
that lets you install all of the dependencies for this project. You can follow
the directions from these projects for [installing
git](https://git-scm.com/downloads), [installing
NodeJS](https://nodejs.org/en/download/), and [installing
pnpM](https://pnpm.io/installation).

> [!TIP]
> I personally use [macOS](https://www.apple.com/macos/) as my main development
> environment. I use [nodenv](https://github.com/nodenv/nodenv) to manage my
> node versions locally and I install [git](https://git-scm.com/downloads/mac)
> and [pnpm](https://pnpm.io/installation#using-homebrew) from
> [homebrew](https://brew.sh/).

> [!WARNING]
> You should be able to use Node's built in package manager
> [npm](https://www.npmjs.com) or [yarn](https://classic.yarnpkg.com) but their
> usage is not supported.

### Running the development site

The first step is checking out the code:

```shell
# Move to a relevant folder and download the source code
git clone git@github.com:18xx-maker/18xx-maker.git
```

> [!TIP]
> If you want to make contributions to 18xx Maker you should probably create
> your own Github
> [fork](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/about-forks)
> and hack on that, sending us a pull request with your changes when you are
> ready.

Now from the newly created `18xx-maker` folder you can install the dependencies
and start a development build of the site:

```shell
# Install the dependencies
pnpm install

# Install the browser used by the tests (once)
pnpm exec playwright install chromium --only-shell

# Run the development site (http://localhost:3000, it does not open a browser)
pnpm start
```

> [!IMPORTANT]
> Anytime you update the site's code (from git or from downloading a new zip)
> you should run `pnpm install` again to update your dependencies.

## Scripts

These are the package.json scripts that you should know:

```shell
# Start the development versions of the site, app, or storybook site. The site
# (http://localhost:3000) and storybook (http://localhost:6006) do not open a
# browser, open the address yourself:
pnpm start
pnpm start:app
pnpm start:sb
```

The following scripts are all run for you on relevant files as part of git
commit hooks, and in CI. They are here if you want or need to run them manually:

```shell
# Run the tests in watch mode (requires the Playwright chromium install
# from the setup steps above)
pnpm test

# Run the tests once, and update the print output snapshots (see below)
pnpm test:run -u

# CI also enforces a 95% statement coverage floor on src/state; run
# CI=1 pnpm test:run to reproduce it locally
CI=1 pnpm test:run

# Run the end to end tests against the built site (see below)
pnpm build
pnpm test:e2e

# Export a game from the built site (see src/cli/README.md), and compare
# Playwright's own capture with the shared capture on Linux (see below)
pnpm maker export 18Test --format pdf,png,svg,b18
node scripts/export-golden.mjs 18Test

# Every export option (formats, docs, layouts, background, variation, png.dpi,
# cards.bleed, b18.version, b18.author) can also be set in a game file's `exports` field
# (src/schemas/game.schema.json, src/docs/games/exports.en.md). A flag wins over
# the game file and the game file over the defaults: resolveExportOptions in
# src/export/options.js is the one place that decides, for the CLI and the app.
# background (white by default) only changes the map, market, par, revenue and
# tile manifest PNGs, every other PNG is always transparent: a Board 18 box
# always has a white Map and Market and transparent Tokens and tiles.

# Run all fixing linters
pnpm fix

# Run schema validation on all data json files (18Broken is skipped, it has
# schema errors on purpose):
pnpm validate

# Optimize SVGs
pnpm svgo
```

In CI the Linux tests run in three shards whose reports are merged (the coverage
floor is checked on the merged result). Mac and Windows run only the unit tests
on pull requests, and the full suite on `main`.

There are the commands to preview and build the production versions of the site,
app and storybook site:

```shell
# Preview the production builds
pnpm preview
pnpm preview:app

# Treemap of the production bundle
pnpm bundle

# Build the production site, electron app, or storybook site:
pnpm build
pnpm build:app
pnpm build:sb
```

### Bundle size

`pnpm bundle` opens an interactive treemap of the site build. Its per-chunk
figures are rendered (before minification) sizes. The table below is what users
download, minified, per package, from source-map attribution of the site
build (`dist/site` only; the Electron renderer has no `manualChunks` and was not
measured), with gzip and brotli of the attributed bytes. Those are computed on
each package's slice compressed on its own, so they are upper bounds and do not
add up to a chunk's real compressed size (the whole `CodeHighlighted` chunk
gzips to 56.3 kB, against 61.3 kB in the table). Peripheral packages
are grouped with their owner (uri-js and fast-copy with json-schema-library,
oniguruma-to-es and @shikijs/* with shiki, the lezer packages, style-mod and
w3c-keyname with CodeMirror). 1 kB is 1000 bytes. Measured on 2026-10-07 at
commit `735b4d43`. Chunks are named by role, since file hashes change on every
build. The json-schema-library chunk is also named `index-<hash>.js`; the
entry is the one referenced by the module script in `index.html`.

| Library                                                         | Chunk                                  | Loaded                                      | Raw kB | gzip kB | brotli kB |
| --------------------------------------------------------------- | -------------------------------------- | ------------------------------------------- | -----: | ------: | --------: |
| shiki (core, json and bash grammars, 2 themes, JS regex engine) | `CodeHighlighted` (2.8 kB in `vendor`) | Lazy: first `Code` block, and the diff view |  213.3 |    61.3 |      54.6 |
| json-schema-library (with uri-js, fast-copy, ...)               | its own async chunk                    | Async at startup on every page              |  120.3 |    32.8 |      28.1 |
| tinycolor2                                                      | `vendor`                               | Initial                                     |   15.5 |     5.4 |       4.7 |
| CodeMirror in the entry chunk                                   | entry (`index`)                        | Initial (unintended, see below)             |  318.3 |   106.9 |      95.1 |
| CodeMirror JSON editor                                          | `JsonEditor`                           | Lazy: JSON section of the edit panel        |   54.8 |    19.4 |      17.6 |
| CodeMirror vim                                                  | `editorVim`                            | Lazy: only when vim mode is chosen          |  122.1 |    39.5 |      35.0 |
| CodeMirror emacs                                                | `editorEmacs`                          | Lazy: only when emacs mode is chosen        |   27.8 |    10.7 |       9.8 |

CodeMirror totals about 523 kB raw, 176 kB gzip and 158 kB brotli across all
chunks. For scale, whole chunks: entry 1632 kB (498 kB gzip), `vendor` 740 kB
(242 kB gzip), `data` 674 kB (149 kB gzip) and `logos` 8.9 MB. The entry,
`vendor`, `logos`, `ramda` and `data` chunks are modulepreloaded on every page,
so the 107 kB gzip of CodeMirror in the entry chunk is a small saving next to
them.

The shiki chunk is also imported statically by `DiffView.jsx` (`tokenize` from
`CodeHighlighted`). `DiffView` is itself lazy (`ChangesPage` and `HistoryPage`),
so the chunk loads on the changes and history views as well as on the first
`Code` block.

Go or no-go on the options in issue 1021:

- A lighter highlighter is a no-go. shiki is already fine-grained (`shiki/core`,
  the JS regex engine, only json and bash, two themes, no WASM) and lazy at 61
  kB gzip. highlight.js or Prism would save perhaps 20 to 35 kB gzip but lose
  the dual-theme token model (`--shiki-light` and `--shiki-dark`), change the
  docs and diff view output, and need a CSS rewrite.
- ajv instead of json-schema-library is a no-go. The chunk is 33 kB gzip. It is
  split off the entry, but `src/hooks/validation.js` calls
  `import("json-schema-library")` at module top level and `@/hooks` is
  imported by core components, so every visitor fetches it at startup (async,
  not modulepreloaded). Ajv would save little (the ajv runtime is roughly 35 kB gzip, an
  estimate that was not measured). `src/util/gameValidation.js` maps
  json-schema-library error codes and nested `data.errors` to localized issues,
  so a migration rewrites it and its tests for no meaningful gain.
- tinycolor2 needs no action at 5.4 kB gzip.
- CodeMirror is a go on code splitting and a no-go on replacing it, see below.

CodeMirror is meant to be lazy (`manualChunks` leaves it out of `vendor`), but
`src/util/jsonEditor.js` imports `@codemirror/lang-json` and is imported
statically, so Rollup places `@codemirror/view` (184 kB raw), `state`,
`language` and the lezer packages in the entry chunk (`cm-content` and
`cm-scroller` style strings from `@codemirror/view` are in it). The static
chains:

- `Toolbar.jsx`, `hooks/useEditPanel.js`, `editPanel/sections.js`,
  `ConfigSection.jsx` (`configLens`), `util/jsonEditor.js`
- `schemaForm/overrides.jsx`, `TokenEditButton.jsx`, `tokenEditor/tokenModel.js`
  (`isObject`), `util/jsonEditor.js`
- `editPanel/sections.js`, `TokensForm.jsx`, `TokenEditButton.jsx`,
  `tokenModel.js`, `util/jsonEditor.js`

The dynamic `import("@/util/jsonEditor")` in `ProblemsPage.jsx` cannot split
anything while those chains exist. A fix (a helper module without
`jsonLanguage`, or loading `parseTree` on demand) is a separate change.

To reproduce, build with source maps to a scratch folder and run this script
from the repo root (it needs `@jridgewell/trace-mapping`, which pnpm keeps in
`node_modules/.pnpm/node_modules`). It prints raw, gzip and brotli kB per
package for every chunk, which you then group by owner:

```shell
pnpm exec vite build --sourcemap --outDir /tmp/bundle-sm
node attribute.mjs /tmp/bundle-sm/assets
```

```js
// node attribute.mjs <outDir>/assets   (run from the repo root)
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import zlib from "node:zlib";

// pnpm does not link transitive packages into node_modules, use its hoisted copy
const { TraceMap, originalPositionFor } = createRequire(import.meta.url)(
  path.resolve("node_modules/.pnpm/node_modules/@jridgewell/trace-mapping"),
);

const dir = process.argv[2];
const pkgOf = (src) => {
  const m = src.match(
    /node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?((?:@[^/]+\/)?[^/]+)/,
  );
  return m ? m[1] : "(app)";
};
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".js"))) {
  const code = fs.readFileSync(path.join(dir, f), "utf8");
  const map = new TraceMap(fs.readFileSync(path.join(dir, f + ".map"), "utf8"));
  const spans = {}; // package -> minified text attributed to it
  code.split("\n").forEach((line, l) => {
    let cur = null,
      start = 0;
    const flush = (end) => {
      if (cur) spans[cur] = (spans[cur] ?? "") + line.slice(start, end);
    };
    for (let c = 0; c < line.length; c++) {
      const o = originalPositionFor(map, { line: l + 1, column: c });
      const pkg = o.source ? pkgOf(o.source) : cur;
      if (pkg !== cur) {
        flush(c);
        cur = pkg;
        start = c;
      }
    }
    flush(line.length);
  });
  console.log(f);
  for (const [pkg, text] of Object.entries(spans)) {
    const b = Buffer.from(text);
    console.log(
      pkg.padEnd(40),
      (b.length / 1000).toFixed(1),
      (zlib.gzipSync(b).length / 1000).toFixed(1),
      (zlib.brotliCompressSync(b).length / 1000).toFixed(1),
    );
  }
}
```

### Visual check

Snapshots cannot see how print output looks. `pnpm shot` renders one print page,
element or region of a built site (`pnpm build` first) to a PNG in `shots/`
(ignored by git), zoomed 4x by default:

```shell
pnpm shot 18Test tokens --clip 316,6,200,108
pnpm shot 18Test tokens --sel "g:has(> circle)" --scale 6
pnpm shot 18Test tokens --vs ../main/dist/site   # before/after side by side
```

`--vs` renders a second build (of `main`, for example) and writes `*-before.png`
and `*-compare.png` next to the new image. See the top of `scripts/shot.mjs` for
all options.

### Print output snapshots

18xx Maker's output is SVG that people print at physical sizes, so
`tests/snapshots.test.jsx` renders every print page (map, market, par, revenue,
tiles, tile manifest, tokens, cards, charters, background) for a few games and
compares the markup to the committed files in `tests/__snapshots__/<game>/`.
Generated ids are renumbered, long decimals are rounded to 3 places, text
measurements (`getBBox`) are stubbed to a fixed size, and the browser locale is
fixed to `en-US`, so the files do not depend on the platform or installed fonts.

If a snapshot test fails, the printed output changed. If that was intended (a
tile or atom change, for example), check the diff and update the snapshots:

```shell
pnpm test:run -u
```

Review the changed files in `tests/__snapshots__` before committing them. CI
(`CI=true`) never writes snapshots, a missing or different snapshot fails the
run. Vitest does not report snapshot files that no test writes anymore, so a
test in `tests/snapshots.test.jsx` fails and lists them: delete those files. To
lock down another game, add its slug to `tests/snapshots.test.jsx` and
run `pnpm test:run -u`.

### Make

There are also a few goals for [make](https://www.gnu.org/software/make/) that
are helpful.

```shell
# Compile the json schemas: the tile definitions, and the schemas of
# public/schemas with their text in English, German and Chinese
# This is run automatically for you on git commit hooks
make

# Clean all generated output (from all of the build commands above)
make clean

# Remove the render folder (where the CLI creates pdf, png and svg folders and Board 18 boxes)
make clean/render
```

The other make goals are all for [Docker
development](https://github.com/18xx-maker/18xx-maker/blob/main/docker/README.md)

### Dropping files onto the app

`#dropzone` in `src/components/Root.jsx` is the one drop target of the app.
`captureFiles` (`src/util/dropImages.js`) reads every dropped file before any
await, and `isGameDrop` routes the drop: exactly one `.json` file is a game or
a config file (as before), anything else is images.

Images go to the game on screen (`state.loadedGame`), when
`canAddAssets(type)` (`src/util/canSaveGame.js`) allows it: `electron` through
`window.api.addAsset` (the folder next to the game file), `internal` and
`system` through `addGameAsset` (IndexedDB). With no game, a bundled game or in
render mode nothing is stored and an error alert is shown. An SVG opens
`DropImageDialog` (icon or logo, name, replace or rename on a clash), a PNG is
a train image with no dialog. `addDroppedImages` stores the files one at a time
and builds one alert for the whole drop. `DropOverlay` is the dashed border
shown while files are dragged over the window.

Tests: `tests/chrome/drop-images.test.jsx` (component project) and
`src/util/dropImages.test.jsx` (component); the web case in `e2e/drop-images.spec.js`.

## End To End Tests

`e2e/*.spec.js` are [Playwright](https://playwright.dev) specs that drive the
production build of the site in headless Chromium: opening bundled games,
config persistence, loading a game from a file, the print button and an
accessibility pass with axe. They run against `dist/site` served by
`vite preview` on port 4318, so build first, and rebuild after changing any
code (the specs never see the dev server):

```shell
# Install the browser (once, shared with the vitest browser tests)
pnpm exec playwright install chromium --only-shell

pnpm build
pnpm test:e2e

# Run one spec, or tests matching a name
pnpm test:e2e e2e/load.spec.js
pnpm test:e2e -g "persist"
```

To debug, run with `--ui` (watch mode, time travel, locator picker) or
`--headed`, or step through with `PWDEBUG=1`. These need the full browser
(`pnpm exec playwright install chromium`), not the `--only-shell` headless
build used above and in CI. Failed tests in CI are retried
once and keep a trace: download the `playwright-report` artifact from the
failed run and open it with:

```shell
pnpm exec playwright show-report playwright-report
pnpm exec playwright show-trace path/to/trace.zip
```

Notes:

- The preview server listens on port 4318, or on `E2E_PORT` if set. A server
  already listening there is not reused unless `E2E_REUSE_SERVER=1`, so a
  leftover preview from another checkout is never tested by accident (the run
  fails with the port in use instead).
- Chromium has the file system access API, which opens a native file picker
  that Playwright cannot drive. `e2e/load.spec.js` covers both flows: one test
  removes `window.showOpenFilePicker` so the app uses the file input flow that
  Firefox and Safari use (saved in the origin private file system), and the
  other stubs `showOpenFilePicker` to return a handle to a real file in the
  origin private file system, so the Chromium flow and its indexedDB handle
  storage run for real.
- `e2e/a11y.spec.js` fails on serious and critical axe violations. Existing
  ones are listed per page, by rule and css selector, with reasons in its
  `KNOWN_ISSUES`; fix them and delete the
  entry (the spec fails if an entry no longer applies).
- `e2e/cli.spec.js` runs `maker export` on 18Test against the built site (it
  serves it on a free port of its own) and checks page counts, PNG sizes and the
  resolution in the files.
- The vitest projects only include `src/` and `tests/`, so they never pick up
  `e2e/`.

The edit panel (`src/components/editPanel`, toolbar button and `e` key) has a
tab for each entry of `editSections` in `sections.js` (the current one is
`?editSection=`, `[` and `]` cycle them). Its forms are generated at runtime
from `src/schemas/game.schema.json` (`src/components/schemaForm`):
`GameInfoForm` for `GAME_INFO_KEYS` in `resolve.js` (`info`, `links`,
`prototype`, `wip`; widening it means editing that list) and `TrainsForm` for
`trains`, an `ArrayField` with a card for each item (add, remove with undo,
duplicate, move, "more fields" for what is not in `PRIMARY_KEYS`, a list shared
by all the lists, so `revenue` and `company` of a private are in it and
trains have neither). `PrivatesForm` is the same for `privates`.
`CompaniesForm` is the same for `companies` (`COMPANY_PRIMARY_KEYS`: name,
abbrev, color, minor). It passes `startCollapsed` (the cards of the items the
list starts with are closed; an added or copied item is open), `summary` (the
closed card shows a color swatch, the name and the abbreviation), `defaults` as
a function of the items (`newItem` accepts one, so a new company gets a free
`abbrev` from `nextAbbrev`) and `copyOf` (a copy gets a free abbrev, case
insensitive: PRR becomes PRR2). A closed card whose fields have a problem shows
a marker (`editPanel.hasProblems`). The shares, tokens, token, trains and loans
of a company are JSON fields for now.
`PhasesForm` is the same for `phases` (`PHASE_PRIMARY_KEYS`, defaults
`limit` and `tiles`): it passes `primary` and `unique` to `ArrayField`, and
`unique="named"` names a new phase only when the others have names (a phase list
keyed by train, like 1871, gets a free `train` instead; a copy is renamed only
when its source has a name), and the card title falls back to the train.
`isRequired` also counts a key that every branch of an `anyOf` requires (the
limit and tiles of a phase, not its name or train), so a phase with neither
shows the raw any-of message. A `limit` (a number or two patterns) is the
`limit` kind: `parseLimit` takes a whole number of at least 1, `∞` or `3/4` and
anything else shows `editPanel.invalidLimit`, and `stringOrNumber` matches any
count of string and number alternatives. A text or a list of texts (the train
and notes of a phase, exactly `string` and `array` of `string` with no enum or
pattern) is the `stringList` kind, one entry a line in a textarea
(`parseList`, `formatList`, `sameList`; one line is saved as a string, so a
list of one stays a list until it is edited). A
`description` is a textarea (`LONG_TEXT_KEYS`). A `revenue` (a `oneOf` of a
number, a list of numbers and a string) has its own kind: it is typed as `10/20`
(`parseRevenue`, `formatRevenue`), numbers become a number or a list and any
other text stays a string. `MarketForm`
edits `game.stock`: `MarketGrid` is an accessible `role="grid"` of the cells
(ragged rows, 1Diag drawn in two rows), `CellInspector` edits the selected cell
through the `cellObject` schema and keeps the shorthand (a number, string or
null) when a cell needs no more, and the pure edits (rows, columns, type,
movement) are in `src/util/marketEdit.js`. The market is never deleted, the
last row or column leaves `market: []`. `PlayersForm` edits `PLAYER_KEYS`
(`bank`, `capital`, `certLimit`) and the `players` table: it
passes `PLAYER_PRIMARY_KEYS` as `primary`, `idKey="number"` (a new or copied
item gets `nextNumber`, the highest number plus one, as a number instead of a
text name) and `title` (a translation key, `editPanel.titles.players`, counting
the `titleKey` field: "3 players") to `ArrayField`. A `oneOf` of only strings
and numbers (`certLimit`) is the `stringOrNumber` kind. `RoundsForm` edits `ROUND_KEYS` (`rounds`, `turns`, `numberCards`, `number_cards`) and `TokensForm` edits `TOKEN_KEYS` (`tokens`, `tokenTypes`, `shareTypes`). `ColorsForm` edits `COLOR_KEYS` (`colors`): a `color` kind (`colorValue`, text or an object by phase) is `ColorField`, a swatch over a native color input plus text, and the by-phase object is the JSON textarea. `OutputForm` edits `OUTPUT_KEYS` (`revenue`, `exports`): objects, enum lists, and a record of text lists; `HIDDEN_PATHS` (`exports.paginated`, deprecated) are not shown and stay in the game. A list whose items are text, a number or one object (`mixedItem`, the tokens) is an `array`: a text row (`ScalarRow`) or a card each, and a record passes `rows` props (`itemKey`, `primary`) to the field of each of its rows. All forms use
`SchemaFormProvider`. A field kind without a form (other
`oneOf`s) falls back to a JSON textarea, and
`resolve.test.js` fails when a property in scope falls back unexpectedly. A
property with `"deprecated": true` in the schema stays editable while the
game has it, with a badge and a note, and is not offered when it is unset
(`isUnsetDeprecated`; a new top level name goes next to the old one in the key
list of its form). `deprecatedPaths` in `src/util/gameValidation.js` finds `deprecatedPaths` in `src/util/gameValidation.js` finds
it inside lists (`trains[2].players`). Edits go through `editGame`, so the
Changes page, problems check and unsaved-edit handling work unchanged. Labels
and help text are the schema keys and descriptions, in English only.

The Map tab starts with `MapMover` (four arrow buttons): `shiftGame` in `src/util/mapShift.js` moves every map coordinate and the hex references of the game in one `editGame` (map fields decide whether a direction is blocked; pixel overlays stay), then the selected `?hex=` follows and the hex JSON drafts are cleared with `clearDrafts`.

A string (or list of strings) that names something else in the game has a
combobox. The schema says so with an annotation next to the type, ignored by
validation: `"x-ref": { "from": "companies", "key": "abbrev", "label": "name" }`
(`from` is the dotted path of a list in the game, `key` the property of its
items that names them, left out for a list of strings, `label` the text shown
beside the name). It goes on the leaf string schema, so a shared definition
(`trainItem`, which `rust`, `phased`, `obsolete` and the `on` of a phase use)
covers every place that uses it. `refPaths` and `refOptions` in
`src/util/schemaRefs.js` find the annotations and read the names from the game
as edited now; `referenceOf` in `resolve.js` finds one through `$ref` and
`oneOf` and says if the field is a string, a list or both. `SchemaField` asks
the registry in `schemaForm/overrides.jsx` before the kind of the field: the
default entry renders `ReferenceField` (the `Combobox` of `ui/combobox.jsx`,
on a Radix popover so the scrolling panel does not clip it) for a field with an
`x-ref` whose value is nothing, a string or a list of strings, and a value
that holds an object (`{ on, index }`) stays in the JSON field. Free text is
always accepted and a name the game does not have shows a hint, not an error.
A string is stored as one where the schema allows it, a list of one stays a
list otherwise, and an empty value is removed. To annotate a field, add the
`x-ref`, run `make`, and the test in `schemaRefs.test.js` checks that `from` and
`key` exist in the schema.

A plain string that names something the app ships has a picker too, with
`"x-widget": "icon"`, `"logo"` or `"publisher"` on the leaf string schema
(`privates[].icon`, `stock.legend[].icon`, the `icon` and `logo` of the token
and of the game tokens, `companies[].logo`, `rounds[].icon` and `rounds[].logo`, `info.publisher`). Like `x-ref` it
is an annotation that validation ignores, so a name the app does not have stays
valid. `widgetOf` in `resolve.js` reads it through `$ref` and `oneOf`, and an
entry of `overrides.jsx` renders `AssetPicker` (the same combobox the token
editor uses, with the names of `icons`, `logos` or `publishers` in `@/data`) for
a value that is nothing or a string. It is routed by the annotation, never by the
field name. A new widget needs a name in `AssetPicker`, an `assets.<name>` text
in the three locales and an entry in `ASSETS`, which `schemaRefs.test.js` checks.

The `json` section (`JsonSection.jsx` lazy loads `JsonEditor.jsx`, a CodeMirror
6 editor; its packages have their own chunk in `vite.config.js`) edits the
whole game as text, `j` opens it on any page with a game loaded (`openEditSearch` in `src/util/query.js`). The
pure parts are in `src/util/jsonEditor.js`. A valid text (an object with an
`info` object and a text title) goes through `editGame` after an adaptive
debounce, an invalid one never reaches the game and is kept as a session draft
(`draftStore.js`). A change of the game from elsewhere replaces only the changed
range of the text. Schema problems come from the problems check
(`selectGameProblems`) and only warn; the Next problem button jumps to the
next one (`nextDiagnostic`). `RenderBoundary` keeps the panel usable
when the page cannot draw an edited game.

The `map` section (`MapForm.jsx`, a tab of the map page) is a schema form for everything
of the selected `?variation=` but its hexes (`MAP_KEYS` in `resolve.js`); its problem dot counts
the issues under that variation (`inVariation`) except the hexes.

The `hex` section (`HexSection.jsx`, a tab of the map page: an entry of
`editSections` with a `page` is on every page, and choosing it from another page
navigates there in `setEditSection` of `src/hooks/useEditPanel.js`) edits one group of
`map.hexes` as JSON in the same `JsonEditor`, which takes a `lens` (`gameLens`
in `src/util/jsonEditor.js` is the whole game; the hex lens reads, writes and
checks one group, and re-roots the problems of the game into it). The selected
group is `?hex=<its first coordinate>` (`useSelectedHex`, dropped with the panel,
a variation change or Escape by `useDropStaleHex`). `HexOverlay.jsx` is the
pointer layer of the pan and zoom map (`MapSingle` passes `interactive`, it is
only drawn on screen with the edit panel open): `usePanZoom` captures the
pointer, so it gives `onTap(downTarget, upEvent)` for a press that did not move
and `SvgEditor` hands it to the overlay through `TapContext`. The pure rules
(cells, groups, Cmd or Ctrl click, copied variations) are in `src/util/hexEdit.js`.

The `tiles` section (`TilesSection.jsx`, a tab of the tiles page, which a game
without `tiles` also has so its first tile can be added) edits `game.tiles`, whose
entries have four shapes (a quantity, an alias with `tile`, an override without
`color`, a definition with `color`; the order is the one of `getTile`). The pure
rules are in `src/util/tileEdit.js`: `writeTile` keeps the shape of an entry (an
integer stays one while only the quantity changes), `customizeTile` is the only
way a library tile (`@/data` tiles, never edited in place) becomes a definition,
and `renameTile` renames the key (the order is kept, except that ids that are whole
numbers sort first, as in any JS object) and the `tile` of the privates that
draw it. Aliases name library tiles and the map has no tile ids, so there is
nothing else to rewrite. The selected tile is `?tile=<id>` (`useSelectedTile`, the
id is URL-encoded because of `|`). On the tile sheets, `TilesOverlay` (only with the edit panel open, like `HexOverlay` for the map) draws a transparent target on every printed tile and a dashed "+" cell after the last tile (a page of its own in the editor when the last page is full). `HtmlEditor` hands a tap to it through `TapContext` (`TilesTap`, once per tiles page): a tap on a tile selects it (`selectTileSearch`), a tap on the cell or on any other empty position of a page (`data-empty`, transparent) adds `nextTileId` (`T1`, `T2`, ...) with `addTile` and selects it, then asks the pan and zoom view to bring it into view (a bubbling `reveal` event on the new tile, handled by `PanZoom`). The editor is `HexEditor` with `tile` (the
printing fields quantity, print and group, no `half`), or with `library` for an
entry drawn from the library (the drawing and the printing fields only).

The files of the CLI and the app have the same layout: `<folder>/<game id>/<format>/<file>`
(`formatFolder` in `src/export/names.js`, `gameFolder` in `src/export/sink.js`; the
Board 18 box is in `<game id>` itself). The app saves the folder of the folder
dialog as `exportFolder` in its `config.json` and opens the dialog there again
(`savedFolder` in `src/export/folder.js`, `electron/main/export.js`).

The export options are resolved in `src/export/options.js` (plain JS, used by
`maker export` and by `planExport` in `src/util/exportPlan.js`, which also gives
the export options panel its starting values). A new option goes in the `exports`
schema (with a description, a key of `schema.<lang>.json` in all three locale
files, and run `make` to publish it in `public/schemas/`), `cleanOptions`, the CLI flags (without a commander default,
or the flag would always hide the game file, and a boolean also a `--no-` flag
so that the game file can be turned off), the panel (a control that starts from
`exportDefaults`, and that can say "not set" over the game file, like every
variation), and the docs. Every option has a test for all three: the game file
sets it, a flag or a control overrides it.

`scripts/export-golden.mjs [game]` checks the shared capture
(`src/export/capture.js`, Chrome DevTools Protocol commands) against Playwright's
own calls on the built site: Board 18 images must be identical pixel for pixel
and PDFs must have the same page count and page sizes (and the same pages as
images when `pdftoppm` is installed). Run it on Linux, where fonts and the
Chromium build make pixels comparable.

### Export tests on every OS

Plan: the eight real export paths, {CLI, app} x {pdf, png, svg, b18}, run with no
mocks on Linux, macOS and Windows in the "Export" job of CI (checks "Export
Linux", "Export Mac", "Export Windows", the ones to require). Each job builds
the site and the app (`pnpm build`, `pnpm build:app`), then runs
`pnpm test:export` (`playwright.export.config.js`, no preview server, one
worker): `e2e/export.spec.js`, `e2e/cli.spec.js` and `e2e/electron.spec.js`.
In CI it runs in two shards by spec file (`cli.spec.js`, and
`electron.spec.js` with `export.spec.js`, which compares the app with the CLI).
Linux runs it under `xvfb-run`, and the app gets `--no-sandbox` only when `CI`
is set (the runner has no setuid `chrome-sandbox`). The job is separate from
the vitest jobs, so it is not part of the coverage merge.

`e2e/export.spec.js` has the eight paths as `export › cli › pdf`, `export › cli
› png`, `export › cli › svg`, `export › cli › b18`, and the same four for `app`. Each exports 18Test
and reads the real files: the `18test-map.pdf` has 1 page, the
`18test-background.png` is 2400 x 3150 pixels with a pHYs of 11811
pixels/meter, and the Board18 zip has its folder at the top, forward slash
names, and `Map`, `Market`, `Tokens` and `Yellow` images of fixed sizes
(`e2e/export-files.js`). The sizes come from the game (units and inches), not
from font metrics, so no tolerance is needed and every OS asserts the same.
The app is launched with `_electron.launch` on `dist/main` with a temp
`--user-data-dir`, and its native dialogs are replaced in the main process.

`e2e/electron.spec.js` exports 18Test from the app's options panel, saves a
single page as a pdf, and quits in the middle of an export. It opens real
windows, so it only runs with `E2E_ELECTRON=1`; on Linux use `xvfb-run` (and
`CI=1` to get `--no-sandbox` if Chromium's sandbox is not set up):

```shell
pnpm build && pnpm build:app
E2E_ELECTRON=1 pnpm test:export
```

The export windows load the built renderer (`dist/renderer`, `pnpm build:app`),
also in `pnpm start:app`.

## File Layout

At a high level the folder structure looks like:

```shell
.
├── bin               # CLI scripts
├── dist              # All built sites / apps end up in here
│   ├── app           # The built electron apps
│   ├── main          # The built esbuild for the main electron process
│   ├── preload       # The built esbuild for the preload file
│   ├── site          # The built esbuild for the main 18xx Maker site
│   ├── sb            # The built esbuild for the storybook site
│   └── renderer      # The built esbuild for the preload file
├── docker            # Stuff only related to docker builds
├── e2e               # Playwright end to end specs for the built site (and maker export)
├── electron          # Electron related src files
│   ├── assets        # Files that we need when building electorn
│   ├── main          # The src for the electron main process
│   └── preload       # The preload file injected into the render process
├── public            # Files that are just served statically
├── scripts           # Maintenance scripts (export-golden.mjs)
├── src
│   ├── cli           # CLI related files
│   ├── components    # React Components
│   ├── context       # React Contexts
│   ├── data          # Data files that are built into the app (games, icons, logos, etc)
│   ├── defaults.json # Default config file values
│   ├── docs          # All help page markdowns
│   ├── export        # What a game exports (documents, b18, names), used by the CLI
│   ├── hooks         # React hooks
│   ├── index.jsx     # React root of the project
│   ├── locales       # Localization files
│   ├── routes.jsx    # React Router route definitions
│   ├── schemas       # JSON schemas for all 18xx Maker data files
│   ├── state         # Redux state store related files
│   ├── styles        # All css files
│   └── util          # Utility helpers
└── tests             # Vitest integration tests and test helper files
```

## Storybook

`pnpm start:sb` shows the print elements (atoms, hexes, tiles, tokens, map
pieces, cards, market cells and print blocks) with a Controls panel for each
story's props. The toolbar switches the map and company themes. Every story is
rendered by `tests/stories.test.jsx`, so a new story must draw an svg.

When adding a story next to a component (`Name.stories.js`):

- `parameters: { svg: true }` draws it into a hex sized svg, or
  `svg: { width, height, viewBox }` for another size. Omit it when the
  component draws its own markup.
- `parameters: { game: "18Test" }` loads a bundled game for components that
  read the game.
- Use `colorSelect()` from `.storybook/controls.js` for color props and real
  `argTypes` (selects, ranges, booleans) so every prop can be changed.
- Stories are `.js` files, so use `createElement` instead of JSX.
  Stories of the interface (`Chrome/...`, the components in
  `src/components/ui`) may be `.jsx` files. They set `parameters: { chrome: true }`
  because they are not drawn in an svg: `tests/stories.test.jsx` then checks
  that the story draws a control (a `role`, input or button) instead of an svg.
