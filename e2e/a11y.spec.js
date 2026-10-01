const AxeBuilder = require("@axe-core/playwright").default;
const { expect, test } = require("@playwright/test");

// Known accessibility problems that are not fixed yet, found by the first run
// of this suite. Each entry is "<page name>:<axe rule id>" with the reason. A
// listed rule is allowed on that page only, and the test fails when it stops
// happening so the entry gets removed. Do not add to this list to make a
// failure go away: fix the page, or record the violation here on purpose.
const KNOWN_ISSUES = {
  // ListItemButton with component={RouterLink} renders <a> directly inside
  // <ul> in the game, docs and elements side navs (src/components/nav/*).
  // Fix: wrap each in <ListItem disablePadding>
  "game info:list": "side nav links are direct children of <ul>",
  "docs:list": "side nav links are direct children of <ul>",
  "config drawer:list": "side nav links are direct children of <ul>",
  // The stock market column/diag/par number inputs have no accessible name
  // (src/components/config)
  "config drawer:label": "stock.column, stock.diag, stock.par inputs",
  // Links in the config drawer's descriptions are only underlined by color
  "config drawer:link-in-text-block": "inline links in config descriptions",
  // A form control (FormControl with a Select) inside the side nav's
  // ListItemButton in GameNav
  "config drawer:nested-interactive": "controls inside a ListItemButton",
  // The scrollable game area is not keyboard focusable while the drawer is
  // open
  "config drawer:scrollable-region-focusable": "scrollable page area",
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
    // Let the drawer and page transitions finish
    await page.waitForTimeout(500);

    const results = await new AxeBuilder({ page }).analyze();
    const seen = results.violations
      .filter((v) => ["serious", "critical"].includes(v.impact))
      .filter((v) => {
        const known = `${name}:${v.id}` in KNOWN_ISSUES;
        return !known;
      });

    expect(
      seen.map((v) => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        nodes: v.nodes.slice(0, 3).map((n) => n.target.join(" ")),
      })),
    ).toEqual([]);

    // Known issues that no longer happen should be removed from the list
    const ids = results.violations.map((v) => v.id);
    const stale = Object.keys(KNOWN_ISSUES).filter(
      (key) => key.startsWith(`${name}:`) && !ids.includes(key.split(":")[1]),
    );
    expect(stale).toEqual([]);
  });
}
