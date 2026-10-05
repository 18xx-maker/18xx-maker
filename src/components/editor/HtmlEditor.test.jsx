import { configureStore } from "@reduxjs/toolkit";
import { act, render } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import HtmlEditor from "@/components/editor/HtmlEditor";

import { TOOLBAR_INSET } from "@/hooks/usePanZoom";
import { initialState, rootReducer } from "@/state";

const fire = (el, type, init) =>
  act(() => {
    el.dispatchEvent(
      new (type === "wheel" ? WheelEvent : PointerEvent)(type, {
        bubbles: true,
        cancelable: true,
        pointerId: 1,
        button: 0,
        ...init,
      }),
    );
  });

const setup = (url = "/") => {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: initialState,
  });
  const { container } = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[url]}>
        <HtmlEditor>
          <div style={{ width: 400, height: 300 }} data-testid="content" />
        </HtmlEditor>
      </MemoryRouter>
    </Provider>,
  );
  // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
  const editor = container.querySelector("#editor");
  return {
    container,
    editor,
    transform: () => editor.firstElementChild.style.transform,
  };
};

describe("HtmlEditor", () => {
  it("fits the content into the window to start", () => {
    const { transform } = setup();
    // Padded, so a little smaller than the window
    expect(transform()).toMatch(/translate\(.*\) scale\(0\.\d+\)/);
  });

  it("starts with the content below the toolbar", () => {
    const { transform } = setup();
    const y = Number(transform().match(/translate\([^,]*, ([^p]*)px\)/)[1]);
    expect(y).toBeGreaterThanOrEqual(TOOLBAR_INSET - 0.5);
  });

  it("pans while the primary button is held", () => {
    const { editor, transform } = setup();
    const before = transform();
    fire(editor, "pointerdown", { clientX: 100, clientY: 100, buttons: 1 });
    fire(editor, "pointermove", { clientX: 150, clientY: 100, buttons: 1 });
    expect(transform()).not.toBe(before);
  });

  it("zooms with the wheel and resets with v", () => {
    const { editor, transform } = setup();
    const before = transform();
    fire(editor, "wheel", { deltaY: -200 });
    expect(transform()).not.toBe(before);
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "v" }));
    });
    expect(transform()).toBe(before);
  });

  it("zooms in when two fingers pinch apart", () => {
    const { editor, transform } = setup();
    const scale = () => Number(transform().match(/scale\(([^)]*)\)/)[1]);
    // Start zoomed out so there is room to zoom in
    fire(editor, "wheel", { deltaY: 400 });
    const before = scale();
    fire(editor, "pointerdown", {
      pointerId: 1,
      clientX: 100,
      clientY: 100,
      buttons: 1,
    });
    fire(editor, "pointerdown", {
      pointerId: 2,
      clientX: 200,
      clientY: 100,
      buttons: 1,
    });
    fire(editor, "pointermove", {
      pointerId: 2,
      clientX: 300,
      clientY: 100,
      buttons: 1,
    });
    expect(scale()).toBeGreaterThan(before);
    fire(editor, "pointermove", {
      pointerId: 2,
      clientX: 150,
      clientY: 100,
      buttons: 1,
    });
    expect(scale()).toBeLessThan(before * 2);
  });

  it("wraps floated pages instead of laying them in one line", () => {
    const store = configureStore({
      reducer: rootReducer,
      preloadedState: initialState,
    });
    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <HtmlEditor>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} style={{ float: "left", width: 300, height: 400 }} />
            ))}
          </HtmlEditor>
        </MemoryRouter>
      </Provider>,
    );
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const content = container.querySelector("#editor").firstElementChild;
    expect(content.offsetWidth).toBeLessThan(6 * 300);
    expect(content.offsetHeight).toBeGreaterThan(400);
  });

  it("starts on the first page with padding around it", () => {
    const store = configureStore({
      reducer: rootReducer,
      preloadedState: initialState,
    });
    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <HtmlEditor page=".sheet">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="sheet"
                style={{ float: "left", width: 4000, height: 3000 }}
              />
            ))}
          </HtmlEditor>
        </MemoryRouter>
      </Provider>,
    );
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const editor = container.querySelector("#editor");
    // eslint-disable-next-line testing-library/no-node-access
    const content = editor.firstElementChild;
    // eslint-disable-next-line testing-library/no-node-access
    const first = content.querySelector(".sheet").getBoundingClientRect();
    const box = editor.getBoundingClientRect();
    expect(first.width).toBeLessThan(box.width);
    expect(first.height).toBeLessThan(box.height);
    // Padding on every side, centered below the toolbar
    expect(first.left - box.left).toBeGreaterThan(0);
    expect(box.right - first.right).toBeCloseTo(first.left - box.left, 0);
    expect(first.top - box.top).toBeGreaterThanOrEqual(TOOLBAR_INSET - 0.5);
    expect(box.bottom - first.bottom).toBeGreaterThan(0);
  });

  it("starts on the first `count` pages together", () => {
    const store = configureStore({
      reducer: rootReducer,
      preloadedState: initialState,
    });
    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <HtmlEditor page=".sheet" count={2}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="sheet"
                style={{ float: "left", width: 4000, height: 3000 }}
              />
            ))}
          </HtmlEditor>
        </MemoryRouter>
      </Provider>,
    );
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const box = container.querySelector("#editor").getBoundingClientRect();
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const sheets = [...container.querySelectorAll(".sheet")].map((el) =>
      el.getBoundingClientRect(),
    );
    // The two pages together are centered below the toolbar
    const top = sheets[0].top - box.top;
    const bottom = box.bottom - sheets[1].bottom;
    expect(top).toBeGreaterThanOrEqual(TOOLBAR_INSET - 0.5);
    expect(sheets[1].bottom).toBeLessThan(box.bottom);
    expect(top - TOOLBAR_INSET).toBeCloseTo(bottom, 0);
  });

  it("renders the children untouched when printing", () => {
    const { container, editor } = setup("/?print=true");
    expect(editor).toBeNull();

    expect(container.firstElementChild.dataset.testid).toBe("content");
  });
});
