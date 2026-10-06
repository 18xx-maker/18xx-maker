import { addIndex, chain, map, prop, range, splitEvery, unnest } from "ramda";

import Pins from "@/components/Pins";
import Number from "@/components/cards/Number";
import Private from "@/components/cards/Private";
import Share from "@/components/cards/Share";
import Train from "@/components/cards/Train";
import PageSetup from "@/components/page/PageSetup";
import Svg from "@/components/svg/Svg";

import { useConfig, useGame } from "@/hooks";
import { fillArray, maxPlayers, unitsToCss } from "@/util";
import { getCardData, resolveCardLayout } from "@/util/cards";
import {
  compileCompanies,
  overrideCompanies,
} from "@/util/companies/companies";
import { companyNames } from "@/util/companies/companyNames";
import { cardCompanyTrains } from "@/util/companies/companyTrains";

const Cards = ({ hidePrivates, hideShares, hideTrains, hideNumbers }) => {
  const { config } = useConfig();
  const game = useGame();

  const override = config.overrideCompanies;
  const selection = config.overrideSelection;

  const overridden = overrideCompanies(
    compileCompanies(game),
    override,
    selection,
  );
  let companies = !hideShares ? overridden || [] : [];
  let privates = !hidePrivates ? game.privates || [] : [];
  let trains = fillArray(
    (t) => t.print || t.quantity,
    !hideTrains ? game.trains || [] : [],
  );
  // Trains owned by companies that print on cards instead of the charter
  let ownTrains = !hideTrains
    ? cardCompanyTrains(overridden, config.charters, game.trains)
    : [];
  trains = [...trains, ...ownTrains];
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
    return addIndex(map)((share, i) => {
      const names = companyNames(company, config.companyNames, share.subtext);
      return (
        <Share
          key={`${index}-${company.abbrev}-${i}`}
          company={company}
          abbrev={company.abbrev}
          logo={company.logo}
          color={company.color}
          token={company.token || company.color}
          {...share}
          name={names.name}
          subtext={names.subtext}
          variant={company.variant || share.variant}
          fontFamily={company.fontFamily || game.info.companyFontFamily}
          fontWeight={company.fontWeight || game.info.companyFontWeight}
          fontStyle={company.fontStyle || game.info.companyFontStyle}
        />
      );
    }, shares);
  }, companies);
  let trainNodes = addIndex(map)(
    (train, index) => (
      <Train
        train={train}
        trains={[...(game.trains || []), ...ownTrains]}
        key={`train-${train.name}-${index}`}
      />
    ),
    trains,
  );
  let numberColors = game.number_cards || [game.info.background];
  let numberNodes = addIndex(map)(
    (color, ci) =>
      map(
        (n) => (
          <Number number={n} background={color} key={`number-${ci}-${n}`} />
        ),
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

  const cardConfig = config.cards;
  const layoutFor = (type) =>
    resolveCardLayout(config.cards, config.paper, type, config.printScale);

  // Each type of card can have its own size. Types with the same size stay
  // together on the same pages, otherwise each size is laid out on its own.
  const types = [
    ["private", privateNodes],
    ["share", shareNodes],
    ["train", trainNodes],
    ["number", hideNumbers || !numbers.length ? [] : unnest(numberNodes)],
  ].filter(([, nodes]) => nodes.length);

  // Types of the same size share pages, in the order each size first appears
  const groups = types.reduce((groups, [type, nodes]) => {
    const layout = layoutFor(type);
    const data = getCardData(layout.cards, layout.paper);
    const same = groups.find(
      (group) =>
        group.data.width === data.width && group.data.height === data.height,
    );
    if (same) {
      same.nodes = [...same.nodes, ...nodes];
    } else {
      groups.push({ type, layout, data, nodes });
    }
    return groups;
  }, []);

  const grouped = groups.length > 1;
  const noCards = layoutFor();
  let data = groups.length
    ? groups[0].data
    : getCardData(noCards.cards, noCards.paper);

  let pins = null;

  if (config.cards.layout !== "free" || config.cards.showPins) {
    pins = (
      <Svg className="pins" viewBox="0 0 50 800">
        <Pins landscape={true} config={cardConfig.pins} />
      </Svg>
    );
  }

  const pagesFor = (data, nodes, keyPrefix, className) =>
    addIndex(map)(
      (cardNodes, i) => (
        <div
          className={`cards cards--${config.cards.layout}${className}`}
          key={`${keyPrefix}${i}`}
          style={{
            width: data.css.printableWidth,
            height: data.css.printableHeight,
            ...(data.layout.perPage === 1
              ? {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "safe center",
                }
              : {}),
          }}
        >
          {cardNodes}
          {pins}
        </div>
      ),
      splitEvery(data.layout.perPage, nodes),
    );

  let pageNodes;
  if (grouped) {
    // The page setup is for the whole document, so every size follows the
    // orientation of the first one
    const orientation = data.layout.landscape ? "landscape" : "portrait";
    groups.forEach((group, i) => {
      if (i > 0) {
        group.data = getCardData(
          group.layout.cards,
          group.layout.paper,
          orientation,
        );
      }
    });
    pageNodes = addIndex(chain)(
      (group, i) =>
        pagesFor(
          group.data,
          group.nodes,
          `cards-group-${i}-page-`,
          ` cards-group-${i}`,
        ),
      groups,
    );
  } else {
    pageNodes = pagesFor(data, cardNodes, "cards-page-", "");
  }

  // The rules that depend on the size of the card. Each size group scopes them
  // to its own pages, a single size applies to every card.
  // With a single size the rules are not scoped, which keeps the css of cards
  // without sizes exactly as it always was.
  const cutlinesCss = (data, scope) => {
    const sel = (selectors) =>
      selectors.map((selector) => `${scope}${selector}`).join(",\n");
    return `${sel([".cutlines"])} {
    padding: ${data.css.cutlines};
    width: ${data.css.totalWidth};
    height: ${data.css.totalHeight};
}

${sel([".cutlines:after", ".cutlines:before"])} {
    width: ${data.css.cutlines};
    height: ${data.css.height};
    top: ${data.css.cutlinesAndBleed};
}

${sel([".cutlines > div:after", ".cutlines > div:before"])} {
    width: ${data.css.width};
    height: ${data.css.cutlines};
    left: ${data.css.bleed};
}

${sel([".cutlines > div:after"])} {
    bottom: -${data.css.cutlines};
}

${sel([".cutlines > div:before"])} {
    top: -${data.css.cutlines};
}

`;
  };

  const cardCss = (data, scope) => {
    const sel = (selectors) =>
      selectors.map((selector) => `${scope}${selector}`).join(",\n");
    return `${sel([".card", ".card__bleed"])} {
    height: ${data.css.bleedHeight};
    width: ${data.css.bleedWidth};
}

${sel([".card__body"])} {
    border: ${data.border}px solid black;
    margin: ${data.css.bleed};
    width: ${data.css.width};
    height: ${data.css.height};
}

`;
  };

  const paddingCss =
    cardConfig.padding === 12.5
      ? ""
      : `.card {
    --card-padding: ${unitsToCss(cardConfig.padding)};
}

`;

  const sizeCss = groups
    .map(
      (group, i) =>
        cutlinesCss(group.data, `.cards-group-${i} `) +
        cardCss(group.data, `.cards-group-${i} `),
    )
    .join("");

  let css = `
${grouped ? sizeCss : cutlinesCss(data, "")}${paddingCss}${grouped ? "" : cardCss(data, "")}${
    privates.some((p) => p.revenueBackgroundColor)
      ? `.private__revenue--background::before {
    right: -${data.css.bleed};
    bottom: -${data.css.bleed};
}

`
      : ""
  }.share__hr {
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
  padding: 0 35% 0 var(--card-padding);
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
  padding: 0.4in var(--card-padding) 1em 0.5em;
  width: calc(25% * var(--private-icon-scale, 1));
  height: calc(45% * var(--private-icon-scale, 1));
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
