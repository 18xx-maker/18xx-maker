import { screen } from "@testing-library/react";

import { games } from "@/data";

import { renderApp } from "@tests/helpers.jsx";

// A capture window of the Electron app: render mode with the preload api
const api = vi.hoisted(() => {
  window.api = {};
  return window.api;
});

const caps = vi.hoisted(() => ({}));

vi.mock("@/util/capability", async (importOriginal) => {
  Object.assign(caps, (await importOriginal()).default, { electron: true });
  return { default: caps };
});

vi.mock("@/util/renderInput", async () => {
  const { games: bundled } = await import("@/data");
  const { renderGame } = await import("../src/export/render.js");
  const input = {
    id: "18Test",
    game: renderGame(bundled["18Test"], "18Test"),
    config: {},
  };
  return { getRenderInput: () => input };
});

// A capture window is only given the game it shows, none of the app's calls
// but the one that must stay out of reach
beforeEach(() => {
  for (const key of Object.keys(api)) delete api[key];
  api.addRecent = vi.fn();
});

describe("a capture window", () => {
  it("does not add its game to the recent files", async () => {
    expect(games["18Test"]).toBeDefined();
    renderApp("/games/render:18Test/");
    await screen.findByTestId("game-render:18Test");

    expect(api.addRecent).not.toHaveBeenCalled();
  });
});
