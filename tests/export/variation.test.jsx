import { screen, waitFor, within } from "@testing-library/react";
import { page } from "vitest/browser";

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

// 18Test with two map variations and an `exports` that has every option, set
// by the test
const exportsOfGame = vi.hoisted(() => ({ value: undefined }));

vi.mock("@/data", async (importOriginal) => {
  const data = await importOriginal();
  const game = data.games["18Test"];
  return {
    ...data,
    games: {
      ...data.games,
      "18Test": {
        ...game,
        map: [
          { ...game.map, name: "North" },
          { ...game.map, name: "South" },
        ],
        get exports() {
          return exportsOfGame.value;
        },
      },
    },
  };
});

beforeEach(async () => {
  await page.viewport(1280, 900);
  exportsOfGame.value = {
    formats: ["pdf", "png", "b18"],
    docs: ["map"],
    variation: 1,
  };
  Object.assign(api, {
    addRecent: vi.fn(),
    checkForUpdates: vi.fn(),
    chooseExportFolder: vi.fn(),
    export: vi.fn().mockResolvedValue({ done: 1, total: 1, failed: [] }),
    loadConfig: vi.fn().mockResolvedValue({ config: {}, versions: {} }),
    loadSummaries: vi.fn().mockResolvedValue({}),
    off: vi.fn(),
    onAlert: vi.fn(),
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

const openOptions = async () => {
  const view = renderApp("/games/18Test/map");
  await screen.findByTestId("game-18Test-map");
  await view.user.click(await screen.findByRole("button", { name: "Export" }));
  await view.user.click(
    await screen.findByRole("menuitem", { name: "Export options" }),
  );
  const panel = await screen.findByRole("dialog", { name: "Export 18Test" });
  return { ...view, panel };
};

const requested = async () => {
  await waitFor(() => expect(api.export).toHaveBeenCalledTimes(1));
  return api.export.mock.calls[0][0];
};

const paths = (request) => request.jobs.map(({ path }) => path);

describe("the map variation of the export options", () => {
  it("is a control that starts as the variation of the game file", async () => {
    const { panel } = await openOptions();

    expect(
      within(panel).getByRole("combobox", { name: "Map variation" }),
    ).toHaveTextContent("South");
  });

  it("exports only that variation, and the one that is chosen on top", async () => {
    const { user, panel } = await openOptions();
    await user.click(within(panel).getByRole("button", { name: /^Export$/ }));
    const names = paths(await requested());
    expect(names).toContain("pdf/18test-map-1.pdf");
    expect(names).not.toContain("pdf/18test-map-0.pdf");
    expect(names).toContain("pdf/18test-map-1-paginated.pdf");
  });

  it("is chosen with the keyboard, over the variation of the game", async () => {
    const { user, panel } = await openOptions();
    const variation = within(panel).getByRole("combobox", {
      name: "Map variation",
    });
    variation.focus();
    await user.keyboard("{Enter}");
    await user.click(await screen.findByRole("option", { name: "North" }));
    expect(variation).toHaveTextContent("North");
    await user.click(within(panel).getByRole("button", { name: /^Export$/ }));

    const names = paths(await requested());
    expect(names).toContain("pdf/18test-map-0.pdf");
    expect(names).not.toContain("pdf/18test-map-1.pdf");
  });

  it("can be every variation, when the game file has one", async () => {
    const { user, panel } = await openOptions();
    await user.click(
      within(panel).getByRole("combobox", { name: "Map variation" }),
    );
    await user.click(
      await screen.findByRole("option", { name: "Every variation" }),
    );
    await user.click(within(panel).getByRole("button", { name: /^Export$/ }));

    const names = paths(await requested());
    expect(names).toContain("pdf/18test-map-0.pdf");
    expect(names).toContain("pdf/18test-map-1.pdf");
  });

  it("is every variation when the game file has none", async () => {
    exportsOfGame.value = undefined;
    const { panel } = await openOptions();

    expect(
      within(panel).getByRole("combobox", { name: "Map variation" }),
    ).toHaveTextContent("Every variation");
  });

  it("is in the box of the variation too", async () => {
    exportsOfGame.value = { formats: ["b18"], variation: 0 };
    const { user, panel } = await openOptions();
    await user.click(within(panel).getByRole("button", { name: /^Export$/ }));

    const request = await requested();
    expect(request.b18.names.json).toContain("18Test");
    expect(paths(request).length).toBeGreaterThan(0);
  });
});

describe("reset to the options of the game", () => {
  it("brings every control back to the game file", async () => {
    exportsOfGame.value = {
      formats: ["png", "b18"],
      docs: ["map"],
      layouts: "all",
      variation: 1,
      png: { dpi: 150 },
      b18: { version: "3.0", author: "The Designer" },
    };
    const { user, panel } = await openOptions();
    const dpi = within(panel).getByLabelText("PNG resolution (dpi)");
    await user.clear(dpi);
    await user.type(dpi, "96");
    await user.click(
      within(panel).getByRole("checkbox", { name: "PDF documents" }),
    );
    await user.click(
      within(panel).getByRole("switch", { name: "Every layout of a sheet" }),
    );
    await user.clear(within(panel).getByLabelText("Board18 author"));
    await user.type(within(panel).getByLabelText("Board18 author"), "Me");

    await user.click(
      within(panel).getByRole("button", {
        name: "Reset to the game's options",
      }),
    );

    expect(
      within(panel).getByRole("checkbox", { name: "PDF documents" }),
    ).not.toBeChecked();
    expect(
      within(panel).getByRole("switch", { name: "Every layout of a sheet" }),
    ).toBeChecked();
    expect(within(panel).getByLabelText("PNG resolution (dpi)")).toHaveValue(
      150,
    );
    expect(within(panel).getByLabelText("Board18 author")).toHaveValue(
      "The Designer",
    );
    expect(
      within(panel).getByRole("combobox", { name: "Map variation" }),
    ).toHaveTextContent("South");
  });
});
