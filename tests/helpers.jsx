import { configureStore } from "@reduxjs/toolkit";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { RouterProvider, createMemoryRouter } from "react-router-dom";

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
    future: {
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionStatusRevalidation: true,
      v7_skipActionErrorRevalidation: true,
    },
  });

  return {
    user: userEvent.setup(),
    ...render(
      <Provider store={store}>
        <RouterProvider
          router={router}
          future={{
            v7_startTransition: true,
          }}
        />
      </Provider>,
    ),
  };
};
