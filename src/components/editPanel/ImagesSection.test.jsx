import { configureStore } from "@reduxjs/toolkit";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";

import { editSections } from "@/components/editPanel/sections";

import { games } from "@/data";
import { createSetGame, loadAssets, rootReducer } from "@/state";
import { pngDataUri } from "@/util/assetNames";
import * as assetStore from "@/util/storage/assets";

import { pngFile, svgFile } from "@tests/support/drop.js";
import { makePng } from "@tests/support/png.js";

// The section is loaded through the list that holds it: its imports lead back
// to that list
const { Form: ImagesSection } = editSections.find(
  ({ section }) => section === "images",
);

const SVG = '<svg viewBox="0 0 10 10"><path d="M0 0h5v5z"/></svg>';
const SLUG = "internal:images-section";

const gameOf = (type, game = games["18Test"]) => ({
  ...game,
  meta: {
    id: "images-section",
    type,
    slug: type === "bundled" ? "18Test" : `${type}:images-section`,
  },
});

// The section for a game on screen, with the images already stored
const setup = async ({ type = "internal", stored = {} } = {}) => {
  const game = gameOf(type);
  for (const [kind, names] of Object.entries(stored)) {
    for (const name of names) {
      await assetStore.putAsset(
        SLUG,
        kind,
        name,
        kind === "trains" ? pngDataUri(makePng()) : SVG,
      );
    }
  }
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefault) => getDefault({ serializableCheck: false }),
  });
  store.dispatch(createSetGame(game));
  await store.dispatch(loadAssets(game.meta));
  const user = userEvent.setup();
  render(
    <Provider store={store}>
      <ImagesSection game={game} />
    </Provider>,
  );
  return { store, user };
};

const keys = (store, kind) =>
  Object.keys(store.getState().assets[SLUG]?.[kind] ?? {}).sort();
const lastAlert = (store) => store.getState().alert.items.at(-1);

afterEach(async () => {
  await assetStore.deleteAssets(SLUG);
});

describe("ImagesSection", () => {
  it("adds SVG files as the chosen kind and PNG files as train images", async () => {
    const { store, user } = await setup();

    await user.selectOptions(
      screen.getByLabelText("Add SVG files as"),
      "logos",
    );
    await user.upload(screen.getByTestId("images-upload"), [
      svgFile("crest.svg"),
      pngFile(makePng(), "loco.png"),
    ]);

    await waitFor(() => expect(keys(store, "trains")).toEqual(["loco"]));
    expect(keys(store, "logos")).toEqual(["crest"]);
    expect(keys(store, "icons")).toEqual([]);
    expect(screen.getByText("custom/crest")).toBeInTheDocument();
    expect(screen.getByText("custom/loco")).toBeInTheDocument();
    expect(lastAlert(store)).toMatchObject({ type: "success" });
  });

  it("numbers a name that is taken and reports a file that is not an image", async () => {
    const { store, user } = await setup({ stored: { icons: ["star"] } });

    await user.upload(screen.getByTestId("images-upload"), [
      svgFile("star.svg"),
      svgFile("broken.svg", "<svg"),
    ]);

    await waitFor(() =>
      expect(keys(store, "icons")).toEqual(["star", "star-2"]),
    );
    await waitFor(() => expect(lastAlert(store)).toBeDefined());
    expect(lastAlert(store)).toMatchObject({
      type: "warning",
      title: "Some images were added",
    });
    expect(lastAlert(store).message).toMatch(/^broken\.svg: /);
  });

  it("renames an image and refuses an invalid or taken name", async () => {
    const { store, user } = await setup({ stored: { icons: ["a", "b"] } });
    await user.click(screen.getByRole("button", { name: "Rename custom/a" }));
    const input = screen.getByRole("textbox", { name: "Rename custom/a" });
    const save = async (to) => {
      await user.clear(input);
      await user.type(input, to);
      await user.click(screen.getByRole("button", { name: "Save" }));
    };

    await save("bad name!");
    expect(lastAlert(store)).toMatchObject({
      type: "error",
      title: "bad name! was not changed",
    });

    await save("B");
    await waitFor(() =>
      expect(lastAlert(store).message).toBe("An image with this name exists."),
    );
    expect(keys(store, "icons")).toEqual(["a", "b"]);

    await save("c");
    await waitFor(() => expect(keys(store, "icons")).toEqual(["b", "c"]));
    expect(screen.getByText("custom/c")).toBeInTheDocument();
  });

  it("deletes an image that the game does not use at once", async () => {
    const { store, user } = await setup({ stored: { icons: ["spare"] } });

    await user.click(
      screen.getByRole("button", { name: "Delete custom/spare" }),
    );

    await waitFor(() => expect(keys(store, "icons")).toEqual([]));
  });

  it("asks twice before deleting an image the game uses", async () => {
    const { store, user } = await setup({ stored: { icons: ["star"] } });
    const row = screen
      .getAllByRole("listitem")
      .find((item) => within(item).queryByText("custom/star"));
    expect(
      within(row).getByText(/Used \d+ times? in the game/),
    ).toBeInTheDocument();

    await user.click(
      within(row).getByRole("button", { name: "Delete custom/star" }),
    );
    expect(keys(store, "icons")).toEqual(["star"]);

    await user.click(
      within(row).getByRole("button", { name: "Delete custom/star" }),
    );
    expect(within(row).queryByText("Delete anyway")).not.toBeInTheDocument();
    await waitFor(() => expect(keys(store, "icons")).toEqual([]));
  });

  it("has no controls and says why for a game of the desktop app", async () => {
    await setup({ type: "electron" });
    expect(
      screen.getByText(/\.assets folder next to the game file/),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Add images" }),
    ).not.toBeInTheDocument();
  });

  it("has no controls and says why for a bundled game", async () => {
    await setup({ type: "bundled" });
    expect(
      screen.getByText(/A bundled game cannot take images/),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("images-upload")).not.toBeInTheDocument();
  });
});
