import { configureStore } from "@reduxjs/toolkit";
import { render, within } from "@testing-library/react";
import { Provider } from "react-redux";
import { RouterProvider, createMemoryRouter } from "react-router";

import Svg from "@/components/svg/Svg";

import { games } from "@/data";
import { initialState, rootReducer } from "@/state";

// Renders print elements on a game route (so useGame returns `game`) with
// the real store and config hooks. `search` drives config through the url
// like the print pages do (e.g. "?config.tiles.id=left"). `path` and `url`
// give the element route params.
export const mountElement = async (
  element,
  {
    game = games["18Test"],
    config = {},
    search = "",
    path = "/games/*",
    url = "/games/test",
  } = {},
) => {
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false,
      }),
    preloadedState: { ...initialState, config, game },
  });
  const router = createMemoryRouter(
    [{ path, element: <div data-testid="root">{element}</div> }],
    { initialEntries: [`${url}${search}`] },
  );
  const result = render(
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>,
  );
  return {
    ...result,
    root: await within(result.container).findByTestId("root"),
  };
};

// Same as mountElement, but inside an <svg> for svg atoms. Resolves to the
// svg element.
export const drawSvg = async (element, options) => {
  const { root } = await mountElement(
    <Svg viewBox="-100 -100 200 200">{element}</Svg>,
    options,
  );
  return root.querySelector("svg");
};

// Helpers for reading rendered svg
export const all = (node, selector) => [...node.querySelectorAll(selector)];
export const one = (node, selector) => node.querySelector(selector);
export const attr = (node, selector, name) =>
  all(node, selector).map((el) => el.getAttribute(name));

// A copy of a bundled game with info overrides
export const withInfo = (info, game = games["18Test"]) => ({
  ...game,
  info: { ...game.info, ...info },
});
