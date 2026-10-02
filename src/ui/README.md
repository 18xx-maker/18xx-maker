# src/ui

The app chrome's UI layer: tokens, hooks, icons and the components the chrome is
built from (it replaced MUI, which is no longer a dependency). Print pages
(tiles, maps, charts, cards) are not part of it and never use it.

## Conventions

- App code imports from `@/ui`, never from the library underneath.
- CSS Modules only (`*.module.css`), plus `tokens.css`. No global element
  rules in this folder: no `*`, `button`, `svg`, `img`, `html`, `body`,
  `box-sizing`. Base styles belong on a component's own class.
- Specificity discipline: one class per rule, or `:where()` for defaults a
  consumer should override. No ids, no `!important`, no element qualifiers.
- Tokens are CSS custom properties from `tokens.css`, declared on
  `[data-chrome-root]`, which `Root.jsx` sets on `<body>` so that content Base UI
  portals to body (menus, tooltips) gets them too. A
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

## Cascade order

- All styling is CSS Modules, ordered by import. App code imports `@/ui` before
  its own `*.module.css`, so at equal specificity a consumer's class beats a
  `src/ui` primitive. A default a consumer must always be able to override is
  written in `:where()` (most primitives do this, `Alert`, `Drawer` and `Fab`
  included). A rule that must beat a primitive's own class, such as the icon
  size inside a pagination button, uses two classes.
- `scripts/check-mui.js` (`pnpm check:mui`, run in CI) fails if a file imports
  `@mui` or `@emotion`.
- `tokens.test.jsx` pins the token and `:where()` behavior.

## Print rules (`src/styles/root.css`, `@media print`)

That block hides the chrome with `[data-chrome="app-bar"]`,
`[data-chrome="fab"]`, `[data-chrome="drawer"]`, `[data-chrome="snackbar"]` and
`[data-chrome="tooltip"]` (the `src/ui` AppBar, Fab, Drawer, Snackbar and
Tooltip). It frees the viewport with `[data-chrome="viewport"]` and the
background page's wrapper with `[data-chrome="background"]`. A new piece of
chrome gets a `data-chrome` hook and a line there, and `e2e/print.spec.js`
(which checks the `data-testid` hooks under `emulateMedia({ media: "print" })`)
gets its test id.

## Drawer, Snackbar and friends

- `Drawer` is own code, no library: `permanent` and `persistent` are a fixed
  panel (persistent slides with a transform and is `visibility: hidden` while
  closed, so it is out of the tab order), `temporary` is a modal panel with a
  backdrop that closes it, Escape, a Tab trap and focus restore. It is not a
  native `<dialog>`: `showModal()` puts the dialog in the top layer, above the
  app bar, which must stay above the backdrop. The temporary drawer renders in
  place (not a portal) and its backdrop is a plain element, so a file dropped
  on it still bubbles to `#dropzone` (`e2e/load.spec.js` pins that, with the
  config drawer and the side nav backdrop open). Its content only renders while
  it is open or leaving.
- `Fab` slides in from the right edge when it mounts (the old `Slide`), a CSS
  animation. Everything that moves respects `prefers-reduced-motion`.
- `Snackbar` + `Alert` replace MUI's. `Snackbar` is a bottom left corner with an
  auto-hide timer (hovering pauses it) and Escape to dismiss; there is no exit
  transition. `Alert` is `role="alert"` for every severity: it mounts already
  filled, and a `role="status"` region that arrives with its text is not
  announced.
  `Root.jsx` drives them from the redux alert state, keyed by the alert so a new
  alert restarts the timer.
- `LinearProgress` and `CircularProgress` are `role="progressbar"` elements.
  `Pagination` is own markup (`aria-current` on the page, same pages as MUI's
  `usePagination`). `Slider` is Base UI's range slider.

## Popups (Select, DropdownMenu, Tooltip)

These are the components built on Base UI (`@base-ui/react`, pinned to an exact
version; the `Slider` is the other one). They portal to `<body>`, so they get the tokens from
`data-chrome-root` and sit above the drawers (`--z-modal`, `--z-tooltip`).

- `Select` replaces MUI's Select, MenuItem, InputLabel and FormControl. It is
  not a native `<select>`: the popup has to look like the MUI menu paper, native
  popups cannot be styled, and the app's tests and e2e specs drive it through the
  `combobox`, `listbox` and `option` roles with a click. `options` is
  `[{ value, label }]` and `onChange` gets `{ target: { name, value } }`. A
  closed Base UI select keeps its hidden listbox in the DOM, so a query for
  `listbox` finds it (pass `{ hidden: false }` to ask for the open one) and
  "is it open" is `aria-expanded` on the combobox.
- `DropdownMenu` (the name avoids the `Menu` hamburger icon) with `MenuItem`
  (`component` makes it a link item) and `MenuDivider`. It is controlled with
  `anchorEl`, `open` and `onClose`, like MUI's Menu.
- `Tooltip` forwards its ref and extra props to its child (a `Fab`). It does not name the child: pass `aria-label`.
  The popup has `data-chrome="tooltip"` and `data-testid="tooltip"`.
- Keyboard shortcuts (`useBindings`, on `document`) only ignore `input` and
  `textarea` targets. An open Select or Menu handles printable keys itself
  (typeahead) and stops them, so shortcuts do not fire while a popup holds the
  focus. `tests/bindings.popups.test.jsx` pins that.
- Use a literal `min-height: 48px` below 600px for items (MUI's touch height).

## Testing

- Component tests (`*.test.jsx`) run in real Chromium, where Vite serves the
  CSS for real, so computed styles are meaningful there (the token and icon
  tests rely on it).
- vitest sets `css: false`. In the node `unit` project CSS Module imports give
  a proxy and class names are not meaningful. Assert roles, text and computed
  style, never class names.
- Print snapshots must not change in any UI PR (`pnpm test:run`, CI=1).
