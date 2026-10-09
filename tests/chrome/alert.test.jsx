import { act, fireEvent, screen, within } from "@testing-library/react";

import {
  clearAlert,
  createAlert,
  createProgressAlert,
  selectAlerts,
} from "@/state";

import { renderApp } from "@tests/support/helpers.jsx";

const region = () => screen.getByRole("region", { name: "Notifications" });
const toasts = () => within(region()).queryAllByTestId("alert");
const toast = (text) =>
  within(region())
    .getAllByTestId("alert")
    .find((el) => el.textContent.includes(text));

// Date is faked too: the countdown keeps what is left across a pause
const fakeTimers = () =>
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });

const send = (store, ...actions) =>
  act(() => actions.forEach((action) => store.dispatch(action)));

// A removed toast stays for its exit animation
const settle = () => act(() => vi.advanceTimersByTime(200));

afterEach(() => {
  vi.useRealTimers();
});

describe("alert region", () => {
  it("is always there, labelled, polite and empty", () => {
    renderApp("/");
    expect(region()).toHaveAttribute("aria-live", "polite");
    expect(toasts()).toHaveLength(0);
  });

  it("renders nothing for print", () => {
    renderApp("/?print=true");
    expect(
      screen.queryByRole("region", { name: "Notifications" }),
    ).not.toBeInTheDocument();
  });

  it("announces errors and warnings assertively, the rest politely", () => {
    const { store } = renderApp("/");
    send(
      store,
      createAlert("Ok", "success text", "success"),
      createAlert("Fyi", "info text", "info"),
      createAlert("Hmm", "warning text", "warning"),
    );
    expect(toast("success text")).not.toHaveAttribute("aria-live");
    expect(toast("info text")).not.toHaveAttribute("aria-live");
    expect(toast("warning text")).toHaveAttribute("aria-live", "assertive");
  });

  it("adds no status or alert roles", () => {
    const { store } = renderApp("/");
    send(store, createAlert("Bad", "error text", "error"));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(toast("error text")).toHaveAttribute("aria-live", "assertive");
  });

  it("shows the type, title and message", () => {
    const { store } = renderApp("/");
    send(store, createAlert("Game Loaded", "It worked", "success"));
    expect(toast("It worked")).toHaveAttribute("data-type", "success");
    expect(screen.getByText("Game Loaded")).toBeInTheDocument();
  });
});

describe("timing", () => {
  it("dismisses success and info after five seconds, warnings after eight", () => {
    fakeTimers();
    const { store } = renderApp("/");
    send(
      store,
      createAlert("A", "success text", "success"),
      createAlert("B", "warning text", "warning"),
    );

    act(() => vi.advanceTimersByTime(4999));
    expect(selectAlerts(store.getState())).toHaveLength(2);
    act(() => vi.advanceTimersByTime(1));
    expect(selectAlerts(store.getState()).map((a) => a.type)).toEqual([
      "warning",
    ]);
    settle();
    expect(screen.queryByText("success text")).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(3000));
    expect(selectAlerts(store.getState())).toHaveLength(0);
  });

  it("keeps an error until it is dismissed", () => {
    fakeTimers();
    const { store } = renderApp("/");
    send(store, createAlert("Bad", "error text", "error"));

    act(() => vi.advanceTimersByTime(60000));

    expect(screen.getByText("error text")).toBeInTheDocument();
  });

  it("pauses while hovered and counts the rest after", () => {
    fakeTimers();
    const { store } = renderApp("/");
    send(store, createAlert("A", "info text", "info"));

    act(() => vi.advanceTimersByTime(3000));
    fireEvent.mouseEnter(toast("info text"));
    act(() => vi.advanceTimersByTime(60000));
    expect(selectAlerts(store.getState())).toHaveLength(1);

    fireEvent.mouseLeave(toast("info text"));
    act(() => vi.advanceTimersByTime(1999));
    expect(selectAlerts(store.getState())).toHaveLength(1);
    act(() => vi.advanceTimersByTime(1));
    expect(selectAlerts(store.getState())).toHaveLength(0);
  });

  it("pauses while it has focus", () => {
    fakeTimers();
    const { store } = renderApp("/");
    send(store, createAlert("A", "info text", "info"));
    const close = within(toast("info text")).getByRole("button", {
      name: "Close",
    });

    act(() => close.focus());
    act(() => vi.advanceTimersByTime(60000));
    expect(selectAlerts(store.getState())).toHaveLength(1);

    act(() => close.blur());
    act(() => vi.advanceTimersByTime(5000));
    expect(selectAlerts(store.getState())).toHaveLength(0);
  });
});

describe("dismissing", () => {
  it("closes with the close button", () => {
    fakeTimers();
    const { store } = renderApp("/");
    send(store, createAlert("Bad", "error text", "error"));

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(selectAlerts(store.getState())).toHaveLength(0);
    settle();
    expect(toasts()).toHaveLength(0);
  });

  it("does not close when the card is clicked", () => {
    const { store } = renderApp("/");
    send(store, createAlert("Bad", "error text", "error"));

    fireEvent.click(screen.getByText("error text"));

    expect(selectAlerts(store.getState())).toHaveLength(1);
  });

  it("closes the focused toast with Escape, not the others", () => {
    const { store } = renderApp("/");
    send(
      store,
      createAlert("A", "first text", "error"),
      createAlert("B", "second text", "error"),
    );

    fireEvent.keyDown(toast("first text"), { key: "Escape" });

    expect(selectAlerts(store.getState()).map((a) => a.title)).toEqual(["B"]);
  });
});

describe("leaving", () => {
  it("is gone shortly after dismissing while progress keeps updating", () => {
    fakeTimers();
    const { store } = renderApp("/");
    send(
      store,
      createAlert("Bad", "error text", "error"),
      createProgressAlert("Exporting", "0", 0),
    );
    fireEvent.click(
      within(toast("error text")).getByRole("button", { name: "Close" }),
    );

    for (let i = 1; i <= 4; i++) {
      act(() => vi.advanceTimersByTime(50));
      send(store, createProgressAlert("Exporting", String(i), i));
    }

    expect(screen.queryByText("error text")).not.toBeInTheDocument();
    expect(toasts()).toHaveLength(1);
  });

  it("holds the closed state at its end", () => {
    const { store } = renderApp("/");
    send(store, createAlert("Bad", "error text", "error"));
    const el = toast("error text");
    send(store, clearAlert("alert-1"));
    expect(el).toHaveAttribute("data-state", "closed");
    expect(el.className).toContain("data-[state=closed]:fill-mode-forwards");
  });

  it("does not announce progress updates", () => {
    const { store } = renderApp("/");
    send(store, createProgressAlert("Exporting", "1/2 - map", 50));
    expect(screen.getByText("1/2 - map")).toHaveAttribute("aria-live", "off");
    expect(screen.getByTestId("alert-progress")).toHaveAttribute(
      "aria-live",
      "off",
    );
    expect(screen.getByText("Exporting")).not.toHaveAttribute("aria-live");
  });
});

describe("stack", () => {
  it("shows the newest three", () => {
    fakeTimers();
    const { store } = renderApp("/");
    send(
      store,
      ...[1, 2, 3, 4].map((n) => createAlert(`T${n}`, `text ${n}`, "error")),
    );
    settle();

    expect(toasts().map((el) => el.textContent)).toEqual([
      expect.stringContaining("text 2"),
      expect.stringContaining("text 3"),
      expect.stringContaining("text 4"),
    ]);
  });

  it("updates progress in place and replaces it with the result", () => {
    fakeTimers();
    const { store } = renderApp("/");
    send(store, createProgressAlert("Game Exporting", "1/2 - map", 50));
    expect(screen.getByRole("progressbar")).toBeInTheDocument();

    send(store, createProgressAlert("Game Exporting", "2/2 - tiles", 100));
    expect(toasts()).toHaveLength(1);
    expect(screen.getByText("2/2 - tiles")).toBeInTheDocument();

    // Done does not turn into a success toast and stays until a result
    act(() => vi.advanceTimersByTime(60000));
    expect(screen.getByRole("progressbar")).toBeInTheDocument();

    send(store, createAlert("Game Exported", "Exported 2 files", "success"));
    settle();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(toasts()).toHaveLength(1);
    expect(toast("Exported 2 files")).toHaveAttribute("data-type", "success");
  });
});
