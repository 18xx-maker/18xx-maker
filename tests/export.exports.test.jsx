import { screen, waitFor, within } from "@testing-library/react";
import { page } from "vitest/browser";

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
    onDownloadProgress: vi.fn(),
    onGame: vi.fn(),
    onProgress: vi.fn(),
    onRedirect: vi.fn(),
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
    expect(names).toContain("18test-map.png");
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
    expect(names).toContain("18test-map.pdf");
    expect(names).toContain("18test-map-paginated.pdf");
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
