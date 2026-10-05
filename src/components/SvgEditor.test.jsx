import { configureStore } from "@reduxjs/toolkit";
import { act, render } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import SvgEditor from "@/components/SvgEditor";

import { TOOLBAR_INSET } from "@/hooks/usePanZoom";
import { initialState, rootReducer } from "@/state";

const fire = (el, type, init) =>
  act(() => {
    el.dispatchEvent(
      new PointerEvent(type, {
        bubbles: true,
        pointerId: 1,
        button: 0,
        ...init,
      }),
    );
  });

const setup = (padding) => {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: initialState,
  });
  const { container } = render(
    <Provider store={store}>
      <MemoryRouter>
        <SvgEditor width={1000} height={800} padding={padding}>
          <rect width="10" height="10" />
        </SvgEditor>
      </MemoryRouter>
    </Provider>,
  );
  // The editor svg has no role or label to query by
  // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
  const svg = container.querySelector("svg");
  return { svg, box: () => svg.getAttribute("viewBox") };
};

describe("SvgEditor start view", () => {
  it("starts with the content below the toolbar", () => {
    const { box } = setup();
    const [, y, , h] = box().split(" ").map(Number);
    // The top of the content (0) is TOOLBAR_INSET pixels or more below the
    // top of the window
    const scale = window.innerHeight / h;
    expect(-y * scale).toBeGreaterThanOrEqual(TOOLBAR_INSET - 0.5);
  });
});

describe("SvgEditor padding", () => {
  it("keeps space free on every side of the content", () => {
    const { box } = setup(0.08);
    const [x, y, w, h] = box().split(" ").map(Number);
    const scale = window.innerWidth / w;
    // The content is 1000 x 800, each side keeps 8% of it free
    const inset = Math.min(TOOLBAR_INSET, window.innerHeight / 4);
    expect(-x * scale).toBeGreaterThan(0);
    expect((x + w - 1000) * scale).toBeGreaterThan(0);
    expect(-y * scale).toBeGreaterThanOrEqual(inset);
    expect((y + h - 800) * scale).toBeGreaterThan(0);
  });
});

describe("SvgEditor panning", () => {
  it("pans while the primary button is held", () => {
    const { svg, box } = setup();
    const before = box();
    fire(svg, "pointerdown", { clientX: 100, clientY: 100, buttons: 1 });
    fire(svg, "pointermove", { clientX: 150, clientY: 100, buttons: 1 });
    expect(box()).not.toBe(before);
  });

  it("ignores a drag that did not start on the svg", () => {
    const { svg, box } = setup();
    const before = box();
    fire(svg, "pointermove", { clientX: 900, clientY: 700, buttons: 1 });
    expect(box()).toBe(before);
  });

  it("does not jump after a quick click and a move", () => {
    const { svg, box } = setup();
    fire(svg, "pointerdown", { clientX: 10, clientY: 10, buttons: 1 });
    fire(svg, "pointerup", { clientX: 10, clientY: 10, buttons: 0 });
    const before = box();
    fire(svg, "pointermove", { clientX: 800, clientY: 600, buttons: 1 });
    expect(box()).toBe(before);
  });

  it("ignores a second pointer", () => {
    const { svg, box } = setup();
    fire(svg, "pointerdown", { clientX: 10, clientY: 10, buttons: 1 });
    const before = box();
    fire(svg, "pointermove", {
      pointerId: 2,
      clientX: 800,
      clientY: 600,
      buttons: 1,
    });
    expect(box()).toBe(before);
  });
});
