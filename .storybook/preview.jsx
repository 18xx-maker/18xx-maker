import { configureStore } from "@reduxjs/toolkit";
import { useMemo } from "react";
import { Provider } from "react-redux";

import { keys, map, sortBy } from "ramda";

import Svg from "@/components/svg/Svg";

import { companyThemes, games, mapThemes } from "@/data";
import { initialState, rootReducer } from "@/state";

import "@/styles/index.css";

import { MemoryRouter } from "../tests/support/memoryRouter.jsx";

const createItems = (themes) =>
  map(
    (theme) => ({
      value: theme,
      title: themes[theme].name,
    }),
    sortBy((key) => themes[key].name, keys(themes)),
  );

// The default frame for atoms, a hex sized view of the svg they draw into
const hexFrame = { width: 540, height: 540, viewBox: "-90 -90 180 180" };

// What a story needs around it: the redux store with the themes picked in the
// toolbar (and optionally a bundled game, for components that read the
// game), a router, and for atoms an svg to draw into. parameters:
//   svg: true for the default frame, or { width, height, viewBox }
//   game: the id of a bundled game to load into the store (the router starts
//         at /games/<id>, which is where the game hooks look for it)
//   route: where the router starts instead, for components that read the
//          page or the url (/games/18Test/map?edit=true)
const Frame = ({ Story, mapTheme, companyTheme, svg, game, route }) => {
  // The store only changes with the toolbar, never with the story args
  const store = useMemo(
    () =>
      configureStore({
        reducer: rootReducer,
        preloadedState: {
          ...initialState,
          config: { theme: mapTheme, companiesTheme: companyTheme },
          ...(game ? { game: games[game] } : {}),
        },
      }),
    [mapTheme, companyTheme, game],
  );

  let element = <Story />;
  if (svg) {
    const frame = svg === true ? hexFrame : { ...hexFrame, ...svg };
    element = (
      <Svg {...frame}>
        <Story />
      </Svg>
    );
  }

  return (
    <Provider store={store}>
      <MemoryRouter initialEntries={[route ?? (game ? `/games/${game}` : "/")]}>
        {element}
      </MemoryRouter>
    </Provider>
  );
};

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
    (Story, { globals, parameters }) => (
      <Frame
        Story={Story}
        mapTheme={globals.mapTheme}
        companyTheme={globals.companyTheme}
        svg={parameters.svg}
        game={parameters.game}
        route={parameters.route}
      />
    ),
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
