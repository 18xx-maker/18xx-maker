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
- Tokens are CSS custom properties from `tokens.css`, declared on
  `[data-chrome-root]`, which `Root.jsx` sets on `<body>` so that content MUI or
  Base UI portals to body (menus, tooltips, drawers, dialogs) gets them too. A
  portal into any other container must set `data-chrome-root` itself.
  `theme.spacing(n)` is `calc(var(--space) * n)`.
- Print pages render inside the app, so they inherit the custom properties.
  They are unaffected because nothing in `src/ui` styles print elements and
  print CSS uses none of the token names. Keep it that way.
- There is no global reset, so every converted component sets its own
  `box-sizing` (MUI components do, and the swap must not change layout).
- Stylelint (`package.json`) bans `*`, `html`, `body`, `button`, `svg` and `img` as
  the leading selector of a rule in `src/ui/**` (`.card svg` is fine).
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

`@custom-media` is not used. `postcss-preset-env` (inline PostCSS config in
`vite.config.js`) resolves it in the same file only, and every CSS Module is
processed on its own, so `@custom-media --md` in `tokens.css` stays
`@media (--md)` everywhere else. Sharing it would need
`@csstools/postcss-global-data` (a new dependency). That would still only fix
the build: the vitest projects in `vitest.workspace.js` define their own Vite
config and do not inherit `css.postcss` from `vite.config.js`, so component
tests serve the CSS untransformed (native nesting, no custom-media). Custom
properties do not work in `@media` either. So CSS uses literal px values (600,
960, 1280, 1920, and MUI's `down()` step such as 599.95), and `breakpoints.js`
exports the same numbers with MUI's `up()`/`down()` strings for
`useMediaQuery`. `breakpoints.test.js` fails if any `@media` in `src/ui` uses a
number that is not one of them, or a unit other than px.

## Cascade order while MUI exists

- `Root.jsx` uses `StyledEngineProvider injectFirst`, so MUI's emotion styles
  are prepended to `<head>` and lose to any later stylesheet, including CSS
  Modules, at equal specificity. So a CSS Module class beats the emotion styles
  of the MUI component it is put on, and a `src/ui` primitive that sets a
  property loses to a consumer's class only if the consumer's CSS loads later.
  App code imports `@/ui` before its own `*.module.css`, which keeps that
  order. A default a consumer must always be able to override is written in
  `:where()` (the `TextField` root is one).
- No file imports `@mui/styles` any more (`scripts/check-mui-styles.js` pins
  the count at 0), so the JSS rule that used to beat CSS Modules is gone.
- `coexistence.test.jsx` pins the rest next to real MUI components.

## Print rules (`src/styles/root.css`, `@media print`)

That block hides the chrome with `[data-chrome="app-bar"]` and
`[data-chrome="fab"]` (the `src/ui` AppBar and Fab), and still uses `.Mui*`
selectors for what is not replaced yet: `.MuiDrawer-root`, `.MuiSnackbar-root`,
`.MuiTooltip-popper` and `.MuiFab-root` (the config drawer's MUI Fab). It frees
the viewport with `[data-chrome="viewport"]` and the background page's wrapper
with `[data-chrome="background"]`. Leave a `.Mui*` selector alone until the component it names
is replaced. The PR that replaces one must, in the same PR, swap the selector
for the component's `data-chrome` hook (or a CSS Module class) and keep
`e2e/print.spec.js` green, which checks the `data-testid` hooks under
`emulateMedia({ media: "print" })`.

## Testing

- Component tests (`*.test.jsx`) run in real Chromium, where Vite serves the
  CSS for real, so computed styles are meaningful there (the coexistence and
  icon tests rely on it).
- vitest sets `css: false`. In the node `unit` project CSS Module imports give
  a proxy and class names are not meaningful. Assert roles, text and computed
  style, never class names.
- Print snapshots must not change in any UI PR (`pnpm test:run`, CI=1).
