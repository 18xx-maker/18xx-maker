import { unfoldAll } from "@codemirror/language";
import { EditorView } from "@codemirror/view";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider, createMemoryRouter } from "react-router";
import { page as browser } from "vitest/browser";

import { sections as configSections } from "@/components/config";

import games from "@/data/games";
import { useBooleanParam, useStringParam } from "@/util/query";

import { renderApp } from "@tests/support/helpers.jsx";

// Deep links: the lines param of the JSON editor and the other parts of the
// url (section, panels, tabs, filters)

let opened;

// The editor, the edit panel and the game check load on demand. Loaded once
// here, they resolve in the same tick as the render that asks for them and not
// at a random time outside act
beforeAll(async () => {
  await Promise.all([
    import("@/components/editPanel/EditPanel"),
    import("@/components/editPanel/JsonEditor"),
    import("@/util/gameValidation"),
  ]);
});

// The game is checked in the background and the result lands on the editor:
// wait for it inside act, so no test ends with an update in flight
afterEach(async () => {
  if (opened) {
    const store = opened;
    opened = undefined;
    await act(async () => {
      while (store.getState().gameProblems.status === "running") {
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
    });
  }
});

const open = (route, options) => {
  const game = {
    ...structuredClone(games["18Test"]),
    meta: { id: "abc", type: "internal", slug: "internal:abc" },
  };
  const view = renderApp(
    route,
    {
      game,
      gameOriginal: structuredClone(game),
      gameHistory: [],
      loadedGame: { slug: game.meta.slug, title: game.info.title, id: "abc" },
    },
    options,
  );
  opened = view.store;
  return view;
};

const route = "/games/internal:abc/map";
const jsonRoute = `${route}?edit=true&editSection=json`;

// The check of the game dispatches to the store, which updates the editor:
// let it settle before the test goes on, or it lands outside of act
const checked = () =>
  waitFor(() => {
    if (opened.getState().gameProblems.status !== "done") {
      throw new Error("not checked yet");
    }
  });

const view = async () => {
  const host = await screen.findByTestId("json-editor");
  await checked();
  return waitFor(() => {
    const found = EditorView.findFromDOM(host);
    if (!found) throw new Error("no editor yet");
    return found;
  });
};

// eslint-disable-next-line testing-library/no-node-access
const all = (v, selector) => [...v.dom.querySelectorAll(selector)];

// The numbers of the lines and of the line numbers with the selected class
const selected = (v) => ({
  text: all(v, ".cm-line.cm-selected-line").map(
    (el) => v.state.doc.lineAt(v.posAtDOM(el)).number,
  ),
  gutter: all(v, ".cm-gutterElement.cm-selected-gutter")
    .map((el) => el.textContent)
    .filter((text) => /^\d+$/.test(text))
    .map(Number),
});

const mod = /Mac/.test(navigator.platform)
  ? { metaKey: true }
  : { ctrlKey: true };

// A mouse down on the line number, as the editor gets it
const gutterClick = async (v, line, modifiers = {}) => {
  // The editor starts folded, the line may be inside a fold
  unfoldAll(v);
  v.dispatch({
    effects: EditorView.scrollIntoView(v.state.doc.line(line).from),
  });
  // Let the editor measure the unfolded lines, or it maps the click to a line
  // of the folded layout
  await act(
    () =>
      new Promise((resolve) => {
        v.requestMeasure({ read: () => null, write: () => resolve() });
      }),
  );
  const element = await waitFor(() => {
    const found = all(v, ".cm-lineNumbers .cm-gutterElement").find(
      (el) => el.textContent === String(line),
    );
    if (!found) throw new Error(`line ${line} not drawn`);
    return found;
  });
  const rect = element.getBoundingClientRect();
  act(() => {
    element.dispatchEvent(
      new MouseEvent("mousedown", {
        bubbles: true,
        cancelable: true,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
        ...modifiers,
      }),
    );
  });
};

let style;

beforeEach(async () => {
  await browser.viewport(1280, 900);
  // The tests do not load the app's css: give the editor the height the panel
  // gives it, so it scrolls
  style = document.createElement("style");
  style.textContent = '[data-testid="json-editor"] { height: 400px; }';
  document.head.append(style);
});

afterEach(() => style.remove());

describe("lines of the json editor", () => {
  it("highlights the lines of the link, with line numbers", async () => {
    const { router } = open(`${jsonRoute}&lines=1-4,15,16,19`);
    const v = await view();
    await waitFor(() =>
      expect(selected(v).text).toEqual([1, 2, 3, 4, 15, 16, 19]),
    );
    expect(selected(v).gutter).toEqual([1, 2, 3, 4, 15, 16, 19]);
    expect(all(v, ".cm-lineNumbers")[0] ?? null).not.toBeNull();
    // Links are not rewritten on landing
    expect(router.state.location.search).toBe(
      "?edit=true&editSection=json&lines=1-4,15,16,19",
    );
  });

  it("scrolls to the first line on landing and when the editor is remounted", async () => {
    const { user, router } = open(`${jsonRoute}&lines=300-302`);
    const v = await view();
    await waitFor(() => expect(v.scrollDOM.scrollTop).toBeGreaterThan(0));
    expect(selected(v).text).toEqual([300, 301, 302]);

    // A tab drops the lines, Back brings them and a new editor
    await user.click(screen.getByRole("tab", { name: "Game" }));
    await waitFor(() =>
      expect(screen.queryByTestId("json-editor")).not.toBeInTheDocument(),
    );
    expect(router.state.location.search).toBe("?edit=true");
    await act(() => router.navigate(-1));
    const again = await view();
    expect(again).not.toBe(v);
    await waitFor(() => expect(selected(again).text).toEqual([300, 301, 302]));
    await waitFor(() => expect(again.scrollDOM.scrollTop).toBeGreaterThan(0));
  });

  it("keeps the lines in strict mode", async () => {
    open(`${jsonRoute}&lines=3`, { strict: true });
    const v = await view();
    await waitFor(() => expect(selected(v).text).toEqual([3]));
  });

  it("does not move the lines when text is typed above them", async () => {
    open(`${jsonRoute}&lines=5`);
    const v = await view();
    await waitFor(() => expect(selected(v).text).toEqual([5]));
    v.dispatch({ changes: { from: 0, insert: "\n\n" } });
    await waitFor(() => expect(selected(v).text).toEqual([5]));
    expect(selected(v).gutter).toEqual([5]);
  });

  it("is cheap for a range of the whole file", async () => {
    const begin = performance.now();
    open(`${jsonRoute}&lines=1-999999`);
    const v = await view();
    await waitFor(() => expect(selected(v).text.length).toBeGreaterThan(5));
    // Only the lines in view are decorated
    expect(selected(v).text.length).toBeLessThan(v.state.doc.lines);
    expect(selected(v).text.length).toBeLessThan(200);
    expect(performance.now() - begin).toBeLessThan(3000);

    // A big document, then typing in it: the markers of the lines are moved,
    // not built again for every key
    v.dispatch({
      changes: { from: v.state.doc.length, insert: "\n".repeat(100_000) },
    });
    const typing = performance.now();
    for (let i = 0; i < 30; i++) {
      v.dispatch({ changes: { from: 0, insert: " " } });
    }
    expect(performance.now() - typing).toBeLessThan(1000);
    expect(selected(v).gutter).toContain(1);
    // Let the editor finish measuring before the test ends
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => requestAnimationFrame(resolve));
  });

  it("ignores garbage and lines past the end", async () => {
    const { router } = open(`${jsonRoute}&lines=a,0,-3,x-y,,99999999`);
    const v = await view();
    expect(selected(v).text).toEqual([]);
    // A spec wholly past the end does not scroll
    expect(v.scrollDOM.scrollTop).toBe(0);
    expect(router.state.location.search).toContain("lines=");
  });

  it("keeps the valid token among garbage", async () => {
    open(`${jsonRoute}&lines=a,0,3,99999999`);
    const v = await view();
    await waitFor(() => expect(selected(v).text).toEqual([3]));
  });

  it("selects with clicks on the line numbers, without history", async () => {
    const { user, router } = open(`${route}?edit=true`);
    await user.click(await screen.findByRole("tab", { name: "JSON" }));
    const v = await view();
    expect(router.state.historyAction).toBe("PUSH");

    await gutterClick(v, 3);
    await waitFor(() =>
      expect(router.state.location.search).toBe(
        "?edit=true&editSection=json&lines=3",
      ),
    );
    expect(router.state.historyAction).toBe("REPLACE");
    expect(selected(v).text).toEqual([3]);
    expect(selected(v).gutter).toEqual([3]);

    // Shift: from the first selected line
    await gutterClick(v, 6, { shiftKey: true });
    await waitFor(() => expect(router.state.location.search).toContain("=3-6"));
    expect(selected(v).text).toEqual([3, 4, 5, 6]);

    // The platform's modifier toggles a line
    await gutterClick(v, 10, mod);
    await waitFor(() =>
      expect(router.state.location.search).toContain("lines=3-6,10"),
    );
    await gutterClick(v, 4, mod);
    await waitFor(() =>
      expect(router.state.location.search).toContain("lines=3,5-6,10"),
    );
    // With shift it adds the range
    await gutterClick(v, 14, { shiftKey: true, ...mod });
    await waitFor(() =>
      expect(router.state.location.search).toContain("lines=3-14"),
    );
    expect(router.state.location.search).not.toContain("%2C");
    // A plain click starts again, on the only line it clears
    await gutterClick(v, 8);
    await waitFor(() => expect(selected(v).text).toEqual([8]));
    await gutterClick(v, 8);
    await waitFor(() =>
      expect(router.state.location.search).toBe("?edit=true&editSection=json"),
    );
    expect(selected(v).text).toEqual([]);
    expect(router.state.historyAction).toBe("REPLACE");
  });

  it("ignores the other buttons and the ctrl click of a Mac", async () => {
    const { router } = open(jsonRoute);
    const v = await view();
    await gutterClick(v, 3, { button: 2 });
    if (/Mac/.test(navigator.platform)) {
      await gutterClick(v, 4, { ctrlKey: true });
    }
    await act(() => new Promise((resolve) => setTimeout(resolve, 100)));
    expect(selected(v).text).toEqual([]);
    expect(router.state.location.search).toBe("?edit=true&editSection=json");
    await gutterClick(v, 3);
    await waitFor(() => expect(selected(v).text).toEqual([3]));
  });

  it("does not dispatch again for its own clicks", async () => {
    const { router } = open(jsonRoute);
    const v = await view();
    const spy = vi.spyOn(v, "dispatch");
    await gutterClick(v, 2);
    await waitFor(() => expect(router.state.location.search).toContain("=2"));
    // The store (the game's problems) updates the editor while we wait: that
    // is inside act, or React warns about an update outside of it
    await act(() => new Promise((resolve) => setTimeout(resolve, 100)));
    // The click made one change of the lines, the url did not make another
    const changes = spy.mock.calls.filter(([spec]) =>
      [spec?.effects].flat(2).some((effect) => Array.isArray(effect?.value)),
    );
    expect(changes).toHaveLength(1);
  });

  it("follows Back and Forward, which skip the replaced states", async () => {
    const { user, router } = open(`${route}?edit=true`);
    await user.click(await screen.findByRole("tab", { name: "JSON" }));
    const v = await view();
    await gutterClick(v, 3);
    await gutterClick(v, 5, { shiftKey: true });
    await waitFor(() => expect(router.state.location.search).toContain("=3-5"));

    await act(() => router.navigate(-1));
    expect(router.state.location.search).toBe("?edit=true");
    expect(router.state.location.pathname).toBe(route);
    await act(() => router.navigate(1));
    await waitFor(() => expect(router.state.location.search).toContain("=3-5"));
    // Forward builds the editor again: let it load before the test ends
    await view();
  });

  it("follows a new url while it is open", async () => {
    const { router } = open(`${jsonRoute}&lines=2`);
    const v = await view();
    await waitFor(() => expect(selected(v).text).toEqual([2]));
    await act(() =>
      router.navigate({ search: "?edit=true&editSection=json&lines=7-8" }),
    );
    await waitFor(() => expect(selected(v).text).toEqual([7, 8]));
  });

  it("keeps the lines and history when the JSON tab is clicked again", async () => {
    const { user, router } = open(`${jsonRoute}&lines=3`);
    const v = await view();
    await user.click(screen.getByRole("tab", { name: "JSON" }));
    expect(router.state.location.search).toBe(
      "?edit=true&editSection=json&lines=3",
    );
    expect(router.state.historyAction).toBe("POP");
    expect(selected(v).text).toEqual([3]);
  });

  it("keeps the highlight when the editor is rebuilt for another slug", async () => {
    const { router } = open(`${jsonRoute}&lines=3`);
    const first = await view();
    // The editor lives as long as the slug of the game: a new slug builds a
    // new one, which starts from the lines of the url
    await act(() =>
      router.navigate({
        pathname: `/games/${games["1889"].meta.slug}/map`,
        search: `?${jsonRoute.split("?")[1]}&lines=3`,
      }),
    );
    const again = await waitFor(async () => {
      const found = await view();
      if (found === first) throw new Error("not rebuilt yet");
      return found;
    });
    await waitFor(() => expect(selected(again).text).toEqual([3]));
    expect(router.state.location.search).toContain("lines=3");
  });

  it("is dropped when the tab, panel or config changes", async () => {
    const { user, router } = open(`${jsonRoute}&lines=3`);
    await view();
    await user.click(screen.getByRole("tab", { name: "Trains" }));
    expect(router.state.location.search).toBe("?edit=true&editSection=trains");

    await act(() =>
      router.navigate({ search: `${jsonRoute.split("?")[1]}&lines=3` }),
    );
    await view();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(router.state.location.search).toBe(""));

    await act(() =>
      router.navigate({ search: `${jsonRoute.split("?")[1]}&lines=3` }),
    );
    await view();
    await user.keyboard("c");
    expect(router.state.location.search).toBe("?config=true");

    await act(() =>
      router.navigate({ search: `${jsonRoute.split("?")[1]}&lines=3` }),
    );
    await view();
    await user.keyboard("j");
    await waitFor(() => expect(router.state.location.search).toBe(""));

    await act(() =>
      router.navigate({ search: `${jsonRoute.split("?")[1]}&lines=3` }),
    );
    await view();
    await user.keyboard("[[");
    expect(router.state.location.search).toBe("?edit=true&editSection=hex");
  });

  it("is ignored and dropped without the JSON tab of an open panel", async () => {
    const { router, unmount } = open(
      `${route}?edit=true&editSection=trains&lines=3`,
    );
    await screen.findByTestId("edit-panel");
    await waitFor(() =>
      expect(router.state.location.search).toBe(
        "?edit=true&editSection=trains",
      ),
    );
    expect(router.state.historyAction).toBe("REPLACE");
    unmount();

    const closed = open(`${route}?lines=3`);
    await screen.findAllByTestId("game-internal:abc-map");
    await waitFor(() => expect(closed.router.state.location.search).toBe(""));
  });
});

describe("deep links", () => {
  it("fall back to the first config section for an unknown one", async () => {
    const { router } = open(`${route}?config=true&section=nope`);
    expect(
      await screen.findByRole("combobox", { name: "Config Section" }),
    ).toHaveTextContent("Colors");
    expect(router.state.location.search).toBe("?config=true&section=nope");
  });

  it("do not break on a malformed config section", async () => {
    open(`${route}?config=true&section=%25`);
    expect(
      await screen.findByRole("combobox", { name: "Config Section" }),
    ).toHaveTextContent("Colors");
  });

  it("open the config section of the link", async () => {
    open(`${route}?config=true&section=tokens`);
    expect(
      await screen.findByRole("combobox", { name: "Config Section" }),
    ).toHaveTextContent("Tokens");
  });

  it("fall back to the first edit tab for an unknown one", async () => {
    open(`${route}?edit=true&editSection=nope`);
    expect(await screen.findByRole("tab", { name: "Game" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("open the edit tab of the link on every section with an edit toggle", async () => {
    for (const section of ["map", "tokens", "cards"]) {
      const { unmount } = open(
        `/games/internal:abc/${section}?edit=true&editSection=trains`,
      );
      expect(
        await screen.findByRole("tab", { name: "Trains" }),
      ).toHaveAttribute("aria-selected", "true");
      unmount();
    }
  });

  it("show the edit panel when the link has both panels", async () => {
    open(`${route}?config=true&edit=true`);
    await screen.findByTestId("edit-panel");
    expect(
      screen.queryByRole("button", { name: "Close Config" }),
    ).not.toBeInTheDocument();
  });

  it("push a history entry for a tab", async () => {
    const { user, router } = open(`${route}?edit=true`);
    await user.click(await screen.findByRole("tab", { name: "Trains" }));
    expect(router.state.historyAction).toBe("PUSH");
    expect(router.state.location.search).toBe("?edit=true&editSection=trains");
    await act(() => router.navigate(-1));
    expect(router.state.location.search).toBe("?edit=true");
  });

  it("push a history entry for a config section, and Back restores it", async () => {
    const { user, router } = open(`${route}?config=true`);
    await user.click(
      await screen.findByRole("combobox", { name: "Config Section" }),
    );
    await user.click(await screen.findByRole("option", { name: "Tokens" }));
    expect(router.state.location.search).toBe("?config=true&section=tokens");
    expect(router.state.historyAction).toBe("PUSH");
    await act(() => router.navigate(-1));
    expect(router.state.location.search).toBe("?config=true");
    expect(
      await screen.findByRole("combobox", { name: "Config Section" }),
    ).toHaveTextContent("Colors");
  });

  it("drop lines on a section without an edit toggle for the config panel", async () => {
    const { router } = open(
      "/games/internal:abc/tokens?config=true&section=tokens&lines=3",
    );
    expect(
      await screen.findByRole("combobox", { name: "Config Section" }),
    ).toHaveTextContent("Tokens");
    await waitFor(() =>
      expect(router.state.location.search).toBe("?config=true&section=tokens"),
    );
    expect(router.state.historyAction).toBe("REPLACE");
  });

  it("cycle from the first section with [ and ] when the config section is unknown", async () => {
    const { user, router } = open(`${route}?config=true&section=nope`);
    await screen.findByRole("combobox", { name: "Config Section" });
    await user.keyboard("]");
    expect(router.state.location.search).toBe(
      `?config=true&section=${encodeURIComponent(configSections[1].section)}`,
    );
    await act(() => router.navigate({ search: "?config=true&section=nope" }));
    await user.keyboard("[[");
    expect(router.state.location.search).toBe(
      `?config=true&section=${encodeURIComponent(configSections.at(-1).section)}`,
    );
  });

  it("keep the commas of lines in the params the app writes", async () => {
    const Probe = () => {
      const [, toggle] = useBooleanParam("print");
      const [, setString] = useStringParam("editSection", "info");
      return (
        <>
          <button onClick={toggle}>toggle</button>
          <button onClick={() => setString("trains")}>string</button>
        </>
      );
    };
    const user = userEvent.setup();
    const probe = createMemoryRouter([{ path: "*", element: <Probe /> }], {
      initialEntries: ["/?lines=1-4,15"],
    });
    render(<RouterProvider router={probe} />);
    await user.click(screen.getByRole("button", { name: "toggle" }));
    expect(probe.state.location.search).toBe("?lines=1-4,15&print=true");
    await user.click(screen.getByRole("button", { name: "string" }));
    expect(probe.state.location.search).toBe(
      "?lines=1-4,15&print=true&editSection=trains",
    );
  });

  it("push a history entry for a card filter", async () => {
    const { user, router } = open("/games/internal:abc/cards");
    await user.click(await screen.findByRole("button", { name: "Filter" }));
    await user.click(
      await screen.findByRole("menuitemcheckbox", { name: /Privates/ }),
    );
    expect(router.state.location.search).toBe("?hidePrivates=true");
    expect(router.state.historyAction).toBe("PUSH");
    await act(() => router.navigate(-1));
    expect(router.state.location.search).toBe("");
  });
});
