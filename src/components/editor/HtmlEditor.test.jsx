import { configureStore } from "@reduxjs/toolkit";
import { act, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";

import HtmlEditor from "@/components/editor/HtmlEditor";

import { TOOLBAR_INSET } from "@/hooks/usePanZoom";
import { initialState, rootReducer } from "@/state";

import { MemoryRouter } from "@tests/support/memoryRouter.jsx";

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
  const { container, unmount } = render(
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
    unmount,
    editor,
    transform: () => editor.firstElementChild.style.transform,
  };
};

describe("HtmlEditor", () => {
  it("locks the page scroll and puts a scrolled editor back", async () => {
    const { editor } = setup();
    expect(document.documentElement).toHaveStyle({ overflow: "hidden" });
    await act(async () => {
      Object.assign(editor.style, { height: "100px", overflow: "hidden" });
      editor.firstElementChild.style.height = "5000px";
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    editor.scrollTop = 40;
    expect(editor.scrollTop).toBe(40);
    await vi.waitFor(() => expect(editor.scrollTop).toBe(0));
  });

  it("unlocks the page scroll when it goes away", () => {
    const { unmount } = setup();
    unmount();
    expect(document.documentElement).not.toHaveStyle({ overflow: "hidden" });
  });

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

  it("zooms a pinch around the point between the fingers", () => {
    const { editor, transform } = setup();
    const view = () => {
      const [, x, y, scale] = transform().match(
        /translate\(([^p]*)px, ([^p]*)px\) scale\(([^)]*)\)/,
      );
      return { x: Number(x), y: Number(y), scale: Number(scale) };
    };
    fire(editor, "wheel", { deltaY: 400 });
    const rect = editor.getBoundingClientRect();
    const pointer = (pointerId, type, x) =>
      fire(editor, type, {
        pointerId,
        clientX: rect.left + x,
        clientY: rect.top + 200,
        buttons: 1,
      });
    const start = view();
    pointer(1, "pointerdown", 100);
    pointer(2, "pointerdown", 200);
    pointer(2, "pointermove", 300);
    const end = view();
    expect(end.scale).toBeGreaterThan(start.scale);
    // The content under the middle of the fingers (150) follows it to 200
    expect((200 - end.x) / end.scale).toBeCloseTo(
      (150 - start.x) / start.scale,
      6,
    );
  });

  it("forgets a finger when the window loses focus", () => {
    const { editor, transform } = setup();
    fire(editor, "pointerdown", {
      pointerId: 1,
      clientX: 10,
      clientY: 10,
      buttons: 1,
    });
    act(() => {
      window.dispatchEvent(new Event("blur"));
    });
    const before = transform();
    fire(editor, "pointermove", {
      pointerId: 1,
      clientX: 50,
      clientY: 10,
      buttons: 1,
    });
    expect(transform()).toBe(before);
  });

  it("wraps floated pages instead of laying them in one line", async () => {
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
    // The editor has no height of its own without the stylesheet, so the
    // refit after the first measure changes the view, let it settle
    await act(() => new Promise((resolve) => setTimeout(resolve, 50)));
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

  describe("reveal", () => {
    // A target placed in the content, a panel over the right 40% of the view
    const open = (left, top) => {
      const panel = document.createElement("div");
      panel.setAttribute("data-edit-panel", "");
      document.body.append(panel);
      const store = configureStore({
        reducer: rootReducer,
        preloadedState: initialState,
      });
      const { container } = render(
        <Provider store={store}>
          <MemoryRouter>
            <HtmlEditor>
              <div style={{ width: 400, height: 300, position: "relative" }}>
                <div
                  data-testid="target"
                  style={{
                    position: "absolute",
                    left,
                    top,
                    width: 20,
                    height: 20,
                  }}
                />
              </div>
            </HtmlEditor>
          </MemoryRouter>
        </Provider>,
      );
      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
      const editor = container.querySelector("#editor");
      const area = editor.getBoundingClientRect();
      Object.assign(panel.style, {
        position: "fixed",
        top: 0,
        bottom: 0,
        right: 0,
        width: `${area.width * 0.4}px`,
      });
      const target = screen.getByTestId("target");
      return {
        editor,
        target,
        panel,
        reveal: () =>
          act(() => {
            target.dispatchEvent(new Event("reveal", { bubbles: true }));
          }),
        transform: () => editor.firstElementChild.style.transform,
        ok: () => {
          const box = target.getBoundingClientRect();
          const a = editor.getBoundingClientRect();
          const p = panel.getBoundingClientRect();
          return (
            box.left >= a.left &&
            box.right <= p.left &&
            box.top >= a.top &&
            box.bottom <= a.bottom
          );
        },
      };
    };
    afterEach(() => {
      document
        // eslint-disable-next-line testing-library/no-node-access
        .querySelectorAll("[data-edit-panel]")
        .forEach((el) => el.remove());
    });

    it("pans a target outside the window into view", () => {
      const view = open(-5000, 100);
      const before = view.transform();
      expect(view.ok()).toBe(false);
      view.reveal();
      expect(view.transform()).not.toBe(before);
      expect(view.ok()).toBe(true);
    });

    it("leaves a target in view where it is", () => {
      const view = open(10, 100);
      view.reveal();
      expect(view.ok()).toBe(true);
      const before = view.transform();
      view.reveal();
      expect(view.transform()).toBe(before);
    });

    it("pans a target under the edit panel clear of it", () => {
      const view = open(10, 100);
      const p = view.panel.getBoundingClientRect();
      // Drag the content so the target sits under the panel
      const target = view.target.getBoundingClientRect();
      const x = target.left;
      fire(view.editor, "pointerdown", {
        clientX: x,
        clientY: 200,
        buttons: 1,
      });
      fire(view.editor, "pointermove", {
        clientX: p.left + 20,
        clientY: 200,
        buttons: 1,
      });
      fire(view.editor, "pointerup", {
        clientX: p.left + 20,
        clientY: 200,
        buttons: 0,
      });
      expect(view.target.getBoundingClientRect().left).toBeGreaterThan(p.left);
      view.reveal();
      expect(view.ok()).toBe(true);
    });
  });

  it("renders the children untouched when printing", () => {
    const { container, editor } = setup("/?print=true");
    expect(editor).toBeNull();

    expect(container.firstElementChild.dataset.testid).toBe("content");
  });
});
