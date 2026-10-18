import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider, useSelector } from "react-redux";

import { MemoryRouter } from "@tests/support/memoryRouter.jsx";

import "@/components/editPanel/sections";

import TrainsForm from "@/components/schemaForm/TrainsForm";

import { createSetGame, initialState, rootReducer } from "@/state";

const train = (name, extra = {}) => ({
  name,
  color: "gray",
  price: 100,
  quantity: 1,
  ...extra,
});

const game = {
  info: { title: "Rename" },
  meta: { id: "rename", type: "internal", slug: "internal:rename" },
  trains: [train("2"), train("3", { rust: ["2", "4"] })],
  phases: [{ name: "A", train: "2" }],
  companies: [{ name: "Co", abbrev: "C", trains: ["2", { name: "2" }] }],
};

const Form = () => {
  const current = useSelector((state) => state.game);
  return <TrainsForm game={current} />;
};

describe("renaming a train in the form", () => {
  it("updates what refers to it when the field is left", async () => {
    const user = userEvent.setup();
    const store = configureStore({
      reducer: rootReducer,
      preloadedState: initialState,
    });
    store.dispatch(createSetGame(game));
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Form />
        </MemoryRouter>
      </Provider>,
    );

    const input = screen.getAllByRole("textbox", { name: "Name" })[0];
    await user.clear(input);
    await user.type(input, "2+2");
    expect(store.getState().game.trains[1].rust).toEqual(["2", "4"]);

    await user.tab();
    const next = store.getState().game;
    expect(next.trains[0].name).toBe("2+2");
    expect(next.trains[1].rust).toEqual(["2+2", "4"]);
    expect(next.phases[0].train).toBe("2+2");
    expect(next.companies[0].trains).toEqual(["2+2", { name: "2+2" }]);
  });
});
