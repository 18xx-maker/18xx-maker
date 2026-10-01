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
    // The dev checks warn when slow, which fails tests on busy machines
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false,
      }),
    preloadedState: initialState,
  });

  const router = createMemoryRouter(rootRoutes, {
    initialEntries: ["/", route],
    initialIndex: 1,
  });

  return {
    router,
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
