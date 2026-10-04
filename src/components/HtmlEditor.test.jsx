import { configureStore } from "@reduxjs/toolkit";
import { act, render } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import HtmlEditor from "@/components/HtmlEditor";

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
    expect(transform()).toMatch(/translate\(.*\) scale\(1\)/);
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

  it("renders the children untouched when printing", () => {
    const { container, editor } = setup("/?print=true");
    expect(editor).toBeNull();

    expect(container.firstElementChild.dataset.testid).toBe("content");
  });
});
