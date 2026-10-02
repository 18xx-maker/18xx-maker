import { act, screen, waitFor, within } from "@testing-library/react";

import { games } from "@/data";
import { useConfig } from "@/hooks";
import { createAlert } from "@/state";

import { mountElement } from "@tests/coverage.render.jsx";
import { renderApp } from "@tests/helpers.jsx";

// Headless render mode: the page is given the game and config. The input is
// read when the modules load, so it is set before them.
const holder = vi.hoisted(() => ({ input: undefined }));

vi.mock("@/util/renderInput", async () => {
  const { games: bundled } = await import("@/data");
  const { renderGame } = await import("../src/export/render.js");
  holder.input = {
    id: "18Test",
    game: renderGame(bundled["18Test"], "18Test"),
    config: { paper: { width: 111 } },
  };
  return { getRenderInput: () => holder.input };
});

const renderState = () => document.body.dataset.renderState;

beforeEach(() => {
  delete document.body.dataset.renderState;
});

describe("render mode page", () => {
  it("is ready when the given game is shown", async () => {
    renderApp("/games/render:18Test/background");

    await waitFor(() => expect(renderState()).toBe("ready"));
    expect(
      await screen.findByTestId("game-render:18Test-background"),
    ).toBeInTheDocument();
  });

  it("is ready after the text of the background is measured", async () => {
    renderApp("/games/render:18Test/background");
    await waitFor(() => expect(renderState()).toBe("ready"));

    // eslint-disable-next-line testing-library/no-node-access
    const count = () => document.querySelectorAll("text").length;
    const ready = count();
    await act(() => new Promise((resolve) => setTimeout(resolve, 200)));

    // The text is repeated over the page as often as its measure says
    expect(ready).toBeGreaterThan(2);
    expect(count()).toBe(ready);
  });

  it("is empty when the page redirects because the game has no data", async () => {
    holder.input = {
      ...holder.input,
      game: { ...holder.input.game, map: undefined },
    };
    const { router } = renderApp("/games/render:18Test/map");

    await waitFor(() => expect(renderState()).toBe("empty"));
    expect(router.state.location.pathname).toBe("/games/render:18Test/");
  });

  it("is empty for a game it was not given", async () => {
    const { router } = renderApp("/games/render:other/map");

    await waitFor(() => expect(renderState()).toBe("empty"));
    expect(router.state.location.pathname).toBe("/games/");
  });

  it("has no sidebar and shows no alerts", async () => {
    const { store } = renderApp("/games/render:18Test/");
    await screen.findByTestId("game-render:18Test");

    act(() => store.dispatch(createAlert("Saved", "All done", "success")));

    expect(screen.queryByText("All done")).not.toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-node-access
    expect(document.querySelector("[data-sidebar]")).toBeNull();
  });
});

const Paper = () => {
  const { config, defaultConfig } = useConfig();
  return (
    <div>
      <span data-testid="width">{config.paper.width}</span>
      <span data-testid="height">{config.paper.height}</span>
      <span data-testid="default-height">{defaultConfig.paper.height}</span>
    </div>
  );
};

describe("render mode config", () => {
  const paper = async (options) => {
    const { root } = await mountElement(<Paper />, options);
    const text = (id) => within(root).getByTestId(id).textContent;
    return {
      width: Number(text("width")),
      height: Number(text("height")),
      defaultHeight: Number(text("default-height")),
    };
  };

  it("uses the given layers instead of the config built into the page", async () => {
    const { width, height, defaultHeight } = await paper();

    expect(width).toBe(111);
    // What is not given stays as it is in the defaults
    expect(height).toBe(defaultHeight);
  });

  it("has URL parameters over the given config", async () => {
    expect((await paper({ search: "?config.paper.width=222" })).width).toBe(
      222,
    );
  });

  it("has the config of the game over URL parameters", async () => {
    const { width } = await paper({
      search: "?config.paper.width=222",
      game: { ...games["18Test"], config: { paper: { width: 333 } } },
    });

    expect(width).toBe(333);
  });
});
