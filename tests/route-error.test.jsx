import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { RouterProvider, createMemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import RouteError from "@/components/RouteError";

import { initialState, rootReducer } from "@/state";

import { allowConsole } from "@tests/support/console.js";

const Broken = () => {
  throw new Error("cards do not fit");
};

const renderBroken = (config = {}) => {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: { ...initialState, config },
  });
  const router = createMemoryRouter([
    { path: "/", element: <Broken />, errorElement: <RouteError /> },
  ]);
  render(
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>,
  );
  return store;
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
});
