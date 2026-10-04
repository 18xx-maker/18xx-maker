import { Fragment, useLayoutEffect, useRef } from "react";

import { addIndex, chain, map } from "ramda";

import Color from "@/components/Color";
import Currency from "@/components/Currency";
import Phase from "@/components/Phase";
import Train from "@/components/cards/Train";
import CompanyToken from "@/components/tokens/CompanyToken";
import Token from "@/components/tokens/Token";

import ColorContext from "@/context/ColorContext";
import { useConfig } from "@/hooks";
import { multiDefaultTo, unitsToCss } from "@/util";
import { companyTrains } from "@/util/companyTrains";
import { getSingleCardData } from "@/util/sizes";

const MIN_CARD_SCALE = 0.2;

const Charter = ({
  name,
  subtext,
  minor,
  color,
  tokens,
  phases,
  turns,
  trains,
  company,
  backgroundColor,
  variant,
  fontFamily,
  fontSize,
  fontStyle,
  fontWeight,
  halfWidth,
}) => {
  const { config } = useConfig();
  const charterStyle = config.charters.style;
  const showPhaseChart = config.charters.showPhaseChart;
  const showTurnOrder = config.charters.showTurnOrder;
  const blackBand = config.charters.blackBand;
  fontFamily = multiDefaultTo("display", fontFamily);
  fontSize = multiDefaultTo(20, fontSize);
  fontWeight = multiDefaultTo("bold", fontWeight);
  fontStyle = multiDefaultTo("normal", fontStyle);
  let lineHeight = fontSize * 1.1;

  // Trains the company owns print as small cards under the trains label
  const ownTrains =
    !halfWidth && config.charters.trainCards === "charter"
      ? companyTrains(company, trains || [])
      : [];
  const cardData = ownTrains.length
    ? getSingleCardData(config.cards, config.paper)
    : null;

  // The cards share the trains box with the phase chart. Shrink them until
  // they fit above it, so they never print over the chart.
  const cardsRef = useRef(null);
  useLayoutEffect(() => {
    const cards = cardsRef.current;
    if (!cards) return;
    cards.style.removeProperty("--train-card-scale");
    let scale = parseFloat(
      getComputedStyle(cards).getPropertyValue("--train-card-scale"),
    );
    while (
      cards.scrollHeight > cards.clientHeight + 0.5 &&
      scale > MIN_CARD_SCALE
    ) {
      scale = Math.max(MIN_CARD_SCALE, scale - 0.025);
      cards.style.setProperty("--train-card-scale", scale);
    }
  });

  // Hide section labels for things we don't want on a company
  const showTrains = company.trains !== false;
  const showTreasury = company.treasury !== false;

  // A slot on the charter: a shape with its label under it (turned sideways on
  // half width charters). A loan prints no label when it has none.
  const spot = (key, shape, label, skipEmpty) => (
    <svg key={key}>
      <g transform={`translate(25 25)`}>
        {shape}
        {!(
          skipEmpty &&
          (label === null || label === undefined || label === "")
        ) && (
          <g transform={`${halfWidth ? "rotate(-90) " : ""}translate(0 39)`}>
            <Color context="companies">
              {(c, t) => (
                <text
                  fill={
                    charterStyle === "color" && !halfWidth
                      ? t(c(color))
                      : c("black")
                  }
                  fontSize="11"
                  fontWeight="normal"
                  textAnchor="middle"
                >
                  <Currency value={label} type="token" />
                </text>
              )}
            </Color>
          </g>
        )}
      </g>
    </svg>
  );

  let tokenSpots = [];
  if (tokens) {
    tokenSpots = addIndex(map)((label, index) => {
      // Color charters just use empty token circles, carth style uses full
      // company tokens.
      let companyToken =
        charterStyle === "color" ? (
          <Token outline="black" />
        ) : (
          <CompanyToken company={company} />
        );

      return spot(
        `token-${index}`,
        <ColorContext.Provider value="companies">
          {companyToken}
        </ColorContext.Provider>,
        label,
      );
    }, tokens);
  } else {
    tokens = [];
  }

  // Loans are empty squares, so they never look like a token. They print in the
  // body of the charter, in columns of up to 5.
  const loans = company.loans || [];
  const loanSpots = addIndex(map)(
    (label, index) =>
      spot(
        `loan-${index}`,
        <rect
          x="-25"
          y="-25"
          width="50"
          height="50"
          fill="none"
          stroke="black"
          strokeWidth="1"
        />,
        label,
        true,
      ),
    loans,
  );

  let turnNodes = chain((turn) => {
    let steps = addIndex(map)((step, i) => {
      return (
        <li key={i}>
          <span>{step}</span>
        </li>
      );
    }, turn.steps || []);

    let stepsList = turn.ordered ? <ol>{steps}</ol> : <ul>{steps}</ul>;

    let optionals = addIndex(map)((step, i) => {
      return (
        <li key={i}>
          <span>{step}</span>
        </li>
      );
    }, turn.optional || []);
    let optionalList = <ul>{optionals}</ul>;

    return (
      <Fragment key={`turn-${turn.name}`}>
        <dt>{turn.name}</dt>
        <dd>{stepsList}</dd>
        {turn.optional && <dd>{optionalList}</dd>}
      </Fragment>
    );
  }, turns || []);

  return (
    <Color context="companies">
      {(c, t, _, p) => (
        <div
          className={`cutlines${minor ? " cutlines--minor" : ""}${halfWidth ? " cutlines--half" : ""}`}
        >
          <div
            className={`charter ${minor ? "charter--minor " : ""}charter--${charterStyle}${halfWidth ? " charter--half" : ""}`}
          >
            <div
              className="charter__bleed"
              style={{
                backgroundColor: p(backgroundColor || "white"),
              }}
            >
              <div
                className="charter__hr"
                style={{
                  backgroundColor: c(
                    charterStyle === "color"
                      ? color
                      : color === "white"
                        ? "black"
                        : color,
                  ),
                  borderBottom:
                    charterStyle === "color" && (color === "white" || blackBand)
                      ? "2px solid black"
                      : null,
                }}
              />
              <div className="charter__body">
                <div
                  style={{
                    color: t(c(charterStyle === "color" ? color : "white")),
                    paddingRight: halfWidth
                      ? null
                      : unitsToCss(12.5 + 65 * tokens.length),
                  }}
                  className="charter__name"
                >
                  <div
                    style={{
                      fontFamily: `${fontFamily}`,
                      fontSize: `${fontSize}pt`,
                      lineHeight: `${lineHeight}pt`,
                      fontWeight: `${fontWeight}`,
                      fontStyle: `${fontStyle}`,
                    }}
                  >
                    {name}
                  </div>
                  {subtext && (
                    <div
                      style={{
                        fontFamily: `${fontFamily}`,
                        fontSize: `${fontSize / 2}pt`,
                        lineHeight: `${lineHeight}pt`,
                        fontWeight: `${fontWeight}`,
                        fontStyle: `${fontStyle}`,
                      }}
                    >
                      {subtext}
                    </div>
                  )}
                </div>
                {charterStyle === "color" && (
                  <div className="charter__logo">
                    <svg viewBox="-37.5 -37.5 75 75">
                      <ColorContext.Provider value="companies">
                        <CompanyToken
                          outline={color === "white" ? "black" : "white"}
                          company={company}
                          width={37.5}
                        />
                      </ColorContext.Provider>
                    </svg>
                  </div>
                )}
                {tokenSpots.length > 0 && (
                  <div className="charter__tokens">
                    {halfWidth && "Tokens"}
                    {tokenSpots}
                  </div>
                )}
                {loanSpots.length > 0 && (
                  <div className="charter__loans">{loanSpots}</div>
                )}
                {halfWidth && (
                  <div className="charter__assets">
                    Assets
                    {showTurnOrder && <dl>{minor || turnNodes}</dl>}
                  </div>
                )}
                {halfWidth || (
                  <div className="charter__trains">
                    {showTrains && "Trains"}
                    {cardData && (
                      <div
                        ref={cardsRef}
                        className={[
                          "charter__traincards",
                          config.charters.trainCardBorder &&
                            "charter__traincards--border",
                          config.charters.trainCardRound &&
                            "charter__traincards--round",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        data-testid="charter-train-cards"
                      >
                        <style>{`
.charter__traincard {
    width: calc(${cardData.css.width} * var(--train-card-scale));
    height: calc(${cardData.css.height} * var(--train-card-scale));
}

.charter__traincard > div {
    width: ${cardData.css.width};
    height: ${cardData.css.height};
}

.charter__traincard .card,
.charter__traincard .card__bleed {
    width: ${cardData.css.width};
    height: ${cardData.css.height};
}

.charter__traincard .card__body {
    margin: 0;
    border: 0;
    width: ${cardData.css.width};
    height: ${cardData.css.height};
}

.charter__traincard .train__hr {
    height: 0.6875in;
}
`}</style>
                        {addIndex(map)(
                          (train, i) => (
                            <div
                              className="charter__traincard"
                              key={`train-${company.abbrev}-${i}`}
                            >
                              <div>
                                <Train
                                  bare
                                  train={train}
                                  trains={[...(trains || []), ...ownTrains]}
                                />
                              </div>
                            </div>
                          ),
                          ownTrains,
                        )}
                      </div>
                    )}
                    {showPhaseChart && (
                      <div className="charter__phase">
                        <Phase
                          phases={phases}
                          trains={trains}
                          minor={!!minor}
                          company={company.abbrev}
                        />
                      </div>
                    )}
                  </div>
                )}
                {halfWidth || (
                  <div className="charter__treasury">
                    {showTreasury && "Treasury"}
                    {company.capital && (
                      <div className="charter__capital">
                        <Currency value={company.capital} type="treasury" />
                      </div>
                    )}
                    {showTurnOrder && <dl>{minor || turnNodes}</dl>}
                  </div>
                )}
                {variant && <div className="charter__variant">{variant}</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </Color>
  );
};

export default Charter;
