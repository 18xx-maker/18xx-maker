# Web SVG Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** SVG export (one file or a zip of many) in the web version, with the same files the CLI writes.

**Architecture:** The web reuses the export core unchanged: `planExport` →
`createPool` + `createPageCapture` + `runExport`. A pool slot is a hidden
same-origin `<iframe>` that loads the document route in render mode (the
game comes from the parent through `window.frameElement`). Its `send` only
accepts `Emulation.setEmulatedMedia` (a no-op: screen media, see spec) and its
`evaluate` runs the expression in the iframe window, so `capture` →
`captureSvg` → `serializeSvg` run exactly as in the CLI. Files are zipped with
fflate and downloaded.

**Tech Stack:** React 19, Redux, Vite, vitest (unit + browser component), Playwright, fflate.

**Spec:** `docs/superpowers/specs/2026-11-27-web-svg-export-design.md`

## Global Constraints

- Web formats: `svg` only. PNG, PDF, b18, dpi, background, card bleed and destination controls are not shown on the web; Electron UI unchanged.
- Print output and the app/CLI export must not change: `tests/__snapshots__` and `pnpm test:export` expectations stay byte-identical.
- Render mode in the iframe never writes localStorage, adds recents, sends analytics or calls app APIs (`CLAUDE.md` "Render mode").
- `src/export` stays plain ES modules (no React, DOM, `fs`); DOM code goes in `src/util/webExport.js`.
- One file downloads as its bare file name (`<slugged title>-<basename>.svg`); several as `<titleToFilename(title)>.zip` whose entries are the job paths (`svg/<file>.svg`).
- Every new UI string in `src/locales/en.json`, `de.json`, `zh.json`; doc changes in `.en.md`, `.de.md`, `.zh.md`.
- Commits: Conventional Commits, no AI attribution in PR bodies beyond the reminder's lines; run `node scripts/check-pr-body.mjs` on the PR body.

## Review Focus

1. **Same-origin iframe shares localStorage with the parent** — an export must leave `localStorage` and the recents list exactly as before (Task 1 test, Task 5 e2e assertion).
2. **Parent in dark theme** — the iframe reads the theme setting from shared storage; a web SVG exported with the dark theme selected must equal the one exported in light (Task 5).
3. **Custom images of the game** (`selectAssets`) — they reach the iframe through render input `assets`, and the SVG of the custom-image doc contains the asset path the CLI writes (Task 5, reuses `expected.svg.custom`).
4. **A document that renders `empty` or times out** — that file is in `failed`, the others are still zipped and downloaded, and an error alert names the first failure (Task 3 unit test).
5. **Cancel mid-export** — nothing is downloaded and every iframe is removed from the document (Task 3 unit test, Task 4 component test).

---

### Task 1: Render input from the parent frame

**Files:**

- Modify: `src/util/renderInput.js`
- Test: `src/util/renderInput.test.js` (create or extend; imports `tests/support/windowStub.js`)

**Interfaces:**

- Produces: the iframe element carries `__RENDER_INPUT__` (`{ id, game, config, assets }`); `getRenderInput()` reads `window.__RENDER_INPUT__ || window.frameElement?.__RENDER_INPUT__ || window.api?.renderInput`.

- [ ] **Step 1: Write failing tests**
  - `reads the input of the frame element`: stub `window.frameElement = { __RENDER_INPUT__: { id: "x", game, config: {} } }`, re-import the module fresh (`vi.resetModules()`), expect `getRenderInput().game.meta.slug === "render:x"`.
  - `window input wins over the frame element`.
  - `no frame element, no input` → `undefined`.
- [ ] **Step 2:** `pnpm exec vitest run --project unit src/util/renderInput.test.js` → FAIL.
- [ ] **Step 3:** Add the frame source to `getRenderInput` and the comment that lists the sources. Reading `frameElement` of a cross-origin parent returns `null`, no try needed.
- [ ] **Step 4:** Same command → PASS. Also check the render-mode guards already cover localStorage/recents/analytics: `grep -rn getRenderInput src` and confirm nothing new writes when render input comes from the frame (they key off `getRenderInput()`, not its source).
- [ ] **Step 5:** Commit `feat(export): read render input from the parent frame`.

### Task 2: Zip of files

**Files:**

- Modify: `package.json`, `pnpm-lock.yaml` (`pnpm add fflate`)
- Create: `src/export/zipFiles.js`
- Test: `src/export/zipFiles.test.js`

**Interfaces:**

- Produces: `zipFiles(files: Array<{ path: string, bytes: Uint8Array }>) => Uint8Array` — fflate `zipSync`, entries in the given order, fixed `mtime` (`new Date(1980, 0, 1)`) so the bytes are deterministic.

- [ ] **Step 1: Failing tests** — `zips files under their paths` (round-trip with fflate `unzipSync`: keys `["svg/a.svg", "svg/b.svg"]`, contents equal); `same input, same bytes` (two calls deep-equal).
- [ ] **Step 2:** `pnpm exec vitest run --project unit src/export/zipFiles.test.js` → FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Same command → PASS.
- [ ] **Step 5:** Commit `build: add fflate for zipped web exports` (include the module and test).

### Task 3: Web export runner

**Files:**

- Create: `src/util/webExport.js`
- Test: `src/util/webExport.test.js` (unit project, fake slots, `windowStub`)

**Interfaces:**

- Consumes: `createPool` (`src/export/pool.js`), `createPageCapture` (`src/export/page.js`), `runExport` (`src/export/run.js`), `zipFiles` (Task 2), `titleToFilename` (`src/util`), Task 1's `__RENDER_INPUT__`.
- Produces:
  - `frameSlot(input) => Promise<{ load(path), evaluate(expression), send(method, params), close() }>` — appends a hidden iframe (`position: fixed; left: -100000px; width: 1600px; height: 1200px; border: 0`, `aria-hidden`), sets `iframe.__RENDER_INPUT__ = input`; `load` sets `src` and resolves on the `load` event; `evaluate` = `iframe.contentWindow.eval(expression)` awaited; `send` is the exported `frameSend(method) => Promise<void>`: resolves for `Emulation.setEmulatedMedia`, rejects `Unsupported on the web: <method>` for anything else; `close` removes the iframe.
  - `exportSvgs(request, { signal, onProgress, concurrency = 2, openSlot = frameSlot, timeout }) => Promise<{ done, total, failed: Array<{ path, message }>, cancelled, file: { name, bytes, type } | null }>` — `request` is `planExport(...)` output; input is `{ id, game, config, assets }` of it. `file` is `null` when cancelled or nothing was written; one written file → `{ name: basename(path), bytes, type: "image/svg+xml" }`; several → `{ name: \`${titleToFilename(request.game.info.title)}.zip\`, bytes: zipFiles(...), type: "application/zip" }`. On abort the pool is closed (same race as `service.js`).
  - `saveFile({ name, bytes, type })` — Blob + object URL + temporary `<a download>`, URL revoked after click.

- [ ] **Step 1: Failing tests** (fake `openSlot` whose `evaluate` returns `"ready"` for the render-state expression and `{ text: "<svg …/>" }` for an svg expression):
  - `one job downloads the bare svg` → `file.name === "18test-map.svg"`, `type === "image/svg+xml"`.
  - `several jobs download a zip of the job paths` → `unzipSync(file.bytes)` keys equal the job paths.
  - `an empty document fails, the others are zipped` (one slot answers `"empty"`) → `failed.length === 1`, zip has the rest.
  - `cancel closes every slot and returns no file` → abort after the first `doc` progress; `cancelled === true`, `file === null`, every fake slot's `close` called.
  - `frameSend accepts only the media emulation` → resolves for `Emulation.setEmulatedMedia`, rejects for `Page.captureScreenshot`.
- [ ] **Step 2:** `pnpm exec vitest run --project unit src/util/webExport.test.js` → FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Same command → PASS.
- [ ] **Step 5:** Commit `feat(export): export svgs in the browser`.

### Task 4: Export UI on the web

**Files:**

- Modify: `src/components/export/ExportHost.jsx`, `src/components/export/ExportOptions.jsx`, `src/components/Toolbar.jsx:245`, `src/components/nav/AppSidebar.jsx:78`, `src/hooks/bindings.js` (`case "x"`), `src/locales/{en,de,zh}.json`
- Create: `src/components/export/useWebExport.js`
- Test: `tests/export/exports.test.jsx` (extend; component project)

**Interfaces:**

- Consumes: `exportSvgs`, `saveFile` (Task 3); `planExport`.
- Produces: `useWebExport() => { run(request) => Promise<result>, cancel(), running }` — dispatches `createProgressAlert(t("export.progressTitle"), t("export.progress", { done, total, name }), percent)` on each `doc`, then one of `createAlert(t("export.doneTitle"), t("export.done", { count }), "success")`, `createAlert(t("export.cancelledTitle"), t("export.cancelled", { done, total }), "warning")`, `createAlert(t("export.failed"), t("export.someFailed", { failed, total, path, message }), "error")`, and an error alert `t("export.noFiles")` when `total === 0`; calls `saveFile(file)` when `file` is set.
- New strings (en, translate for de/zh with existing terminology): `progressTitle` "Exporting game", `progress` "{{done}}/{{total}} - {{name}}", `doneTitle` "Game exported", `done` "Exported {{count}} files", `cancelledTitle` "Export cancelled", `cancelled` "Exported {{done}} of {{total}} files", `someFailed` "{{failed}} of {{total}} files failed, {{path}}: {{message}}".

Behavior:

- `ExportHost`: `hidden = print || !game` (no longer `!capability.electron`). On the web the menu has only "Export game as svg images" (`s`) and "Export options" (`o`); `handleAll("svg")` runs `useWebExport().run(planExport(game, layers, { formats: ["svg"] }, assets))`. Electron path unchanged.
- `ExportOptions`: `FORMATS` is `["svg"]` on the web; the dpi, card bleed, background, b18 fields and the destination block are not rendered on the web; run uses `useWebExport().run(planExport(...))`, cancel uses its `cancel()`.
- Toolbar: on the web render `<ExportButton />` before `<PrintButton />`; sidebar `ExportItem` and the `x` binding drop the `capability.electron` check (keep the other conditions).

- [ ] **Step 1: Failing tests** in `tests/export/exports.test.jsx` (web is the default in component tests, `capability.electron` false; mock `@/util/webExport` with `vi.mock` so `exportSvgs` resolves a fake result and `saveFile` is a spy):
  - `the web menu offers svg and options only` → menu items are exactly those two labels.
  - `svg from the menu downloads the planned svgs` → `exportSvgs` called with a request whose jobs all have `format === "svg"`; `saveFile` called with the result's file; success alert text "Exported 3 files" (use the fake's count).
  - `web options show only svg` → no dpi, background, b18 or destination controls; checkbox `export-format-svg` only.
  - `cancel stops the web export` → while the fake is pending, click cancel; the signal passed to `exportSvgs` is aborted; the warning alert shows.
  - `the toolbar shows export and print on the web`.
  - Update any existing test that asserted the export UI is absent on the web.
- [ ] **Step 2:** `pnpm exec vitest run --project component tests/export/exports.test.jsx` → FAIL.
- [ ] **Step 3:** Implement; add the strings to all three locales.
- [ ] **Step 4:** Same command → PASS; `pnpm exec vitest run --project unit src/locales` → PASS; `pnpm lint`.
- [ ] **Step 5:** Commit `feat(ui): export svg images from the web version`.

### Task 5: Web SVG equals CLI SVG (e2e)

**Files:**

- Modify: `e2e/export.spec.js` (add `export › web › svg`; runs under `pnpm test:export`)

**Interfaces:**

- Consumes: built `dist/site`, `startServer` (`src/cli/util.js`), the CLI (`bin/maker.js export`), fflate `unzipSync`.

- [ ] **Step 1: Write the test** `export › web › svg`:
  - CLI: export `src/data/games/18Test.json` with `--format svg` into a temp dir (same invocation style as `export › cli › svg`).
  - Web: start `startServer` on `dist/site`, open `/games/18Test` in a Playwright page, record `localStorage` (as JSON of all keys), open the export menu, choose svg, wait for the download, `unzipSync` it.
  - Assert: the zip's file names equal the CLI's svg file names; each file's text equals the CLI's byte for byte; `localStorage` after equals before; no `<iframe>` left in the page.
  - Repeat the web export with the dark theme chosen (set it through the UI or the stored `settings.theme`), assert the files equal the light ones.
  - For the custom image: load the game with a custom asset the way `export › app › svg` does (or the CLI fixture with `expected.svg.custom`), and assert the web file contains `expected.svg.custom.path`.
- [ ] **Step 2:** `pnpm build && pnpm exec playwright test -c playwright.export.config.js -g "web"` → if a file differs, the print-media assumption failed: in `frameSlot.load`, after load, rewrite the iframe's `@media print` rules to `all` (iterate `document.styleSheets` CSSOM, `rule.media.mediaText = "all"` for `print`, delete `screen`-only rules), and re-run until equal. Do not change the CLI or snapshots to make it pass.
- [ ] **Step 3:** PASS.
- [ ] **Step 4:** Commit `test(export): compare web svg export with the cli`.

### Task 6: Docs

**Files:**

- Modify: `src/docs/games/exports.{en,de,zh}.md`, `src/docs/output/svg.{en,de,zh}.md`, `DEVELOPMENT.md` (exporting section: web surface, `src/util/webExport.js`)

- [ ] **Step 1:** Say SVG export works in the web version (one file or a zip), the other formats need the app or CLI. Same structure in all three languages, anchors fixed.
- [ ] **Step 2:** `pnpm exec vitest run --project unit src/locales` and `pnpm pretty` → PASS.
- [ ] **Step 3:** Commit `docs: describe svg export in the web version`.

### Final verification (before push)

Run the full sequence from `CLAUDE.md` "Full test run", plus
`pnpm build && pnpm build:app && E2E_ELECTRON=1 pnpm test:export` (render mode
changed). Snapshots must show zero changes. Look at one web-exported map SVG
in a browser next to the CLI one.
