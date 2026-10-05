/* eslint-disable testing-library/no-node-access -- the underline is a bare <u> with no role */
import { screen, waitFor, within } from "@testing-library/react";
import { page as browser } from "vitest/browser";

import { renderApp } from "@tests/support/helpers.jsx";

const trigger = () => screen.getByRole("button", { name: "Toggle Sidebar" });

// Records what the temporary download link saves
const spyDownloads = () => {
  const saved = [];
  const create = vi
    .spyOn(URL, "createObjectURL")
    .mockImplementation((blob) => `blob:${saved.push({ blob })}`);
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(
    function () {
      saved[saved.length - 1].name = this.download;
    },
  );
  return { saved, create };
};

beforeEach(async () => {
  await browser.viewport(414, 896);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("download", () => {
  it("d saves the loaded game without its meta from any page", async () => {
    const { saved } = spyDownloads();
    const { user } = renderApp("/games/18Test");
    await screen.findByTestId("game-18Test");
    await user.keyboard("h");
    await screen.findByTestId("home");

    await user.keyboard("d");

    expect(saved).toHaveLength(1);
    expect(saved[0].name).toBe("18test.json");
    const json = JSON.parse(await saved[0].blob.text());
    expect(json.info.title).toBe("18Test");
    expect(json.meta).toBeUndefined();
  });

  it("d does nothing without a loaded game", async () => {
    const { saved } = spyDownloads();
    const { user } = renderApp("/");
    await screen.findByTestId("home");

    await user.keyboard("d");

    expect(saved).toHaveLength(0);
  });

  it("the sidebar has a Download item after Edit Game", async () => {
    const { saved } = spyDownloads();
    const { user } = renderApp("/games/18Test");
    await screen.findByTestId("game-18Test");

    await user.click(trigger());
    const panel = await screen.findByRole("dialog", { name: "Sidebar" });
    const edit = within(panel).getByRole("link", { name: "Edit Game" });
    const download = within(panel).getByRole("button", { name: "Download" });
    expect(
      edit.compareDocumentPosition(download) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(download.querySelector("u")).toHaveTextContent("D");

    await user.click(download);
    await waitFor(() => expect(saved).toHaveLength(1));
    expect(saved[0].name).toBe("18test.json");
  });

  it("the game page underlines the keys of Edit Game and Download", async () => {
    renderApp("/games/18Test");
    const page = await screen.findByTestId("game-18Test");
    const edit = within(page).getByRole("link", { name: "Edit Game" });
    expect(edit.querySelector("u")).toHaveTextContent("E");
    const download = await within(page).findByRole("link", {
      name: "Download 18test.json",
    });
    expect(download.querySelector("u")).toHaveTextContent("D");
  });
});
