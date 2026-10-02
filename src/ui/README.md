# src/ui

The app chrome's UI layer: tokens, hooks, icons and (from phase 2 on) the
components that replace MUI. MUI and this layer coexist until MUI is removed.
Print pages (tiles, maps, charts, cards) are not part of it and never use it.

## Conventions

- App code imports from `@/ui`, never from the library underneath.
- CSS Modules only (`*.module.css`), plus `tokens.css`. No global element
  rules in this folder: no `*`, `button`, `svg`, `img`, `html`, `body`,
  `box-sizing`. Base styles belong on a component's own class.
- Specificity discipline: one class per rule, or `:where()` for defaults a
  consumer should override. No ids, no `!important`, no element qualifiers.
- Tokens are CSS custom properties from `tokens.css`, scoped to
  `[data-chrome-root]` (set on `#dropzone` in `Root.jsx`) so they cannot reach
  print pages. Content portaled outside `#dropzone` (menus, tooltips,
  drawers) must carry its own `data-chrome-root`. `theme.spacing(n)` is
  `calc(var(--space) * n)`.
- Every replaced component gets a stable hook: a `data-testid` (the phase 0
  hooks such as `app-bar`, `side-nav`, `config-drawer`, `print-fab`, `tooltip`,
  `viewport`, `alert`) and, where CSS needs one, a `data-chrome="<name>"`
  attribute. Tests and print CSS select by these, never by generated class
  names.
- Icons are SVG files in `icons/svg/` loaded by `vite-plugin-fast-react-svg`
  and exported by name from `@/ui` (`import { Train } from "@/ui"`). See
  `icons/NOTICE.md` for their license. The plugin camelCases attribute names,
  so do not put `aria-hidden` in the files (`createIcon` sets it).

## Breakpoints

`@custom-media` is not usable here. `postcss-preset-env` (inline PostCSS config
in `vite.config.js`) resolves it in the same file only, and every CSS Module
is processed on its own, so `@custom-media --md` in `tokens.css` is left as
`@media (--md)` in other files. Custom properties do not work in `@media`
either. So CSS uses literal px values (600, 960, 1280, 1920 and the MUI
`down()` step 599.95 etc.), and `breakpoints.js` exports the same numbers with
MUI's `up()`/`down()` strings for `useMediaQuery`. `breakpoints.test.js` fails
if any `@media` width in `src/ui` is not one of them.

## Cascade order while MUI exists

- `Root.jsx` uses `StyledEngineProvider injectFirst`, so MUI's emotion styles
  are prepended to `<head>` and lose to any later stylesheet, including CSS
  Modules, at equal specificity.
- `@mui/styles` (JSS `makeStyles`) injects its `<style>` tags last at runtime
  and beats CSS Modules at equal specificity. 22 files use it today.
- So a converted component that shares an element with a `makeStyles` class
  loses ties. Convert the whole element, or keep specificity higher than a
  single class (nest under a parent class) when the JSS rule must be beaten.
  Defaults written with `:where()` lose to everything, which is intended.
- `coexistence.test.jsx` pins all of the above next to real MUI components.
  Once `@mui/styles` is gone nothing in this section applies.

## Print rules (`src/styles/root.css`, `@media print`)

That block hides the chrome with `.MuiAppBar-root`, `.MuiDrawer-root`,
`.MuiSnackbar-root`, `.MuiFab-root`, `.MuiTooltip-popper` and frees the
viewport with `.MuiBox-root`. Do not touch it until the component it names is
replaced. The PR that replaces a component must, in the same PR, swap that
selector for the component's `data-chrome` hook (or a CSS Module class) and
keep `e2e/print.spec.js` green, which checks the `data-testid` hooks under
`emulateMedia({ media: "print" })`. Remember `.MuiBox-root` also matches every
other `Box`, so replacing `Viewport` needs a dedicated hook for the viewport.

## Testing

- Component tests (`*.test.jsx`) run in real Chromium, where Vite serves the
  CSS for real, so computed styles are meaningful there (the coexistence and
  icon tests rely on it).
- vitest sets `css: false`. In the node `unit` project CSS Module imports give
  a proxy and class names are not meaningful. Assert roles, text and computed
  style, never class names.
- Print snapshots must not change in any UI PR (`pnpm test:run`, CI=1).
