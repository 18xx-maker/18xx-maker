import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Known accessibility problems that are not fixed yet, found by the first run
// of this suite. Keyed by page name, each entry is an axe rule plus the css
// selectors of the nodes that violate it (see normalize() for how generated
// class names are written). A violating node that is not listed fails the
// test, and so does a listed node that no longer violates, so the entry gets
// removed. Do not add to this list to make a failure go away: fix the page,
// or record the violation here on purpose.

const KNOWN_ISSUES = {};

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
    name: "edit panel",
    url: "/games/18Test/map?edit=true",
    ready: (page) => page.getByRole("button", { name: "Close the edit panel" }),
  },
  {
    name: "edit panel trains",
    url: "/games/18Test/map?edit=true&editSection=trains",
    ready: (page) => page.getByRole("button", { name: "Add train" }),
  },
  {
    name: "settings",
    url: "/settings",
    ready: (page) => page.getByTestId("settings"),
  },
  {
    name: "docs",
    url: "/docs",
    ready: (page) => page.locator("[data-testid^='docs-']"),
  },
  // Code blocks color their tokens per theme, including comments
  ...["light", "dark"].map((colorScheme) => ({
    name: `docs code blocks (${colorScheme})`,
    url: "/docs/output/svg",
    colorScheme,
    ready: (page) => page.locator(".shiki").first(),
  })),
];

for (const { name, url, ready, colorScheme } of pages) {
  test(`no serious or critical accessibility violations: ${name}`, async ({
    page,
  }) => {
    if (colorScheme) await page.emulateMedia({ colorScheme });
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
