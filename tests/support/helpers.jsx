import { configureStore } from "@reduxjs/toolkit";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Fragment, StrictMode } from "react";
import { Provider } from "react-redux";

import games from "@/data/games";
import AppRoutes from "@/routes";
import { initialState, rootReducer } from "@/state";

import {
  RouterProvider,
  createMemoryRouter,
} from "@tests/support/memoryRouter.jsx";

// strict wraps the app in StrictMode, which runs effects twice on mount
export const renderApp = (route = "/", state = {}, { strict = false } = {}) => {
  const store = configureStore({
    reducer: rootReducer,
    // The dev checks warn when slow, which fails tests on busy machines
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false,
      }),
    preloadedState: { ...initialState, ...state },
  });

  const Wrapper = strict ? StrictMode : Fragment;

  const router = createMemoryRouter(["/", route], 1);

  return {
    router,
    store,
    user: userEvent.setup(),
    ...render(
      <Wrapper>
        <Provider store={store}>
          <RouterProvider router={router}>
            <AppRoutes />
          </RouterProvider>
        </Provider>
      </Wrapper>,
    ),
  };
};

// Every bundled game, derived from the data index so new games are covered
export const gameSlugs = Object.values(games).map((game) => game.meta.slug);
