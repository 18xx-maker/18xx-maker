import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { page } from "vitest/browser";

import { filter, values } from "ramda";

import Markdown from "@/components/Markdown";

import { games, tiles } from "@/data";
import { mergeKnownTiles } from "@/util/tiles";

import { renderApp } from "@tests/helpers.jsx";

// The map svg has no role to query by
const editorSvg = () =>
  // eslint-disable-next-line testing-library/no-node-access
  document.querySelector("#editor svg.printElement");

const viewBox = () =>
  editorSvg().getAttribute("viewBox").split(" ").map(Number);

// The desktop sidebar, the mobile one is a sheet
const desktopSidebar = () =>
  // eslint-disable-next-line testing-library/no-node-access
  document.querySelector("[data-collapsible]");

beforeEach(async () => {
  await page.viewport(1280, 800);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("print button", () => {
  it("prints the page", async () => {
    const print = vi.spyOn(window, "print").mockImplementation(() => {});
    const { user } = renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");

    await user.click(screen.getByRole("button", { name: "print" }));

    expect(print).toHaveBeenCalledTimes(1);
  });

  it("is not shown with ?print=true", async () => {
    renderApp("/games/18Test/map?print=true");
    await screen.findByTestId("game-18Test-map");

    expect(
      screen.queryByRole("button", { name: "print" }),
    ).not.toBeInTheDocument();
  });
});

describe("svg editor", () => {
  const open = async () => {
    const { user } = renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");
    const [x, y, width, height] = viewBox();
    expect([x, y]).toEqual([0, 0]);
    return { user, width, height };
  };

  it("pans the view while dragging with the primary button", async () => {
    const { width, height } = await open();
    const svg = editorSvg();

    fireEvent.pointerDown(svg, { clientX: 100, clientY: 100, buttons: 1 });
    // Moving a tenth of the window moves the view a tenth of its size
    fireEvent.pointerMove(svg, { clientX: 228, clientY: 180, buttons: 1 });

    const [x, y, w, h] = viewBox();
    expect(x).toBeCloseTo(-0.1 * width);
    expect(y).toBeCloseTo(-0.1 * height);
    expect([w, h]).toEqual([width, height]);
  });

  it("does not pan when no button is held", async () => {
    await open();
    const svg = editorSvg();

    fireEvent.pointerDown(svg, { clientX: 100, clientY: 100 });
    fireEvent.pointerMove(svg, { clientX: 300, clientY: 300, buttons: 0 });

    expect(viewBox().slice(0, 2)).toEqual([0, 0]);
  });

  it("zooms around the center with the wheel", async () => {
    const { width, height } = await open();

    fireEvent.wheel(editorSvg(), { deltaY: 80 });

    const [x, y, w, h] = viewBox();
    expect(w).toBeCloseTo(1.1 * width);
    expect(h).toBeCloseTo(1.1 * height);
    expect(x).toBeCloseTo(-0.05 * width);
    expect(y).toBeCloseTo(-0.05 * height);
  });

  it("resets the view with v, but not with a modifier", async () => {
    const { user, width, height } = await open();
    fireEvent.wheel(editorSvg(), { deltaY: -400 });
    const zoomed = viewBox();
    expect(zoomed[2]).toBeCloseTo(0.5 * width);

    await user.keyboard("{Control>}v{/Control}");
    expect(viewBox()).toEqual(zoomed);

    await user.keyboard("v");
    expect(viewBox()).toEqual([0, 0, width, height]);
  });

  it("follows the window size", async () => {
    await open();
    expect(editorSvg()).toHaveAttribute("width", "1280px");

    await page.viewport(1000, 700);

    await waitFor(() => expect(editorSvg()).toHaveAttribute("width", "1000px"));
    expect(editorSvg()).toHaveAttribute("height", "700px");
  });

  it("renders at the physical size while the browser prints", async () => {
    await open();

    act(() => {
      window.dispatchEvent(new Event("beforeprint"));
    });
    // eslint-disable-next-line testing-library/no-node-access
    const printing = document.querySelector("svg.printElement");
    expect(printing).toHaveAttribute("width", expect.stringMatching(/in$/));
    expect(editorSvg()).toBeNull();

    act(() => {
      window.dispatchEvent(new Event("afterprint"));
    });
    expect(editorSvg()).toHaveAttribute("width", "1280px");
  });
});

describe("alert", () => {
  it("shows progress without a close icon until done", async () => {
    const { store } = renderApp("/", {
      alert: { open: true, title: "Exporting", message: "map", progress: 50 },
    });

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-node-access
    expect(document.querySelector(".lucide-x")).toBeNull();
    // eslint-disable-next-line testing-library/no-node-access
    expect(document.querySelector(".border-info")).not.toBeNull();

    act(() =>
      store.dispatch({
        type: "SET_ALERT",
        alert: { title: "Exporting", message: "map", progress: 100 },
      }),
    );
    // eslint-disable-next-line testing-library/no-node-access
    expect(document.querySelector(".lucide-x")).not.toBeNull();
    // eslint-disable-next-line testing-library/no-node-access
    expect(document.querySelector(".border-success")).not.toBeNull();
  });

  it("closes when clicked", async () => {
    const { user, store } = renderApp("/", {
      alert: { open: true, title: "Hello", message: "there", type: "warning" },
    });

    await user.click(screen.getByText("there"));

    expect(store.getState().alert.open).toBe(false);
    expect(screen.queryByText("there")).not.toBeInTheDocument();
  });

  it("closes itself after five seconds", () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const { store } = renderApp("/", {
      alert: { open: true, title: "Hello", message: "there", type: "error" },
    });
    expect(screen.getByText("there")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(4999));
    expect(store.getState().alert.open).toBe(true);

    act(() => vi.advanceTimersByTime(1));
    expect(store.getState().alert.open).toBe(false);
  });
});

describe("desktop sidebar", () => {
  it("collapses and expands with ctrl+b, remembering it in the settings", async () => {
    const { user, store } = renderApp("/");
    expect(desktopSidebar()).toHaveAttribute("data-state", "expanded");

    await user.keyboard("{Control>}b{/Control}");
    expect(desktopSidebar()).toHaveAttribute("data-state", "collapsed");
    expect(store.getState().settings.sidebarOpen).toBe(false);
    expect(document.cookie).not.toContain("sidebar");

    await user.keyboard("{Meta>}b{/Meta}");
    expect(desktopSidebar()).toHaveAttribute("data-state", "expanded");
    expect(store.getState().settings.sidebarOpen).toBe(true);
  });

  it("starts collapsed when the settings say so", () => {
    renderApp("/", { settings: { sidebarOpen: false } });
    expect(desktopSidebar()).toHaveAttribute("data-state", "collapsed");
  });

  it("becomes a sheet when the window narrows", async () => {
    const { user } = renderApp("/");
    expect(desktopSidebar()).not.toBeNull();

    await page.viewport(414, 896);

    await waitFor(() => expect(desktopSidebar()).toBeNull());
    await user.click(screen.getByRole("button", { name: "Toggle Sidebar" }));
    expect(
      await screen.findByRole("dialog", { name: "Sidebar" }),
    ).toBeInTheDocument();
  });
});

describe("unit inputs", () => {
  const open = async () => {
    const { user, store } = renderApp(
      "/games/18Test/map?config=true&section=layout",
    );
    const input = await screen.findByRole("textbox", { name: "Margin Size" });
    // eslint-disable-next-line testing-library/no-node-access
    const units = within(input.parentElement).getByRole("combobox");
    return { user, store, input, units };
  };

  it("shows and accepts values in millimeters", async () => {
    const { user, store, input, units } = await open();
    expect(input).toHaveValue("0.25");

    await user.click(units);
    await user.click(await screen.findByRole("option", { name: "mm" }));

    expect(units).toHaveTextContent("mm");
    expect(Number(input.value)).toBeCloseTo(6.35);

    await user.clear(input);
    await user.type(input, "25.4{Enter}");

    // 25.4mm is an inch, 100 units
    await waitFor(
      () => expect(store.getState().config.margin).toBeCloseTo(100),
      { timeout: 3000 },
    );
  });

  it("marks a value that is not a number and clears it once fixed", async () => {
    const { user, store, input } = await open();

    await user.tripleClick(input);
    await user.keyboard("x");

    expect(input).toHaveValue("x");
    expect(input).toHaveClass("border-error");
    expect(store.getState().config.margin).toBeUndefined();

    await user.tripleClick(input);
    await user.keyboard("2{Enter}");

    expect(input).not.toHaveClass("border-error");
    await waitFor(() => expect(store.getState().config.margin).toBe(200));
  });
});

const knownGames = () =>
  Object.values(games).map((game) => ({
    slug: game.meta.slug,
    tiles: game.tiles || {},
  }));

describe("tile filters", () => {
  // Each rendered tile is in its own checkered box
  const shownTiles = () =>
    // eslint-disable-next-line testing-library/no-node-access
    screen.getByTestId("tiles").querySelectorAll(".checkered").length;

  it("filters by id prefix as it is typed", async () => {
    const { user, router } = renderApp("/elements/tiles");
    await screen.findByTestId("tiles");

    await user.type(screen.getByRole("textbox", { name: "Tile ID" }), "57");

    expect(router.state.location.search).toContain("id=57");
    const expected = filter((t) => t.id.startsWith("57"), values(tiles));
    expect(expected.length).toBeGreaterThan(0);
    await waitFor(() => expect(shownTiles()).toBe(expected.length));
    expect(screen.getByText("Page 1 of 1")).toBeInTheDocument();
  });

  it("filters by color", async () => {
    const { user, router } = renderApp("/elements/tiles");
    await screen.findByTestId("tiles");

    await user.click(screen.getByRole("combobox", { name: "Color" }));
    await user.click(await screen.findByRole("option", { name: "gray" }));

    expect(router.state.location.search).toContain("color=gray");
    const gray = filter(
      (t) => t.tile.color === "gray",
      mergeKnownTiles(tiles, knownGames()),
    ).length;
    expect(
      await screen.findByText(`Page 1 of ${Math.ceil(gray / 50)}`),
    ).toBeInTheDocument();
  });

  it.each([
    ["city", (t) => (t.cities || []).length > 0],
    ["town", (t) => (t.towns || []).length + (t.centerTowns || []).length > 0],
  ])("shows only tiles with a %s", async (includes, has) => {
    renderApp(`/elements/tiles?includes=${includes}&id=6`);
    await screen.findByTestId("tiles");

    const expected = filter(
      (t) => t.id.startsWith("6") && has(t),
      values(tiles),
    ).length;
    expect(expected).toBeGreaterThan(0);
    expect(shownTiles()).toBe(Math.min(expected, 50));
  });

  it("shows only plain track with includes none", async () => {
    renderApp("/elements/tiles?includes=none&id=8");
    await screen.findByTestId("tiles");

    const plain = filter(
      (t) =>
        t.id.startsWith("8") &&
        !(t.cities || []).length &&
        !(t.towns || []).length &&
        !(t.centerTowns || []).length,
      values(tiles),
    ).length;
    expect(plain).toBeGreaterThan(0);
    expect(shownTiles()).toBe(Math.min(plain, 50));
  });

  it("narrows the revenue range with the slider", async () => {
    const { user, router } = renderApp("/elements/tiles");
    await screen.findByTestId("tiles");
    const [low] = screen.getAllByRole("slider");
    const pages = screen.getByText(/^Page 1 of \d+$/);
    const before = pages.textContent;

    low.focus();
    await user.keyboard("{ArrowRight}");

    await waitFor(() =>
      expect(router.state.location.search).toMatch(/revenue=10_\d+/),
    );
    expect(screen.getByText(/^Page 1 of \d+$/)).not.toHaveTextContent(before);
  });

  it("pages through the tiles", async () => {
    const { user, router } = renderApp("/elements/tiles");
    await screen.findByTestId("tiles");
    const total = Number(
      screen
        .getByText(/^Page 1 of \d+$/)
        .textContent.split(" ")
        .pop(),
    );
    expect(total).toBeGreaterThan(1);

    // The controls are anchors without an href, so they have no link role
    await user.click(screen.getByLabelText("Go to next page"));
    expect(router.state.location.search).toContain("page=2");
    expect(screen.getByText(`Page 2 of ${total}`)).toBeInTheDocument();

    await user.click(screen.getByLabelText("Go to previous page"));
    expect(screen.getByText(`Page 1 of ${total}`)).toBeInTheDocument();
  });
});

describe("tiles of all games", () => {
  const card = () =>
    // eslint-disable-next-line testing-library/no-node-access
    screen.getByTestId("tiles").querySelectorAll(".checkered");

  it("shows tiles only a game defines and credits the game", async () => {
    const { user } = renderApp("/elements/tiles?id=T1");
    await screen.findByTestId("tiles");

    await waitFor(() => expect(card().length).toBe(1));
    await user.hover(card()[0]);
    const tip = await screen.findByRole("tooltip");
    expect(tip).toHaveTextContent("Used in 1 game(s)");
    expect(tip).toHaveTextContent("18Test");
  });

  it("has the color of a game tile as an option", async () => {
    const { user } = renderApp("/elements/tiles");
    await screen.findByTestId("tiles");

    await user.click(screen.getByRole("combobox", { name: "Color" }));
    expect(
      await screen.findByRole("option", { name: "offboard" }),
    ).toBeInTheDocument();
  });

  it("narrows to the tiles of one game and falls back for an unknown one", async () => {
    const { user, router } = renderApp("/elements/tiles?game=18Test");
    await screen.findByTestId("tiles");
    await waitFor(() => expect(card().length).toBeLessThan(50));
    // 18Test uses 1, 26 (as 26|T2), 57 (the alias target of 2), 63 and its own T1, B1 and B2
    expect(Array.from(card(), (c) => c.dataset.testid)).toEqual([
      "tile-1",
      "tile-26",
      "tile-57",
      "tile-63",
      "tile-T1",
      "tile-B1",
      "tile-B2",
    ]);
    expect(screen.getByRole("combobox", { name: "Game" })).toHaveTextContent(
      "18Test",
    );

    await user.click(screen.getByRole("combobox", { name: "Game" }));
    await user.click(await screen.findByRole("option", { name: "All games" }));
    expect(router.state.location.search).not.toContain("game");
    await waitFor(() => expect(card().length).toBe(50));
  });

  it("keeps an unknown game in the url and shows all tiles", async () => {
    const { router } = renderApp("/elements/tiles?game=nothing");
    await screen.findByTestId("tiles");

    await waitFor(() => expect(card().length).toBe(50));
    expect(router.state.location.search).toBe("?game=nothing");
  });

  it("resets the revenue and color when the game changes", async () => {
    const { user, router } = renderApp(
      "/elements/tiles?revenue=10_30&color=gray&page=2",
    );
    await screen.findByTestId("tiles");

    await user.click(screen.getByRole("combobox", { name: "Game" }));
    await user.click(await screen.findByRole("option", { name: "18Test" }));

    await waitFor(() =>
      expect(router.state.location.search).toBe("?game=18Test"),
    );
  });

  it("keeps an explicit revenue", async () => {
    const { router } = renderApp("/elements/tiles?revenue=10_30");
    await screen.findByTestId("tiles");
    await waitFor(() => expect(card().length).toBeGreaterThan(0));
    expect(router.state.location.search).toBe("?revenue=10_30");
  });
});

describe("markdown", () => {
  const renderMarkdown = (source) =>
    render(
      <MemoryRouter>
        <Markdown>{source}</Markdown>
      </MemoryRouter>,
    );

  it("routes local links in the app and opens others in a new tab", () => {
    renderMarkdown(
      "[local](/games) [query](?page=2) [site](https://example.com) [relative](//example.com)",
    );

    for (const name of ["local", "query"]) {
      expect(screen.getByRole("link", { name })).not.toHaveAttribute("target");
    }
    expect(screen.getByRole("link", { name: "local" })).toHaveAttribute(
      "href",
      "/games",
    );
    for (const name of ["site", "relative"]) {
      expect(screen.getByRole("link", { name })).toHaveAttribute(
        "target",
        "_blank",
      );
    }
  });

  it("highlights fenced code and styles inline code", async () => {
    renderMarkdown('Use `pnpm`\n\n```json\n{ "a": 1 }\n```\n');

    expect(screen.getByText("pnpm")).toHaveClass("bg-accent");
    // The highlighter is loaded on demand and splits the code into tokens
    expect(
      await screen.findByText('"a"', {}, { timeout: 10_000 }),
    ).not.toHaveClass("bg-accent");
    // eslint-disable-next-line testing-library/no-node-access
    const block = document.querySelector("code.language-json");
    expect(block).toHaveTextContent('{ "a": 1 }');
  });

  it("hides site only containers in electron", () => {
    renderMarkdown("::: siteonly\nweb\n:::\n\n::: other\nboth\n:::\n");

    const hidden = (text) =>
      // eslint-disable-next-line testing-library/no-node-access
      screen.getByText(text).closest(".electron\\:hidden");
    expect(hidden("web")).not.toBeNull();
    expect(hidden("both")).toBeNull();
  });

  it("keeps absolute image paths on the site", async () => {
    renderApp("/docs/output/png");

    expect(
      (await screen.findAllByRole("img", { name: /export button/i }))[0],
    ).toHaveAttribute("src", "/images/export-button-light.png");
  });
});
