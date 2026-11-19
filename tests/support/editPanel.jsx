import { screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";
import { page as browser } from "vitest/browser";

import games from "@/data/games";

import { renderApp } from "@tests/support/helpers.jsx";

// An editable game with a saved original, so changes are known
export let opened;

// An edit starts the check of the game in the background: let it end inside
// the test, its result updates the panel
export const settled = () =>
  waitFor(() => {
    if (opened.getState().gameProblems.status === "running") {
      throw new Error("still checking the game");
    }
  });

// Call at the top level of every edit panel test file
export const registerEditPanelHooks = () => {
  afterEach(async () => {
    if (opened) await settled();
    opened = undefined;
  });

  beforeEach(async () => {
    await browser.viewport(1280, 900);
  });
};

export const open = (route, base = games["18Test"]) => {
  const game = {
    ...structuredClone(base),
    meta: { id: "abc", type: "internal", slug: "internal:abc" },
  };
  const view = renderApp(route, {
    game,
    gameOriginal: structuredClone(game),
    gameHistory: [],
    loadedGame: { slug: game.meta.slug, title: game.info.title, id: "abc" },
  });
  opened = view.store;
  return view;
};

export const route = "/games/internal:abc/map";
export const panel = () => screen.findByTestId("edit-panel");
export const field = (name) => screen.findByRole("textbox", { name });

export const trains = (store) => store.getState().game.trains;
export const names = (store) => trains(store).map((train) => train.name);
export const cards = () =>
  within(screen.getByTestId("edit-panel")).getAllByRole("listitem");
export const button = (name) => screen.getByRole("button", { name });
export const trainsRoute = `${route}?edit=true&editSection=trains`;
