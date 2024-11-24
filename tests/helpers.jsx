import { configureStore } from "@reduxjs/toolkit";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { RouterProvider, createMemoryRouter } from "react-router";

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
