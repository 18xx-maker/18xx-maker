import { beforeEach, describe, expect, it, vi } from "vitest";

import { resetWindow } from "../../tests/support/windowStub.js";

const game = { info: { title: "Frame" } };

const load = async () => (await import("@/util/renderInput")).getRenderInput;

describe("getRenderInput", () => {
  beforeEach(() => {
    vi.resetModules();
    resetWindow();
    delete globalThis.frameElement;
  });

  it("reads the input of the frame element", async () => {
    window.frameElement = { __RENDER_INPUT__: { id: "x", game, config: {} } };
    const getRenderInput = await load();
    expect(getRenderInput().game.meta.slug).toBe("render:x");
    expect(getRenderInput().config).toEqual({});
  });

  it("window input wins over the frame element", async () => {
    window.__RENDER_INPUT__ = { id: "w", game, config: {} };
    window.frameElement = { __RENDER_INPUT__: { id: "x", game, config: {} } };
    const getRenderInput = await load();
    expect(getRenderInput().game.meta.slug).toBe("render:w");
  });

  it("has no input without a window input or a frame element", async () => {
    const getRenderInput = await load();
    expect(getRenderInput()).toBeUndefined();
  });

  it("has no input in a frame that was not given one", async () => {
    window.frameElement = {};
    const getRenderInput = await load();
    expect(getRenderInput()).toBeUndefined();
  });
});
