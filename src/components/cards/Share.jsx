import { min } from "ramda";

import Color from "@/components/Color";
import Currency from "@/components/Currency";
import CompanyToken from "@/components/tokens/CompanyToken";
import ColorContext from "@/context/ColorContext";
import { useConfig } from "@/hooks";
import { multiDefaultTo } from "@/util";

const LeftShare = ({
  cost,
  revenue,
  shares,
  percent,
  label,
  name,
  subtext,
  color,
  backgroundColor,
  labelColor,
  shareStyle,
  company,
  tokenCount,
  blackBand,
  variant,
  fontFamily,
  fontWeight,
  fontStyle,
}) => {
  let count = shares > 1 ? `${shares} Shares` : `${shares} Share`;
  fontFamily = multiDefaultTo("display", fontFamily);
  fontWeight = multiDefaultTo("bold", fontWeight);
  fontStyle = multiDefaultTo("normal", fontStyle);

  let tokens = [];
  let sharesLeft = tokenCount || shares || 1;
  while (sharesLeft > 0) {
    tokens.push(
      <div key={sharesLeft} className="share__token">
        <div
          style={{ height: `${min(1.0, sharesLeft) * 0.52}in` }}
          className="share__token__wrapper"
        >
          <svg
            style={{ width: "0.52in", height: "0.52in" }}
            viewBox="-26 -26 52 52"
          >
            <Color context="companies">
              {() => <CompanyToken company={company} />}
            </Color>
          </svg>
        </div>
      </div>,
    );

    sharesLeft -= 1;
  }

  let bandColor = color; // is(Object,token) ? token.colors[0] : token;

  let borderLeft = null;
  let borderRight = null;

  switch (shareStyle) {
    case "left":
      if (blackBand || bandColor === "white") {
        borderLeft = "1px solid black";
        borderRight = "1px solid black";
      }
      break;
    case "gmt":
      if (blackBand || bandColor === "white") {
        borderRight = "2px solid black";
      }
      break;
    default:
      break;
  }

  return (
    <div className="cutlines">
      <div className={`card share share--${shareStyle || "left"}`}>
        <Color context="map">
          {(c) => (
            <div
              className="card__bleed"
              style={{
                backgroundColor: c(backgroundColor || "white"),
              }}
            >
              <Color context="companies">
                {(c) => (
                  <div
                    className="share__hr"
                    style={{
                      backgroundColor: c(bandColor),
                      borderLeft,
                      borderRight,
                    }}
                  />
                )}
              </Color>
              <div className="card__body">
                {name && (
                  <div className="share__name">
                    {" "}
                    <div
                      style={{
                        fontFamily: `${fontFamily}`,
                        fontWeight: `${fontWeight}`,
                        fontStyle: `${fontStyle}`,
                      }}
                    >
                      {name}
                    </div>
                  </div>
                )}
                {subtext && (
                  <div className="share__subtext">
                    <div>{subtext}</div>
                  </div>
                )}
                {shares && <div className="share__shares">{count}</div>}
                {cost && (
                  <div className="share__shares">
                    <Currency value={cost} type="share" />
                  </div>
                )}
                {percent && <div className="share__percent">{percent}%</div>}
                {revenue && (
                  <div className="share__percent">
                    Revenue: <Currency value={revenue} type="share" />
                  </div>
                )}
                <div className="share__tokens">
                  <ColorContext.Provider value="companies">
                    {tokens}
                  </ColorContext.Provider>
                </div>
                {label && label.length > 0 && (
                  <div className="share__label">
                    <Color context="map">
                      {(c, t) => (
                        <div
                          className="share__label__text"
                          style={{
                            color: t(c(labelColor || "yellow")),
                            backgroundColor: c(labelColor || "yellow"),
                          }}
                        >
                          {label}
                        </div>
                      )}
                    </Color>
                  </div>
                )}
                {variant && <div className="share__variant">{variant}</div>}
              </div>
            </div>
          )}
        </Color>
      </div>
    </div>
  );
};

const CenterShare = ({
  color,
  cost,
  revenue,
  shares,
  percent,
  label,
  subtext,
  company,
  tokenCount,
  backgroundColor,
  labelColor,
  variant,
}) => {
  let count = shares > 1 ? `${shares} Shares` : `${shares} Share`;

  let tokens = [];
  let sharesLeft = tokenCount || shares;
  while (sharesLeft > 0) {
    tokens.push(
      <div key={sharesLeft} className="share__token">
        <div
          style={{ width: `${min(1.0, sharesLeft) * 100}%` }}
          className="share__token__wrapper"
        >
          <svg
            style={{ width: "0.52in", height: "0.52in" }}
            viewBox="-26 -26 52 52"
          >
            <CompanyToken company={company} />
          </svg>
        </div>
      </div>,
    );
    sharesLeft -= 1;
  }

  return (
    <div className="cutlines">
      <div className="card share share--center">
        <Color context="map">
          {(c) => (
            <div
              className="card__bleed"
              style={{
                backgroundColor: c(backgroundColor || "white"),
              }}
            >
              <Color context="companies">
                {(c) => (
                  <div
                    className="share__hr"
                    style={{ backgroundColor: c(color) }}
                  />
                )}
              </Color>
              <div className="card__body">
                {subtext && (
                  <div className="share__subtext">
                    <div>{subtext}</div>
                  </div>
                )}
                {shares && <div className="share__shares">{count}</div>}
                {cost && <div className="share__shares">{cost}</div>}
                {percent && <div className="share__percent">{percent}%</div>}
                {revenue && (
                  <div className="share__percent">Revenue: {revenue}</div>
                )}
                <div className="share__tokens">
                  <ColorContext.Provider value="companies">
                    {tokens}
                  </ColorContext.Provider>
                </div>
                {label && label.length > 0 && (
                  <div className="share__label">
                    <Color context="map">
                      {(c, t) => (
                        <div
                          className="share__label__text"
                          style={{
                            color: t(c(labelColor || "yellow")),
                            backgroundColor: c(labelColor || "yellow"),
                          }}
                        >
                          {label}
                        </div>
                      )}
                    </Color>
                  </div>
                )}
                {variant && <div className="share__variant">{variant}</div>}
              </div>
            </div>
          )}
        </Color>
      </div>
    </div>
  );
};

const Share = (props) => {
  const { config } = useConfig();

  if (config.cards.shareStyle === "left") {
    return (
      <LeftShare
        {...props}
        blackBand={config.cards.blackBand}
        shareStyle="left"
      />
    );
  } else if (config.cards.shareStyle === "gmt") {
    return (
      <LeftShare
        {...props}
        blackBand={config.cards.blackBand}
        shareStyle="gmt"
      />
    );
  } else {
    return <CenterShare {...props} />;
  }
};

export default Share;
