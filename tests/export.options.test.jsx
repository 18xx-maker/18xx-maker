import { screen, waitFor, within } from "@testing-library/react";
import axe from "axe-core";
import { page } from "vitest/browser";

import { DOCS } from "@/export/select.js";

import { renderApp } from "@tests/helpers.jsx";

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

const result = { done: 3, total: 3, failed: [], cancelled: false };

beforeEach(async () => {
  await page.viewport(1280, 900);
  Object.assign(api, {
    addRecent: vi.fn(),
    checkForUpdates: vi.fn(),
    deleteGame: vi.fn(),
    downloadUpdate: vi.fn(),
    loadPlatformAndVersions: vi.fn().mockReturnValue({
      platform: "darwin",
      versions: {},
    }),
    loadSummaries: vi.fn().mockResolvedValue({}),
    openGame: vi.fn(),
    saveGamePath: vi.fn(),
    cancelExport: vi.fn(),
    chooseExportFolder: vi.fn().mockResolvedValue("/home/me/boxes"),
    export: vi.fn().mockResolvedValue(result),
    loadConfig: vi.fn().mockResolvedValue({ config: {}, versions: {} }),
    off: vi.fn(),
    onAlert: vi.fn(),
    onDownloadProgress: vi.fn(),
    onGame: vi.fn(),
    onProgress: vi.fn(),
    onRedirect: vi.fn(),
    onUpdate: vi.fn(),
  });
});

const requested = () => api.export.mock.calls.at(-1)[0];

const openOptions = async (route = "/games/18Test/map", options) => {
  const view = renderApp(route, options);
  const { user } = view;
  await screen.findByTestId("game-18Test-map");
  await user.click(await screen.findByRole("button", { name: "Export" }));
  await user.click(
    await screen.findByRole("menuitem", { name: "Export options" }),
  );
  const panel = await screen.findByRole("dialog", { name: "Export 18Test" });
  return { ...view, panel };
};

const checkbox = (panel, name) => within(panel).getByRole("checkbox", { name });
const exportButton = (panel) =>
  within(panel).getByRole("button", { name: /^Export(ing)?$/ });

describe("export options", () => {
  it("opens from the export menu with the formats, documents and options", async () => {
    const { user } = renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");
    await user.click(await screen.findByRole("button", { name: "Export" }));
    await user.click(
      await screen.findByRole("menuitem", { name: "Export options" }),
    );

    const panel = await screen.findByRole("dialog", { name: "Export 18Test" });
    expect(checkbox(panel, "PDF documents")).toBeChecked();
    expect(checkbox(panel, "PNG images")).not.toBeChecked();
    expect(checkbox(panel, "Board18 box")).not.toBeChecked();
    // Every page of the game is chosen
    const documents = within(
      within(panel).getByRole("group", { name: "Documents" }),
    ).getAllByRole("checkbox");
    expect(documents.length).toBeGreaterThan(5);
    // Only pages of the game, the Board18 images are part of the box
    expect(documents.map((box) => box.id).sort()).toEqual(
      DOCS.map((page) => `export-doc-${page}`).sort(),
    );
    expect(
      documents.every((box) => box.getAttribute("aria-checked") === "true"),
    ).toBe(true);
    expect(within(panel).getByLabelText("PNG resolution (dpi)")).toBeDisabled();
    expect(
      within(panel).getByText("A folder is asked for when you export"),
    ).toBeInTheDocument();
    // Board18 fields only matter for a box
    expect(
      within(panel).queryByLabelText("Board18 author"),
    ).not.toBeInTheDocument();
  });

  it("exports the chosen files with the chosen options", async () => {
    const { user, panel } = await openOptions();
    await user.click(checkbox(panel, "PNG images"));
    await user.click(checkbox(panel, "Board18 box"));
    const dpi = within(panel).getByLabelText("PNG resolution (dpi)");
    await user.clear(dpi);
    await user.type(dpi, "150");
    const version = within(panel).getByLabelText("Board18 version");
    await user.clear(version);
    await user.type(version, "2.1");
    const author = within(panel).getByLabelText("Board18 author");
    expect(author).toHaveValue("Christopher Giroir");
    await user.clear(author);
    await user.type(author, "Me");
    await user.click(checkbox(panel, "Cards"));
    await user.click(
      within(panel).getByRole("button", { name: "Choose folder" }),
    );
    expect(
      await within(panel).findByText("/home/me/boxes"),
    ).toBeInTheDocument();

    // Paginated pdfs are not an option
    expect(
      within(panel).queryByRole("switch", { name: "Paginated pdfs" }),
    ).not.toBeInTheDocument();
    await user.click(exportButton(panel));

    await waitFor(() => expect(api.export).toHaveBeenCalledTimes(1));
    const request = requested();
    expect(request).toMatchObject({
      id: "18Test",
      dpi: 150,
      out: "/home/me/boxes",
      b18: {
        names: { zip: "board18-18Test-2.1.zip" },
        json: { version: "2.1", bname: "18Test", author: "Me" },
      },
    });
    const formats = new Set(request.jobs.map(({ format }) => format));
    expect([...formats].sort()).toEqual(["b18", "pdf", "png"]);
    const names = request.jobs.map(({ path }) => path);
    expect(names).toContain("18test-map.pdf");
    expect(names).toContain("18test-map.png");
    // A paginated pdf of what does not fit on one page, and no cards
    expect(names).toContain("18test-map-paginated.pdf");
    expect(names).not.toContain("18test-par-paginated.pdf");
    expect(names.some((name) => name.includes("card"))).toBe(false);
    // The panel closes when the export is over
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Export 18Test" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("exports only a Board18 box with no documents to choose", async () => {
    const { user, panel } = await openOptions();
    await user.click(checkbox(panel, "PDF documents"));
    await user.click(checkbox(panel, "Board18 box"));

    expect(checkbox(panel, "Map")).toBeDisabled();
    await user.click(exportButton(panel));

    await waitFor(() => expect(api.export).toHaveBeenCalledTimes(1));
    expect(requested().jobs.every(({ format }) => format === "b18")).toBe(true);
    expect(requested().out).toBeUndefined();
  });

  it("exports svg files without a resolution or a background to choose", async () => {
    const { user, panel } = await openOptions();
    await user.click(checkbox(panel, "PDF documents"));
    await user.click(checkbox(panel, "SVG images"));

    expect(within(panel).getByLabelText("PNG resolution (dpi)")).toBeDisabled();
    expect(
      within(panel).getByRole("combobox", { name: "Image background" }),
    ).toBeDisabled();
    // The documents are for svg files too
    expect(checkbox(panel, "Map")).toBeEnabled();

    await user.click(exportButton(panel));
    await waitFor(() => expect(api.export).toHaveBeenCalledTimes(1));
    const { jobs } = requested();
    expect(jobs.every(({ format }) => format === "svg")).toBe(true);
    expect(jobs.map(({ path }) => path)).toEqual(
      expect.arrayContaining(["18test-map.svg", "18test-tile-1.svg"]),
    );
  });

  it("only takes a background for png images, not a Board18 box", async () => {
    const { user, panel } = await openOptions();
    const background = within(panel).getByRole("combobox", {
      name: "Image background",
    });
    expect(background).toBeDisabled();

    await user.click(checkbox(panel, "Board18 box"));
    expect(background).toBeDisabled();

    await user.click(checkbox(panel, "PNG images"));
    expect(background).toBeEnabled();
  });

  it("exports with a white background unless it is set to transparent", async () => {
    const { user, panel } = await openOptions();
    await user.click(checkbox(panel, "PNG images"));
    const background = within(panel).getByRole("combobox", {
      name: "Image background",
    });
    expect(background).toHaveTextContent("White");
    expect(
      screen.getByText(/white by default\. The other png images/),
    ).toBeInTheDocument();

    await user.click(exportButton(panel));
    await waitFor(() => expect(api.export).toHaveBeenCalledTimes(1));
    expect(requested().background).toBe("white");
  });

  it("exports with a transparent background", async () => {
    const { user, panel } = await openOptions();
    await user.click(checkbox(panel, "PNG images"));
    await user.click(
      within(panel).getByRole("combobox", { name: "Image background" }),
    );
    await user.click(
      await screen.findByRole("option", { name: "Transparent" }),
    );

    await user.click(exportButton(panel));
    await waitFor(() => expect(api.export).toHaveBeenCalledTimes(1));
    expect(requested().background).toBe("transparent");
  });

  it("stops at a resolution over 300 dpi", async () => {
    const { user, panel } = await openOptions();
    await user.click(checkbox(panel, "PNG images"));
    const dpi = within(panel).getByLabelText("PNG resolution (dpi)");
    await user.clear(dpi);
    await user.type(dpi, "301");

    expect(dpi).toBeInvalid();
    expect(
      within(panel).getByText("Use a whole number from 1 to 300"),
    ).toBeInTheDocument();
    expect(exportButton(panel)).toBeDisabled();

    await user.clear(dpi);
    await user.type(dpi, "300");
    expect(dpi).toBeValid();
    expect(exportButton(panel)).toBeEnabled();
  });

  it("exports the card images with the chosen bleed, and stops at a bad one", async () => {
    const { user, panel } = await openOptions();
    await user.click(checkbox(panel, "PNG images"));
    const bleed = within(panel).getByLabelText("Card bleed (units)");
    expect(bleed).toHaveValue(0);
    await user.clear(bleed);
    await user.type(bleed, "51");
    expect(bleed).toBeInvalid();
    expect(
      within(panel).getByText("Use a number from 0 to 50"),
    ).toBeInTheDocument();
    expect(exportButton(panel)).toBeDisabled();

    await user.clear(bleed);
    await user.type(bleed, "12.5");
    expect(bleed).toBeValid();
    await user.click(exportButton(panel));

    await waitFor(() => expect(api.export).toHaveBeenCalledTimes(1));
    const cards = requested().jobs.filter(({ doc }) => doc.kind === "card");
    expect(cards.length).toBeGreaterThan(0);
    for (const { doc } of cards) expect(doc.query).toEqual({ cardBleed: 12.5 });
  });

  it("asks for a format and a document", async () => {
    const { user, panel } = await openOptions();
    await user.click(checkbox(panel, "PDF documents"));

    expect(within(panel).getByText("Choose at least one format")).toBeVisible();
    expect(exportButton(panel)).toBeDisabled();

    await user.click(checkbox(panel, "PDF documents"));
    const documents = within(
      within(panel).getByRole("group", { name: "Documents" }),
    ).getAllByRole("checkbox");
    for (const box of documents) await user.click(box);

    expect(
      within(panel).getByText("Choose at least one document"),
    ).toBeVisible();
    expect(exportButton(panel)).toBeDisabled();
  });

  it("disables the export of svg files of pages that have no svg", async () => {
    const { user, panel } = await openOptions();
    await user.click(checkbox(panel, "PDF documents"));
    await user.click(checkbox(panel, "SVG images"));
    const documents = within(
      within(panel).getByRole("group", { name: "Documents" }),
    ).getAllByRole("checkbox");
    // Only the pages that have no svg
    for (const box of documents) {
      const on = box.getAttribute("aria-checked") === "true";
      if (on !== (box.id === "export-doc-cards")) await user.click(box);
    }

    expect(
      within(panel).getByText(
        "Nothing to export: the chosen documents have no files in the chosen formats",
      ),
    ).toBeVisible();
    expect(exportButton(panel)).toBeDisabled();

    await user.click(checkbox(panel, "Map"));
    expect(exportButton(panel)).toBeEnabled();
  });

  it("exports every layout when asked", async () => {
    const { user, panel } = await openOptions();
    const layouts = within(panel).getByRole("switch", {
      name: "Every layout of a sheet",
    });
    expect(layouts).not.toBeChecked();
    await user.click(layouts);
    await user.click(exportButton(panel));

    await waitFor(() => expect(api.export).toHaveBeenCalledTimes(1));
    expect(requested().jobs.map(({ path }) => path)).toContain(
      "18test-cards-free.pdf",
    );
  });

  it("starts with every layout when the config exports them", async () => {
    const { panel } = await openOptions(undefined, {
      config: { export: { allLayouts: true } },
    });

    expect(
      within(panel).getByRole("switch", { name: "Every layout of a sheet" }),
    ).toBeChecked();
  });

  it("exports the current layout when every layout is turned off", async () => {
    const { user, panel } = await openOptions(undefined, {
      config: { export: { allLayouts: true } },
    });
    await user.click(
      within(panel).getByRole("switch", { name: "Every layout of a sheet" }),
    );
    await user.click(exportButton(panel));

    await waitFor(() => expect(api.export).toHaveBeenCalledTimes(1));
    const names = requested().jobs.map(({ path }) => path);
    expect(names).toContain("18test-cards.pdf");
    expect(names).not.toContain("18test-cards-free.pdf");
  });

  it("needs a Board18 version and author for a box", async () => {
    const { user, panel } = await openOptions();
    await user.click(checkbox(panel, "Board18 box"));

    await user.clear(within(panel).getByLabelText("Board18 author"));
    expect(exportButton(panel)).toBeDisabled();
    await user.type(within(panel).getByLabelText("Board18 author"), "Me");
    expect(exportButton(panel)).toBeEnabled();

    await user.clear(within(panel).getByLabelText("Board18 version"));
    expect(exportButton(panel)).toBeDisabled();
  });

  it("shows the export in progress, and cancels it", async () => {
    let finish;
    api.export.mockReturnValue(new Promise((resolve) => (finish = resolve)));
    const { user, panel } = await openOptions();

    await user.click(exportButton(panel));

    expect(
      await within(panel).findByRole("button", { name: "Exporting" }),
    ).toBeDisabled();
    expect(checkbox(panel, "PNG images")).toBeDisabled();
    await user.click(
      within(panel).getByRole("button", { name: "Cancel export" }),
    );
    expect(api.cancelExport).toHaveBeenCalledTimes(1);

    // The panel has the cancel button, so escape does not close it meanwhile
    await user.keyboard("{Escape}");
    expect(panel).toBeInTheDocument();

    finish({ done: 1, total: 3, failed: [], cancelled: true });
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Export 18Test" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("stays open when the dialog was cancelled", async () => {
    api.export.mockResolvedValue({
      done: 0,
      total: 0,
      failed: [],
      cancelled: true,
    });
    const { user, panel } = await openOptions();

    await user.click(exportButton(panel));

    await waitFor(() => expect(exportButton(panel)).toBeEnabled());
    expect(panel).toBeInTheDocument();
  });

  it("alerts when the export fails to start, and stays open", async () => {
    api.export.mockRejectedValue(new Error("No windows"));
    const { user, panel, store } = await openOptions();

    await user.click(exportButton(panel));

    await waitFor(() =>
      expect(store.getState().alert).toMatchObject({
        title: "Export failed",
        message: "No windows",
        type: "error",
      }),
    );
    expect(exportButton(panel)).toBeEnabled();
  });

  it("closes with escape", async () => {
    const { user } = await openOptions();

    await user.keyboard("{Escape}");

    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Export 18Test" }),
      ).not.toBeInTheDocument(),
    );
  });

  describe("keyboard and accessibility", () => {
    it("is reached and changed with the keyboard", async () => {
      const { user, panel } = await openOptions();

      // Focus is inside the panel, and tab walks its controls in order
      // eslint-disable-next-line testing-library/no-node-access
      expect(panel).toContainElement(document.activeElement);
      const order = [];
      for (let i = 0; i < 40; i++) {
        await user.tab();
        const { activeElement } = document;
        if (!panel.contains(activeElement)) break;
        order.push(activeElement.id || activeElement.textContent);
      }
      expect(order.slice(0, 5)).toEqual([
        "export-format-pdf",
        "export-format-png",
        "export-format-svg",
        "export-format-b18",
        "export-doc-background",
      ]);
      expect(order).toContain("Choose folder");

      // Space toggles the focused checkbox
      checkbox(panel, "PNG images").focus();
      await user.keyboard(" ");
      expect(checkbox(panel, "PNG images")).toBeChecked();
    });

    it("has every control labelled and no serious violations", async () => {
      const { user, panel } = await openOptions();
      await user.click(checkbox(panel, "Board18 box"));
      await user.click(checkbox(panel, "PNG images"));
      const dpi = within(panel).getByLabelText("PNG resolution (dpi)");
      await user.clear(dpi);
      await user.type(dpi, "301");

      const results = await axe.run(panel, {
        // The panel is a dialog over a page: its contrast and landmark rules
        // are about the page
        rules: { region: { enabled: false } },
      });

      expect(
        results.violations
          .filter(({ impact }) => ["serious", "critical"].includes(impact))
          .map(({ id, nodes }) => ({ id, nodes: nodes.map((n) => n.target) })),
      ).toEqual([]);
    });
  });
});
