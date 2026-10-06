import { configureStore } from "@reduxjs/toolkit";
import { act, render } from "@testing-library/react";
import { useContext, useEffect } from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import SvgEditor from "@/components/editor/SvgEditor";

import TapContext from "@/context/TapContext";
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

// Gives the taps of the editor to the function
const Taps = ({ onTap }) => {
  const tap = useContext(TapContext);
  useEffect(() => {
    tap.current = onTap;
    return () => {
      tap.current = null;
    };
  }, [tap, onTap]);
  return <rect width="10" height="10" />;
};

const setup = (padding, onTap = () => {}) => {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: initialState,
  });
  const tree = (width = 1000, height = 800) => (
    <Provider store={store}>
      <MemoryRouter>
        <SvgEditor width={width} height={height} padding={padding}>
          <Taps onTap={onTap} />
        </SvgEditor>
      </MemoryRouter>
    </Provider>
  );
  const { container, rerender } = render(tree());
  // The editor svg has no role or label to query by
  // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
  const svg = container.querySelector("svg");
  return {
    svg,
    box: () => svg.getAttribute("viewBox"),
    resize: (width, height) => rerender(tree(width, height)),
  };
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

describe("SvgEditor pinch", () => {
  it("zooms around the point between the fingers", () => {
    const { svg, box } = setup();
    const rect = svg.getBoundingClientRect();
    const pointer = (pointerId, type, x) =>
      fire(svg, type, {
        pointerId,
        clientX: rect.left + x,
        clientY: rect.top + 300,
        buttons: 1,
      });
    const parse = () => box().split(" ").map(Number);
    const [x0, , w0] = parse();
    pointer(1, "pointerdown", 100);
    pointer(2, "pointerdown", 200);
    pointer(2, "pointermove", 300);
    const [x1, , w1] = parse();
    expect(w1).toBeLessThan(w0);
    // The content under the middle of the fingers (150) follows it to 200
    const width = window.innerWidth;
    expect(x1 + (200 / width) * w1).toBeCloseTo(x0 + (150 / width) * w0, 6);
  });

  it("forgets a finger when the window loses focus", () => {
    const { svg, box } = setup();
    fire(svg, "pointerdown", { clientX: 10, clientY: 10, buttons: 1 });
    act(() => {
      window.dispatchEvent(new Event("blur"));
    });
    const before = box();
    fire(svg, "pointermove", { clientX: 50, clientY: 10, buttons: 1 });
    expect(box()).toBe(before);
  });
});

describe("SvgEditor content size", () => {
  it("fits an untouched view to the new size", () => {
    const { box, resize } = setup();
    const before = box();
    resize(2000, 1600);
    expect(box()).not.toBe(before);
  });

  it("keeps a view that was moved when the content gets bigger", () => {
    const { svg, box, resize } = setup();
    fire(svg, "pointerdown", { clientX: 100, clientY: 100, buttons: 1 });
    fire(svg, "pointermove", { clientX: 150, clientY: 100, buttons: 1 });
    fire(svg, "pointerup", { clientX: 150, clientY: 100, buttons: 0 });
    const moved = box();
    resize(2000, 1600);
    expect(box()).toBe(moved);
  });

  it("keeps the same svg", () => {
    const { svg, resize } = setup();
    resize(2000, 1600);
    // eslint-disable-next-line testing-library/no-node-access
    expect(document.querySelector("svg")).toBe(svg);
  });
});

describe("SvgEditor taps", () => {
  const down = { clientX: 100, clientY: 100, buttons: 1 };

  it("gives the content the element the pointer went down on", () => {
    const onTap = vi.fn();
    const { svg } = setup(0, onTap);
    // eslint-disable-next-line testing-library/no-node-access
    const rect = svg.querySelector("rect");
    fire(rect, "pointerdown", down);
    fire(svg, "pointerup", { ...down, clientX: 102, buttons: 0 });
    expect(onTap).toHaveBeenCalledTimes(1);
    expect(onTap.mock.calls[0][0]).toBe(rect);
    expect(onTap.mock.calls[0][1].type).toBe("pointerup");
  });

  it("is not a tap after a drag, even one back to the start", () => {
    const onTap = vi.fn();
    const { svg } = setup(0, onTap);
    fire(svg, "pointerdown", down);
    fire(svg, "pointermove", { ...down, clientX: 140 });
    fire(svg, "pointermove", down);
    fire(svg, "pointerup", { ...down, buttons: 0 });
    expect(onTap).not.toHaveBeenCalled();
  });

  it("is not a tap of a cancelled pointer or with two pointers", () => {
    const onTap = vi.fn();
    const { svg } = setup(0, onTap);
    fire(svg, "pointerdown", down);
    fire(svg, "pointercancel", { ...down, buttons: 0 });
    fire(svg, "pointerdown", down);
    fire(svg, "pointerdown", { ...down, pointerId: 2 });
    fire(svg, "pointerup", { ...down, pointerId: 2, buttons: 0 });
    fire(svg, "pointerup", { ...down, buttons: 0 });
    expect(onTap).not.toHaveBeenCalled();
  });

  it("is not a tap of a button other than the primary one", () => {
    const onTap = vi.fn();
    const { svg } = setup(0, onTap);
    fire(svg, "pointerdown", { ...down, button: 2 });
    fire(svg, "pointerup", { ...down, button: 2, buttons: 0 });
    expect(onTap).not.toHaveBeenCalled();
  });
});
