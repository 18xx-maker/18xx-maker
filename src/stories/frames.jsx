// Story decorators for the print elements that render HTML (cards, charters)
// or read config. Not a story file: the stories import the decorators from here.
//
// parameters.printConfig is a partial config (like the config drawer
// writes), applied on top of the defaults for that story only.
import { configureStore } from "@reduxjs/toolkit";
import { useMemo } from "react";
import { Provider } from "react-redux";

import { clone } from "ramda";

import RoundTracker from "@/components/RoundTracker";
import Svg from "@/components/svg/Svg";

import { games } from "@/data";
import { useConfig } from "@/hooks";
import { initialState, rootReducer } from "@/state";
import { getCharterData } from "@/util";
import { getCardData } from "@/util/cards";

// A store like the preview one, but with this story's config on top of the
// toolbar themes
const PrintStore = ({ globals, game, config, children }) => {
  const key = JSON.stringify(config || {});
  const store = useMemo(
    () =>
      configureStore({
        reducer: rootReducer,
        preloadedState: {
          ...initialState,
          config: {
            theme: globals.mapTheme,
            companiesTheme: globals.companyTheme,
            ...JSON.parse(key),
          },
          game: games[game || "1889"],
        },
      }),
    [globals.mapTheme, globals.companyTheme, game, key],
  );

  return <Provider store={store}>{children}</Provider>;
};

// Applies parameters.printConfig, for components that draw svg and read config
export const printConfig = (Story, { globals, parameters }) => (
  <PrintStore
    globals={globals}
    game={parameters.game}
    config={parameters.printConfig}
  >
    <Story />
  </PrintStore>
);

// Html lives in a foreignObject so the story shows in the svg frame like the
// others, sized to the physical size of the page it is on
const Page = ({ width, height, css, children }) => (
  <Svg
    width={`${width}in`}
    height={`${height}in`}
    viewBox={`0 0 ${width * 96} ${height * 96}`}
  >
    <foreignObject width="100%" height="100%">
      <style>{css}</style>
      {children}
    </foreignObject>
  </Svg>
);

const CardPage = ({ children }) => {
  const { config } = useConfig();

  let cardConfig = clone(config.cards);
  let paperConfig = clone(config.paper);

  // Like the single card page: no cutlines, bleed or border
  cardConfig.cutlines = 0;
  cardConfig.bleed = 0;
  cardConfig.border = 0;

  switch (config.cards.layout) {
    case "miniEuroDie":
      cardConfig.width = 265.748;
      cardConfig.height = 173.228;
      break;
    case "dtgDie":
      cardConfig.width = 250;
      cardConfig.height = 150;
      break;
    default:
      break;
  }

  const data = getCardData(cardConfig, paperConfig);

  let css = `
.cutlines {
    padding: ${data.css.cutlines};
    width: ${data.css.totalWidth};
    height: ${data.css.totalHeight};
}

.card,
.card__bleed {
    height: ${data.css.bleedHeight};
    width: ${data.css.bleedWidth};
}

.card__body {
    border: ${data.border}px solid black;
    margin: ${data.css.bleed};
    width: ${data.css.width};
    height: ${data.css.height};
}

.share__hr {
    bottom: calc(0.375in + ${data.css.bleed});
}

.share--left .share__hr {
    left: calc(0.2025in + ${data.css.bleed});
}

.share--gmt .share__hr {
    width: calc(0.67in + ${data.css.bleed});
}

.train__hr {
    height: calc(0.6875in + ${data.css.bleed});
}
`;

  if (config.privates.style === "big") {
    css += `
.private__description {
  padding: 0 35% 0 0.125in;
}

.private__players {
  bottom: 0.16in;
}

.private__hex,
.private__tile,
.private__icon,
.private__company {
  position: absolute;
  top: 0;
  right: 0;
  padding: 0.4in 0.125in 1em 0.5em;
  width: 25%;
  height: 45%;
  float: none;
}

.private__hex svg,
.private__tile svg,
.private__icon svg,
.private__company svg {
  width: 100%;
  height: 100%;
}
`;
  }

  return (
    <Page
      width={data.totalWidth / 100}
      height={data.totalHeight / 100}
      css={css}
    >
      {children}
    </Page>
  );
};

// One card at its printed size
export const card = (Story, { globals, parameters }) => (
  <PrintStore
    globals={globals}
    game={parameters.game}
    config={parameters.printConfig}
  >
    <CardPage>
      <Story />
    </CardPage>
  </PrintStore>
);

const CharterPage = ({ children }) => {
  const { config } = useConfig();
  const data = getCharterData(config.charters, config.paper);

  const css = `
.cutlines {
    padding: ${data.css.cutlines};
    width: ${data.css.totalWidth};
    height: ${data.css.totalHeight};
}

.cutlines--minor {
    height: ${data.css.totalMinorHeight};
}

.cutlines--half {
    width: ${data.css.totalHalfWidth};
}

.charter,
.charter__bleed {
    height: ${data.css.bleedHeight};
    width: ${data.css.bleedWidth};
}

.charter--minor,
.charter--minor .charter__bleed {
    height: ${data.css.bleedMinorHeight};
}

.charter--half,
.charter--half .charter__bleed {
    width: ${data.css.bleedHalfWidth};
}

.charter__body {
    border: ${data.border}px solid black;
    margin: ${data.css.bleed};
    width: ${data.css.width};
    height: ${data.css.height};
}

.charter--minor .charter__body {
    height: ${data.css.minorHeight};
}

.charter--half .charter__body {
    width: ${data.css.halfWidth};
}

.charter--color .charter__hr {
    height: calc(1.0625in + ${data.css.bleed});
}
.charter--color.charter--minor .charter__hr {
    height: calc(0.875in + ${data.css.bleed});
}

.charter--carth .charter__hr {
    top: calc(1.125in + ${data.css.bleed});
}

.charter--carth.charter--minor .charter__hr,
.charter--carth.charter--half .charter__hr {
    top: calc(0.875in + ${data.css.bleed});
}
`;

  const height = (data.totalHeight + 2 * data.cutlines) / 100;
  const width = (data.totalWidth + 2 * data.cutlines) / 100;
  return (
    <Page width={width} height={height} css={css}>
      {children}
    </Page>
  );
};

// One charter at its printed size
export const charter = (Story, { globals, parameters }) => (
  <PrintStore
    globals={globals}
    game={parameters.game}
    config={parameters.printConfig}
  >
    <CharterPage>
      <Story />
    </CharterPage>
  </PrintStore>
);

// Html building blocks (tables, lists) at a size from parameters.htmlSize
// ({ width, height } in inches), so they show in an svg frame like the rest
export const html = (Story, { globals, parameters }) => {
  const { width = 7, height = 3 } = parameters.htmlSize || {};
  return (
    <PrintStore
      globals={globals}
      game={parameters.game}
      config={parameters.printConfig}
    >
      <Page width={width} height={height} css="">
        <Story />
      </Page>
    </PrintStore>
  );
};

// The arrow marker the print pages get from Root
const arrow = (
  <marker
    id="arrow"
    viewBox="0 0 10 10"
    refX="8"
    refY="5"
    markerWidth="5"
    markerHeight="5"
    markerUnits="strokeWidth"
    orient="auto-start-reverse"
  >
    <path d="M 0 0 L 8 4 L 8 6 L 0 10 z" strokeLinejoin="round" />
  </marker>
);

// An svg of the given size in print units (1/100 inch) that shrinks to fit
// the canvas, for stories that compute their own size from the data
export const SizedSvg = ({ x = 0, y = 0, width, height, children }) => (
  <Svg
    width={width}
    height={height}
    viewBox={`${x} ${y} ${width} ${height}`}
    style={{ maxWidth: "100%", height: "auto" }}
    defs={arrow}
  >
    {children}
  </Svg>
);

// The phase chart as it sits on a charter, so it gets the charter table styles
export const phase = (Story, { globals, parameters }) => {
  const { width = 7, height = 3 } = parameters.htmlSize || {};
  return (
    <PrintStore
      globals={globals}
      game={parameters.game}
      config={parameters.printConfig}
    >
      <Page width={width} height={height} css="">
        <div className="charter">
          <div className="charter__phase">
            <Story />
          </div>
        </div>
      </Page>
    </PrintStore>
  );
};

// The offset tile sheet: the tile width is the story arg
export const tileSheet = (Story, { globals, parameters, args }) => (
  <PrintStore
    globals={globals}
    game={parameters.game}
    config={{ tiles: { layout: "offset", width: args.width } }}
  >
    <Story />
  </PrintStore>
);

// The round tracker with the arrow marker the print pages have
export const RoundTrackerStory = (args) => (
  <SizedSvg x={-150} y={-150} width={700} height={400}>
    <RoundTracker {...args} />
  </SizedSvg>
);
