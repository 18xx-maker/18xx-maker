import {
  act,
  createEvent,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { page } from "vitest/browser";

import { games } from "@/data";
import { createSetGame } from "@/state";
import { MAX_DROP_FILES } from "@/util/assetNames";
import { canAddAssets } from "@/util/canSaveGame";
import * as assetStore from "@/util/storage/assets";
import * as opfs from "@/util/storage/opfs";

import { drop, dropFiles, pngFile, svgFile } from "@tests/support/drop.js";
import { renderApp } from "@tests/support/helpers.jsx";
import { makePng } from "@tests/support/png.js";

const caps = vi.hoisted(() => ({}));

vi.mock("@/util/capability", async (importOriginal) => {
  Object.assign(caps, (await importOriginal()).default);
  return { default: caps };
});
vi.mock("@/util/storage/opfs", async (importOriginal) => ({
  ...(await importOriginal()),
  saveGameFile: vi.fn(),
  loadSummaries: vi.fn(async () => ({})),
}));

const SLUG = "internal:drop";
const internalGame = {
  ...games["18Test"],
  meta: { id: "drop", type: "internal", slug: SLUG },
};

// The app with a game of the browser's private file system on screen
const renderWithGame = async (game = internalGame) => {
  const view = renderApp("/");
  act(() => view.store.dispatch(createSetGame(game)));
  return view;
};

const stored = (store, kind) =>
  Object.keys(store.getState().assets?.[SLUG]?.[kind] ?? {});

beforeEach(async () => {
  await page.viewport(1280, 800);
  Object.assign(caps, { electron: false, system: false, internal: true });
  opfs.saveGameFile.mockReset();
});

afterEach(async () => {
  await assetStore.deleteAssets(SLUG);
});

const dialog = () => screen.findByRole("dialog");
const choose = async (user, name) => {
  const box = await dialog();
  await user.click(within(box).getByRole("radio", { name }));
  return box;
};

describe("canAddAssets", () => {
  it("is true for the games that can keep images", () => {
    expect(canAddAssets("internal")).toBe(true);
    expect(canAddAssets("bundled")).toBe(false);
    expect(canAddAssets("system")).toBe(false);
    caps.system = true;
    expect(canAddAssets("system")).toBe(true);
    expect(canAddAssets("electron")).toBe(false);
  });
});

describe("dropping an SVG", () => {
  it("asks for the kind and does not add before one is chosen", async () => {
    const { store, user } = await renderWithGame();

    dropFiles([svgFile("star.svg")]);

    const box = await dialog();
    expect(within(box).getByLabelText("Name")).toHaveValue("star");
    expect(within(box).getByRole("button", { name: "Add" })).toBeDisabled();
    expect(within(box).getByRole("radio", { name: "Icon" })).not.toBeChecked();
    expect(within(box).getByRole("radio", { name: "Logo" })).not.toBeChecked();

    await user.click(within(box).getByRole("radio", { name: "Icon" }));
    await user.click(within(box).getByRole("button", { name: "Add" }));

    await waitFor(() => expect(stored(store, "icons")).toEqual(["star"]));
    expect(stored(store, "logos")).toEqual([]);
    expect(await screen.findByText("Icon custom/star")).toBeInTheDocument();
  });

  it("stores a logo under logos", async () => {
    const { store, user } = await renderWithGame();

    dropFiles([svgFile("crest.svg")]);
    const box = await choose(user, "Logo");
    await user.click(within(box).getByRole("button", { name: "Add" }));

    await waitFor(() => expect(stored(store, "logos")).toEqual(["crest"]));
    expect(stored(store, "icons")).toEqual([]);
    expect(await screen.findByText("Logo custom/crest")).toBeInTheDocument();
  });

  it("proposes the sanitized, upper case friendly file name", async () => {
    const { user } = await renderWithGame();

    dropFiles([svgFile("My Star (2).SVG")]);

    const box = await dialog();
    expect(within(box).getByLabelText("Name")).toHaveValue("My-Star--2-");
    await user.click(within(box).getByRole("button", { name: "Skip" }));
  });

  it.each([
    ["con.svg", "image"],
    [".svg", "image"],
    [`${"a".repeat(70)}.svg`, "a".repeat(64)],
  ])("falls back for the name of %s", async (file, expected) => {
    const { user } = await renderWithGame();

    dropFiles([svgFile(file)]);

    const box = await dialog();
    expect(within(box).getByLabelText("Name")).toHaveValue(expected);
    await user.click(within(box).getByRole("button", { name: "Skip" }));
  });

  it("blocks an empty or invalid name", async () => {
    const { user } = await renderWithGame();
    dropFiles([svgFile("star.svg")]);
    const box = await choose(user, "Icon");

    await user.clear(within(box).getByLabelText("Name"));
    expect(within(box).getByRole("button", { name: "Add" })).toBeDisabled();
    await user.type(within(box).getByLabelText("Name"), "-bad name");
    expect(within(box).getByRole("button", { name: "Add" })).toBeDisabled();
    expect(within(box).getByRole("alert")).toHaveTextContent(
      "Use letters, digits",
    );
  });

  it("asks to replace or rename when the name exists", async () => {
    const { store, user } = await renderWithGame();
    dropFiles([svgFile("star.svg")]);
    let box = await choose(user, "Icon");
    await user.click(within(box).getByRole("button", { name: "Add" }));
    await waitFor(() => expect(stored(store, "icons")).toEqual(["star"]));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );

    // The same name again, in other case
    dropFiles([
      svgFile("STAR.svg", '<svg viewBox="0 0 4 4"><circle r="1"/></svg>'),
    ]);
    box = await choose(user, "Icon");
    expect(within(box).getByRole("alert")).toHaveTextContent(
      "custom/star exists already",
    );
    expect(
      within(box).queryByRole("button", { name: "Add" }),
    ).not.toBeInTheDocument();

    // Rename takes the next free name
    await user.click(within(box).getByRole("button", { name: "Rename" }));
    expect(within(box).getByLabelText("Name")).toHaveValue("STAR-2");
    await user.click(within(box).getByRole("button", { name: "Add" }));
    await waitFor(() =>
      expect(stored(store, "icons").sort()).toEqual(["STAR-2", "star"]),
    );
  });

  it("replaces the image when asked to", async () => {
    const { store, user } = await renderWithGame();
    dropFiles([svgFile("star.svg")]);
    let box = await choose(user, "Icon");
    await user.click(within(box).getByRole("button", { name: "Add" }));
    await waitFor(() => expect(stored(store, "icons")).toEqual(["star"]));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );

    dropFiles([
      svgFile("star.svg", '<svg viewBox="0 0 4 4"><circle r="1"/></svg>'),
    ]);
    box = await choose(user, "Icon");
    await user.click(within(box).getByRole("button", { name: "Replace" }));

    await waitFor(() =>
      expect(store.getState().assets[SLUG].icons.star).toContain("circle"),
    );
    expect(stored(store, "icons")).toEqual(["star"]);
  });

  it("handles several files in order and skips or cancels", async () => {
    const { store, user } = await renderWithGame();

    dropFiles([
      svgFile("one.svg"),
      pngFile(makePng(), "two.png"),
      svgFile("three.svg"),
      svgFile("four.svg"),
    ]);

    // The PNG needs no question, the SVGs are asked one after another
    let box = await choose(user, "Icon");
    expect(box).toHaveTextContent("one.svg (1 of 3)");
    await user.click(within(box).getByRole("button", { name: "Add" }));
    await waitFor(() => expect(box).not.toBeInTheDocument());
    box = await dialog();
    expect(box).toHaveTextContent("three.svg (2 of 3)");
    await user.click(within(box).getByRole("button", { name: "Skip" }));
    await waitFor(() => expect(box).not.toBeInTheDocument());
    box = await dialog();
    expect(box).toHaveTextContent("four.svg (3 of 3)");
    await user.click(within(box).getByRole("button", { name: "Cancel all" }));

    await waitFor(() => expect(stored(store, "trains")).toEqual(["two"]));
    expect(stored(store, "icons")).toEqual(["one"]);
    expect(stored(store, "logos")).toEqual([]);
  });

  it("is rejected when it has nothing usable", async () => {
    const { store } = await renderWithGame();

    dropFiles([svgFile("bad.svg", "<html></html>")]);

    expect(await screen.findByText(/bad\.svg/)).toHaveTextContent(
      "This is not a usable SVG file.",
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(stored(store, "icons")).toEqual([]);
  });
});

describe("dropping a PNG", () => {
  it("adds a train image with no dialog", async () => {
    const { store } = await renderWithGame();

    dropFiles([pngFile(makePng(), "Big Loco.png")]);

    await waitFor(() => expect(stored(store, "trains")).toEqual(["Big-Loco"]));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      await screen.findByText("Train image custom/Big-Loco"),
    ).toBeInTheDocument();
  });

  it("numbers the name on a clash instead of overwriting", async () => {
    const { store } = await renderWithGame();
    dropFiles([pngFile(makePng(), "loco.png")]);
    await waitFor(() => expect(stored(store, "trains")).toEqual(["loco"]));

    dropFiles([pngFile(makePng({ width: 3 }), "LOCO.png")]);

    await waitFor(() =>
      expect(stored(store, "trains").sort()).toEqual(["LOCO-2", "loco"]),
    );
  });

  it("rejects a PNG with a bad signature or too large a header", async () => {
    const { store } = await renderWithGame();

    dropFiles([
      pngFile(makePng({ signature: false }), "bad.png"),
      pngFile(makePng({ width: 5000, height: 10 }), "huge.png"),
    ]);

    const alert = await screen.findByText(/bad\.png/);
    expect(alert).toHaveTextContent("bad.png: This is not a PNG file.");
    expect(alert).toHaveTextContent(
      "huge.png: The PNG is larger than 4096 by 4096 pixels.",
    );
    expect(stored(store, "trains")).toEqual([]);
  });
});

describe("dropping files that are not images", () => {
  it("reports each bad file and still adds the good ones", async () => {
    const { store } = await renderWithGame();
    const big = new File(["x".repeat(600 * 1024)], "huge.svg");

    dropFiles([
      new File(["hi"], "notes.txt"),
      big,
      pngFile(makePng({ signature: false }), "fake.png"),
      pngFile(makePng(), "ok.png"),
      new File(["{}"], "game.json"),
    ]);

    const alert = await screen.findByText(/notes\.txt/);
    expect(alert).toHaveTextContent(
      "notes.txt: Only SVG and PNG files can be added.",
    );
    expect(alert).toHaveTextContent("huge.svg: The file is too large.");
    expect(alert).toHaveTextContent("fake.png: This is not a PNG file.");
    expect(alert).toHaveTextContent(
      "game.json: A game file has to be dropped on its own.",
    );
    expect(alert).toHaveTextContent("Train image custom/ok");
    expect(stored(store, "trains")).toEqual(["ok"]);
    expect(opfs.saveGameFile).not.toHaveBeenCalled();
  });

  it("reports a folder", async () => {
    const { store } = await renderWithGame();
    const file = new File([], "pictures");

    drop({
      items: [
        {
          kind: "file",
          getAsFile: () => file,
          webkitGetAsEntry: () => ({ isDirectory: true }),
        },
      ],
      files: [file],
    });

    expect(await screen.findByText(/pictures/)).toHaveTextContent(
      "pictures: Folders cannot be dropped.",
    );
    expect(stored(store, "icons")).toEqual([]);
    expect(opfs.saveGameFile).not.toHaveBeenCalled();
  });

  it(`uses only the first ${MAX_DROP_FILES} files`, async () => {
    const { store } = await renderWithGame();
    const files = Array.from({ length: MAX_DROP_FILES + 2 }, (_, i) =>
      pngFile(makePng(), `t${i}.png`),
    );

    dropFiles(files);

    const alert = await screen.findByText(/2 more were skipped/);
    await waitFor(() =>
      expect(stored(store, "trains")).toHaveLength(MAX_DROP_FILES),
    );
    expect(alert).toHaveTextContent("Only the first 20 files");
  });
});

describe("dropping without a place for the images", () => {
  it("shows an error with no game loaded and stores nothing", async () => {
    const { store } = renderApp("/");

    dropFiles([svgFile("star.svg")]);

    expect(
      await screen.findByText(/Open or create a game first/),
    ).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(store.getState().assets).toEqual({});
    expect(opfs.saveGameFile).not.toHaveBeenCalled();
  });

  it("shows an error for a bundled game", async () => {
    const { store } = renderApp("/games/18Test");
    await screen.findByTestId("game-18Test");
    const before = store.getState().assets["bundled:18Test"]?.trains ?? {};

    dropFiles([pngFile(makePng())]);

    expect(
      await screen.findByText(/Bundled games cannot take images/),
    ).toBeInTheDocument();
    expect(store.getState().assets["bundled:18Test"]?.trains ?? {}).toEqual(
      before,
    );
  });

  it("shows an error when the browser cannot store images", async () => {
    Object.assign(caps, { internal: false });
    await renderWithGame();

    dropFiles([pngFile(makePng())]);

    expect(
      await screen.findByText("Your browser does not support dropping files"),
    ).toBeInTheDocument();
  });

  it("says the game was not found when the game on screen is another", async () => {
    renderApp("/", {
      loadedGame: { ...internalGame.meta, title: "Gone" },
    });

    dropFiles([pngFile(makePng())]);

    expect(
      await screen.findByText("The game was not found."),
    ).toBeInTheDocument();
  });
});

describe("dropping a game file", () => {
  it("still opens a single .json file as a game", async () => {
    opfs.saveGameFile.mockResolvedValue("abc");
    const { router } = await renderWithGame();

    dropFiles([new File(["{}"], "game.json")]);

    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/games/abc/map"),
    );
  });

  it("ignores a drop while a dialog is open", async () => {
    const { store, user } = await renderWithGame();
    dropFiles([svgFile("star.svg")]);
    const box = await dialog();

    const event = dropFiles([pngFile(makePng())]);

    expect(event.defaultPrevented).toBe(true);
    await act(() => new Promise((resolve) => setTimeout(resolve, 100)));
    expect(stored(store, "trains")).toEqual([]);
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    await user.click(within(box).getByRole("button", { name: "Skip" }));
  });
});

describe("the drag overlay", () => {
  const overEvent = (type, types) => {
    // eslint-disable-next-line testing-library/no-node-access
    const zone = document.getElementById("dropzone");
    const event = createEvent[type](zone);
    Object.defineProperty(event, "dataTransfer", { value: { types } });
    fireEvent(zone, event);
  };

  it("shows while files are dragged over and clears on drop", async () => {
    await renderWithGame();
    expect(screen.queryByTestId("drop-overlay")).not.toBeInTheDocument();

    act(() => overEvent("dragEnter", ["Files"]));
    expect(screen.getByTestId("drop-overlay")).toBeInTheDocument();
    act(() => overEvent("dragEnter", ["Files"]));
    act(() => overEvent("dragLeave", ["Files"]));
    // Still over a child
    expect(screen.getByTestId("drop-overlay")).toBeInTheDocument();
    act(() => overEvent("dragLeave", ["Files"]));
    expect(screen.queryByTestId("drop-overlay")).not.toBeInTheDocument();

    act(() => overEvent("dragEnter", ["Files"]));
    act(() => {
      dropFiles([new File(["x"], "n.txt")]);
    });
    await waitFor(() =>
      expect(screen.queryByTestId("drop-overlay")).not.toBeInTheDocument(),
    );
  });

  it("clears on dragend and when the window loses focus", async () => {
    await renderWithGame();

    act(() => overEvent("dragEnter", ["Files"]));
    fireEvent(window, new Event("dragend"));
    expect(screen.queryByTestId("drop-overlay")).not.toBeInTheDocument();

    act(() => overEvent("dragEnter", ["Files"]));
    fireEvent(window, new Event("blur"));
    expect(screen.queryByTestId("drop-overlay")).not.toBeInTheDocument();
  });

  it("does not show for dragged text", async () => {
    await renderWithGame();

    act(() => overEvent("dragEnter", ["text/plain"]));

    expect(screen.queryByTestId("drop-overlay")).not.toBeInTheDocument();
  });
});
