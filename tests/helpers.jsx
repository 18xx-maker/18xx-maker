import { configureStore } from "@reduxjs/toolkit";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

import { providerFuture, rootRoutes, routerFuture } from "@/routes";
import { initialState, rootReducer } from "@/state";

export const renderApp = (route = "/") => {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: initialState,
  });

  const router = createMemoryRouter(rootRoutes, {
    initialEntries: ["/", route],
    initialIndex: 1,
    future: routerFuture,
  });

  return {
    user: userEvent.setup(),
    ...render(
      <Provider store={store}>
        <RouterProvider router={router} future={providerFuture} />
      </Provider>,
    ),
  };
};
