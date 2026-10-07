import { configureStore } from "@reduxjs/toolkit";
import { act, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";

import RouteErrorBoundary from "@/components/RouteErrorBoundary";

import { Route, Switch } from "@/router";
import { initialState, rootReducer } from "@/state";

import { allowConsole } from "@tests/support/console.js";
import {
  RouterProvider,
  createMemoryRouter,
} from "@tests/support/memoryRouter.jsx";

const Broken = () => {
  throw new Error("cards do not fit");
};

const renderBroken = (config = {}) => {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: { ...initialState, config },
  });
  const router = createMemoryRouter(["/broken"]);
  render(
    <Provider store={store}>
      <RouterProvider router={router}>
        <RouteErrorBoundary>
          <Switch>
            <Route path="/broken">
              <Broken />
            </Route>
            <Route path="/fine">fine page</Route>
          </Switch>
        </RouteErrorBoundary>
      </RouterProvider>
    </Provider>,
  );
  return { store, router };
};

describe("RouteError", () => {
  it("shows the error and the saved settings", async () => {
    allowConsole(/cards do not fit/);
    renderBroken({ cards: { width: 0 } });

    const page = await screen.findByTestId("route-error");
    expect(screen.getByText("cards do not fit")).toBeInTheDocument();
    expect(page).toHaveTextContent(/"width":\s*0/);
    expect(
      screen.getByRole("button", { name: "Reset settings to defaults" }),
    ).toBeInTheDocument();
  });

  it("clears the error when the location changes", async () => {
    allowConsole(/cards do not fit/);
    const { router } = renderBroken();

    expect(await screen.findByTestId("route-error")).toBeInTheDocument();
    await act(async () => router.navigate("/fine"));
    expect(screen.queryByTestId("route-error")).not.toBeInTheDocument();
    expect(screen.getByText("fine page")).toBeInTheDocument();
  });
});
