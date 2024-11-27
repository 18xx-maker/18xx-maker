import "@/cards/card.css";

import { addIndex, chain, clone, map, prop, range, splitEvery } from "ramda";

import Svg from "@/Svg";
import Number from "@/cards/Number";
import Private from "@/cards/Private";
import Share from "@/cards/Share";
import Train from "@/cards/Train";
import { getCardData } from "@/cards/util";
import PageSetup from "@/components/PageSetup";
import Pins from "@/components/Pins";
import { useConfig, useGame } from "@/hooks";
import { fillArray } from "@/util";
import { maxPlayers } from "@/util.js";
import { compileCompanies, overrideCompanies } from "@/util/companies";

const Cards = ({ hidePrivates, hideShares, hideTrains, hideNumbers }) => {
  const { config } = useConfig();
  const game = useGame();

  const override = config.overrideCompanies;
  const selection = config.overrideSelection;

  let companies = !hideShares
    ? overrideCompanies(compileCompanies(game), override, selection) || []
    : [];
  let privates = !hidePrivates ? game.privates || [] : [];
  let trains = fillArray(
    (t) => t.print || t.quantity,
    !hideTrains ? game.trains || [] : [],
  );
  let numbers = hideNumbers ? [] : range(1, maxPlayers(game.players || []) + 1);

  let privateNodes = addIndex(map)(
    (p, i) => (
      <Private
        key={`private-${game.meta.id}-${i}`}
        players={game.players}
        {...p}
      />
    ),
    privates,
  );
  let shareNodes = addIndex(chain)((company, index) => {
    let shares = fillArray(prop("quantity"), company.shares || []);
    return addIndex(map)(
      (share, i) => (
        <Share
          key={`${index}-${company.abbrev}-${i}`}
          company={company}
          name={company.name}
          abbrev={company.abbrev}
          logo={company.logo}
          color={company.color}
          token={company.token || company.color}
          {...share}
          subtext={company.subtext || share.subtext}
          variant={company.variant || share.variant}
          fontFamily={company.fontFamily || game.info.companyFontFamily}
          fontWeight={company.fontWeight || game.info.companyFontWeight}
          fontStyle={company.fontStyle || game.info.companyFontStyle}
        />
      ),
      shares,
    );
  }, companies);
  let trainNodes = addIndex(map)(
    (train, index) => (
      <Train
        train={train}
        trains={game.trains}
        key={`train-${train.name}-${index}`}
      />
    ),
    trains,
  );
  let numberColors = game.number_cards || [game.info.background];
  let numberNodes = map(
    (color) =>
      map(
        (n) => <Number number={n} background={color} key={`number=${n}`} />,
        numbers,
      ),
    numberColors,
  );

  let cardNodes = [
    ...privateNodes,
    ...shareNodes,
    ...trainNodes,
    ...numberNodes,
  ];

  let cardConfig = clone(config.cards);
  let paperConfig = clone(config.paper);
  let dtgPadding = cardConfig.dtgPadding;

  switch (config.cards.layout) {
    case "miniEuroDie":
      paperConfig.width = 850;
      paperConfig.height = 1100;
      paperConfig.margins = 25;

      cardConfig.width = 265.748;
      cardConfig.height = 173.228;
      cardConfig.cutlines = 25;
      cardConfig.bleed = 12.5;
      cardConfig.border = 0;

      break;
    case "dtgDie":
      paperConfig.width = 850;
      paperConfig.height = 1100;
      paperConfig.margins = 25;

      cardConfig.width = 250 - 2 * dtgPadding;
      cardConfig.height = 150 - 2 * dtgPadding;
      cardConfig.cutlines = dtgPadding;
      cardConfig.bleed = 0;
      cardConfig.border = 0;

      break;
    default:
      // No overrides for "free" layout
      break;
  }

  let data = getCardData(cardConfig, paperConfig);

  let pins = null;

  if (config.cards.layout !== "free") {
    pins = (
      <Svg className="pins" viewBox="0 0 50 800">
        <Pins landscape={true} config={cardConfig.pins} />
      </Svg>
    );
  }

  let splitCardNodes = splitEvery(data.layout.perPage, cardNodes);

  let pageNodes = addIndex(map)(
    (cardNodes, i) => (
      <div
        className={`cards cards--${config.cards.layout}`}
        key={`cards-page-${i}`}
        style={{
          width: data.css.printableWidth,
          height: data.css.printableHeight,
        }}
      >
        {cardNodes}
        {pins}
      </div>
    ),
    splitCardNodes,
  );

  let css = `
.cutlines {
    padding: ${data.css.cutlines};
    width: ${data.css.totalWidth};
    height: ${data.css.totalHeight};
}

.cutlines:after,
.cutlines:before {
    width: ${data.css.cutlines};
    height: ${data.css.height};
    top: ${data.css.cutlinesAndBleed};
}

.cutlines > div:after,
.cutlines > div:before {
    width: ${data.css.width};
    height: ${data.css.cutlines};
    left: ${data.css.bleed};
}

.cutlines > div:after {
    bottom: -${data.css.cutlines};
}

.cutlines > div:before {
    top: -${data.css.cutlines};
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
    <div data-testid={`game-${game.meta.slug}-cards`}>
      <style>{css}</style>
      {pageNodes}
      <PageSetup landscape={data.layout.landscape} />
    </div>
  );
};

export default Cards;
