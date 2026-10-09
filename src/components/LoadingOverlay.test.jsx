import { configureStore } from "@reduxjs/toolkit";
import { act, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";

import LoadingOverlay from "@/components/LoadingOverlay";

import {
  createClearLoadingGame,
  createSetLoadingGame,
  initialState,
  rootReducer,
} from "@/state";

const setup = (props) => {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: initialState,
  });
  render(
    <Provider store={store}>
      <LoadingOverlay {...props} />
    </Provider>,
  );
  return store;
};

describe("LoadingOverlay", () => {
  it("shows nothing when no game is loading", () => {
    setup();
    expect(screen.queryByTestId("loading-game")).not.toBeInTheDocument();
  });

  it("announces the file being opened as a busy status", () => {
    const store = setup();

    act(() => {
      store.dispatch(createSetLoadingGame("my-game.json", 1));
    });

    const status = screen.getByRole("status");
    expect(status).toBe(screen.getByTestId("loading-game"));
    expect(status).toHaveAttribute("aria-busy", "true");
    expect(status).toHaveTextContent("Opening game…");
    expect(status).toHaveTextContent("File: my-game.json");

    act(() => {
      store.dispatch(createClearLoadingGame(1));
    });
    expect(screen.queryByTestId("loading-game")).not.toBeInTheDocument();
  });

  it("hides the file line without a name and does not block the page", () => {
    const store = setup();
    act(() => {
      store.dispatch(createSetLoadingGame("", 1));
    });

    expect(screen.getByTestId("loading-game")).not.toHaveTextContent("File:");
    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.getByTestId("loading-game").parentElement).toHaveClass(
      "pointer-events-none",
      "print:hidden",
    );
  });

  it("gives way to the drop overlay", () => {
    const store = setup({ hidden: true });
    act(() => {
      store.dispatch(createSetLoadingGame("a.json", 1));
    });

    expect(screen.queryByTestId("loading-game")).not.toBeInTheDocument();
  });

  it("shows after a delay and animates only on motion-safe screens", () => {
    const store = setup();
    act(() => {
      store.dispatch(createSetLoadingGame("a.json", 1));
    });

    expect(screen.getByTestId("loading-game")).toHaveClass(
      "[animation-delay:150ms]",
      "fill-mode-backwards",
      "motion-safe:animate-in",
    );
  });
});
