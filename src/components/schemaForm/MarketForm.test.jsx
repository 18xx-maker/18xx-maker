import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";

import "@/components/editPanel/sections";

import MarketForm from "@/components/schemaForm/MarketForm";

import { createSetGame, initialState, rootReducer } from "@/state";

const game = {
  meta: { id: "m", type: "system", slug: "system:m" },
  info: { title: "M" },
  stock: { type: "1D", market: [10, 20, 30] },
};

const newStore = () => {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: initialState,
  });
  store.dispatch(createSetGame(game));
  return store;
};

const mount = (store) => (
  <Provider store={store}>
    <MemoryRouter>
      <MarketForm game={game} />
    </MemoryRouter>
  </Provider>
);

describe("MarketForm panel state", () => {
  it("keeps a group open when the form is mounted again", async () => {
    const store = newStore();
    const user = userEvent.setup();
    const view = render(mount(store));

    const button = () => screen.getByRole("button", { name: /^Legend/ });
    expect(button()).toHaveAttribute("aria-expanded", "false");
    await user.click(button());
    expect(button()).toHaveAttribute("aria-expanded", "true");
    expect(store.getState().ui.panel["group:legend"]).toBe(true);

    view.unmount();
    render(mount(store));
    expect(button()).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: /^Movement/ })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("keeps more fields of the cell open when the form is mounted again", async () => {
    const store = newStore();
    const user = userEvent.setup();
    const view = render(mount(store));

    await user.click(screen.getAllByRole("gridcell")[0]);
    const more = () => screen.getByRole("button", { name: /more/i });
    await user.click(more());
    expect(store.getState().ui.panel["market:more"]).toBe(true);

    view.unmount();
    render(mount(store));
    await user.click(screen.getAllByRole("gridcell")[0]);
    expect(store.getState().ui.panel["market:more"]).toBe(true);
    expect(more()).toHaveAttribute("aria-expanded", "true");
  });
});
