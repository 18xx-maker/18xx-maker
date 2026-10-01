const AxeBuilder = require("@axe-core/playwright").default;
const { expect, test } = require("@playwright/test");

// Known accessibility problems that are not fixed yet, found by the first run
// of this suite. Keyed by page name, each entry is an axe rule plus the css
// selectors of the nodes that violate it (see normalize() for how generated
// class names are written). A violating node that is not listed fails the
// test, and so does a listed node that no longer violates, so the entry gets
// removed. Do not add to this list to make a failure go away: fix the page,
// or record the violation here on purpose.
const SIDE_NAV = ".MuiDrawer-paperAnchorDockedLeft>.css";

// Same problems on every game page (game info, map and the config drawer)
const GAME_NAV_NESTED = {
  // A form control (FormControl with a Select) inside a ListItemButton in
  // GameNav (src/components/nav)
  rule: "nested-interactive",
  targets: [
    `${SIDE_NAV}:nth-child(4)>.css.MuiListItemButton-root[role="button"]`,
  ],
  reason: "controls inside a ListItemButton",
};
const GAME_VIEWPORT_SCROLL = {
  // The scrollable game area (Viewport) is not keyboard focusable
  rule: "scrollable-region-focusable",
  targets: [".jss"],
  reason: "scrollable game area",
};

// ListItemButton with component={RouterLink} renders <a> directly inside <ul>
// in the game, docs and elements side navs (src/components/nav/*).
// Fix: wrap each in <ListItem disablePadding>
const SIDE_NAV_LIST = (targets) => ({
  rule: "list",
  targets,
  reason: "side nav links are direct children of <ul>",
});

const KNOWN_ISSUES = {
  "game info": [
    SIDE_NAV_LIST([
      `${SIDE_NAV}:nth-child(2)`,
      `${SIDE_NAV}:nth-child(4)`,
      // The page's own <List> in src/components/pages/games/Info.jsx
      ".MuiPaper-elevation5>.css",
    ]),
  ],
  "game map": [
    SIDE_NAV_LIST([
      `${SIDE_NAV}:nth-child(2)`,
      `${SIDE_NAV}:nth-child(4)`,
      `${SIDE_NAV}:nth-child(6)`,
    ]),
    GAME_NAV_NESTED,
    GAME_VIEWPORT_SCROLL,
  ],
  docs: [
    SIDE_NAV_LIST(
      [2, 4, 6, 8].map(
        (n) => `${SIDE_NAV}.MuiList-root.MuiList-padding:nth-child(${n})`,
      ),
    ),
  ],
  "config drawer": [
    SIDE_NAV_LIST([
      `${SIDE_NAV}:nth-child(2)`,
      `${SIDE_NAV}:nth-child(4)`,
      `${SIDE_NAV}:nth-child(6)`,
    ]),
    GAME_NAV_NESTED,
    GAME_VIEWPORT_SCROLL,
    {
      // These number inputs have no accessible name (src/components/config)
      rule: "label",
      targets: [
        "#stock\\.column",
        "#stock\\.diag",
        "#stock\\.par",
        "#charters\\.border",
        "#cards\\.border",
      ],
      reason: "config inputs without a label",
    },
    {
      // Links in the config drawer's descriptions are only underlined by
      // color
      rule: "link-in-text-block",
      targets: [
        'a[href$="logos"]',
        ".MuiTypography-caption.css.MuiTypography-gutterBottom:nth-child(11)>p>a",
      ],
      reason: "inline links in config descriptions",
    },
  ],
};

// Generated class names (emotion's css-<hash>, jss<number>) change between
// builds, so they are reduced to ".css" and ".jss", and spaces around ">" are dropped
const normalize = (target) =>
  target
    .replace(/\s*>\s*/g, ">")
    .replace(/\.css-[a-z0-9]+/g, ".css")
    .replace(/\.jss\d+/g, ".jss");

const pages = [
  { name: "home", url: "/", ready: (page) => page.getByTestId("home") },
  {
    name: "games list",
    url: "/games/",
    ready: (page) => page.getByTestId("games"),
  },
  {
    name: "game info",
    url: "/games/1889",
    ready: (page) => page.getByTestId("game-1889"),
  },
  {
    name: "game map",
    url: "/games/18Test/map",
    ready: (page) => page.getByTestId("game-18Test-map"),
  },
  {
    name: "config drawer",
    url: "/games/18Test/map?config=true",
    ready: (page) => page.getByRole("button", { name: "Close Config" }),
  },
  {
    name: "docs",
    url: "/docs",
    ready: (page) => page.locator("[data-testid^='docs-']"),
  },
];

for (const { name, url, ready } of pages) {
  test(`no serious or critical accessibility violations: ${name}`, async ({
    page,
  }) => {
    await page.goto(url);
    await expect(ready(page)).toBeVisible();
    // Wait for the drawer and page transitions to finish
    await page.evaluate(() =>
      Promise.all(document.getAnimations().map((a) => a.finished)),
    );

    const results = await new AxeBuilder({ page }).analyze();
    const known = KNOWN_ISSUES[name] || [];
    const found = [];
    for (const v of results.violations) {
      if (!["serious", "critical"].includes(v.impact)) continue;
      for (const node of v.nodes) {
        found.push({ rule: v.id, target: normalize(node.target.join(" ")) });
      }
    }

    const isKnown = ({ rule, target }) =>
      known.some((k) => k.rule === rule && k.targets.includes(target));
    expect(found.filter((f) => !isKnown(f))).toEqual([]);

    // Known issues that no longer happen should be removed from the list
    const stale = known.flatMap((k) =>
      k.targets
        .filter((t) => !found.some((f) => f.rule === k.rule && f.target === t))
        .map((t) => `${k.rule}: ${t}`),
    );
    expect(stale).toEqual([]);
  });
}
