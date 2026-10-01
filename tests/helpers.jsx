import { configureStore } from "@reduxjs/toolkit";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { RouterProvider, createMemoryRouter } from "react-router";

import games from "@/data/games";
import { rootRoutes } from "@/routes";
import { initialState, rootReducer } from "@/state";

export const renderApp = (route = "/") => {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: initialState,
  });

  const router = createMemoryRouter(rootRoutes, {
    initialEntries: ["/", route],
    initialIndex: 1,
  });

  return {
    user: userEvent.setup(),
    ...render(
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>,
    ),
  };
};

// Every bundled game, derived from the data index so new games are covered
export const gameSlugs = Object.values(games).map((game) => game.meta.slug);

// Games whose map data defines the same hex coordinate twice, which makes
// React log a duplicate key warning. TODO: fix the game data.
export const duplicateHexGames = ["1871BC", "18NC", "18TraXX2020"];
