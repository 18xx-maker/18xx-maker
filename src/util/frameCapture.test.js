import { beforeEach, describe, expect, it } from "vitest";

import { resetWindow } from "../../tests/support/windowStub.js";
import { serializeSvg } from "../export/svg.js";
import { exposeFrameCapture } from "./frameCapture.js";

describe("exposeFrameCapture", () => {
  beforeEach(() => {
    resetWindow();
    delete window.__EXPORT_SVG__;
    delete globalThis.frameElement;
  });

  it("gives the parent the capture in the iframe of a web export", () => {
    window.frameElement = { __RENDER_INPUT__: {} };
    exposeFrameCapture();
    expect(window.__EXPORT_SVG__).toBe(serializeSvg);
  });

  it("does nothing in a page that is not one", () => {
    window.frameElement = {};
    exposeFrameCapture();
    expect(window.__EXPORT_SVG__).toBeUndefined();
  });
});
