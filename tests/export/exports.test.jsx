import { screen, waitFor, within } from "@testing-library/react";
import { page } from "vitest/browser";

import { selectLatestAlert } from "@/state";

import { renderApp } from "@tests/support/helpers.jsx";

// The electron preload api, faked. It has to exist before the app modules are
// imported.
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

// The browser export runner, faked: the web tests set what it answers
const web = vi.hoisted(() => ({
  exportSvgs: vi.fn(),
  saveFile: vi.fn(),
}));

vi.mock("@/util/webExport", () => web);

// 18Test with the `exports` of a game file
vi.mock("@/data", async (importOriginal) => {
  const data = await importOriginal();
  const game = data.games["18Test"];
  return {
    ...data,
    games: {
      ...data.games,
      "18Test": {
        ...game,
        exports: {
          formats: ["png", "b18"],
          docs: ["map", "cards"],
          layouts: "all",
          png: { dpi: 150 },
          b18: { version: "3.0", author: "The Designer" },
        },
      },
    },
  };
});

beforeEach(async () => {
  await page.viewport(1280, 900);
  Object.assign(api, {
    addRecent: vi.fn(),
    checkForUpdates: vi.fn(),
    chooseExportFolder: vi.fn(),
    export: vi.fn().mockResolvedValue({ done: 1, total: 1, failed: [] }),
    loadConfig: vi.fn().mockResolvedValue({ config: {}, versions: {} }),
    loadSummaries: vi.fn().mockResolvedValue({}),
    off: vi.fn(),
    onAlert: vi.fn(),
    onAssets: vi.fn(),
    onDownloadProgress: vi.fn(),
    onGame: vi.fn(),
    onProgress: vi.fn(),
    onRedirect: vi.fn(),
    onSave: vi.fn(),
    onMenu: vi.fn(),
    setLanguage: vi.fn(),
    onUpdate: vi.fn(),
  });
});

const openOptions = async (state) => {
  const view = renderApp("/games/18Test/map", state);
  await screen.findByTestId("game-18Test-map");
  await view.user.click(await screen.findByRole("button", { name: "Export" }));
  await view.user.click(
    await screen.findByRole("menuitem", { name: "Export options" }),
  );
  const panel = await screen.findByRole("dialog", { name: "Export 18Test" });
  return { ...view, panel };
};

describe("export options of a game with exports", () => {
  it("starts with what the game file says", async () => {
    const { panel } = await openOptions();

    expect(
      within(panel).getByRole("checkbox", { name: "PDF documents" }),
    ).not.toBeChecked();
    expect(
      within(panel).getByRole("checkbox", { name: "PNG images" }),
    ).toBeChecked();
    expect(
      within(panel).getByRole("checkbox", { name: "Board18 box" }),
    ).toBeChecked();
    const checked = within(
      within(panel).getByRole("group", { name: "Documents" }),
    )
      .getAllByRole("checkbox")
      .filter((box) => box.getAttribute("aria-checked") === "true")
      .map((box) => box.id);
    expect(checked.sort()).toEqual(["export-doc-cards", "export-doc-map"]);
    expect(
      within(panel).getByRole("switch", { name: "Every layout of a sheet" }),
    ).toBeChecked();
    expect(within(panel).getByLabelText("PNG resolution (dpi)")).toHaveValue(
      150,
    );
    expect(within(panel).getByLabelText("Board18 version")).toHaveValue("3.0");
    expect(within(panel).getByLabelText("Board18 author")).toHaveValue(
      "The Designer",
    );
  });

  it("exports with them, and with what is changed in the panel on top", async () => {
    const { user, panel } = await openOptions();
    const dpi = within(panel).getByLabelText("PNG resolution (dpi)");
    await user.clear(dpi);
    await user.type(dpi, "96");
    await user.click(
      within(panel).getByRole("switch", { name: "Every layout of a sheet" }),
    );
    await user.click(within(panel).getByRole("button", { name: /^Export$/ }));

    await waitFor(() => expect(api.export).toHaveBeenCalledTimes(1));
    const request = api.export.mock.calls[0][0];
    expect(request.dpi).toBe(96);
    expect(request.b18.json).toMatchObject({
      version: "3.0",
      author: "The Designer",
    });
    const names = request.jobs.map(({ path }) => path);
    expect(names).toContain("png/18test-map.png");
    expect(names.some((name) => name.includes("card"))).toBe(true);
    // The game has every layout, and the panel turned it off
    expect(names.some((name) => name.includes("Die"))).toBe(false);
    expect(names.some((name) => name.endsWith(".pdf"))).toBe(false);
    expect(names.some((name) => name.includes("tiles"))).toBe(false);
  });

  it("is overridden by the formats, documents and box of the panel", async () => {
    const { user, panel } = await openOptions();
    await user.click(
      within(panel).getByRole("checkbox", { name: "PDF documents" }),
    );
    await user.click(
      within(panel).getByRole("checkbox", { name: "PNG images" }),
    );
    await user.click(
      within(panel).getByRole("checkbox", { name: "Board18 box" }),
    );
    await user.click(within(panel).getByRole("checkbox", { name: "Tokens" }));
    await user.click(within(panel).getByRole("checkbox", { name: "Cards" }));
    await user.click(within(panel).getByRole("button", { name: /^Export$/ }));

    await waitFor(() => expect(api.export).toHaveBeenCalledTimes(1));
    const request = api.export.mock.calls[0][0];
    expect(request.b18).toBeUndefined();
    const names = request.jobs.map(({ path }) => path);
    expect(names.every((name) => name.endsWith(".pdf"))).toBe(true);
    expect(names.some((name) => name.includes("tokens"))).toBe(true);
    expect(names).toContain("pdf/18test-map.pdf");
    expect(names).toContain("pdf/18test-map-paginated.pdf");
    expect(names.some((name) => name.includes("cards"))).toBe(false);
  });

  it("is overridden by the version and author of the box in the panel", async () => {
    const { user, panel } = await openOptions();
    const version = within(panel).getByLabelText("Board18 version");
    await user.clear(version);
    await user.type(version, "4.0");
    const author = within(panel).getByLabelText("Board18 author");
    await user.clear(author);
    await user.type(author, "Me");
    await user.click(within(panel).getByRole("button", { name: /^Export$/ }));

    await waitFor(() => expect(api.export).toHaveBeenCalledTimes(1));
    expect(api.export.mock.calls[0][0].b18.json).toMatchObject({
      version: "4.0",
      author: "Me",
    });
  });
});

describe("export on the web", () => {
  const file = { name: "18test.zip", bytes: new Uint8Array([1]), type: "z" };

  beforeEach(() => {
    caps.electron = false;
    web.exportSvgs.mockReset();
    web.saveFile.mockReset();
    web.exportSvgs.mockImplementation(async (request, { onProgress }) => {
      onProgress({ type: "doc", done: 1, total: 3, name: "svg/a.svg" });
      return { done: 3, total: 3, failed: [], cancelled: false, file };
    });
  });

  afterEach(() => {
    caps.electron = true;
  });

  const openMenu = async () => {
    const view = renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");
    await view.user.click(
      await screen.findByRole("button", { name: "Export" }),
    );
    await screen.findByRole("menu");
    return view;
  };

  it("the web menu offers svg and options only", async () => {
    await openMenu();

    expect(
      screen.getAllByRole("menuitem").map((item) => item.textContent),
    ).toEqual(["Export game as svg images", "Export options"]);
  });

  it("svg from the menu downloads the planned svgs", async () => {
    const { user, store } = await openMenu();
    await user.click(
      screen.getByRole("menuitem", { name: "Export game as svg images" }),
    );

    await waitFor(() => expect(web.saveFile).toHaveBeenCalledWith(file));
    const request = web.exportSvgs.mock.calls[0][0];
    expect(request.jobs.length).toBeGreaterThan(0);
    expect(request.jobs.every((job) => job.format === "svg")).toBe(true);
    expect(api.export).not.toHaveBeenCalled();
    expect(selectLatestAlert(store.getState())).toMatchObject({
      title: "Game exported",
      message: "Exported 3 files",
      type: "success",
    });
  });

  it("web options show only svg", async () => {
    const { panel } = await openOptions();

    expect(
      within(panel)
        .getAllByRole("checkbox")
        .map((box) => box.id)
        .filter((id) => id.startsWith("export-format-")),
    ).toEqual(["export-format-svg"]);
    expect(
      within(panel).getByRole("checkbox", { name: "SVG images" }),
    ).toBeChecked();
    expect(
      within(panel).queryByLabelText("PNG resolution (dpi)"),
    ).not.toBeInTheDocument();
    expect(
      within(panel).queryByLabelText("Card bleed (units)"),
    ).not.toBeInTheDocument();
    expect(
      within(panel).queryByLabelText("Image background"),
    ).not.toBeInTheDocument();
    expect(
      within(panel).queryByLabelText("Board18 version"),
    ).not.toBeInTheDocument();
    expect(
      within(panel).queryByRole("button", { name: "Choose folder" }),
    ).not.toBeInTheDocument();
    expect(within(panel).queryByText("Destination")).not.toBeInTheDocument();
  });

  it("cancel stops the web export", async () => {
    let signal;
    web.exportSvgs.mockImplementation(
      (request, options) =>
        new Promise((resolve) => {
          signal = options.signal;
          signal.addEventListener("abort", () =>
            resolve({
              done: 1,
              total: 3,
              failed: [],
              cancelled: true,
              file: null,
            }),
          );
        }),
    );
    const { user, store, panel } = await openOptions();
    await user.click(within(panel).getByRole("button", { name: /^Export$/ }));
    await user.click(
      await within(panel).findByRole("button", { name: "Cancel export" }),
    );

    expect(signal.aborted).toBe(true);
    await waitFor(() =>
      expect(selectLatestAlert(store.getState())).toMatchObject({
        title: "Export cancelled",
        message: "Exported 1 of 3 files",
        type: "warning",
      }),
    );
    expect(web.saveFile).not.toHaveBeenCalled();
    expect(api.cancelExport).toBeUndefined();
  });

  const exportFromMenu = async (user) => {
    await user.click(
      screen.getByRole("menuitem", { name: "Export game as svg images" }),
    );
  };

  it("does not start a second export while one runs", async () => {
    let finish;
    web.exportSvgs.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const { user } = await openMenu();
    await exportFromMenu(user);
    await waitFor(() => expect(web.exportSvgs).toHaveBeenCalledTimes(1));

    await waitFor(() =>
      expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
    );
    await user.keyboard("x");
    await screen.findByRole("menu");
    await user.keyboard("s");
    await waitFor(() =>
      expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
    );

    expect(web.exportSvgs).toHaveBeenCalledTimes(1);
    finish({ done: 3, total: 3, failed: [], cancelled: false, file });
    await waitFor(() => expect(web.saveFile).toHaveBeenCalledTimes(1));
  });

  it("the options panel shows and cancels an export started from the menu", async () => {
    let signal;
    web.exportSvgs.mockImplementation(
      (request, options) =>
        new Promise((resolve) => {
          signal = options.signal;
          signal.addEventListener("abort", () =>
            resolve({
              done: 0,
              total: 3,
              failed: [],
              cancelled: true,
              file: null,
            }),
          );
        }),
    );
    const { user, store } = await openMenu();
    await exportFromMenu(user);
    await waitFor(() => expect(web.exportSvgs).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: "Export" }));
    await user.click(
      await screen.findByRole("menuitem", { name: "Export options" }),
    );
    const panel = await screen.findByRole("dialog", { name: "Export 18Test" });
    expect(
      within(panel).getByRole("button", { name: "Exporting" }),
    ).toBeDisabled();
    await user.click(
      within(panel).getByRole("button", { name: "Cancel export" }),
    );

    expect(signal.aborted).toBe(true);
    await waitFor(() =>
      expect(selectLatestAlert(store.getState())).toMatchObject({
        title: "Export cancelled",
      }),
    );
    expect(web.exportSvgs).toHaveBeenCalledTimes(1);
  });

  it("says one file for an export of one file", async () => {
    web.exportSvgs.mockResolvedValue({
      done: 1,
      total: 1,
      failed: [],
      cancelled: false,
      file,
    });
    const { user, store } = await openMenu();
    await exportFromMenu(user);

    await waitFor(() =>
      expect(selectLatestAlert(store.getState())).toMatchObject({
        title: "Game exported",
        message: "Exported 1 file",
      }),
    );
  });

  it("alerts the first failed file and still downloads the others", async () => {
    web.exportSvgs.mockResolvedValue({
      done: 2,
      total: 3,
      failed: [{ path: "svg/18test-map.svg", message: "Timed out" }],
      cancelled: false,
      file,
    });
    const { user, store } = await openMenu();
    await exportFromMenu(user);

    await waitFor(() =>
      expect(selectLatestAlert(store.getState())).toMatchObject({
        title: "Export failed",
        message: "1 of 3 files failed, svg/18test-map.svg: Timed out",
        type: "error",
      }),
    );
    expect(web.saveFile).toHaveBeenCalledWith(file);
  });

  it("alerts when there is nothing to export", async () => {
    web.exportSvgs.mockResolvedValue({
      done: 0,
      total: 0,
      failed: [],
      cancelled: false,
      file: null,
    });
    const { user, store } = await openMenu();
    await exportFromMenu(user);

    await waitFor(() =>
      expect(selectLatestAlert(store.getState())).toMatchObject({
        title: "Export failed",
        message:
          "Nothing to export: the chosen documents have no files in the chosen formats",
        type: "error",
      }),
    );
    expect(web.saveFile).not.toHaveBeenCalled();
  });

  it("shows the progress of the export", async () => {
    let finish;
    web.exportSvgs.mockImplementation((request, { onProgress }) => {
      onProgress({ type: "doc", done: 1, total: 3, name: "svg/a.svg" });
      return new Promise((resolve) => {
        finish = resolve;
      });
    });
    const { user, store } = await openMenu();
    await exportFromMenu(user);

    expect(await screen.findByText("1/3 - svg/a.svg")).toBeInTheDocument();
    expect(selectLatestAlert(store.getState())).toMatchObject({
      title: "Exporting game",
      progress: 33,
    });
    // The export is one for the page, it must not outlive the test
    finish({ done: 3, total: 3, failed: [], cancelled: false, file });
    await waitFor(() => expect(web.saveFile).toHaveBeenCalled());
  });

  it("x opens the menu on the web", async () => {
    const { user } = renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");

    await user.keyboard("x");
    expect(await screen.findByRole("menu")).toBeInTheDocument();
  });

  it("the toolbar shows export and print on the web", async () => {
    renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");

    expect(screen.getByRole("button", { name: "Export" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^print$/i }),
    ).toBeInTheDocument();
  });
});
