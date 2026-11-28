# Web SVG export

## Intent

The web version (no Electron) has only the browser print dialog. Add SVG
export, of one document or many, to the web, with the same files the app and
CLI write. PNG, PDF and b18 stay app/CLI only.

## Goals

- Export menu and options panel on the web, limited to SVG.
- Same document list, file names and options (docs, layouts, variation) as
  the app; the same SVG text the CLI writes for a document.
- One file downloads as `<name>.svg`; several download as one
  `<slugged title>.zip`.
- Progress and cancel, like the app's panel.

## Non-goals

- PNG, PDF, b18 on the web; a folder picker (`showDirectoryPicker`); a server.

## Anti-goals

- Changing print output or the app/CLI export (snapshots and export suites
  unchanged).
- Render mode writing localStorage, recents or analytics from the iframe.

## Approaches

1. **In-browser: hidden same-origin iframes + `serializeSvg` + zip (picked).**
   No server, the game stays local, reuses `exportJobs`, `runExport`,
   `createPool`, `names.js`, `options.js` and `serializeSvg`.
2. Hosted Playwright render service: exact parity incl. PDF/PNG, but needs
   infrastructure and uploads games. Rejected.
3. `html-to-image` for everything: lower fidelity. Rejected.

SVG only (no PNG) removes canvas rasterizing, font and image inlining and
canvas size limits.

## Design

- **Surface:** browser-only code in a new module outside `src/export` (that
  folder stays free of DOM code); planning, naming and options stay in
  `src/export`.
- **Slot:** a hidden, off-screen, same-origin `<iframe>` per pool slot. It
  loads `docPath(job.doc)` of the render game (`renderGame`/`renderSlug`).
  `getRenderInput` gains one source: the input set on the iframe element by
  the parent (`window.frameElement`), so render mode works unchanged. Wait for
  `document.body.dataset.renderState` (`ready` / `empty`) as `page.js` does,
  with the same timeout; a failed slot is discarded.
- **Capture:** evaluate `svgExpression(doc.capture.selector)` in the iframe
  window, bytes are the UTF-8 text.
- **Print media:** not emulated. `@media print` rules only change container
  margins/padding and page backgrounds (`print-pages.css`, `@page` sizes),
  none of which reach the serialized SVG. The equality test below is the
  check; if it fails, the rules are rewritten to screen in the iframe.
- **Sink:** fflate streaming zip, built as files arrive, then a Blob
  download. One job: the bare `.svg`.
- **UI:** on the web the toolbar shows the export button next to the print
  button. `ExportOptions` shows only SVG on the web (no dpi, background or
  b18 fields) and documents without SVG are not listed. Strings in
  `en`/`de`/`zh`.
- **Docs:** `src/docs/games/exports` and `src/docs/output/*` say SVG export
  works on the web, in all three languages.

## Verification

- An e2e spec exports SVGs of `18Test` from the built site, unzips the
  download and asserts each file equals the CLI's SVG of the same document.
- Unit tests for the zip sink and render-input source; component test for
  the web options panel (SVG only, cancel).
- Full CI run from `CLAUDE.md`, including the export suites (render mode
  changed).

## Left to the builder

- Pool size (start at 2), iframe size, module and component names.
- Whether the export button on the web replaces or sits beside print (design
  says beside).
