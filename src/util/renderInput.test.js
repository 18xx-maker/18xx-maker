import { runInNewContext } from "node:vm";

import { beforeEach, describe, expect, it, vi } from "vitest";

import * as R from "ramda";

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

  it("rebuilds the input of the frame element in its own realm", async () => {
    // The parent's arrays are not this window's Array (R.is(Array) is false)
    window.frameElement = {
      __RENDER_INPUT__: runInNewContext(`({
        id: "x",
        game: { info: { title: "Frame" }, stock: { market: [[{ arrow: ["up", "left"] }]] } },
        config: {},
      })`),
    };
    const getRenderInput = await load();
    const { market } = getRenderInput().game.stock;
    expect(market[0][0].arrow).toBeInstanceOf(Array);
    expect(R.is(Array, market)).toBe(true);
    expect(R.is(Array, market[0][0].arrow)).toBe(true);
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
