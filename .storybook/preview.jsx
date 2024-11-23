import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { RouterProvider, createMemoryRouter } from "react-router-dom";

import { keys, map, sortBy } from "ramda";

import Svg from "@/Svg";
import { companyThemes, mapThemes } from "@/data";
import { providerFuture, routerFuture } from "@/routes";
import { initialState, rootReducer } from "@/state";

import "@/index.css";
import "@/fonts.css";

const createItems = (themes) =>
  map(
    (theme) => ({
      value: theme,
      title: themes[theme].name,
    }),
    sortBy((key) => themes[key].name, keys(themes)),
  );

const preview = {
  globalTypes: {
    companyTheme: {
      description: "Company Theme",
      toolbar: {
        title: "Company Theme",
        icon: "certificate",
        items: createItems(companyThemes),
        dynamicTitle: true,
      },
    },
    mapTheme: {
      description: "Map Theme",
      toolbar: {
        icon: "photo",
        title: "Map Theme",
        items: createItems(mapThemes),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    companyTheme: "rob",
    mapTheme: "gmt",
  },
  decorators: [
    (Story, { globals, parameters }) => {
      const { svg = false } = parameters;

      let element = <Story />;
      if (svg) {
        element = (
          //<Svg width="175.205" height="152" viewBox="-87.6025 -76 175.205 152">
          <Svg width="540" height="540" viewBox="-90 -90 180 180">
            <Story />
          </Svg>
        );
      }

      const store = configureStore({
        reducer: rootReducer,
        preloadedState: {
          ...initialState,
          config: {
            theme: globals.mapTheme,
            companiesTheme: globals.companyTheme,
          },
        },
      });
      const routes = [{ path: "/", element }];
      const router = createMemoryRouter(routes, { future: routerFuture });

      return (
        <Provider store={store}>
          <RouterProvider router={router} future={providerFuture} />
        </Provider>
      );
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
