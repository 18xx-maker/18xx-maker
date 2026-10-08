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
    ready: (page) => page.getByTestId("game-map-preview-svg"),
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
    // With the card of a private open and its more fields (about 60 fields)
    name: "edit panel privates",
    url: "/games/18Test/map?edit=true&editSection=privates",
    ready: (page) => page.getByRole("button", { name: "Add private" }),
    more: true,
  },
  {
    // The cards start closed
    name: "edit panel companies",
    url: "/games/18Test/map?edit=true&editSection=companies",
    ready: (page) => page.getByRole("button", { name: "Add company" }),
  },
  {
    // With the first card open and its more fields
    name: "edit panel companies open",
    url: "/games/18Test/map?edit=true&editSection=companies",
    ready: (page) => page.getByRole("button", { name: "Add company" }),
    open: true,
    more: true,
  },
  // The token editor of the first company, with a decoration and the advanced
  // fields open, in both themes
  ...["light", "dark"].map((colorScheme) => ({
    name: `token editor (${colorScheme})`,
    url: "/games/18Test/map?edit=true&editSection=companies",
    colorScheme,
    ready: (page) => page.getByRole("button", { name: "Add company" }),
    before: async (page) => {
      const card = page.getByTestId("edit-panel").getByRole("listitem").first();
      await card.locator("[data-title]").click();
      await card.getByRole("button", { name: "More fields" }).click();
      await card.getByRole("button", { name: "Edit token" }).click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await dialog.getByRole("combobox", { name: "Add decoration" }).click();
      await page.getByRole("option", { name: "Halves" }).click();
      await dialog.getByRole("button", { name: "Advanced" }).click();
    },
  })),
  {
    // With the card of a phase open and its more fields
    name: "edit panel phases",
    url: "/games/18Test/map?edit=true&editSection=phases",
    ready: (page) => page.getByRole("button", { name: "Add phase" }),
    more: true,
  },
  {
    // The scalars and the list, a card with a text cert limit and the undo note
    name: "edit panel players",
    url: "/games/18Test/map?edit=true&editSection=players",
    ready: (page) => page.getByRole("button", { name: "Add player" }),
    before: async (page) => {
      const limit = page
        .getByTestId("edit-panel")
        .getByRole("listitem")
        .first()
        .getByRole("textbox", { name: /Cert Limit/ });
      await limit.fill("3/4");
      await limit.blur();
      await page
        .getByRole("button", { name: "Remove player 2 players" })
        .click();
    },
  },
  ...["light", "dark"].map((colorScheme) => ({
    // The tokens of the game, the token types and the share types
    name: `edit panel tokens (${colorScheme})`,
    url: "/games/18Test/map?edit=true&editSection=tokens",
    colorScheme,
    ready: (page) => page.getByRole("button", { name: "Add share" }).first(),
  })),
  ...["light", "dark"].map((colorScheme) => ({
    // The named colors of the game, each with a swatch
    name: `edit panel colors (${colorScheme})`,
    url: "/games/18Test/map?edit=true&editSection=colors",
    colorScheme,
    ready: (page) => page.getByRole("button", { name: "Add color" }),
  })),
  ...["light", "dark"].map((colorScheme) => ({
    // The revenue range and the export defaults
    name: `edit panel output (${colorScheme})`,
    url: "/games/18Test/map?edit=true&editSection=output",
    colorScheme,
    ready: (page) => page.getByRole("spinbutton", { name: "Max" }),
  })),
  // The Tiles tab of the tiles page: the list, and the editor of a tile of the
  // game and of a tile drawn from the library
  ...["light", "dark"].map((colorScheme) => ({
    name: `edit panel tiles (${colorScheme})`,
    url: "/games/18Test/tiles?edit=true&editSection=tiles&tile=B1",
    colorScheme,
    ready: (page) => page.getByTestId("hex-editor"),
  })),
  ...["light", "dark"].map((colorScheme) => ({
    name: `edit panel tiles from the library (${colorScheme})`,
    url: "/games/18Test/tiles?edit=true&editSection=tiles&tile=2",
    colorScheme,
    ready: (page) => page.getByTestId("hex-editor"),
  })),
  // The Map tab of the map page: the variation besides its hexes
  ...["light", "dark"].map((colorScheme) => ({
    name: `edit panel map (${colorScheme})`,
    url: "/games/18Test/map?edit=true&editSection=map",
    colorScheme,
    ready: (page) => page.getByRole("group", { name: "Trim" }),
  })),
  // The Hex tab of the map page: the form of the group picked on the map (a
  // drawing of the hex with a button on each edge, its elements and the
  // fields of one), the same group as JSON, and the hint before one is picked
  ...["light", "dark"].map((colorScheme) => ({
    name: `edit panel hex form (${colorScheme})`,
    url: "/games/18Test/map?edit=true&editSection=hex&hex=B12",
    colorScheme,
    ready: (page) => page.getByTestId("hex-editor"),
    before: async (page) => {
      // A track drawn from the keyboard, then its fields
      await page.getByRole("button", { name: /^Side 1: start/ }).focus();
      await page.keyboard.press("Enter");
      await page.getByRole("button", { name: /^Side 4: end/ }).focus();
      await page.keyboard.press("Space");
      await expect(page.getByTestId("hex-inspector")).toBeVisible();
      await page.getByRole("button", { name: "More fields" }).click();
    },
  })),
  ...["light", "dark"].map((colorScheme) => ({
    name: `edit panel hex json (${colorScheme})`,
    url: "/games/18Test/map?edit=true&editSection=hex&hex=C11",
    colorScheme,
    ready: (page) => page.getByTestId("hex-editor"),
    before: async (page) => {
      await page.locator("label", { hasText: "JSON" }).click();
      await expect(
        page.getByRole("textbox", { name: "Hex group JSON" }),
      ).toBeVisible();
    },
  })),
  {
    name: "edit panel hex hint",
    url: "/games/18Test/map?edit=true&editSection=hex",
    ready: (page) => page.getByText(/Click a hex on the map to edit its group/),
  },
  // The JSON editor, in both themes
  ...["light", "dark"].map((colorScheme) => ({
    name: `edit panel json (${colorScheme})`,
    url: "/games/18Test/map?edit=true&editSection=json",
    colorScheme,
    ready: (page) => page.getByRole("textbox", { name: "Game JSON" }),
  })),
  {
    name: "edit panel market",
    url: "/games/18Test/map?edit=true&editSection=market",
    ready: (page) => page.getByRole("grid", { name: "Stock market cells" }),
  },
  ...["light", "dark"].map((colorScheme) => ({
    name: `edit panel market cell (${colorScheme})`,
    url: "/games/18Test/map?edit=true&editSection=market",
    colorScheme,
    ready: (page) => page.getByRole("grid", { name: "Stock market cells" }),
    select: /^Row 1, column 7:/,
  })),
  // The dialog of Save as, in the private file system (no file pickers)
  ...["light", "dark"].map((colorScheme) => ({
    name: `save as dialog (${colorScheme})`,
    url: "/games/18Test",
    colorScheme,
    init: () => {
      delete window.showOpenFilePicker;
      delete window.showSaveFilePicker;
    },
    ready: (page) => page.getByRole("button", { name: "Save as..." }),
    before: async (page) => {
      await page.getByRole("button", { name: "Save as..." }).click();
      await expect(page.getByRole("dialog", { name: "Save as" })).toBeVisible();
    },
  })),
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

for (const {
  name,
  url,
  ready,
  colorScheme,
  select,
  open,
  more,
  before,
  init,
} of pages) {
  test(`no serious or critical accessibility violations: ${name}`, async ({
    page,
  }) => {
    if (colorScheme) await page.emulateMedia({ colorScheme });
    if (init) await page.addInitScript(init);
    await page.goto(url);
    await expect(ready(page)).toBeVisible();
    if (before) await before(page);
    if (select) {
      await page.getByRole("gridcell", { name: select }).click();
      await expect(page.getByTestId("cell-inspector")).toBeVisible();
    }
    if (open) {
      await page
        .getByTestId("edit-panel")
        .getByRole("listitem")
        .first()
        .locator("[data-title]")
        .click();
    }
    if (more) {
      await page
        .getByTestId("edit-panel")
        .getByRole("button", { name: "More fields" })
        .first()
        .click();
    }
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
