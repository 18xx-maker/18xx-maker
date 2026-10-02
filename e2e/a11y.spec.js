import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Known accessibility problems that are not fixed yet, found by the first run
// of this suite. Keyed by page name, each entry is an axe rule plus stable keys
// for the nodes that violate it (see keyOf() for how a node is named: the
// closest data-testid, then the tag (or role) and its index inside it, or "#id" for
// elements with an id). A violating node that is not listed fails the test,
// and so does a listed node that no longer violates, so the entry gets
// removed. Do not add to this list to make a failure go away: fix the page,
// or record the violation here on purpose.
//
// Keys never use component library class names (.Mui*, css-<hash>, jss<n>) so
// the list survives a change of UI library.

// Same problems on every game page (game info, map and the config drawer)
const GAME_NAV_NESTED = {
  // A form control (FormControl with a Select) inside a ListItemButton in
  // GameNav (src/components/nav)
  rule: "nested-interactive",
  targets: ["side-nav [role=button]:2"],
  reason: "controls inside a ListItemButton",
};
const GAME_VIEWPORT_SCROLL = {
  // The scrollable game area (Viewport) is not keyboard focusable
  rule: "scrollable-region-focusable",
  targets: ["viewport"],
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

const SIDE_NAV_LISTS = (n) =>
  SIDE_NAV_LIST(Array.from({ length: n }, (_, i) => `side-nav ul:${i}`));

const KNOWN_ISSUES = {
  "game info": [
    SIDE_NAV_LISTS(2),
    // The page's own <List> in src/components/pages/games/Info.jsx
    SIDE_NAV_LIST(["game-1889 ul:0"]),
  ],
  "game map": [SIDE_NAV_LISTS(3), GAME_NAV_NESTED, GAME_VIEWPORT_SCROLL],
  docs: [SIDE_NAV_LISTS(4)],
  "config drawer": [
    SIDE_NAV_LISTS(3),
    GAME_NAV_NESTED,
    GAME_VIEWPORT_SCROLL,
    {
      // These number inputs have no accessible name (src/components/config)
      rule: "label",
      targets: [
        "#stock.column",
        "#stock.diag",
        "#stock.par",
        "#charters.border",
        "#cards.border",
      ],
      reason: "config inputs without a label",
    },
    {
      // Links in the config drawer's descriptions are only underlined by
      // color
      rule: "link-in-text-block",
      targets: ["config-drawer a:0", "config-drawer a:1"],
      reason: "inline links in config descriptions",
    },
  ],
};

// Generated class names change between builds and libraries, so nodes are
// named by their closest data-testid ancestor (or self), plus the tag (or role)
// and its index among the same tags inside that ancestor. Elements with an id
// are named "#id".
const keyOf = (selector) => {
  const el = document.querySelector(selector);
  if (!el) return `unresolved ${selector}`;
  if (el.id) return `#${el.id}`;
  const host = el.closest("[data-testid]");
  if (!host) return `no-testid ${selector}`;
  const name = host.dataset.testid;
  if (host === el) return name;
  const role = el.getAttribute("role");
  const tag = role ? `[role=${role}]` : el.localName;
  const index = [...host.querySelectorAll(tag)].indexOf(el);
  return `${name} ${tag}:${index}`;
};

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
        const selector = node.target.join(" ");
        found.push({
          rule: v.id,
          target: await page.evaluate(
            `(${keyOf})(${JSON.stringify(selector)})`,
          ),
        });
      }
    }
    if (process.env.A11Y_DUMP) console.log(name, JSON.stringify(found));

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
