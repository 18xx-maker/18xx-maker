import { act, screen, waitFor, within } from "@testing-library/react";
import { page } from "vitest/browser";

import { games } from "@/data";
import { createSetGame } from "@/state";

import { dropFiles, pngFile, svgFile } from "@tests/support/drop.js";
import { renderApp } from "@tests/support/helpers.jsx";
import { makePng } from "@tests/support/png.js";

// The preload api, faked: the app reads it at import time
const api = vi.hoisted(() => {
  window.api = {
    loadPlatformAndVersions: () => ({ platform: "darwin", versions: {} }),
  };
  return window.api;
});

const caps = vi.hoisted(() => ({}));

vi.mock("@/util/capability", async (importOriginal) => {
  Object.assign(caps, (await importOriginal()).default, { electron: true });
  return { default: caps };
});

const game = {
  ...games["18Test"],
  meta: { id: "abc", type: "electron", slug: "electron:abc" },
};

beforeEach(async () => {
  await page.viewport(1280, 800);
  Object.assign(api, {
    addAsset: vi.fn().mockResolvedValue({}),
    loadAssets: vi.fn().mockResolvedValue({
      icons: {},
      logos: {},
      trains: {},
    }),
    loadSummaries: vi.fn().mockResolvedValue({}),
    off: vi.fn(),
    onAlert: vi.fn(),
    onAssets: vi.fn(),
    onDownloadProgress: vi.fn(),
    onGame: vi.fn(),
    onMenu: vi.fn(),
    onProgress: vi.fn(),
    onRedirect: vi.fn(),
    onSave: vi.fn(),
    onUpdate: vi.fn(),
    setLanguage: vi.fn(),
  });
});

const renderWithGame = () => {
  const view = renderApp("/");
  act(() => view.store.dispatch(createSetGame(game)));
  return view;
};

describe("dropping images in the app", () => {
  it("sends a PNG as bytes with the id of the game", async () => {
    renderWithGame();
    const png = makePng();

    dropFiles([pngFile(png, "loco.png")]);

    await waitFor(() => expect(api.addAsset).toHaveBeenCalledTimes(1));
    const [id, kind, name, bytes, options] = api.addAsset.mock.calls[0];
    expect([id, kind, name]).toEqual(["abc", "trains", "loco"]);
    expect(Array.from(bytes)).toEqual(Array.from(png));
    expect(options).toEqual({ replace: false });
    // The folder is read again to show the image
    await waitFor(() => expect(api.loadAssets).toHaveBeenCalledWith("abc"));
    expect(
      await screen.findByText("Train image custom/loco"),
    ).toBeInTheDocument();
  });

  it("asks about an SVG and sends the kind and name", async () => {
    const { user } = renderWithGame();

    dropFiles([svgFile("star.svg")]);
    const box = await screen.findByRole("dialog");
    await user.click(within(box).getByRole("radio", { name: "Logo" }));
    await user.click(within(box).getByRole("button", { name: "Add" }));

    await waitFor(() => expect(api.addAsset).toHaveBeenCalledTimes(1));
    const [id, kind, name, , options] = api.addAsset.mock.calls[0];
    expect([id, kind, name]).toEqual(["abc", "logos", "star"]);
    expect(options).toEqual({ replace: false });
  });

  it("takes an error result as a failure", async () => {
    renderWithGame();
    api.addAsset.mockResolvedValue({ error: "readonly" });

    dropFiles([pngFile(makePng(), "loco.png")]);

    expect(
      await screen.findByText(/The folder of the game cannot be written/),
    ).toBeInTheDocument();
    expect(api.loadAssets).not.toHaveBeenCalled();
  });

  it("reads the code of an error that came through IPC", async () => {
    renderWithGame();
    api.addAsset.mockRejectedValue(
      new Error("asset:game The game was not found"),
    );

    dropFiles([pngFile(makePng(), "loco.png")]);

    expect(
      await screen.findByText(/The game was not found/),
    ).toBeInTheDocument();
  });

  it("numbers the name of a PNG when the folder already has it", async () => {
    renderWithGame();
    api.addAsset
      .mockRejectedValueOnce(
        Object.assign(new Error("exists"), { code: "exists" }),
      )
      .mockResolvedValue({});

    dropFiles([pngFile(makePng(), "loco.png")]);

    await waitFor(() => expect(api.addAsset).toHaveBeenCalledTimes(2));
    expect(api.addAsset.mock.calls[1][2]).toBe("loco-2");
  });

  it("asks again when an SVG name was taken in the meantime", async () => {
    const { user } = renderWithGame();
    api.addAsset
      .mockResolvedValueOnce({ error: "exists" })
      .mockResolvedValue({});

    dropFiles([svgFile("star.svg")]);
    let box = await screen.findByRole("dialog");
    await user.click(within(box).getByRole("radio", { name: "Icon" }));
    await user.click(within(box).getByRole("button", { name: "Add" }));

    await waitFor(() =>
      expect(
        within(screen.getByRole("dialog")).getByRole("alert"),
      ).toHaveTextContent("custom/star exists already"),
    );
    box = screen.getByRole("dialog");
    await user.click(within(box).getByRole("button", { name: "Replace" }));

    await waitFor(() => expect(api.addAsset).toHaveBeenCalledTimes(2));
    expect(api.addAsset.mock.calls[1][4]).toEqual({ replace: true });
  });

  it("shows an error when the app cannot add images", async () => {
    delete api.addAsset;
    renderWithGame();

    dropFiles([pngFile(makePng(), "loco.png")]);

    expect(
      await screen.findByText("Your browser does not support dropping files"),
    ).toBeInTheDocument();
  });
});
