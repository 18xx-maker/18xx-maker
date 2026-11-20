import { expect, test } from "@playwright/test";

// Online play with two players and a spectator, each in their own browser
// context, against the real play server (e2e/support/play-server.mjs, started
// by playwright.config.js when DATABASE_URL is set) and its fake Discord.

const SERVER = "http://127.0.0.1:4319";

test.skip(
  !process.env.DATABASE_URL,
  "needs DATABASE_URL: the play server runs against Postgres",
);

const setServer = async (page) => {
  await page.goto("/settings");
  await page.getByLabel("Play server").fill(SERVER);
};

// The sign in link on the page, the fake Discord's consent page, then back
const signIn = async (page, name) => {
  await page.getByRole("link", { name: "Sign in with Discord" }).click();
  await page.getByRole("link", { name: `Sign in as ${name}` }).click();
};

const board = (page) => page.getByTestId("play-board");
const hex = (page, coord) => board(page).locator(`[data-coord="${coord}"]`);
const tileOn = (page, coord) =>
  board(page).locator(`[data-tile-hex="${coord}"]`);
const banner = (page) => page.getByTestId("play-banner");
const undo = (page) => board(page).getByRole("button", { name: "Undo" });

const ownerMenu = async (page, item) => {
  await page.getByRole("button", { name: "Owner menu" }).click();
  await page.getByRole("menuitem", { name: item }).click();
};

// Chooses the first tile and places it on a hex
const placeTile = async (page, coord) => {
  await board(page).getByRole("tab", { name: "Tiles" }).click();
  await board(page).locator("[data-tile-option]").first().click();
  await hex(page, coord).click();
};

test("two players and a spectator play one game", async ({ browser }) => {
  test.setTimeout(120_000);
  const contexts = [];
  const open = async () => {
    const context = await browser.newContext();
    contexts.push(context);
    const page = await context.newPage();
    await setServer(page);
    return page;
  };

  try {
    // A: sign in, load 18Test and create a game from it
    const a = await open();
    await a.goto("/games/18Test/map");
    await expect(a.getByTestId("game-18Test-map")).toBeVisible();
    await a.goto("/play");
    await signIn(a, "Alice");
    await expect(a.getByText("Signed in as Alice")).toBeVisible();
    await a.getByRole("button", { name: "Create game" }).click();
    await expect(board(a)).toBeVisible();
    await expect(a).toHaveURL(/\/play\/[^/]+$/);

    // A new invite link is always shown for copying
    await ownerMenu(a, "New invite link");
    const invite = await a.getByLabel("Invite link").inputValue();
    expect(invite).toMatch(/\/play\/join\/[^/]+$/);

    // B: open the invite, sign in (back to the invite) and take a seat
    const b = await open();
    await b.goto(invite);
    await signIn(b, "Bob");
    await expect(b).toHaveURL(invite);
    await b.getByRole("button", { name: "Join game" }).click();
    await expect(board(b)).toBeVisible();
    await expect(b).toHaveURL(a.url());

    // Two hexes of the map, the same on both boards
    const coords = await board(a)
      .locator("[data-coord]")
      .evaluateAll((nodes) => nodes.map((n) => n.dataset.coord));
    expect(coords.length).toBeGreaterThan(1);
    const [first, second] = coords;

    // A places a tile, B sees it
    await placeTile(a, first);
    await expect(tileOn(a, first)).toHaveCount(1);
    await expect(tileOn(b, first)).toHaveCount(1);

    // B undoes it, A sees it gone
    await expect(undo(b)).toBeEnabled();
    await undo(b).click();
    await expect(tileOn(b, first)).toHaveCount(0);
    await expect(tileOn(a, first)).toHaveCount(0);

    // A locks the game: B's next move is refused and B's board is read only
    await ownerMenu(a, "Lock game");
    await expect(banner(a)).toContainText("This game is locked");
    await placeTile(b, first);
    await expect(banner(b)).toContainText("This game is locked");
    await expect(board(b).locator("[data-tile-option]").first()).toBeDisabled();
    await expect(undo(b)).toBeDisabled();
    await expect(tileOn(a, first)).toHaveCount(0);

    // A unlocks and plays on; B is back after a reload
    await ownerMenu(a, "Unlock game");
    await expect(banner(a)).toHaveCount(0);
    await placeTile(a, second);
    await expect(tileOn(a, second)).toHaveCount(1);
    await b.reload();
    await expect(tileOn(b, second)).toHaveCount(1);
    await expect(banner(b)).toHaveCount(0);
    await expect(undo(b)).toBeEnabled();

    // A makes a spectator link (shown for copying), C watches without signing in
    await ownerMenu(a, "Spectator link");
    const watch = await a.getByLabel("Spectator link").inputValue();
    expect(watch).toMatch(/\/play\/watch\/[^/]+$/);
    const c = await open();
    await c.goto(watch);
    await expect(board(c)).toBeVisible();
    await expect(banner(c)).toContainText("Watching");
    await expect(tileOn(c, second)).toHaveCount(1);
    await expect(undo(c)).toHaveCount(0);
    await expect(board(c).locator("[data-tile-option]").first()).toBeDisabled();
    await expect(c.getByRole("button", { name: "Owner menu" })).toHaveCount(0);

    // Moves still arrive at the spectator
    await placeTile(a, first);
    await expect(tileOn(c, first)).toHaveCount(1);
    await undo(a).click();
    await expect(tileOn(c, first)).toHaveCount(0);
    await expect(tileOn(b, first)).toHaveCount(0);
  } finally {
    await Promise.all(contexts.map((context) => context.close()));
  }
});
