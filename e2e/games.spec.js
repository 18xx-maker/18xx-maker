import { expect, test } from "@playwright/test";

test("the app nav reaches the games list and the docs", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("home")).toBeVisible();

  await page.getByRole("link", { name: "Load Games" }).click();
  await expect(page).toHaveURL(/\/games\/?$/);
  await expect(page.getByTestId("games")).toBeVisible();

  await page.getByRole("link", { name: "Using 18xx Maker" }).click();
  await expect(page).toHaveURL(/\/docs\/?$/);
  await expect(page.locator("[data-testid^='docs-']")).toBeVisible();

  await page.getByRole("link", { name: "Home" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByTestId("home")).toBeVisible();
});

// Game pages pick their section from the toolbar's select, whose options are
// prefixed with their keyboard shortcut ("4:Tiles")
const goToSection = async (page, label) => {
  await page.getByRole("combobox", { name: "Game Section" }).click();
  await page.getByRole("option", { name: new RegExp(`${label}$`) }).click();
};

test.describe("bundled games", () => {
  test("opens 18Test from the games list and walks through its pages", async ({
    page,
  }) => {
    await page.goto("/games/");
    await page
      .getByTestId("games")
      .getByRole("link", { name: "18Test", exact: true })
      .click();
    await expect(page).toHaveURL(/\/games\/18Test$/);
    await expect(page.getByTestId("game-18Test")).toBeVisible();

    await page
      .getByTestId("game-18Test")
      .getByRole("link", { name: "Edit Game" })
      .click();
    await expect(page).toHaveURL(/\/games\/18Test\/map$/);
    await expect(page.getByTestId("game-18Test-map")).toBeVisible();

    const sections = [
      ["Tiles", "tiles"],
      ["Tokens", "tokens"],
      ["Charters", "charters"],
      ["Cards", "cards"],
      ["Market", "market"],
      ["Par", "par"],
      ["Revenue", "revenue"],
      ["Background", "background"],
      ["Map", "map"],
    ];
    for (const [label, path] of sections) {
      await goToSection(page, label);
      await expect(page).toHaveURL(new RegExp(`/games/18Test/${path}$`));
      await expect(page.getByTestId(`game-18Test-${path}`)).toBeVisible();
    }

    // The toolbar's back link returns to the game info page
    await page.getByRole("link", { name: "Game Info" }).click();
    await expect(page).toHaveURL(/\/games\/18Test$/);
    await expect(page.getByTestId("game-18Test")).toBeVisible();
  });

  test("edits the game info in the edit panel", async ({ page }) => {
    await page.goto("/games/18Test/map");
    await expect(page.getByTestId("game-18Test-map")).toBeVisible();

    await page.keyboard.press("e");
    const panel = page.getByTestId("edit-panel");
    await expect(panel).toBeVisible();
    await expect(page).toHaveURL(/\?edit=true$/);

    const subtitle = panel.getByRole("textbox", {
      name: "Subtitle",
      exact: true,
    });
    await subtitle.fill("Edited in the panel");
    await subtitle.press("Enter");
    await expect(
      page.getByRole("link", { name: "Changes" }).first(),
    ).toBeVisible();

    await subtitle.press("Escape");
    await expect(panel).toBeHidden();
  });

  test("adds a train in the edit panel", async ({ page }) => {
    await page.goto("/games/18Test/map?edit=true");
    const panel = page.getByTestId("edit-panel");
    await expect(panel).toBeVisible();

    const tabs = panel.getByRole("tablist");
    await expect(tabs.getByRole("tab", { name: "Game" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await tabs.getByRole("tab", { name: "Trains" }).click();
    await expect(page).toHaveURL(/\?edit=true&editSection=trains$/);

    await expect(panel.getByRole("listitem")).toHaveCount(4);
    await panel.getByRole("button", { name: "Add train" }).click();
    await expect(panel.getByRole("listitem")).toHaveCount(5);
    await expect(
      panel.getByRole("button", { name: "Move train 5 up" }),
    ).toBeEnabled();
    await expect(
      panel.getByRole("button", { name: "Move train 5 down" }),
    ).toBeDisabled();
    await expect(
      page.getByRole("link", { name: "Changes" }).first(),
    ).toBeVisible();

    await panel.getByRole("button", { name: "Remove train 5" }).click();
    await expect(panel.getByRole("listitem")).toHaveCount(4);
  });

  test("picks a group of hexes on the map and edits it", async ({ page }) => {
    await page.goto("/games/18Test/map?edit=true");
    const panel = page.getByTestId("edit-panel");
    await expect(panel).toBeVisible();
    const editor = panel.getByRole("textbox", { name: "Hex group JSON" });

    // A real click: the svg captures the pointer, so the click is a tap
    await page.locator('[data-coord="C11"]').click();
    await expect(page).toHaveURL(/\?edit=true&editSection=hex&hex=C11$/);
    await expect(panel.getByRole("tab", { name: "Hex" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(editor).toContainText('"C11"');
    await expect(editor).not.toContainText('"B12"');

    // Cmd on macOS, Ctrl elsewhere moves a hex into the group
    const platform = await page.evaluate(() => navigator.platform);
    const modifier = /Mac/.test(platform) ? "Meta" : "Control";
    await page.locator('[data-coord="B12"]').click({ modifiers: [modifier] });
    await expect(editor).toContainText('"B12"');
    await expect(page).toHaveURL(/hex=C11$/);

    // Escape lets go of the group, the next one closes the panel
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(/\?edit=true&editSection=hex$/);
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
  });

  test("adds a private in the edit panel", async ({ page }) => {
    await page.goto("/games/18Test/map?edit=true");
    const panel = page.getByTestId("edit-panel");
    await panel
      .getByRole("tablist")
      .getByRole("tab", { name: "Privates" })
      .click();
    await expect(page).toHaveURL(/\?edit=true&editSection=privates$/);

    const count = 6;
    await expect(panel.getByRole("listitem")).toHaveCount(count);
    await panel.getByRole("button", { name: "Add private" }).click();
    await expect(panel.getByRole("listitem")).toHaveCount(count + 1);
    const name = String(count + 1);
    await expect(
      panel.getByRole("button", { name: `Move private ${name} down` }),
    ).toBeDisabled();

    const revenue = panel
      .getByRole("listitem")
      .nth(count)
      .getByRole("textbox", { name: "Revenue" });
    await revenue.fill("10/20");
    await revenue.press("Enter");
    await expect(revenue).toHaveValue("10/20");

    await panel.getByRole("button", { name: `Remove private ${name}` }).click();
    await expect(panel.getByRole("listitem")).toHaveCount(count);
  });

  test("edits the companies in the edit panel", async ({ page }) => {
    await page.goto("/games/18Test/map?edit=true");
    const panel = page.getByTestId("edit-panel");
    await panel
      .getByRole("tablist")
      .getByRole("tab", { name: "Companies" })
      .click();
    await expect(page).toHaveURL(/\?edit=true&editSection=companies$/);

    // The cards start closed
    const cards = panel.getByRole("listitem");
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    const first = cards.first().locator("[data-title]");
    await expect(first).toHaveAttribute("aria-expanded", "false");
    await expect(first).toHaveAccessibleName("Black Railroad BLRR");

    // A new company is open, and has an abbreviation of its own
    await panel.getByRole("button", { name: "Add company" }).click();
    await expect(cards).toHaveCount(count + 1);
    const added = cards.nth(count);
    await expect(added.locator("[data-title]")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await expect(added.getByRole("textbox", { name: "Abbrev" })).toHaveValue(
      "NEW",
    );

    // A problem in a field of a closed card is marked on the card
    await first.click();
    await cards.first().getByRole("button", { name: "More fields" }).click();
    const trains = cards.first().getByRole("textbox", { name: "Trains" });
    await trains.fill("3");
    await trains.blur();
    await first.click();
    await expect(first).toHaveAttribute("aria-expanded", "false");
    await expect(
      cards.first().getByRole("img", {
        name: "The company Black Railroad has a problem",
      }),
    ).toBeVisible();

    await panel
      .getByRole("button", { name: `Remove company ${count + 1}` })
      .click();
    await expect(cards).toHaveCount(count);
  });

  test("edits players in the edit panel", async ({ page }) => {
    await page.goto("/games/18Test/map?edit=true");
    const panel = page.getByTestId("edit-panel");
    await panel
      .getByRole("tablist")
      .getByRole("tab", { name: "Players" })
      .click();
    await expect(page).toHaveURL(/\?edit=true&editSection=players$/);

    const count = 6;
    await expect(panel.getByRole("listitem")).toHaveCount(count);
    await panel.getByRole("button", { name: "Add player" }).click();
    await expect(panel.getByRole("listitem")).toHaveCount(count + 1);
    await expect(
      panel.getByRole("button", { name: "Remove player 7 players" }),
    ).toBeVisible();

    await panel
      .getByRole("button", { name: "Remove player 7 players" })
      .click();
    await expect(panel.getByRole("listitem")).toHaveCount(count);
  });

  test("adds a phase in the edit panel", async ({ page }) => {
    await page.goto("/games/18Test/map?edit=true");
    const panel = page.getByTestId("edit-panel");
    await panel
      .getByRole("tablist")
      .getByRole("tab", { name: "Phases" })
      .click();
    await expect(page).toHaveURL(/\?edit=true&editSection=phases$/);

    const count = 6;
    await expect(panel.getByRole("listitem")).toHaveCount(count);
    await panel.getByRole("button", { name: "Add phase" }).click();
    await expect(panel.getByRole("listitem")).toHaveCount(count + 1);
    const name = String(count + 1);
    await expect(
      panel.getByRole("button", { name: `Move phase ${name} down` }),
    ).toBeDisabled();

    const train = panel
      .getByRole("listitem")
      .nth(count)
      .getByRole("textbox", { name: "Train" });
    await train.fill("4H\n2M");
    await train.blur();
    await expect(train).toHaveValue("4H\n2M");

    await panel.getByRole("button", { name: `Remove phase ${name}` }).click();
    await expect(panel.getByRole("listitem")).toHaveCount(count);
  });

  test("edits a price in the market grid and the market page follows", async ({
    page,
  }) => {
    await page.goto("/games/18Test/market?edit=true&editSection=market");
    const panel = page.getByTestId("edit-panel");
    await panel.getByRole("gridcell", { name: /^Row 1, column 2:/ }).click();
    const value = panel.getByRole("textbox", { name: "Value", exact: true });
    await value.fill("68");
    await value.press("Enter");
    await expect(
      panel.getByRole("gridcell", { name: /^Row 1, column 2: 68/ }),
    ).toBeVisible();
    await expect(
      page.locator("[data-testid^='game-18Test-market']"),
    ).toContainText("68");
  });

  test("opens a real game and its pages", async ({ page }) => {
    await page.goto("/games/");
    await page
      .getByTestId("games")
      .getByRole("link", { name: "Shikoku 1889" })
      .click();
    await page
      .getByTestId("game-1889")
      .getByRole("link", { name: "Edit Game" })
      .click();
    await expect(page).toHaveURL(/\/games\/1889\/map$/);
    await expect(page.getByTestId("game-1889-map")).toBeVisible();

    await goToSection(page, "Cards");
    await expect(page.getByTestId("game-1889-cards")).toBeVisible();
    await goToSection(page, "Market");
    await expect(page.getByTestId("game-1889-market")).toBeVisible();
    await goToSection(page, "Tiles");
    await expect(page).toHaveURL(/\/games\/1889\/tiles$/);
    await expect(page.getByTestId("game-1889-tiles")).toBeVisible();
  });

  test("a deep link loads on a fresh visit (spa fallback)", async ({
    page,
  }) => {
    await page.goto("/games/1889/revenue");
    await expect(page.getByTestId("game-1889-revenue")).toBeVisible();
    // Current section is shown in the toolbar
    await expect(
      page.getByRole("combobox", { name: "Game Section" }),
    ).toHaveText("8:Revenue");
  });

  test("shows the game info page", async ({ page }) => {
    await page.goto("/games/1889");
    await expect(page.getByTestId("game-1889")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Shikoku 1889" }),
    ).toBeVisible();
  });
});

// The "#" anchor of a heading hangs left of the text, as wide as the heading scales it, and must stay
// inside the scrolling content area instead of being clipped by it
for (const width of [1280, 375]) {
  test(`heading anchors are not clipped by the content area at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/docs/games/exports");
    const heading = page.locator("[data-testid^='docs-'] h2").first();
    await heading.hover();
    const anchor = heading.locator("a").first();
    await expect(anchor).toBeVisible();
    const box = await anchor.boundingBox();
    const inset = await page.locator("main").boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(inset.x);
  });
}
